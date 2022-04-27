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
  id?: number;
  type?: string;
  label?: string;
  operation?: string;
  value?: string;
}

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
      name: "Lastname",
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
      name: "Age",
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
      name: "Job",
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

  const [sourceData, setSourceData] = useState<Column[]>([
    {
      name: "",
      values: [],
    },
  ]);
  const [cardIDs, setCardIDs] = useState<Array<String>>([]);
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

  const [selectedActions, setSelectedActions] = useState<Option[]>([]);
  const [generalActions, setGeneralActions] = useState<Option[]>([
    {
      id: 1,
      type: "general",
      label: "Convert to lower case",
      operation: "toLowerCase",
    },
    {
      id: 2,
      type: "general",
      label: "Skip if value = Empty or null",
      operation: "skipEmpty",
    },
  ]);
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
  const onSelectCard = (cardIDs: Array<String>, name: String) => {
    setCardIDs(cardIDs);
    const newData = [
      {
        name: "Firstname",
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
        name: "Lastname",
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
        name: "Age",
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
        name: "Job",
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
    const sourceData = newData.filter((el) => cardIDs.includes(el.name));
    setSourceData(sourceData);
    const newSource = [...sourceData];
    const destination = [...data].filter((el) => name === el.name);
    const destinationValues = destination[0].values.map((el, ind) => {
      if (!el) console.log(el);
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

    const newGeneral = permutator(cardIDs).map((el, ind) => {
      return {
        id: ind + 3,
        type: "general",
        operation: "quickFix",
        label: el.join(", "),
      };
    });

    setGeneralActions(newGeneral);
  };
  const handleScroll = (e: React.UIEvent<HTMLElement> | undefined): void => {
    if (!e) console.log("e", e);
  };

  const onActionClicked = (data: Option): void => {
    const index = selectedActions.findIndex((el) => el.id === data.id);
    console.log(data);
    if (data.operation === "quickFix") {
      setSelectedActions([data]);
      setGeneralActions([
        {
          id: 1,
          type: "general",
          label: "Convert to lower case",
          operation: "toLowerCase",
        },
        {
          id: 2,
          type: "general",
          label: "Skip if value = Empty or null",
          operation: "skipEmpty",
        },
      ]);
    } else if (index < 0) {
      setSelectedActions((prevState) => [...prevState, data]);
      setGeneralActions((prevState) =>
        prevState.filter((el) => el.id !== data.id)
      );
    }
  };

  useEffect(() => {
    let destinationData = [...originalDestinationData];
    selectedActions.forEach((el) => {
      if (el.operation === "quickFix") {
        const splittedLabels = el.label?.split(", ");
        const values = [];
        for (let i = 0; i < destinationData[0].values.length; i++) {
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
        destinationData = [
          {
            name: destinationData[0].name,
            values,
          },
        ];
      }
      if (el.operation === "toLowerCase") {
        destinationData = destinationData.map((el) => {
          return {
            name: el.name,
            values: el.values.map((value) => value.toLowerCase()),
          };
        });
      } else if (el.operation === "skipEmpty") {
        destinationData = destinationData.map((el) => {
          return {
            name: el.name,
            values: el.values.filter((value) => value !== ""),
          };
        });
      }
    });
    setDestinationData(destinationData);
  }, [selectedActions]);

  const onSelectedActionClicked = (data: Option): void => {
    const index = generalActions.findIndex((el) => el.id === data.id);

    if (data.operation === "quickFix") {
      setSelectedActions([]);
      const newGeneral = permutator(cardIDs).map((el, ind) => {
        return {
          id: ind + 3,
          type: "general",
          operation: "quickFix",
          label: el.join(", "),
        };
      });

      setGeneralActions(newGeneral);
    } else if (index < 0) {
      setGeneralActions((prevState) => [...prevState, data]);
      setSelectedActions((prevState) =>
        prevState.filter((el) => el.id !== data.id)
      );
    }
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
      <QuickFixes
        cardIDs={cardIDs}
        actions={generalActions}
        selectedActions={selectedActions}
        onActionClicked={onActionClicked}
        onSelectedActionClicked={onSelectedActionClicked}
      />
    </div>
  );
};

export default TransformationPage;
