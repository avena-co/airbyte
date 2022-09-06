import { FieldProps } from "formik";
import React, { useCallback, useMemo } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { components } from "react-select";
import { MenuListComponentProps } from "react-select/src/components/Menu";
import styled from "styled-components";

import { ControlLabels, DropDown, /* DropDownRow */ } from "components";
import { IDataItem, IProps as OptionProps, OptionView } from "components/base/DropDown/components/Option";
import {
    Icon as SingleValueIcon,
    IProps as SingleValueProps,
    ItemView as SingleValueView,
} from "components/base/DropDown/components/SingleValue";

import { ConnectionFormMode } from "../ConnectionForm";

const BottomElement = styled.div`
  background: ${(props) => props.theme.greyColro0};
  padding: 6px 16px 8px;
  width: 100%;
  min-height: 34px;
  border-top: 1px solid ${(props) => props.theme.greyColor20};
`;

const Block = styled.div`
  cursor: pointer;
  color: ${({ theme }) => theme.textColor};

  &:hover {
    color: ${({ theme }) => theme.primaryColor};
  }
`;

const Text = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const Label = styled.div`
  margin-left: 13px;
  font-weight: 500;
  font-size: 14px;
  line-height: 17px;
`;

const SingleValueContent = styled(components.SingleValue)`
  width: 100%;
  padding-right: 38px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

type PipelineBlockProps = FieldProps<string> & {
    mode: ConnectionFormMode;
};

type MenuWithRequestButtonProps = MenuListComponentProps<IDataItem, false>;

const PipelineList: React.FC<MenuWithRequestButtonProps> = ({ children, ...props }) => (
    <>
        <components.MenuList {...props}>{children}</components.MenuList>
        <BottomElement>
            <Block onClick={() => props.selectProps.selectProps.onOpenRequestConnectorModal(props.selectProps.inputValue)}>
                <FormattedMessage id="connector.buildNewPipelineBlock" />
            </Block>
        </BottomElement>
    </>
);

const Option: React.FC<OptionProps> = (props) => {
    return (
        <components.Option {...props}>
            <OptionView data-testid={props.data.label} isSelected={props.isSelected} isDisabled={props.isDisabled}>
                <Text>
                    {props.data.img || null}
                    <Label>{props.label}</Label>
                </Text>
            </OptionView>
        </components.Option>
    );
};

const SingleValue: React.FC<SingleValueProps> = (props) => {
    return (
        <SingleValueView>
            {props.data.img && <SingleValueIcon>{props.data.img}</SingleValueIcon>}
            <div>
                <SingleValueContent {...props}>
                    {props.data.label}
                </SingleValueContent>
            </div>
        </SingleValueView>
    );
};

const PipelineField: React.FC<PipelineBlockProps> = ({ form, field, mode }) => {
    const { formatMessage } = useIntl();
    const availablePipelines: string[] = [];
    const sortedDropDownData = useMemo(
        () =>
            availablePipelines
                .map((item) => ({
                    label: item,
                    value: item,
                })),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [availablePipelines]
    );

    const getNoOptionsMessage = useCallback(
        () => {
            return formatMessage({ id: "form.noPipelineFound" });
        },
        [formatMessage]
    );

    // const handleSelect = useCallback(
    //     (item: DropDownRow.IDataItem | null) => {
    //         if (item) {
    //             setValue(item.value);
    //             // if (onChangeServiceType) {
    //             //     onChangeServiceType(item.value);
    //             // }
    //         }
    //     },
    //     [setValue, /* onChangeServiceType */]
    // );

    return (
        <div>
            <ControlLabels
                {...form.getFieldProps(field.name)}
                label={formatMessage({
                    id: `form.pipelineName`,
                })}
            >
                <DropDown
                    components={{
                        MenuList: PipelineList,
                        Option,
                        SingleValue,
                    }}
                    // selectProps={{ onOpenRequestConnectorModal }}
                    isDisabled={mode === "readonly"}
                    isSearchable
                    placeholder={formatMessage({
                        id: "form.selectPipeline",
                    })}
                    options={sortedDropDownData}
                    // onChange={handleSelect}
                    noOptionsMessage={getNoOptionsMessage}
                />
            </ControlLabels>
        </div>
    );
};

export { PipelineField };
