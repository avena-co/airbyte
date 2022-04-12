import React from "react";
import { ScrollSync } from "scroll-sync-react";
import { Destination, Source } from "core/domain/connector";
import { Connection } from "core/domain/connection";

// components
import SourceColumn from "./components/Source";
import DestinationColumn from "./components/Destination";
import TransformationTitleAdjuster from "./TransformationTitleAdjuster";

type IProps = {
  source: Source;
  destination: Destination;
  onTransformClick: () => void;
  afterSubmitConnection?: (connection: Connection) => void;
};

const TransformationPage: React.FC<IProps> = ({
  source,
  destination,
  afterSubmitConnection,
  onTransformClick,
}) => {
  const data = {
    name: "Name",
    values: [
      "Muhammed",
      "Metin",
      "Hakan",
      "Mehmet",
      "Muhammed",
      "Muhammed",
      "Metin",
      "Hakan",
      "Mehmet",
      "Muhammed",
    ],
  };

  const handleScroll = (e: React.UIEvent<HTMLElement> | undefined): void => {
    console.log("e", e);
  };

  return (
    <div style={{ display: "flex" }}>
      <TransformationTitleAdjuster
        source={source}
        destination={destination}
        afterSubmitConnection={afterSubmitConnection}
        onTransformClick={onTransformClick}
      />
      <ScrollSync>
        <div style={{ display: "flex" }}>
          <SourceColumn onScroll={handleScroll} data={data} />
          <DestinationColumn data={data} onScroll={handleScroll} />
        </div>
      </ScrollSync>
    </div>
  );
};

export default TransformationPage;
