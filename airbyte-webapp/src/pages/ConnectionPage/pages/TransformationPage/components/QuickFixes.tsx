import React, { useState } from "react";
import styles from "./quick-fixes.module.css";

interface Option {
  id: number;
  type: string;
  label: string;
  operation: string;
  value?: string;
}

const QuickFixes: React.FC = () => {
  const [selecteds] = useState<Option[] | undefined[]>([]);
  const [options] = useState<Option[]>([
    {
      id: 1,
      type: "general",
      label: "Convert to lower case",
      operation: "toLowerCase",
    },
    {
      id: 2,
      type: "general",
      label: "Skip if value = Empty or null",
      operation: "skipEmpty",
    },
    {
      id: 3,
      type: "fixError",
      label: "If there is a QuickFix error...",
      operation: "",
      value: "",
    },
  ]);

  const renderSelectedOptions = () => {
    return <div></div>;
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
          {options.map((el) => {
            return (
              <div
                onClick={() => console.log("selecteds", selecteds)}
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
