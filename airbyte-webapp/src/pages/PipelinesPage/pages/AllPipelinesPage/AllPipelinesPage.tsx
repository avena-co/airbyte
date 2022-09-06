import React, { Suspense } from "react";
import { FormattedMessage } from "react-intl";

import { Button, LoadingPage, MainPageWithScroll, PageTitle } from "components";
import { EmptyResourceListView } from "components/EmptyResourceListView";
import HeadTitle from "components/HeadTitle";

import { FeatureItem, useFeature } from "hooks/services/Feature";
import { usePipelineList } from "hooks/services/usePipelineHook";
import useRouter from "hooks/useRouter";

import { RoutePaths } from "../../../routePaths";
import PipelinesTable from "./components/PipelinesTable";

const AllPipelinesPage: React.FC = () => {
  const { push } = useRouter();

  const { pipelines } = usePipelineList();
  const allowCreatePipeline = useFeature(FeatureItem.AllowCreatePipeline);

  const onCreateClick = () => push(`${RoutePaths.PipelineNew}`);

  return (
    <Suspense fallback={<LoadingPage />}>
      {pipelines.length ? (
        <MainPageWithScroll
          headTitle={<HeadTitle titles={[{ id: "sidebar.pipelines" }]} />}
          pageTitle={
            <PageTitle
              title={<FormattedMessage id="sidebar.pipelines" />}
              endComponent={
                <Button onClick={onCreateClick} disabled={!allowCreatePipeline}>
                  <FormattedMessage id="pipeline.newPipeline" />
                </Button>
              }
            />
          }
        >
          <PipelinesTable pipelines={pipelines} />
        </MainPageWithScroll>
      ) : (
        <EmptyResourceListView
          resourceType="pipelines"
          onCreateClick={onCreateClick}
          disableCreateButton={!allowCreatePipeline}
        />
      )}
    </Suspense>
  );
};

export default AllPipelinesPage;
