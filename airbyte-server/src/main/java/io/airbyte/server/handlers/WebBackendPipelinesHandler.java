/*
 * Copyright (c) 2022 Airbyte, Inc., all rights reserved.
 */

package io.airbyte.server.handlers;

import com.google.common.annotations.VisibleForTesting;
import com.google.common.collect.Lists;
import com.google.common.collect.Sets;
import io.airbyte.api.model.generated.AirbyteCatalog;
import io.airbyte.api.model.generated.AirbyteStream;
import io.airbyte.api.model.generated.AirbyteStreamAndConfiguration;
import io.airbyte.api.model.generated.AirbyteStreamConfiguration;
import io.airbyte.api.model.generated.CatalogDiff;
import io.airbyte.api.model.generated.PipelineCreate;
import io.airbyte.api.model.generated.PipelineIdRequestBody;
import io.airbyte.api.model.generated.PipelineRead;
import io.airbyte.api.model.generated.PipelineSearch;
import io.airbyte.api.model.generated.PipelineUpdate;
import io.airbyte.api.model.generated.DestinationIdRequestBody;
import io.airbyte.api.model.generated.DestinationRead;
import io.airbyte.api.model.generated.JobConfigType;
import io.airbyte.api.model.generated.JobListRequestBody;
import io.airbyte.api.model.generated.JobRead;
import io.airbyte.api.model.generated.JobReadList;
import io.airbyte.api.model.generated.JobStatus;
import io.airbyte.api.model.generated.JobWithAttemptsRead;
import io.airbyte.api.model.generated.OperationCreate;
import io.airbyte.api.model.generated.OperationReadList;
import io.airbyte.api.model.generated.OperationUpdate;
import io.airbyte.api.model.generated.SourceDiscoverSchemaRead;
import io.airbyte.api.model.generated.SourceDiscoverSchemaRequestBody;
import io.airbyte.api.model.generated.SourceIdRequestBody;
import io.airbyte.api.model.generated.SourceRead;
import io.airbyte.api.model.generated.StreamDescriptor;
import io.airbyte.api.model.generated.StreamTransform;
import io.airbyte.api.model.generated.WebBackendPipelineCreate;
import io.airbyte.api.model.generated.WebBackendPipelineRead;
import io.airbyte.api.model.generated.WebBackendPipelineReadList;
import io.airbyte.api.model.generated.WebBackendPipelineRequestBody;
import io.airbyte.api.model.generated.WebBackendPipelineSearch;
import io.airbyte.api.model.generated.WebBackendPipelineUpdate;
import io.airbyte.api.model.generated.WebBackendOperationCreateOrUpdate;
import io.airbyte.api.model.generated.WebBackendWorkspaceState;
import io.airbyte.api.model.generated.WebBackendWorkspaceStateResult;
import io.airbyte.api.model.generated.WorkspaceIdRequestBody;
import io.airbyte.commons.json.Jsons;
import io.airbyte.commons.lang.MoreBooleans;
import io.airbyte.config.persistence.ConfigNotFoundException;
import io.airbyte.config.persistence.ConfigRepository;
import io.airbyte.protocol.models.ConfiguredAirbyteCatalog;
import io.airbyte.scheduler.client.EventRunner;
import io.airbyte.server.converters.ProtocolConverters;
import io.airbyte.server.handlers.helpers.CatalogConverter;
import io.airbyte.validation.json.JsonValidationException;
import io.airbyte.workers.temporal.TemporalClient.ManualOperationResult;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static java.util.stream.Collectors.toMap;

@AllArgsConstructor
@Slf4j
public class WebBackendPipelinesHandler {

    private static final Set<JobStatus> TERMINAL_STATUSES = Sets.newHashSet(JobStatus.FAILED, JobStatus.SUCCEEDED, JobStatus.CANCELLED);

    private final PipelinesHandler pipelinesHandler;
    private final ConnectionsHandler connectionsHandler;
    private final EventRunner eventRunner;
    // todo (cgardens) - this handler should NOT have access to the db. only access via handler.
    private final ConfigRepository configRepository;

