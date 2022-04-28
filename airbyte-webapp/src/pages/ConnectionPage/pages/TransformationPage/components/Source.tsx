import React from "react";

// components
import Card from "./Card";

interface Column {
  name: string;
  values: string[];
}

type SourceProps = {
  data: Column[];
  onCardItemClick: (data: any, index: number) => void;
};

const Source: React.FC<SourceProps> = ({ data, onCardItemClick }) => {
  return (
    <div>
      <Card onCardItemClick={onCardItemClick} title="Source" data={data} />
    </div>
  );
};

export default Source;
