import React from "react";
import styles from "./quick-fixes.module.css";
interface Option {
  id?: number;
  type?: string;
  label?: string;
  operation?: string;
  value?: string;
}

type IProps = {
  cardIDs: Array<String>;
  actions: Option[];
  selectedActions: Option[];
  onActionClicked: (data: Option) => void;
  onSelectedActionClicked: (data: Option) => void;
};

const QuickFixes: React.FC<IProps> = ({
  // cardIDs,
  actions,
  selectedActions,
  onActionClicked,
  onSelectedActionClicked,
}) => {
  const renderSelectedOptions = () => {
    return (
      <div>
        {selectedActions.map((el) => {
          return (
            <div
              onClick={() => onSelectedActionClicked(el)}
              key={el.id}
              className={styles.action}
            >
              {el.label}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.title}>Quick Fixes</div>
      <div className={styles.content}>
        <div className={styles.section}>
          <div className={styles.section_header}>Quick Fixes</div>
          <div>{renderSelectedOptions()}</div>
        </div>
        <div className={styles.section}>
          <div className={styles.section_header_2}>GENERAL</div>
          {actions.map((el) => {
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
          <select className={styles.action}>
            <option value="" selected={true} hidden={true}>
              If there is a QuickFix error...
            </option>
            <option value="ignoreError">Ignore error</option>
            <option value="skipRow">Skip row</option>
            <option value="fillCellWithCustomValue">
              Fill cell with custom value
            </option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default QuickFixes;
