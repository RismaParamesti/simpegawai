function DashboardStats({ title, icon, value, description, colorIndex }) {
  const COLORS = ["primary", "secondary"];

  const getDescStyle = () => {
    if (description.includes("↗︎"))
      return "font-bold text-green-700 dark:text-green-300";
    else if (description.includes("↙"))
      return "font-bold text-rose-500 dark:text-red-400";
    else return "";
  };

  return (
    <div className="stats w-full rounded-[1.5rem] border border-base-300/70 bg-base-100/90 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl">
      <div className="stat px-5 py-5">
        <div className={`stat-figure text-${COLORS[colorIndex % 2]}`}>
          {icon}
        </div>
        <div className="stat-title text-base-content/60">{title}</div>
        <div
          className={`stat-value text-3xl sm:text-4xl text-${COLORS[colorIndex % 2]}`}
        >
          {value}
        </div>
        <div className={"stat-desc text-base-content/60 " + getDescStyle()}>
          {description}
        </div>
      </div>
    </div>
  );
}

export default DashboardStats;
