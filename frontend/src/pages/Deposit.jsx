import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";

import {
  getPaymentSettings
} from "../services/depositService";

import "./Deposit.css";


function Deposit() {

  const { showNotification } =
    useOutletContext();

  const [settings, setSettings] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [amount, setAmount] =
    useState("");

  const [phoneNumber, setPhoneNumber] =
    useState("");

  const [showManual, setShowManual] =
    useState(false);


  useEffect(() => {

    const loadSettings = async () => {

      try {

        const data =
          await getPaymentSettings();

        setSettings(data);

      } catch (error) {

        console.error(error);

        showNotification(
          "Unable to load payment settings.",
          "error"
        );

      } finally {

        setLoading(false);

      }
    };

    loadSettings();

  }, []);


  if (loading) {
    return (
      <div>
        Loading payment options...
      </div>
    );
  }


  return (
    <div className="deposit-page">

      <h1>
        Deposit Funds
      </h1>

      <div className="deposit-card">

        <h3>
         <b><i>M-PESA</i></b> 
        </h3>

        <input
          type="number"
          placeholder="Enter Amount"
          value={amount}
          onChange={(e) =>
            setAmount(e.target.value)
          }
        />

        <input
          type="text"
          placeholder="Enter Your M-Pesa No:"
          value={phoneNumber}
          onChange={(e) =>
            setPhoneNumber(
              e.target.value
            )
          }
        />

        <button
          className="deposit-pay-button"
          type="button"
        >
          Pay Now
        </button>

      </div>


      <button
        type="button"
        className="manual-toggle-button"
        onClick={() =>
          setShowManual(
            !showManual
          )
        }
      >
        {showManual
          ? "Hide Manual Payment"
          : "Show Manual Payment"}
      </button>


      {showManual && settings && (

        <div className="manual-payment-card">

          <h2>
            Manual Payment
          </h2>

          {settings.enable_till && (

            <div>

              <h3>
                Buy Goods Till
              </h3>

              <p>
                Till Number:
                {" "}
                {settings.till_number}
              </p>

            </div>

          )}

          {settings.enable_paybill && (

            <div>

              <h3>
                PayBill
              </h3>

              <p>
                PayBill:
                {" "}
                {settings.paybill_number}
              </p>

              <p>
                Account:
                {" "}
                {settings.account_number}
              </p>

            </div>

          )}

          {settings.enable_bank && (

            <div>

              <h3>
                Bank Transfer
              </h3>

              <p>
                {settings.bank_name}
              </p>

              <p>
                {settings.bank_account_number}
              </p>

            </div>

          )}

        </div>

      )}

    </div>
  );
}


export default Deposit;