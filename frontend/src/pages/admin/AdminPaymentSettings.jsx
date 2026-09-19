import {
  useEffect,
  useState
} from "react";

import api from "../../services/api";

import "./AdminPaymentSettings.css";


function AdminPaymentSettings() {

  const [formData, setFormData] = useState({
    // STK Push
    enable_stk_push: true,
    stk_business_name: "",
    stk_shortcode: "",

    // Till
    enable_till: false,
    till_name: "",
    till_number: "",

    // PayBill
    enable_paybill: false,
    paybill_name: "",
    paybill_number: "",
    paybill_account: "",

    // Bank
    enable_bank: false,
    bank_name: "",
    bank_account_name: "",
    bank_account_number: "",
    bank_branch: ""
  });


  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");


  const loadSettings = async () => {

    try {

      setLoading(true);
      setError("");

      const response =
        await api.get(
          "/api/edutech/payment-settings"
        );

      const data =
        response.data;

      setFormData({

        // STK Push
        enable_stk_push:
          data.enable_stk_push,

        stk_business_name:
          data.stk_business_name || "",

        stk_shortcode:
          data.stk_shortcode || "",


        // Till
        enable_till:
          data.enable_till,

        till_name:
          data.till_name || "",

        till_number:
          data.till_number || "",


        // PayBill
        enable_paybill:
          data.enable_paybill,

        paybill_name:
          data.paybill_name || "",

        paybill_number:
          data.paybill_number || "",

        paybill_account:
          data.paybill_account || "",


        // Bank
        enable_bank:
          data.enable_bank,

        bank_name:
          data.bank_name || "",

        bank_account_name:
          data.bank_account_name || "",

        bank_account_number:
          data.bank_account_number || "",

        bank_branch:
          data.bank_branch || ""
      });

    } catch (error) {

      console.error(
        "Payment settings loading error:",
        error
      );

      setError(
        error.response?.data?.detail ||
        "Unable to load payment settings."
      );

    } finally {

      setLoading(false);

    }
  };


  useEffect(() => {

    loadSettings();

  }, []);


  const handleChange = (
    event
  ) => {

    const {
      name,
      value,
      type,
      checked
    } = event.target;

    setFormData(
      previous => ({
        ...previous,

        [name]:
          type === "checkbox"
            ? checked
            : value
      })
    );
  };


  const handleSubmit = async (
    event
  ) => {

    event.preventDefault();

    setMessage("");
    setError("");


    if (
      !formData.enable_stk_push &&
      !formData.enable_till &&
      !formData.enable_paybill &&
      !formData.enable_bank
    ) {

      setError(
        "At least one payment method must be enabled."
      );

      return;
    }


    try {

      setSaving(true);


      const response =
        await api.put(
          "/api/edutech/payment-settings",
          formData
        );


      const data =
        response.data;


      setFormData({

        // STK Push
        enable_stk_push:
          data.enable_stk_push,

        stk_business_name:
          data.stk_business_name || "",

        stk_shortcode:
          data.stk_shortcode || "",


        // Till
        enable_till:
          data.enable_till,

        till_name:
          data.till_name || "",

        till_number:
          data.till_number || "",


        // PayBill
        enable_paybill:
          data.enable_paybill,

        paybill_name:
          data.paybill_name || "",

        paybill_number:
          data.paybill_number || "",

        paybill_account:
          data.paybill_account || "",


        // Bank
        enable_bank:
          data.enable_bank,

        bank_name:
          data.bank_name || "",

        bank_account_name:
          data.bank_account_name || "",

        bank_account_number:
          data.bank_account_number || "",

        bank_branch:
          data.bank_branch || ""
      });


      setMessage(
        "Payment settings saved successfully."
      );

    } catch (error) {

      console.error(
        "Payment settings save error:",
        error
      );

      setError(
        error.response?.data?.detail ||
        "Unable to save payment settings."
      );

    } finally {

      setSaving(false);

    }
  };


  if (loading) {

    return (

      <div className="admin-payment-settings-page">

        <div className="admin-payment-loading">

          Loading payment settings...

        </div>

      </div>

    );
  }


  return (

    <div className="admin-payment-settings-page">

      <div className="admin-payment-header">

        <div>

          <h1>
            Payment Settings
          </h1>

          <p>
            Configure the payment methods
            available to users for deposits.
          </p>

        </div>

      </div>


      {message && (

        <div className="admin-payment-success">

          {message}

        </div>

      )}


      {error && (

        <div className="admin-payment-error">

          {error}

        </div>

      )}


      <form
        className="admin-payment-form"
        onSubmit={handleSubmit}
      >


        {/* ================================================= */}
        {/* M-PESA STK PUSH */}
        {/* ================================================= */}

        <section className="admin-payment-section">

          <div className="admin-payment-section-header">

            <div>

              <h2>
                M-Pesa STK Push
              </h2>

              <p>
                Primary automated payment method.
                Users can enter their phone number
                and receive an M-Pesa payment prompt.
              </p>

            </div>


            <label className="admin-toggle">

              <input
                type="checkbox"
                name="enable_stk_push"
                checked={
                  formData.enable_stk_push
                }
                onChange={
                  handleChange
                }
              />

              <span>
                {formData.enable_stk_push
                  ? "Enabled"
                  : "Disabled"}
              </span>

            </label>

          </div>


          <div className="admin-payment-grid">

            <div className="admin-payment-field">

              <label>
                Business Name
              </label>

              <input
                type="text"
                name="stk_business_name"
                value={
                  formData.stk_business_name
                }
                onChange={
                  handleChange
                }
                placeholder="e.g. Rhobonhood"
                disabled={
                  !formData.enable_stk_push
                }
              />

            </div>


            <div className="admin-payment-field">

              <label>
                STK Shortcode
              </label>

              <input
                type="text"
                name="stk_shortcode"
                value={
                  formData.stk_shortcode
                }
                onChange={
                  handleChange
                }
                placeholder="e.g. 174379"
                disabled={
                  !formData.enable_stk_push
                }
              />

            </div>

          </div>

        </section>


        {/* ================================================= */}
        {/* BUY GOODS TILL */}
        {/* ================================================= */}

        <section className="admin-payment-section">

          <div className="admin-payment-section-header">

            <div>

              <h2>
                Buy Goods Till
              </h2>

              <p>
                Manual M-Pesa payment option.
                Users can pay directly to the
                configured Till Number.
              </p>

            </div>


            <label className="admin-toggle">

              <input
                type="checkbox"
                name="enable_till"
                checked={
                  formData.enable_till
                }
                onChange={
                  handleChange
                }
              />

              <span>
                {formData.enable_till
                  ? "Enabled"
                  : "Disabled"}
              </span>

            </label>

          </div>


          <div className="admin-payment-grid">

            <div className="admin-payment-field">

              <label>
                Till Name
              </label>

              <input
                type="text"
                name="till_name"
                value={
                  formData.till_name
                }
                onChange={
                  handleChange
                }
                placeholder="Business name"
                disabled={
                  !formData.enable_till
                }
              />

            </div>


            <div className="admin-payment-field">

              <label>
                Till Number
              </label>

              <input
                type="text"
                name="till_number"
                value={
                  formData.till_number
                }
                onChange={
                  handleChange
                }
                placeholder="Till number"
                disabled={
                  !formData.enable_till
                }
              />

            </div>

          </div>

        </section>


        {/* ================================================= */}
        {/* PAYBILL */}
        {/* ================================================= */}

        <section className="admin-payment-section">

          <div className="admin-payment-section-header">

            <div>

              <h2>
                PayBill
              </h2>

              <p>
                Configure a PayBill number and
                account reference for manual deposits.
              </p>

            </div>


            <label className="admin-toggle">

              <input
                type="checkbox"
                name="enable_paybill"
                checked={
                  formData.enable_paybill
                }
                onChange={
                  handleChange
                }
              />

              <span>
                {formData.enable_paybill
                  ? "Enabled"
                  : "Disabled"}
              </span>

            </label>

          </div>


          <div className="admin-payment-grid">

            <div className="admin-payment-field">

              <label>
                PayBill Name
              </label>

              <input
                type="text"
                name="paybill_name"
                value={
                  formData.paybill_name
                }
                onChange={
                  handleChange
                }
                placeholder="Business name"
                disabled={
                  !formData.enable_paybill
                }
              />

            </div>


            <div className="admin-payment-field">

              <label>
                PayBill Number
              </label>

              <input
                type="text"
                name="paybill_number"
                value={
                  formData.paybill_number
                }
                onChange={
                  handleChange
                }
                placeholder="PayBill number"
                disabled={
                  !formData.enable_paybill
                }
              />

            </div>


            <div className="admin-payment-field">

              <label>
                Account Number
              </label>

              <input
                type="text"
                name="paybill_account"
                value={
                  formData.paybill_account
                }
                onChange={
                  handleChange
                }
                placeholder="Account or reference"
                disabled={
                  !formData.enable_paybill
                }
              />

            </div>

          </div>

        </section>


        {/* ================================================= */}
        {/* BANK TRANSFER */}
        {/* ================================================= */}

        <section className="admin-payment-section">

          <div className="admin-payment-section-header">

            <div>

              <h2>
                Bank Transfer
              </h2>

              <p>
                Configure the bank account users
                can use for manual deposits.
              </p>

            </div>


            <label className="admin-toggle">

              <input
                type="checkbox"
                name="enable_bank"
                checked={
                  formData.enable_bank
                }
                onChange={
                  handleChange
                }
              />

              <span>
                {formData.enable_bank
                  ? "Enabled"
                  : "Disabled"}
              </span>

            </label>

          </div>


          <div className="admin-payment-grid">

            <div className="admin-payment-field">

              <label>
                Bank Name
              </label>

              <input
                type="text"
                name="bank_name"
                value={
                  formData.bank_name
                }
                onChange={
                  handleChange
                }
                placeholder="Bank name"
                disabled={
                  !formData.enable_bank
                }
              />

            </div>


            <div className="admin-payment-field">

              <label>
                Account Name
              </label>

              <input
                type="text"
                name="bank_account_name"
                value={
                  formData.bank_account_name
                }
                onChange={
                  handleChange
                }
                placeholder="Account name"
                disabled={
                  !formData.enable_bank
                }
              />

            </div>


            <div className="admin-payment-field">

              <label>
                Account Number
              </label>

              <input
                type="text"
                name="bank_account_number"
                value={
                  formData.bank_account_number
                }
                onChange={
                  handleChange
                }
                placeholder="Account number"
                disabled={
                  !formData.enable_bank
                }
              />

            </div>


            <div className="admin-payment-field">

              <label>
                Branch
              </label>

              <input
                type="text"
                name="bank_branch"
                value={
                  formData.bank_branch
                }
                onChange={
                  handleChange
                }
                placeholder="Bank branch"
                disabled={
                  !formData.enable_bank
                }
              />

            </div>

          </div>

        </section>


        {/* ================================================= */}
        {/* SAVE */}
        {/* ================================================= */}

        <div className="admin-payment-actions">

          <button
            type="submit"
            className="admin-payment-save-button"
            disabled={saving}
          >

            {saving
              ? "Saving..."
              : "Save Payment Settings"}

          </button>

        </div>


      </form>

    </div>

  );
}


export default AdminPaymentSettings;