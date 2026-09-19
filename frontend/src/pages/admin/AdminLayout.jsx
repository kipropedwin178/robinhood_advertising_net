import {
  NavLink,
  Outlet,
  useNavigate
} from "react-router-dom";

import "./AdminLayout.css";


function AdminLayout() {

  const navigate = useNavigate();


  const handleLogout = () => {

    localStorage.removeItem(
      "access_token"
    );

    navigate(
      "/edutech/login"
    );

  };


  return (

    <div className="admin-layout">


      <aside className="admin-sidebar">


        <div className="admin-sidebar-brand">

          <h1>
            Robinhood
          </h1>

          <span>
            Admin Control Center
          </span>

        </div>


        <nav className="admin-sidebar-nav">


          <NavLink
            to="/edutech"
            end
            className="admin-nav-link"
          >
            Dashboard
          </NavLink>


          <NavLink
            to="/edutech/users"
            className="admin-nav-link"
          >
            Users
          </NavLink>


          <NavLink
            to="/edutech/memberships"
            className="admin-nav-link"
          >
            Memberships
          </NavLink>


          <NavLink
            to="/edutech/deposits"
            className="admin-nav-link"
          >
            Deposits
          </NavLink>


          <NavLink
            to="/edutech/withdrawals"
            className="admin-nav-link"
          >
            Withdrawals
          </NavLink>


          <NavLink
            to="/edutech/transactions"
            className="admin-nav-link"
          >
            Transactions
          </NavLink>


          <NavLink
            to="/edutech/payment-settings"
            className="admin-nav-link"
          >
            Payment Settings
          </NavLink>


        </nav>


        <div className="admin-sidebar-footer">

          <button
            type="button"
            className="admin-sidebar-logout"
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>


      </aside>


      <div className="admin-layout-main">


        <header className="admin-layout-header">

          <div>

            <h2>
              Robinhood Admin
            </h2>

            <p>
              Administration Panel
            </p>

          </div>

        </header>


        <main className="admin-layout-content">

          <Outlet />

        </main>


      </div>


    </div>

  );
}


export default AdminLayout;