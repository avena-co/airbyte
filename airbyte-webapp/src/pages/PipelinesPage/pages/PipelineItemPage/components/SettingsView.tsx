import React from "react";

import DeleteBlock from "components/DeleteBlock";

import { useDeleteConnection } from "hooks/services/useConnectionHook";

import { WebBackendPipelineRead } from "../../../../../core/request/AirbyteClient";
import styles from "./SettingsView.module.scss";

interface SettingsViewProps {
  pipeline: WebBackendPipelineRead;
}

const SettingsView: React.FC<SettingsViewProps> = ({ connection }) => {
  const { mutateAsync: deleteConnection } = useDeleteConnection();

  const onDelete = () => deleteConnection(connection);

  return (
    <div className={styles.container}>
      <DeleteBlock type="connection" onDelete={onDelete} />
    </div>
  );
};

export default SettingsView;
