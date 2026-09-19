import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../services/api";
import "./AdminDeposits.css";

function AdminDeposits() {
  const navigate = useNavigate();

  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");

  const fetchDeposits = async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      navigate("/edutech/login");
      return;
    }

    try {
      setError("");

      const response = await api.get("/api/edutech/deposits", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setDeposits(response.data);
    } catch (error) {
      console.error("Deposits error:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("access_token");
        navigate("/edutech/login");
        return;
      }

      if (error.response?.status === 403) {
        setError("You do not have permission to manage deposits.");
        return;
      }

      setError("Unable to load deposits.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeposits();
  }, []);

  const handleApprove = async (depositId) => {
    const confirmed = window.confirm(
      `Are you sure you want to approve deposit #${depositId}?`,
    );

    if (!confirmed) {
      return;
    }

    const token = localStorage.getItem("access_token");

    try {
      setActionLoading(depositId);
      setError("");

      await api.patch(
        `/api/edutech/deposits/${depositId}/approve`,
        {
          reason: "Deposit received",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      await fetchDeposits();
    } catch (error) {
      console.error("Approve deposit error:", error);

      setError(error.response?.data?.detail || "Unable to approve deposit.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (depositId) => {
    const reason = window.prompt(
      `Enter the reason for rejecting deposit #${depositId}:`,
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
      setActionLoading(depositId);
      setError("");

      await api.patch(
        `/api/edutech/deposits/${depositId}/reject`,
        {
          reason: reason.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      await fetchDeposits();
    } catch (error) {
      console.error("Reject deposit error:", error);

      setError(error.response?.data?.detail || "Unable to reject deposit.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/edutech/login");
  };

  const formatAmount = (amount) => {
    return Number(amount).toLocaleString("en-KE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleString("en-KE");
  };

  if (loading) {
    return (
      <div className="admin-deposits-loading">
        <div className="admin-deposits-spinner"></div>
        <p>Loading deposits...</p>
      </div>
    );
  }

  return (
    <div className="admin-deposits">
      <header className="admin-deposits-header">
        <div>
          <h1>Deposit Management</h1>
          <p>Review and manage user deposit requests.</p>
        </div>

        <div className="admin-deposits-header-actions">
          <button
            type="button"
            className="admin-deposits-dashboard-btn"
            onClick={() => navigate("/edutech")}
          >
            Dashboard
          </button>

          <button
            type="button"
            className="admin-deposits-logout-btn"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </header>

      <main className="admin-deposits-content">
        <div className="admin-deposits-toolbar">
          <div>
            <h2>All Deposits</h2>

            <p>
              {deposits.length} deposit
              {deposits.length !== 1 ? "s" : ""}
            </p>
          </div>

          <button
            type="button"
            className="admin-deposits-refresh-btn"
            onClick={fetchDeposits}
            disabled={actionLoading !== null}
          >
            Refresh
          </button>
        </div>

        {error && <div className="admin-deposits-error">{error}</div>}

        {deposits.length === 0 ? (
          <div className="admin-deposits-empty">
            <h3>No deposits found</h3>
            <p>There are currently no deposit records.</p>
          </div>
        ) : (
          <div className="admin-deposits-table-container">
            <table className="admin-deposits-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>User</th>
                  <th>Amount</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {deposits.map((deposit) => {
                  const isPending = deposit.status === "PENDING";

                  const isProcessing = actionLoading === deposit.id;

                  return (
                    <tr key={deposit.id}>
                      <td>{deposit.id}.</td>

                      <td>{deposit.rbh_number}</td>

                      <td className="admin-deposit-amount">
                        KES {formatAmount(deposit.amount)}
                      </td>

                      <td>{deposit.payment_method}</td>

                      <td>
                        <span
                          className={`admin-deposit-status admin-deposit-status-${deposit.status.toLowerCase()}`}
                        >
                          {deposit.status}
                        </span>
                      </td>

                      <td>{formatDate(deposit.created_at)}</td>

                      <td>
                        {isPending ? (
                          <div className="admin-deposit-actions">
                            <button
                              type="button"
                              className="admin-deposit-approve-btn"
                              onClick={() => handleApprove(deposit.id)}
                              disabled={isProcessing}
                            >
                              {isProcessing ? "Processing..." : "Approve"}
                            </button>

                            <button
                              type="button"
                              className="admin-deposit-reject-btn"
                              onClick={() => handleReject(deposit.id)}
                              disabled={isProcessing}
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="admin-deposit-no-action">
                            No action
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

export default AdminDeposits;
