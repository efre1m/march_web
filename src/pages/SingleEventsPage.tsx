import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { FaArrowLeft, FaRegCalendarAlt } from "react-icons/fa";
import "./SingleNewsPage.css";
import "./admin/EventsAdmin.css";

interface EventItem {
  id: number;
  slug: string;
  title: string;
  description: string;
  date: string;
  location: string;
  image?: {
    url: string;
    formats?: {
      thumbnail?: { url: string };
      small?: { url: string };
      medium?: { url: string };
      large?: { url: string };
    };
  } | null;
}

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const SingleEventsPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [event, setEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const strapiBaseURL = import.meta.env.VITE_BACKEND_URL || "";

  useEffect(() => {
    let isMounted = true;

    const fetchEvent = async () => {
      try {
        const res = await axiosInstance.get(
          `/events?filters[slug][$eq]=${slug}&populate=image`
        );

        const eventData = res.data.data?.[0] || null;

        if (isMounted) {
          if (eventData) {
            setEvent({
              id: eventData.id,
              slug: eventData.attributes.slug,
              title: eventData.attributes.title,
              description: eventData.attributes.description,
              date: eventData.attributes.date,
              location: eventData.attributes.location,
              image: eventData.attributes.image?.data?.attributes || null,
            });
            setError(null);
          } else {
            setEvent(null);
            setError("Event not found.");
          }
        }
      } catch (err) {
        console.error("Failed to fetch event", err);
        if (isMounted) {
          setError("Failed to load the event.");
          setEvent(null);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    if (slug) fetchEvent();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <>
        <Header />
        <main className="news-detail-wrapper">
          <p>Loading event...</p>
        </main>
        <Footer />
      </>
    );
  }

  if (error || !event) {
    return (
      <>
        <Header />
        <main className="news-detail-wrapper">
          <p>{error || "Sorry, that event wasn’t found."}</p>
          <Link to="/EventsPage" className="view-news-button back-button">
            <FaArrowLeft style={{ marginRight: 6 }} />
            Back to Events
          </Link>
        </main>
        <Footer />
      </>
    );
  }

  // Build event image URL (choosing best available format)
  const imageUrl = event.image
    ? strapiBaseURL +
      (event.image.formats?.large?.url ||
        event.image.formats?.medium?.url ||
        event.image.formats?.small?.url ||
        event.image.url)
    : null;

  return (
    <>
      <Header />
      <div className="dark-top-layout">
        <main className="news-detail-wrapper">
          <section className="news-detail-left-wrapper">
            <div className="news-detail-left-horizontal">
              {imageUrl && (
                <img
                  src={imageUrl}
                  alt={event.title}
                  className="news-detail-image-left"
                />
              )}
              <div className="news-detail-text">
                <h2 className="news-detail-title">{event.title}</h2>
                <div className="news-detail-date">
                  <FaRegCalendarAlt style={{ marginRight: 6 }} />
                  {formatDate(event.date)}
                </div>
                <p className="news-detail-description">{event.description}</p>
                <p className="news-detail-location">
                  <strong>Location:</strong> {event.location}
                </p>
                <Link to="/EventsPage" className="view-news-button back-button">
                  <FaArrowLeft style={{ marginRight: 6 }} />
                  Back to Events
                </Link>
              </div>
            </div>
          </section>

          <aside className="news-detail-right">
            <h3>About Our Events</h3>
            <p>
              DHRDC hosts impactful workshops, summits, and awareness campaigns
              across Ethiopia to foster collaboration and education in digital
              health.
            </p>
            <p>
              Stay informed about upcoming opportunities to learn, connect, and
              make a difference in maternal and child health.
            </p>
            <Link to="/EventsPage" className="view-news-button">
              View All Events
            </Link>
          </aside>
        </main>
      </div>
      <Footer />
    </>
  );
};

export default SingleEventsPage;
