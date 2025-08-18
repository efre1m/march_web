import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { FaArrowLeft, FaRegCalendarAlt } from "react-icons/fa";
import "./SingleNewsPage.css";
import "./admin/EventsAdmin.css";

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

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
  date: string;
  content_blocks?: ContentBlock[];
}

const SingleNewsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [news, setNews] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false); // single toggle
  const strapiBaseURL = import.meta.env.VITE_BACKEND_URL || "";

  useEffect(() => {
    let isMounted = true;

    const fetchArticle = async () => {
      try {
        const res = await axiosInstance.get(
          `/news-articles/${id}?populate[content_blocks][populate]=image`
        );

        if (isMounted) {
          setNews(res.data.data);
          setError(null);
        }
      } catch (err) {
        console.error("Failed to fetch article", err);
        if (isMounted) {
          setError("Failed to load the news article.");
          setNews(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (id) {
      fetchArticle();
      const interval = setInterval(() => {
        fetchArticle();
      }, 3000);

      return () => {
        isMounted = false;
        clearInterval(interval);
      };
    }
  }, [id]);

  const truncateHTML = (html: string, wordLimit: number) => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    const text = tempDiv.textContent || tempDiv.innerText || "";
    const words = text.split(/\s+/);
    if (words.length <= wordLimit) return html;
    return words.slice(0, wordLimit).join(" ") + "...";
  };

  if (loading) {
    return (
      <>
        <Header />
        <main className="news-detail-wrapper">
          <p>Loading...</p>
        </main>
        <Footer />
      </>
    );
  }

  if (error || !news) {
    return (
      <>
        <Header />
        <main className="news-detail-wrapper">
          <p>{error || "News article not found."}</p>
          <Link to="/news" className="view-news-button back-button">
            <FaArrowLeft style={{ marginRight: 6 }} /> Back to News
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
              <div className="news-detail-text">
                <h2 className="news-detail-title">{news.title}</h2>
                <div className="news-detail-date">
                  <FaRegCalendarAlt style={{ marginRight: 6 }} />
                  {formatDate(news.date)}
                </div>

                {/* Only first block visible initially */}
                {news.content_blocks?.map((block, index) => {
                  if (!showAll && index > 0) {
                    return null; // hide other blocks until expanded
                  }

                  const imageUrl = block.image
                    ? strapiBaseURL +
                      (block.image.formats?.large?.url ||
                        block.image.formats?.medium?.url ||
                        block.image.formats?.small?.url ||
                        block.image.url)
                    : null;

                  return (
                    <div key={index} className="news-block">
                      {imageUrl && (
                        <div className="image-wrapper">
                          <img
                            src={imageUrl}
                            alt={block.title || `Image ${index + 1}`}
                            className="news-detail-image"
                          />
                        </div>
                      )}
                      {block.title && (
                        <h4 className="block-title">{block.title}</h4>
                      )}
                      <div className="news-detail-description">
                        <div
                          dangerouslySetInnerHTML={{
                            __html:
                              !showAll && index === 0
                                ? truncateHTML(block.description, 30)
                                : block.description,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}

                {/* Single Read More / Read Less Button */}
                {news.content_blocks && news.content_blocks.length > 1 && (
                  <button
                    onClick={() => setShowAll(!showAll)}
                    className="read-more-button"
                  >
                    {showAll ? "Read less" : "Read more"}
                  </button>
                )}

                <Link to="/NewsPage" className="view-news-button back-button">
                  <FaArrowLeft style={{ marginRight: 6 }} /> Back to News
                </Link>
              </div>
            </div>
          </section>

          <aside className="news-detail-right">
            <h3>About Our News</h3>
            <p>
              Stay connected with DHRDC updates. We bring you the latest news
              focusing on maternal and child health, ongoing research, and
              impactful community stories.
            </p>
            <p>
              Explore other news items, share your feedback, and join our
              mission to improve health outcomes worldwide.
            </p>
            <Link to="/NewsPage" className="view-news-button">
              View All News
            </Link>
          </aside>
        </main>
      </div>
      <Footer />
    </>
  );
};

export default SingleNewsPage;
