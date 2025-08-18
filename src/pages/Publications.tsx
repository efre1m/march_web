// src/pages/Publications.tsx

import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "./Projects.css"; // Shared layout styles
import "./Publications.css"; // Custom publication styles
import { Link } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import LeftSidebar from "../components/LeftSidebar";
import RightSidebar from "../components/RightSidebar";
interface Publication {
  id: number;
  title: string;
  authors: string;
  journal: string;
  year: string;
  link: string;
  abstract?: string; // ✅ added abstract
}

const Publications: React.FC = () => {
  const [publications, setPublications] = useState<Publication[]>([]);

  useEffect(() => {
    const fetchPublications = async () => {
      try {
        const res = await axiosInstance.get("/publications");
        const newData = res.data.data;

        // Only update if the publication list has changed (based on ID list)
        setPublications((prev) => {
          const prevIds = prev.map((p) => p.id).join(",");
          const newIds = newData.map((p: any) => p.id).join(",");
          return prevIds !== newIds ? newData : prev;
        });
      } catch (error) {
        console.error("Error fetching publications", error);
      }
    };

    fetchPublications(); // Initial fetch
    const intervalId = setInterval(fetchPublications, 10000); // Refresh every 30 seconds

    return () => clearInterval(intervalId); // Clean up
  }, []);
  return (
    <>
      <Header />
      <LeftSidebar />
      <RightSidebar />
      <main className="main-content">
        {/* Hero Section */}
        <section className="projects-hero">
          <div className="breadcrumb">
            <Link to="/">Home</Link> | <span>Publications</span>
          </div>

          <div className="projects-container">
            <div className="projects-intro">
              <p className="projects-tagline">OUR RESEARCH</p>
              <h1 className="projects-title">Scientific Publications</h1>
              <p className="projects-description">
                Our research publications contribute to the global body of
                knowledge, sharing innovations in digital health, machine
                learning, and data-driven solutions for low-resource settings.
              </p>
            </div>
            <div className="projects-badge">
              <div className="circle">
                <h2>{publications.length}</h2>
                <p>Published Papers</p>
              </div>
            </div>
          </div>
        </section>

        {/* Publications List */}
        <div className="project-admin-page">
          <div className="projects-card-container">
            {publications.length > 0 ? (
              publications.map((pub) => (
                <div key={pub.id} className="project-card">
                  <h3 className="publication-title">{pub.title}</h3>
                  <p className="project-summary">
                    <span className="project-authors">
                      <strong>Authors:</strong> {pub.authors}
                    </span>
                    <br />
                    <span className="project-journal">
                      <em>{pub.journal}</em>
                    </span>
                    <span className="project-year"> ({pub.year})</span>
                  </p>

                  {pub.abstract && (
                    <div
                      className="publication-abstract"
                      dangerouslySetInnerHTML={{
                        __html: `<strong>Abstract:</strong> ${pub.abstract}`,
                      }}
                    />
                  )}

                  <a
                    href={pub.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="publication-link"
                  >
                    View Full Publication
                  </a>
                </div>
              ))
            ) : (
              <div className="no-news-message">
                <h2>No Publications Available</h2>
                <p>
                  Currently, there are no published papers to display. Please
                  check back later for updates on our research.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* CTA */}
        <section className="projects-cta-section">
          <h2>Interested in Our Work?</h2>
          <p>
            We welcome collaboration and partnerships on emerging research and
            innovations.
          </p>
          <Link to="/contact" className="btn btn-primary">
            Contact Us
          </Link>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default Publications;
