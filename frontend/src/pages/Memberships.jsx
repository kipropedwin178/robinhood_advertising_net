import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";

import {
  getAvailableMembershipLevels,
  getMyMemberships,
  activateMembership
} from "../services/membershipService";

import "./Memberships.css";


function Memberships() {

  const {
    showNotification,
    fetchAccountData
  } = useOutletContext();


  const [memberships, setMemberships] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [activatingLevel, setActivatingLevel] =
    useState(null);

  const [confirmationLevel, setConfirmationLevel] =
    useState(null);


  // =========================================================
  // LOAD AVAILABLE MEMBERSHIPS
  // =========================================================

  const fetchMemberships = async () => {

    try {

      setLoading(true);
      setError("");


      // Get all membership levels created by admin
      const availableMemberships =
        await getAvailableMembershipLevels();


      // Get memberships already activated by this user
      const myMemberships =
        await getMyMemberships();


      const activatedLevels = new Set(
        (myMemberships || [])
          .filter(
            membership =>
              membership.is_active
          )
          .map(
            membership =>
              membership.level
          )
      );


      // Combine available memberships with
      // the user's activation status
      const membershipsWithStatus =
        (availableMemberships || []).map(
          membership => ({
            ...membership,

            is_activated:
              activatedLevels.has(
                membership.level
              )
          })
        );


      setMemberships(
        membershipsWithStatus
      );

    } catch (error) {

      console.error(
        "Memberships error:",
        error
      );


      const errorMessage =
        error?.response?.data?.detail ||
        "Failed to load memberships.";


      setError(errorMessage);

    } finally {

      setLoading(false);

    }

  };


  useEffect(() => {

    fetchMemberships();

  }, []);


  // =========================================================
  // OPEN CONFIRMATION
  // =========================================================

  const handleActivateClick = (
    level
  ) => {

    setConfirmationLevel(level);

  };


  // =========================================================
  // CANCEL CONFIRMATION
  // =========================================================

  const handleCancelActivation = () => {

    if (
      activatingLevel !== null
    ) {

      return;

    }

    setConfirmationLevel(null);

  };


  // =========================================================
  // CONFIRM ACTIVATION
  // =========================================================

  const handleConfirmActivation =
    async () => {

      if (
        confirmationLevel === null
      ) {

        return;

      }


      const level =
        confirmationLevel;


      try {

        setActivatingLevel(level);


        const response =
          await activateMembership(
            level
          );


        setConfirmationLevel(null);


        showNotification(
          response?.message ||
          `Level ${level} activated successfully.`,
          "success"
        );


        // Refresh memberships so the
        // newly activated level shows
        // "Activated"
        await fetchMemberships();


        // Refresh wallet/dashboard data
        await fetchAccountData();

      } catch (error) {

        console.error(
          "Membership activation error:",
          error
        );


        const errorMessage =
          error?.response?.data?.detail ||
          "Failed to activate membership.";


        setConfirmationLevel(null);


        showNotification(
          errorMessage,
          "error"
        );

      } finally {

        setActivatingLevel(null);

      }

    };


  // =========================================================
  // FORMAT MONEY
  // =========================================================

  const formatMoney = (
    amount
  ) => {

    const value =
      Number(amount || 0);


    return `KES ${value.toLocaleString(
      "en-KE",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }
    )}`;

  };


  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {

    return (

      <div className="memberships-page">

        <div className="memberships-loading">

          <div className="memberships-spinner"></div>

          <p>
            Loading memberships...
          </p>

        </div>

      </div>

    );

  }


  // =========================================================
  // PAGE
  // =========================================================

  return (

    <div className="memberships-page">


      <div className="memberships-header">

        <h1>
          Memberships
        </h1>

        <p>
          Choose a membership level and
          start earning daily rewards.
        </p>

      </div>


      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (

        <div className="memberships-message error">

          <p>
            {error}
          </p>

          <button
            type="button"
            onClick={fetchMemberships}
          >
            Retry
          </button>

        </div>

      )}


      {/* =====================================================
          NO MEMBERSHIPS
      ===================================================== */}

      {memberships.length === 0 &&
        !error && (

          <div className="memberships-empty">

            <h2>
              No Memberships Available
            </h2>

            <p>
              Membership levels are currently
              unavailable.
            </p>

          </div>

        )}


      {/* =====================================================
          MEMBERSHIP GRID
      ===================================================== */}

      {memberships.length > 0 && (

        <div className="memberships-grid">

          {memberships.map(
            (membership) => {

              const level =
                membership.level;


              const isActive =
                membership.is_activated;


              const isActivating =
                activatingLevel === level;


              return (

                <div
                  className="membership-card"
                  key={
                    membership.id ||
                    level
                  }
                >


                  {/* =========================================
                      CARD TOP
                  ========================================= */}

                  <div className="membership-card-top">

                    <span className="membership-level">

                      Level {level}

                    </span>


                    {isActive && (

                      <span className="membership-active activated">

                        Active

                      </span>

                    )}

                  </div>


                  {/* =========================================
                      PRODUCT PHOTO
                  ========================================= */}

                  {membership.product_photo && (

                    <div className="membership-product-photo">

                      <img
                        src={
                          membership.product_photo
                        }
                        alt={
                          membership.product_name ||
                          `Membership Level ${level}`
                        }
                      />

                    </div>

                  )}


                  {/* =========================================
                      PRODUCT NAME
                  ========================================= */}

                  <h2>
                    {membership.product_name}
                  </h2>


                  {/* =========================================
                      DESCRIPTION
                  ========================================= */}

                  <p className="membership-description">

                    {membership.description}

                  </p>


                  {/* =========================================
                      MEMBERSHIP INFORMATION
                  ========================================= */}

                  <div className="membership-info">


                    <div className="membership-info-row">

                      <span>
                        Product Price
                      </span>

                      <strong>
                        {formatMoney(
                          membership.product_price
                        )}
                      </strong>

                    </div>


                    <div className="membership-info-row">

                      <span>
                        Activation Fee
                      </span>

                      <strong>
                        {formatMoney(
                          membership.activation_fee
                        )}
                      </strong>

                    </div>


                    <div className="membership-info-row">

                      <span>
                        Daily Reward
                      </span>

                      <strong className="reward">

                        {formatMoney(
                          membership.daily_reward
                        )}

                      </strong>

                    </div>


                    <div className="membership-info-row">

                      <span>
                        Cycle
                      </span>

                      <strong>

                        {membership.cycle_days}
                        {" "}
                        days

                      </strong>

                    </div>


                    <div className="membership-info-row">

                      <span>
                        Release Date
                      </span>

                      <strong>

                        {membership.release_date}

                      </strong>

                    </div>

                  </div>


                  {/* =========================================
                      ADVERTISEMENT
                  ========================================= */}

                  {membership.advertisement_message && (

                    <div className="membership-advertisement">

                      <h3>
                        Advertisement
                      </h3>

                      <p>
                        {membership.advertisement_message}
                      </p>

                    </div>

                  )}


                  {/* =========================================
                      ACTIVATION BUTTON
                  ========================================= */}

                  {isActive ? (

                    <button
                      type="button"
                      className="
                        membership-activate-button
                        membership-activated-button
                      "
                      disabled
                    >

                      Activated

                    </button>

                  ) : (

                    <button
                      type="button"
                      className="membership-activate-button"
                      onClick={() =>
                        handleActivateClick(
                          level
                        )
                      }
                      disabled={
                        isActivating
                      }
                    >

                      {isActivating
                        ? "Activating..."
                        : "Activate Now"}

                    </button>

                  )}

                </div>

              );

            }
          )}

        </div>

      )}


      {/* =====================================================
          CONFIRMATION MODAL
      ===================================================== */}

      {confirmationLevel !== null && (

        <div
          className="membership-confirmation-overlay"
          onClick={
            handleCancelActivation
          }
        >

          <div
            className="membership-confirmation-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >


            <div className="membership-confirmation-icon">

              ?

            </div>


            <h2>
              Confirm Activation
            </h2>


            <p>

              Are you sure you want to
              activate

              <strong>
                {" "}
                Level {confirmationLevel}
              </strong>
              ?

            </p>


            <p className="membership-confirmation-warning">

              The activation fee will be
              deducted from your available
              balance.

            </p>


            <div className="membership-confirmation-actions">


              <button
                type="button"
                className="membership-confirmation-cancel"
                onClick={
                  handleCancelActivation
                }
                disabled={
                  activatingLevel !== null
                }
              >

                Cancel

              </button>


              <button
                type="button"
                className="membership-confirmation-confirm"
                onClick={
                  handleConfirmActivation
                }
                disabled={
                  activatingLevel !== null
                }
              >

                {activatingLevel !== null
                  ? "Activating..."
                  : "Confirm Activation"}

              </button>


            </div>

          </div>

        </div>

      )}

    </div>

  );

}


export default Memberships;