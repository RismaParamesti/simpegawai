import ChevronDownIcon from "@heroicons/react/24/outline/ChevronDownIcon";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

function SidebarSubmenu({ submenu, name, icon }) {
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);

  const closeDrawerOnMobile = () => {
    const drawer = document.getElementById("left-sidebar-drawer");
    if (drawer) drawer.checked = false;
  };

  /** Open Submenu list if path found in routes, this is for directly loading submenu routes  first time */
  useEffect(() => {
    if (
      submenu.filter((m) => {
        return m.path === location.pathname;
      })[0]
    )
      setIsExpanded(true);
  }, [location.pathname, submenu]);

  return (
    <div className="flex flex-col rounded-2xl">
      <button
        type="button"
        className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left font-medium text-base-content/80 transition hover:bg-base-200/80 hover:text-base-content"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="text-lg">{icon}</span>
        <span className="flex-1">{name}</span>
        <ChevronDownIcon
          className={
            "h-5 w-5 shrink-0 transition-transform duration-300 " +
            (isExpanded ? "rotate-180" : "")
          }
        />
      </button>

      {isExpanded ? (
        <div className="ml-3 mt-1 border-l border-base-300/70 pl-3">
          <ul className="menu menu-compact gap-1 rounded-2xl bg-base-200/30 p-2">
            {submenu.map((m, k) => {
              return (
                <li key={k}>
                  <Link
                    to={m.path}
                    onClick={closeDrawerOnMobile}
                    className={`relative rounded-xl px-3 py-2 transition ${location.pathname === m.path ? "bg-primary/10 text-primary font-medium" : "text-base-content/75 hover:bg-base-100/80 hover:text-base-content"}`}
                  >
                    <span className="flex items-center gap-3">
                      <span className="text-base">{m.icon}</span>
                      <span>{m.name}</span>
                    </span>
                    {location.pathname === m.path ? (
                      <span
                        className="absolute inset-y-2 left-1 w-1 rounded-full bg-primary shadow-[0_0_0_4px_rgba(234,107,47,0.12)]"
                        aria-hidden="true"
                      ></span>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

export default SidebarSubmenu;
