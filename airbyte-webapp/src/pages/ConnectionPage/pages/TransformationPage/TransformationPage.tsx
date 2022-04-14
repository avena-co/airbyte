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
      name: "Firstname",
      values: [
        "James",
        "Robert",
        "Jennifer",
        "Michael",
        "Mary",
        "William",
        "Patricia",
        "John",
        "Elizabeth",
        "Barbara",
        "Susan",
        "Thomas",
        "Joseph",
        "David",
        "Karen",
        "Nancy",
        "Matthew",
        "Steven",
        "Kimberly",
      ],
    },
    {
      name: "Lastname",
      values: [
        "Smith",
        "Thomas",
        "Clark",
        "Lewis",
        "Rodriguez",
        "Davis",
        "Lopez",
        "Gonzales",
        "Martinez",
        "Hernandez",
        "Moore",
        "Garcia",
        "Perez",
        "Walker",
        "Scott",
        "Torres",
        "Hall",
        "Diaz",
        "Cox",
      ],
    },
    {
      name: "Age",
      values: [
        "29",
        "27",
        "30",
        "34",
        "41",
        "34",
        "28",
        "38",
        "36",
        "39",
        "25",
        "40",
        "38",
        "41",
        "36",
        "42",
        "29",
        "37",
        "39",
      ],
    },
    {
      name: "Job",
      values: [
        "Marketing Director",
        "Supervisor",
        "Receptionist",
        "Data Entry",
        "Director",
        "Human Resources",
        "Copywriter",
        "Help Desk",
        "Data Entry",
        "Painter",
        "Cashier",
        "Computer Scientist",
        "Plumber",
        "Customer Service",
        "Sales Engineer",
        "CEO",
        "Scrum Master",
        "Managing Partner",
        "Finance Director",
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
