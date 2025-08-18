import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaTwitter, FaLinkedin, FaFacebook } from "react-icons/fa";

const LeftSidebar: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarStyles, setSidebarStyles] = useState({
    top: "80px",
    height: "calc(100vh - 160px)",
  });

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

    updateSidebarPosition();
    window.addEventListener("resize", updateSidebarPosition);
    return () => window.removeEventListener("resize", updateSidebarPosition);
  }, [isMobile]);

  if (isMobile) return null;

  const sidebarStyle: React.CSSProperties = {
    position: "fixed",
    width: "5vw", // width controls everything else
    minWidth: "50px",
    maxWidth: "80px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    background: "linear-gradient(135deg, var(--primary), var(--accent))",
    color: "var(--text-light)",
    padding: "1em 0", // now relative to width
    borderRadius: "16px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
    zIndex: 10,
    overflow: "hidden",
    left: "1vw",
    borderRight: "1px solid rgba(255, 255, 255, 0.15)",
    fontSize: "0.8em", // all inner sizes relative to width
    ...sidebarStyles,
  };

  const contentStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    height: "100%",
    gap: "2em",
  };

  const socialLinksStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "1.5em",
    fontSize: "1.5em", // icon size relative to container
  };

  const verticalTextStyle: React.CSSProperties = {
    writingMode: "vertical-rl",
    transform: "rotate(180deg)",
    fontSize: "1em",
    fontWeight: 500,
    letterSpacing: "0.1em",
    color: "var(--text-light)",
    opacity: 0.9,
    animation: "floatText 4s ease-in-out infinite",
  };

  return (
    <motion.aside
      style={sidebarStyle}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div style={contentStyle}>
        <div style={socialLinksStyle}>
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaTwitter />
          </a>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaLinkedin />
          </a>
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaFacebook />
          </a>
        </div>
        <div style={verticalTextStyle}>
          <span>Digital Health Research</span>
        </div>
      </div>
      <style>{`
        @keyframes floatText {
          0% { transform: translateY(0) rotate(180deg); }
          50% { transform: translateY(-6px) rotate(180deg); }
          100% { transform: translateY(0) rotate(180deg); }
        }
        a {
          color: var(--text-light);
          opacity: 0.8;
          transition: all 0.3s ease;
        }
        a:hover {
          opacity: 1;
          transform: translateY(-2px);
        }
      `}</style>
    </motion.aside>
  );
};

export default LeftSidebar;
