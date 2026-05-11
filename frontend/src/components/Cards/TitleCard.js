import Subtitle from "../Typography/Subtitle";

function TitleCard({ title, children, topMargin, TopSideButtons }) {
  return (
    <div
      className={
        "card w-full rounded-[1.5rem] border border-base-300/70 bg-base-100/90 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl " +
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
      <div className="h-full w-full pb-2 bg-transparent">{children}</div>
    </div>
  );
}

export default TitleCard;
