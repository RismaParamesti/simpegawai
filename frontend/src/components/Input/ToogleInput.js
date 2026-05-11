import { useState } from "react";

function ToogleInput({
  labelTitle,
  labelStyle,
  type,
  containerStyle,
  defaultValue,
  placeholder,
  updateFormValue,
  updateType,
}) {
  const [value, setValue] = useState(defaultValue);

  const updateToogleValue = () => {
    setValue(!value);
    updateFormValue({ updateType, value: !value });
  };

  return (
    <div className={`form-control w-full ${containerStyle}`}>
      <label className="label cursor-pointer">
        <span
          className={`label-text text-sm font-medium text-base-content/80 ${labelStyle || ""}`}
        >
          {labelTitle}
        </span>
        <input
          type="checkbox"
          className="toggle toggle-primary"
          checked={value}
          onChange={() => updateToogleValue()}
        />
      </label>
    </div>
  );
}

export default ToogleInput;
