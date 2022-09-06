/*
 * Copyright (c) 2022 Airbyte, Inc., all rights reserved.
 */

package io.airbyte.server.handlers;

import com.google.common.annotations.VisibleForTesting;
import com.google.common.collect.Lists;
import io.airbyte.api.model.generated.AirbyteCatalog;
import io.airbyte.api.model.generated.AirbyteStreamConfiguration;
import io.airbyte.api.model.generated.CatalogDiff;
import io.airbyte.api.model.generated.PipelineCreate;
import io.airbyte.api.model.generated.PipelineRead;
import io.airbyte.api.model.generated.PipelineReadList;
import io.airbyte.api.model.generated.PipelineSearch;
import io.airbyte.api.model.generated.PipelineUpdate;
import io.airbyte.api.model.generated.DestinationRead;
import io.airbyte.api.model.generated.SourceRead;
import io.airbyte.api.model.generated.StreamDescriptor;
import io.airbyte.api.model.generated.WorkspaceIdRequestBody;
import io.airbyte.commons.json.Jsons;
import io.airbyte.config.ActorCatalog;
import io.airbyte.config.StandardDestinationDefinition;
import io.airbyte.config.StandardSourceDefinition;
import io.airbyte.config.Pipeline;
import io.airbyte.config.StandardSync;
import io.airbyte.config.persistence.ConfigNotFoundException;
import io.airbyte.config.persistence.ConfigRepository;
import io.airbyte.protocol.models.CatalogHelpers;
import io.airbyte.scheduler.client.EventRunner;
import io.airbyte.scheduler.persistence.WorkspaceHelper;
import io.airbyte.server.converters.ApiPojoConverters;
import io.airbyte.server.converters.CatalogDiffConverters;
import io.airbyte.server.handlers.helpers.CatalogConverter;
import io.airbyte.validation.json.JsonValidationException;
import io.airbyte.workers.helper.PipelineHelper;

