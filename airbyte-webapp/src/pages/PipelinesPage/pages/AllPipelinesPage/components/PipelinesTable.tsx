import React, { useCallback } from "react";
import { useQueryClient } from "react-query";

import { PipelineTable } from "components/PipelineEntityTable";
import useSyncActions from "components/PipelineEntityTable/hooks";
import { ITableDataItem } from "components/PipelineEntityTable/types";
import { getPipelineTableData } from "components/PipelineEntityTable/utils";

import { invalidateConnectionsList } from "hooks/services/useConnectionHook";
import useRouter from "hooks/useRouter";

import { WebBackendPipelineRead } from "../../../../../core/request/AirbyteClient";

interface IProps {
  pipelines: WebBackendPipelineRead[];
}

const PipelinesTable: React.FC<IProps> = ({ pipelines }) => {
  const { push } = useRouter();
  const { changeStatus, syncManualConnection } = useSyncActions();
  const queryClient = useQueryClient();

  const data = getPipelineTableData(pipelines);

  const onChangeStatus = useCallback(
    async (pipelineId: string) => {
      const pipeline = pipelines.find((item) => item.pipelineId === pipelineId);

      if (pipeline) {
        await changeStatus(pipeline);
        await invalidateConnectionsList(queryClient);
      }
    },
    [changeStatus, pipelines, queryClient]
  );

  const onSync = useCallback(
    async (pipelineId: string) => {
      const pipeline = pipelines.find((item) => item.pipelineId === pipelineId);
      if (pipeline) {
        await syncManualConnection(pipeline);
      }
    },
    [pipelines, syncManualConnection]
  );

  const clickRow = (source: ITableDataItem) => push(`${source.pipelineId}`);

  return (
    <PipelineTable
      data={data}
      onClickRow={clickRow}
      entity="pipeline"
      onChangeStatus={onChangeStatus}
      onSync={onSync}
    />
  );
};

export default PipelinesTable;
