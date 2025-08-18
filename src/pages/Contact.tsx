import { useState, useEffect, useRef } from "react";
import { motion, useAnimation, useInView } from "framer-motion";
import Header from "../components/Header";
import Footer from "../components/Footer";
import axiosInstance from "../utils/axiosInstance";
import LeftSidebar from "../components/LeftSidebar";
import RightSidebar from "../components/RightSidebar";
import {
  HiOutlineEnvelope,
  HiOutlinePhone,
  HiOutlineMapPin,
} from "react-icons/hi2";
import "./Contact.css";

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  website?: string; // honeypot
}

interface ContactInfo {
  email: string;
  phone: string;
  address: string;
  maplink?: string;
}

const Contact: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
  const [loadingInfo, setLoadingInfo] = useState(true);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [startTime, setStartTime] = useState<number>(Date.now());

  const journeyRef = useRef(null);
  const controls = useAnimation();
  const isInView = useInView(journeyRef, { once: false, margin: "-100px" });

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

  // Fetch contact info from Strapi
  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        const res = await axiosInstance.get(
          "/contact-infos?sort=createdAt:desc&pagination[limit]=1"
        );
        console.log("Contact API response data:", res.data);
        const latest = res.data.data[0];
        console.log("Latest contact info object:", latest);

        if (latest) {
          setContactInfo({
            email: latest.email,
            phone: latest.phone,
            address: latest.address,
            maplink: latest.maplink,
          });
        }
      } catch (error) {
        console.error("Failed to fetch contact info:", error);
      } finally {
        setLoadingInfo(false);
      }
    };

    fetchContactInfo();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Honeypot check: if filled, it's a bot
    if (formData.website?.trim()) {
      console.warn("Bot detected (honeypot filled)");
      return;
    }

    // Time-based check: if submitted too fast, it's suspicious
    const timeTaken = Date.now() - startTime;
    if (timeTaken < 3000) {
      console.warn("Bot detected (submitted too quickly)");
      return;
    }

    try {
      await axiosInstance.post(
        "/contact-messages",
        {
          data: {
            name: formData.name,
            email: formData.email,
            subject: formData.subject,
            message: formData.message,
          },
        },
        {
          // 🛡️ Explicitly remove auth header so it's treated as public
          headers: {
            Authorization: undefined,
          },
        }
      );

      setSubmitStatus("success");
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
        website: "",
      });
      setStartTime(Date.now());
    } catch (error) {
      console.error("Failed to send message:", error);
      setSubmitStatus("error");
    }
  };

  return (
    <>
      <Header />
      <LeftSidebar />
      <RightSidebar />
      <main className="main-content">
        {/* Hero Section */}
        <section className="about-hero-modern contact-hero">
          <div className="breadcrumb">
            <a href="/">Home</a> | <span>Contact</span>
          </div>

          <div className="about-container">
            <div className="about-content">
              <p className="who-we-are">GET IN TOUCH</p>
              <h1 className="about-title">Contact Us</h1>
              <p className="about-description">
                Get in touch with our team for inquiries, collaborations, or
                more information about our research and projects.
              </p>
            </div>

            <div className="experience-badge">
              <div className="circle">
                <h2>24/7</h2>
                <p>OPEN FOR COMMUNICATION</p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Info Section */}
        <section className="section contact-methods">
          <div className="container">
            <div className="methods-grid">
              {loadingInfo ? (
                <>
                  <div className="method-card skeleton-card" />
                  <div className="method-card skeleton-card" />
                  <div className="method-card skeleton-card" />
                </>
              ) : contactInfo ? (
                <>
                  <div className="method-card">
                    <div className="method-icon">
                      <HiOutlineEnvelope size={24} />
                    </div>
                    <h3>Email</h3>
                    <p>
                      <a
                        href={`mailto:${contactInfo.email}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {contactInfo.email}
                      </a>
                    </p>
                  </div>
                  <div className="method-card">
                    <div className="method-icon">
                      <HiOutlinePhone size={24} />
                    </div>
                    <h3>Phone</h3>
                    <p>
                      <a href={`tel:${contactInfo.phone}`}>
                        {contactInfo.phone}
                      </a>
                    </p>
                  </div>

                  <div className="method-card">
                    <div className="method-icon">
                      <HiOutlineMapPin size={24} />
                    </div>
                    <h3>Address</h3>
                    <p>{contactInfo.address}</p>
                  </div>
                </>
              ) : (
                <p>No contact info available.</p>
              )}
            </div>
          </div>
        </section>

        {/* Contact Form */}
        <section className="section contact-form-section">
          <div className="container">
            <motion.div
              className="form-container"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <h2>Send Us a Message</h2>
              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-group">
                  <label htmlFor="name">Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="subject">Subject</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="message">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={5}
                    required
                  />
                </div>
                <div style={{ display: "none" }}>
                  <label htmlFor="website">Website</label>
                  <input
                    type="text"
                    name="website"
                    id="website"
                    value={formData.website || ""}
                    onChange={handleChange}
                    autoComplete="off"
                    tabIndex={-1}
                  />
                </div>

                <motion.button
                  type="submit"
                  className="btn btn-primary"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Send Message
                </motion.button>
              </form>

              {/* Submission status */}
              {submitStatus === "success" && (
                <p className="success-message">Message sent successfully!</p>
              )}
              {submitStatus === "error" && (
                <p className="error-message">
                  Failed to send message. Please try again.
                </p>
              )}
            </motion.div>
          </div>
        </section>

        {/* Map Section */}
        <section className="map-section">
          <div className="container">
            <motion.div
              className="map-container"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <p className="map-description">
                <strong>MARCH Research Center</strong> is located within
                <strong> Ayder Referral Hospital</strong>, Mekelle, Ethiopia.
              </p>
              {contactInfo?.maplink ? (
                <iframe
                  src={contactInfo.maplink}
                  width="100%"
                  height="450"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  title="MARCH Center Location"
                />
              ) : (
                <p>Map location not available.</p>
              )}
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default Contact;
