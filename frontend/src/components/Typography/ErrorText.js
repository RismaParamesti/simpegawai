function ErrorText({ styleClass, children }) {
  return (
    <p
      className={`text-center text-sm font-medium text-error ${styleClass || ""}`}
    >
      {children}
    </p>
  );
}

export default ErrorText;
