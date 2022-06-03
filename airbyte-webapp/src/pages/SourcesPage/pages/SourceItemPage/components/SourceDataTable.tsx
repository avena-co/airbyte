/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import React, { useCallback } from "react";
// import { useResource } from "rest-hooks";

import { RoutePaths } from "pages/routes";
import useRouter from "hooks/useRouter";
import { Connection } from "core/resources/Connection";
import useSyncActions from "components/EntityTable/hooks";
// import { getConnectionTableData } from "components/EntityTable/utils";
import { ITableDataItem } from "components/EntityTable/types";
// import SourceDefinitionResource from "core/resources/SourceDefinition";
// import DestinationDefinitionResource from "core/resources/DestinationDefinition";
// import useWorkspace from "hooks/services/useWorkspace";
import DataTable from "components/EntityTable/DataTable";

type IProps = {
  connections: Connection[];
};

const SourceDataTable: React.FC<IProps> = ({ connections }) => {
  const { push } = useRouter();
  // const { workspace } = useWorkspace();
  const { changeStatus, syncManualConnection } = useSyncActions();

  // const { sourceDefinitions } = useResource(
  //   SourceDefinitionResource.listShape(),
  //   {
  //     workspaceId: workspace.workspaceId,
  //   }
  // );

  // const { destinationDefinitions } = useResource(
  //   DestinationDefinitionResource.listShape(),
  //   {
  //     workspaceId: workspace.workspaceId,
  //   }
  // );

  // const data = getConnectionTableData(
  //   connections,
  //   sourceDefinitions,
  //   destinationDefinitions,
  //   "source"
  // );
  const data = [
    {
      _id: "sdcsdc-sdcsdc",
      name: "metin",
      age: "22",
      city: "aydın",
      district: "nazilli",
    },
    {
      _id: "mccksd-sdcsdc",
      name: "ali",
      age: "23",
      city: "istanbul",
      district: "pendik",
    },
    {
      _id: "ofsdkd-sdcsdc",
      name: "deniz",
      age: "25",
      city: "izmir",
      district: "konak",
    },
    {
      _id: "sacked-sdcsdc",
      name: "hakan",
      age: "22",
      city: "istanbul",
      district: "kartal",
    },
  ];

  const onChangeStatus = useCallback(
    async (connectionId: string) => {
      const connection = connections.find(
        (item) => item.connectionId === connectionId
      );

      if (connection) {
        await changeStatus(connection);
      }
    },
    [changeStatus, connections]
  );

  const onSync = useCallback(
    async (connectionId: string) => {
      const connection = connections.find(
        (item) => item.connectionId === connectionId
      );
      if (connection) {
        await syncManualConnection(connection);
      }
    },
    [connections, syncManualConnection]
  );

  const clickRow = (source: ITableDataItem) =>
    push(`../../${RoutePaths.Connections}/${source.connectionId}`);

  return (
    <DataTable
      data={data}
      onClickRow={clickRow}
      entity="source"
      onChangeStatus={onChangeStatus}
      onSync={onSync}
    />
  );
};

export default SourceDataTable;
