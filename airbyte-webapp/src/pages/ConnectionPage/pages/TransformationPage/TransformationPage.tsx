import React from "react";
import { ScrollSync } from "scroll-sync-react";
import { Destination, Source } from "core/domain/connector";
import { Connection } from "core/domain/connection";

// components
import SourceColumn from "./components/Source";
import DestinationColumn from "./components/Destination";
import QuickFixes from "./components/QuickFixes";
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
  const data = [
    {
      name: "Column1",
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
    },
    {
      name: "Column2",
      values: [
        "Muhammed1",
        "Metin2",
        "Hakan",
        "Mehmet",
        "Muhammed",
        "Muhammed",
        "Metin",
        "Hakan",
        "Mehmet",
        "Muhammed",
      ],
    },
    {
      name: "Column3",
      values: [
        "Muhammed3",
        "Metin4",
        "Hakan",
        "Mehmet",
        "Muhammed",
        "Muhammed",
        "Metin",
        "Hakan",
        "Mehmet",
        "Muhammed",
        "Muhammed",
        "Muhammed",
        "Muhammed",
      ],
    },
  ];

  const handleScroll = (e: React.UIEvent<HTMLElement> | undefined): void => {
    console.log("e", e);
  };

  return (
    <div style={{ display: "flex", height: "100%" }}>
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
      <QuickFixes />
    </div>
  );
};

export default TransformationPage;
