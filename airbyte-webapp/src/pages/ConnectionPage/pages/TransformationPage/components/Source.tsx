import React from "react";

// components
import Card from "./Card";

interface Column {
  name: string;
  values: string[];
}

type SourceProps = {
  data: Column[];
  onScroll: (e: React.UIEvent<HTMLElement> | undefined) => void;
};

const Source: React.FC<SourceProps> = ({ data, onScroll }) => {
  return (
    <div>
      <Card title="Source" onScroll={onScroll} data={data} />
    </div>
  );
};

export default Source;
