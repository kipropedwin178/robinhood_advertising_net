import {
  Target,
  ShieldCheck,
  Users,
  ArrowRight,
  Building2,
  Mail,
  Phone,
  MapPin,
  Accessibility,
  FileText,
  LockKeyhole,
} from "lucide-react";

import {
  Link,
} from "react-router-dom";

import "./About.css";


function About() {

  return (
    <div className="about-page">


      {/* =================================================
          HERO / ABOUT US
      ================================================= */}

      <section
        id="about-us"
        className="about-hero"
      >

        <div className="about-hero-content">

          <span className="about-eyebrow">
            ABOUT ROBINHOOD
          </span>


          <h1>
            Building a simpler digital
            experience for modern members.
          </h1>


          <p>
            Robinhood Advertising Network is a
            modern digital advertising platform
            created to bridge the gap between
            businesses seeking effective online
            exposure and individuals looking to earn
            through social media engagement.

            Our platform provides a secure,
            transparent, and innovative environment
            where companies can promote their
            products, services, and brands to a
            wider audience. At the same time,
            members participate in structured
            promotional activities and receive
            commission for their contributions.

            In today's digital economy, businesses
            require more than traditional advertising
            methods to reach potential customers.
            Consumers spend a significant portion of
            their time on social media platforms,
            making social sharing one of the most
            powerful marketing tools available.

            Robinhood Advertising Network leverages
            this opportunity by connecting businesses
            with an active community of members who
            help amplify marketing campaigns through
            responsible and authentic social media
            engagement.

            Our platform is designed to serve
            businesses of all sizes, from startups
            and growing enterprises to established
            national and international brands.

            Through Robinhood, companies can increase
            visibility, strengthen brand awareness,
            drive engagement, and expand their reach
            across multiple social media channels.

            At the same time, members gain access to
            rewarding opportunities that allow them
            to participate in digital marketing
            campaigns and earn incentives for
            completed promotional activities.
          </p>

        </div>

      </section>


      {/* =================================================
          MISSION
      ================================================= */}

      <section
        id="mission"
        className="about-section"
      >

        <div className="about-section-heading">

          <span>
            OUR MISSION
          </span>


          <h2>
            Technology that works for people.
          </h2>


          <p>
            Our mission is to create a trusted and
            secure advertising ecosystem where
            businesses can effectively promote their
            products and services while empowering
            members to earn commission through
            responsible social media participation.

            We aim to deliver measurable value to
            advertisers, meaningful opportunities to
            our members, and sustainable growth for
            all stakeholders through innovation,
            transparency, and excellence.
          </p>

        </div>


        <div className="about-feature-grid">


          {/* =================================================
              VISION
          ================================================= */}

          <article className="about-feature-card">

            <div className="about-feature-icon">
              <Target size={21} />
            </div>


            <h3>
              Vision
            </h3>


            <p>
              To become the leading community-powered
              advertising network that empowers
              businesses to achieve exceptional
              visibility while creating rewarding
              opportunities for individuals worldwide
              through secure, innovative, and
              transparent digital marketing solutions.
            </p>

          </article>


          {/* =================================================
              SECURITY & TRUST
          ================================================= */}

          <article className="about-feature-card">

            <div className="about-feature-icon">
              <ShieldCheck size={21} />
            </div>


            <h3>
              Trust & Security
            </h3>


            <p>
              Security, fairness, and transparency
              are at the heart of everything we do.

              We are committed to providing a
              reliable platform that protects both
              advertisers and members while
              maintaining high standards of
              accountability, integrity, and trust.

              Our systems, processes, and policies
              are continuously reviewed and improved
              to promote a secure and dependable
              user experience.

              By combining technology, community
              participation, and innovative
              advertising strategies, Robinhood
              Advertising Network is helping shape
              the future of digital marketing while
              building lasting confidence among
              businesses and members alike.
            </p>

          </article>


          {/* =================================================
              MEMBER FOCUSED
          ================================================= */}

          <article className="about-feature-card">

            <div className="about-feature-icon">
              <Users size={21} />
            </div>


            <h3>
              Member Focused
            </h3>


            <p>
              Our platform is designed around
              usability, clarity and convenience.

              We strive to create an accessible
              experience that makes it easy for
              members to participate in digital
              advertising opportunities.
            </p>

          </article>

        </div>

      </section>


      {/* =================================================
          WHY CHOOSE ROBINHOOD
      ================================================= */}

      <section
        id="why-choose-us"
        className="about-section"
      >

        <div className="about-section-heading">

          <span>
            WHY CHOOSE ROBINHOOD
          </span>


          <h2>
            Connecting businesses with
            engaged communities.
          </h2>


          <p>
            Robinhood Advertising Network offers
            businesses a unique advantage by
            combining modern advertising technology
            with the power of community-driven
            promotion.

            Unlike conventional advertising channels
            that often require substantial marketing
            budgets with uncertain results, our
            platform enables businesses to connect
            directly with an engaged audience of
            members who actively participate in
            spreading brand awareness.

            This creates a more organic and expansive
            marketing reach while helping businesses
            generate greater visibility and customer
            engagement.

            Whether a company is launching a new
            product, promoting a service, or
            increasing brand recognition, Robinhood
            provides an efficient and scalable
            advertising solution designed for today's
            digital marketplace.

            For members, Robinhood creates
            opportunities to become active
            participants in the advertising process
            while earning commission for completed
            promotional activities.

            Our secure platform ensures that members
            can access opportunities in a transparent
            environment where tasks, rewards, and
            participation guidelines are clearly
            defined.

            We are committed to maintaining a fair
            and trustworthy ecosystem that benefits
            both advertisers and members alike.

            Through continuous innovation, robust
            security measures, and a customer-focused
            approach, Robinhood Advertising Network
            remains dedicated to building long-term
            relationships and delivering value to
            everyone who joins our growing community.
          </p>

        </div>

      </section>


      {/* =================================================
          CAREERS
      ================================================= */}

      <section
        id="careers"
        className="about-section"
      >

        <div className="about-section-heading">

          <span>
            CAREER OPPORTUNITIES
          </span>


          <h2>
            Build the future with RobinHood.
          </h2>


          <p>
            As Robinhood Advertising Network
            continues to grow, we are committed to
            creating exciting career opportunities
            for talented and passionate individuals.

            We believe that innovation is driven by
            people, and we are always looking for
            professionals who share our vision of
            transforming digital advertising.

            Career opportunities may include:
          </p>

        </div>


        <div className="about-feature-grid">


          <article className="about-feature-card">

            <h3>
              Technology
            </h3>

            <p>
              Software Engineers
              <br />
              Mobile Application Developers
              <br />
              UI/UX Designers
              <br />
              Data Analysts
              <br />
              Cybersecurity Specialists
              <br />
              Quality Assurance Engineers
            </p>

          </article>


          <article className="about-feature-card">

            <h3>
              Marketing & Business
            </h3>

            <p>
              Digital Marketing Specialists
              <br />
              Social Media Managers
              <br />
              Business Development Officers
              <br />
              Sales and Marketing Executives
              <br />
              Product Managers
            </p>

          </article>


          <article className="about-feature-card">

            <h3>
              Operations
            </h3>

            <p>
              Customer Support Representatives
              <br />
              Human Resource Professionals
              <br />
              Finance and Accounting Officers
            </p>

          </article>

        </div>


        <div className="about-section-heading careers-ending">

          <p>
            We welcome individuals who are innovative,
            driven, and passionate about technology,
            digital marketing, and customer success.

            Together, we can build a future where
            businesses grow through effective
            advertising and members benefit from
            meaningful opportunities in the digital
            economy.
          </p>

        </div>

      </section>


      {/* =================================================
          CONTACT US
      ================================================= */}

      <section
        id="contact"
        className="about-section"
      >

        <div className="about-section-heading">

          <span>
            CONTACT US
          </span>


          <h2>
            We are here to assist you.
          </h2>


          <p>
            Whether you are a member looking for
            assistance or a business interested in
            advertising opportunities, our team is
            available to help.

            You can reach Robinhood Advertising
            Network through the contact information
            provided by the platform administration.
          </p>

        </div>


        <div className="about-feature-grid">


          <article className="about-feature-card">

            <div className="about-feature-icon">
              <Mail size={21} />
            </div>


            <h3>
              Email
            </h3>


            <p>
              [Email Address]
            </p>

          </article>


          <article className="about-feature-card">

            <div className="about-feature-icon">
              <Phone size={21} />
            </div>


            <h3>
              Phone
            </h3>


            <p>
              [Phone Number]
            </p>

          </article>


          <article className="about-feature-card">

            <div className="about-feature-icon">
              <MapPin size={21} />
            </div>


            <h3>
              Location
            </h3>


            <p>
              [Business Location]
            </p>

          </article>

        </div>

      </section>


      {/* =================================================
          TERMS & CONDITIONS
      ================================================= */}

      <section
        id="terms"
        className="about-section legal-section"
      >

        <div className="about-section-heading">

          <span>
            TERMS & CONDITIONS
          </span>


          <h2>
            Platform Terms of Use
          </h2>


          <p>
            By accessing and using Robinhood Advertising
            Network, you agree to comply with all platform
            rules, policies, and applicable laws.

            Users are responsible for providing accurate
            registration information and maintaining the
            confidentiality of their account credentials.

            Members may only operate one account unless
            otherwise authorized by the platform.

            Any attempt to manipulate rewards, submit
            fraudulent information, abuse promotional
            activities, or engage in misleading practices
            may result in account suspension or permanent
            termination.

            Robinhood Advertising Network reserves the
            right to modify platform features, services,
            membership structures, and policies when
            necessary to improve operations and user
            experience.

            Continued use of the platform constitutes
            acceptance of these terms and any future
            updates.
          </p>

        </div>

      </section>


      {/* =================================================
          PRIVACY POLICY
      ================================================= */}

      <section
        id="privacy"
        className="about-section legal-section"
      >

        <div className="about-section-heading">

          <span>
            PRIVACY POLICY
          </span>


          <h2>
            Protecting Your Information
          </h2>


          <p>
            Robinhood Advertising Network values the
            privacy of its members, advertisers, and
            visitors.

            We may collect information such as names,
            email addresses, phone numbers, account
            activity, transaction records, and platform
            usage data to provide our services
            effectively.

            Information collected is used for account
            management, security verification, reward
            processing, customer support, platform
            improvements, and legal compliance.

            We do not sell personal information to third
            parties. Reasonable administrative,
            technical, and security measures are
            implemented to help protect user data from
            unauthorized access, disclosure, or misuse.

            Users who have privacy concerns may contact
            platform support for assistance regarding
            their personal information.
          </p>

        </div>

      </section>


      {/* =================================================
          USER AGREEMENT
      ================================================= */}

      <section
        id="user-agreement"
        className="about-section legal-section"
      >

        <div className="about-section-heading">

          <span>
            USER AGREEMENT
          </span>


          <h2>
            Member and Advertiser Responsibilities
          </h2>


          <p>
            By creating an account or using Robinhood
            Advertising Network, users agree to act
            honestly, responsibly, and in accordance
            with all platform policies.

            Members agree to complete promotional
            activities genuinely and in compliance with
            campaign requirements.

            Advertisers agree to provide lawful,
            accurate, and appropriate advertising
            content.

            Robinhood Advertising Network reserves the
            right to investigate suspicious activity,
            review user conduct, and suspend or
            terminate accounts involved in fraud,
            abuse, manipulation, or violations of
            platform policies.

            The platform may update services,
            technologies, and operational procedures as
            business requirements evolve.

            Continued use of the platform indicates
            acceptance of this agreement and future
            policy updates.
          </p>

        </div>

      </section>


      {/* =================================================
          ACCESSIBILITY
      ================================================= */}

      <section
        id="accessibility"
        className="about-section legal-section"
      >

        <div className="about-section-heading">

          <span>
            ACCESSIBILITY
          </span>


          <h2>
            Inclusive Access For Everyone
          </h2>


          <p>
            Robinhood Advertising Network is committed
            to making its platform accessible and easy
            to use for all users.

            Our services are designed to function across
            desktop computers, tablets, and mobile
            devices while maintaining a consistent user
            experience.

            We continuously improve platform usability,
            navigation, readability, and performance to
            enhance accessibility for a diverse range of
            users.

            If you experience any accessibility
            challenges while using our platform, we
            encourage you to contact our support team so
            that we can continue improving our services.
          </p>

        </div>

      </section>


      {/* =================================================
          CTA
      ================================================= */}

      <section className="about-cta">

        <div>

          <span>
            READY TO EXPLORE?
          </span>


          <h2>
            Continue to your RobinHood dashboard.
          </h2>

        </div>


        <Link
          to="/dashboard"
          className="about-cta-button"
        >
          Go to Dashboard

          <ArrowRight size={17} />

        </Link>

      </section>

    </div>
  );
}


export default About;