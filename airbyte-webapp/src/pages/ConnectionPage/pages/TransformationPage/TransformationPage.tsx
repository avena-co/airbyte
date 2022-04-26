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

interface Option {
  id: number;
  type: string;
  label: string;
  operation: string;
  value?: string;
  selected?: boolean;
}

interface Column {
  name: string;
  values: string[];
}

const data = [
  {
    name: "oldData",
    values: [
      "James",
      "Robert",
      "",
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
      "",
      "Nancy",
      "Matthew",
      "Steven",
      "Kimberly",
    ],
  },
  {
    name: "createdAt",
    values: [
      "Smith",
      "Thomas",
      "",
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
    name: "shortId",
    values: [
      "29",
      "27",
      "",
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
    name: "__v",
    values: [
      "Marketing Director",
      "Supervisor",
      "",
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

const TransformationPage: React.FC<IProps> = ({
  source,
  destination,
  afterSubmitConnection,
  onTransformClick,
}) => {
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
  const [originalDestinationData, setOriginalDestinationData] = useState<
    Column[]
  >([
    {
      name: "",
      values: [],
    },
  ]);

  const [generalActions, setGeneralActions] = useState<Option[]>([
    {
      id: 1,
      type: "general",
      label: "Convert to lower case",
      operation: "toLowerCase",
      selected: false,
    },
    {
      id: 2,
      type: "general",
      label: "Skip if value = Empty or null",
      operation: "skipEmpty",
      selected: false,
    },
    {
      id: 3,
      type: "quickFixErrors",
      label: "IF THERE IS A QUICK FIX ERROR...",
      operation: "quickFixError",
      selected: false,
    },
  ]);

  const onSelectCard = (cardIDs: Array<Object>, name: String) => {
    const sourceData = data.filter((el) => cardIDs.includes(el.name));
    setSourceData(sourceData);
    const newSource = [...sourceData];
    const destination = data.filter((el) => name === el.name);
    const destinationValues = destination[0].values.map((el, ind) => {
      console.log(el);
      let value = "";
      newSource.forEach((val) => {
        if (value === "") {
          value = val.values[ind];
        } else {
          value = `${value}, ${val.values[ind]}`;
        }
      });
      return value;
    });
    destination[0].values = destinationValues;
    setDestinationData(destination);
    setOriginalDestinationData(destination);
  };

  const onActionClicked = (data: Option): void => {
    setGeneralActions((prevState) =>
      prevState.map((el) => {
        if (el.id === data.id) {
          return {
            ...el,
            selected: !el.selected,
          };
        }
        return el;
      })
    );
  };
  console.log("first", originalDestinationData);
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
          <SourceColumn data={sourceData} />
          <DestinationColumn data={destinationData} />
        </div>
      </ScrollSync>
      <QuickFixes actions={generalActions} onActionClicked={onActionClicked} />
    </div>
  );
};

export default TransformationPage;
