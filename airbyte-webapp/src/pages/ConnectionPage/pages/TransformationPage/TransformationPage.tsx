import React, { useState } from "react";
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

interface Column {
  name: string;
  values: string[];
}

const TransformationPage: React.FC<IProps> = ({
  source,
  destination,
  afterSubmitConnection,
  onTransformClick,
}) => {
  const data = [
    {
      name: "name",
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
      name: "merchants",
      values: [
        "Dilekçi",
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
      name: "id",
      values: [
        "3021",
        "3025",
        "2053",
        "2466",
        "4355",
        "6436",
        "5363",
        "2344",
        "4656",
        "3523",
      ],
    },
  ];
  const [sourceData, setSourceData] = useState<Column[]>([
    {
      name: "",
      values: [],
    },
  ]);
  const [destinationData, setDestinationData] = useState<Column[]>([
    {
      name: "",
      values: [],
    },
  ]);

  const onSelectCard = (cardIDs: Array<Object>, name: String) => {
    console.log(name);
    setSourceData(data.filter((el) => cardIDs.includes(el.name)));
    setDestinationData(data.filter((el) => name === el.name));
  };
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
        onSelectCard={onSelectCard}
      />
      <ScrollSync>
        <div style={{ display: "flex" }}>
          <SourceColumn onScroll={handleScroll} data={sourceData} />
          <DestinationColumn data={destinationData} onScroll={handleScroll} />
        </div>
      </ScrollSync>
      <QuickFixes />
    </div>
  );
};

export default TransformationPage;
