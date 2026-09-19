import {
  Building2,
  Target,
  ShieldCheck,
  BriefcaseBusiness,
  Home,
  UserRound,
  Mail,
  FileText,
  LockKeyhole,
  Accessibility,
  MapPin,
  Clock3,
  Phone,
} from "lucide-react";

import {
  Link,
} from "react-router-dom";

import "./Footer.css";


function Footer() {


  return (
    <footer className="site-footer">

      <div className="site-footer-main">

        <div className="site-footer-container">


          {/* =================================================
              COMPANY
          ================================================= */}

          <div className="site-footer-column company-column">

            <Link
              to="/dashboard"
              className="footer-brand"
            >

              <span className="footer-brand-mark">
                RBH
              </span>

              <span className="footer-brand-name">
                RobinHood
              </span>

            </Link>


            <p className="footer-description">
              RobinHood is a modern digital platform
              designed to provide members with
              advertising, membership and reward
              opportunities through a simple and
              accessible online experience.
            </p>


            <div className="footer-company-links">

              <Link to="/about">
                <Building2 size={15} />
                About Us
              </Link>


              <Link to="/about#mission">
                <Target size={15} />
                Our Mission
              </Link>


              <Link to="/about#why-choose-us">
                <ShieldCheck size={15} />
                Why Choose RobinHood
              </Link>


              <Link to="/about#careers">
                <BriefcaseBusiness size={15} />
                Careers
              </Link>

            </div>

          </div>


          {/* =================================================
              QUICK LINKS
          ================================================= */}

          <div className="site-footer-column">

            <h3>
              Quick Links
            </h3>


            <div className="footer-link-list">

              <Link to="/dashboard">
                <Home size={15} />
                Home
              </Link>


              <Link to="/profile">
                <UserRound size={15} />
                My Account
              </Link>


              <Link to="/about">
                <Building2 size={15} />
                About Us
              </Link>


              <Link to="/about#contact">
                <Mail size={15} />
                Contact Us
              </Link>

            </div>

          </div>


          {/* =================================================
              LEGAL & POLICIES
          ================================================= */}

          <div className="site-footer-column">

            <h3>
              Legal & Policies
            </h3>


            <div className="footer-link-list">

              <Link to="/about#terms">
                <FileText size={15} />
                Terms & Conditions
              </Link>


              <Link to="/about#privacy">
                <LockKeyhole size={15} />
                Privacy Policy
              </Link>


              <Link to="/about#user-agreement">
                <ShieldCheck size={15} />
                User Agreement
              </Link>

            </div>

          </div>


          {/* =================================================
              CONTACT
          ================================================= */}

          <div className="site-footer-column">

            <h3>
              Contact Us
            </h3>


            <div className="footer-contact-list">

              <div className="footer-contact-item">

                <Mail size={17} />

                <div>

                  <span>
                    Email
                  </span>

                  <strong>
                    [Email Address]
                  </strong>

                </div>

              </div>


              <div className="footer-contact-item">

                <Phone size={17} />

                <div>

                  <span>
                    Phone
                  </span>

                  <strong>
                    [Phone Number]
                  </strong>

                </div>

              </div>


              <div className="footer-contact-item">

                <MapPin size={17} />

                <div>

                  <span>
                    Location
                  </span>

                  <strong>
                    [Business Location]
                  </strong>

                </div>

              </div>


              <div className="footer-contact-item">

                <Clock3 size={17} />

                <div>

                  <span>
                    Customer Support
                  </span>

                  <strong>
                    24 Hours
                  </strong>

                </div>

              </div>

            </div>


            <div className="footer-contact-note">

              <span>
                💸💶💷💲
              </span>

            </div>

          </div>

        </div>

      </div>


      {/* =================================================
          BOTTOM BAR
      ================================================= */}

      <div className="site-footer-bottom">

        <div className="site-footer-bottom-inner">

          <p>
            © 2026 RobinHood. All rights reserved.
          </p>


          <div className="footer-bottom-links">

            <Link to="/about#privacy">
              Privacy
            </Link>


            <Link to="/about#terms">
              Terms
            </Link>


            <Link to="/about#user-agreement">
              User Agreement
            </Link>


            <Link to="/about#accessibility">
              <Accessibility size={13} />
              Accessibility
            </Link>

          </div>

        </div>

      </div>

    </footer>
  );
}


export default Footer;