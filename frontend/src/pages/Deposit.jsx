
import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";

import {
  getPaymentSettings,
  createDeposit,
} from "../services/depositService";

import "./Deposit.css";

function Deposit() {
  const { showNotification } = useOutletContext();

  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showOtherMethods, setShowOtherMethods] = useState(false);

  const [amount, setAmount] = useState("");
  const [confirmationCode, setConfirmationCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await getPaymentSettings();
        setSettings(data);
      } catch (error) {
        console.error(error);
        showNotification("Unable to load payment settings.", "error");
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const copyNumber = async () => {
    const number = settings?.send_money_number;

    if (!number) {
      showNotification("The recipient's number is not configured.", "error");
      return;
    }

    try {
      await navigator.clipboard.writeText(number);
      showNotification("M-PESA number copied successfully.", "success");
    } catch (error) {
      console.error(error);
      showNotification(
        "Unable to copy the number. Please copy it manually.",
        "error"
      );
    }
  };

  const handleDepositSubmit = async (event) => {
    event.preventDefault();
    setFormMessage(null);

    const parsedAmount = Number(amount);
    const code = confirmationCode.trim().toUpperCase();

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setFormMessage({
        type: "error",
        text: "Enter a valid deposit amount.",
      });
      return;
    }

    if (!/^[A-Z0-9]{5,20}$/.test(code)) {
      setFormMessage({
        type: "error",
        text: "Enter a valid M-PESA confirmation code (5–20 letters or numbers).",
      });
      return;
    }

    setSubmitting(true);

    try {
      const result = await createDeposit({
        amount: parsedAmount.toFixed(2),
        payment_method: "MPESA",
        mpesa_confirmation_code: code,
      });

      setFormMessage({
        type: "success",
        text: `${result.message} Deposit reference: #${result.deposit_id}.`,
      });

      setAmount("");
      setConfirmationCode("");
      showNotification(
        "Deposit submitted and notification email sent.",
        "success"
      );
    } catch (error) {
      const message =
        error.response?.data?.detail ||
        "Unable to submit the deposit. Please try again.";

      setFormMessage({
        type: "error",
        text: message,
      });

      showNotification(message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="deposit-page">
        <p className="deposit-loading">Loading payment options...</p>
      </div>
    );
  }

  const sendMoneyEnabled = settings?.enable_send_money;

  return (
    <div className="deposit-page">
      <div className="deposit-header">
        <div>
          <h1>Deposit Funds</h1>
          <p>Fund your account using the available payment methods.</p>
        </div>
      </div>

      {sendMoneyEnabled ? (
        <section className="deposit-card">
          <div className="deposit-card-heading">
            <div className="mpesa-mark">M</div>
            <div>
              <h2>M-PESA Send Money</h2>
              <p>Manual deposit</p>
            </div>
            <span className="payment-status">Available</span>
          </div>

          <div className="send-money-details">
            <div className="recipient-detail">
              <span>Recipient name</span>
              <strong>
                {settings.send_money_name || "Not configured"}
              </strong>
            </div>

            <div className="recipient-detail recipient-number-row">
              <div>
                <span>Recipient mobile number</span>
                <strong className="send-money-number">
                  {settings.send_money_number || "Not configured"}
                </strong>
              </div>

              <button
                type="button"
                className="copy-number-button"
                onClick={copyNumber}
                disabled={!settings.send_money_number}
              >
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="copy-icon"
                >
                  <rect
                    x="8"
                    y="8"
                    width="12"
                    height="12"
                    rx="2"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />
                  <path
                    d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />
                </svg>
                Copy Number
              </button>
            </div>
          </div>

          <div className="deposit-notice">
            <span className="notice-icon" aria-hidden="true">i</span>
            <p>Keep your M-PESA confirmation message as proof of payment.</p>
          </div>

          <div className="deposit-submission-section">
            <h3>Confirm Your Payment</h3>
            <p className="deposit-submission-description">
              After sending money, enter the exact amount and confirmation
              code from your M-PESA message.
            </p>

            <form className="deposit-form" onSubmit={handleDepositSubmit}>
              <div className="deposit-form-group">
                <label htmlFor="deposit-amount">Amount (KES)</label>
                <input
                  id="deposit-amount"
                  className="deposit-form-input"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  placeholder="e.g. 100"
                  required
                  disabled={submitting}
                />
              </div>

              <div className="deposit-form-group">
                <label htmlFor="mpesa-confirmation-code">
                  M-PESA Confirmation Code
                </label>
                <input
                  id="mpesa-confirmation-code"
                  className="deposit-form-input"
                  type="text"
                  minLength="5"
                  maxLength="20"
                  autoCapitalize="characters"
                  autoComplete="off"
                  spellCheck="false"
                  value={confirmationCode}
                  onChange={(event) =>
                    setConfirmationCode(
                      event.target.value.toUpperCase().replace(/\s/g, "")
                    )
                  }
                  placeholder="e.g. QWE123ABC"
                  required
                  disabled={submitting}
                />
                <p className="deposit-form-help">
                  Use the transaction code in your M-PESA confirmation message.
                  Each code can only be submitted once.
                </p>
              </div>

              {formMessage && (
                <p
                  className={`deposit-form-message ${formMessage.type}`}
                  role="status"
                >
                  {formMessage.text}
                </p>
              )}

              <button
                type="submit"
                className="deposit-submit-button"
                disabled={submitting || !settings.send_money_number}
              >
                {submitting ? "Submitting..." : "Submit Deposit for Verification"}
              </button>
            </form>

            <div className="deposit-pending-note">
              <p>
                Your deposit remains pending until an administrator verifies
                and approves the payment.
              </p>
            </div>
          </div>
        </section>
      ) : (
        <section className="deposit-card payment-unavailable">
          <h2>M-PESA Send Money</h2>
          <p>
            This payment method is currently unavailable. Please contact
            support for assistance.
          </p>
        </section>
      )}

      {(
        settings?.enable_stk_push ||
        settings?.enable_till ||
        settings?.enable_paybill ||
        settings?.enable_bank
      ) && (
        <>
          <button
            type="button"
            className="manual-toggle-button"
            onClick={() => setShowOtherMethods((previous) => !previous)}
            aria-expanded={showOtherMethods}
          >
            <span>Other Payment Methods</span>
            <span
              className={`toggle-chevron ${
                showOtherMethods ? "expanded" : ""
              }`}
            >
              &#9662;
            </span>
          </button>

          {showOtherMethods && (
            <section className="manual-payment-card">
              <h2>Available Alternatives</h2>

              {settings.enable_stk_push && (
                <div className="alternative-method">
                  <h3>M-PESA STK Push</h3>
                  <p>
                    Business name: {settings.stk_business_name || "Not configured"}
                  </p>
                  <p>
                    Shortcode: {settings.stk_shortcode || "Not configured"}
                  </p>
                  <p className="method-note">
                    STK Push payments are not initiated from this page.
                  </p>
                </div>
              )}

              {settings.enable_till && (
                <div className="alternative-method">
                  <h3>Buy Goods Till</h3>
                  <p>Business name: {settings.till_name || "Not configured"}</p>
                  <p>Till number: {settings.till_number || "Not configured"}</p>
                </div>
              )}

              {settings.enable_paybill && (
                <div className="alternative-method">
                  <h3>PayBill</h3>
                  <p>Business name: {settings.paybill_name || "Not configured"}</p>
                  <p>PayBill number: {settings.paybill_number || "Not configured"}</p>
                  <p>Account: {settings.paybill_account || "Not configured"}</p>
                </div>
              )}

              {settings.enable_bank && (
                <div className="alternative-method">
                  <h3>Bank Transfer</h3>
                  <p>Bank: {settings.bank_name || "Not configured"}</p>
                  <p>
                    Account name: {settings.bank_account_name || "Not configured"}
                  </p>
                  <p>
                    Account number: {settings.bank_account_number || "Not configured"}
                  </p>
                  <p>Branch: {settings.bank_branch || "Not configured"}</p>
                </div>
              )}
            </section>
          )}
        </>
      )}
    </div>
  );
}

export default Deposit;