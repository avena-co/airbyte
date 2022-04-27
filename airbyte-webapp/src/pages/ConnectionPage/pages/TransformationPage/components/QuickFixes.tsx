import React from "react";
import styles from "./quick-fixes.module.css";
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
  const handleSelectChange = (e: any) => {
    if (onActionClicked) {
      const data = actions.find((el) => el.type === "quickFixErrors");
      if (data) {
        data.operation = e.target.value;
        data.label = data.label.replace("...", ", ");
        onActionClicked(data);
      }
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
                      : "fill cell with custom value"}
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
              <option id="ignore error" value="ignoreError">
                Ignore error
              </option>
              <option id="skip row" value="skipRow">
                Skip row
              </option>
              <option
                id="fill cell with custom value"
                value="fillCellWithCustomValue"
              >
                Fill cell with custom value
              </option>
            </select>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuickFixes;
