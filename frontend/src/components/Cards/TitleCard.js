import Subtitle from "../Typography/Subtitle";
import { useNavigate } from "react-router-dom";

function TitleCard({ title, subtitle, children, topMargin, TopSideButtons, to, linkState }) {
  const navigate = useNavigate();
  const clickable = !!to;

  const handleClick = (e) => {
    if (!clickable) return;
    navigate(to, { state: linkState });
  };

  const handleKeyDown = (e) => {
    if (!clickable) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      navigate(to, { state: linkState });
    }
  };

  return (
    <div
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      className={
        "app-card w-full rounded-[1.5rem] p-4 sm:p-6 " +
        (topMargin || "mt-6") +
        (clickable ? " cursor-pointer hover:shadow-md transition" : "")
      }
    >
      {/* Title for Card */}
      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <Subtitle styleClass={TopSideButtons ? "inline-block" : ""}>
            {title}
          </Subtitle>
          {subtitle && (
            <p className="mt-1 text-sm text-base-content/60">{subtitle}</p>
          )}
        </div>

        {/* Top side button, show only if present */}
        {TopSideButtons && (
          <div className="flex shrink-0 flex-wrap gap-2 sm:justify-end">
            {TopSideButtons}
          </div>
        )}
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
