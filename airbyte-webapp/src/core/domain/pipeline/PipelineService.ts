import { deletePipeline, resetPipeline, syncPipeline } from "../../request/AirbyteClient";
import { AirbyteRequestService } from "../../request/AirbyteRequestService";

export class PipelineService extends AirbyteRequestService {
  public sync(pipelineId: string) {
    return syncPipeline({ pipelineId }, this.requestOptions);
  }

  public reset(pipelineId: string) {
    return resetPipeline({ pipelineId }, this.requestOptions);
  }

  public delete(pipelineId: string) {
    return deletePipeline({ pipelineId }, this.requestOptions);
  }
}
