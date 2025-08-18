import React, { useState, useEffect } from "react";
import {
  FaFacebookF,
  FaTwitter,
  FaYoutube,
  FaEnvelope,
  FaPhoneAlt,
  FaMapMarkerAlt,
  FaCaretDown,
} from "react-icons/fa";
import axiosInstance from "../utils/axiosInstance";
import "./Footer.css";

interface ContactInfo {
  email: string;
  phone: string;
  address: string;
}

const Footer: React.FC = () => {
  const [updatesDropdownOpen, setUpdatesDropdownOpen] =
    useState<boolean>(false);
  const [exploreDropdownOpen, setExploreDropdownOpen] =
    useState<boolean>(false);

  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
  const [loadingContact, setLoadingContact] = useState(true);

  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        const res = await axiosInstance.get(
          "/contact-infos?sort=createdAt:desc&pagination[limit]=1"
        );
        const latest = res.data.data[0];
        if (latest) {
          setContactInfo({
            email: latest.email,
            phone: latest.phone,
            address: latest.address,
          });
        }
      } catch (error) {
        console.error("Failed to fetch footer contact info:", error);
      } finally {
        setLoadingContact(false);
      }
    };
    fetchContactInfo();
  }, []);

  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-branding">
          <h3>DHRDC</h3>
          <p>
            Improving maternal and child health through research, innovation,
            and community support.
          </p>
          <a href="#top">
            <img
              src="/images/logo.png"
              alt="DHRDC Logo"
              className="footer-logo"
            />
          </a>
        </div>

        <div className="footer-links">
          <h4>Quick Links</h4>
          <ul>
            <li>
              <a href="/">Home</a>
            </li>
            <li>
              <a href="/about">About</a>
            </li>

            {/* Updates Dropdown */}
            <li
              className="footer-dropdown"
              onMouseEnter={() => setUpdatesDropdownOpen(true)}
              onMouseLeave={() => setUpdatesDropdownOpen(false)}
            >
              <button
                className="footer-dropdown-toggle"
                aria-haspopup="true"
                aria-expanded={updatesDropdownOpen}
                onClick={() => setUpdatesDropdownOpen((prev) => !prev)}
              >
                Updates <FaCaretDown />
              </button>
              {updatesDropdownOpen && (
                <ul className="footer-dropdown-menu">
                  <li>
                    <a href="/NewsPage">News</a>
                  </li>
                  <li>
                    <a href="/EventsPage">Events</a>
                  </li>
                  <li>
                    <a href="/vacancies">Vacancies</a>
                  </li>
                </ul>
              )}
            </li>

            {/* Explore Dropdown */}
            <li
              className="footer-dropdown"
              onMouseEnter={() => setExploreDropdownOpen(true)}
              onMouseLeave={() => setExploreDropdownOpen(false)}
            >
              <button
                className="footer-dropdown-toggle"
                aria-haspopup="true"
                aria-expanded={exploreDropdownOpen}
                onClick={() => setExploreDropdownOpen((prev) => !prev)}
              >
                Explore <FaCaretDown />
              </button>
              {exploreDropdownOpen && (
                <ul className="footer-dropdown-menu">
                  <li>
                    <a href="/projects">Projects</a>
                  </li>
                  <li>
                    <a href="/publications">Publications</a>
                  </li>
                </ul>
              )}
            </li>

            <li>
              <a href="/contact">Contact</a>
            </li>
          </ul>
        </div>

        <div className="footer-contact">
          <h4>Contact</h4>
          <ul>
            {loadingContact ? (
              <>
                <li>Loading email...</li>
                <li>Loading phone...</li>
                <li>Loading address...</li>
              </>
            ) : contactInfo ? (
              <>
                <li>
                  <FaEnvelope />{" "}
                  <a href={`mailto:${contactInfo.email}`}>
                    {contactInfo.email}
                  </a>
                </li>
                <li>
                  <FaPhoneAlt />{" "}
                  <a href={`tel:${contactInfo.phone}`}>{contactInfo.phone}</a>
                </li>
                <li>
                  <FaMapMarkerAlt /> {contactInfo.address}
                </li>
              </>
            ) : (
              <li>Contact info not available</li>
            )}
          </ul>
        </div>

        <div className="footer-social">
          <h4>Connect with us</h4>
          <div className="social-icons">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaFacebookF />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaTwitter />
            </a>
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaYoutube />
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} DHRDC. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
