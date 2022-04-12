import React from "react";
// components
import Card from "./Card";

interface Column {
  name: string;
  values: string[];
}

type DestinationProps = {
  data: Column;
  onScroll: (e: React.UIEvent<HTMLElement> | undefined) => void;
};

const Destination: React.FC<DestinationProps> = ({ data, onScroll }) => {
  return (
    <div>
      <Card onScroll={onScroll} title="Destination" data={data} />
    </div>
  );
};

export default Destination;
