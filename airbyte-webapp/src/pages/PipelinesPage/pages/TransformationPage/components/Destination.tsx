import React from "react";
// components
import Card from "./Card";

interface Column {
  name: string;
  values: string[];
}

type DestinationProps = {
  data: Column[];
  onCardItemClick: (data: any, index: number) => void;
};

const Destination: React.FC<DestinationProps> = ({ data, onCardItemClick }) => {
  return (
    <div>
      <Card onCardItemClick={onCardItemClick} title="Destination" data={data} />
    </div>
  );
};

export default Destination;
