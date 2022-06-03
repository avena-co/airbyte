import React from "react";
import { FormattedMessage } from "react-intl";

import StepsMenu from "components/StepsMenu";

export enum StepsTypes {
  OVERVIEW = "Overview",
  SETTINGS = "Settings",
  DATA = "Data",
}

type IProps = {
  currentStep: string;
  setCurrentStep: (step: string) => void;
};

const steps = [
  {
    id: StepsTypes.OVERVIEW,
    name: <FormattedMessage id="tables.overview" />,
  },
  {
    id: StepsTypes.SETTINGS,
    name: <FormattedMessage id="tables.settings" />,
  },
  {
    id: StepsTypes.DATA,
    name: <FormattedMessage id="tables.data" />,
  },
];

const ItemTabs: React.FC<IProps> = ({ currentStep, setCurrentStep }) => {
  return (
    <StepsMenu
      lightMode
      data={steps}
      activeStep={currentStep}
      onSelect={setCurrentStep}
    />
  );
};

export default ItemTabs;
