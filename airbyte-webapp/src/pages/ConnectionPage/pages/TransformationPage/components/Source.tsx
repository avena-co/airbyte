import React from "react";

// components
import Card from "./Card";

interface Column {
  name: string;
  values: string[];
}

type SourceProps = {
  data: Column[];
};

const Source: React.FC<SourceProps> = ({ data }) => {
  return (
    <div>
      <Card title="Source" data={data} />
    </div>
  );
};

export default Source;
