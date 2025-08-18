import type { FC } from "react";
import { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";
import "./EventsAdmin.css";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import axios from "axios";
import "../../components/Admin/AppDetail.css";

function formatDateAddisAbaba(dateString?: string) {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Invalid Date";

  // Use Intl.DateTimeFormat with Africa/Addis_Ababa timezone
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "Africa/Addis_Ababa",
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

interface Vacancy {
  id: number;
  title: string;
  location: string;
  department: string;
  jobType: string;
  description: string;
  postedAt?: string;
  deadline?: string;
  applications?: ApplicationPreview[];
  slug?: string;
  requiredCandidates?: number;
  vacancyStatus?: "opened" | "closed";
}

interface ApplicationPreview {
  id: number;
  name: string;
  email: string;
  appliedAt?: string;
  resume?: { url: string; name: string };
  qualification?: "not_assessed" | "fail" | "pass" | "reserve"; // Add this
}

function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
}

const VacanciesAdmin: FC = () => {
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [addingNew, setAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [expandedVacancies, setExpandedVacancies] = useState<number[]>([]);
  const baseUrl = import.meta.env.VITE_BACKEND_URL as string;
  const [now, setNow] = useState(new Date());

  const [newData, setNewData] = useState<Partial<Vacancy>>({
    title: "",
    location: "",
    department: "",
    jobType: "Full-Time",
    description: "",
    postedAt: "",
    deadline: "",
    requiredCandidates: 1,
    vacancyStatus: "opened",
  });
  const getEffectiveStatus = (v: Vacancy) => {
    const deadline = v.deadline ? new Date(v.deadline) : null;
    const passedCount = v.applications
      ? v.applications.filter((a) => a.qualification === "pass").length
      : 0;

    if (
      typeof v.requiredCandidates === "number" &&
      v.requiredCandidates > 0 &&
      passedCount >= v.requiredCandidates
    ) {
      return "closed";
    }

    if (deadline && deadline <= now) {
      return "closed";
    }

    return "opened";
  };

  const formatForInput = (dateString: string | undefined) => {
    if (!dateString) return "";
    const date = new Date(dateString);

    // Adjust for local timezone offset so input shows local time correctly
    const tzOffset = date.getTimezoneOffset() * 60000; // offset in ms
    const localISOTime = new Date(date.getTime() - tzOffset)
      .toISOString()
      .slice(0, 16); // YYYY-MM-DDTHH:mm

    return localISOTime;
  };

  const [editData, setEditData] = useState<Partial<Vacancy>>({});

  const editor = useEditor({
    extensions: [StarterKit],
    content: newData.description || "",
    onUpdate: ({ editor }) => handleInput("description", editor.getHTML()),
  });

  const editEditor = useEditor({
    extensions: [StarterKit],
    content: editData.description || "",
    onUpdate: ({ editor }) =>
      handleInput("description", editor.getHTML(), true),
  });

  const fetchVacancies = async () => {
    try {
      // Populate minimal applications fields for preview
      const res = await axiosInstance.get(
        "/vacancies?populate=applications.resume"
      );
      setVacancies(res.data.data);

      // After loading vacancies, sync statuses with backend
      setTimeout(syncVacancyStatus, 100);
    } catch (err) {
      console.error("Failed to fetch vacancies", err);
    }
  };

  useEffect(() => {
    fetchVacancies();
  }, []);

  // Keep track of current time (for deadline checks)
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 60 * 1000); // every 60 seconds

    return () => clearInterval(interval);
  }, []);

  // Call syncVacancyStatus whenever vacancies or now changes to auto-update statuses
  useEffect(() => {
    if (vacancies.length) {
      syncVacancyStatus();
    }
  }, [vacancies, now]);

  // The syncVacancyStatus function to compare and update status on backend if needed
  const syncVacancyStatus = async () => {
    for (const v of vacancies) {
      const effectiveStatus = getEffectiveStatus(v);
      if (v.vacancyStatus !== effectiveStatus) {
        try {
          await axiosInstance.put(`/vacancies/${v.id}`, {
            data: { vacancyStatus: effectiveStatus },
          });
          // Update local state immediately
          setVacancies((prev) =>
            prev.map((vac) =>
              vac.id === v.id ? { ...vac, vacancyStatus: effectiveStatus } : vac
            )
          );
        } catch (error) {
          console.error(
            `Failed to update vacancyStatus for vacancy ${v.id}`,
            error
          );
        }
      }
    }
  };

  const handleInput = (field: keyof Vacancy, value: any, isEdit = false) => {
    // Convert requiredCandidates to number
    if (field === "requiredCandidates") {
      value = parseInt(value, 10);
    }
    if (isEdit) {
      setEditData((prev) => ({ ...prev, [field]: value }));
    } else {
      setNewData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const addVacancy = async () => {
    try {
      if (!newData.title) {
        alert("Title is required");
        return;
      }

      // ✅ Format the data to send to Strapi
      const formattedData = {
        title: newData.title.trim(),
        location: newData.location?.trim() || "",
        department: newData.department?.trim() || "",
        jobType: newData.jobType || "Full-Time",
        description: newData.description?.trim() || "",
        slug: slugify(newData.title),
        vacancyStatus: newData.vacancyStatus || "opened", // ✅ Send status to backend
        ...(newData.postedAt && {
          postedAt: new Date(newData.postedAt).toISOString(),
        }),
        ...(newData.deadline && {
          deadline: new Date(newData.deadline).toISOString(),
        }),
        requiredCandidates: newData.requiredCandidates ?? 1,
      };

      // ✅ Send to Strapi
      const response = await axiosInstance.post("/vacancies", {
        data: formattedData,
      });

      console.log("Vacancy added:", response.data);
      alert("Vacancy added successfully!");

      // ✅ Reset form
      setNewData({
        title: "",
        location: "",
        department: "",
        jobType: "Full-Time",
        description: "",
        postedAt: "",
        deadline: "",
        requiredCandidates: 1,
        vacancyStatus: "opened", // reset to default
      });

      // Optionally refetch vacancies
      fetchVacancies();
    } catch (error) {
      console.error("Error adding vacancy:", error);
      alert("Failed to add vacancy.");
    }
  };

  const updateVacancy = async (id: number) => {
    // Date validation
    if (editData.deadline && new Date(editData.deadline) < new Date()) {
      alert("Deadline must be in the future");
      return;
    }

    if (!editData.title || !editData.title.trim()) {
      alert("Title is required");
      return;
    }

    // ✅ Duplicate check: match on title + location + department, excluding current vacancy
    const isDuplicate = vacancies.some(
      (v) =>
        v.id !== id &&
        v.title.trim().toLowerCase() === editData.title!.trim().toLowerCase() &&
        v.location?.trim().toLowerCase() ===
          editData.location?.trim().toLowerCase() &&
        v.department?.trim().toLowerCase() ===
          editData.department?.trim().toLowerCase()
    );

    if (isDuplicate) {
      alert(
        "A vacancy with the same title, location, and department already exists."
      );
      return;
    }

    try {
      // ✅ Format the data to send to Strapi
      const formattedData = {
        ...editData,
        slug: slugify(editData.title!),
        ...(editData.postedAt && {
          postedAt: new Date(editData.postedAt).toISOString(),
        }),
        ...(editData.deadline && {
          deadline: new Date(editData.deadline).toISOString(),
        }),
        ...(editData.vacancyStatus && {
          vacancyStatus: editData.vacancyStatus, // ✅ Include vacancyStatus
        }),
      };

      // ✅ Send PUT request to Strapi
      await axiosInstance.put(`/vacancies/${id}`, { data: formattedData });

      alert("Vacancy successfully updated!");
      setEditingId(null);
      setEditData({});
      editEditor?.commands.setContent("");
      fetchVacancies();
    } catch (err) {
      console.error("Failed to update vacancy", err);
      if (axios.isAxiosError(err)) {
        alert(err.response?.data?.error?.message || "Failed to update vacancy");
      } else if (err instanceof Error) {
        alert(err.message);
      } else {
        alert("An unknown error occurred");
      }
    }
  };

  const deleteVacancy = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this vacancy?"))
      return;
    try {
      await axiosInstance.delete(`/vacancies/${id}`);
      alert("Vacancy Successfully Deleted!");
      fetchVacancies();
    } catch (err) {
      console.error("Failed to delete vacancy", err);
    }
  };

  const toggleExpand = (id: number) => {
    setExpandedVacancies((prev) =>
      prev.includes(id) ? prev.filter((vId) => vId !== id) : [...prev, id]
    );
  };

  return (
    <div className="events-container">
      <h2 className="events-heading">Vacancies Management</h2>

      <div className="events-controls">
        <input
          type="text"
          className="search-input"
          placeholder="Search vacancies..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="add-btn" onClick={() => setAddingNew(true)}>
          Add Vacancy
        </button>
      </div>

      {addingNew && (
        <div className="form-card">
          <h3 className="form-title">Add Vacancy</h3>
          <div className="form-grid">
            <div>
              <label>Title</label>
              <input
                type="text"
                value={newData.title || ""}
                onChange={(e) => handleInput("title", e.target.value)}
                className="small-input"
              />
            </div>
            <div>
              <label>Location</label>
              <input
                type="text"
                value={newData.location || ""}
                onChange={(e) => handleInput("location", e.target.value)}
                className="small-input"
              />
            </div>
            <div>
              <label>Department</label>
              <input
                type="text"
                value={newData.department || ""}
                onChange={(e) => handleInput("department", e.target.value)}
                className="small-input"
              />
            </div>
            <div>
              <label>Required Candidates</label>
              <input
                type="number"
                min={1}
                value={newData.requiredCandidates ?? 1}
                onChange={(e) =>
                  handleInput("requiredCandidates", e.target.value)
                }
                className="small-input"
              />
            </div>

            <div>
              <label>Job Type</label>
              <select
                value={newData.jobType}
                onChange={(e) => handleInput("jobType", e.target.value)}
                className="small-input"
              >
                <option value="Full-Time">Full-Time</option>
                <option value="Part-Time">Part-Time</option>
                <option value="Contract">Contract</option>
              </select>
            </div>
            <div>
              <label>Posted At</label>
              <input
                type="datetime-local"
                value={formatForInput(newData.postedAt)} // Changed this line
                onChange={(e) => handleInput("postedAt", e.target.value)}
                className="small-input"
              />
            </div>
            <div>
              <label>Deadline</label>
              <input
                type="datetime-local"
                value={formatForInput(newData.deadline)} // Changed this line
                onChange={(e) => handleInput("deadline", e.target.value)}
                className="small-input"
              />
            </div>
            <div className="full-width">
              <label>Description</label>
              <div className="editor-wrapper">
                <EditorContent editor={editor} />
              </div>
            </div>
          </div>
          <div className="form-actions">
            <button className="save-btn" onClick={addVacancy}>
              Save
            </button>
            <button className="cancel-btn" onClick={() => setAddingNew(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="events-card-container">
        {vacancies
          .filter((v) => {
            const term = searchTerm.toLowerCase();
            return (
              v.title.toLowerCase().includes(term) ||
              v.jobType.toLowerCase().includes(term) ||
              v.location.toLowerCase().includes(term) ||
              v.department.toLowerCase().includes(term)
            );
          })
          .map((v) => (
            <div className="event-card" key={v.id} id={`vacancy-${v.id}`}>
              <div className="event-content">
                <h3 className="event-title">{v.title}</h3>
                <p>
                  <strong>Location:</strong> {v.location}
                </p>
                <p>
                  <strong>Department:</strong> {v.department}
                </p>
                <p>
                  <strong>Job Type:</strong> {v.jobType}
                </p>
                <p>
                  <strong>Applications:</strong> {v.applications?.length || 0}
                </p>
                <p>
                  <strong>Required Candidates:</strong>{" "}
                  {v.requiredCandidates ?? "N/A"}
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  <span
                    className={`status-badge ${
                      getEffectiveStatus(v) === "opened"
                        ? "status-active"
                        : "status-closed"
                    }`}
                  >
                    {getEffectiveStatus(v).charAt(0).toUpperCase() +
                      getEffectiveStatus(v).slice(1)}
                  </span>
                </p>

                <p>
                  <strong>Posted At:</strong> {formatDateAddisAbaba(v.postedAt)}
                </p>
                <p>
                  <strong>Deadline:</strong> {formatDateAddisAbaba(v.deadline)}
                </p>
                <div
                  className="event-description"
                  dangerouslySetInnerHTML={{ __html: v.description || "" }}
                />
                <button
                  onClick={() => toggleExpand(v.id)}
                  className="toggle-applications-btn"
                >
                  {expandedVacancies.includes(v.id)
                    ? "Hide Applications"
                    : "Show Applications"}
                </button>

                {expandedVacancies.includes(v.id) && (
                  <div className="applications-preview">
                    {v.applications && v.applications.length > 0 ? (
                      v.applications.map((app) => (
                        <div key={app.id} className="application-card">
                          <div className="application-field">
                            <span className="label">Name:</span>
                            <span>{app.name}</span>
                          </div>
                          <div className="application-field">
                            <span className="label">Email:</span>
                            <span>{app.email}</span>
                          </div>
                          <div className="application-field">
                            <span className="label">Applied:</span>
                            <span>{formatDateAddisAbaba(app.appliedAt)}</span>
                          </div>

                          <span
                            className={`qual-badge ${
                              app.qualification
                                ? `qual-${app.qualification}`
                                : ""
                            }`}
                          >
                            {app.qualification === "not_assessed"
                              ? "Not Assessed"
                              : (app.qualification ?? "Unknown")
                                  .charAt(0)
                                  .toUpperCase() +
                                (app.qualification ?? "").slice(1)}
                          </span>
                          {app.resume?.url && (
                            <div className="application-field resume-links">
                              <span className="label">Resume:</span>
                              <div className="resume-actions">
                                {app.resume.url.endsWith(".pdf") ? (
                                  <>
                                    <a
                                      href={`${baseUrl}${app.resume.url}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      📄 View
                                    </a>
                                    {" | "}
                                  </>
                                ) : null}
                                <a
                                  href={`${baseUrl}${app.resume.url}`}
                                  download
                                >
                                  ⬇ Download
                                </a>
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="no-applications">No applications yet.</p>
                    )}
                  </div>
                )}

                <div className="event-actions">
                  <button
                    className="edit-btn"
                    onClick={() => {
                      setEditingId(v.id);
                      setEditData({ ...v });
                      editEditor?.commands.setContent(v.description || "");
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => deleteVacancy(v.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
      </div>

      {editingId && (
        <div className="modal-overlay">
          <div
            className="modal"
            style={{
              maxHeight: "80vh",
              overflowY: "auto",
              width: "90%",
              maxWidth: "800px",
              padding: "20px",
            }}
          >
            <h3>Edit Vacancy</h3>
            <div className="form-grid">
              <div>
                <label>Title</label>
                <input
                  type="text"
                  value={editData.title || ""}
                  onChange={(e) => handleInput("title", e.target.value, true)}
                  className="small-input"
                />
              </div>
              <div>
                <label>Location</label>
                <input
                  type="text"
                  value={editData.location || ""}
                  onChange={(e) =>
                    handleInput("location", e.target.value, true)
                  }
                  className="small-input"
                />
              </div>
              <div>
                <label>Department</label>
                <input
                  type="text"
                  value={editData.department || ""}
                  onChange={(e) =>
                    handleInput("department", e.target.value, true)
                  }
                  className="small-input"
                />
              </div>
              <div>
                <label>Required Candidates</label>
                <input
                  type="number"
                  min={1}
                  value={editData.requiredCandidates ?? 1}
                  onChange={(e) =>
                    handleInput("requiredCandidates", e.target.value, true)
                  }
                  className="small-input"
                />
              </div>

              <div>
                <label>Job Type</label>
                <select
                  value={editData.jobType}
                  onChange={(e) => handleInput("jobType", e.target.value, true)}
                  className="small-input"
                >
                  <option value="Full-Time">Full-Time</option>
                  <option value="Part-Time">Part-Time</option>
                  <option value="Contract">Contract</option>
                </select>
              </div>
              <div>
                <label>Posted At</label>
                <input
                  type="datetime-local"
                  value={formatForInput(editData.postedAt)}
                  onChange={(e) =>
                    handleInput("postedAt", e.target.value, true)
                  }
                  className="small-input"
                />
              </div>
              <div>
                <label>Deadline</label>
                <input
                  type="datetime-local"
                  value={formatForInput(editData.deadline)}
                  onChange={(e) =>
                    handleInput("deadline", e.target.value, true)
                  }
                  className="small-input"
                />
              </div>
              <div className="full-width">
                <label>Description</label>
                <div
                  className="editor-wrapper"
                  style={{
                    minHeight: "150px",
                    maxHeight: "300px",
                    resize: "vertical",
                    overflow: "auto",
                    border: "1px solid #ccc",
                    padding: "5px",
                  }}
                >
                  <EditorContent editor={editEditor} />
                </div>
              </div>
            </div>
            <div
              className="form-actions"
              style={{
                position: "sticky",
                bottom: 0,
                background: "white",
                padding: "15px 0",
                borderTop: "1px solid #eee",
                marginTop: "15px",
              }}
            >
              <button
                className="save-btn"
                onClick={() => updateVacancy(editingId)}
              >
                Save
              </button>
              <button
                className="cancel-btn"
                onClick={() => {
                  setEditingId(null);
                  setEditData({});
                  editEditor?.commands.setContent("");
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VacanciesAdmin;
