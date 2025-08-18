import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { MapPin, Building2, Briefcase, Search, BadgeCheck } from "lucide-react";
import { FaPhoneAlt } from "react-icons/fa";
import { useNavigate, Link } from "react-router-dom";
import "./Vacancies.css";
import LeftSidebar from "../components/LeftSidebar";
import RightSidebar from "../components/RightSidebar";
import axiosInstance from "../utils/axiosInstance";

type VacancyItem = {
  id: number;
  title: string;
  location: string;
  department: string;
  jobType: string;
  description: string;
  slug: string;
  postedAt: string;
  deadline: string;
  vacancyStatus: "opened" | "closed";
};

const Vacancies: React.FC = () => {
  const [vacancies, setVacancies] = useState<VacancyItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("All");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [jobTypeFilter, setJobTypeFilter] = useState("All");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVacancies = async () => {
      try {
        const res = await axiosInstance.get("/vacancies");
        const formatted = res.data.data.map((v: any) => ({
          id: v.id,
          title: v.title,
          location: v.location,
          department: v.department,
          jobType: v.jobType,
          description: v.description,
          slug: v.slug,
          postedAt: new Date(v.postedAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          }),
          deadline: v.deadline,
          vacancyStatus: v.vacancyStatus,
        }));
        setVacancies(formatted);
      } catch (err) {
        console.error("Failed to fetch vacancies:", err);
      }
    };

    fetchVacancies();
    const interval = setInterval(fetchVacancies, 10000);
    return () => clearInterval(interval);
  }, []);

  const uniqueLocations = Array.from(new Set(vacancies.map((v) => v.location)));
  const uniqueDepartments = Array.from(
    new Set(vacancies.map((v) => v.department))
  );
  const uniqueJobTypes = Array.from(new Set(vacancies.map((v) => v.jobType)));

  const filteredVacancies = vacancies.filter((vacancy) => {
    const matchesSearch =
      `${vacancy.title} ${vacancy.location} ${vacancy.department}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesLocation =
      locationFilter === "All" || vacancy.location === locationFilter;
    const matchesDepartment =
      departmentFilter === "All" || vacancy.department === departmentFilter;
    const matchesJobType =
      jobTypeFilter === "All" || vacancy.jobType === jobTypeFilter;
    return (
      matchesSearch && matchesLocation && matchesDepartment && matchesJobType
    );
  });

  return (
    <>
      <Header />
      <LeftSidebar />
      <RightSidebar />
      <main className="main-content">
        <div className="vacancies-hero">
          <nav className="breadcrumb">
            <Link to="/">Home</Link>{" "}
            <span className="breadcrumb-separator">|</span> Vacancies
          </nav>
          <h1 className="vacancies-title">Join Our World-Class Team</h1>
          <p className="vacancies-subtitle">
            Discover opportunities to shape the future with us.
          </p>
          <div className="vacancies-search-bar">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Search by title, location or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="search-btn">Search</button>
          </div>
        </div>

        <div className="vacancies-layout">
          <aside className="vacancies-sidebar">
            <h3>Filter By</h3>

            <div className="filter-group">
              <label>Location</label>
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
              >
                <option>All</option>
                {uniqueLocations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Department</label>
              <select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
              >
                <option>All</option>
                {uniqueDepartments.map((dep) => (
                  <option key={dep} value={dep}>
                    {dep}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Job Type</label>
              <select
                value={jobTypeFilter}
                onChange={(e) => setJobTypeFilter(e.target.value)}
              >
                <option>All</option>
                {uniqueJobTypes.map((jt) => (
                  <option key={jt} value={jt}>
                    {jt}
                  </option>
                ))}
              </select>
            </div>

            <div className="sidebar-extra-info">
              <h4>Need Help?</h4>
              <p>
                If you have questions about the application process,&nbsp;
                <a href="/contact" className="contact-link-v">
                  <FaPhoneAlt style={{ marginRight: 6 }} />
                  Contact our HR team
                </a>
              </p>
            </div>
          </aside>

          <section className="vacancies-main">
            {vacancies.length === 0 ? (
              <div className="vacancies-message no-vacancies">
                <h2>No Vacancies Available</h2>
                <p>Please check back later for new job openings.</p>
              </div>
            ) : filteredVacancies.length > 0 ? (
              filteredVacancies.map((job) => (
                <div key={job.id} className="vacancy-card">
                  <div className="vacancy-card-header">
                    <h3>
                      <Briefcase size={20} style={{ marginRight: 8 }} />
                      {job.title}
                    </h3>
                    <span className="vacancy-badge">
                      <BadgeCheck size={14} style={{ marginRight: 4 }} />
                      {job.jobType}
                    </span>
                  </div>
                  <p className="vacancy-meta">
                    <MapPin size={16} /> {job.location} &nbsp;|&nbsp;
                    <Building2 size={16} style={{ marginLeft: 8 }} />
                    {job.department}
                  </p>
                  <div
                    className="vacancy-description"
                    dangerouslySetInnerHTML={{ __html: job.description }}
                  />
                  <p className="vacancy-dates">
                    <strong>Posted:</strong> {job.postedAt} &nbsp;|&nbsp;
                    <strong>Deadline:</strong>{" "}
                    {new Date(job.deadline).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                  <p className="vacancy-status">
                    <strong>Status:</strong>{" "}
                    <span
                      style={{
                        color: job.vacancyStatus === "opened" ? "green" : "red",
                        fontWeight: "bold",
                      }}
                    >
                      {job.vacancyStatus.toUpperCase()}
                    </span>
                  </p>
                  <button
                    type="button"
                    className="apply-button"
                    disabled={job.vacancyStatus === "closed"}
                    title={
                      job.vacancyStatus === "closed"
                        ? "This vacancy is closed"
                        : ""
                    }
                    onClick={() =>
                      navigate(
                        `/apply?vacancyId=${job.id}&title=${encodeURIComponent(job.title)}`
                      )
                    }
                  >
                    Apply Now
                  </button>
                </div>
              ))
            ) : (
              <div className="vacancies-message no-filter-match">
                <p>No matching vacancies found.</p>
                <p>Please try another filter or check back later.</p>
              </div>
            )}
          </section>

          <aside className="vacancies-rightbar">
            <div className="highlight-box">
              <h4>Why Work With Us?</h4>
              <ul>
                <li>Innovative, inclusive culture</li>
                <li>Global impact projects</li>
                <li>Competitive compensation</li>
              </ul>
            </div>
            <div className="testimonial-box">
              <div className="staff-image-wrapper testimonial-avatar-wrapper">
                <img
                  src="/images/team/sami.jpg"
                  alt="Team Member"
                  className="staff-image"
                />
              </div>
              <p>
                "Working here has been the most rewarding experience of my
                career."
              </p>
              <span>- DHC Head</span>
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Vacancies;
