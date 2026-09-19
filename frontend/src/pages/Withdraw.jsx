import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";

import { getMyWallet } from "../services/walletService";
import { createWithdrawal } from "../services/withdrawalService";

import "./Withdraw.css";


function Withdraw() {

  const {
    showNotification,
    fetchAccountData,
  } = useOutletContext();

  const [wallet, setWallet] =
    useState(null);

  const [amount, setAmount] =
    useState("");

  const [phoneNumber, setPhoneNumber] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);


  useEffect(() => {

    const loadWallet = async () => {

      try {

        const data =
          await getMyWallet();

        setWallet(data);

      } catch (error) {

        console.error(error);

        showNotification(
          "Unable to load wallet balance.",
          "error"
        );

      } finally {

        setLoading(false);

      }
    };

    loadWallet();

  }, []);


  const handleWithdrawal = async () => {

    const withdrawalAmount =
      Number(amount);

    if (!amount || withdrawalAmount <= 0) {

      showNotification(
        "Please enter a valid withdrawal amount.",
        "error"
      );

      return;
    }


    if (withdrawalAmount < 10) {

      showNotification(
        "Minimum withdrawal amount is KES 10.00.",
        "error"
      );

      return;
    }


    if (
      wallet &&
      withdrawalAmount >
        Number(wallet.balance)
    ) {

      showNotification(
        `Insufficient wallet balance. Available balance: KES ${Number(
          wallet.balance
        ).toFixed(2)}`,
        "error"
      );

      return;
    }


    if (!phoneNumber.trim()) {

      showNotification(
        "Please enter your M-Pesa phone number.",
        "error"
      );

      return;
    }


    if (
      phoneNumber.trim().length < 10 ||
      phoneNumber.trim().length > 15
    ) {

      showNotification(
        "Please enter a valid M-Pesa phone number.",
        "error"
      );

      return;
    }


    try {

      setSubmitting(true);

      await createWithdrawal({
        amount: withdrawalAmount,
        phone_number:
          phoneNumber.trim(),
        payment_method: "MPESA",
      });


      showNotification(
        "Withdrawal request submitted successfully.",
        "success"
      );


      setAmount("");
      setPhoneNumber("");


      const updatedWallet =
        await getMyWallet();

      setWallet(updatedWallet);


      if (fetchAccountData) {
        await fetchAccountData();
      }

    } catch (error) {

      console.error(error);

      const message =
        error?.response?.data?.detail ||
        "Withdrawal request failed. Please try again.";

      showNotification(
        message,
        "error"
      );

    } finally {

      setSubmitting(false);

    }

  };


  if (loading) {

    return (
      <div>
        Loading wallet...
      </div>
    );

  }


  return (
    <div className="withdraw-page">

      <h1>
        Withdraw Funds
      </h1>


      <div className="withdraw-card">

        <h3>
          <b>
            <i>M-PESA</i>
          </b>
        </h3>


        <div className="withdraw-balance">

          Available Balance:
          {" "}

          <strong>
            KES{" "}
            {Number(
              wallet?.balance || 0
            ).toFixed(2)}
          </strong>

        </div>


        <input
          type="number"
          min="10"
          step="0.01"
          placeholder="Enter Amount"
          value={amount}
          onChange={(e) =>
            setAmount(
              e.target.value
            )
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


        <p className="withdraw-info">
          Minimum withdrawal:
          {" "}
          <strong>
            KES 10.00
          </strong>
        </p>


        <button
          className="withdraw-button"
          type="button"
          onClick={handleWithdrawal}
          disabled={submitting}
        >

          {submitting
            ? "Processing..."
            : "Withdraw Now"}

        </button>

      </div>

    </div>
  );

}


export default Withdraw;