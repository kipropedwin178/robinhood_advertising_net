import { useState } from "react";
import {
  useNavigate,
  useSearchParams
} from "react-router-dom";

import api from "../services/api";

import "./Register.css";


function Register() {

  const navigate = useNavigate();

  const [searchParams] =
    useSearchParams();

  const referralCode =
    searchParams.get("ref");


  const [formData, setFormData] =
    useState({
      username: "",
      email: "",
      phone_number: "",
      password: "",
      confirmPassword: ""
    });


  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");


  const handleChange = (event) => {

    setFormData({
      ...formData,
      [event.target.name]:
        event.target.value
    });

  };


  const handleSubmit = async (
    event
  ) => {

    event.preventDefault();

    setError("");


    // -----------------------------------------------------
    // Validate required fields
    // -----------------------------------------------------

    if (
      !formData.username.trim() ||
      !formData.email.trim() ||
      !formData.phone_number.trim() ||
      !formData.password
    ) {

      setError(
        "Please fill in all required fields."
      );

      return;
    }


    // -----------------------------------------------------
    // Confirm password
    // -----------------------------------------------------

    if (
      formData.password !==
      formData.confirmPassword
    ) {

      setError(
        "Passwords do not match."
      );

      return;
    }


    try {

      setLoading(true);


      // ---------------------------------------------------
      // Registration payload
      // ---------------------------------------------------

      const payload = {
        username:
          formData.username.trim(),

        email:
          formData.email.trim(),

        phone_number:
          formData.phone_number.trim(),

        password:
          formData.password
      };


      // ---------------------------------------------------
      // Registration URL
      // ---------------------------------------------------

      let url =
        "/api/auth/register";


      if (referralCode) {

        url +=
          `?ref=${encodeURIComponent(
            referralCode
          )}`;

      }


      // ---------------------------------------------------
      // Register user
      // ---------------------------------------------------

      const response =
        await api.post(
          url,
          payload
        );


      // ---------------------------------------------------
      // Get JWT token
      // ---------------------------------------------------

      const accessToken =
        response.data?.access_token;


      if (!accessToken) {

        throw new Error(
          "Registration succeeded but no authentication token was returned."
        );

      }


      // ---------------------------------------------------
      // Save token
      // ---------------------------------------------------

      localStorage.setItem(
        "access_token",
        accessToken
      );


      // ---------------------------------------------------
      // Go directly to dashboard
      // ---------------------------------------------------

      navigate(
        "/dashboard",
        {
          replace: true
        }
      );

    } catch (error) {

      console.error(
        "Registration error:",
        error
      );


      setError(
        error.response?.data?.detail ||
        error.message ||
        "Unable to create account."
      );

    } finally {

      setLoading(false);

    }

  };


  return (

    <div className="register-page">

      <div className="register-card">


        <div className="register-logo">
          RBH
        </div>


        <h1>
          Create Account
        </h1>


        <p className="register-subtitle">
          Join Robinhood Advertising Network.
        </p>


        {referralCode && (

          <div className="register-referral">

            Referral Code:
            {" "}

            <strong>
              {referralCode}
            </strong>

          </div>

        )}


        {error && (

          <div className="register-error">

            {error}

          </div>

        )}


        <form
          onSubmit={handleSubmit}
          className="register-form"
        >


          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            disabled={loading}
          />


          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            disabled={loading}
          />


          <input
            type="text"
            name="phone_number"
            placeholder="Phone Number"
            value={formData.phone_number}
            onChange={handleChange}
            disabled={loading}
          />


          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            disabled={loading}
          />


          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={
              formData.confirmPassword
            }
            onChange={handleChange}
            disabled={loading}
          />


          <button
            type="submit"
            disabled={loading}
          >

            {loading
              ? "Creating Account..."
              : "Create Account"}

          </button>


        </form>


        <div className="register-login">

          <span>
            Already have an account?
          </span>


          <button
            type="button"
            onClick={() =>
              navigate("/login")
            }
            disabled={loading}
          >
            Sign In
          </button>

        </div>


      </div>

    </div>

  );

}


export default Register;