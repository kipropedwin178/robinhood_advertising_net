import {
  useEffect,
  useState
} from "react";

import {
  useOutletContext
} from "react-router-dom";

import {
  getMyMemberships
} from "../services/membershipService";

import {
  getAdvertisement,
  startAdvertisement,
  completeTask
} from "../services/taskService";

import "./Tasks.css";


function Tasks() {

  const {
    showNotification
  } = useOutletContext();


  const [memberships, setMemberships] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [selectedTask, setSelectedTask] =
    useState(null);

  const [error, setError] =
    useState("");

  const [advertising, setAdvertising] =
    useState(false);

  const [completing, setCompleting] =
    useState(false);


  // =====================================================
  // LOAD MEMBERSHIPS
  // =====================================================

  const loadMemberships = async () => {

    try {

      setLoading(true);
      setError("");

      const data =
        await getMyMemberships();

      const activeMemberships =
        data.filter(
          membership =>
            membership.is_active
        );

      setMemberships(
        activeMemberships
      );

    } catch (error) {

      console.error(
        "Tasks loading error:",
        error
      );

      const errorMessage =
        error.response?.data?.detail ||
        "Unable to load tasks.";

      setError(errorMessage);

      showNotification(
        errorMessage,
        "error"
      );

    } finally {

      setLoading(false);

    }
  };


  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {

    loadMemberships();

  }, []);


  // =====================================================
  // VIEW ADVERTISEMENT
  // =====================================================

  const handleAdvertise = async (
    membershipId
  ) => {

    try {

      setError("");

      const data =
        await getAdvertisement(
          membershipId
        );

      setSelectedTask(data);

    } catch (error) {

      console.error(
        "Advertisement loading error:",
        error
      );

      const errorMessage =
        error.response?.data?.detail ||
        "Unable to load advertisement.";

      setError(errorMessage);

      showNotification(
        errorMessage,
        "error"
      );

    }
  };


  // =====================================================
  // COPY MESSAGE
  // =====================================================

  const handleCopyMessage = async () => {

    if (!selectedTask) {
      return;
    }

    try {

      await navigator.clipboard.writeText(
        selectedTask.message
      );

      showNotification(
        "Advertisement copied successfully.",
        "success"
      );

    } catch (error) {

      console.error(
        "Copy error:",
        error
      );

      showNotification(
        "Unable to copy advertisement.",
        "error"
      );

    }
  };


  // =====================================================
  // ADVERTISE NOW
  // =====================================================

  const handleAdvertiseNow = async () => {

    if (!selectedTask) {
      return;
    }

    if (
      selectedTask.task_completed_today
    ) {
      return;
    }

    if (
      selectedTask.task_started
    ) {

      window.open(
        selectedTask.advertisement_link,
        "_blank",
        "noopener,noreferrer"
      );

      showNotification(
        "Advertisement already started. Share it on WhatsApp, then complete the task.",
        "success"
      );

      return;
    }


    try {

      setAdvertising(true);
      setError("");


      // -------------------------------------------------
      // START TASK ON BACKEND
      // -------------------------------------------------

      const result =
        await startAdvertisement(
          selectedTask.membership_id
        );


      // -------------------------------------------------
      // UPDATE LOCAL TASK STATE
      // -------------------------------------------------

      setSelectedTask(
        previous => ({
          ...previous,

          task_started:
            result.task_started ?? true,

          task_completed_today:
            result.task_completed_today ?? false
        })
      );


      // -------------------------------------------------
      // OPEN WHATSAPP
      // -------------------------------------------------

      window.open(
        selectedTask.advertisement_link,
        "_blank",
        "noopener,noreferrer"
      );


      showNotification(
        "Advertisement started. Share it on WhatsApp, then complete the task.",
        "success"
      );

    } catch (error) {

      console.error(
        "Advertisement start error:",
        error
      );

      const errorMessage =
        error.response?.data?.detail ||
        "Unable to start advertisement.";

      setError(errorMessage);

      showNotification(
        errorMessage,
        "error"
      );

    } finally {

      setAdvertising(false);

    }
  };


  // =====================================================
  // COMPLETE TASK
  // =====================================================

  const handleCompleteTask = async () => {

    if (!selectedTask) {
      return;
    }


    if (
      selectedTask.task_completed_today
    ) {
      return;
    }


    if (
      !selectedTask.task_started
    ) {

      const message =
        "Please click Advertise Now first.";

      setError(message);

      showNotification(
        message,
        "warning"
      );

      return;
    }


    try {

      setCompleting(true);
      setError("");


      const result =
        await completeTask(
          selectedTask.membership_id
        );


      // -------------------------------------------------
      // UPDATE SELECTED TASK
      // -------------------------------------------------

      setSelectedTask(
        previous => ({
          ...previous,
          task_completed_today: true
        })
      );


      showNotification(
        `Task completed successfully. Reward: KES ${Number(
          result.reward
        ).toFixed(2)}`,
        "success"
      );


      // -------------------------------------------------
      // UPDATE WALLET INFORMATION
      // -------------------------------------------------

      window.dispatchEvent(
        new Event("walletUpdated")
      );


      // -------------------------------------------------
      // REFRESH MEMBERSHIPS
      // -------------------------------------------------

      await loadMemberships();

    } catch (error) {

      console.error(
        "Task completion error:",
        error
      );

      const errorMessage =
        error.response?.data?.detail ||
        "Task completion failed.";

      setError(errorMessage);

      showNotification(
        errorMessage,
        "error"
      );

    } finally {

      setCompleting(false);

    }
  };


  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {

    return (
      <div className="tasks-loading">
        Loading tasks...
      </div>
    );

  }


  // =====================================================
  // PAGE
  // =====================================================

  return (

    <div className="tasks-page">


      {/* =================================================
          HEADER
      ================================================= */}

      <div className="tasks-header">

        <h1>
          Daily Tasks
        </h1>

        <p>
          Complete daily advertisements
          and earn rewards.
        </p>

      </div>


      {/* =================================================
          ERROR
      ================================================= */}

      {error && (

        <div className="tasks-error">
          {error}
        </div>

      )}


      {/* =================================================
          TASK CARDS
      ================================================= */}

      <div className="tasks-grid">

        {memberships.map(
          membership => (

            <div
              key={membership.id}
              className="task-card"
            >

              <div className="task-level">
                Level {membership.level}
              </div>

              <h3>
                {membership.name}
              </h3>

              <p>
                Daily Reward:
                {" "}
                <strong>
                  KES{" "}
                  {Number(
                    membership.daily_reward
                  ).toFixed(2)}
                </strong>
              </p>

              <button
                type="button"
                className="task-button"
                onClick={() =>
                  handleAdvertise(
                    membership.id
                  )
                }
              >
                View Advertisement
              </button>

            </div>

          )
        )}

      </div>


      {/* =================================================
          ADVERTISEMENT PANEL
      ================================================= */}

      {selectedTask && (

        <div className="advertisement-panel">


          {/* =================================================
              HEADER
          ================================================= */}

          <div className="advertisement-header">

            <h2>
              {selectedTask.product_name}
            </h2>

            <span>
              Level{" "}
              {selectedTask.level}
            </span>

          </div>


          {/* =================================================
              PRODUCT IMAGE
          ================================================= */}

          {selectedTask.product_photo && (

            <img
              src={
                selectedTask.product_photo
              }
              alt={
                selectedTask.product_name
              }
              className="advertisement-image"
            />

          )}


          {/* =================================================
              PRODUCT INFORMATION
          ================================================= */}

          <div className="advertisement-info">

            <p>

              <strong>
                Price:
              </strong>

              {" "}

              KES{" "}
              {Number(
                selectedTask.product_price
              ).toLocaleString()}

            </p>


            <p>

              <strong>
                Release:
              </strong>

              {" "}

              {selectedTask.release_status}

            </p>


            <p>
              {selectedTask.description}
            </p>

          </div>


          {/* =================================================
              ADVERTISEMENT MESSAGE
          ================================================= */}

          <textarea
            readOnly
            value={
              selectedTask.message
            }
            className="advertisement-message"
          />


          {/* =================================================
              ACTIONS
          ================================================= */}

          <div className="advertisement-actions">


            {/* =================================================
                COPY MESSAGE
            ================================================= */}

            <button
              type="button"
              className="copy-button"
              onClick={
                handleCopyMessage
              }
            >
              Copy Message
            </button>


            {/* =================================================
                ADVERTISE NOW
            ================================================= */}

            {selectedTask.task_completed_today ? (

              <button
                type="button"
                disabled
                className="completed-button"
              >
                Completed Today
              </button>

            ) : (

              <button
                type="button"
                className="advertise-button"
                onClick={
                  handleAdvertiseNow
                }
                disabled={
                  advertising
                }
              >

                {advertising
                  ? "Opening WhatsApp..."
                  : selectedTask.task_started
                    ? "Open WhatsApp Again"
                    : "Advertise Now"}

              </button>

            )}


            {/* =================================================
                COMPLETE TASK
            ================================================= */}

            {selectedTask.task_completed_today ? (

              <button
                type="button"
                disabled
                className="completed-button"
              >
                ✓ Completed Today
              </button>

            ) : (

              <button
                type="button"
                onClick={
                  handleCompleteTask
                }
                className="complete-button"
                disabled={
                  !selectedTask.task_started ||
                  completing
                }
              >

                {completing
                  ? "Processing Reward..."
                  : selectedTask.task_started
                    ? "Complete Task"
                    : "Advertise First"}

              </button>

            )}

          </div>


          {/* =================================================
              INSTRUCTION
          ================================================= */}

          {!selectedTask.task_completed_today && (

            <p className="task-instruction">

              {selectedTask.task_started
                ? "WhatsApp opened. Share the advertisement, then click Complete Task."
                : "Click Advertise Now to open WhatsApp and unlock the Complete Task button."}

            </p>

          )}

        </div>

      )}

    </div>
  );
}


export default Tasks;