    public WebBackendWorkspaceStateResult getWorkspaceState(final WebBackendWorkspaceState webBackendWorkspaceState) throws IOException {
        final var workspaceId = webBackendWorkspaceState.getWorkspaceId();
        final var pipelineCount = configRepository.countPipelinesForWorkspace(workspaceId);
        final var destinationCount = configRepository.countDestinationsForWorkspace(workspaceId);
        final var sourceCount = configRepository.countSourcesForWorkspace(workspaceId);

        return new WebBackendWorkspaceStateResult()
                .hasPipelines(pipelineCount > 0)
                .hasDestinations(destinationCount > 0)
                .hasSources(sourceCount > 0);
    }

    public WebBackendPipelineReadList webBackendListPipelinesForWorkspace(final WorkspaceIdRequestBody workspaceIdRequestBody)
            throws ConfigNotFoundException, IOException, JsonValidationException {

        final List<WebBackendPipelineRead> reads = Lists.newArrayList();
        for (final PipelineRead pipeline : pipelinesHandler.listPipelinesForWorkspace(workspaceIdRequestBody).getPipelines()) {
            reads.add(buildWebBackendPipelineRead(pipeline));
        }
        return new WebBackendPipelineReadList().pipelines(reads);
    }

    public WebBackendPipelineReadList webBackendListAllPipelinesForWorkspace(final WorkspaceIdRequestBody workspaceIdRequestBody)
            throws ConfigNotFoundException, IOException, JsonValidationException {

        final List<WebBackendPipelineRead> reads = Lists.newArrayList();
        for (final PipelineRead pipeline : pipelinesHandler.listAllPipelinesForWorkspace(workspaceIdRequestBody).getPipelines()) {
            reads.add(buildWebBackendPipelineRead(pipeline));
        }
        return new WebBackendPipelineReadList().pipelines(reads);
    }

    private WebBackendPipelineRead buildWebBackendPipelineRead(final PipelineRead pipelineRead)
            throws ConfigNotFoundException, IOException, JsonValidationException {
        final SourceRead source = getSourceRead(pipelineRead);
        final DestinationRead destination = getDestinationRead(pipelineRead);
        final OperationReadList operations = getOperationReadList(pipelineRead);
        final JobReadList syncJobReadList = getSyncJobs(pipelineRead);

        final WebBackendPipelineRead webBackendPipelineRead = getWebBackendPipelineRead(pipelineRead, source, destination, operations)
                .catalogId(pipelineRead.getSourceCatalogId())
                .isSyncing(syncJobReadList.getJobs()
                        .stream()
                        .map(JobWithAttemptsRead::getJob)
                        .anyMatch(WebBackendPipelinesHandler::isRunningJob));
        setLatestSyncJobProperties(webBackendPipelineRead, syncJobReadList);
        return webBackendPipelineRead;
    }

    private static boolean isRunningJob(final JobRead job) {
        return !TERMINAL_STATUSES.contains(job.getStatus());
    }

    private SourceRead getSourceRead(final PipelineRead pipelineRead) throws JsonValidationException, IOException, ConfigNotFoundException {
        final SourceIdRequestBody sourceIdRequestBody = new SourceIdRequestBody().sourceId(pipelineRead.getSourceId());
        return sourceHandler.getSource(sourceIdRequestBody);
    }

    private DestinationRead getDestinationRead(final PipelineRead pipelineRead)
            throws JsonValidationException, IOException, ConfigNotFoundException {
        final DestinationIdRequestBody destinationIdRequestBody = new DestinationIdRequestBody().destinationId(pipelineRead.getDestinationId());
        return destinationHandler.getDestination(destinationIdRequestBody);
    }

    private OperationReadList getOperationReadList(final PipelineRead pipelineRead)
            throws JsonValidationException, IOException, ConfigNotFoundException {
        final PipelineIdRequestBody pipelineIdRequestBody = new PipelineIdRequestBody().pipelineId(pipelineRead.getPipelineId());
        return operationsHandler.listOperationsForPipeline(pipelineIdRequestBody);
    }

