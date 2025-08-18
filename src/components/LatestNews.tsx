import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import axiosInstance from "../utils/axiosInstance";
import "./latestNews.css";

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

const LatestNews = () => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [newsItems, setNewsItems] = useState<NewsArticle[]>([]);
  const strapiBaseURL = import.meta.env.VITE_BACKEND_URL as string;

  useEffect(() => {
    let isMounted = true;

    const fetchNews = async () => {
      try {
        const response = await axiosInstance.get(
          "/news-articles?populate[content_blocks][populate]=image"
        );

        if (!isMounted) return;

        const sortedNews = response.data.data
          .sort(
            (a: any, b: any) =>
              new Date(b.date).getTime() - new Date(a.date).getTime()
          )
          .slice(0, 4); // take only top 4 by date

        // Avoid resetting state if data didn't change
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
      }
    };

    fetchNews();

    const intervalId = setInterval(fetchNews, 3500); // refresh every 3.5s

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  // Extract first sentence from a string (assumed plain text)
  const getFirstSentence = (text: string) => {
    const match = text.match(/[^.!?]*[.!?]/);
    return match ? match[0] : text;
  };

  const scroll = (direction: "left" | "right") => {
    if (carouselRef.current) {
      const scrollAmount = carouselRef.current.offsetWidth;
      carouselRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="latest-news-section">
      <h2 className="section-title">Latest News</h2>

      <div className="news-carousel-container">
        <button className="carousel-arrow left" onClick={() => scroll("left")}>
          <FaArrowLeft />
        </button>

        <div className="news-carousel" ref={carouselRef}>
          {newsItems.map((item) => {
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
              <div className="news-card" key={item.id}>
                {firstBlock?.image ? (
                  <img src={imgUrl} alt={item.title} className="news-image" />
                ) : (
                  <div className="no-image">No Image</div>
                )}
                <h3 className="news-title">{item.title}</h3>
                <small className="news-date">
                  {new Date(item.date).toLocaleDateString()}
                </small>
                <p className="news-snippet">
                  {getFirstSentence(firstBlock?.description || "")}
                </p>
              </div>
            );
          })}
        </div>

        <button
          className="carousel-arrow right"
          onClick={() => scroll("right")}
        >
          <FaArrowRight />
        </button>
      </div>

      <div className="view-all-button-container">
        <Link to="/NewsPage" className="view-all-news-button">
          View All News
        </Link>
      </div>
    </section>
  );
};

export default LatestNews;
