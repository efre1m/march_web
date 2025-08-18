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
    if (!track) return;

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

    let offset = direction === "left" ? -200 : 200;
    let newPosition = currentPositionRef.current + offset;

    if (newPosition < 0) newPosition = scrollWidthRef.current;
    if (newPosition > scrollWidthRef.current) newPosition = 0;

    currentPositionRef.current = newPosition;
    track.style.transform = `translateX(-${newPosition}px)`;

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
        <button className="arrow left" onClick={() => scrollManual("left")}>
          &#8592;
        </button>
        <div className="staff-container">
          <div className="staff-track" ref={trackRef}>
            {[...team, ...team].map((member, index) => {
              const initials = member.Name.split(" ")
                .map((n) => n[0])
                .join("");

              const imageUrl =
                member.Image?.formats?.thumbnail?.url ||
                member.Image?.url ||
                "";

              return (
                <div className="staff-card" key={index}>
                  <div className="staff-image-wrapper">
                    {imageUrl ? (
                      <img
                        src={`${baseUrl}${imageUrl}`}
                        alt={member.Name}
                        className="staff-image"
                      />
                    ) : (
                      <div className="staff-placeholder">{initials}</div>
                    )}
                  </div>
                  <h3>{member.Name}</h3>
                  <p>{member.Position}</p>
                  <p className="staff-email">
                    <FaEnvelope /> {member.Email}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
        <button className="arrow right" onClick={() => scrollManual("right")}>
          &#8594;
        </button>
      </div>
    </section>
  );
};

export default StaffMembers;
