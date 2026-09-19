import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

import "./AdminLogin.css";
import { loginAdmin } from "../../services/authService";


function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);


  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const data = await loginAdmin(
        email,
        password
      );

      const token = data.access_token;

      const decodedToken = jwtDecode(token);

      const role = decodedToken.role;

      if (
        role !== "ADMIN" &&
        role !== "SUPER_ADMIN"
      ) {
        localStorage.removeItem("access_token");

        setError(
          "Access denied. Admin privileges are required."
        );

        return;
      }

      localStorage.setItem(
        "access_token",
        token
      );

      navigate("/edutech");

    } catch (error) {
      const message =
        error.response?.data?.detail ||
        "Login failed. Please check your credentials.";

      setError(message);

    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="admin-login-container">

      <div className="admin-login-card">

        <div className="admin-login-header">

          <h1 className="admin-login-title">
            Robinhood Admin
          </h1>

          <p className="admin-login-subtitle">
            Sign in to the Admin Control Center
          </p>

        </div>


        {error && (
          <div className="admin-login-error">
            {error}
          </div>
        )}


        <form
          className="admin-login-form"
          onSubmit={handleSubmit}
        >

          <div className="admin-form-group">

            <label htmlFor="admin-email">
              Email
            </label>

            <input
              id="admin-email"
              type="email"
              className="admin-form-control"
              placeholder="Enter admin email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              required
            />

          </div>


          <div className="admin-form-group">

            <label htmlFor="admin-password">
              Password
            </label>

            <input
              id="admin-password"
              type="password"
              className="admin-form-control"
              placeholder="Enter password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              required
            />

          </div>


          <button
            type="submit"
            className="admin-login-btn"
            disabled={loading}
          >
            {loading
              ? "Signing in..."
              : "Sign In"}
          </button>

        </form>

      </div>

    </div>
  );
}


export default AdminLogin;