    private static WebBackendPipelineRead getWebBackendPipelineRead(final PipelineRead pipelineRead,
                                                                    final SourceRead source,
                                                                    final DestinationRead destination,
                                                                    final OperationReadList operations) {
        return new WebBackendPipelineRead()
                .pipelineId(pipelineRead.getPipelineId())
                .sourceId(pipelineRead.getSourceId())
                .destinationId(pipelineRead.getDestinationId())
                .operationIds(pipelineRead.getOperationIds())
                .name(pipelineRead.getName())
                .namespaceDefinition(pipelineRead.getNamespaceDefinition())
                .namespaceFormat(pipelineRead.getNamespaceFormat())
                .prefix(pipelineRead.getPrefix())
                .syncCatalog(pipelineRead.getSyncCatalog())
                .status(pipelineRead.getStatus())
                .schedule(pipelineRead.getSchedule())
                .scheduleType(pipelineRead.getScheduleType())
                .scheduleData(pipelineRead.getScheduleData())
                .source(source)
                .destination(destination)
                .operations(operations.getOperations())
                .resourceRequirements(pipelineRead.getResourceRequirements());
    }

    private JobReadList getSyncJobs(final PipelineRead pipelineRead) throws IOException {
        final JobListRequestBody jobListRequestBody = new JobListRequestBody()
                .configId(pipelineRead.getPipelineId().toString())
                .configTypes(Collections.singletonList(JobConfigType.SYNC));
        return jobHistoryHandler.listJobsFor(jobListRequestBody);
    }

    private static void setLatestSyncJobProperties(final WebBackendPipelineRead WebBackendPipelineRead, final JobReadList syncJobReadList) {
        syncJobReadList.getJobs().stream().map(JobWithAttemptsRead::getJob).findFirst()
                .ifPresent(job -> {
                    WebBackendPipelineRead.setLatestSyncJobCreatedAt(job.getCreatedAt());
                    WebBackendPipelineRead.setLatestSyncJobStatus(job.getStatus());
                });
    }

    public WebBackendPipelineReadList webBackendSearchPipelines(final WebBackendPipelineSearch webBackendPipelineSearch)
            throws ConfigNotFoundException, IOException, JsonValidationException {

        final List<WebBackendPipelineRead> reads = Lists.newArrayList();
        for (final PipelineRead pipelineRead : pipelinesHandler.listPipelines().getPipelines()) {
            if (pipelinesHandler.matchSearch(toPipelineSearch(webBackendPipelineSearch), pipelineRead)) {
                reads.add(buildWebBackendPipelineRead(pipelineRead));
            }
        }

        return new WebBackendPipelineReadList().pipelines(reads);
    }

    // todo (cgardens) - This logic is a headache to follow it stems from the internal data model not
    // tracking selected streams in any reasonable way. We should update that.
    public WebBackendPipelineRead webBackendGetPipeline(final WebBackendPipelineRequestBody webBackendPipelineRequestBody)
            throws ConfigNotFoundException, IOException, JsonValidationException {
        final PipelineIdRequestBody pipelineIdRequestBody = new PipelineIdRequestBody()
                .pipelineId(webBackendPipelineRequestBody.getPipelineId());

        final PipelineRead pipeline = pipelinesHandler.getPipeline(pipelineIdRequestBody.getPipelineId());
        /*
         * This variable contains all configuration but will be missing streams that were not selected.
         */
        final AirbyteCatalog configuredCatalog = pipeline.getSyncCatalog();
        /*
         * This catalog represents the full catalog that was used to create the configured catalog. It will
         * have all streams that were present at the time. It will have no configuration set.
         */
        final Optional<AirbyteCatalog> catalogUsedToMakeConfiguredCatalog = pipelinesHandler
                .getPipelineAirbyteCatalog(webBackendPipelineRequestBody.getPipelineId());

        /*
         * This catalog represents the full catalog that exists now for the source. It will have no
         * configuration set.
         */
        final Optional<SourceDiscoverSchemaRead> refreshedCatalog;
        if (MoreBooleans.isTruthy(webBackendPipelineRequestBody.getWithRefreshedCatalog())) {
            refreshedCatalog = getRefreshedSchema(pipeline.getSourceId());
        } else {
            refreshedCatalog = Optional.empty();
        }

        final CatalogDiff diff;
        final AirbyteCatalog syncCatalog;
        if (refreshedCatalog.isPresent()) {
            pipeline.setSourceCatalogId(refreshedCatalog.get().getCatalogId());
            /*
             * constructs a full picture of all existing configured + all new / updated streams in the newest
             * catalog.
             */
            syncCatalog = updateSchemaWithDiscovery(configuredCatalog, refreshedCatalog.get().getCatalog());
            /*
             * Diffing the catalog used to make the configured catalog gives us the clearest diff between the
             * schema when the configured catalog was made and now. In the case where we do not have the
             * original catalog used to make the configured catalog, we make due, but using the configured
             * catalog itself. The drawback is that any stream that was not selected in the configured catalog
             * but was present at time of configuration will appear in the diff as an added stream which is
             * confusing. We need to figure out why source_catalog_id is not always populated in the db.
             */
            diff = pipelinesHandler.getDiff(catalogUsedToMakeConfiguredCatalog.orElse(configuredCatalog), refreshedCatalog.get().getCatalog());
        } else if (catalogUsedToMakeConfiguredCatalog.isPresent()) {
            // reconstructs a full picture of the full schema at the time the catalog was configured.
            syncCatalog = updateSchemaWithDiscovery(configuredCatalog, catalogUsedToMakeConfiguredCatalog.get());
            // diff not relevant if there was no refresh.
            diff = null;
        } else {
            // fallback. over time this should be rarely used because source_catalog_id should always be set.
            syncCatalog = configuredCatalog;
            // diff not relevant if there was no refresh.
            diff = null;
        }

        pipeline.setSyncCatalog(syncCatalog);
        return buildWebBackendPipelineRead(pipeline).catalogDiff(diff);
    }

