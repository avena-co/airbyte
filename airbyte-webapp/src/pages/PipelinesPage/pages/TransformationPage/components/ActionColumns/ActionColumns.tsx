import React, { useState } from "react";
import styles from "./action-columns.module.css";
import AdvancedFormulas from "./AdvancedFormulas";

// components
import QuickFixes from "./QuickFixes";

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

enum Pages {
  quickFixPage = "quickFixPage",
  cleanDataPage = "cleanDataPage",
  advancedFormulaPage = "advancedFormulaPage",
}

const ActionColumns: React.FC<IProps> = ({ actions, onActionClicked }) => {
  const [currentPage, setCurrentPage] = useState(Pages.quickFixPage);

  const handleAdvancedFormulasClicked = () => {
    setCurrentPage(Pages.advancedFormulaPage);
  };

  const handleCancelClicked = () => {
    setCurrentPage(Pages.quickFixPage);
  };

  return (
    <div className={styles.container}>
      {currentPage === Pages.quickFixPage && (
        <QuickFixes
          actions={actions}
          onActionClicked={onActionClicked}
          advancedFormulaClick={handleAdvancedFormulasClicked}
        />
      )}
      {currentPage === Pages.advancedFormulaPage && (
        <AdvancedFormulas onCancelClick={handleCancelClicked} />
      )}
    </div>
  );
};

export default ActionColumns;
