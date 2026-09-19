import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useOutletContext } from "react-router-dom";
import {
  Wallet,
  TrendingUp,
  ArrowDownToLine,
  CircleDollarSign,
  Users,
  HandCoins,
  CalendarCheck,
  ChevronDown,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

import { getMyMemberships } from "../services/membershipService";
import { getMyWallet } from "../services/walletService";
import {
  getReferralSummary,
  getReferralLink,
} from "../services/referralService";
import { getMyProfile } from "../services/userService";
import { getLifetimeEarnings } from "../services/earningsService";

import "./Dashboard.css";


function formatKES(value) {
  return `KES ${Number(value || 0).toLocaleString(
    undefined,
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  )}`;
}


function formatDate(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString(
    undefined,
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }
  );
}


function formatChartDate(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString(
    undefined,
    {
      day: "2-digit",
      month: "short",
    }
  );
}


function Dashboard() {
  const { showNotification } = useOutletContext();

  const [currentTime, setCurrentTime] = useState(
    new Date()
  );

  const getGreeting = () => {
    const hour = currentTime.getHours();

    if (hour < 12) {
      return "Good Morning";
    }

    if (hour < 18) {
      return "Good Afternoon";
    }

    return "Good Evening";
  };


  const [memberships, setMemberships] = useState([]);

  const [profile, setProfile] = useState({
    username: "",
  });

  const [earnings, setEarnings] = useState([]);


  const [wallet, setWallet] = useState({
    balance: 0,
    total_earned: 0,
    total_withdrawn: 0,
    today_income: 0,
    today_withdrawals: 0,
  });


  const [referrals, setReferrals] = useState({
    total_referrals: 0,
    active_referrals: 0,
    referral_earnings: 0,
  });
const [referralLink, setReferralLink] =
  useState("");

  const [showDetails, setShowDetails] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
  membershipData,
  walletData,
  referralData,
  profileData,
  earningsData,
  referralLinkData,
] = await Promise.all([
  getMyMemberships(),
  getMyWallet(),
  getReferralSummary(),
  getMyProfile(),
  getLifetimeEarnings(),
  getReferralLink(),
]);

      setMemberships(
        Array.isArray(membershipData)
          ? membershipData
          : []
      );


      setProfile({
        username:
          profileData?.username || "",
      });


      setEarnings(
        Array.isArray(earningsData)
          ? earningsData
          : []
      );


      setWallet({
        balance: Number(
          walletData?.balance || 0
        ),
        total_earned: Number(
          walletData?.total_earned || 0
        ),
        total_withdrawn: Number(
          walletData?.total_withdrawn || 0
        ),
        today_income: Number(
          walletData?.today_income || 0
        ),
        today_withdrawals: Number(
          walletData?.today_withdrawals || 0
        ),
      });


      setReferrals({
        total_referrals: Number(
          referralData?.total_referrals || 0
        ),
        active_referrals: Number(
          referralData?.active_referrals || 0
        ),
        referral_earnings: Number(
          referralData?.referral_earnings || 0
        ),
      });
      setReferralLink(
  referralLinkData?.referral_link || ""
);

    } catch (error) {

      console.error(
        "Dashboard error:",
        error
      );

      const message =
        error.response?.data?.detail ||
        "Unable to load dashboard.";

      setError(message);

      showNotification(
        message,
        "error"
      );

    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchDashboardData();
  }, []);


  const activeMemberships =
    memberships.filter(
      (membership) =>
        membership.is_active
    );


  const totalDailyReward =
    activeMemberships.reduce(
      (total, membership) =>
        total +
        Number(
          membership.daily_reward || 0
        ),
      0
    );
    const copyReferralLink = async () => {
  try {
    await navigator.clipboard.writeText(
      referralLink
    );

    showNotification(
      "Referral link copied successfully.",
      "success"
    );
  } catch {
    showNotification(
      "Unable to copy referral link.",
      "error"
    );
  }
};


  if (loading) {
    return (
      <div className="dashboard-loading">

        <div className="dashboard-spinner"></div>

        <p>
          Loading dashboard...
        </p>

      </div>
    );
  }


  return (
    <div className="dashboard-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <section className="dashboard-header">

        <div>

          <span className="dashboard-eyebrow">
            ACCOUNT OVERVIEW
          </span>


          <h1>
            {getGreeting()}{" "}
            {profile.username || "there"} 👋
          </h1>


          <p>
            Welcome back to Robinhood Advertising Network.
          </p>


          <span className="dashboard-last-updated">

            Last updated:{" "}

            {currentTime.toLocaleTimeString(
              undefined,
              {
                hour: "2-digit",
                minute: "2-digit",
              }
            )}

          </span>

        </div>

      </section>


      {/* =================================================
          ERROR
      ================================================= */}

      {error && (

        <div className="dashboard-error">

          <div className="dashboard-error-icon">
            <AlertCircle size={18} />
          </div>


          <div>

            <strong>
              Something went wrong
            </strong>


            <p>
              {error}
            </p>

          </div>


          <button
            type="button"
            onClick={fetchDashboardData}
          >

            <RefreshCw size={14} />

            Retry

          </button>

        </div>

      )}


      {!error && (

        <>

          {/* =================================================
              FINANCIAL OVERVIEW
          ================================================= */}

          <section className="dashboard-finance">

            <div className="dashboard-finance-header">

              <div>

                <span className="dashboard-eyebrow">
                  FINANCIAL OVERVIEW
                </span>


                <h2>
                  Your Finances
                </h2>


                <p>
                  Track your balance, earnings and
                  withdrawals in one place.
                </p>

              </div>


              <div className="dashboard-finance-header-icon">

                <Wallet size={22} />

              </div>

            </div>


            {/* AVAILABLE BALANCE */}

            <div className="dashboard-balance-panel">

              <div className="dashboard-balance-content">

                <div className="dashboard-balance-label">

                  <span className="dashboard-balance-icon">
                    <Wallet size={17} />
                  </span>


                  <span>
                    Available Balance
                  </span>

                </div>


                <strong className="dashboard-balance-value">

                  {formatKES(
                    wallet.balance
                  )}

                </strong>


                <span className="dashboard-balance-description">

                  Funds currently available
                  in your wallet

                </span>

              </div>


              <div className="dashboard-balance-symbol">

                <CircleDollarSign size={62} />

              </div>

            </div>


            {/* FINANCIAL STATISTICS */}

            <div className="dashboard-finance-stats">


              {/* TOTAL EARNED */}

              <article className="dashboard-finance-stat">

                <div className="dashboard-finance-stat-icon dashboard-icon-earned">

                  <TrendingUp size={18} />

                </div>


                <div className="dashboard-finance-stat-content">

                  <span>
                    Total Earned
                  </span>


                  <strong>

                    {formatKES(
                      wallet.total_earned
                    )}

                  </strong>


                  <small>
                    Lifetime earnings
                  </small>

                </div>

              </article>


              {/* TOTAL WITHDRAWN */}

              <article className="dashboard-finance-stat">

                <div className="dashboard-finance-stat-icon dashboard-icon-withdrawn">

                  <ArrowDownToLine size={18} />

                </div>


                <div className="dashboard-finance-stat-content">

                  <span>
                    Total Withdrawn
                  </span>


                  <strong>

                    {formatKES(
                      wallet.total_withdrawn
                    )}

                  </strong>


                  <small>
                    Lifetime withdrawals
                  </small>

                </div>

              </article>


              {/* DAILY REWARDS */}

              <article className="dashboard-finance-stat">

                <div className="dashboard-finance-stat-icon dashboard-icon-reward">

                  <CircleDollarSign size={18} />

                </div>


                <div className="dashboard-finance-stat-content">

                  <span>
                    Daily Rewards
                  </span>


                  <strong>

                    {formatKES(
                      totalDailyReward
                    )}

                  </strong>


                  <small>
                    Expected daily reward
                  </small>

                </div>

              </article>

            </div>

          </section>


          {/* =================================================
              LIFETIME EARNINGS
          ================================================= */}

          <section className="dashboard-earnings-section">

            <div className="dashboard-section-header">

              <div>

                <span className="dashboard-eyebrow">
                  EARNINGS PERFORMANCE
                </span>


                <h2>
                  Total Earnings represented in a graph
                </h2>


                <p>
                  Your cumulative earnings over time.
                </p>

              </div>


              <div className="dashboard-earnings-total">

                <span>
                  Total Earned
                </span>


                <strong>

                  {formatKES(
                    wallet.total_earned
                  )}

                </strong>

              </div>

            </div>


            {earnings.length === 0 ? (

              <div className="dashboard-earnings-empty">

                <TrendingUp size={24} />

                <p>
                  Your earnings history will appear here
                  once you start earning.
                </p>

              </div>

            ) : (

              <div className="dashboard-earnings-chart">

                <ResponsiveContainer
                  width="100%"
                  height={320}
                >

                  <AreaChart
                    data={earnings}
                    margin={{
                      top: 10,
                      right: 10,
                      left: 0,
                      bottom: 10,
                    }}
                  >

                    <defs>

                      <linearGradient
                        id="earningsGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >

                        <stop
                          offset="0%"
                          stopColor="#16a34a"
                          stopOpacity={0.35}
                        />


                        <stop
                          offset="100%"
                          stopColor="#16a34a"
                          stopOpacity={0.02}
                        />

                      </linearGradient>

                    </defs>


                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                    />


                    {/* X-AXIS */}

                    <XAxis
                      dataKey="date"
                      tickFormatter={formatChartDate}
                      tick={{
                        fontSize: 9,
                        fill: "#64748b",
                      }}
                      tickMargin={4}
                    />


                    {/* Y-AXIS */}

                    <YAxis
                      tickFormatter={(value) =>
                        `KES ${value}`
                      }
                      tick={{
                        fontSize: 9,
                        fill: "#64748b",
                      }}
                      width={75}
                      tickMargin={6}
                    />


                    <Tooltip
                      formatter={(value) => [
                        formatKES(value),
                        "Lifetime Earnings",
                      ]}
                      labelFormatter={formatChartDate}
                    />


                    <Area
                      type="monotone"
                      dataKey="cumulative"
                      stroke="#16a34a"
                      strokeWidth={3}
                      fill="url(#earningsGradient)"
                    />

                  </AreaChart>

                </ResponsiveContainer>

              </div>

            )}

          </section>


          {/* =================================================
              VIEW MORE DETAILS
          ================================================= */}

          <section className="dashboard-details-section">

            <button
              type="button"
              className={
                showDetails
                  ? "dashboard-details-button dashboard-details-button-open"
                  : "dashboard-details-button"
              }
              onClick={() =>
                setShowDetails(
                  (current) => !current
                )
              }
            >

              <span className="dashboard-details-button-left">

                <span className="dashboard-details-button-icon">

                  <TrendingUp size={16} />

                </span>


                <span>

                  {showDetails
                    ? "Hide Details"
                    : "View More"}

                </span>

              </span>


              <ChevronDown
                size={17}
                className={
                  showDetails
                    ? "dashboard-chevron dashboard-chevron-open"
                    : "dashboard-chevron"
                }
              />

            </button>


            {/* =================================================
                EXPANDED INSIGHTS
            ================================================= */}

            {showDetails && (

              <div className="dashboard-insights">

                <div className="dashboard-insights-header">

                  <div>

                    <span className="dashboard-eyebrow">
                      ACCOUNT INSIGHTS
                    </span>


                    <h2>
                      More Details
                    </h2>


                    <p>
                      Additional information about
                      your referrals and today's activity.
                    </p>

                  </div>

                </div>


                <div className="dashboard-insight-grid">


                  {/* ACTIVE REFERRALS */}
                  <article
  className="dashboard-insight-card"
  style={{
    gridColumn: "1 / -1",
  }}
>
  <div>
    <span className="dashboard-insight-label">
      Your Referral Link
    </span>

    <strong
      style={{
        fontSize: "12px",
        wordBreak: "break-all",
        marginTop: "10px",
      }}
    >
      {referralLink}
    </strong>

    <button
      type="button"
      onClick={copyReferralLink}
      className="dashboard-primary-button"
      style={{
        marginTop: "12px",
      }}
    >
      Copy Referral Link
    </button>
  </div>
</article>

                  <article className="dashboard-insight-card">

                    <div className="dashboard-insight-icon">

                      <Users size={17} />

                    </div>


                    <div>

                      <span className="dashboard-insight-label">
                        Active Referrals
                      </span>


                      <strong>
                        {referrals.active_referrals}
                      </strong>


                      <small>
                        Referrals with an active membership
                      </small>

                    </div>

                  </article>


                  {/* REFERRAL EARNINGS */}

                  <article className="dashboard-insight-card dashboard-insight-earnings">

                    <div className="dashboard-insight-icon">

                      <HandCoins size={17} />

                    </div>


                    <div>

                      <span className="dashboard-insight-label">
                        Referral Earnings
                      </span>


                      <strong>

                        {formatKES(
                          referrals.referral_earnings
                        )}

                      </strong>


                      <small>
                        Earnings from your referrals
                      </small>

                    </div>

                  </article>


                  {/* TODAY'S INCOME */}

                  <article className="dashboard-insight-card dashboard-insight-income">

                    <div className="dashboard-insight-icon">

                      <CalendarCheck size={17} />

                    </div>


                    <div>

                      <span className="dashboard-insight-label">
                        Today's Income
                      </span>


                      <strong>

                        {formatKES(
                          wallet.today_income
                        )}

                      </strong>


                      <small>
                        Completed income earned today
                      </small>

                    </div>

                  </article>


                  {/* TODAY'S WITHDRAWALS */}

                  <article className="dashboard-insight-card dashboard-insight-withdrawals">

                    <div className="dashboard-insight-icon">

                      <ArrowDownToLine size={17} />

                    </div>


                    <div>

                      <span className="dashboard-insight-label">
                        Today's Withdrawals
                      </span>


                      <strong>

                        {formatKES(
                          wallet.today_withdrawals
                        )}

                      </strong>


                      <small>
                        Completed withdrawals today
                      </small>

                    </div>

                  </article>

                </div>

              </div>

            )}

          </section>


          {/* =================================================
              ACTIVE MEMBERSHIPS
              DO NOT CHANGE THIS SECTION
          ================================================= */}

          <section className="dashboard-memberships-section">

            <div className="dashboard-section-header">

              <div>

                <span className="dashboard-eyebrow">
                  MEMBERSHIPS
                </span>


                <h2>
                  Active Memberships
                </h2>


                <p>
                  Your currently active membership
                  packages and their rewards.
                </p>

              </div>

            </div>


            {activeMemberships.length === 0 ? (

              <div className="dashboard-empty">

                <div className="dashboard-empty-icon">
                  +
                </div>


                <h3>
                  No Active Memberships
                </h3>


                <p>
                  You have not activated a membership
                  yet. Choose a membership package to
                  start earning rewards.
                </p>


                <a
                  href="/memberships"
                  className="dashboard-primary-button"
                >
                  View Memberships
                </a>

              </div>

            ) : (

              <div className="dashboard-membership-grid">

                {activeMemberships.map(
                  (membership) => (

                    <article
                      key={membership.id}
                      className="dashboard-membership-card"
                    >

                      <div className="dashboard-membership-header">

                        <div>

                          <span className="dashboard-membership-level">

                            LEVEL {membership.level}

                          </span>


                          <h3>
                            {membership.name}
                          </h3>

                        </div>


                        <div className="dashboard-membership-status">

                          <span className="dashboard-status-dot"></span>

                          <span>
                            Active
                          </span>

                        </div>

                      </div>


                      <div className="dashboard-membership-details">

                        <div className="dashboard-membership-detail">

                          <span>
                            Daily Reward
                          </span>


                          <strong>

                            {formatKES(
                              membership.daily_reward
                            )}

                          </strong>

                        </div>


                        <div className="dashboard-membership-detail">

                          <span>
                            Activation Fee
                          </span>


                          <strong>

                            {formatKES(
                              membership.activation_fee
                            )}

                          </strong>

                        </div>


                        <div className="dashboard-membership-detail">

                          <span>
                            Expiry Date
                          </span>


                          <strong>

                            {formatDate(
                              membership.expires_at
                            )}

                          </strong>

                        </div>

                      </div>

                    </article>

                  )
                )}

              </div>

            )}

          </section>

        </>

      )}

    </div>
  );
}


export default Dashboard;