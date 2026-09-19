
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../services/api";
import "./AdminWithdrawals.css";

function AdminWithdrawals() {
  const navigate = useNavigate();

  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");

  const fetchWithdrawals = async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      navigate("/edutech/login");
      return;
    }

    try {
      setError("");

      const response = await api.get(
        "/api/edutech/withdrawals",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setWithdrawals(response.data);
    } catch (error) {
      console.error("Withdrawals error:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("access_token");
        navigate("/edutech/login");
        return;
      }

      if (error.response?.status === 403) {
        setError(
          "You do not have permission to manage withdrawals."
        );
        return;
      }

      setError("Unable to load withdrawals.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const handleApprove = async (withdrawalId) => {
    const confirmed = window.confirm(
      `Are you sure you want to approve withdrawal #${withdrawalId}?`
    );

    if (!confirmed) {
      return;
    }

    const token = localStorage.getItem("access_token");

    try {
      setActionLoading(withdrawalId);
      setError("");

      await api.patch(
        `/api/edutech/withdrawals/${withdrawalId}/approve`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      await fetchWithdrawals();
    } catch (error) {
      console.error(
        "Approve withdrawal error:",
        error
      );

      setError(
        error.response?.data?.detail ||
        "Unable to approve withdrawal."
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (withdrawalId) => {
    const reason = window.prompt(
      `Enter the reason for rejecting withdrawal #${withdrawalId}:`
    );

    if (reason === null) {
      return;
    }

    if (!reason.trim()) {
      setError("A rejection reason is required.");
      return;
    }

    const token = localStorage.getItem("access_token");

    try {
      setActionLoading(withdrawalId);
      setError("");

      await api.patch(
        `/api/edutech/withdrawals/${withdrawalId}/reject`,
        {
          reason: reason.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      await fetchWithdrawals();
    } catch (error) {
      console.error(
        "Reject withdrawal error:",
        error
      );

      setError(
        error.response?.data?.detail ||
        "Unable to reject withdrawal."
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/edutech/login");
  };

  const formatAmount = (amount) => {
    return Number(amount).toLocaleString(
      "en-KE",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    );
  };

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleString(
      "en-KE"
    );
  };

  if (loading) {
    return (
      <div className="admin-withdrawals-loading">
        <div className="admin-withdrawals-spinner"></div>

        <p>
          Loading withdrawals...
        </p>
      </div>
    );
  }

  return (
    <div className="admin-withdrawals">

      <header className="admin-withdrawals-header">

        <div>
          <h1>
            Withdrawal Management
          </h1>

          <p>
            Review and manage user withdrawal requests.
          </p>
        </div>

        <div className="admin-withdrawals-header-actions">

          <button
            type="button"
            className="admin-withdrawals-dashboard-btn"
            onClick={() =>
              navigate("/edutech")
            }
          >
            Dashboard
          </button>

          <button
            type="button"
            className="admin-withdrawals-logout-btn"
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>

      </header>

      <main className="admin-withdrawals-content">

        <div className="admin-withdrawals-toolbar">

          <div>
            <h2>
              All Withdrawals
            </h2>

            <p>
              {withdrawals.length} withdrawal
              {withdrawals.length !== 1
                ? "s"
                : ""}
            </p>
          </div>

          <button
            type="button"
            className="admin-withdrawals-refresh-btn"
            onClick={fetchWithdrawals}
            disabled={
              actionLoading !== null
            }
          >
            Refresh
          </button>

        </div>

        {error && (
          <div className="admin-withdrawals-error">
            {error}
          </div>
        )}

        {withdrawals.length === 0 ? (

          <div className="admin-withdrawals-empty">

            <h3>
              No withdrawals found
            </h3>

            <p>
              There are currently no withdrawal records.
            </p>

          </div>

        ) : (

          <div className="admin-withdrawals-table-container">

            <table className="admin-withdrawals-table">

              <thead>

                <tr>
                  <th>ID</th>
                  <th>RBH No:</th>
                  <th>Amount</th>
                  <th>Fee</th>
                  <th>Net Amount</th>
                  <th>Payment</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>

              </thead>

              <tbody>

                {withdrawals.map(
                  (withdrawal) => {

                    const isPending =
                      withdrawal.status ===
                      "PENDING";

                    const isProcessing =
                      actionLoading ===
                      withdrawal.id;

                    return (
                      <tr
                        key={withdrawal.id}
                      >

                        <td>
                          #{withdrawal.id}
                        </td>

                        <td className="admin-withdrawal-rbh">
                          {withdrawal.rbh_number}
                        </td>

                        <td className="admin-withdrawal-amount">
                          KES{" "}
                          {formatAmount(
                            withdrawal.amount
                          )}
                        </td>

                        <td>
                          KES{" "}
                          {formatAmount(
                            withdrawal.withdrawal_fee
                          )}
                        </td>

                        <td className="admin-withdrawal-net">
                          KES{" "}
                          {formatAmount(
                            withdrawal.net_amount
                          )}
                        </td>

                        <td>
                          {withdrawal.payment_method}
                        </td>

                        <td>
                          {withdrawal.phone_number}
                        </td>

                        <td>

                          <span
                            className={`admin-withdrawal-status admin-withdrawal-status-${withdrawal.status.toLowerCase()}`}
                          >
                            {withdrawal.status}
                          </span>

                        </td>

                        <td>
                          {formatDate(
                            withdrawal.created_at
                          )}
                        </td>

                        <td>

                          {isPending ? (

                            <div className="admin-withdrawal-actions">

                              <button
                                type="button"
                                className="admin-withdrawal-approve-btn"
                                onClick={() =>
                                  handleApprove(
                                    withdrawal.id
                                  )
                                }
                                disabled={
                                  isProcessing
                                }
                              >
                                {isProcessing
                                  ? "Processing..."
                                  : "Approve"}
                              </button>

                              <button
                                type="button"
                                className="admin-withdrawal-reject-btn"
                                onClick={() =>
                                  handleReject(
                                    withdrawal.id
                                  )
                                }
                                disabled={
                                  isProcessing
                                }
                              >
                                Reject
                              </button>

                            </div>

                          ) : (

                            <span className="admin-withdrawal-no-action">
                              No action
                            </span>

                          )}

                        </td>

                      </tr>
                    );
                  }
                )}

              </tbody>

            </table>

          </div>

        )}

      </main>

    </div>
  );
}

export default AdminWithdrawals;