import React from "react";
import styles from "./action-columns.module.css";

type IProps = {
  onCancelClick: () => void;
};

const AdvancedFormulas: React.FC<IProps> = ({ onCancelClick }) => {
  return (
    <div className={styles.quick_fixes}>
      <div className={styles.title}>Formulas</div>
      <div className={styles.content}>
        <div className={styles.section}>
          Using our advanced formulas, you can cleanup and transform the data
          from the selected columns.
        </div>
      </div>
      <div className={styles.advanced_formula_buttons}>
        <button
          className={styles.advanced_formula_button}
          onClick={onCancelClick}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default AdvancedFormulas;
