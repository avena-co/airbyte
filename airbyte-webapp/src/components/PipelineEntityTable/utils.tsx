import {
  WebBackendPipelineRead,
} from "../../core/request/AirbyteClient";
import { ITableDataItem } from "./types";

export const getPipelineTableData = (
  pipelines: WebBackendPipelineRead[],
): ITableDataItem[] => {
  return pipelines.map((pipeline) => {
    return {
      pipelineId: pipeline.pipelineId,
      name: pipeline.name,
      entityName: pipeline.connection?.name,
    };
  });
};
