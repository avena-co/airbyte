import { FieldProps } from "formik";
import React, { useState } from "react";
import { FormattedMessage } from "react-intl";

import { LabeledSwitch } from "components";

import { DeduplicationType } from "core/domain/connection/operation";

import { ConnectionFormMode } from "../ConnectionForm";

type DeduplicationBlockProps = FieldProps<string> & {
    mode: ConnectionFormMode;
};

const DeduplicationField: React.FC<DeduplicationBlockProps> = ({ form, field, mode }) => {
    const [deduplicationType, setDeduplicationType] = useState("none");

    return (
        <div>
            <LabeledSwitch
                {...form.getFieldProps(field.name)}
                id="form.doDeduplication"
                checked={deduplicationType === DeduplicationType.ib}
                onChange={(ev) => setDeduplicationType(ev.target.checked ? "ib" : "none")}
                label={<FormattedMessage id="form.doDeduplication" />}
                disabled={mode === "readonly"}
            />
        </div>
    );
};

export { DeduplicationField };