    private Optional<SourceDiscoverSchemaRead> getRefreshedSchema(final UUID sourceId)
            throws JsonValidationException, ConfigNotFoundException, IOException {
        final SourceDiscoverSchemaRequestBody discoverSchemaReadReq = new SourceDiscoverSchemaRequestBody()
                .sourceId(sourceId)
                .disableCache(true);
        return Optional.ofNullable(schedulerHandler.discoverSchemaForSourceFromSourceId(discoverSchemaReadReq));
    }

    /**
     * Applies existing configurations to a newly discovered catalog. For example, if the users stream
     * is in the old and new catalog, any configuration that was previously set for users, we add to the
     * new catalog.
     *
     * @param original   fully configured, original catalog
     * @param discovered newly discovered catalog, no configurations set
     * @return merged catalog, most up-to-date schema with most up-to-date configurations from old
     * catalog
     */
    @VisibleForTesting
    protected static AirbyteCatalog updateSchemaWithDiscovery(final AirbyteCatalog original, final AirbyteCatalog discovered) {
        /*
         * We can't directly use s.getStream() as the key, because it contains a bunch of other fields, so
         * we just define a quick-and-dirty record class.
         */
        final Map<Stream, AirbyteStreamAndConfiguration> streamDescriptorToOriginalStream = original.getStreams()
                .stream()
                .collect(toMap(s -> new Stream(s.getStream().getName(), s.getStream().getNamespace()), s -> s));

        final List<AirbyteStreamAndConfiguration> streams = new ArrayList<>();

        for (final AirbyteStreamAndConfiguration discoveredStream : discovered.getStreams()) {
            final AirbyteStream stream = discoveredStream.getStream();
            final AirbyteStreamAndConfiguration originalStream = streamDescriptorToOriginalStream.get(new Stream(stream.getName(), stream.getNamespace()));
            final AirbyteStreamConfiguration outputStreamConfig;

            if (originalStream != null) {
                final AirbyteStreamConfiguration originalStreamConfig = originalStream.getConfig();
                final AirbyteStreamConfiguration discoveredStreamConfig = discoveredStream.getConfig();
                outputStreamConfig = new AirbyteStreamConfiguration();

                if (stream.getSupportedSyncModes().contains(originalStreamConfig.getSyncMode())) {
                    outputStreamConfig.setSyncMode(originalStreamConfig.getSyncMode());
                } else {
                    outputStreamConfig.setSyncMode(discoveredStreamConfig.getSyncMode());
                }

                if (originalStreamConfig.getCursorField().size() > 0) {
                    outputStreamConfig.setCursorField(originalStreamConfig.getCursorField());
                } else {
                    outputStreamConfig.setCursorField(discoveredStreamConfig.getCursorField());
                }

                outputStreamConfig.setDestinationSyncMode(originalStreamConfig.getDestinationSyncMode());
                if (originalStreamConfig.getPrimaryKey().size() > 0) {
                    outputStreamConfig.setPrimaryKey(originalStreamConfig.getPrimaryKey());
                } else {
                    outputStreamConfig.setPrimaryKey(discoveredStreamConfig.getPrimaryKey());
                }

                outputStreamConfig.setAliasName(originalStreamConfig.getAliasName());
                outputStreamConfig.setSelected(originalStream.getConfig().getSelected());
            } else {
                outputStreamConfig = discoveredStream.getConfig();
                outputStreamConfig.setSelected(false);
            }
            final AirbyteStreamAndConfiguration outputStream = new AirbyteStreamAndConfiguration()
                    .stream(Jsons.clone(stream))
                    .config(outputStreamConfig);
            streams.add(outputStream);
        }
        return new AirbyteCatalog().streams(streams);
    }

