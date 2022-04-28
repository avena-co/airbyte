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

  const [originalDestinationData, setOriginalDestinationData] = useState<
    Column[]
  >([
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
        "",
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
        "",
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
        "",
        "CEO",
        "Scrum Master",
        "Managing Partner",
        "Finance Director",
      ],
    },
    {
      name: "_id",
      values: [
        "123120",
        "123148",
        "",
        "123198",
        "123213",
        "123123",
        "123124",
        "123125",
        "123120",
        "123126",
        "123198",
        "123154",
        "123123",
        "123178",
        "",
        "123148",
        "123179",
        "123131",
        "123181",
      ],
    },
  ];

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

    if (cardIDs.length === 1) {
      const destination = data.filter((el) => name === el.name);
      setGeneralActions(defaultActions);
      setDestinationData(destination);
      setOriginalDestinationData(destination);
    } else {
      setDestinationData([{ name: `${name}`, values: [] }]);
      setOriginalDestinationData([{ name: `${name}`, values: [] }]);
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
    }
  };

  const handleCardItemClick = (data: any, index: number): void => {
    console.log("data", data);
    console.log("index", index);
  };

  const onActionClicked = (val: Option): void => {
    let newActions: Option[] = [];
    if (val.operation === "quickFix" && val.selected) {
      newActions = permutator(cardIDs).map((el, ind) => {
        return {
          id: ind + 3,
          type: "general",
          operation: "quickFix",
          selected: false,
          label: el.join(", "),
        };
      });
    } else if (val.operation === "quickFix" && !val.selected) {
      newActions = [...defaultActions, { ...val, selected: true }];
    } else {
      newActions = generalActions.map((el) => {
        if (el.id === val.id) {
          return {
            ...el,
            selected: !el.selected,
          };
        }
        return el;
      });
    }
    setGeneralActions(newActions);

    // modify destination data
    let updatedDestinationData = originalDestinationData;

    const selectedActions = newActions?.filter((el) => el.selected);

    const quickFixIndex = selectedActions.findIndex(
      (action) => action.operation === "quickFix"
    );

    const lowerCaseIndex = selectedActions.findIndex(
      (action) => action.operation === "toLowerCase"
    );

    const skipEmptyIndex = selectedActions.findIndex(
      (action) => action.operation === "skipEmpty"
    );

    if (quickFixIndex >= 0) {
      const action = selectedActions[quickFixIndex];
      const splittedLabels = action.label?.split(", ");
      const values = [];
      for (let i = 0; i < sourceData[0].values.length; i++) {
        let value = "";
        splittedLabels?.forEach((el) => {
          const valueRow = [...data].find((ele) => el === ele.name)?.values[i];
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

    if (lowerCaseIndex >= 0) {
      updatedDestinationData = updatedDestinationData.map((data) => {
        return {
          ...data,
          values: data.values.map((el) => el.toLowerCase()),
        };
      });
    }

    if (skipEmptyIndex >= 0) {
      updatedDestinationData = updatedDestinationData.map((data) => {
        return {
          ...data,
          values: data.values.filter((el) => !!el),
        };
      });
    }

    setDestinationData(updatedDestinationData);
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
          <SourceColumn
            onCardItemClick={handleCardItemClick}
            data={sourceData}
          />
          <DestinationColumn
            onCardItemClick={handleCardItemClick}
            data={destinationData}
          />
        </div>
      </ScrollSync>
      <QuickFixes actions={generalActions} onActionClicked={onActionClicked} />
    </div>
  );
};

export default TransformationPage;
