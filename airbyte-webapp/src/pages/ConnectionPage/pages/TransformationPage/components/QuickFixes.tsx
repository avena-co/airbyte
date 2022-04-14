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
  const [selecteds, setSelecteds] = useState<Option[]>([]);
  const [options, setOptions] = useState<Option[]>([
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
  ]);

  const handleOptionClicked = (data: Option): void => {
    const index = selecteds.findIndex((el) => el.id === data.id);

    if (index < 0) {
      setSelecteds((prevState) => [...prevState, data]);
      setOptions((prevState) => prevState.filter((el) => el.id !== data.id));
    }
  };

  const handleSelectedClicked = (data: Option): void => {
    const index = options.findIndex((el) => el.id === data.id);

    if (index < 0) {
      setOptions((prevState) => [...prevState, data]);
      setSelecteds((prevState) => prevState.filter((el) => el.id !== data.id));
    }
  };

  const renderSelectedOptions = () => {
    return (
      <div>
        {selecteds.map((el) => {
          return (
            <div
              onClick={() => handleSelectedClicked(el)}
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
          {options.map((el) => {
            return (
              <div
                onClick={() => handleOptionClicked(el)}
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
