import React, { Suspense, useMemo } from "react";
import { FormattedMessage } from "react-intl";
import styled from "styled-components";

import { Button, ContentCard } from "components";
import LoadingSchema from "components/LoadingSchema";
import { JobItem } from "components/JobItem/JobItem";
import TryAfterErrorBlock from "components/CreateConnectionContent/components/TryAfterErrorBlock";

import { useDiscoverSchema } from "hooks/services/useSourceHook";
import { LogsRequestError } from "core/request/LogsRequestError";
import { DestinationRead, SourceRead, WebBackendConnectionRead } from "core/request/AirbyteClient";
import { Select } from "antd";

import styles from "./transformation-adjuster.module.css";

const SkipButton = styled.div`
  margin-top: 6px;

  & > button {
    min-width: 239px;
    margin-left: 9px;
  }
`;

type IProps = {
  additionBottomControls?: React.ReactNode;
  source: SourceRead;
  destination: DestinationRead;
  onTransformClick: () => void;
  onSelectCard: (cardIDs: Array<String>, name: String) => void;
  afterSubmitConnection?: (connection: WebBackendConnectionRead) => void;
  noTitles?: boolean;
};

const TransformationTitleAdjuster: React.FC<IProps> = ({
  source,
  destination,
  onSelectCard,
  onTransformClick,
  additionBottomControls,
  noTitles,
}) => {
  const { Option } = Select;

  const {
    schema,
    isLoading,
    schemaErrorStatus,
    onDiscoverSchema,
  } = useDiscoverSchema(source.sourceId);

  const connection = useMemo(
    () => ({
      syncCatalog: schema,
      destination,
      source,
    }),
    [schema, destination, source]
  );

  if (schemaErrorStatus) {
    const job = LogsRequestError.extractJobInfo(schemaErrorStatus);
    return (
      <ContentCard
        title={
          noTitles ? null : <FormattedMessage id="onboarding.setConnection" />
        }
      >
        <TryAfterErrorBlock
          onClick={onDiscoverSchema}
          additionControl={<SkipButton>{additionBottomControls}</SkipButton>}
        />
        {job && <JobItem job={job} />}
      </ContentCard>
    );
  }

  return (
    <ContentCard
      className={styles.card_container}
      title={
        noTitles ? null : <FormattedMessage id="onboarding.setConnection" />
      }
    >
      {isLoading ? (
        <LoadingSchema />
      ) : (
        <Suspense fallback={<LoadingSchema />}>
          <>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gridGap: "50px",
                margin: "30px",
              }}
            >
              {connection?.syncCatalog?.streams.map(({ stream }) => {
                const properties = stream?.jsonSchema?.properties;
                return (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gridGap: "10px",
                    }}
                  >
                    <div style={{ fontWeight: "bold", fontSize: "20px" }}>
                      {stream?.name}
                    </div>
                    {Object.keys(properties ? properties : {}).map(
                      (property) => {
                        return (
                          <div
                            style={{
                              minHeight: "100px",
                              display: "grid",
                              gridTemplateColumns: "60% 40%",
                              border: "1px solid grey",
                              borderRadius: "10px",
                              padding: "10px",
                            }}
                          >
                            <div
                              style={{
                                height: "100%",
                                width: "100%",
                                display: "flex",
                                justifyContent: "start",
                                alignItems: "center",
                              }}
                            >
                              <Select
                                mode="multiple"
                                allowClear
                                style={{ width: "200px" }}
                                onChange={(e) => onSelectCard(e, property)}
                                placeholder="Please select"
                                // defaultValue={[property]}
                              >
                                {Object.keys(properties ? properties : {}).map(
                                  (property) => (
                                    <Option key={property}>{property}</Option>
                                  )
                                )}
                              </Select>
                              <div
                                style={{
                                  borderBottom: "1px solid black",
                                  width: "100%",
                                }}
                              />
                              <div style={{ paddingBottom: "1px" }}>&rarr;</div>
                            </div>
                            <div
                              style={{
                                height: "100%",
                                width: "100%",
                                display: "flex",
                                justifyContent: "start",
                                alignItems: "center",
                                padding: "10px",
                              }}
                            >
                              {property}
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                );
              })}
              <Button onClick={onTransformClick}>Test</Button>
            </div>
          </>
        </Suspense>
      )}
    </ContentCard>
  );
};

export default TransformationTitleAdjuster;
