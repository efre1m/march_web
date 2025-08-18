import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ImageSlider from "../components/ImageSlider";
import { FaEnvelope } from "react-icons/fa";
import LatestNews from "../components/LatestNews";
import axiosInstance from "../utils/axiosInstance";
import LeftSidebar from "../components/LeftSidebar";
import RightSidebar from "../components/RightSidebar";
import "./Home.css";

const Home: React.FC = () => {
  const aboutRef = useRef<HTMLElement | null>(null);
  const heroMessages = [
    "Empowering Mothers and Children",
    "Digitalizing Health Systems with Our Team",
    "Delivering Community-Based Solutions",
    "Capacity Building at Abi Adi General Hospital",
  ];
  const heroDescriptions = [
    "Our National Digital Health expert provides technical guidance on how the IMNID tracker works supporting better care for mothers and newborns.",
    "Our Data Quality Officer trains staff at St. Marry General Hospital on the IMNID tracker to improve maternal and newborn data management.",
    "Working hand-in-hand with local partners for sustainable healthcare improvements.",
    "NICU and Labor & Delivery staff receive training on the IMNID tracker to enhance maternal and newborn data management.",
  ];

  const [heroDescription, setHeroDescription] = useState(heroDescriptions[0]);

  const [heroTitle, setHeroTitle] = useState(heroMessages[0]); // start with the first message
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const baseUrl = import.meta.env.VITE_BACKEND_URL as string;
  const [partners, setPartners] = useState<Partner[]>([]);

  interface TeamMember {
    id: number;
    Name: string;
    Position: string;
    Email: string;
    bio?: string;
    Image?: {
      url?: string;
    };
  }
  interface Partner {
    id: number;
    name: string;
    websiteUrl: string;
    logo?: {
      url?: string;
    };
  }

  // Use the ref instead of document.getElementById
  const handleLearnMoreClick = (): void => {
    aboutRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Fetch and auto-refresh Team Members every 5 seconds
  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const res = await axiosInstance.get("/team-members?populate=Image");
        const filtered = res.data.data
          .filter((m: TeamMember) => m.bio && m.bio.trim() !== "")
          .slice(0, 3); // max 3 members with bio
        setTeamMembers(filtered);
      } catch (err) {
        console.error("Error fetching team members:", err);
      }
    };

    fetchTeamMembers();
    const interval = setInterval(fetchTeamMembers, 5000);
    return () => clearInterval(interval);
  }, []);

  // Fetch and auto-refresh Partners every 5 seconds
  useEffect(() => {
    const fetchPartners = async () => {
      try {
        const res = await axiosInstance.get("/partners?populate=logo");
        setPartners(res.data.data);
      } catch (err) {
        console.error("Error fetching partners:", err);
      }
    };

    fetchPartners();
    const interval = setInterval(fetchPartners, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Header />
      <LeftSidebar />
      <RightSidebar />

      <main id="top" className="main-content">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-text-content">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="hero-title">{heroTitle}</h1>
              <p className="hero-description">{heroDescription}</p>
              <motion.button
                className="hero-button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLearnMoreClick}
              >
                Learn More
              </motion.button>
            </motion.div>
          </div>

          <div className="hero-visual">
            <ImageSlider
              onSlideChange={(index) => {
                setHeroTitle(heroMessages[index]);
                setHeroDescription(heroDescriptions[index]);
              }}
            />
          </div>
        </section>
        {/* Container to hold About and Partners side-by-side */}
        <div className="about-partners-container">
          {/* About Section */}
          <section ref={aboutRef} id="about-section" className="about-section">
            <motion.div
              className="about-content-box"
              initial={{ opacity: 0, y: 100 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.7 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <h2 className="section-title">About DHRDC</h2>
              <p className="about-text">
                The Digital Health Research and Development Center (DHRDC),
                established under the College of Health Sciences at Mekelle
                University, is a recognized and fully operational center
                dedicated to advancing digital health systems. In alignment with
                the Ethiopian Ministry of Health’s Information Revolution
                Roadmap, DHRDC drives innovation, research, and leadership in
                health information digitization. The center focuses on
                transforming how health data is collected, analyzed, and used to
                support evidence-based decision-making and improve maternal,
                child, and community health outcomes nationwide.
              </p>
            </motion.div>
          </section>

          {/* Partners Section */}
          <section className="partners-section">
            <h2 className="section-title">Our Partners</h2>
            <div className="partners-grid">
              {partners.map((partner, index) => (
                <motion.a
                  key={partner.id}
                  href={partner.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="partner-card"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  {partner.logo?.url ? (
                    <img
                      src={`${baseUrl}${partner.logo.url}`}
                      alt={`${partner.name} logo`}
                      className="partner-logo"
                    />
                  ) : (
                    <div className="no-logo">No Logo</div>
                  )}
                  <span className="partner-name">{partner.name}</span>
                </motion.a>
              ))}
            </div>
          </section>
        </div>
        <div className="latest-news-container">
          <LatestNews />
        </div>
        <section className="team-detailed-section">
          <div className="container">
            <h2 className="section-title">Our Dedicated Team</h2>
            <div className="team-detailed-grid">
              {teamMembers.map((member, index) => (
                <motion.div
                  key={member.id}
                  className="team-member-card"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="member-photo-container">
                    {member.Image?.url ? (
                      <img
                        src={`${baseUrl}${member.Image.url}`}
                        alt={`Portrait of ${member.Name}`}
                        className="member-photo"
                      />
                    ) : (
                      <div className="no-image">No Image</div>
                    )}
                  </div>
                  <div className="member-details">
                    <h3>{member.Name}</h3>
                    <p className="member-role">{member.Position}</p>
                    <p className="member-bio">{member.bio}</p>
                    <div className="member-contact">
                      <div className="contact-item">
                        <FaEnvelope className="contact-icon" />
                        <span>{member.Email}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default Home;
