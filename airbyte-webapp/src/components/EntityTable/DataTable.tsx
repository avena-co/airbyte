/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";
import styled from "styled-components";
import { CellProps } from "react-table";

import Table from "components/Table";

// import LastSyncCell from "./components/LastSyncCell";
// import ConnectorCell from "./components/ConnectorCell";
import NameCell from "./components/NameCell";
// import FrequencyCell from "./components/FrequencyCell";
import { ITableDataItem } from "./types";
const Content = styled.div`
  margin: 0 32px 0 27px;
`;

type IProps = {
  data: Array<any>;
  entity: "source" | "destination" | "connection";
  onClickRow?: (data: ITableDataItem) => void;
  onChangeStatus: (id: string) => void;
  onSync: (id: string) => void;
};

const DataTable: React.FC<IProps> = ({
  data,
  entity,
  onClickRow,
  onChangeStatus,
  onSync,
}) => {
  const columns = React.useMemo(
    () => [
      {
        Header: <>_ID</>,
        accessor: "_id",
        Cell: ({ cell, row }: CellProps<ITableDataItem>) => (
          <NameCell
            value={cell.value}
            enabled={row.original.enabled}
            status={row.original.lastSyncStatus}
            icon={entity === "connection"}
            img={row.original.entityIcon}
          />
        ),
      },
      {
        Header: "NAME",
        accessor: "name",
        Cell: ({ cell }: CellProps<ITableDataItem>) => <div>{cell.value} </div>,
      },
      {
        Header: "AGE",
        accessor: "age",
        Cell: ({ cell }: CellProps<ITableDataItem>) => <div>{cell.value} </div>,
      },
      {
        Header: "CITY",
        accessor: "city",
        Cell: ({ cell }: CellProps<ITableDataItem>) => <div>{cell.value} </div>,
      },
      {
        Header: "DISTRICT",
        accessor: "district",
        Cell: ({ cell }: CellProps<ITableDataItem>) => <div>{cell.value} </div>,
      },
    ],
    [entity, onChangeStatus, onSync]
  );

  return (
    <Content>
      <Table
        columns={columns}
        data={data}
        onClickRow={onClickRow}
        erroredRows
      />
    </Content>
  );
};

export default DataTable;
