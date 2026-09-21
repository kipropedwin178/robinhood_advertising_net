
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import api from "../../services/api";
import "./AdminUserDetails.css";

function AdminUserDetails() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // MODAL STATE
  // =====================================================

  const [modal, setModal] = useState(null);

  // =====================================================
  // EDIT USER FORM
  // =====================================================

  const [editForm, setEditForm] = useState({
    username: "",
    email: "",
    phone_number: "",
    role: "",
  });

  // =====================================================
  // BALANCE FORM
  // =====================================================

  const [balanceForm, setBalanceForm] = useState({
    amount: "",
    reason: "",
  });

  // =====================================================
  // PASSWORD FORM
  // =====================================================

  const [passwordForm, setPasswordForm] = useState({
    new_password: "",
    confirm_password: "",
  });

  // =====================================================
  // ACTION STATE
  // =====================================================

  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // =====================================================
  // FETCH USER DETAILS
  // =====================================================

  useEffect(() => {
    const fetchUserDetails = async () => {
      const token = localStorage.getItem("access_token");

      if (!token) {
        navigate("/edutech/login");
        return;
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      try {
        const [userResponse, transactionResponse] =
          await Promise.all([
            api.get(
              `/api/edutech/users/${userId}`,
              config
            ),
            api.get(
              `/api/edutech/users/${userId}/transactions`,
              config
            ),
          ]);

        setUser(userResponse.data);
        setTransactions(transactionResponse.data);

        setEditForm({
          username: userResponse.data.username || "",
          email: userResponse.data.email || "",
          phone_number:
            userResponse.data.phone_number || "",
          role: userResponse.data.role || "USER",
        });
      } catch (error) {
        console.error("User details error:", error);

        if (error.response?.status === 401) {
          localStorage.removeItem("access_token");
          navigate("/edutech/login");
          return;
        }

        if (error.response?.status === 403) {
          setError(
            "You do not have permission to view this user."
          );
          return;
        }

        if (error.response?.status === 404) {
          setError("User not found.");
          return;
        }

        setError("Unable to load user details.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [userId, navigate]);

  // =====================================================
  // FORMAT CURRENCY
  // =====================================================

  const formatCurrency = (amount) => {
    return `KES ${Number(amount || 0).toLocaleString(
      "en-KE",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`;
  };

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (date) => {
    if (!date) {
      return "N/A";
    }

    return new Date(date).toLocaleString("en-KE", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  // =====================================================
  // MEMBERSHIP NAME
  // =====================================================

  const getMembershipName = (level) => {
    const memberships = {
      1: "Samsung Galaxy S26",
      2: "iPhone 18 Pro",
      3: "Google Pixel 11",
      4: "Xiaomi 17 Ultra",
      5: "OnePlus 15",
      6: "Huawei Mate 80",
    };

    return memberships[level] || `Level ${level}`;
  };

  // =====================================================
  // TRANSACTION TYPE CLASS
  // =====================================================

  const getTransactionTypeClass = (type) => {
    if (!type) {
      return "";
    }

    const normalizedType = type.toUpperCase();

    if (
      normalizedType.includes("DEPOSIT") ||
      normalizedType.includes("EARNING") ||
      normalizedType.includes("BONUS") ||
      normalizedType.includes("REWARD")
    ) {
      return "admin-transaction-positive";
    }

    if (
      normalizedType.includes("WITHDRAW") ||
      normalizedType.includes("ACTIVATION") ||
      normalizedType.includes("DEBIT")
    ) {
      return "admin-transaction-negative";
    }

    return "";
  };

  // =====================================================
  // OPEN MODAL
  // =====================================================

  const openModal = (type) => {
    setActionError("");
    setSuccessMessage("");

    if (type === "edit") {
      setEditForm({
        username: user.username || "",
        email: user.email || "",
        phone_number: user.phone_number || "",
        role: user.role || "USER",
      });
    }

    if (type === "balance") {
      setBalanceForm({
        amount: "",
        reason: "",
      });
    }

    if (type === "password") {
      setPasswordForm({
        new_password: "",
        confirm_password: "",
      });
    }

    setModal(type);
  };

  // =====================================================
  // CLOSE MODAL
  // =====================================================

  const closeModal = () => {
    if (actionLoading) {
      return;
    }

    setModal(null);
    setActionError("");
  };

  // =====================================================
  // EDIT USER
  // =====================================================

  const handleEditUser = async (event) => {
    event.preventDefault();

    setActionError("");
    setSuccessMessage("");

    if (!editForm.username.trim()) {
      setActionError("Username is required.");
      return;
    }

    if (!editForm.email.trim()) {
      setActionError("Email is required.");
      return;
    }

    const token = localStorage.getItem("access_token");

    setActionLoading(true);

    try {
      const response = await api.patch(
        `/api/edutech/users/${userId}`,
        {
          username: editForm.username.trim(),
          email: editForm.email.trim(),
          phone_number:
            editForm.phone_number.trim() || null,
          role: editForm.role,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUser((currentUser) => ({
        ...currentUser,
        ...response.data,
        username: editForm.username.trim(),
        email: editForm.email.trim(),
        phone_number:
          editForm.phone_number.trim() || null,
        role: editForm.role,
      }));

      setModal(null);
      setSuccessMessage(
        "User details updated successfully."
      );
    } catch (error) {
      console.error("Edit user error:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("access_token");
        navigate("/edutech/login");
        return;
      }

      setActionError(
        error.response?.data?.detail ||
          "Unable to update user details."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // =====================================================
  // ADJUST BALANCE
  // =====================================================

  const handleBalanceAdjustment = async (event) => {
    event.preventDefault();

    setActionError("");
    setSuccessMessage("");

    const amount = Number(balanceForm.amount);

    if (!balanceForm.amount || Number.isNaN(amount)) {
      setActionError(
        "Please enter a valid balance amount."
      );
      return;
    }

    if (amount === 0) {
      setActionError(
        "Balance adjustment cannot be zero."
      );
      return;
    }

    if (!balanceForm.reason.trim()) {
      setActionError(
        "Please provide a reason for the adjustment."
      );
      return;
    }

    const token = localStorage.getItem("access_token");

    setActionLoading(true);

    try {
      const response = await api.patch(
        `/api/edutech/users/${userId}/balance`,
        {
          amount: amount,
          reason: balanceForm.reason.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUser((currentUser) => ({
        ...currentUser,
        balance: response.data.new_balance,
        total_earned:
          amount > 0
            ? Number(currentUser.total_earned || 0) +
              amount
            : currentUser.total_earned,
      }));

      setModal(null);

      setSuccessMessage(
        `Balance adjusted successfully. New balance: ${formatCurrency(
          response.data.new_balance
        )}`
      );
    } catch (error) {
      console.error(
        "Balance adjustment error:",
        error
      );

      if (error.response?.status === 401) {
        localStorage.removeItem("access_token");
        navigate("/edutech/login");
        return;
      }

      setActionError(
        error.response?.data?.detail ||
          "Unable to adjust user balance."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // =====================================================
  // RESET PASSWORD
  // =====================================================

  const handlePasswordReset = async (event) => {
    event.preventDefault();

    setActionError("");
    setSuccessMessage("");

    if (!passwordForm.new_password) {
      setActionError(
        "Please enter a new password."
      );
      return;
    }

    if (passwordForm.new_password.length < 8) {
      setActionError(
        "Password must be at least 8 characters long."
      );
      return;
    }

    if (
      passwordForm.new_password !==
      passwordForm.confirm_password
    ) {
      setActionError(
        "Passwords do not match."
      );
      return;
    }

    const token = localStorage.getItem("access_token");

    setActionLoading(true);

    try {
      await api.post(
        `/api/edutech/users/${userId}/reset-password`,
        {
          new_password:
            passwordForm.new_password,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setModal(null);

      setSuccessMessage(
        "User password reset successfully."
      );
    } catch (error) {
      console.error(
        "Password reset error:",
        error
      );

      if (error.response?.status === 401) {
        localStorage.removeItem("access_token");
        navigate("/edutech/login");
        return;
      }

      setActionError(
        error.response?.data?.detail ||
          "Unable to reset user password."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // =====================================================
  // TRANSACTION HISTORY
  // =====================================================

  const handleTransactionHistory = () => {
    document
      .getElementById("admin-user-transactions")
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="admin-user-details-loading">
        <div className="admin-user-details-spinner"></div>
        <p>Loading user details...</p>
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <div className="admin-user-details-error-page">
        <div className="admin-user-details-error-card">
          <h2>Unable to Load User</h2>
          <p>{error}</p>

          <button
            type="button"
            onClick={() =>
              navigate("/edutech/users")
            }
          >
            Back to Users
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="admin-user-details-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="admin-user-details-header">
        <div>
          <h1>User Details</h1>
          <p>
            Manage and review this Robinhood account.
          </p>
        </div>

        <button
          type="button"
          className="admin-user-details-back-button"
          onClick={() =>
            navigate("/edutech/users")
          }
        >
          ← Back to Users
        </button>
      </header>

      <main className="admin-user-details-content">

        {/* =====================================================
            USER PROFILE
        ===================================================== */}

        <section className="admin-user-profile-card">

          <div className="admin-user-avatar">
  {user.profile_photo_url ? (
    <img
      src={user.profile_photo_url}
      alt={user.username}
      className="admin-user-avatar-image"
    />
  ) : (
    user.username
      ?.charAt(0)
      .toUpperCase()
  )}
</div>

          <div className="admin-user-profile-info">
            <h2>{user.username}</h2>

            <p>{user.email}</p>

            <div className="admin-user-badges">

              <span
                className={`admin-user-role ${
                  user.role === "SUPER_ADMIN"
                    ? "admin-user-role-super"
                    : user.role === "ADMIN"
                    ? "admin-user-role-admin"
                    : "admin-user-role-user"
                }`}
              >
                {user.role}
              </span>

              <span
                className={`admin-user-status ${
                  user.is_active
                    ? "admin-user-status-active"
                    : "admin-user-status-inactive"
                }`}
              >
                {user.is_active
                  ? "Active"
                  : "Inactive"}
              </span>

            </div>
          </div>

        </section>

        {/* =====================================================
            SUCCESS MESSAGE
        ===================================================== */}

        {successMessage && (
          <div className="admin-user-success-message">
            {successMessage}
          </div>
        )}

        {/* =====================================================
            FINANCIAL SUMMARY
        ===================================================== */}

        <section className="admin-user-financial-grid">

          <div className="admin-user-financial-card">
            <span>Current Balance</span>
            <strong>
              {formatCurrency(user.balance)}
            </strong>
          </div>

          <div className="admin-user-financial-card">
            <span>Total Earnings</span>
            <strong>
              {formatCurrency(user.total_earned)}
            </strong>
          </div>

          <div className="admin-user-financial-card">
            <span>Total Withdrawn</span>
            <strong>
              {formatCurrency(
                user.total_withdrawn
              )}
            </strong>
          </div>

          <div className="admin-user-financial-card">
            <span>Active Memberships</span>
            <strong>
              {user.active_memberships?.length ||
                0}
            </strong>
          </div>

        </section>

        {/* =====================================================
            USER INFORMATION
        ===================================================== */}

        <section className="admin-user-information-card">

          <div className="admin-user-section-header">
            <h2>User Information</h2>
            <p>
              Basic account information for this user.
            </p>
          </div>

          <div className="admin-user-information-grid">

            <div className="admin-user-information-item">
              <span>Username</span>
              <strong>{user.username}</strong>
            </div>

            <div className="admin-user-information-item">
              <span>Email</span>
              <strong>{user.email}</strong>
            </div>

            <div className="admin-user-information-item">
              <span>Phone Number</span>
              <strong>
                {user.phone_number ||
                  "Not provided"}
              </strong>
            </div>

            <div className="admin-user-information-item">
              <span>RBH Number</span>
              <strong>
                {user.referral_code}
              </strong>
            </div>

            <div className="admin-user-information-item">
              <span>Referred By</span>
              <strong>
                {user.referred_by ||
                  "Direct registration"}
              </strong>
            </div>

            <div className="admin-user-information-item">
              <span>Role</span>
              <strong>{user.role}</strong>
            </div>

            <div className="admin-user-information-item">
              <span>Account Status</span>
              <strong>
                {user.is_active
                  ? "Active"
                  : "Inactive"}
              </strong>
            </div>

          </div>

        </section>

        {/* =====================================================
            ACTIVE MEMBERSHIPS
        ===================================================== */}

        <section className="admin-user-memberships-card">

          <div className="admin-user-section-header">
            <h2>Active Memberships</h2>
            <p>
              Memberships currently active on this
              account.
            </p>
          </div>

          {user.active_memberships?.length > 0 ? (
            <div className="admin-memberships-table-wrapper">

              <table className="admin-memberships-table">

                <thead>
                  <tr>
                    <th>Level</th>
                    <th>Membership</th>
                    <th>Activation Fee</th>
                    <th>Activation Date</th>
                    <th>Expiry Date</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {user.active_memberships.map(
                    (membership) => (
                      <tr
                        key={membership.id}
                      >

                        <td>
                          <strong>
                            Level{" "}
                            {membership.level}
                          </strong>
                        </td>

                        <td>
                          {getMembershipName(
                            membership.level
                          )}
                        </td>

                        <td>
                          {formatCurrency(
                            membership.activation_fee
                          )}
                        </td>

                        <td>
                          {formatDate(
                            membership.started_at
                          )}
                        </td>

                        <td>
                          {formatDate(
                            membership.expires_at
                          )}
                        </td>

                        <td>
                          <span className="admin-membership-active">
                            Active
                          </span>
                        </td>

                      </tr>
                    )
                  )}
                </tbody>

              </table>

            </div>
          ) : (
            <div className="admin-user-empty-state">
              <p>
                This user currently has no active
                memberships.
              </p>
            </div>
          )}

        </section>

        {/* =====================================================
            TRANSACTION HISTORY
        ===================================================== */}

        <section
          id="admin-user-transactions"
          className="admin-user-transactions-card"
        >

          <div className="admin-user-section-header">
            <h2>Transaction History</h2>
            <p>
              All recorded financial transactions for
              this user.
            </p>
          </div>

          {transactions.length > 0 ? (
            <div className="admin-transactions-table-wrapper">

              <table className="admin-transactions-table">

                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Description</th>
                    <th>Date</th>
                  </tr>
                </thead>

                <tbody>
                  {transactions.map(
                    (transaction) => (
                      <tr
                        key={transaction.id}
                      >

                        <td>
                          #{transaction.id}
                        </td>

                        <td>
                          <span
                            className={`admin-transaction-type ${getTransactionTypeClass(
                              transaction.transaction_type
                            )}`}
                          >
                            {
                              transaction.transaction_type
                            }
                          </span>
                        </td>

                        <td>
                          {formatCurrency(
                            transaction.amount
                          )}
                        </td>

                        <td>
                          {transaction.description ||
                            "—"}
                        </td>

                        <td>
                          {formatDate(
                            transaction.created_at
                          )}
                        </td>

                      </tr>
                    )
                  )}
                </tbody>

              </table>

            </div>
          ) : (
            <div className="admin-user-empty-state">
              <p>
                No transactions have been recorded for
                this user.
              </p>
            </div>
          )}

        </section>

        {/* =====================================================
            ACCOUNT MANAGEMENT
        ===================================================== */}

        <section className="admin-user-actions-card">

          <div className="admin-user-section-header">
            <h2>Account Management</h2>
            <p>
              Manage this user's account information,
              balance, password and transaction history.
            </p>
          </div>

          <div className="admin-user-actions-grid">

            <button
              type="button"
              className="admin-user-action-button"
              onClick={() =>
                openModal("edit")
              }
            >
              Edit User
            </button>

            <button
              type="button"
              className="admin-user-action-button"
              onClick={() =>
                openModal("balance")
              }
            >
              Adjust Balance
            </button>

            <button
              type="button"
              className="admin-user-action-button"
              onClick={() =>
                openModal("password")
              }
            >
              Reset Password
            </button>

            <button
              type="button"
              className="admin-user-action-button"
              onClick={handleTransactionHistory}
            >
              Transaction History
            </button>

          </div>

        </section>

      </main>

      {/* =====================================================
          EDIT USER MODAL
      ===================================================== */}

      {modal === "edit" && (
        <div
          className="admin-user-modal-overlay"
          onClick={closeModal}
        >
          <div
            className="admin-user-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="admin-user-modal-header">
              <div>
                <h2>Edit User</h2>
                <p>
                  Update this user's account
                  information.
                </p>
              </div>

              <button
                type="button"
                className="admin-user-modal-close"
                onClick={closeModal}
                disabled={actionLoading}
              >
                ×
              </button>
            </div>

            {actionError && (
              <div className="admin-user-modal-error">
                {actionError}
              </div>
            )}

            <form
              onSubmit={handleEditUser}
              className="admin-user-modal-form"
            >

              <label>
                Username
                <input
                  type="text"
                  value={editForm.username}
                  onChange={(event) =>
                    setEditForm({
                      ...editForm,
                      username:
                        event.target.value,
                    })
                  }
                  disabled={actionLoading}
                />
              </label>

              <label>
                Email
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(event) =>
                    setEditForm({
                      ...editForm,
                      email:
                        event.target.value,
                    })
                  }
                  disabled={actionLoading}
                />
              </label>

              <label>
                Phone Number
                <input
                  type="text"
                  value={
                    editForm.phone_number
                  }
                  onChange={(event) =>
                    setEditForm({
                      ...editForm,
                      phone_number:
                        event.target.value,
                    })
                  }
                  disabled={actionLoading}
                />
              </label>

              <label>
                Role
                <select
                  value={editForm.role}
                  onChange={(event) =>
                    setEditForm({
                      ...editForm,
                      role:
                        event.target.value,
                    })
                  }
                  disabled={actionLoading}
                >
                  <option value="USER">
                    USER
                  </option>
                  <option value="ADMIN">
                    ADMIN
                  </option>
                  <option value="SUPER_ADMIN">
                    SUPER_ADMIN
                  </option>
                </select>
              </label>

              <div className="admin-user-modal-actions">

                <button
                  type="button"
                  className="admin-user-modal-cancel"
                  onClick={closeModal}
                  disabled={actionLoading}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="admin-user-modal-primary"
                  disabled={actionLoading}
                >
                  {actionLoading
                    ? "Saving..."
                    : "Save Changes"}
                </button>

              </div>

            </form>

          </div>
        </div>
      )}

      {/* =====================================================
          ADJUST BALANCE MODAL
      ===================================================== */}

      {modal === "balance" && (
        <div
          className="admin-user-modal-overlay"
          onClick={closeModal}
        >
          <div
            className="admin-user-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="admin-user-modal-header">
              <div>
                <h2>Adjust Balance</h2>
                <p>
                  Current balance:{" "}
                  <strong>
                    {formatCurrency(
                      user.balance
                    )}
                  </strong>
                </p>
              </div>

              <button
                type="button"
                className="admin-user-modal-close"
                onClick={closeModal}
                disabled={actionLoading}
              >
                ×
              </button>
            </div>

            {actionError && (
              <div className="admin-user-modal-error">
                {actionError}
              </div>
            )}

            <form
              onSubmit={
                handleBalanceAdjustment
              }
              className="admin-user-modal-form"
            >

              <label>
                Amount
                <input
                  type="number"
                  step="0.01"
                  placeholder="Example: 500 or -100"
                  value={
                    balanceForm.amount
                  }
                  onChange={(event) =>
                    setBalanceForm({
                      ...balanceForm,
                      amount:
                        event.target.value,
                    })
                  }
                  disabled={actionLoading}
                />

                <small>
                  Use a positive amount to add funds
                  or a negative amount to deduct funds.
                </small>
              </label>

              <label>
                Reason
                <textarea
                  rows="3"
                  placeholder="Enter the reason for this adjustment..."
                  value={
                    balanceForm.reason
                  }
                  onChange={(event) =>
                    setBalanceForm({
                      ...balanceForm,
                      reason:
                        event.target.value,
                    })
                  }
                  disabled={actionLoading}
                />
              </label>

              <div className="admin-user-modal-actions">

                <button
                  type="button"
                  className="admin-user-modal-cancel"
                  onClick={closeModal}
                  disabled={actionLoading}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="admin-user-modal-primary"
                  disabled={actionLoading}
                >
                  {actionLoading
                    ? "Updating..."
                    : "Update Balance"}
                </button>

              </div>

            </form>

          </div>
        </div>
      )}

      {/* =====================================================
          RESET PASSWORD MODAL
      ===================================================== */}

      {modal === "password" && (
        <div
          className="admin-user-modal-overlay"
          onClick={closeModal}
        >
          <div
            className="admin-user-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="admin-user-modal-header">
              <div>
                <h2>Reset Password</h2>
                <p>
                  Set a new password for{" "}
                  <strong>
                    {user.username}
                  </strong>
                  .
                </p>
              </div>

              <button
                type="button"
                className="admin-user-modal-close"
                onClick={closeModal}
                disabled={actionLoading}
              >
                ×
              </button>
            </div>

            {actionError && (
              <div className="admin-user-modal-error">
                {actionError}
              </div>
            )}

            <form
              onSubmit={handlePasswordReset}
              className="admin-user-modal-form"
            >

              <label>
                New Password
                <input
                  type="password"
                  placeholder="Enter new password"
                  value={
                    passwordForm.new_password
                  }
                  onChange={(event) =>
                    setPasswordForm({
                      ...passwordForm,
                      new_password:
                        event.target.value,
                    })
                  }
                  disabled={actionLoading}
                />
              </label>

              <label>
                Confirm Password
                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={
                    passwordForm.confirm_password
                  }
                  onChange={(event) =>
                    setPasswordForm({
                      ...passwordForm,
                      confirm_password:
                        event.target.value,
                    })
                  }
                  disabled={actionLoading}
                />
              </label>

              <small className="admin-user-password-note">
                Password must contain at least 8
                characters.
              </small>

              <div className="admin-user-modal-actions">

                <button
                  type="button"
                  className="admin-user-modal-cancel"
                  onClick={closeModal}
                  disabled={actionLoading}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="admin-user-modal-primary"
                  disabled={actionLoading}
                >
                  {actionLoading
                    ? "Resetting..."
                    : "Reset Password"}
                </button>

              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}

export default AdminUserDetails;