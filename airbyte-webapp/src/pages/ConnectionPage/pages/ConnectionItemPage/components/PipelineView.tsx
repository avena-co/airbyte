import { Field } from "formik";
import React, { useMemo } from "react";
import { FormattedMessage } from "react-intl";
import styled from "styled-components";

// import { buildConnectionUpdate } from "core/domain/connection";
// import { useUpdateConnection } from "hooks/services/useConnectionHook";
// import { useCurrentWorkspace } from "hooks/services/useWorkspace";
import { FormikOnSubmit } from "types/formik";
import { PipelineField } from "views/Connection/ConnectionForm/components/PipelineField";
import { ConnectionFormMode } from "views/Connection/ConnectionForm/ConnectionForm";
import {
    getInitialPipeline,
    // mapFormPropsToOperation,
} from "views/Connection/ConnectionForm/formConfig";
import { FormCard } from "views/Connection/FormCard";

import {
    ConnectionStatus,
    // OperationCreate,
    WebBackendConnectionRead,
} from "../../../../../core/request/AirbyteClient";

interface PipelineViewProps {
    connection: WebBackendConnectionRead;
}

const Content = styled.div`
  max-width: 1073px;
  margin: 0 auto;
  padding-bottom: 10px;
`;

const PipelineCard: React.FC<{
    onSubmit: FormikOnSubmit<{ pipeline?: string }>;
    mode: ConnectionFormMode;
}> = ({ onSubmit, mode }) => {
    const initialValues = useMemo(
        () => ({
            pipeline: getInitialPipeline(),
        }),
        []
    );

    return (
        <FormCard<{ pipeline?: string }>
            form={{
                initialValues,
                onSubmit,
            }}
            title={<FormattedMessage id="connectionForm.pipeline.selection" />}
            collapsible
            mode={mode}
        >
            <Field name="pipeline" component={PipelineField} mode={mode} />
        </FormCard>
    );
};

const PipelineView: React.FC<PipelineViewProps> = ({ connection }) => {
    // const { mutateAsync: updateConnection } = useUpdateConnection();
    // const workspace = useCurrentWorkspace();

    const mode = connection.status === ConnectionStatus.deprecated ? "readonly" : "edit";

    const onSubmit: FormikOnSubmit<{ pipeline?: string }> = async (
        values,
        { resetForm }
    ) => {
        // const newOp = mapFormPropsToOperation(values, connection.operations, workspace.workspaceId);

        // await updateConnection(
        //     buildConnectionUpdate(connection, {
        //         [123]
        //     })
        // );

        const nextFormValues: typeof values = {};
        if (values.pipeline) {
            nextFormValues.pipeline = getInitialPipeline();
        }

        resetForm({ values: nextFormValues });
    };

    return (
        <Content>
            <fieldset
                disabled={mode === "readonly"}
                style={{ border: "0", pointerEvents: `${mode === "readonly" ? "none" : "auto"}` }}
            >
                <PipelineCard onSubmit={onSubmit} mode={mode} />
            </fieldset>
        </Content>
    );
};

export default PipelineView;
