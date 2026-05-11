function Subtitle({ styleClass, children }) {
  return (
    <div
      className={`font-display text-xl font-semibold tracking-tight text-base-content ${styleClass || ""}`}
    >
      {children}
    </div>
  );
}

export default Subtitle;
