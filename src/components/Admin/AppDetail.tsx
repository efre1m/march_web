// src/components/Admin/AppDetail.tsx
import type { FC } from "react";
import { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";
import "./AppDetail.css";
import * as XLSX from "xlsx";
import "../../pages/admin/TeamMembers.css";

// Interfaces
interface Vacancy {
  id: number;
  title: string;
  vacancyStatus?: "opened" | "closed";
}

interface ResumeFile {
  id: number;
  url: string;
  name: string;
}

interface Application {
  id: number;
  name: string;
  email: string;
  phoneNumber: string;
  resume?: ResumeFile;
  coverLetter?: string;
  appliedAt?: string;
  vacancy?: Vacancy;
  vacancyTitle?: string;
  qualification?: "not_assessed" | "fail" | "pass" | "reserve";
}

const AppDetail: FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [vacancyFilter, setVacancyFilter] = useState<string>("All");
  const [vacancyOptions, setVacancyOptions] = useState<Vacancy[]>([]);

  useEffect(() => {
    fetchVacancies();
    fetchApplications();

    // Poll every 5 seconds for updates
    const interval = setInterval(() => {
      fetchApplications();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await axiosInstance.get("/applications");
      setApplications(res.data.data);
    } catch (err) {
      console.error("Failed to fetch applications", err);
    }
  };

  const fetchVacancies = async () => {
    try {
      const res = await axiosInstance.get("/vacancies");
      setVacancyOptions(res.data.data);
    } catch (err) {
      console.error("Failed to fetch vacancies", err);
    }
  };

  const filteredApplications = applications.filter((app) => {
    const term = searchTerm.toLowerCase();

    const name = (app.name ?? "").toLowerCase();
    const email = (app.email ?? "").toLowerCase();
    const phone = (app.phoneNumber ?? "").toLowerCase();
    const vacancyTitle = (
      app.vacancy?.title ||
      app.vacancyTitle ||
      "N/A"
    ).toLowerCase();
    const qualification = (app.qualification ?? "").toLowerCase();

    const matchesSearch =
      name.includes(term) ||
      email.includes(term) ||
      phone.includes(term) ||
      vacancyTitle.includes(term) ||
      qualification.includes(term);

    const matchesVacancy =
      vacancyFilter === "All" ||
      (vacancyFilter === "N/A" && !app.vacancy && !app.vacancyTitle) ||
      app.vacancy?.title === vacancyFilter ||
      app.vacancyTitle === vacancyFilter;

    return matchesSearch && matchesVacancy;
  });

  const exportExcel = () => {
    if (filteredApplications.length === 0) {
      alert("No applications found to export.");
      return;
    }
    const worksheetData = filteredApplications.map((app, index) => ({
      No: index + 1,
      Name: app.name,
      Email: app.email,
      Phone: app.phoneNumber,
      Qualification: app.qualification?.toUpperCase() || "N/A",
      Vacancy: app.vacancy?.title || app.vacancyTitle || "N/A",
      "Applied At": app.appliedAt
        ? new Date(app.appliedAt).toLocaleDateString()
        : "N/A",
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Applications");

    // Create filename
    const normalizedTitle =
      vacancyFilter === "All"
        ? "all_vacancies"
        : vacancyFilter.toLowerCase().replace(/\s+/g, "_");

    XLSX.writeFile(workbook, `${normalizedTitle}.xlsx`);
  };

  return (
    <div className="app-detail-container">
      <h2>Applications Summary</h2>

      <div className="team-controls">
        <input
          type="text"
          placeholder="Search by name, email, phone, etc..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />

        <select
          className="vacancy-dropdown"
          value={vacancyFilter}
          onChange={(e) => setVacancyFilter(e.target.value)}
        >
          <option value="All">All Vacancies</option>
          <option value="N/A">N/A</option>
          {vacancyOptions.map((vac) => (
            <option key={vac.id} value={vac.title}>
              {vac.title}
            </option>
          ))}
        </select>

        <div className="export-buttons">
          <button onClick={exportExcel} className="export-btn excel-btn">
            Export Excel
          </button>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="team-table">
          <thead>
            <tr>
              <th>No.</th>
              <th>Name</th>
              <th>Email</th>
              <th>Phone Number</th>
              <th>Qualification</th>
              <th>Vacancy</th>
              <th>Applied At</th>
              <th>Vacancy Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredApplications.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: "center" }}>
                  No applications found.
                </td>
              </tr>
            ) : (
              filteredApplications.map((app, index) => (
                <tr key={app.id}>
                  <td>{index + 1}</td>
                  <td>{app.name}</td>
                  <td>{app.email}</td>
                  <td>{app.phoneNumber}</td>
                  <td
                    className={
                      app.qualification ? `qual-${app.qualification}` : ""
                    }
                  >
                    {app.qualification === "not_assessed"
                      ? "Not Assessed"
                      : app.qualification?.toUpperCase() || "N/A"}
                  </td>
                  <td>{app.vacancy?.title || app.vacancyTitle || "N/A"}</td>
                  <td>
                    {app.appliedAt
                      ? new Date(app.appliedAt).toLocaleDateString()
                      : "N/A"}
                  </td>
                  <td>
                    <span
                      className={`status-badge ${
                        app.vacancy?.vacancyStatus === "opened"
                          ? "status-open"
                          : "status-closed"
                      }`}
                    >
                      {app.vacancy?.vacancyStatus === "opened"
                        ? "Opened"
                        : "Closed"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AppDetail;
