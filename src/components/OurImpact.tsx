import { useEffect, useState } from "react";
import {
  FaHeartbeat,
  FaBook,
  FaTrophy,
  FaChartLine,
  FaHandsHelping,
  FaGlobe
} from "react-icons/fa";
import axiosInstance from "../utils/axiosInstance";
import "./OurImpact.css";

interface Impact {
  id: number;
  title: string;
  value: string;
  description?: string;
}

// Map keywords to icons
const getIconForImpact = (text: string) => {
  const lower = text.toLowerCase();
  if (lower.includes("health") || lower.includes("maternal") || lower.includes("child")) return FaHeartbeat;
  if (lower.includes("education") || lower.includes("school") || lower.includes("training")) return FaBook;
  if (lower.includes("success") || lower.includes("achievement") || lower.includes("award")) return FaTrophy;
  if (lower.includes("growth") || lower.includes("progress") || lower.includes("reduction")) return FaChartLine;
  if (lower.includes("support") || lower.includes("help") || lower.includes("assistance")) return FaHandsHelping;
  return FaGlobe; // default icon
};

const OurImpact: React.FC = () => {
  const [impacts, setImpacts] = useState<Impact[]>([]);

  const fetchImpacts = async () => {
    try {
      const res = await axiosInstance.get("/impacts");
      const mapped: Impact[] = res.data.map((item: any) => ({
        id: item.id,
        title: item.title || "",
        value: item.value || "",
        description: item.description || "",
      }));
      setImpacts(mapped);
    } catch (err) {
      console.error("Failed to fetch impacts", err);
    }
  };

  useEffect(() => {
    fetchImpacts();
    const interval = setInterval(fetchImpacts, 15000); // refresh every 15s
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="impact-section" aria-label="Our Impact">
      <h2 className="impact-title">Our Impact</h2>
      <div className="impact-grid">
        {impacts.length > 0 ? (
          impacts.map((impact) => {
            const Icon = getIconForImpact(impact.title + " " + impact.description);
            return (
              <div key={impact.id} className="impact-card" tabIndex={0}>
                <div className="impact-icon">
                  <Icon />
                </div>
                <p className="impact-value">{impact.value}</p>
                <h3 className="impact-title-small">{impact.title}</h3>
                <p className="impact-description">{impact.description}</p>
              </div>
            );
          })
        ) : (
          <p>No impacts available at the moment.</p>
        )}
      </div>
    </section>
  );
};

export default OurImpact;
