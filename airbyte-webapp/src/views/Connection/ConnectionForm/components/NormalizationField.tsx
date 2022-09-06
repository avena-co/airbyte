import { FieldProps } from "formik";
import React, { /* useState */ } from "react";
import { FormattedMessage } from "react-intl";

import {
  LabeledRadioButton,
  // LabeledSwitch,
  Link
} from "components";

import { useConfig } from "config";
import { NormalizationType } from "core/domain/connection/operation";

import { ConnectionFormMode } from "../ConnectionForm";

type NormalizationBlockProps = FieldProps<string> & {
  mode: ConnectionFormMode;
};

const NormalizationField: React.FC<NormalizationBlockProps> = ({ form, field, mode }) => {
  const config = useConfig();

  // const [normalizeName, setNormalizeName] = useState(false);
  // const [normalizeAddress, setNormalizeAddress] = useState(false);
  // const [normalizePhone, setNormalizePhone] = useState(false);
  // const [normalizeURL, setNormalizeURL] = useState(false);

  return (
    <div>
      <LabeledRadioButton
        {...form.getFieldProps(field.name)}
        id="normalization.raw"
        label={<FormattedMessage id="form.rawData" />}
        value={NormalizationType.raw}
        checked={field.value === NormalizationType.raw}
        disabled={mode === "readonly"}
      />
      <LabeledRadioButton
        {...form.getFieldProps(field.name)}
        id="normalization.basic"
        label={<FormattedMessage id="form.basicNormalization" />}
        value={NormalizationType.basic}
        checked={field.value === NormalizationType.basic}
        disabled={mode === "readonly"}
        message={
          mode !== "readonly" && (
            <FormattedMessage
              id="form.basicNormalization.message"
              values={{
                lnk: (lnk: React.ReactNode) => (
                  <Link target="_blank" href={config.links.normalizationLink} as="a">
                    {lnk}
                  </Link>
                ),
              }}
            />
          )
        }
      />
      {/* <LabeledRadioButton
        {...form.getFieldProps(field.name)}
        id="normalization.ib"
        label={<FormattedMessage id="form.ibNormalization" />}
        value={NormalizationType.ib}
        checked={field.value === NormalizationType.ib}
        disabled={mode === "readonly"}
      />
      {
        field.value === NormalizationType.ib &&
        <div style={{ margin: "0.5em 0 0 2em" }}>
          <LabeledSwitch
            name="name"
            checked={normalizeName}
            onChange={(ev) => setNormalizeName(ev.target.checked)}
            label={<FormattedMessage id="form.ibNormalization.name" />}
            checkbox
          />
          <LabeledSwitch
            name="address"
            checked={normalizeAddress}
            onChange={(ev) => setNormalizeAddress(ev.target.checked)}
            label={<FormattedMessage id="form.ibNormalization.address" />}
            checkbox
          />
          <LabeledSwitch
            name="phone"
            checked={normalizePhone}
            onChange={(ev) => setNormalizePhone(ev.target.checked)}
            label={<FormattedMessage id="form.ibNormalization.phone" />}
            checkbox
          />
          <LabeledSwitch
            name="URL"
            checked={normalizeURL}
            onChange={(ev) => setNormalizeURL(ev.target.checked)}
            label={<FormattedMessage id="form.ibNormalization.URL" />}
            checkbox
          />
        </div>
      } */}
    </div>
  );
};

export { NormalizationField };