    public WebBackendPipelineRead webBackendCreatePipeline(final WebBackendPipelineCreate webBackendPipelineCreate)
            throws ConfigNotFoundException, IOException, JsonValidationException {
        final List<UUID> operationIds = createOperations(webBackendPipelineCreate);

        final PipelineCreate pipelineCreate = toPipelineCreate(webBackendPipelineCreate, operationIds);
        return buildWebBackendPipelineRead(pipelinesHandler.createPipeline(pipelineCreate));
    }

    public WebBackendPipelineRead webBackendUpdatePipeline(final WebBackendPipelineUpdate webBackendPipelineUpdate)
            throws ConfigNotFoundException, IOException, JsonValidationException {
        final List<UUID> operationIds = updateOperations(webBackendPipelineUpdate);
        final PipelineUpdate pipelineUpdate = toPipelineUpdate(webBackendPipelineUpdate, operationIds);

        PipelineRead pipelineRead;
        final boolean needReset = MoreBooleans.isTruthy(webBackendPipelineUpdate.getWithRefreshedCatalog());

        pipelineRead = pipelinesHandler.updatePipeline(pipelineUpdate);

        if (needReset) {
            ManualOperationResult manualOperationResult = eventRunner.synchronousResetPipeline(
                    webBackendPipelineUpdate.getPipelineId(),
                    // TODO (https://github.com/airbytehq/airbyte/issues/12741): change this to only get new/updated
                    // streams, instead of all
                    configRepository.getAllStreamsForPipeline(webBackendPipelineUpdate.getPipelineId()));
            verifyManualOperationResult(manualOperationResult);
            manualOperationResult = eventRunner.startNewManualSync(webBackendPipelineUpdate.getPipelineId());
            verifyManualOperationResult(manualOperationResult);
            pipelineRead = pipelinesHandler.getPipeline(pipelineUpdate.getPipelineId());
        }
        return buildWebBackendPipelineRead(pipelineRead);
    }

    public WebBackendPipelineRead webBackendUpdatePipelineNew(final WebBackendPipelineUpdate webBackendPipelineUpdate)
            throws ConfigNotFoundException, IOException, JsonValidationException {
        final List<UUID> operationIds = updateOperations(webBackendPipelineUpdate);
        final PipelineUpdate pipelineUpdate = toPipelineUpdate(webBackendPipelineUpdate, operationIds);
        final UUID pipelineId = webBackendPipelineUpdate.getPipelineId();
        final ConfiguredAirbyteCatalog existingConfiguredCatalog =
                configRepository.getConfiguredCatalogForPipeline(pipelineId);
        PipelineRead pipelineRead;
        pipelineRead = pipelinesHandler.updatePipeline(pipelineUpdate);

        final Boolean skipReset = webBackendPipelineUpdate.getSkipReset() != null ? webBackendPipelineUpdate.getSkipReset() : false;
        if (!skipReset) {
            final AirbyteCatalog apiExistingCatalog = CatalogConverter.toApi(existingConfiguredCatalog);
            final AirbyteCatalog newAirbyteCatalog = webBackendPipelineUpdate.getSyncCatalog();
            newAirbyteCatalog
                    .setStreams(newAirbyteCatalog.getStreams().stream().filter(streamAndConfig -> streamAndConfig.getConfig().getSelected()).toList());
            final CatalogDiff catalogDiff = pipelinesHandler.getDiff(apiExistingCatalog, newAirbyteCatalog);
            final List<StreamDescriptor> apiStreamsToReset = getStreamsToReset(catalogDiff);
            final Set<StreamDescriptor> changedConfigStreamDescriptors = pipelinesHandler.getConfigurationDiff(apiExistingCatalog, newAirbyteCatalog);
            final Set<StreamDescriptor> allStreamToReset = new HashSet<>();
            allStreamToReset.addAll(apiStreamsToReset);
            allStreamToReset.addAll(changedConfigStreamDescriptors);
            List<io.airbyte.protocol.models.StreamDescriptor> streamsToReset =
                    allStreamToReset.stream().map(ProtocolConverters::streamDescriptorToProtocol).toList();

            if (!streamsToReset.isEmpty()) {
                final PipelineIdRequestBody pipelineIdRequestBody = new PipelineIdRequestBody().pipelineId(pipelineId);

                ManualOperationResult manualOperationResult = eventRunner.synchronousResetPipeline(
                        webBackendPipelineUpdate.getPipelineId(),
                        streamsToReset);
                verifyManualOperationResult(manualOperationResult);
                manualOperationResult = eventRunner.startNewManualSync(webBackendPipelineUpdate.getPipelineId());
                verifyManualOperationResult(manualOperationResult);
                pipelineRead = pipelinesHandler.getPipeline(pipelineUpdate.getPipelineId());
            }
        }
        return buildWebBackendPipelineRead(pipelineRead);
    }

