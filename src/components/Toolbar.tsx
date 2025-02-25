import React from "react";
import formats from "./ToolbarOptions.ts";

interface FormatData {
  className: string;
  options?: string[];
  value?: string;
}

const renderOptions = (formatData: FormatData): JSX.Element => {
  const { className, options } = formatData;
  return (
    <select className={className}>
      <option selected={true}></option>
      {options?.map((value: string) => {
        return <option key={value} value={value}></option>;
      })}
    </select>
  );
};

const renderSingle = (formatData: FormatData): JSX.Element => {
  const { className, value } = formatData;
  return <button className={className} value={value}></button>;
};

const CustomToolbar: React.FC = () => (
  <div id="toolbar">
    {formats.map((classes: FormatData[]) => {
      return (
        <span className="ql-formats" key={classes[0]?.className}>
          {classes.map((formatData: FormatData) => {
            return formatData.options
              ? renderOptions(formatData)
              : renderSingle(formatData);
          })}
        </span>
      );
    })}
  </div>
);

export default CustomToolbar;
