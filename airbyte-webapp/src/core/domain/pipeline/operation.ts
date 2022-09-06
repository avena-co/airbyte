import { OperationCreate, OperationRead, OperatorType } from "../../request/AirbyteClient";

export enum NormalizationType {
  basic = "basic",
  raw = "raw",
  // ib = "ib",
}

export enum DeduplicationType {
  none = "none",
  ib = "ib",
}

export const isDbtTransformation = (op: OperationCreate): op is OperationRead => {
  return op.operatorConfiguration.operatorType === OperatorType.dbt;
};

export const isNormalizationTransformation = (op: OperationCreate): op is OperationRead => {
  return op.operatorConfiguration.operatorType === OperatorType.normalization;
};

// export const isDeduplicationTransformation = (op: OperationCreate): op is OperationRead => {
//   return op.operatorConfiguration.operatorType === OperatorType.deduplication;
// };
