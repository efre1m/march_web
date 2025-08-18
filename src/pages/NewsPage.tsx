import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { FaNewspaper, FaRegCalendarAlt } from "react-icons/fa";
import { Link } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import "./admin/EventsAdmin.css";
import "../styles/SharedCardLayout.css";
import LeftSidebar from "../components/LeftSidebar";
import RightSidebar from "../components/RightSidebar";
import "./NewsPage.css";

interface ContentBlock {
  id?: number;
  image?: {
    url: string;
    formats?: {
      thumbnail?: { url: string };
      small?: { url: string };
      medium?: { url: string };
      large?: { url: string };
    };
  } | null;
  description: string;
  title?: string;
}

interface NewsArticle {
  id: number;
  title: string;
  slug: string;
  date: string;
  content_blocks?: ContentBlock[];
}

const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "2-digit",
  };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const NewsPage: React.FC = () => {
  const [newsItems, setNewsItems] = useState<NewsArticle[]>([]);
  const strapiBaseURL = import.meta.env.VITE_BACKEND_URL as string;
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true; // Flag to track component mount status

    const fetchNews = async () => {
      try {
        const response = await axiosInstance.get(
          "/news-articles?populate[content_blocks][populate]=image"
        );

        if (!isMounted) return; // Don't update state if component is unmounted

        const sortedNews = response.data.data.sort(
          (a: any, b: any) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        setNewsItems((prev) => {
          const prevIds = prev.map((item) => item.id).join(",");
          const newIds = sortedNews.map((item: any) => item.id).join(",");
          if (prevIds !== newIds) {
            return sortedNews;
          }
          return prev;
        });
      } catch (error) {
        console.error("Failed to fetch news:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchNews(); // Initial fetch

    // Set up auto-refresh every 3.5 seconds (3500 milliseconds)
    const intervalId = setInterval(fetchNews, 3500);

    // Clean up function
    return () => {
      isMounted = false; // Set flag to false when component unmounts
      clearInterval(intervalId); // Clear the interval
    };
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
            <a href="/">Home</a> | <span>News</span>
          </div>

          <div className="news-container">
            <div className="news-content">
              <p className="who-we-are">LATEST UPDATES</p>
              <h1 className="news-title">Updates & Announcements</h1>
              <p className="news-description">
                Stay informed with the latest research activities,
                collaborations, and digital health innovations from our center.
                Explore how we're driving technology-enabled solutions in
                healthcare and beyond.
              </p>
            </div>

            <div className="experience-badge">
              <div className="circle">
                <FaNewspaper size={48} color="#fff" />
                <p>Stay Updated</p>
              </div>
            </div>
          </div>
        </section>

        {/* News List */}
        <div className="event-admin-page">
          {isLoading ? (
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>Loading news...</p>
            </div>
          ) : (
            <section className="events-card-container">
              {newsItems.length > 0 ? (
                newsItems.map((item) => {
                  const firstBlock = item.content_blocks?.[0];
                  const imgUrl = firstBlock?.image
                    ? strapiBaseURL +
                      (firstBlock.image.formats?.large?.url ||
                        firstBlock.image.formats?.medium?.url ||
                        firstBlock.image.formats?.small?.url ||
                        firstBlock.image.url ||
                        "")
                    : "";

                  return (
                    <article key={item.id} className="event-card">
                      {firstBlock?.image ? (
                        <div className="image-wrapper">
                          <img
                            src={imgUrl}
                            alt={item.title}
                            className="event-image"
                          />
                        </div>
                      ) : (
                        <div className="no-image">No Image</div>
                      )}

                      <div className="event-content">
                        <h3 className="event-title">
                          <FaNewspaper
                            style={{
                              marginRight: "8px",
                              verticalAlign: "middle",
                            }}
                          />
                          {item.title}
                        </h3>
                        <p className="event-date">
                          <FaRegCalendarAlt
                            style={{
                              marginRight: "6px",
                              verticalAlign: "middle",
                            }}
                          />
                          {formatDate(item.date)}
                        </p>
                        <Link
                          to={`/news/${item.id}`}
                          className="view-news-button"
                        >
                          View News
                        </Link>
                      </div>
                    </article>
                  );
                })
              ) : (
                <div className="no-news-message">
                  <FaNewspaper size={64} color="#ccc" />
                  <h2>No News Available</h2>
                  <p>
                    Currently, there are no news articles published. Please
                    check back later for the latest updates and announcements.
                  </p>
                </div>
              )}
            </section>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
};

export default NewsPage;
