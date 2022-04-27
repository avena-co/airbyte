import React, { useState } from "react";
import styles from "./quick-fixes.module.css";
import { Input, Button } from "antd";
interface Option {
  id: number;
  type: string;
  label: string;
  operation: string;
  value?: string;
  selected?: boolean;
}

type IProps = {
  actions: Option[];
  onActionClicked: (data: Option) => void;
};

const QuickFixes: React.FC<IProps> = ({ actions, onActionClicked }) => {
  const [
    customValueInputVisible,
    setCustomValueInputVisible,
  ] = useState<boolean>(false);
  const [customValue, setCustomValue] = useState<string>("");

  const handleSelectChange = (e: any) => {
    const action = e.target.value;
    const data = actions.find((el) => el.type === "quickFixErrors");
    if (data && action !== "fillCellWithCustomValue") {
      data.operation = action;
      data.label = data.label.replace("...", ", ");

      if (onActionClicked) {
        onActionClicked(data);
      }
      setCustomValueInputVisible(false);
    }

    if (action === "fillCellWithCustomValue") {
      setCustomValueInputVisible(true);
    }
  };

  const handleAddCustomValueClick = () => {
    const data = actions.find((el) => el.type === "quickFixErrors");
    if (data) {
      data.operation = "fillCellWithCustomValue";
      data.label = data.label.replace("...", ", ");

      if (onActionClicked) {
        onActionClicked(data);
      }
      setCustomValueInputVisible(false);
    }
  };

  const renderActions = actions.filter(
    (el) => !el.selected && el.type !== "quickFixErrors"
  );

  const renderSelectedActions = actions.filter((el) => el.selected);
  const quickFixAction = actions.find((el) => el.type === "quickFixErrors");

  return (
    <div className={styles.container}>
      <div className={styles.title}>Quick Fixes</div>
      <div className={styles.content}>
        <div className={styles.section}>
          <div className={styles.section_header}>Quick Fixes</div>
          {renderSelectedActions.map((el) => {
            return (
              <div
                onClick={() => onActionClicked(el)}
                key={el.id}
                className={styles.action}
              >
                {el.label}
                {el.type === "quickFixErrors" && (
                  <span>
                    {el.operation === "skipRow"
                      ? "skip row"
                      : el.operation === "ignoreError"
                      ? "ignore error"
                      : `fill cell with: ${customValue}`}
                  </span>
                )}
              </div>
            );
          })}
        </div>
        <div className={styles.section}>
          <div className={styles.section_header_2}>GENERAL</div>
          {renderActions.map((el) => {
            return (
              <div
                onClick={() => onActionClicked(el)}
                key={el.id}
                className={styles.action}
              >
                {el.label}
              </div>
            );
          })}
        </div>
        <div className={styles.section}>
          <div className={styles.section_header_2}>QUICKFIX ERRORS</div>
          {!quickFixAction?.selected && (
            <select onChange={handleSelectChange} className={styles.action}>
              <option value="" selected={true} hidden={true}>
                If there is a QuickFix error...
              </option>
              <option value="ignoreError"> Ignore error </option>
              <option value="skipRow"> Skip row </option>
              <option value="fillCellWithCustomValue">
                Fill cell with custom value
              </option>
            </select>
          )}
          {customValueInputVisible && (
            <div>
              <Input
                style={{ marginBottom: "8px" }}
                placeholder="Provide value"
                type="text"
                onChange={(e) => setCustomValue(e.target.value)}
              />
              <div style={{ display: "flex" }}>
                <div style={{ display: "flex", flex: "1 1 0px" }} />
                <Button onClick={handleAddCustomValueClick} type="primary">
                  APPLY QUICKFIX
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuickFixes;
