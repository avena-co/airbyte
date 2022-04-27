import React, { useState, useEffect } from "react";
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

const defaultActions = [
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
    label: "If there is a QuickFix error...",
    operation: "quickFixError",
    selected: false,
  },
];

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

  const [cardIDs, setCardIDs] = useState<String[]>([]);

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

  const [generalActions, setGeneralActions] = useState<Option[]>(
    defaultActions
  );

  const permutator = (cardIDs: Array<String>) => {
    const result: Array<String>[] = [];

    const permute = (arr: Array<String>, m: Array<String> = []) => {
      if (arr.length === 0) {
        result.push(m);
      } else {
        for (let i = 0; i < arr.length; i++) {
          const curr = arr.slice();
          const next = curr.splice(i, 1);
          permute(curr.slice(), m.concat(next));
        }
      }
    };

    permute(cardIDs);

    return result;
  };

  const onSelectCard = (cardIDs: String[], name: String) => {
    const sourceData = data.filter((el) => cardIDs.includes(el.name));
    setSourceData(sourceData);
    setCardIDs(cardIDs);
    const destination = data.filter((el) => name === el.name);
    const destinationValues = destination[0].values.map((el, ind) => {
      console.log(el);
      let value = "";
      sourceData.forEach((val) => {
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

    const newGeneral = permutator(cardIDs).map((el, ind) => {
      return {
        id: ind + 3,
        type: "general",
        operation: "quickFix",
        selected: false,
        label: el.join(", "),
      };
    });

    setGeneralActions(newGeneral);
  };

  const onActionClicked = (data: Option): void => {
    if (data.operation === "quickFix" && data.selected) {
      const newGeneral = permutator(cardIDs).map((el, ind) => {
        return {
          id: ind + 3,
          type: "general",
          operation: "quickFix",
          selected: false,
          label: el.join(", "),
        };
      });
      setGeneralActions(newGeneral);
    } else if (data.operation === "quickFix" && !data.selected) {
      setGeneralActions([...defaultActions, { ...data, selected: true }]);
    } else {
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
    }
  };

  useEffect(() => {
    let updatedDestinationData = originalDestinationData;

    const selectedActions = generalActions.filter((el) => el.selected);

    for (const action of selectedActions) {
      if (action.operation === "quickFix") {
        const splittedLabels = action.label?.split(", ");
        const values = [];
        for (let i = 0; i < updatedDestinationData[0].values.length; i++) {
          let value = "";
          splittedLabels?.forEach((el) => {
            const valueRow = [...data].find((ele) => el === ele.name)?.values[
              i
            ];
            if (value === "") {
              value = `${valueRow}`;
            } else {
              value = `${value}, ${valueRow}`;
            }
          });
          values.push(value);
        }
        updatedDestinationData = [
          {
            name: destinationData[0].name,
            values,
          },
        ];
      }
      if (action.operation === "toLowerCase") {
        updatedDestinationData = updatedDestinationData.map((data) => {
          return {
            ...data,
            values: data.values.map((el) => el.toLowerCase()),
          };
        });
      } else if (action.operation === "skipEmpty") {
        updatedDestinationData = updatedDestinationData.map((data) => {
          return {
            ...data,
            values: data.values.filter((el) => !!el),
          };
        });
      }
    }
    setDestinationData(updatedDestinationData);
  }, [generalActions, originalDestinationData]);

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
