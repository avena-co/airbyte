import { buildPipelineUpdate } from "core/domain/pipeline";
import { useSyncConnection, useUpdateConnection } from "hooks/services/useConnectionHook";

import { ConnectionStatus, WebBackendPipelineRead } from "../../core/request/AirbyteClient";

const useSyncActions = (): {
  changeStatus: (pipeline: WebBackendPipelineRead) => Promise<void>;
  syncManualConnection: (pipeline: WebBackendPipelineRead) => Promise<void>;
} => {
  const { mutateAsync: updateConnection } = useUpdateConnection();
  const { mutateAsync: syncConnection } = useSyncConnection();

  const changeStatus = async (pipeline: WebBackendPipelineRead) => {
    await updateConnection(
      buildPipelineUpdate(pipeline, {
        status: pipeline.status === ConnectionStatus.active ? ConnectionStatus.inactive : ConnectionStatus.active,
      })
    );
  };

  const syncManualConnection = async (pipeline: WebBackendPipelineRead) => {
    await syncConnection(pipeline);
  };

  return { changeStatus, syncManualConnection };
};
export default useSyncActions;
