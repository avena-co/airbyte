import React from "react";
// components
import Card from "./Card";

interface Column {
  name: string;
  values: string[];
}

type DestinationProps = {
  data: Column[];
};

const Destination: React.FC<DestinationProps> = ({ data }) => {
  return (
    <div>
      <Card title="Destination" data={data} />
    </div>
  );
};

export default Destination;
