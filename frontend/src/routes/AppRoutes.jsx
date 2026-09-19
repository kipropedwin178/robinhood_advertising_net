import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import AdminLogin from "../pages/admin/AdminLogin";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminUsers from "../pages/admin/AdminUsers";
import AdminUserDetails from "../pages/admin/AdminUserDetails";
import AdminMemberships from "../pages/admin/AdminMemberships";
import AdminDeposits from "../pages/admin/AdminDeposits";
import AdminWithdrawals from "../pages/admin/AdminWithdrawals";
import AdminTransactions from "../pages/admin/AdminTransactions";
import AdminLayout from "../pages/admin/AdminLayout";

import Login from "../pages/Login";
import Register from "../pages/Register";
import Dashboard from "../pages/Dashboard";
import Memberships from "../pages/Memberships";
import UserLayout from "../pages/UserLayout";
import Tasks from "../pages/Tasks";
import Profile from "../pages/Profile";
import History from "../pages/History";
import Deposit from "../pages/Deposit";
import Withdraw from "../pages/Withdraw";
import About from "../pages/About";
import ScrollToTop from "../components/ScrollToTop";

import AdminProtectedRoute from "./AdminProtectedRoute";
import UserProtectedRoute from "./UserProtectedRoute";
import AdminPaymentSettings from "../pages/admin/AdminPaymentSettings";


function AppRoutes() {

  return (

    <BrowserRouter>
     <ScrollToTop />

      <Routes>


        {/* =================================================
            DEFAULT
        ================================================= */}

        <Route
          path="/"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />


        {/* =================================================
            USER AUTH
        ================================================= */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />


        {/* =================================================
            USER PANEL
        ================================================= */}

        <Route element={<UserProtectedRoute />}>

          <Route element={<UserLayout />}>


            <Route
              path="/dashboard"
              element={<Dashboard />}
            />


            <Route
              path="/memberships"
              element={<Memberships />}
            />


            <Route
              path="/tasks"
              element={<Tasks />}
            />


            <Route
              path="/history"
              element={<History />}
            />
            <Route
  path="/about"
  element={<About />}
/>


            <Route
              path="/profile"
              element={<Profile />}
            />


            <Route
              path="/deposit"
              element={<Deposit />}
            />


            <Route
              path="/withdraw"
              element={<Withdraw />}
            />


          </Route>

        </Route>


        {/* =================================================
            ADMIN LOGIN
        ================================================= */}

        <Route
          path="/edutech/login"
          element={<AdminLogin />}
        />


        {/* =================================================
            ADMIN PANEL
        ================================================= */}

        <Route element={<AdminProtectedRoute />}>

          <Route element={<AdminLayout />}>


            <Route
              path="/edutech"
              element={<AdminDashboard />}
            />


            <Route
              path="/edutech/users"
              element={<AdminUsers />}
            />


            <Route
              path="/edutech/users/:userId"
              element={<AdminUserDetails />}
            />


            <Route
              path="/edutech/memberships"
              element={<AdminMemberships />}
            />


            <Route
              path="/edutech/deposits"
              element={<AdminDeposits />}
            />


            <Route
              path="/edutech/withdrawals"
              element={<AdminWithdrawals />}
            />


            <Route
              path="/edutech/transactions"
              element={<AdminTransactions />}
            />


            <Route
              path="/edutech/payment-settings"
              element={<AdminPaymentSettings />}
            />


          </Route>

        </Route>


        {/* =================================================
            UNKNOWN ROUTES
        ================================================= */}

        <Route
          path="*"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />


      </Routes>

    </BrowserRouter>

  );
}


export default AppRoutes;