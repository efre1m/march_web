import React from "react";
import { useParams, Link } from "react-router-dom";
import { eventsItems } from "../data/eventsData";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { FaArrowLeft, FaRegCalendarAlt } from "react-icons/fa";
import "./SingleNewsPage.css";

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const SingleEventsPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const event = eventsItems.find((e) => e.slug === slug);

  if (!event) {
    return (
      <>
        <Header />
        <main className="news-detail-wrapper">
          <p>Sorry, that event wasn’t found.</p>
          <Link to="/EventsPage" className="view-news-button back-button">
            <FaArrowLeft style={{ marginRight: 6 }} />
            Back to Events
          </Link>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="dark-top-layout">
        <main className="news-detail-wrapper">
          <section className="news-detail-left-wrapper">
            <div className="news-detail-left-horizontal">
              <img
                src={event.imageUrl}
                alt={event.title}
                className="news-detail-image-left"
              />
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
