import XMarkIcon from "@heroicons/react/24/solid/XMarkIcon";
import { useDispatch, useSelector } from "react-redux";
import NotificationBodyRightDrawer from "../features/common/components/NotificationBodyRightDrawer";
import { closeRightDrawer } from "../features/common/rightDrawerSlice";
import { RIGHT_DRAWER_TYPES } from "../utils/globalConstantUtil";
import CalendarEventsBodyRightDrawer from "../features/calendar/CalendarEventsBodyRightDrawer";

function RightSidebar() {
  const { isOpen, bodyType, extraObject, header } = useSelector(
    (state) => state.rightDrawer,
  );
  const dispatch = useDispatch();

  const close = (e) => {
    dispatch(closeRightDrawer(e));
  };

  return (
    <div
      className={
        " fixed inset-0 z-20 overflow-hidden bg-slate-950/30 backdrop-blur-sm transform ease-in-out " +
        (isOpen
          ? " transition-opacity opacity-100 duration-500 translate-x-0  "
          : " transition-all delay-500 opacity-0 translate-x-full  ")
      }
    >
      <section
        className={
          "absolute right-0 h-full w-full max-w-sm overflow-hidden border-l border-base-300/70 bg-base-100/95 shadow-[0_24px_60px_rgba(15,23,42,0.18)] delay-400 duration-500 ease-in-out transition-all transform backdrop-blur-xl sm:max-w-md " +
          (isOpen ? " translate-x-0 " : " translate-x-full ")
        }
      >
        <div className="relative  pb-5 flex flex-col  h-full">
          {/* Header */}
          <div className="navbar flex border-b border-base-300/70 bg-base-100/70 px-4 shadow-sm backdrop-blur-xl">
            <button
              className="float-left btn btn-circle btn-outline btn-sm"
              onClick={() => close()}
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
            <span className="ml-2 font-display text-xl font-bold">
              {header}
            </span>
          </div>

          {/* ------------------ Content Start ------------------ */}
          <div className="overflow-y-scroll px-4">
            <div className="flex flex-col w-full">
              {/* Loading drawer body according to different drawer type */}
              {
                {
                  [RIGHT_DRAWER_TYPES.NOTIFICATION]: (
                    <NotificationBodyRightDrawer
                      {...extraObject}
                      closeRightDrawer={close}
                    />
                  ),
                  [RIGHT_DRAWER_TYPES.CALENDAR_EVENTS]: (
                    <CalendarEventsBodyRightDrawer
                      {...extraObject}
                      closeRightDrawer={close}
                    />
                  ),
                  [RIGHT_DRAWER_TYPES.DEFAULT]: <div></div>,
                }[bodyType]
              }
            </div>
          </div>
          {/* ------------------ Content End ------------------ */}
        </div>
      </section>

      <section
        className="h-full w-screen cursor-pointer"
        onClick={() => close()}
      ></section>
    </div>
  );
}

export default RightSidebar;
