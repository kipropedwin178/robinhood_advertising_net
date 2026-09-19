
import { useEffect, useState } from "react";

import api from "../../services/api";
import "./AdminDashboard.css";


function AdminDashboard() {
  const [dashboard, setDashboard] = useState(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");


  useEffect(() => {
    const fetchDashboard = async () => {
      const token = localStorage.getItem(
        "access_token"
      );

      if (!token) {
        return;
      }

      try {
        const response = await api.get(
          "/api/edutech/dashboard"
        );

        setDashboard(response.data);

      } catch (error) {
        console.error(
          "Dashboard error:",
          error
        );

        if (error.response?.status === 403) {
          setError(
            "You do not have permission to access the admin dashboard."
          );

          return;
        }

        setError(
          "Unable to load dashboard data."
        );

      } finally {
        setLoading(false);
      }
    };


    fetchDashboard();

  }, []);


  if (loading) {
    return (
      <div className="admin-dashboard-loading">

        <div className="admin-dashboard-spinner"></div>

        <p>
          Loading dashboard data...
        </p>

      </div>
    );
  }


  if (error) {
    return (
      <div className="admin-dashboard-error-page">

        <div className="admin-dashboard-error-card">

          <h2>
            Dashboard Error
          </h2>

          <p>
            {error}
          </p>

          <button
            type="button"
            onClick={() =>
              window.location.reload()
            }
          >
            Try Again
          </button>

        </div>

      </div>
    );
  }


  if (!dashboard) {
    return null;
  }


  return (
    <div className="admin-dashboard">

      {/* =================================================
          WELCOME
      ================================================= */}

      <section className="admin-dashboard-welcome">

        <h1>
          Dashboard Overview
        </h1>

        <p>
          Monitor users, deposits, withdrawals,
          memberships and earnings.
        </p>

      </section>


      {/* =================================================
          STATISTICS
      ================================================= */}

      <section className="admin-stat-grid">


        {/* TOTAL USERS */}

        <div className="admin-stat-card">

          <span className="admin-stat-label">
            Total Users
          </span>

          <strong className="admin-stat-value">
            {dashboard.total_users}
          </strong>

        </div>


        {/* ACTIVE USERS */}

        <div className="admin-stat-card">

          <span className="admin-stat-label">
            Active Users
          </span>

          <strong className="admin-stat-value">
            {dashboard.active_users}
          </strong>

        </div>


        {/* INACTIVE USERS */}

        <div className="admin-stat-card">

          <span className="admin-stat-label">
            Inactive Users
          </span>

          <strong className="admin-stat-value">
            {dashboard.inactive_users}
          </strong>

        </div>


        {/* ACTIVE MEMBERSHIPS */}

        <div className="admin-stat-card">

          <span className="admin-stat-label">
            Active Memberships
          </span>

          <strong className="admin-stat-value">
            {dashboard.active_memberships}
          </strong>

        </div>


        {/* TOTAL DEPOSITS */}

        <div className="admin-stat-card">

          <span className="admin-stat-label">
            Total Deposits
          </span>

          <strong className="admin-stat-value">
            {dashboard.total_deposits}
          </strong>

        </div>


        {/* TOTAL DEPOSIT AMOUNT */}

        <div className="admin-stat-card">

          <span className="admin-stat-label">
            Deposit Amount
          </span>

          <strong className="admin-stat-value">
            KES{" "}
            {Number(
              dashboard.total_deposit_amount
            ).toLocaleString()}
          </strong>

        </div>


        {/* TODAY'S DEPOSITS */}

        <div className="admin-stat-card">

          <span className="admin-stat-label">
            Today's Deposits
          </span>

          <strong className="admin-stat-value">
            KES{" "}
            {Number(
              dashboard.today_deposits
            ).toLocaleString()}
          </strong>

        </div>


        {/* TOTAL WITHDRAWALS */}

        <div className="admin-stat-card">

          <span className="admin-stat-label">
            Total Withdrawals
          </span>

          <strong className="admin-stat-value">
            {dashboard.total_withdrawals}
          </strong>

        </div>


        {/* PENDING WITHDRAWALS */}

        <div className="admin-stat-card">

          <span className="admin-stat-label">
            Pending Withdrawals
          </span>

          <strong className="admin-stat-value">
            {dashboard.pending_withdrawals}
          </strong>

        </div>


        {/* TOTAL WITHDRAWN */}

        <div className="admin-stat-card">

          <span className="admin-stat-label">
            Withdrawn Amount
          </span>

          <strong className="admin-stat-value">
            KES{" "}
            {Number(
              dashboard.total_withdrawn_amount
            ).toLocaleString()}
          </strong>

        </div>


        {/* TODAY'S WITHDRAWALS */}

        <div className="admin-stat-card">

          <span className="admin-stat-label">
            Today's Withdrawals
          </span>

          <strong className="admin-stat-value">
            KES{" "}
            {Number(
              dashboard.today_withdrawals
            ).toLocaleString()}
          </strong>

        </div>


        {/* USER EARNINGS */}

        <div className="admin-stat-card">

          <span className="admin-stat-label">
            User Earnings
          </span>

          <strong className="admin-stat-value">
            KES{" "}
            {Number(
              dashboard.total_user_earnings
            ).toLocaleString()}
          </strong>

        </div>

      </section>


      {/* =================================================
          QUICK ACTIONS
      ================================================= */}

      <section className="admin-dashboard-actions">

        <h2>
          Quick Actions
        </h2>

        <p>
          Use the sidebar to manage the platform.
        </p>

      </section>

    </div>
  );
}


export default AdminDashboard;