    private void verifyManualOperationResult(final ManualOperationResult manualOperationResult) throws IllegalStateException {
        if (manualOperationResult.getFailingReason().isPresent()) {
            throw new IllegalStateException(manualOperationResult.getFailingReason().get());
        }
    }

    private List<UUID> createOperations(final WebBackendPipelineCreate webBackendPipelineCreate)
            throws JsonValidationException, ConfigNotFoundException, IOException {
        final List<UUID> operationIds = new ArrayList<>();
        for (final var operationCreate : webBackendPipelineCreate.getOperations()) {
            operationIds.add(operationsHandler.createOperation(operationCreate).getOperationId());
        }
        return operationIds;
    }

    private List<UUID> updateOperations(final WebBackendPipelineUpdate webBackendPipelineUpdate)
            throws JsonValidationException, ConfigNotFoundException, IOException {
        final PipelineRead pipelineRead = pipelinesHandler
                .getPipeline(webBackendPipelineUpdate.getPipelineId());
        final List<UUID> originalOperationIds = new ArrayList<>(pipelineRead.getOperationIds());
        final List<UUID> operationIds = new ArrayList<>();

        for (final var operationCreateOrUpdate : webBackendPipelineUpdate.getOperations()) {
            if (operationCreateOrUpdate.getOperationId() == null || !originalOperationIds.contains(operationCreateOrUpdate.getOperationId())) {
                final OperationCreate operationCreate = toOperationCreate(operationCreateOrUpdate);
                operationIds.add(operationsHandler.createOperation(operationCreate).getOperationId());
            } else {
                final OperationUpdate operationUpdate = toOperationUpdate(operationCreateOrUpdate);
                operationIds.add(operationsHandler.updateOperation(operationUpdate).getOperationId());
            }
        }
        originalOperationIds.removeAll(operationIds);
        operationsHandler.deleteOperationsForPipeline(pipelineRead.getPipelineId(), originalOperationIds);
        return operationIds;
    }

    @VisibleForTesting
    protected static OperationCreate toOperationCreate(final WebBackendOperationCreateOrUpdate operationCreateOrUpdate) {
        final OperationCreate operationCreate = new OperationCreate();

        operationCreate.name(operationCreateOrUpdate.getName());
        operationCreate.workspaceId(operationCreateOrUpdate.getWorkspaceId());
        operationCreate.operatorConfiguration(operationCreateOrUpdate.getOperatorConfiguration());

        return operationCreate;
    }

    @VisibleForTesting
    protected static OperationUpdate toOperationUpdate(final WebBackendOperationCreateOrUpdate operationCreateOrUpdate) {
        final OperationUpdate operationUpdate = new OperationUpdate();

        operationUpdate.operationId(operationCreateOrUpdate.getOperationId());
        operationUpdate.name(operationCreateOrUpdate.getName());
        operationUpdate.operatorConfiguration(operationCreateOrUpdate.getOperatorConfiguration());

        return operationUpdate;
    }

