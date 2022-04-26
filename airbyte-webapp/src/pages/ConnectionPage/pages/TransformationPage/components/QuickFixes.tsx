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
              <option value="ignoreError">Ignore error</option>
              <option value="skipRow">Skip row</option>
              <option value="fillCellWithCustomValue">
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
