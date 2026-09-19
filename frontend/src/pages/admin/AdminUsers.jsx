
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../services/api";
import "./AdminUsers.css";

function AdminUsers() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  const [search, setSearch] = useState("");

  // =====================================================
  // MODAL STATE
  // =====================================================

  const [modal, setModal] = useState({
    type: null,
    user: null,
  });

  // =====================================================
  // FETCH USERS
  // =====================================================

  const fetchUsers = async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      navigate("/edutech/login");
      return;
    }

    try {
      const response = await api.get("/api/edutech/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUsers(response.data);
    } catch (error) {
      console.error("Users error:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("access_token");
        navigate("/edutech/login");
        return;
      }

      if (error.response?.status === 403) {
        setError("You do not have permission to view users.");
        return;
      }

      setError("Unable to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [navigate]);

  // =====================================================
  // OPEN MODAL
  // =====================================================

  const openModal = (type, user) => {
    setModal({
      type,
      user,
    });
  };

  // =====================================================
  // CLOSE MODAL
  // =====================================================

  const closeModal = () => {
    if (actionLoading) {
      return;
    }

    setModal({
      type: null,
      user: null,
    });
  };

  // =====================================================
  // CONFIRM SUSPEND
  // =====================================================

  const confirmSuspend = async () => {
    const user = modal.user;

    if (!user) {
      return;
    }

    const token = localStorage.getItem("access_token");

    setActionLoading(`suspend-${user.id}`);

    try {
      await api.patch(
        `/api/edutech/users/${user.id}/suspend`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUsers((currentUsers) =>
        currentUsers.map((item) =>
          item.id === user.id
            ? { ...item, is_active: false }
            : item
        )
      );

      setModal({
        type: null,
        user: null,
      });
    } catch (error) {
      console.error("Suspend user error:", error);

      setModal({
        type: null,
        user: null,
      });

      alert(
        error.response?.data?.detail ||
          "Unable to suspend user."
      );
    } finally {
      setActionLoading(null);
    }
  };

  // =====================================================
  // UNSUSPEND USER
  // =====================================================

  const handleUnsuspend = async (user) => {
    const confirmed = window.confirm(
      `Are you sure you want to unsuspend ${user.username}?`
    );

    if (!confirmed) {
      return;
    }

    const token = localStorage.getItem("access_token");

    setActionLoading(`unsuspend-${user.id}`);

    try {
      await api.patch(
        `/api/edutech/users/${user.id}/unsuspend`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUsers((currentUsers) =>
        currentUsers.map((item) =>
          item.id === user.id
            ? { ...item, is_active: true }
            : item
        )
      );
    } catch (error) {
      console.error("Unsuspend user error:", error);

      alert(
        error.response?.data?.detail ||
          "Unable to unsuspend user."
      );
    } finally {
      setActionLoading(null);
    }
  };

  // =====================================================
  // CONFIRM DELETE
  // =====================================================

  const confirmDelete = async () => {
    const user = modal.user;

    if (!user) {
      return;
    }

    const token = localStorage.getItem("access_token");

    setActionLoading(`delete-${user.id}`);

    try {
      await api.delete(
        `/api/edutech/users/${user.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUsers((currentUsers) =>
        currentUsers.filter(
          (item) => item.id !== user.id
        )
      );

      setModal({
        type: null,
        user: null,
      });
    } catch (error) {
      console.error("Delete user error:", error);

      setModal({
        type: null,
        user: null,
      });

      alert(
        error.response?.data?.detail ||
          "Unable to delete user."
      );
    } finally {
      setActionLoading(null);
    }
  };

  // =====================================================
  // SEARCH
  // =====================================================

  const filteredUsers = users.filter((user) => {
    const searchTerm = search.toLowerCase();

    return (
      user.username?.toLowerCase().includes(searchTerm) ||
      user.email?.toLowerCase().includes(searchTerm) ||
      (user.phone_number || "")
        .toLowerCase()
        .includes(searchTerm) ||
      user.referral_code
        ?.toLowerCase()
        .includes(searchTerm)
    );
  });

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="admin-users-loading">
        <div className="admin-users-spinner"></div>
        <p>Loading users...</p>
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error) {
    return (
      <div className="admin-users-error-page">
        <div className="admin-users-error-card">
          <h2>Users Error</h2>
          <p>{error}</p>

          <button
            type="button"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <div className="admin-users-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <header className="admin-users-header">
        <div>
          <h1>Manage Users</h1>
          <p>
            View and manage Robinhood platform users.
          </p>
        </div>

        <button
          type="button"
          className="admin-users-back-button"
          onClick={() => navigate("/edutech")}
        >
          Back to Dashboard
        </button>
      </header>

      <main className="admin-users-content">

        {/* =================================================
            TOOLBAR
        ================================================= */}

        <section className="admin-users-toolbar">
          <div>
            <strong>{users.length}</strong>{" "}
            registered users
          </div>

          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            className="admin-users-search"
          />
        </section>

        {/* =================================================
            USERS TABLE
        ================================================= */}

        <section className="admin-users-table-container">
          <table className="admin-users-table">

            <thead>
              <tr>
                <th>RBH NO:</th>
                <th>Username</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Balance</th>
                <th>Role</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>

              {filteredUsers.length === 0 ? (

                <tr>
                  <td
                    colSpan="8"
                    className="admin-users-empty"
                  >
                    No users found.
                  </td>
                </tr>

              ) : (

                filteredUsers.map((user) => {

                  const isLoading =
                    actionLoading !== null &&
                    actionLoading.endsWith(
                      `-${user.id}`
                    );

                  const isSuperAdmin =
                    user.role === "SUPER_ADMIN";

                  return (
                    <tr key={user.id}>

                      {/* RBH NUMBER */}

                      <td className="admin-rbh-number">
                        {user.referral_code}
                      </td>

                      {/* USERNAME */}

                      <td className="admin-users-username">
                        {user.username}
                      </td>

                      {/* EMAIL */}

                      <td>
                        {user.email}
                      </td>

                      {/* PHONE */}

                      <td>
                        {user.phone_number || "—"}
                      </td>

                      {/* BALANCE */}

                      <td className="admin-users-balance">
                        KES{" "}
                        {Number(
                          user.balance || 0
                        ).toLocaleString("en-KE", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>

                      {/* ROLE */}

                      <td>
                        <span
                          className={`admin-role-badge ${
                            isSuperAdmin
                              ? "admin-role-super"
                              : user.role === "ADMIN"
                                ? "admin-role-admin"
                                : "admin-role-user"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>

                      {/* STATUS */}

                      <td>
                        <span
                          className={`admin-status-badge ${
                            user.is_active
                              ? "admin-status-active"
                              : "admin-status-inactive"
                          }`}
                        >
                          {user.is_active
                            ? "Active"
                            : "Suspended"}
                        </span>
                      </td>

                      {/* ACTIONS */}

                      <td className="admin-users-actions">

                        {/* VIEW */}

                        <button
                          type="button"
                          className="admin-view-user-button"
                          onClick={() =>
                            navigate(
                              `/edutech/users/${user.id}`
                            )
                          }
                          disabled={isLoading}
                        >
                          View
                        </button>

                        {/* SUSPEND */}

                        {!isSuperAdmin &&
                          user.is_active && (
                            <button
                              type="button"
                              className="admin-suspend-user-button"
                              onClick={() =>
                                openModal(
                                  "suspend",
                                  user
                                )
                              }
                              disabled={isLoading}
                            >
                              Suspend
                            </button>
                          )}

                        {/* UNSUSPEND */}

                        {!isSuperAdmin &&
                          !user.is_active && (
                            <button
                              type="button"
                              className="admin-unsuspend-user-button"
                              onClick={() =>
                                handleUnsuspend(user)
                              }
                              disabled={isLoading}
                            >
                              {actionLoading ===
                              `unsuspend-${user.id}`
                                ? "..."
                                : "Unsuspend"}
                            </button>
                          )}

                        {/* DELETE */}

                        {!isSuperAdmin && (
                          <button
                            type="button"
                            className="admin-delete-user-button"
                            onClick={() =>
                              openModal(
                                "delete",
                                user
                              )
                            }
                            disabled={isLoading}
                          >
                            Delete
                          </button>
                        )}

                      </td>

                    </tr>
                  );
                })
              )}

            </tbody>

          </table>
        </section>

      </main>

      {/* =================================================
          CONFIRMATION MODAL
      ================================================= */}

      {modal.type && modal.user && (
        <div
          className="admin-users-modal-overlay"
          onClick={closeModal}
        >
          <div
            className={`admin-users-modal ${
              modal.type === "delete"
                ? "admin-users-delete-modal"
                : "admin-users-suspend-modal"
            }`}
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* MODAL ICON */}

            <div
              className={`admin-users-modal-icon ${
                modal.type === "delete"
                  ? "admin-users-modal-icon-delete"
                  : "admin-users-modal-icon-suspend"
              }`}
            >
              {modal.type === "delete"
                ? "!"
                : "!"}
            </div>

            {/* MODAL CONTENT */}

            <h2>
              {modal.type === "delete"
                ? "Delete User?"
                : "Suspend User?"}
            </h2>

            <p>
              {modal.type === "delete"
                ? `You are about to permanently delete ${modal.user.username}. This action cannot be undone.`
                : `You are about to suspend ${modal.user.username}. They will no longer be able to access their account.`}
            </p>

            <div className="admin-users-modal-user">
              <strong>
                {modal.user.username}
              </strong>

              <span>
                {modal.user.referral_code}
              </span>
            </div>

            {/* MODAL BUTTONS */}

            <div className="admin-users-modal-actions">

              <button
                type="button"
                className="admin-users-modal-cancel"
                onClick={closeModal}
                disabled={actionLoading !== null}
              >
                Cancel
              </button>

              {modal.type === "suspend" ? (

                <button
                  type="button"
                  className="admin-users-modal-confirm-suspend"
                  onClick={confirmSuspend}
                  disabled={actionLoading !== null}
                >
                  {actionLoading ===
                  `suspend-${modal.user.id}`
                    ? "Suspending..."
                    : "Yes, Suspend"}
                </button>

              ) : (

                <button
                  type="button"
                  className="admin-users-modal-confirm-delete"
                  onClick={confirmDelete}
                  disabled={actionLoading !== null}
                >
                  {actionLoading ===
                  `delete-${modal.user.id}`
                    ? "Deleting..."
                    : "Yes, Delete"}
                </button>

              )}

            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default AdminUsers;