import { MODAL_BODY_TYPES } from "../utils/globalConstantUtil";
import { useSelector, useDispatch } from "react-redux";
import { closeModal } from "../features/common/modalSlice";
import AddLeadModalBody from "../features/leads/components/AddLeadModalBody";
import ConfirmationModalBody from "../features/common/components/ConfirmationModalBody";
import WarningLetterDetailModalBody from "../features/warningLetters/components/WarningLetterDetailModalBody";

function ModalLayout() {
  const { isOpen, bodyType, size, extraObject, title } = useSelector(
    (state) => state.modal,
  );
  const dispatch = useDispatch();

  const close = (e) => {
    dispatch(closeModal(e));
  };

  return (
    <>
      {/* The button to open modal */}

      {/* Put this part before </body> tag */}
      <div className={`modal ${isOpen ? "modal-open" : ""}`}>
        <div
          className={`modal-box app-card ${size === "lg" ? "max-w-5xl" : ""}`}
        >
          <button
            className="btn btn-sm btn-circle absolute right-4 top-4 border-base-300 bg-base-100/90 shadow-sm hover:bg-primary hover:text-primary-content"
            onClick={() => close()}
          >
            ✕
          </button>
          <h3 className="font-display text-center text-2xl font-semibold pb-6">
            {title}
          </h3>

          {/* Loading modal body according to different modal type */}
          {
            {
              [MODAL_BODY_TYPES.LEAD_ADD_NEW]: (
                <AddLeadModalBody
                  closeModal={close}
                  extraObject={extraObject}
                />
              ),
              [MODAL_BODY_TYPES.CONFIRMATION]: (
                <ConfirmationModalBody
                  extraObject={extraObject}
                  closeModal={close}
                />
              ),
              [MODAL_BODY_TYPES.WARNING_LETTER_DETAIL]: (
                <WarningLetterDetailModalBody
                  extraObject={extraObject}
                  closeModal={close}
                />
              ),
              [MODAL_BODY_TYPES.DEFAULT]: <div></div>,
            }[bodyType]
          }
        </div>
      </div>
    </>
  );
}

export default ModalLayout;
