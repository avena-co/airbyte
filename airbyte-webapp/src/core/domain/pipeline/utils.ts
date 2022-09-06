import { WebBackendPipelineRead, WebBackendPipelineUpdate } from "core/request/AirbyteClient";

export const toWebBackendPipelineUpdate = (pipeline: WebBackendPipelineRead): WebBackendPipelineUpdate => ({
  name: pipeline.name,
  pipelineId: pipeline.pipelineId,
  namespaceDefinition: connection.namespaceDefinition,
  namespaceFormat: connection.namespaceFormat,
  prefix: connection.prefix,
  operationIds: connection.operationIds,
  syncCatalog: connection.syncCatalog,
  schedule: connection.schedule,
  status: connection.status,
  resourceRequirements: connection.resourceRequirements,
  operations: connection.operations,
  sourceCatalogId: connection.catalogId,
});

export const buildPipelineUpdate = (
  connection: WebBackendPipelineRead,
  connectionUpdate: Partial<WebBackendPipelineUpdate>
): WebBackendPipelineUpdate => ({
  skipReset: true,
  ...toWebBackendPipelineUpdate(connection),
  ...connectionUpdate,
});
