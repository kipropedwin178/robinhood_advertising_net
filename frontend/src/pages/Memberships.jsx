
import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";

import {
  getAvailableMembershipLevels,
  getMyMemberships,
  activateMembership,
} from "../services/membershipService";

import "./Memberships.css";

function Memberships() {
  const { showNotification, fetchAccountData } =
    useOutletContext();

  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activatingLevel, setActivatingLevel] = useState(null);
  const [confirmationLevel, setConfirmationLevel] = useState(null);

  const fetchMemberships = async () => {
    try {
      setLoading(true);
      setError("");

      const availableMemberships =
        await getAvailableMembershipLevels();

      const myMemberships = await getMyMemberships();

      const activatedLevels = new Set(
        (myMemberships || [])
          .filter((membership) => membership.is_active)
          .map((membership) => membership.level)
      );

      const membershipsWithStatus = (
        availableMemberships || []
      ).map((membership) => ({
        ...membership,
        is_activated: activatedLevels.has(membership.level),
      }));

      setMemberships(membershipsWithStatus);
    } catch (error) {
      console.error("Memberships error:", error);

      setError(
        error?.response?.data?.detail ||
          "Failed to load memberships."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemberships();
  }, []);

  const handleActivateClick = (level) => {
    setConfirmationLevel(level);
  };

  const handleCancelActivation = () => {
    if (activatingLevel !== null) {
      return;
    }

    setConfirmationLevel(null);
  };

  const handleConfirmActivation = async () => {
    if (confirmationLevel === null) {
      return;
    }

    const level = confirmationLevel;

    try {
      setActivatingLevel(level);

      const response = await activateMembership(level);

      setConfirmationLevel(null);

      showNotification(
        response?.message ||
          `Level ${level} activated successfully.`,
        "success"
      );

      await fetchMemberships();
      await fetchAccountData();
    } catch (error) {
      console.error("Membership activation error:", error);

      const errorMessage =
        error?.response?.data?.detail ||
        "Failed to activate membership.";

      setConfirmationLevel(null);

      showNotification(errorMessage, "error");
    } finally {
      setActivatingLevel(null);
    }
  };

  const formatMoney = (amount) => {
    const value = Number(amount || 0);

    return `KES ${value.toLocaleString("en-KE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  if (loading) {
    return (
      <div className="memberships-page">
        <div className="memberships-loading">
          <div className="memberships-spinner" />
          <p>Loading memberships...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="memberships-page">
      <div className="memberships-header">
        <h1>Memberships</h1>
        <p>
          Explore phone details, compare membership fees,
          and view daily rewards.
        </p>
      </div>

      {error && (
        <div className="memberships-message error">
          <p>{error}</p>
          <button type="button" onClick={fetchMemberships}>
            Retry
          </button>
        </div>
      )}

      {memberships.length === 0 && !error && (
        <div className="memberships-empty">
          <h2>No Memberships Available</h2>
          <p>
            Membership levels are currently unavailable.
          </p>
        </div>
      )}

      {memberships.length > 0 && (
        <div className="memberships-grid">
          {memberships.map((membership) => {
            const level = membership.level;
            const isActive = membership.is_activated;
            const isActivating = activatingLevel === level;

            return (
              <article
                className="membership-card"
                key={membership.id || level}
              >
                {/* COMPACT PHONE DETAILS CARD */}
                <section className="membership-product-card">
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

                  {membership.product_photo && (
                    <div className="membership-product-photo">
                      <img
                        src={membership.product_photo}
                        alt={
                          membership.product_name ||
                          `Membership Level ${level}`
                        }
                        loading="lazy"
                      />
                    </div>
                  )}

                  <div className="membership-product-content">
                    <h2>
                      {membership.product_name ||
                        `Membership Level ${level}`}
                    </h2>

                    {membership.description && (
                      <p className="membership-description">
                        {membership.description}
                      </p>
                    )}

                    <div className="membership-product-info">
                      <div className="membership-info-row">
                        <span>Phone Price</span>
                        <strong>
                          {formatMoney(membership.product_price)}
                        </strong>
                      </div>

                      {membership.release_date && (
                        <div className="membership-info-row">
                          <span>Release Date</span>
                          <strong>
                            {membership.release_date}
                          </strong>
                        </div>
                      )}
                    </div>

                    {membership.advertisement_message && (
                      <div className="membership-advertisement">
                        <h3>Advertisement</h3>
                        <p>
                          {membership.advertisement_message}
                        </p>
                      </div>
                    )}
                  </div>
                </section>

                {/* ACTIVATION FEE AND DAILY REWARDS CARD */}
                <section className="membership-rewards-card">
                  <div className="membership-rewards-heading">
                    <span className="membership-rewards-icon">
                      ★
                    </span>

                    <div>
                      <h3>Level Benefits</h3>
                      <p>
                        Review the amounts before activating
                      </p>
                    </div>
                  </div>

                  <div className="membership-benefit">
                    <span className="membership-benefit-label">
                      Activation Fee
                    </span>

                    <strong className="membership-activation-amount">
                      {formatMoney(membership.activation_fee)}
                    </strong>

                    <span className="membership-benefit-note">
                      One-time activation cost
                    </span>
                  </div>

                  <div className="membership-benefit membership-daily-benefit">
                    <span className="membership-benefit-label">
                      Daily Commission.
                    </span>

                    <strong className="membership-daily-amount">
                      {formatMoney(membership.daily_reward)}
                    </strong>

                    <span className="membership-benefit-note">
                      Per day, according to membership terms
                    </span>
                  </div>

                  {/* CYCLE DIRECTLY BELOW DAILY REWARDS */}
                  <div className="membership-cycle-row">
                    <span>Earning Cycle</span>
                    <strong>
                      {membership.cycle_days} days
                    </strong>
                  </div>
                </section>

                {/* ACTIVATION BUTTON */}
                {isActive ? (
                  <button
                    type="button"
                    className="membership-activate-button membership-activated-button"
                    disabled
                  >
                    ✓ Activated...
                  </button>
                ) : (
                  <button
                    type="button"
                    className="membership-activate-button"
                    onClick={() => handleActivateClick(level)}
                    disabled={isActivating}
                  >
                    {isActivating
                      ? "Activating..."
                      : "Activate Now"}
                  </button>
                )}
              </article>
            );
          })}
        </div>
      )}

      {/* ACTIVATION CONFIRMATION MODAL */}
      {confirmationLevel !== null && (
        <div
          className="membership-confirmation-overlay"
          onClick={handleCancelActivation}
        >
          <div
            className="membership-confirmation-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="membership-confirmation-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="membership-confirmation-icon">
              ?
            </div>

            <h2 id="membership-confirmation-title">
              Confirm Activation
            </h2>

            <p>
              Are you sure you want to activate
              <strong> Level {confirmationLevel}</strong>?
            </p>

            <p className="membership-confirmation-warning">
              The activation fee will be deducted from your
              available balance.
            </p>

            <div className="membership-confirmation-actions">
              <button
                type="button"
                className="membership-confirmation-cancel"
                onClick={handleCancelActivation}
                disabled={activatingLevel !== null}
              >
                Cancel
              </button>

              <button
                type="button"
                className="membership-confirmation-confirm"
                onClick={handleConfirmActivation}
                disabled={activatingLevel !== null}
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
