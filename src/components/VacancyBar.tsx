import { useState } from "react";
import type { KeyboardEvent } from "react";
import "./VacancyBar.css";

const VacancyBar: React.FC = () => {
  const [expanded, setExpanded] = useState<boolean>(false);

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter") {
      setExpanded(!expanded);
    }
  };

  return (
    <div className={`vacancy-bar ${expanded ? "expanded" : ""}`}>
      <div
        className="vacancy-header"
        onClick={() => setExpanded(!expanded)}
        role="button"
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        <h3>Current Vacancies</h3>
        <span className="toggle-icon">{expanded ? "▲" : "▼"}</span>
      </div>

      {expanded && (
        <div className="vacancy-content">
          <div className="vacancy-list">
            <p className="empty-message">
              No current vacancies. Please check back later.
            </p>

            {/* Future vacancies will be rendered here */}
            {/* {vacancies.map(vacancy => (
              <div key={vacancy.id} className="vacancy-item">
                <h4>{vacancy.title}</h4>
                <div className="vacancy-meta">
                  <span>{vacancy.department}</span>
                  <span>Deadline: {vacancy.deadline}</span>
                </div>
                <button className="apply-btn">Apply Now</button>
              </div>
            ))} */}
          </div>
        </div>
      )}
    </div>
  );
};

export default VacancyBar;
