import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaEnvelope } from "react-icons/fa";
import { Link } from "react-router-dom";

const RightSidebar: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarStyles, setSidebarStyles] = useState({
    top: "80px",
    height: "calc(100vh - 160px)",
  });
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile) return;

    const updateSidebarPosition = () => {
      const header = document.querySelector("header");
      const footer = document.querySelector("footer");
      const headerHeight = header?.getBoundingClientRect().height || 80;
      const footerHeight = footer?.getBoundingClientRect().height || 80;

      setSidebarStyles({
        top: `${headerHeight}px`,
        height: `calc(100vh - ${headerHeight + footerHeight}px)`,
      });
    };

    const updateScrollProgress = () => {
      const totalHeight = document.body.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setScrollProgress(progress);
    };

    updateSidebarPosition();
    window.addEventListener("resize", updateSidebarPosition);
    window.addEventListener("scroll", updateScrollProgress);
    return () => {
      window.removeEventListener("resize", updateSidebarPosition);
      window.removeEventListener("scroll", updateScrollProgress);
    };
  }, [isMobile]);

  if (isMobile) return null;

  const sidebarStyle: React.CSSProperties = {
    position: "fixed",
    width: "5vw",
    minWidth: "50px",
    maxWidth: "80px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    background: "linear-gradient(135deg, var(--primary), var(--accent))",
    color: "var(--text-light)",
    padding: "1em 0",
    borderRadius: "16px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
    zIndex: 10,
    overflow: "hidden",
    right: "1vw",
    borderLeft: "1px solid rgba(255, 255, 255, 0.15)",
    fontSize: "0.8em",
    ...sidebarStyles,
  };

  const contentStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    height: "100%",
    gap: "2em",
    position: "relative",
  };

  const scrollTrackStyle: React.CSSProperties = {
    position: "absolute",
    top: 0,
    right: "50%",
    height: "100%",
    width: "1px",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  };

  const scrollProgressStyle: React.CSSProperties = {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "var(--text-light)",
    transition: "height 0.1s ease",
    height: `${scrollProgress}%`,
  };

  const emailStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0.5em",
    fontSize: "1em",
    fontWeight: 500,
    textDecoration: "none",
    color: "var(--text-light)",
    writingMode: "vertical-rl",
    opacity: 0.9,
  };

  return (
    <motion.aside
      style={sidebarStyle}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div style={contentStyle}>
        <div style={scrollTrackStyle}>
          <div style={scrollProgressStyle} />
        </div>
        <Link to="/contact" style={emailStyle}>
          <FaEnvelope style={{ fontSize: "1.5em" }} />
          <span>Contact Us</span>
        </Link>
      </div>
      <style>{`
        a:hover {
          color: #ffefb0 !important;
          opacity: 1 !important;
        }
      `}</style>
    </motion.aside>
  );
};

export default RightSidebar;
