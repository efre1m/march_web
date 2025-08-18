import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  FaHome,
  FaInfoCircle,
  FaBriefcase,
  FaEnvelope,
  FaProjectDiagram,
  FaCaretDown,
  FaNewspaper,
  FaCalendarAlt,
} from "react-icons/fa";
import { RxDashboard } from "react-icons/rx";
import "./Header.css";

const Header: React.FC = () => {
  const [newsDropdownOpen, setNewsDropdownOpen] = useState<boolean>(false);
  const [exploreDropdownOpen, setExploreDropdownOpen] =
    useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const toggleMobileMenu = (): void => {
    setMobileMenuOpen((prev) => !prev);
  };

  const handleNavClick = (): void => {
    setMobileMenuOpen(false);
    setNewsDropdownOpen(false);
    setExploreDropdownOpen(false);
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <NavLink to="/" className="logo" onClick={handleNavClick}>
            <img src="/images/logo.png" alt="DHRDC Logo" />
            <span>DHRDC</span>
          </NavLink>

          <nav className={`nav ${mobileMenuOpen ? "open" : ""}`}>
            <ul>
              <li>
                <NavLink
                  to="/"
                  className={({ isActive }) => (isActive ? "active" : "")}
                  end
                  onClick={handleNavClick}
                >
                  <FaHome className="nav-icon" /> Home
                </NavLink>
              </li>

              <li>
                <NavLink
                  to="/about"
                  className={({ isActive }) => (isActive ? "active" : "")}
                  onClick={handleNavClick}
                >
                  <FaInfoCircle className="nav-icon" /> About
                </NavLink>
              </li>

              {/* Updates Dropdown */}
              <li
                className="dropdown"
                onMouseEnter={() => setNewsDropdownOpen(true)}
                onMouseLeave={() => setNewsDropdownOpen(false)}
              >
                <button
                  className="dropdown-toggle"
                  aria-haspopup="true"
                  aria-expanded={newsDropdownOpen}
                  onClick={() => setNewsDropdownOpen((prev) => !prev)}
                  type="button"
                >
                  <FaNewspaper className="nav-icon" /> Updates <FaCaretDown />
                </button>

                {newsDropdownOpen && (
                  <ul className="dropdown-menu show">
                    <li>
                      <NavLink to="/NewsPage" onClick={handleNavClick}>
                        <FaNewspaper className="dropdown-icon" /> News
                      </NavLink>
                    </li>
                    <li>
                      <NavLink to="/EventsPage" onClick={handleNavClick}>
                        <FaCalendarAlt className="dropdown-icon" /> Events
                      </NavLink>
                    </li>
                    <li>
                      <NavLink to="/vacancies" onClick={handleNavClick}>
                        <FaBriefcase className="dropdown-icon" /> Vacancies
                      </NavLink>
                    </li>
                  </ul>
                )}
              </li>

              {/* Explore Dropdown */}
              <li
                className="dropdown"
                onMouseEnter={() => setExploreDropdownOpen(true)}
                onMouseLeave={() => setExploreDropdownOpen(false)}
              >
                <button
                  className="dropdown-toggle"
                  aria-haspopup="true"
                  aria-expanded={exploreDropdownOpen}
                  onClick={() => setExploreDropdownOpen((prev) => !prev)}
                  type="button"
                >
                  <RxDashboard className="nav-icon" /> Explore <FaCaretDown />
                </button>

                {exploreDropdownOpen && (
                  <ul className="dropdown-menu show">
                    <li>
                      <NavLink to="/projects" onClick={handleNavClick}>
                        <FaProjectDiagram className="dropdown-icon" /> Projects
                      </NavLink>
                    </li>
                    <li>
                      <NavLink to="/publications" onClick={handleNavClick}>
                        <FaNewspaper className="dropdown-icon" /> Publications
                      </NavLink>
                    </li>
                  </ul>
                )}
              </li>

              <li>
                <NavLink
                  to="/contact"
                  className={({ isActive }) => (isActive ? "active" : "")}
                  onClick={handleNavClick}
                >
                  <FaEnvelope className="nav-icon" /> Contact
                </NavLink>
              </li>
            </ul>
          </nav>

          <button
            className="mobile-menu-btn"
            aria-label="Toggle menu"
            onClick={toggleMobileMenu}
            type="button"
          >
            ☰
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
