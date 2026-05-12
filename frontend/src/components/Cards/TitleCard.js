import Subtitle from "../Typography/Subtitle";

function TitleCard({ title, children, topMargin, TopSideButtons }) {
  return (
    <div
      className={
        "app-card w-full rounded-[1.5rem] p-6 " +
        (topMargin || "mt-6")
      }
    >
      {/* Title for Card */}
      <div className="flex items-start justify-between gap-4">
        <Subtitle styleClass={TopSideButtons ? "inline-block" : ""}>
          {title}
        </Subtitle>

        {/* Top side button, show only if present */}
        {TopSideButtons && <div className="shrink-0">{TopSideButtons}</div>}
      </div>

      <div className="divider my-4 opacity-70"></div>

      {/** Card Body */}
      <div className="h-full w-full overflow-x-auto pb-2 bg-transparent">
        {children}
      </div>
    </div>
  );
}

export default TitleCard;
