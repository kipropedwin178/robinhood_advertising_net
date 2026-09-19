import {
  useCallback,
  useEffect,
  useState
} from "react";

import {
  NavLink,
  Outlet,
  useNavigate
} from "react-router-dom";

import { getMyWallet } from "../services/walletService";
import { getMyMemberships } from "../services/membershipService";
import { getReferralSummary } from "../services/referralService";

import NotificationBar from "../components/NotificationBar";
import Footer from "../components/Footer";

import "./UserLayout.css";


function UserLayout() {

  const navigate = useNavigate();


  // =====================================================
  // MENU
  // =====================================================

  const [menuOpen, setMenuOpen] =
    useState(false);


  // =====================================================
  // NOTIFICATION
  // =====================================================

  const [notification, setNotification] =
    useState(null);


  const showNotification = useCallback(
    (
      message,
      type = "info"
    ) => {

      setNotification({
        message,
        type,
        id: Date.now()
      });

    },
    []
  );


  const closeNotification = useCallback(
    () => {

      setNotification(null);

    },
    []
  );


  // =====================================================
  // WALLET
  // =====================================================

  const [wallet, setWallet] =
    useState({
      balance: 0,
      total_earned: 0,
      total_withdrawn: 0
    });


  // =====================================================
  // MEMBERSHIPS
  // =====================================================

  const [memberships, setMemberships] =
    useState([]);


  // =====================================================
  // REFERRAL SUMMARY
  // =====================================================

  const [referralSummary, setReferralSummary] =
    useState({
      total_referrals: 0,
      referral_earnings: 0
    });


  // =====================================================
  // FETCH ACCOUNT DATA
  // =====================================================

  const fetchAccountData = useCallback(
    async () => {

      try {

        const [
          walletData,
          membershipData,
          referralData
        ] = await Promise.all([
          getMyWallet(),
          getMyMemberships(),
          getReferralSummary()
        ]);


        // -------------------------------------------------
        // WALLET
        // -------------------------------------------------

        setWallet({
          balance: Number(
            walletData.balance || 0
          ),

          total_earned: Number(
            walletData.total_earned || 0
          ),

          total_withdrawn: Number(
            walletData.total_withdrawn || 0
          )
        });


        // -------------------------------------------------
        // MEMBERSHIPS
        // -------------------------------------------------

        setMemberships(
          membershipData || []
        );


        // -------------------------------------------------
        // REFERRALS
        // -------------------------------------------------

        setReferralSummary({
          total_referrals: Number(
            referralData.total_referrals || 0
          ),

          referral_earnings: Number(
            referralData.referral_earnings || 0
          )
        });

      } catch (error) {

        console.error(
          "Account summary error:",
          error
        );

      }

    },
    []
  );


  // =====================================================
  // INITIAL ACCOUNT LOAD
  // =====================================================

  useEffect(() => {

    fetchAccountData();

  }, [fetchAccountData]);


  // =====================================================
  // REFRESH ACCOUNT WHEN WALLET CHANGES
  // =====================================================

  useEffect(() => {

    const handleWalletUpdated = () => {

      fetchAccountData();

    };


    window.addEventListener(
      "walletUpdated",
      handleWalletUpdated
    );


    return () => {

      window.removeEventListener(
        "walletUpdated",
        handleWalletUpdated
      );

    };

  }, [fetchAccountData]);


  // =====================================================
  // ACTIVE MEMBERSHIPS
  // =====================================================

  const activeMemberships =
    memberships.filter(
      membership =>
        membership.is_active
    );


  // =====================================================
  // TOTAL DAILY REWARD
  // =====================================================

  const totalDailyReward =
    activeMemberships.reduce(
      (total, membership) =>
        total +
        Number(
          membership.daily_reward || 0
        ),
      0
    );


  // =====================================================
  // FORMAT MONEY
  // =====================================================

  const formatMoney = (amount) => {

    return Number(
      amount || 0
    ).toLocaleString(
      undefined,
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }
    );

  };


  // =====================================================
  // CLOSE MENU
  // =====================================================

  const closeMenu = () => {

    setMenuOpen(false);

  };


  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {

    localStorage.removeItem(
      "access_token"
    );

    navigate("/login");

  };


  // =====================================================
  // NAVIGATION
  // =====================================================

  const handleNavigation = (path) => {

    navigate(path);

    closeMenu();

  };


  // =====================================================
  // OUTLET CONTEXT
  // =====================================================

  const outletContext = {
    showNotification,
    fetchAccountData
  };


  return (
    <div className="user-layout">


      {/* =================================================
          GLOBAL NOTIFICATION
      ================================================= */}

      <NotificationBar
        notification={notification}
        onClose={closeNotification}
      />


      {/* =================================================
          NAVBAR
      ================================================= */}

      <header className="user-navbar">

        <div className="user-navbar-inner">


          {/* LOGO */}

          <button
            type="button"
            className="user-logo"
            onClick={() =>
              navigate("/dashboard")
            }
          >
            RBH
          </button>


          {/* DESKTOP NAVIGATION */}

          <nav className="user-desktop-nav">

            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                isActive
                  ? "user-nav-link active"
                  : "user-nav-link"
              }
            >
              Home
            </NavLink>


            <NavLink
              to="/memberships"
              className={({ isActive }) =>
                isActive
                  ? "user-nav-link active"
                  : "user-nav-link"
              }
            >
              Memberships
            </NavLink>


            <NavLink
              to="/tasks"
              className={({ isActive }) =>
                isActive
                  ? "user-nav-link active"
                  : "user-nav-link"
              }
            >
              Tasks
            </NavLink>


            <NavLink
              to="/history"
              className={({ isActive }) =>
                isActive
                  ? "user-nav-link active"
                  : "user-nav-link"
              }
            >
              History
            </NavLink>

          </nav>


          {/* NAVBAR ACTIONS */}

          <div className="user-navbar-actions">


            

            {/* DEPOSIT */}

            <button
              type="button"
              className="user-deposit-button"
              onClick={() =>
                navigate("/deposit")
              }
            >
              Deposit
            </button>


            {/* WITHDRAW */}

            <button
              type="button"
              className="user-withdraw-button"
              onClick={() =>
                navigate("/withdraw")
              }
            >
              Withdraw
            </button>
            {/* BALANCE */}

            <div className="user-balance">

              <span>
                Balance
              </span>

              <strong>
                KES{" "}
                {formatMoney(
                  wallet.balance
                )}
              </strong>

            </div>


            {/* PROFILE */}

            <button
              type="button"
              className="user-profile-button"
              onClick={() =>
                navigate("/profile")
              }
            >
              Profile
            </button>


            {/* LOGOUT */}

            <button
              type="button"
              className="user-logout-button"
              onClick={handleLogout}
            >
              Logout
            </button>


            {/* HAMBURGER */}

            <button
              type="button"
              className="user-hamburger-button"
              onClick={() =>
                setMenuOpen(true)
              }
              aria-label="Open account summary"
              aria-expanded={menuOpen}
            >

              <span></span>
              <span></span>
              <span></span>

            </button>

          </div>

        </div>

      </header>


      {/* =================================================
          HAMBURGER OVERLAY
      ================================================= */}

      {menuOpen && (

        <div
          className="user-menu-overlay"
          onClick={closeMenu}
        ></div>

      )}


      {/* =================================================
          SIDE DRAWER
      ================================================= */}

      <aside
        className={
          menuOpen
            ? "user-side-drawer open"
            : "user-side-drawer"
        }
      >


        {/* DRAWER HEADER */}

        <div className="user-side-drawer-header">

          <div>

            <span>
              RBH
            </span>

            <h2>
              Account Summary
            </h2>

          </div>


          <button
            type="button"
            className="user-drawer-close"
            onClick={closeMenu}
            aria-label="Close account summary"
          >
            ×
          </button>

        </div>


        {/* ACCOUNT SUMMARY */}

        <div className="user-summary-section">


          {/* BALANCE */}

          <div className="user-summary-card balance">

            <div className="user-summary-icon">
              KES
            </div>

            <div>

              <span>
                Available Balance
              </span>

              <strong>
                KES{" "}
                {formatMoney(
                  wallet.balance
                )}
              </strong>

            </div>

          </div>


          {/* TOTAL EARNED */}

          <div className="user-summary-card earned">

            <div className="user-summary-icon">
              ↑
            </div>

            <div>

              <span>
                Total Earned
              </span>

              <strong>
                KES{" "}
                {formatMoney(
                  wallet.total_earned
                )}
              </strong>

            </div>

          </div>


          {/* TOTAL WITHDRAWN */}

          <div className="user-summary-card withdrawn">

            <div className="user-summary-icon">
              ↓
            </div>

            <div>

              <span>
                Total Withdrawn
              </span>

              <strong>
                KES{" "}
                {formatMoney(
                  wallet.total_withdrawn
                )}
              </strong>

            </div>

          </div>


          {/* TOTAL REFERRALS */}

          <div className="user-summary-card referral">

            <div className="user-summary-icon">
              #
            </div>

            <div>

              <span>
                Total Referrals
              </span>

              <strong>
                {referralSummary.total_referrals}
              </strong>

            </div>

          </div>


          {/* REFERRAL EARNINGS */}

          <div className="user-summary-card referral-earnings">

            <div className="user-summary-icon">
              ↑
            </div>

            <div>

              <span>
                Referral Earnings
              </span>

              <strong>
                KES{" "}
                {formatMoney(
                  referralSummary.referral_earnings
                )}
              </strong>

            </div>

          </div>


          {/* ACTIVE MEMBERSHIPS */}

          <div className="user-summary-card membership">

            <div className="user-summary-icon">
              #
            </div>

            <div>

              <span>
                Active Memberships
              </span>

              <strong>
                {activeMemberships.length}
              </strong>

            </div>

          </div>


          {/* DAILY REWARDS */}

          <div className="user-summary-card reward">

            <div className="user-summary-icon">
              +
            </div>

            <div>

              <span>
                Daily Rewards
              </span>

              <strong>
                KES{" "}
                {formatMoney(
                  totalDailyReward
                )}
              </strong>

            </div>

          </div>

        </div>


        {/* DRAWER NAVIGATION */}

        <div className="user-drawer-navigation">

          <h3>
            Quick Navigation
          </h3>


          <button
            type="button"
            onClick={() =>
              handleNavigation(
                "/dashboard"
              )
            }
          >
            <span>⌂</span>
            Dashboard
          </button>


          <button
            type="button"
            onClick={() =>
              handleNavigation(
                "/memberships"
              )
            }
          >
            <span>◆</span>
            Memberships
          </button>


          <button
            type="button"
            onClick={() =>
              handleNavigation(
                "/tasks"
              )
            }
          >
            <span>✓</span>
            Tasks
          </button>


          <button
            type="button"
            onClick={() =>
              handleNavigation(
                "/history"
              )
            }
          >
            <span>↔</span>
            Transaction History
          </button>


          <button
            type="button"
            onClick={() =>
              handleNavigation(
                "/profile"
              )
            }
          >
            <span>●</span>
            Profile
          </button>

        </div>


        {/* DRAWER LOGOUT */}

        <button
          type="button"
          className="user-drawer-logout"
          onClick={handleLogout}
        >
          Logout
        </button>

      </aside>


      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <main className="user-main">

        <div className="user-main-container">

          <Outlet
            context={outletContext}
          />

        </div>

      </main>

   {/* =================================================
          FOOTER
      ================================================= */}

      <Footer />

      {/* =================================================
          BOTTOM NAVIGATION
      ================================================= */}

      <nav className="user-bottom-nav">

        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            isActive
              ? "user-bottom-link active"
              : "user-bottom-link"
          }
        >
          <span className="user-bottom-icon">
            🏠
          </span>

          <span>
            Home
          </span>
        </NavLink>


        <NavLink
          to="/memberships"
          className={({ isActive }) =>
            isActive
              ? "user-bottom-link active"
              : "user-bottom-link"
          }
        >
          <span className="user-bottom-icon">
            💎
          </span>

          <span>
            Memberships
          </span>
        </NavLink>


        <NavLink
          to="/tasks"
          className={({ isActive }) =>
            isActive
              ? "user-bottom-link active"
              : "user-bottom-link"
          }
        >
          <span className="user-bottom-icon">
            ✓
          </span>

          <span>
            Tasks
          </span>
        </NavLink>


        <NavLink
          to="/history"
          className={({ isActive }) =>
            isActive
              ? "user-bottom-link active"
              : "user-bottom-link"
          }
        >
          <span className="user-bottom-icon">
            ↔
          </span>

          <span>
            History
          </span>
        </NavLink>
        <NavLink
  to="/about"
  className={({ isActive }) =>
    isActive
      ? "user-nav-link active"
      : "user-nav-link"
  }
>
  About Us
</NavLink>


        <NavLink
          to="/profile"
          className={({ isActive }) =>
            isActive
              ? "user-bottom-link active"
              : "user-bottom-link"
          }
        >
          <span className="user-bottom-icon">
            👤
          </span>

          <span>
            Profile
          </span>
        </NavLink>

      </nav>

    </div>
  );
}


export default UserLayout;