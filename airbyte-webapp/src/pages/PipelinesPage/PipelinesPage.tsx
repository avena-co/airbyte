import React, { Suspense } from "react";
import { Route, Routes } from "react-router-dom";

import { LoadingPage } from "components";

import { ResourceNotFoundErrorBoundary } from "views/common/ResorceNotFoundErrorBoundary";
import { StartOverErrorView } from "views/common/StartOverErrorView";

import { RoutePaths } from "../routePaths";
import AllPipelinesPage from "./pages/AllPipelinesPage";
import PipelineItemPage from "./pages/PipelineItemPage";
import { CreationFormPage } from "./pages/CreationFormPage/CreationFormPage";

export const PipelinesPage: React.FC = () => (
  <Suspense fallback={<LoadingPage />}>
    <Routes>
      <Route path={RoutePaths.PipelineNew} element={<CreationFormPage />} />
      <Route
        path=":pipelineId/*"
        element={
          <ResourceNotFoundErrorBoundary errorComponent={<StartOverErrorView />}>
            <PipelineItemPage />
          </ResourceNotFoundErrorBoundary>
        }
      />
      <Route index element={<AllPipelinesPage />} />
    </Routes>
  </Suspense>
);
