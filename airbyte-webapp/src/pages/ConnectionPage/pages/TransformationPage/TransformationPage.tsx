import React from "react";

// components
import Source from "./components/Source";
import Destination from "./components/Destination";

const TransformationPage: React.FC = () => {
  const data = {
    name: "Name",
    values: ["Muhammed", "Metin", "Hakan", "Mehmet"],
  };

  const handleScroll = (e: React.UIEvent<HTMLElement> | undefined): void => {
    console.log("e", e);
  };

  return (
    <div style={{ display: "flex" }}>
      <Source onScroll={handleScroll} data={data} />
      <Destination data={data} onScroll={handleScroll} />
    </div>
  );
};

export default TransformationPage;
