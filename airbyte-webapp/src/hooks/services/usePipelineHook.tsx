import { QueryClient, useMutation, useQueryClient } from "react-query";

import { SyncSchema } from "core/domain/catalog";
import { WebBackendPipelineService } from "core/domain/pipeline";
import { PipelineService } from "core/domain/pipeline/PipelineService";
import { useInitService } from "services/useInitService";

import { useConfig } from "../../config";
import {
  NamespaceDefinitionType,
  OperationCreate,
  ConnectionRead,
  WebBackendPipelineRead,
  WebBackendPipelineUpdate,
} from "../../core/request/AirbyteClient";
import { useSuspenseQuery } from "../../services/connector/useSuspenseQuery";
import { SCOPE_WORKSPACE } from "../../services/Scope";
import { useDefaultRequestMiddlewares } from "../../services/useDefaultRequestMiddlewares";
import { useCurrentWorkspace } from "./useWorkspace";

export const pipelineKeys = {
  all: [SCOPE_WORKSPACE, "pipelines"] as const,
  lists: () => [...pipelineKeys.all, "list"] as const,
  list: (filters: string) => [...pipelineKeys.lists(), { filters }] as const,
  detail: (pipelineId: string) => [...pipelineKeys.all, "details", pipelineId] as const,
};

export interface ValuesProps {
  name?: string;
  prefix: string;
  syncCatalog: SyncSchema;
  namespaceDefinition: NamespaceDefinitionType;
  namespaceFormat?: string;
  operations?: OperationCreate[];
}

interface CreatePipelineProps {
  values: ValuesProps;
  connection: ConnectionRead;
}

export interface ListPipeline {
  pipelines: WebBackendPipelineRead[];
}

function useWebPipelineService() {
  const config = useConfig();
  const middlewares = useDefaultRequestMiddlewares();
  return useInitService(
    () => new WebBackendPipelineService(config.apiUrl, middlewares),
    [config.apiUrl, middlewares]
  );
}

export function usePipelineService() {
  const config = useConfig();
  const middlewares = useDefaultRequestMiddlewares();
  return useInitService(() => new PipelineService(config.apiUrl, middlewares), [config.apiUrl, middlewares]);
}

export const usePipelineLoad = (
  pipelineId: string
): {
  pipeline: WebBackendPipelineRead;
  refreshPipelineCatalog: () => Promise<WebBackendPipelineRead>;
} => {
  const pipeline = useGetPipeline(pipelineId);
  const pipelineService = useWebPipelineService();

  const refreshPipelineCatalog = async () => await pipelineService.getPipeline(pipelineId, true);

  return {
    pipeline,
    refreshPipelineCatalog,
  };
};

export const useSyncPipeline = () => {
  const service = usePipelineService();
  return useMutation((pipeline: WebBackendPipelineRead) => {
    return service.sync(pipeline.pipelineId);
  });
};

export const useResetPipeline = () => {
  const service = usePipelineService();

  return useMutation((pipelineId: string) => service.reset(pipelineId));
};

const useGetPipeline = (pipelineId: string, options?: { refetchInterval: number }): WebBackendPipelineRead => {
  const service = useWebPipelineService();

  return useSuspenseQuery(pipelineKeys.detail(pipelineId), () => service.getPipeline(pipelineId), options);
};

const useCreatePipeline = () => {
  const service = useWebPipelineService();
  const queryClient = useQueryClient();

  return useMutation(
    async ({
      values,
      connection,
      sourceCatalogId,
    }: CreatePipelineProps) => {
      const response = await service.create({
        connectionId: connection.connectionId,
        ...values,
        status: "active",
        sourceCatalogId,
      });

      return response;
    },
    {
      onSuccess: (data) => {
        queryClient.setQueryData(pipelineKeys.lists(), (lst: ListPipeline | undefined) => ({
          pipelines: [data, ...(lst?.pipelines ?? [])],
        }));
      },
    }
  );
};

const useDeletePipeline = () => {
  const service = usePipelineService();
  const queryClient = useQueryClient();

  return useMutation((pipeline: WebBackendPipelineRead) => service.delete(pipeline.pipelineId), {
    onSuccess: (_data, pipeline) => {
      queryClient.removeQueries(pipelineKeys.detail(pipeline.pipelineId));
      queryClient.setQueryData(
        pipelineKeys.lists(),
        (lst: ListPipeline | undefined) =>
        ({
          pipelines: lst?.pipelines.filter((pl) => pl.pipelineId !== pipeline.pipelineId) ?? [],
        } as ListPipeline)
      );
    },
  });
};

const useUpdatePipeline = () => {
  const service = useWebPipelineService();
  const queryClient = useQueryClient();

  return useMutation((pipelineUpdate: WebBackendPipelineUpdate) => service.update(pipelineUpdate), {
    onSuccess: (pipeline) => {
      queryClient.setQueryData(pipelineKeys.detail(pipeline.pipelineId), pipeline);
    },
  });
};

const usePipelineList = (): ListPipeline => {
  const workspace = useCurrentWorkspace();
  const service = useWebPipelineService();

  return useSuspenseQuery(pipelineKeys.lists(), () => service.list(workspace.workspaceId));
};

const invalidatePipelinesList = async (queryClient: QueryClient) => {
  await queryClient.invalidateQueries(pipelineKeys.lists());
};

export {
  usePipelineList,
  useGetPipeline,
  useUpdatePipeline,
  useCreatePipeline,
  useDeletePipeline,
  invalidatePipelinesList,
};
