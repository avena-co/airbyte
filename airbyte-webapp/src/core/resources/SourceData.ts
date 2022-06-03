/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ReadShape, Resource, SchemaDetail } from "rest-hooks";

import BaseResource from "./BaseResource";
import { SyncSchema } from "core/domain/catalog";
import { JobInfo } from "core/domain/job/Job";

export interface SourceData {
  data: any[];
  id: string;
}

export default class SourceDataResource
  extends BaseResource
  implements SourceData {
  readonly catalog: SyncSchema = { streams: [] };
  readonly jobInfo?: JobInfo = undefined;
  readonly data: any[] = [];
  readonly id: string = "";
  pk(): string {
    return "";
  }

  static urlRoot = "sources";

  static schemaShape<T extends typeof Resource>(
    this: T
  ): ReadShape<SchemaDetail<SourceData>> {
    return {
      ...super.detailShape(),
      fetch: async (params: { sourceId: string }): Promise<SourceData> => {
        console.log("fetch schemaShape");
        const response = await this.fetch(
          "post",
          `${this.url(params)}/source_data`,
          params
        );

        // const result = toInnerModel(response);

        return {
          // catalog: response.catalog ,
          // jobInfo: response.jobInfo,
          data: response.data,
          id: params.sourceId,
        };
      },
      schema: this,
    };
  }
}
