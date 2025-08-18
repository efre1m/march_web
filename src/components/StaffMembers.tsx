import { useRef, useEffect, useState } from "react";
import { FaEnvelope } from "react-icons/fa";
import axiosInstance from "../utils/axiosInstance";
import "./StaffMembers.css";

interface TeamMember {
  id: number;
  Name: string;
  Position: string;
  Email: string;
  Image?: {
    url?: string;
    formats?: {
      thumbnail?: {
        url?: string;
      };
    };
  };
}

const StaffMembers = () => {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const baseUrl = import.meta.env.VITE_BACKEND_URL || "";

  const trackRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const currentPositionRef = useRef(0);
  const scrollWidthRef = useRef(0);
  const speed = 1;

  const fetchTeam = async () => {
    try {
      const res = await axiosInstance.get("/team-members?populate=Image");
      setTeam(res.data.data);
    } catch (error) {
      console.error("Failed to fetch team members:", error);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || team.length === 0) return;

    // Calculate total scrollable width
    scrollWidthRef.current = track.scrollWidth / 2;

    const animate = () => {
      currentPositionRef.current += speed;
      if (currentPositionRef.current >= scrollWidthRef.current) {
        currentPositionRef.current = 0;
      }
      track.style.transform = `translateX(-${currentPositionRef.current}px)`;
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [team]);

  const scrollManual = (direction: "left" | "right") => {
    const track = trackRef.current;
    if (!track) return;

    if (animationRef.current) cancelAnimationFrame(animationRef.current);

    const offset = direction === "left" ? -200 : 200;
    let newPosition = currentPositionRef.current + offset;

    // Handle wrap-around
    if (newPosition < 0)
      newPosition = scrollWidthRef.current - Math.abs(newPosition);
    if (newPosition > scrollWidthRef.current) newPosition = 0;

    currentPositionRef.current = newPosition;
    track.style.transform = `translateX(-${newPosition}px)`;

    // Restart animation
    animationRef.current = requestAnimationFrame(() => {
      const animate = () => {
        currentPositionRef.current += speed;
        if (currentPositionRef.current >= scrollWidthRef.current) {
          currentPositionRef.current = 0;
        }
        track.style.transform = `translateX(-${currentPositionRef.current}px)`;
        animationRef.current = requestAnimationFrame(animate);
      };
      animate();
    });
  };

  return (
    <section className="staff-section">
      <h2>Our Core Team</h2>
      <div className="staff-container-wrapper">
        <button
          className="arrow left"
          onClick={() => scrollManual("left")}
          aria-label="Scroll left"
        >
          &#8592;
        </button>
        <div className="staff-container">
          <div className="staff-track" ref={trackRef}>
            {team.map((member) => {
              const initials = member.Name.split(" ")
                .map((n) => n[0])
                .join("");

              const imageUrl =
                member.Image?.formats?.thumbnail?.url || member.Image?.url;

              return (
                <div className="staff-card" key={member.id}>
                  <div className="staff-image-wrapper">
                    {imageUrl ? (
                      <img
                        src={`${baseUrl}${imageUrl}`}
                        alt={member.Name}
                        className="staff-image"
                        loading="lazy"
                      />
                    ) : (
                      <div className="staff-placeholder">{initials}</div>
                    )}
                  </div>
                  <h3>{member.Name}</h3>
                  <p>{member.Position}</p>
                  {member.Email && (
                    <p className="staff-email">
                      <FaEnvelope /> {member.Email}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        <button
          className="arrow right"
          onClick={() => scrollManual("right")}
          aria-label="Scroll right"
        >
          &#8594;
        </button>
      </div>
    </section>
  );
};

export default StaffMembers;
