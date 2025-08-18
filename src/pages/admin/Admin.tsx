import React, { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import VacanciesAdmin from "./VacanciesAdmin";
import NewsAdmin from "./NewsAdmin";
import EventsAdmin from "./EventsAdmin";
import TeamMembers from "./TeamMembers";
import ProjectsAdmin from "./ProjectsAdmin";
import PublicationsAdmin from "./PublicationsAdmin";
import ContactAdmin from "./ContactAdmin";
import PartnersAdmin from "./PartnersAdmin";
import ApplicationsAdmin from "./ApplicationsAdmin";
import { motion, AnimatePresence } from "framer-motion";
import ChangeAccountModal from "./ChangeAccountModal"; // <-- Import modal
import "./admin.css";

const Admin: React.FC = () => {
  const [activeTab, setActiveTab] = React.useState<
    | "team"
    | "news"
    | "vacancies"
    | "events"
    | "projects"
    | "publications"
    | "contact"
    | "partner"
    | "application"
  >("team");

  const { user, logout, isAuthenticated, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [showChangeAccountModal, setShowChangeAccountModal] =
    React.useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const navItems = [
    { label: "Team", key: "team" },
    { label: "News", key: "news" },
    { label: "Vacancies", key: "vacancies" },
    { label: "Applications", key: "application" },
    { label: "Events", key: "events" },
    { label: "Projects", key: "projects" },
    { label: "Publications", key: "publications" },
    { label: "Partners", key: "partner" },
    { label: "Contacts", key: "contact" },
  ];

  return (
    <div className="admin-container">
      <header className="admin-header">
        <div className="admin-topbar">
          <h1 className="admin-title">Admin Panel</h1>
          <div className="admin-user">
            <span className="welcome-msg">Welcome, {user?.username}</span>
            <Link to="/" className="home-link">
              ⬅ Home
            </Link>

            {/* Change Account button */}
            <button
              className="change-account-button"
              onClick={() => setShowChangeAccountModal(true)}
            >
              Change Account
            </button>

            <button className="logout-button" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>

        <nav className="admin-navbar">
          {navItems.map((item) => (
            <button
              key={item.key}
              className={`nav-button ${activeTab === item.key ? "active" : ""}`}
              onClick={() => setActiveTab(item.key as typeof activeTab)}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="admin-main">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="admin-content"
          >
            {activeTab === "team" && <TeamMembers />}
            {activeTab === "news" && <NewsAdmin />}
            {activeTab === "vacancies" && <VacanciesAdmin />}
            {activeTab === "application" && <ApplicationsAdmin />}
            {activeTab === "events" && <EventsAdmin />}
            {activeTab === "projects" && <ProjectsAdmin />}
            {activeTab === "publications" && <PublicationsAdmin />}
            {activeTab === "partner" && <PartnersAdmin />}
            {activeTab === "contact" && <ContactAdmin />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Render Change Account modal */}
      {showChangeAccountModal && (
        <ChangeAccountModal
          onClose={() => setShowChangeAccountModal(false)}
          refreshUser={refreshUser} // Pass refreshUser to modal
        />
      )}
    </div>
  );
};

export default Admin;