    @VisibleForTesting
    protected static PipelineCreate toPipelineCreate(final WebBackendPipelineCreate webBackendPipelineCreate, final List<UUID> operationIds) {
        final PipelineCreate pipelineCreate = new PipelineCreate();

        pipelineCreate.name(webBackendPipelineCreate.getName());
        pipelineCreate.namespaceDefinition(webBackendPipelineCreate.getNamespaceDefinition());
        pipelineCreate.namespaceFormat(webBackendPipelineCreate.getNamespaceFormat());
        pipelineCreate.prefix(webBackendPipelineCreate.getPrefix());
        pipelineCreate.sourceId(webBackendPipelineCreate.getSourceId());
        pipelineCreate.destinationId(webBackendPipelineCreate.getDestinationId());
        pipelineCreate.operationIds(operationIds);
        pipelineCreate.syncCatalog(webBackendPipelineCreate.getSyncCatalog());
        pipelineCreate.schedule(webBackendPipelineCreate.getSchedule());
        pipelineCreate.scheduleType(webBackendPipelineCreate.getScheduleType());
        pipelineCreate.scheduleData(webBackendPipelineCreate.getScheduleData());
        pipelineCreate.status(webBackendPipelineCreate.getStatus());
        pipelineCreate.resourceRequirements(webBackendPipelineCreate.getResourceRequirements());
        pipelineCreate.sourceCatalogId(webBackendPipelineCreate.getSourceCatalogId());

        return pipelineCreate;
    }

    @VisibleForTesting
    protected static PipelineUpdate toPipelineUpdate(final WebBackendPipelineUpdate webBackendPipelineUpdate, final List<UUID> operationIds) {
        final PipelineUpdate pipelineUpdate = new PipelineUpdate();

        pipelineUpdate.pipelineId(webBackendPipelineUpdate.getPipelineId());
        pipelineUpdate.namespaceDefinition(webBackendPipelineUpdate.getNamespaceDefinition());
        pipelineUpdate.namespaceFormat(webBackendPipelineUpdate.getNamespaceFormat());
        pipelineUpdate.prefix(webBackendPipelineUpdate.getPrefix());
        pipelineUpdate.name(webBackendPipelineUpdate.getName());
        pipelineUpdate.operationIds(operationIds);
        pipelineUpdate.syncCatalog(webBackendPipelineUpdate.getSyncCatalog());
        pipelineUpdate.schedule(webBackendPipelineUpdate.getSchedule());
        pipelineUpdate.scheduleType(webBackendPipelineUpdate.getScheduleType());
        pipelineUpdate.scheduleData(webBackendPipelineUpdate.getScheduleData());
        pipelineUpdate.status(webBackendPipelineUpdate.getStatus());
        pipelineUpdate.resourceRequirements(webBackendPipelineUpdate.getResourceRequirements());
        pipelineUpdate.sourceCatalogId(webBackendPipelineUpdate.getSourceCatalogId());

        return pipelineUpdate;
    }

    @VisibleForTesting
    protected static PipelineSearch toPipelineSearch(final WebBackendPipelineSearch webBackendPipelineSearch) {
        return new PipelineSearch()
                .name(webBackendPipelineSearch.getName())
                .pipelineId(webBackendPipelineSearch.getPipelineId())
                .source(webBackendPipelineSearch.getSource())
                .sourceId(webBackendPipelineSearch.getSourceId())
                .destination(webBackendPipelineSearch.getDestination())
                .destinationId(webBackendPipelineSearch.getDestinationId())
                .namespaceDefinition(webBackendPipelineSearch.getNamespaceDefinition())
                .namespaceFormat(webBackendPipelineSearch.getNamespaceFormat())
                .prefix(webBackendPipelineSearch.getPrefix())
                .schedule(webBackendPipelineSearch.getSchedule())
                .scheduleType(webBackendPipelineSearch.getScheduleType())
                .scheduleData(webBackendPipelineSearch.getScheduleData())
                .status(webBackendPipelineSearch.getStatus());
    }

    @VisibleForTesting
    static List<StreamDescriptor> getStreamsToReset(final CatalogDiff catalogDiff) {
        return catalogDiff.getTransforms().stream().map(StreamTransform::getStreamDescriptor).toList();
    }

    /**
     * Equivalent to {@see io.airbyte.integrations.base.AirbyteStreamNameNamespacePair}. Intentionally
     * not using that class because it doesn't make sense for airbyte-server to depend on
     * base-java-integration.
     */
    private record Stream(String name, String namespace) {

    }

}
