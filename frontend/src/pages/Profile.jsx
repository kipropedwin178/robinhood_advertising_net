import { useEffect, useState } from "react";

import { getMyProfile } from "../services/userService";

import "./Profile.css";


function Profile() {

  const [profile, setProfile] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [copied, setCopied] =
    useState(false);


  // =====================================================
  // LOAD PROFILE
  // =====================================================

  const loadProfile = async () => {

    try {

      setLoading(true);
      setError("");

      const data =
        await getMyProfile();

      setProfile(data);

    } catch (error) {

      console.error(
        "Profile error:",
        error
      );

      setError(
        error.response?.data?.detail ||
        "Unable to load your profile."
      );

    } finally {

      setLoading(false);

    }

  };


  useEffect(() => {

    loadProfile();

  }, []);


  // =====================================================
  // FORMAT JOINED DATE
  // =====================================================

  const formatJoinedDate = (
    dateValue
  ) => {

    if (!dateValue) {
      return "Not available";
    }

    const date =
      new Date(dateValue);

    if (Number.isNaN(
      date.getTime()
    )) {
      return "Not available";
    }

    const day =
      String(
        date.getDate()
      ).padStart(2, "0");

    const month =
      String(
        date.getMonth() + 1
      ).padStart(2, "0");

    const year =
      date.getFullYear();

    return `${day}/${month}/${year}`;

  };


  // =====================================================
  // ACCOUNT ROLE
  // =====================================================

  const getDisplayRole = (
    role
  ) => {

    if (
      role === "USER"
    ) {
      return "MARKETER";
    }

    return role || "MARKETER";

  };


  // =====================================================
  // REFERRAL LINK
  // =====================================================

  const referralLink =
    profile
      ? `${window.location.origin}/register?ref=${encodeURIComponent(
          profile.referral_code
        )}`
      : "";


  // =====================================================
  // COPY REFERRAL LINK
  // =====================================================

  const handleCopyReferralLink =
    async () => {

      if (!referralLink) {
        return;
      }

      try {

        await navigator.clipboard.writeText(
          referralLink
        );

        setCopied(true);

        setTimeout(() => {

          setCopied(false);

        }, 2000);

      } catch (error) {

        console.error(
          "Copy referral link error:",
          error
        );

      }

    };


  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {

    return (

      <div className="profile-page">

        <div className="profile-loading">

          <div className="profile-spinner"></div>

          <p>
            Loading profile...
          </p>

        </div>

      </div>

    );

  }


  // =====================================================
  // ERROR
  // =====================================================

  if (error) {

    return (

      <div className="profile-page">

        <div className="profile-error">

          <h2>
            Profile Unavailable
          </h2>

          <p>
            {error}
          </p>

          <button
            type="button"
            onClick={loadProfile}
          >
            Try Again
          </button>

        </div>

      </div>

    );

  }


  if (!profile) {
    return null;
  }


  // =====================================================
  // PROFILE
  // =====================================================

  return (

    <div className="profile-page">


      {/* =================================================
          HEADER
      ================================================= */}

      <div className="profile-header">

        <div className="profile-avatar">

          {profile.username
            ?.charAt(0)
            ?.toUpperCase() || "U"}

        </div>


        <div>

          <h1>
            My Profile
          </h1>

          <p>
            View your account information.
          </p>

        </div>

      </div>


      {/* =================================================
          STATUS CARD
      ================================================= */}

      <div className="profile-status-card">

        <div>

          <span>
            Account Status
          </span>

          <strong
            className={
              profile.is_active
                ? "status-active"
                : "status-inactive"
            }
          >

            <span className="status-dot"></span>

            {profile.is_active
              ? "Active"
              : "Inactive"}

          </strong>

        </div>


        <div>

          <span>
            Account Type
          </span>

          <strong>
            {getDisplayRole(
              profile.role
            )}
          </strong>

        </div>

      </div>


      {/* =================================================
          PERSONAL INFORMATION
      ================================================= */}

      <section className="profile-section">

        <div className="profile-section-header">

          <h2>
            Personal Information
          </h2>

        </div>


        <div className="profile-info-grid">


          {/* USERNAME */}

          <div className="profile-info-item">

            <span>
              Username
            </span>

            <strong>
              {profile.username}
            </strong>

          </div>


          {/* EMAIL */}

          <div className="profile-info-item">

            <span>
              Email Address
            </span>

            <strong>
              {profile.email}
            </strong>

          </div>


          {/* PHONE */}

          <div className="profile-info-item">

            <span>
              Phone Number
            </span>

            <strong>
              {profile.phone_number ||
                "Not provided"}
            </strong>

          </div>


          {/* JOINED DATE */}

          <div className="profile-info-item">

            <span>
              Joined Date
            </span>

            <strong>
              {formatJoinedDate(
                profile.created_at
              )}
            </strong>

          </div>

        </div>

      </section>


      {/* =================================================
          REFERRAL INFORMATION
      ================================================= */}

      <section className="profile-section">

        <div className="profile-section-header">

          <h2>
            Referral Information
          </h2>

          <p>
            Share your referral link and invite
            new marketers to join.
          </p>

        </div>


        <div className="referral-code-card">

          <div className="referral-link-content">

            <span>
              Your Referral Link
            </span>

            <strong>
              {referralLink}
            </strong>

          </div>


          <button
            type="button"
            onClick={
              handleCopyReferralLink
            }
          >

            {copied
              ? "Copied!"
              : "Copy Link"}

          </button>

        </div>

      </section>


      {/* =================================================
          ACCOUNT INFORMATION
      ================================================= */}

      <section className="profile-section">

        <div className="profile-section-header">

          <h2>
            Account Information
          </h2>

        </div>


        <div className="profile-info-grid">


          {/* ACCOUNT ROLE */}

          <div className="profile-info-item">

            <span>
              Account Type
            </span>

            <strong>
              {getDisplayRole(
                profile.role
              )}
            </strong>

          </div>


          {/* JOINED DATE */}

          <div className="profile-info-item">

            <span>
              Joined Date
            </span>

            <strong>
              {formatJoinedDate(
                profile.created_at
              )}
            </strong>

          </div>


          {/* STATUS */}

          <div className="profile-info-item">

            <span>
              Account Status
            </span>

            <strong
              className={
                profile.is_active
                  ? "status-active"
                  : "status-inactive"
              }
            >
              {profile.is_active
                ? "Active"
                : "Inactive"}
            </strong>

          </div>

        </div>

      </section>


    </div>

  );

}


export default Profile;