import {
  WebBackendPipelineCreate,
  WebBackendPipelineUpdate,
  webBackendCreatePipeline,
  webBackendGetPipeline,
  webBackendListPipelinesForWorkspace,
  webBackendUpdatePipelineNew as webBackendUpdatePipeline,
} from "../../request/AirbyteClient";
import { AirbyteRequestService } from "../../request/AirbyteRequestService";

export class WebBackendPipelineService extends AirbyteRequestService {
  public getPipeline(pipelineId: string, withRefreshedCatalog?: boolean) {
    return webBackendGetPipeline({ pipelineId, withRefreshedCatalog }, this.requestOptions);
  }

  public list(workspaceId: string) {
    return webBackendListPipelinesForWorkspace({ workspaceId }, this.requestOptions);
  }

  public update(payload: WebBackendPipelineUpdate) {
    return webBackendUpdatePipeline(payload, this.requestOptions);
  }

  public create(payload: WebBackendPipelineCreate) {
    return webBackendCreatePipeline(payload, this.requestOptions);
  }
}
