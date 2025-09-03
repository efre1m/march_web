import { motion, useAnimation, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import CoreValues from "../components/CoreValues";
import { FaBullseye, FaEye, FaCheckCircle } from "react-icons/fa";
import "./About.css";
import OurImpact from "../components/OurImpact";
import StaffMembers from "../components/StaffMembers";
import LeftSidebar from "../components/LeftSidebar";
import RightSidebar from "../components/RightSidebar";
import axiosInstance from "../utils/axiosInstance";

interface Project {
  id: number;
  title: string;
  summary: string;
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

const milestones = [
  {
    year: "2019-05-01",
    event: "Activities Started",
    details:
      "The research center started its activities on May 1, 2019, even though its official establishment was approved later.",
  },
  {
    year: "2019-12-16",
    event: "DHRDC Approved",
    details:
      "On December 16, 2019, the College Council of the College of Health Sciences approved the establishment of the Research and Development Center.",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.7,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -80 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.8 } },
};

const detailVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.4 } },
};

const About = () => {
  const journeyRef = useRef(null);
  const controls = useAnimation();
  const isInView = useInView(journeyRef, { once: false, margin: "-100px" });
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await axiosInstance.get("/projects?populate=image");
        setProjects(res.data.data); // The data is directly in res.data.data
      } catch (error) {
        console.error("Failed to fetch projects", error);
      }
    };

    fetchProjects();
  }, []);

  useEffect(() => {
    controls.set("hidden");
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (isInView) {
      controls.start("visible");
    } else {
      controls.start("hidden");
    }
  }, [isInView, controls]);
  const startYear = 2019;
  const startMonth = 5; // May (1-based month)

  const now = new Date();
  const yearsDiff =
    now.getFullYear() - startYear - (now.getMonth() + 1 < startMonth ? 1 : 0);

  const yearsDisplay = `${yearsDiff}+`;

  return (
    <>
      <Header />
      <LeftSidebar />
      <RightSidebar />

      <main className="main-content">
        {/* Hero Section */}
        <section className="about-hero-modern">
          <div className="breadcrumb">
            <a href="/">Home</a> | <span>About</span>
          </div>

          <div className="about-container">
            <div className="about-content">
              <p className="who-we-are">WHO WE ARE</p>
              <h1 className="about-title">About DHRDC</h1>
              <p className="about-description">
                This center will aspire and strive hard for the betterment of
                the health system by providing state-of-the-art perspectives on
                health information system development with innovative practices
                towards eradicating healthcare disparity and rejoicing societal
                equity.
              </p>
            </div>

            <div className="experience-badge">
              <div className="circle">
                <h2>{yearsDisplay}</h2>
                <p>YEARS OF LEADING INNOVATIVE HEALTHCARE RESEARCH</p>
              </div>
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="mission-vision-section">
          <div className="container">
            <div className="card mission">
              <FaBullseye className="icon mission-icon" />
              <h2>Our Mission</h2>
              <ul className="mission-list">
                <li>
                  <FaCheckCircle className="bullet-icon" /> Improve quality and
                  transformation of health information at lower health system
                  levels
                </li>
                <li>
                  <FaCheckCircle className="bullet-icon" /> Prepare eHealth
                  architecture and interoperability academy learning materials
                  and modules
                </li>
                <li>
                  <FaCheckCircle className="bullet-icon" /> Foster a culture of
                  using health information for decision-making at lower levels
                </li>
                <li>
                  <FaCheckCircle className="bullet-icon" /> Define and pilot
                  data standards that support interoperability amid new systems
                  and initiatives
                </li>
                <li>
                  <FaCheckCircle className="bullet-icon" /> Build capacity of
                  health workers and managers to use data for evidence-based
                  decisions
                </li>
                <li>
                  <FaCheckCircle className="bullet-icon" /> Advance digitization
                  by creating awareness and strengthening HIS implementation
                  skills
                </li>
              </ul>
            </div>
            <div className="card vision">
              <FaEye className="icon vision-icon" />
              <h2>Our Vision</h2>
              <ul className="mission-list">
                <li>
                  <FaCheckCircle className="bullet-icon" /> To be a global
                  leader in innovative digital health solutions
                </li>
                <li>
                  <FaCheckCircle className="bullet-icon" /> To ensure equitable
                  access to quality healthcare through technology
                </li>
                <li>
                  <FaCheckCircle className="bullet-icon" /> To foster
                  integrated, data-driven healthcare ecosystems for improved
                  outcomes
                </li>
                <li>
                  <FaCheckCircle className="bullet-icon" /> To empower
                  healthcare professionals and communities with smart digital
                  tools
                </li>
              </ul>
            </div>
          </div>
        </section>
        <div className="core-values-container">
          <CoreValues />
        </div>
        <div className="our-impact-container">
          <OurImpact />
        </div>

        <section className="journey-projects-wrapper">
          {/* Our Journey Section */}
          <section className="journey-section" ref={journeyRef}>
            <h2 className="journey-title">Our Journey</h2>

            <motion.div
              className="timeline-vertical"
              variants={containerVariants}
              initial="hidden"
              animate={controls}
            >
              {milestones.map((item) => (
                <motion.div
                  key={item.year}
                  className="timeline-wrapper"
                  variants={itemVariants}
                >
                  <div className="timeline-node">
                    <div className="timeline-bullet" />
                    <div className="timeline-content">
                      <strong>
                        {new Date(item.year).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </strong>

                      <span>{item.event}</span>
                    </div>
                  </div>

                  <motion.div
                    className="highlight-box-vertical"
                    variants={detailVariants}
                  >
                    <h3>
                      {item.event} ({item.year})
                    </h3>
                    <p>{item.details}</p>
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
          </section>

          {/* Featured Projects Section (no list, only highlight) */}
          <section className="projects-section">
            <h2 className="projects-title">🌟 Featured Projects</h2>

            <div className="projects-grid">
              {projects.map((project) => (
                <div key={project.id} className="project-card-horizontal">
                  {project.image?.url && (
                    <img
                      src={`${import.meta.env.VITE_BACKEND_URL || ""}${project.image.url}`}
                      alt={project.title}
                      className="project-thumb"
                    />
                  )}
                  <div className="project-text">
                    <h3 className="project-title">{project.title}</h3>
                    <p className="project-summary">{project.summary}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="view-all-container">
              <a href="/projects" className="btn btn-primary">
                View All Projects
              </a>
            </div>
            <div className="project-highlight-section">
              <div className="highlight-content">
                <img
                  src="/images/team/Dr.araya.jpg"
                  alt="Project Manager"
                  className="highlight-image"
                />
                <div className="highlight-text">
                  <blockquote>
                    "Great projects require great leadership — driving
                    innovation and success."
                  </blockquote>
                </div>
              </div>
            </div>
          </section>
        </section>

        <StaffMembers />
      </main>

      <Footer />
    </>
  );
};

export default About;
