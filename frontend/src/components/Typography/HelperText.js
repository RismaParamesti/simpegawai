function HelperText({ className, children }) {
  return (
    <div
      className={`text-sm leading-relaxed text-base-content/60 ${className || ""}`}
    >
      {children}
    </div>
  );
}

export default HelperText;