import java.io.IOException;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.function.Supplier;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class PipelinesHandler {

    private static final Logger LOGGER = LoggerFactory.getLogger(PipelinesHandler.class);

    private final ConfigRepository configRepository;
    private final Supplier<UUID> uuidGenerator;
    private final WorkspaceHelper workspaceHelper;
    private final ConnectionsHandler connectionsHandler;
    private final EventRunner eventRunner;

    @VisibleForTesting
    PipelinesHandler(final ConfigRepository configRepository,
                     final Supplier<UUID> uuidGenerator,
                     final WorkspaceHelper workspaceHelper,
                     final ConnectionsHandler connectionsHandler,
                     final EventRunner eventRunner) {
        this.configRepository = configRepository;
        this.uuidGenerator = uuidGenerator;
        this.workspaceHelper = workspaceHelper;
        this.connectionsHandler = connectionsHandler;
        this.eventRunner = eventRunner;
    }

    public PipelinesHandler(final ConfigRepository configRepository,
                            final WorkspaceHelper workspaceHelper,
                            final ConnectionsHandler connectionsHandler,
                            final EventRunner eventRunner) {
        this(configRepository,
                UUID::randomUUID,
                workspaceHelper,
                connectionsHandler,
                eventRunner);

    }

    public PipelineRead createPipeline(final PipelineCreate pipelineCreate)
            throws JsonValidationException, IOException, ConfigNotFoundException {

        final StandardSync standardSync = configRepository.getStandardSync(pipelineCreate.getConnectionId());

        // Set this as default name if pipelineCreate doesn't have it
        final String defaultName = standardSync.getName() + " IntelliBridge Pipeline";

        final UUID pipelineId = uuidGenerator.get();

        // persist pipeline
        final Pipeline pipeline = new Pipeline()
                .withPipelineId(pipelineId)
                .withName(pipelineCreate.getName() != null ? pipelineCreate.getName() : defaultName)
                .withConnectionId(pipelineCreate.getConnectionId());

        configRepository.writePipeline(pipeline);

        try {
            LOGGER.info("Starting a pipeline manager workflow");
            eventRunner.createPipelineManagerWorkflow(pipelineId);
        } catch (final Exception e) {
            LOGGER.error("Start of the pipeline manager workflow failed", e);
            configRepository.deletePipelineDefinition(pipeline.getPipelineId());
            throw e;
        }

        return buildPipelineRead(pipelineId);
    }

    public PipelineRead updatePipeline(final PipelineUpdate pipelineUpdate)
            throws ConfigNotFoundException, IOException, JsonValidationException {
        // retrieve and update pipeline
        final Pipeline persistedPipeline = configRepository.getPipeline(pipelineUpdate.getPipelineId());

        final Pipeline newPipeline = PipelineHelper.updatePipelineObject(
                persistedPipeline,
                ApiPojoConverters.pipelineUpdateToInternal(pipelineUpdate));

        configRepository.writePipeline(newPipeline);

        eventRunner.update(pipelineUpdate.getPipelineId());

        return buildPipelineRead(pipelineUpdate.getPipelineId());
    }

    public PipelineReadList listPipelinesForWorkspace(final WorkspaceIdRequestBody workspaceIdRequestBody)
            throws JsonValidationException, IOException, ConfigNotFoundException {
        return listPipelinesForWorkspace(workspaceIdRequestBody, false);
    }

    public PipelineReadList listAllPipelinesForWorkspace(final WorkspaceIdRequestBody workspaceIdRequestBody)
            throws JsonValidationException, IOException, ConfigNotFoundException {
        return listPipelinesForWorkspace(workspaceIdRequestBody, true);
    }

    public PipelineReadList listPipelinesForWorkspace(final WorkspaceIdRequestBody workspaceIdRequestBody, final boolean includeDeleted)
            throws JsonValidationException, IOException, ConfigNotFoundException {
        final List<PipelineRead> pipelineReads = Lists.newArrayList();

        for (final Pipeline pipeline : configRepository.listWorkspaceStandardPipelines(workspaceIdRequestBody.getWorkspaceId())) {
            pipelineReads.add(ApiPojoConverters.internalToPipelineRead(pipeline));
        }

        return new PipelineReadList().pipelines(pipelineReads);
    }

    public PipelineReadList listPipelines() throws JsonValidationException, ConfigNotFoundException, IOException {
        final List<PipelineRead> pipelineReads = Lists.newArrayList();

        for (final StandardSync standardSync : configRepository.listStandardSyncs()) {
            if (standardSync.getStatus() == StandardSync.Status.DEPRECATED) {
                continue;
            }
            pipelineReads.add(ApiPojoConverters.internalToPipelineRead(standardSync));
        }

        return new PipelineReadList().pipelines(pipelineReads);
    }

    public PipelineRead getPipeline(final UUID pipelineId)
            throws JsonValidationException, IOException, ConfigNotFoundException {
        return buildPipelineRead(pipelineId);
    }

    public CatalogDiff getDiff(final AirbyteCatalog oldCatalog, final AirbyteCatalog newCatalog) {
        return new CatalogDiff().transforms(CatalogHelpers.getCatalogDiff(
                        CatalogHelpers.configuredCatalogToCatalog(CatalogConverter.toProtocolKeepAllStreams(oldCatalog)),
                        CatalogHelpers.configuredCatalogToCatalog(CatalogConverter.toProtocolKeepAllStreams(newCatalog)))
                .stream()
                .map(CatalogDiffConverters::streamTransformToApi)
                .toList());
    }

    /**
     * Returns the list of the streamDescriptor that have their config updated.
     *
     * @param oldCatalog the old catalog
     * @param newCatalog the new catalog
     * @return the list of StreamDescriptor that have their configuration changed
     */
    public Set<StreamDescriptor> getConfigurationDiff(final AirbyteCatalog oldCatalog, final AirbyteCatalog newCatalog) {
        final Map<StreamDescriptor, AirbyteStreamConfiguration> oldStreams = catalogToPerStreamConfiguration(oldCatalog);
        final Map<StreamDescriptor, AirbyteStreamConfiguration> newStreams = catalogToPerStreamConfiguration(newCatalog);

        final Set<StreamDescriptor> streamWithDifferentConf = new HashSet<>();

        newStreams.forEach(((streamDescriptor, airbyteStreamConfiguration) -> {
            final AirbyteStreamConfiguration oldConfig = oldStreams.get(streamDescriptor);

            if (oldConfig == null) {
                // The stream is a new one, the config has not change and it needs to be in the schema change list.
            } else {
                if (haveConfigChange(oldConfig, airbyteStreamConfiguration)) {
                    streamWithDifferentConf.add(streamDescriptor);
                }
            }
        }));

        return streamWithDifferentConf;
    }

    private boolean haveConfigChange(final AirbyteStreamConfiguration oldConfig, final AirbyteStreamConfiguration newConfig) {
        final List<String> oldCursors = oldConfig.getCursorField();
        final List<String> newCursors = newConfig.getCursorField();
        final boolean hasCursorChanged = !(oldCursors.equals(newCursors));

        final boolean hasSyncModeChanged = !oldConfig.getSyncMode().equals(newConfig.getSyncMode());

        final boolean hasDestinationSyncModeChanged = !oldConfig.getDestinationSyncMode().equals(newConfig.getDestinationSyncMode());

        final Set<List<String>> convertedOldPrimaryKey = new HashSet<>(oldConfig.getPrimaryKey());
        final Set<List<String>> convertedNewPrimaryKey = new HashSet<>(newConfig.getPrimaryKey());
        final boolean hasPrimaryKeyChanged = !(convertedOldPrimaryKey.equals(convertedNewPrimaryKey));

        return hasCursorChanged || hasSyncModeChanged || hasDestinationSyncModeChanged || hasPrimaryKeyChanged;
    }

    private Map<StreamDescriptor, AirbyteStreamConfiguration> catalogToPerStreamConfiguration(final AirbyteCatalog catalog) {
        return catalog.getStreams().stream().collect(Collectors.toMap(stream -> new StreamDescriptor()
                        .name(stream.getStream().getName())
                        .namespace(stream.getStream().getNamespace()),
                stream -> stream.getConfig()));
    }

    public Optional<AirbyteCatalog> getPipelineAirbyteCatalog(final UUID pipelineId)
            throws JsonValidationException, ConfigNotFoundException, IOException {
        final StandardSync pipeline = configRepository.getStandardSync(pipelineId);
        if (pipeline.getSourceCatalogId() == null) {
            return Optional.empty();
        }
        final ActorCatalog catalog = configRepository.getActorCatalogById(pipeline.getSourceCatalogId());
        return Optional.of(CatalogConverter.toApi(Jsons.object(catalog.getCatalog(),
                io.airbyte.protocol.models.AirbyteCatalog.class)));
    }

    public PipelineReadList searchPipelines(final PipelineSearch pipelineSearch)
            throws JsonValidationException, IOException, ConfigNotFoundException {
        final List<PipelineRead> reads = Lists.newArrayList();
        for (final StandardSync standardSync : configRepository.listStandardSyncs()) {
            if (standardSync.getStatus() != StandardSync.Status.DEPRECATED) {
                final PipelineRead pipelineRead = ApiPojoConverters.internalToPipelineRead(standardSync);
                if (matchSearch(pipelineSearch, pipelineRead)) {
                    reads.add(pipelineRead);
                }
            }
        }

        return new PipelineReadList().pipelines(reads);
    }

    public boolean matchSearch(final PipelineSearch pipelineSearch, final PipelineRead pipelineRead)
            throws JsonValidationException, ConfigNotFoundException, IOException {

        final SourcePipeline sourcePipeline = configRepository.getSourcePipeline(pipelineRead.getSourceId());
        final StandardSourceDefinition sourceDefinition =
                configRepository.getStandardSourceDefinition(sourcePipeline.getSourceDefinitionId());
        final SourceRead sourceRead = SourceHandler.toSourceRead(sourcePipeline, sourceDefinition);

        final DestinationPipeline destinationPipeline = configRepository.getDestinationPipeline(pipelineRead.getDestinationId());
        final StandardDestinationDefinition destinationDefinition =
                configRepository.getStandardDestinationDefinition(destinationPipeline.getDestinationDefinitionId());
        final DestinationRead destinationRead = DestinationHandler.toDestinationRead(destinationPipeline, destinationDefinition);

        final PipelineMatcher pipelineMatcher = new PipelineMatcher(pipelineSearch);
        final PipelineRead pipelineReadFromSearch = pipelineMatcher.match(pipelineRead);

        return (pipelineReadFromSearch == null || pipelineReadFromSearch.equals(pipelineRead)) &&
                matchSearch(pipelineSearch.getSource(), sourceRead) &&
                matchSearch(pipelineSearch.getDestination(), destinationRead);
    }

    public void deletePipeline(final UUID pipelineId) {
        eventRunner.deletePipeline(pipelineId);
    }

    private PipelineRead buildPipelineRead(final UUID pipelineId)
            throws ConfigNotFoundException, IOException, JsonValidationException {
        final StandardSync standardSync = configRepository.getStandardSync(pipelineId);
        return ApiPojoConverters.internalToPipelineRead(standardSync);
    }
}
