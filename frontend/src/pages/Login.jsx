import { useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../services/api";

import "./Login.css";


function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");


  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");


    if (!email.trim() || !password) {
      setError(
        "Please enter your email and password."
      );

      return;
    }


    try {
      setLoading(true);


      const formData = new URLSearchParams();

      formData.append(
        "username",
        email.trim()
      );

      formData.append(
        "password",
        password
      );


      const response = await api.post(
        "/api/auth/login",
        formData,
        {
          headers: {
            "Content-Type":
              "application/x-www-form-urlencoded",
          },
        }
      );


      const token =
        response.data.access_token;


      if (!token) {
        throw new Error(
          "Login token was not returned."
        );
      }


      localStorage.setItem(
        "access_token",
        token
      );


      navigate("/dashboard");

    } catch (error) {

      console.error(
        "User login error:",
        error
      );


      setError(
        error.response?.data?.detail ||
        "Invalid email or password."
      );

    } finally {

      setLoading(false);

    }
  };


  return (
    <div className="login-page">

      <div className="login-card">

        {/* =================================================
            LOGO
        ================================================= */}

        <div className="login-logo">
          RBH
        </div>


        <h1>
          Welcome Back
        </h1>

        <p className="login-subtitle">
          Sign in to your Robinhood Advertising
          Network account.
        </p>


        {/* =================================================
            ERROR
        ================================================= */}

        {error && (

          <div className="login-error">

            <span>
              !
            </span>

            <p>
              {error}
            </p>

          </div>

        )}


        {/* =================================================
            FORM
        ================================================= */}

        <form
          onSubmit={handleSubmit}
          className="login-form"
        >

          {/* Email */}

          <div className="login-field">

            <label htmlFor="email">
              Email Address
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="Enter your email"
              autoComplete="email"
              disabled={loading}
            />

          </div>


          {/* Password */}

          <div className="login-field">

            <label htmlFor="password">
              Password
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="Enter your password"
              autoComplete="current-password"
              disabled={loading}
            />

          </div>


          {/* Submit */}

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading
              ? "Signing in..."
              : "Sign In"}
          </button>

        </form>


        {/* =================================================
            REGISTER
        ================================================= */}

        <div className="login-register">

          <span>
            Don't have an account?
          </span>

          <button
            type="button"
            onClick={() => navigate("/register")}
          >
            Create Account
          </button>

        </div>

      </div>

    </div>
  );
}


export default Login;