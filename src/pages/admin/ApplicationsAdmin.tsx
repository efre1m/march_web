import type { FC, ChangeEvent } from "react";
import { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";
import "./EventsAdmin.css";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import AppDetail from "../../components/Admin/AppDetail";
import "../../components/Admin/AppDetail.css";

// helper to format date in Addis Ababa timezone
function formatDateAddisAbaba(dateString?: string) {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Invalid Date";

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

const ApplicationsAdmin: FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [addingNew, setAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const getFullStrapiURL = (url: string) => {
    const strapiBaseURL = import.meta.env.VITE_BACKEND_URL as string;
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return strapiBaseURL + url;
  };

  const [newData, setNewData] = useState<Partial<Application>>({
    name: "",
    email: "",
    phoneNumber: "",
    qualification: "not_assessed",
    coverLetter: "",
    appliedAt: "",
    vacancy: undefined,
    resume: undefined,
  });

  const [editData, setEditData] = useState<Partial<Application>>({});

  const [vacancies, setVacancies] = useState<Vacancy[]>([]);

  const editor = useEditor({
    extensions: [StarterKit],
    content: newData.coverLetter || "",
    onUpdate: ({ editor }) => handleInput("coverLetter", editor.getHTML()),
  });

  const editEditor = useEditor({
    extensions: [StarterKit],
    content: editData.coverLetter || "",
    onUpdate: ({ editor }) =>
      handleInput("coverLetter", editor.getHTML(), true),
  });

  useEffect(() => {
    fetchApplications();
    fetchVacancies();
  }, []);
  useEffect(() => {
    const channel = new BroadcastChannel("application_channel");

    channel.onmessage = (event) => {
      if (event.data === "new_application_added") {
        fetchApplications();
      }
    };

    return () => {
      channel.close();
    };
  }, []);
  const fetchVacancies = async () => {
    try {
      const res = await axiosInstance.get("/vacancies");
      setVacancies(res.data.data);
    } catch (err) {
      console.error("Failed to fetch vacancies", err);
    }
  };

  const fetchApplications = async () => {
    try {
      const res = await axiosInstance.get("/applications");
      setApplications(res.data.data);
    } catch (err) {
      console.error("Failed to fetch applications", err);
    }
  };

  const handleInput = (
    field: keyof Application,
    value: string | Vacancy | undefined,
    isEdit = false
  ) => {
    if (isEdit) {
      setEditData((prev) => ({ ...prev, [field]: value }));
    } else {
      setNewData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleFileChange = (
    e: ChangeEvent<HTMLInputElement>,
    isEdit = false
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("files", file);

    axiosInstance
      .post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((res) => {
        const uploadedFile = res.data[0];
        if (isEdit) {
          setEditData((prev) => ({ ...prev, resume: uploadedFile }));
        } else {
          setNewData((prev) => ({ ...prev, resume: uploadedFile }));
        }
      })
      .catch((err) => {
        console.error("Failed to upload resume", err);
        alert("❌ Failed to upload resume. Please try again.");
      });
  };

  const isValidEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validateApplication = (data: Partial<Application>) => {
    if (
      !data.name ||
      !data.email ||
      !isValidEmail(data.email) ||
      !data.phoneNumber ||
      !data.resume ||
      !data.vacancy
    ) {
      return false;
    }
    return true;
  };

  const addApplication = async () => {
    if (!validateApplication(newData)) {
      alert(
        "❌ Please fill all required fields correctly (valid email required)."
      );
      return;
    }

    const selectedVacancyId = (newData.vacancy as Vacancy).id;
    const email = newData.email ?? "";

    // Check if the user already applied to this vacancy
    const hasAlreadyApplied = applications.some(
      (app) =>
        app.email === email &&
        (app.vacancy?.id === selectedVacancyId ||
          app.vacancyTitle === (newData.vacancy as Vacancy).title)
    );

    if (hasAlreadyApplied) {
      alert("❌ You have already applied to this vacancy.");
      return;
    }

    // Check how many different jobs the user has already applied to
    const uniqueJobIds = new Set(
      applications
        .filter((app) => app.email === email)
        .map((app) => app.vacancy?.id || app.vacancyTitle)
    );

    if (uniqueJobIds.size >= 3) {
      alert("❌ You can only apply to a maximum of 3 different jobs.");
      return;
    }

    try {
      const currentTimestamp = new Date().toISOString();
      const payload = {
        ...newData,
        appliedAt: currentTimestamp,
        vacancy: selectedVacancyId,
        vacancyTitle: (newData.vacancy as Vacancy).title,
        resume: (newData.resume as { id: number }).id,
      };

      await axiosInstance.post("/applications", { data: payload });
      alert("✅ Application added successfully!");

      setAddingNew(false);
      setNewData({
        name: "",
        email: "",
        phoneNumber: "",
        qualification: "not_assessed",
        coverLetter: "",
        appliedAt: "",
        vacancy: undefined,
        resume: undefined,
      });
      editor?.commands.setContent("");
      fetchApplications();
    } catch (err) {
      console.error("Failed to add application", err);
      alert("❌ Failed to add application. Please try again.");
    }
  };
  const updateApplication = async (id: number) => {
    if (!validateApplication(editData)) {
      alert(
        "❌ Please fill all required fields correctly (valid email required)."
      );
      return;
    }

    try {
      const currentTimestamp = new Date().toISOString();
      const payload = {
        ...editData,
        appliedAt: currentTimestamp,
        vacancy: (editData.vacancy as Vacancy).id,
        vacancyTitle: (editData.vacancy as Vacancy).title,
        resume: (editData.resume as { id: number }).id,
      };

      await axiosInstance.put(`/applications/${id}`, { data: payload });
      alert("✅ Application updated successfully!");
      setEditingId(null);
      setEditData({});
      editEditor?.commands.setContent("");
      fetchApplications();
    } catch (err) {
      console.error("Failed to update application", err);
      alert("❌ Failed to update application. Please try again.");
    }
  };

  const deleteApplication = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this application?"))
      return;
    try {
      await axiosInstance.delete(`/applications/${id}`);
      alert("✅ Application deleted successfully!");
      fetchApplications();
    } catch (err) {
      console.error("Failed to delete application", err);
      alert("❌ Failed to delete application. Please try again.");
    }
  };

  const renderInputClass = (value?: string) =>
    value && value.trim().length > 0
      ? "small-input"
      : "small-input input-error";

  return (
    <div className="events-container">
      <h2 className="events-heading">Applications Management</h2>

      <div className="events-controls">
        <input
          type="text"
          className="search-input"
          placeholder="Search applications..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="add-btn" onClick={() => setAddingNew(true)}>
          Add Application
        </button>
      </div>

      {addingNew && (
        <div className="form-card">
          <h3 className="form-title">Add Application</h3>
          <div className="form-grid">
            <div>
              <label>
                Name <span className="required-star">*</span>
              </label>
              <input
                type="text"
                value={newData.name || ""}
                onChange={(e) => handleInput("name", e.target.value)}
                className={renderInputClass(newData.name)}
              />
            </div>
            <div>
              <label>
                Email <span className="required-star">*</span>
              </label>
              <input
                type="email"
                value={newData.email || ""}
                onChange={(e) => handleInput("email", e.target.value)}
                className={renderInputClass(newData.email)}
              />
            </div>
            <div>
              <label>
                Phone Number <span className="required-star">*</span>
              </label>
              <input
                type="text"
                value={newData.phoneNumber || ""}
                onChange={(e) => handleInput("phoneNumber", e.target.value)}
                className={renderInputClass(newData.phoneNumber)}
              />
            </div>
            <div>
              <label>Qualification</label>
              <select
                value={newData.qualification || "not_assessed"}
                onChange={(e) => handleInput("qualification", e.target.value)}
                className="small-input"
              >
                <option value="not_assessed">Not Assessed</option>
                <option value="fail">Fail</option>
                <option value="pass">Pass</option>
                <option value="reserve">Reserve</option>
              </select>
            </div>
            <div>
              <label>
                Vacancy <span className="required-star">*</span>
              </label>
              <select
                value={newData.vacancy?.id || ""}
                onChange={(e) =>
                  handleInput(
                    "vacancy",
                    vacancies.find((v) => v.id === Number(e.target.value))
                  )
                }
                className={renderInputClass(newData.vacancy?.id?.toString())}
              >
                <option value="">Select vacancy</option>
                {vacancies
                  .sort((a, b) => a.title.localeCompare(b.title))
                  .map((vacancy) => (
                    <option key={vacancy.id} value={vacancy.id}>
                      {vacancy.title}
                    </option>
                  ))}
              </select>
            </div>
            <div>
              <label>
                Resume Upload <span className="required-star">*</span>
              </label>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => handleFileChange(e)}
              />
              {newData.resume && (
                <p>
                  Uploaded: <em>{newData.resume.name}</em>
                </p>
              )}
            </div>
            <div className="full-width">
              <label>Cover Letter</label>
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
                <EditorContent editor={editor} />
              </div>
            </div>
          </div>
          <div className="form-actions">
            <button className="save-btn" onClick={addApplication}>
              Save
            </button>
            <button className="cancel-btn" onClick={() => setAddingNew(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="events-card-container">
        {applications
          .filter((app) => {
            const term = searchTerm.toLowerCase();
            const name = (app.name ?? "").toLowerCase();
            const email = (app.email ?? "").toLowerCase();
            const vacancyTitle = (
              app.vacancy?.title ||
              app.vacancyTitle ||
              "N/A"
            ).toLowerCase();

            return (
              name.includes(term) ||
              email.includes(term) ||
              vacancyTitle.includes(term)
            );
          })

          .map((app) => (
            <div className="event-card" key={app.id}>
              <p>
                <strong>Name:</strong> {app.name}
              </p>
              <p>
                <strong>Email:</strong> {app.email}
              </p>
              <p>
                <strong>Phone Number:</strong> {app.phoneNumber}
              </p>
              <p>
                <strong>Qualification:</strong>{" "}
                {app.qualification === "not_assessed"
                  ? "Not Assessed"
                  : app.qualification?.toUpperCase() || "N/A"}
              </p>
              <p>
                <strong>Vacancy:</strong>{" "}
                {app.vacancy?.title || app.vacancyTitle || "N/A"}
              </p>
              <p>
                <strong>Applied At:</strong>{" "}
                {formatDateAddisAbaba(app.appliedAt)}
              </p>
              <p>
                <strong>Vacancy Status:</strong>
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
              </p>
              {app.resume && (
                <p>
                  <strong>Resume:</strong>{" "}
                  <a
                    href={getFullStrapiURL(app.resume.url)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {app.resume.name}
                  </a>
                </p>
              )}
              <label>Cover Letter:</label>
              <div
                className="event-description"
                dangerouslySetInnerHTML={{ __html: app.coverLetter || "" }}
              />
              <div className="event-actions">
                <button
                  className="edit-btn"
                  onClick={() => {
                    setEditingId(app.id);
                    setEditData({ ...app });
                    editEditor?.commands.setContent(app.coverLetter || "");
                  }}
                >
                  Edit
                </button>
                <button
                  className="delete-btn"
                  onClick={() => deleteApplication(app.id)}
                >
                  Delete
                </button>
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
            <h3>Edit Application</h3>
            <div className="form-grid">
              <div>
                <label>
                  Name <span className="required-star">*</span>
                </label>
                <input
                  type="text"
                  value={editData.name || ""}
                  onChange={(e) => handleInput("name", e.target.value, true)}
                  className={renderInputClass(editData.name)}
                />
              </div>
              <div>
                <label>
                  Email <span className="required-star">*</span>
                </label>
                <input
                  type="email"
                  value={editData.email || ""}
                  onChange={(e) => handleInput("email", e.target.value, true)}
                  className={renderInputClass(editData.email)}
                />
              </div>
              <div>
                <label>
                  Phone Number <span className="required-star">*</span>
                </label>
                <input
                  type="text"
                  value={editData.phoneNumber || ""}
                  onChange={(e) =>
                    handleInput("phoneNumber", e.target.value, true)
                  }
                  className={renderInputClass(editData.phoneNumber)}
                />
              </div>
              <div>
                <label>Qualification</label>
                <select
                  value={editData.qualification || "not_assessed"}
                  onChange={(e) =>
                    handleInput("qualification", e.target.value, true)
                  }
                  className="small-input"
                >
                  <option value="not_assessed">Not Assessed</option>
                  <option value="fail">Fail</option>
                  <option value="pass">Pass</option>
                  <option value="reserve">Reserve</option>
                </select>
              </div>
              <div>
                <label>
                  Vacancy <span className="required-star">*</span>
                </label>
                <select
                  value={editData.vacancy?.id || ""}
                  onChange={(e) =>
                    handleInput(
                      "vacancy",
                      vacancies.find((v) => v.id === Number(e.target.value)),
                      true
                    )
                  }
                  className={renderInputClass(editData.vacancy?.id?.toString())}
                >
                  <option value="">Select vacancy</option>
                  {vacancies
                    .sort((a, b) => a.title.localeCompare(b.title))
                    .map((vacancy) => (
                      <option key={vacancy.id} value={vacancy.id}>
                        {vacancy.title}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label>
                  Resume Upload <span className="required-star">*</span>
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => handleFileChange(e, true)}
                />
                {editData.resume && (
                  <p>
                    Uploaded: <em>{editData.resume.name}</em>
                  </p>
                )}
              </div>
              <div className="full-width">
                <label>Cover Letter</label>
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
                onClick={() => updateApplication(editingId)}
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
      <AppDetail />
    </div>
  );
};

export default ApplicationsAdmin;
