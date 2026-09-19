import { useEffect, useState } from "react";

import {
  getMyTransactions
} from "../services/transactionService";

import "./History.css";


function History() {

  const [transactions, setTransactions] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  const loadTransactions = async () => {

    try {

      setLoading(true);
      setError("");

      const data =
        await getMyTransactions();

      setTransactions(
        data || []
      );

    } catch (error) {

      console.error(
        "Transaction history error:",
        error
      );

      setError(
        error.response?.data?.detail ||
        "Unable to load transaction history."
      );

    } finally {

      setLoading(false);

    }

  };


  useEffect(() => {

    loadTransactions();

  }, []);


  const formatMoney = (
    amount
  ) => {

    return Math.abs(
      Number(amount || 0)
    ).toLocaleString(
      "en-KE",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }
    );

  };


  const formatDate = (
    dateValue
  ) => {

    if (!dateValue) {
      return "—";
    }

    const date =
      new Date(dateValue);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "—";
    }

    return date.toLocaleString(
      "en-KE",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      }
    );

  };


  const getTransactionLabel = (
    type
  ) => {

    const labels = {

      DEPOSIT:
        "Deposit",

      WITHDRAWAL:
        "Withdrawal",

      DAILY_TASK_REWARD:
        "Daily Task Reward",

      TASK_REWARD:
        "Task Reward",

      REFERRAL_DEPOSIT_BONUS:
        "Referral Deposit Bonus",

      REFERRAL_TASK_COMMISSION:
        "Referral Task Commission",

      MEMBERSHIP_ACTIVATION:
        "Membership Activation",

      WITHDRAWAL_REFUND:
        "Withdrawal Refund"

    };

    return (
      labels[type] ||
      type
        ?.replaceAll("_", " ")
        ?.replace(
          /\b\w/g,
          letter =>
            letter.toUpperCase()
        ) ||
      "Transaction"
    );

  };


  const getStatusLabel = (
    status
  ) => {

    const normalizedStatus =
      String(
        status || "COMPLETED"
      ).toUpperCase();

    const labels = {

      PENDING:
        "Pending",

      COMPLETED:
        "Completed",

      REJECTED:
        "Rejected"

    };

    return (
      labels[normalizedStatus] ||
      normalizedStatus
    );

  };


  const getStatusClass = (
    status
  ) => {

    const normalizedStatus =
      String(
        status || "COMPLETED"
      ).toLowerCase();

    if (
      normalizedStatus === "pending"
    ) {

      return "pending";

    }

    if (
      normalizedStatus === "rejected"
    ) {

      return "rejected";

    }

    return "completed";

  };


  const isCredit = (
    amount
  ) => {

    return Number(
      amount || 0
    ) > 0;

  };


  if (loading) {

    return (

      <div className="history-page">

        <div className="history-loading">

          <div className="history-spinner"></div>

          <p>
            Loading transaction history...
          </p>

        </div>

      </div>

    );

  }


  if (error) {

    return (

      <div className="history-page">

        <div className="history-header">

          <h1>
            Transaction History
          </h1>

        </div>


        <div className="history-error">

          <h2>
            Unable to Load History
          </h2>

          <p>
            {error}
          </p>

          <button
            type="button"
            onClick={loadTransactions}
          >
            Try Again
          </button>

        </div>

      </div>

    );

  }


  return (

    <div className="history-page">


      <div className="history-header">

        <div>

          <h1>
            Transaction History
          </h1>

          <p>
            View all activity on your account.
          </p>

        </div>


        <button
          type="button"
          className="history-refresh-button"
          onClick={loadTransactions}
        >
          Refresh
        </button>

      </div>


      {transactions.length === 0 ? (

        <div className="history-empty">

          <div className="history-empty-icon">
            ↔
          </div>

          <h2>
            No Transactions Yet
          </h2>

          <p>
            Your deposits, earnings,
            memberships and withdrawals
            will appear here.
          </p>

        </div>

      ) : (

        <div className="history-list">

          {transactions.map(
            transaction => {

              const credit =
                isCredit(
                  transaction.amount
                );

              return (

                <div
                  className="history-transaction"
                  key={transaction.id}
                >

                  <div
                    className={
                      credit
                        ? "history-transaction-icon credit"
                        : "history-transaction-icon debit"
                    }
                  >

                    {credit
                      ? "+"
                      : "−"}

                  </div>


                  <div className="history-transaction-details">

                    <h3>
                      {getTransactionLabel(
                        transaction.transaction_type
                      )}
                    </h3>


                    <p>
                      {transaction.description}
                    </p>


                    <div className="history-transaction-meta">

                      <span>
                        {formatDate(
                          transaction.created_at
                        )}
                      </span>


                      <span
                        className={
                          `history-status ` +
                          `history-status-${getStatusClass(
                            transaction.status
                          )}`
                        }
                      >
                        {getStatusLabel(
                          transaction.status
                        )}
                      </span>

                    </div>

                  </div>


                  <div
                    className={
                      credit
                        ? "history-transaction-amount credit"
                        : "history-transaction-amount debit"
                    }
                  >

                    {credit
                      ? "+"
                      : "−"}

                    KES{" "}

                    {formatMoney(
                      transaction.amount
                    )}

                  </div>

                </div>

              );

            }
          )}

        </div>

      )}

    </div>

  );

}


export default History;