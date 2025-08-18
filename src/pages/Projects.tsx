import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import axiosInstance from "../utils/axiosInstance";
import { Link } from "react-router-dom";
import {
  MdOutlineCheckCircle,
  MdOutlinePending,
  MdDescription,
  MdSummarize,
  MdWorkspaces,
} from "react-icons/md";
import { FaProjectDiagram } from "react-icons/fa";
import "./Projects.css";
import "./NewsPage.css";
import "../styles/SharedCardLayout.css";
import LeftSidebar from "../components/LeftSidebar";
import RightSidebar from "../components/RightSidebar";

interface Project {
  id: number;
  title: string;
  summary: string;
  description: string;
  projectStatus: string;
  startDate?: string;
  endDate?: string;
  image?: {
    id: number;
    url: string;
    formats?: {
      thumbnail?: { url: string };
      small?: { url: string };
      medium?: { url: string };
      large?: { url: string };
    };
  } | null;
}

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [expandedDescriptions, setExpandedDescriptions] = useState<
    Record<number, boolean>
  >({});
  const baseUrl = import.meta.env.VITE_BACKEND_URL;

  const toggleDescription = (id: number) => {
    setExpandedDescriptions((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const truncateDescription = (html: string, wordCount: number) => {
    if (!html) return "";

    const temp = document.createElement("div");
    temp.innerHTML = html;
    const textContent = temp.textContent || "";

    const words = textContent.split(/\s+/);
    if (words.length <= wordCount) return html;

    let count = 0;
    let position = 0;
    while (count < wordCount && position < html.length) {
      if (html[position] === "<") {
        position = html.indexOf(">", position) + 1;
        continue;
      }
      if (/\s/.test(html[position])) {
        count++;
      }
      position++;
    }

    return html.substring(0, position) + "...";
  };

  useEffect(() => {
    let isMounted = true;

    const fetchProjects = async () => {
      try {
        const res = await axiosInstance.get("/projects?populate=image");
        if (isMounted) {
          setProjects(res.data.data);
        }
      } catch (error) {
        console.error("Error fetching projects", error);
      }
    };

    fetchProjects(); // Initial fetch
    const interval = setInterval(fetchProjects, 10000); // Poll every 10 seconds

    return () => {
      isMounted = false;
      clearInterval(interval); // Clean up
    };
  }, []);

  const ongoingCount = projects.filter(
    (p) => p.projectStatus === "ongoing"
  ).length;

  return (
    <>
      <Header />
      <LeftSidebar />
      <RightSidebar />

      <main className="main-content">
        <section className="projects-hero">
          <div className="breadcrumb">
            <a href="/">Home</a> | <span>Projects</span>
          </div>

          <div className="projects-container">
            <div className="projects-intro">
              <p className="projects-tagline">
                <MdWorkspaces
                  style={{
                    marginRight: "10px",
                    verticalAlign: "middle",
                    fontSize: "1.2rem",
                  }}
                />
                OUR INNOVATIONS
              </p>
              <h1 className="projects-title">
                <FaProjectDiagram
                  style={{
                    marginRight: "15px",
                    verticalAlign: "middle",
                    color: "#2c7be5",
                  }}
                />
                Projects That Power Impact
              </h1>
              <p className="projects-description">
                We develop and implement innovative digital solutions to tackle
                key challenges in healthcare systems — empowering communities,
                improving data-driven decisions, and fostering global health
                equity.
              </p>
            </div>

            <div className="projects-badge">
              <div className="circle">
                <FaProjectDiagram size={48} color="#fff" />
                <p
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: "bold",
                    marginTop: "10px",
                  }}
                >
                  {ongoingCount} Active
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="project-admin-page">
          <div className="projects-card-container">
            {projects.length > 0 ? (
              projects.map((project) => {
                const imageUrl = project.image
                  ? `${baseUrl}${
                      project.image.formats?.large?.url ||
                      project.image.formats?.medium?.url ||
                      project.image.formats?.small?.url ||
                      project.image.url
                    }`
                  : null;

                return (
                  <div className="project-card" key={project.id}>
                    <div className="project-image-container">
                      {imageUrl ? (
                        <div className="image-wrapper">
                          <img
                            src={imageUrl}
                            className="project-image"
                            alt={project.title}
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display =
                                "none";
                              const noImageDiv = (e.target as HTMLImageElement)
                                .nextElementSibling as HTMLDivElement;
                              if (noImageDiv) noImageDiv.style.display = "flex";
                            }}
                          />
                          <div
                            className="no-image-placeholder"
                            style={{ display: "none" }}
                          >
                            <span>No Image Available</span>
                          </div>
                        </div>
                      ) : (
                        <div className="no-image-placeholder">
                          <span>No Image Available</span>
                        </div>
                      )}
                    </div>

                    <div className="project-content">
                      <h3 className="project-title">
                        <FaProjectDiagram
                          style={{
                            marginRight: "10px",
                            verticalAlign: "middle",
                            color: "#2c7be5",
                          }}
                        />
                        {project.title}
                      </h3>

                      <p className="project-meta">
                        <span
                          className={`status-badge ${project.projectStatus}`}
                        >
                          {project.projectStatus === "completed" ? (
                            <>
                              <MdOutlineCheckCircle
                                style={{
                                  marginRight: "6px",
                                  verticalAlign: "middle",
                                  fontSize: "1.1rem",
                                }}
                              />
                              Completed
                            </>
                          ) : (
                            <>
                              <MdOutlinePending
                                style={{
                                  marginRight: "6px",
                                  verticalAlign: "middle",
                                  fontSize: "1.1rem",
                                }}
                              />
                              Ongoing
                            </>
                          )}
                        </span>
                      </p>

                      <p className="project-summary">
                        <MdSummarize
                          style={{
                            marginRight: "8px",
                            verticalAlign: "middle",
                            color: "#555",
                            fontSize: "1.2rem",
                          }}
                        />
                        {project.summary}
                      </p>

                      <div className="project-description">
                        <MdDescription
                          style={{
                            marginRight: "8px",
                            verticalAlign: "top",
                            color: "#555",
                            fontSize: "1.2rem",
                          }}
                        />
                        <div
                          dangerouslySetInnerHTML={{
                            __html: expandedDescriptions[project.id]
                              ? project.description
                              : truncateDescription(project.description, 20),
                          }}
                        />
                        {project.description && (
                          <button
                            onClick={() => toggleDescription(project.id)}
                            className="read-more-btn"
                          >
                            {expandedDescriptions[project.id]
                              ? "Read less"
                              : "Read more"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="no-news-message">
                <FaProjectDiagram size={64} color="#ccc" />
                <h2>No Projects Available</h2>
                <p>
                  Currently, there are no active projects to display. Please
                  check back later for updates on our initiatives.
                </p>
              </div>
            )}
          </div>
        </div>

        <section className="projects-cta-section">
          <h2>Interested in Collaborating?</h2>
          <p>
            We partner with researchers, developers, and institutions to build
            solutions that save lives.
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

export default Projects;
