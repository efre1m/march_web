import type { FC } from "react";
import { useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";
import "./admin/EventsAdmin.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { FaNewspaper } from "react-icons/fa";
import { format, toZonedTime } from "date-fns-tz";
import { FiCalendar, FiMapPin, FiFileText, FiBookmark } from "react-icons/fi";
import "../styles/SharedCardLayout.css";
import LeftSidebar from "../components/LeftSidebar";
import RightSidebar from "../components/RightSidebar";
import "./NewsPage.css";

interface Event {
  id: number;
  documentId: string;
  title: string;
  description: string;
  slug: string;
  mode: "in-person" | "online" | "hybrid";
  eventStatus: "upcoming" | "in-progress" | "completed" | "cancelled";
  startDate: string;
  endDate: string;
  location: string;
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

const TIMEZONE = "Africa/Addis_Ababa";

const EventsPage: FC = () => {
  const backendURL = import.meta.env.VITE_BACKEND_URL as string;
  const [events, setEvents] = useState<Event[]>([]);
  const [expandedDescriptions, setExpandedDescriptions] = useState<
    Record<number, boolean>
  >({});

  const parseDescription = (desc: string) => desc || "";

  const formatDateInEurope = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const zonedDate = toZonedTime(date, TIMEZONE);
    return format(zonedDate, "yyyy-MM-dd hh:mm a", { timeZone: TIMEZONE });
  };

  const toggleDescription = (id: number) => {
    setExpandedDescriptions((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const getFirstNWords = (text: string, n: number) => {
    if (!text) return "";
    const words = text.split(/\s+/);
    if (words.length <= n) return text;
    return words.slice(0, n).join(" ") + "...";
  };

  const fetchEvents = async () => {
    try {
      const res = await axiosInstance.get("/events?populate=image");
      setEvents(res.data.data);
    } catch (err) {
      console.error("Error fetching events:", err);
    }
  };

  useEffect(() => {
    fetchEvents();
    const interval = setInterval(fetchEvents, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <Header />
      <LeftSidebar />
      <RightSidebar />
      <main className="main-content">
        {/* Hero Section */}
        <section className="news-hero-modern">
          <div className="breadcrumb">
            <a href="/">Home</a> | <span>Events</span>
          </div>

          <div className="news-container">
            <div className="news-content">
              <p className="who-we-are">UPCOMING EVENTS</p>
              <h1 className="news-title">Workshops, Conferences & More</h1>
              <p className="news-description">
                Explore upcoming events hosted or supported by DHRDC — from
                expert roundtables to hands-on workshops — all designed to
                foster collaboration, share knowledge, and advance digital
                health research and innovation.
              </p>
            </div>

            <div className="experience-badge">
              <div className="circle">
                <FaNewspaper size={48} color="#fff" />
                <p>Join Us</p>
              </div>
            </div>
          </div>
        </section>

        {/* Events List */}
        <div className="event-admin-page">
          <div className="events-card-container">
            {events.length > 0 ? (
              events.map((e) => (
                <div
                  className={`event-card ${
                    e.eventStatus === "cancelled" ? "cancelled-event" : ""
                  }`}
                  key={e.id}
                  style={
                    e.eventStatus === "cancelled"
                      ? {
                          opacity: 0.7,
                          position: "relative",
                          borderLeft: "4px solid #d32f2f",
                        }
                      : {}
                  }
                >
                  <div className="event-image-container">
                    {e.image ? (
                      <div className="image-wrapper">
                        <img
                          src={
                            e.image?.formats?.large?.url
                              ? backendURL + e.image.formats.large.url
                              : e.image?.formats?.medium?.url
                                ? backendURL + e.image.formats.medium.url
                                : e.image?.formats?.small?.url
                                  ? backendURL + e.image.formats.small.url
                                  : e.image?.url
                                    ? backendURL + e.image.url
                                    : ""
                          }
                          className="event-image"
                          alt={e.title}
                        />
                      </div>
                    ) : (
                      <div className="no-image-placeholder">
                        <span>No Image Available</span>
                      </div>
                    )}
                  </div>

                  <div className="event-content">
                    <h3 className="event-title">
                      <FiBookmark
                        style={{
                          marginRight: "8px",
                          verticalAlign: "middle",
                        }}
                      />
                      {e.title}
                    </h3>

                    <p className="event-meta">
                      <span className={`status-badge ${e.eventStatus}`}>
                        {e.eventStatus === "cancelled"
                          ? "Canceled"
                          : e.eventStatus}
                      </span>
                      <span className="mode-badge">{e.mode}</span>
                    </p>

                    <p className="event-date">
                      <FiCalendar
                        style={{ marginRight: "6px", verticalAlign: "middle" }}
                      />
                      {formatDateInEurope(e.startDate)} –{" "}
                      {formatDateInEurope(e.endDate)}
                    </p>

                    <p className="event-location">
                      <FiMapPin
                        style={{ marginRight: "6px", verticalAlign: "middle" }}
                      />
                      <strong style={{ fontSize: "1.05rem" }}>
                        {e.location}
                      </strong>
                    </p>

                    <div className="event-description">
                      <FiFileText
                        style={{
                          marginRight: "6px",
                          verticalAlign: "middle",
                        }}
                      />
                      {expandedDescriptions[e.id]
                        ? parseDescription(e.description)
                        : getFirstNWords(parseDescription(e.description), 10)}
                      {parseDescription(e.description).split(/\s+/).length >
                        10 && (
                        <button
                          onClick={() => toggleDescription(e.id)}
                          className="read-more-btn"
                        >
                          {expandedDescriptions[e.id]
                            ? "Read less"
                            : "Read more"}
                        </button>
                      )}
                    </div>

                    {e.eventStatus === "cancelled" && (
                      <div
                        style={{
                          position: "absolute",
                          top: "10px",
                          right: "10px",
                          backgroundColor: "#d32f2f",
                          color: "white",
                          padding: "5px 10px",
                          borderRadius: "4px",
                          fontWeight: "bold",
                          fontSize: "0.8rem",
                        }}
                      >
                        Event Canceled
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="no-news-message">
                <FaNewspaper size={64} color="#ccc" />
                <h2>No Events Available</h2>
                <p>
                  Currently, there are no scheduled events. Please check back
                  later or follow our updates for future announcements.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default EventsPage;
