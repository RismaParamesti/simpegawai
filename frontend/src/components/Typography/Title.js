function Title({ className, children }) {
  return (
    <p
      className={`font-display text-2xl font-bold tracking-tight text-base-content sm:text-3xl ${className || ""}`}
    >
      {children}
    </p>
  );
}

export default Title;
