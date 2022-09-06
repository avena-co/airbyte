interface EntityTableDataItem {
  entityId: string;
  entityName: string;
  connectorName: string;
  connectEntities: Array<{
    name: string;
    connector: string;
    status: string;
    lastSyncStatus: string | null;
  }>;
  enabled: boolean;
  lastSync?: number | null;
  connectorIcon?: string;
}

interface ITableDataItem {
  pipelineId: string;
  name: string;
  entityName: string;
}

enum Status {
  ACTIVE = "active",
  INACTIVE = "inactive",
  FAILED = "failed",
  EMPTY = "empty",
  PENDING = "pending",
}

enum SortOrderEnum {
  DESC = "desc",
  ASC = "asc",
}

export type { ITableDataItem, EntityTableDataItem };
export { Status, SortOrderEnum };
