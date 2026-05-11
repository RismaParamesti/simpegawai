import { useState } from "react";

function TextAreaInput({
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

  const updateInputValue = (val) => {
    setValue(val);
    updateFormValue({ updateType, value: val });
  };

  return (
    <div className={`form-control w-full ${containerStyle || ""}`}>
      <label className="label">
        <span
          className={`label-text text-sm font-medium text-base-content/80 ${labelStyle || ""}`}
        >
          {labelTitle}
        </span>
      </label>
      <textarea
        value={value}
        className="textarea textarea-bordered w-full rounded-2xl border-base-300 bg-base-100/90 shadow-sm outline-none focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
        placeholder={placeholder || ""}
        onChange={(e) => updateInputValue(e.target.value)}
      ></textarea>
    </div>
  );
}

export default TextAreaInput;
