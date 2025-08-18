// ProjectsAdmin.tsx
import type { FC, ChangeEvent } from "react";
import { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";
import "./EventsAdmin.css";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import "../Projects.css";

interface Project {
  id: number;
  title: string;
  summary: string;
  description: string;
  projectStatus: string;
  startDate?: string;
  endDate?: string;
  image?: {
    id: number;
    url: string;
    formats?: {
      thumbnail?: { url: string };
      small?: { url: string };
      medium?: { url: string };
      large?: { url: string };
    };
  } | null;
}

const ProjectsAdmin: FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [addingNew, setAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const baseUrl = import.meta.env.VITE_BACKEND_URL as string;
  const [newData, setNewData] = useState<Partial<Project>>({
    title: "",
    summary: "",
    description: "",
    projectStatus: "ongoing",
    startDate: "",
    endDate: "",
  });
  const [editData, setEditData] = useState<Partial<Project>>({});

  const [newErrors, setNewErrors] = useState<{ [key: string]: string }>({});
  const [editErrors, setEditErrors] = useState<{ [key: string]: string }>({});

  const editor = useEditor({
    extensions: [StarterKit],
    content: newData.description || "",
    onUpdate({ editor }) {
      handleNewInputChange("description", editor.getHTML());
    },
  });

  const editEditor = useEditor({
    extensions: [StarterKit],
    content: editData.description || "",
    onUpdate({ editor }) {
      handleEditInputChange("description", editor.getHTML());
    },
  });

  const validateProject = (data: Partial<Project>) => {
    const errors: { [key: string]: string } = {};

    if (!data.title?.trim()) errors.title = "Title is required.";
    if (!data.summary?.trim()) errors.summary = "Summary is required.";
    if (!data.description?.trim())
      errors.description = "Description is required.";
    if (!data.startDate) errors.startDate = "Start date is required.";

    if (data.endDate) {
      if (new Date(data.endDate) < new Date(data.startDate || "")) {
        errors.endDate = "End date must be after start date.";
      }
    }

    return errors;
  };

  const fetchProjects = async () => {
    try {
      const res = await axiosInstance.get("/projects?populate=image");
      setProjects(res.data.data);
    } catch (err) {
      console.error("Failed to fetch projects", err);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleNewInputChange = (field: keyof Project, value: string) => {
    const updated = { ...newData, [field]: value };
    if (field === "endDate") {
      updated.projectStatus = value?.trim() ? "completed" : "ongoing";
    }
    setNewData(updated);
    setNewErrors(validateProject(updated));
  };

  const handleEditInputChange = (field: keyof Project, value: string) => {
    const updated = { ...editData, [field]: value };
    if (field === "endDate") {
      updated.projectStatus = value?.trim() ? "completed" : "ongoing";
    }
    setEditData(updated);
    setEditErrors(validateProject(updated));
  };

  const uploadImage = async (file: File) => {
    const formData = new FormData();
    formData.append("files", file);
    try {
      const res = await axiosInstance.post("/upload", formData);
      return res.data[0].id;
    } catch (err) {
      console.error("Failed to upload image", err);
      return null;
    }
  };

  const addProject = async () => {
    const errors = validateProject(newData);
    setNewErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      let imageId = null;
      if (newImageFile) imageId = await uploadImage(newImageFile);
      const status =
        newData.endDate && new Date(newData.endDate) < new Date()
          ? "completed"
          : "ongoing";
      await axiosInstance.post("/projects", {
        data: {
          ...newData,
          projectStatus: status,
          image: imageId || null,
        },
      });

      setNewData({
        title: "",
        summary: "",
        description: "",
        startDate: "",
        endDate: "",
        projectStatus: "ongoing",
      });
      setNewImageFile(null);
      setAddingNew(false);
      fetchProjects();
      alert("Project added successfully!");
    } catch (err) {
      console.error("Failed to add project", err);
      alert("Failed to add project");
    }
  };

  const saveEdit = async (id: number) => {
    const errors = validateProject(editData);
    setEditErrors(errors);
    if (Object.keys(errors).length > 0) return;

    // Validate date logic
    if (
      editData.startDate &&
      editData.endDate &&
      new Date(editData.endDate) <= new Date(editData.startDate)
    ) {
      setEditErrors({
        ...errors,
        endDate: "End date must be after start date.",
      });
      return;
    }

    // Auto status logic
    const status =
      editData.endDate && new Date(editData.endDate) < new Date()
        ? "completed"
        : "ongoing";

    try {
      let imageId = null;
      if (editImageFile) imageId = await uploadImage(editImageFile);
      else if (editData.image?.id) imageId = editData.image.id;

      const updateData: any = {
        title: editData.title,
        summary: editData.summary,
        description: editData.description,
        startDate: editData.startDate || null,
        endDate: editData.endDate || null,
        projectStatus: status,
      };
      if (imageId !== null) updateData.image = imageId;

      await axiosInstance.put(`/projects/${id}`, { data: updateData });

      setEditingId(null);
      setEditData({});
      setEditImageFile(null);
      fetchProjects();
      alert("Project updated successfully!");
    } catch (err) {
      console.error("Failed to update project", err);
      alert("Failed to update project");
    }
  };

  const deleteProject = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      try {
        await axiosInstance.delete(`/projects/${id}`);
        fetchProjects();
        alert("Project deleted successfully!");
      } catch (err) {
        console.error("Failed to delete project", err);
        alert("Failed to delete project");
      }
    }
  };

  const handleNewImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewImageFile(e.target.files[0]);
    }
  };

  const handleEditImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setEditImageFile(e.target.files[0]);
    }
  };

  return (
    <div className="events-container">
      <h2 className="events-heading">Projects Management</h2>

      <div className="events-controls">
        <input
          type="text"
          className="search-input"
          placeholder="Search projects..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="add-btn" onClick={() => setAddingNew(true)}>
          Add Project
        </button>
      </div>

      {addingNew && (
        <div className="form-card">
          <h3 className="form-title">Add Project</h3>
          <div className="form-grid">
            <div>
              <label>Title *</label>
              <input
                type="text"
                value={newData.title || ""}
                onChange={(e) => handleNewInputChange("title", e.target.value)}
                className="small-input"
              />
              {newErrors.title && (
                <div className="error-text">{newErrors.title}</div>
              )}
            </div>
            <div>
              <label>Summary *</label>
              <input
                type="text"
                value={newData.summary || ""}
                onChange={(e) =>
                  handleNewInputChange("summary", e.target.value)
                }
                className="small-input"
              />
              {newErrors.summary && (
                <div className="error-text">{newErrors.summary}</div>
              )}
            </div>
            <div>
              <label>Description *</label>
              <div
                className={`editor-wrapper ${
                  newErrors.description ? "error" : ""
                }`}
              >
                <EditorContent editor={editor} />
              </div>
              {newErrors.description && (
                <div className="error-text">{newErrors.description}</div>
              )}
            </div>
            <div>
              <label>Start Date *</label>
              <input
                type="date"
                value={newData.startDate || ""}
                onChange={(e) =>
                  handleNewInputChange("startDate", e.target.value)
                }
                className="small-input"
              />
              {newErrors.startDate && (
                <div className="error-text">{newErrors.startDate}</div>
              )}
            </div>
            <div>
              <label>End Date</label>
              <input
                type="date"
                value={newData.endDate || ""}
                onChange={(e) =>
                  handleNewInputChange("endDate", e.target.value)
                }
                className="small-input"
              />
              {newErrors.endDate && (
                <div className="error-text">{newErrors.endDate}</div>
              )}
            </div>
            <div>
              <label>Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleNewImageChange}
              />
            </div>
          </div>
          <div className="form-actions">
            <button className="save-btn" onClick={addProject}>
              Save
            </button>
            <button className="cancel-btn" onClick={() => setAddingNew(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="projects-card-container">
        {projects
          .filter((p) =>
            p.title.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .map((p) => (
            <div className="project-card" key={p.id}>
              {p.image ? (
                <img
                  src={`${baseUrl}${
                    p.image.formats?.large?.url ||
                    p.image.formats?.medium?.url ||
                    p.image.formats?.small?.url ||
                    p.image.url
                  }`}
                />
              ) : (
                <div className="no-image">No Image</div>
              )}
              <div className="event-content">
                <label>Title:</label>
                <h3 className="event-title">{p.title}</h3>
                <label>Status:</label>
                <p className={`status-badge ${p.projectStatus}`}>
                  {p.projectStatus}
                </p>
                <label>Description:</label>
                <div
                  className="event-description"
                  dangerouslySetInnerHTML={{ __html: p.description || "" }}
                ></div>
                <div className="event-actions">
                  <button
                    className="edit-btn"
                    onClick={() => {
                      setEditingId(p.id);
                      setEditData({ ...p });
                      setEditImageFile(null);
                      editEditor?.commands.setContent(p.description || "");
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => deleteProject(p.id)}
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
          <div className="modal">
            <h3>Edit Project</h3>
            <div className="form-grid">
              <div>
                <label>Title *</label>
                <input
                  type="text"
                  value={editData.title || ""}
                  onChange={(e) =>
                    handleEditInputChange("title", e.target.value)
                  }
                  className="small-input"
                />
                {editErrors.title && (
                  <div className="error-text">{editErrors.title}</div>
                )}
              </div>
              <div>
                <label>Summary *</label>
                <input
                  type="text"
                  value={editData.summary || ""}
                  onChange={(e) =>
                    handleEditInputChange("summary", e.target.value)
                  }
                  className="small-input"
                />
                {editErrors.summary && (
                  <div className="error-text">{editErrors.summary}</div>
                )}
              </div>
              <div>
                <label>Description *</label>
                <div
                  className={`editor-wrapper ${
                    editErrors.description ? "error" : ""
                  }`}
                >
                  <EditorContent editor={editEditor} />
                </div>
                {editErrors.description && (
                  <div className="error-text">{editErrors.description}</div>
                )}
              </div>
              <div>
                <label>Start Date *</label>
                <input
                  type="date"
                  value={editData.startDate || ""}
                  onChange={(e) =>
                    handleEditInputChange("startDate", e.target.value)
                  }
                />
                {editErrors.startDate && (
                  <div className="error-text">{editErrors.startDate}</div>
                )}
              </div>

              <div>
                <label>End Date</label>
                <input
                  type="date"
                  value={editData.endDate || ""}
                  onChange={(e) =>
                    handleEditInputChange("endDate", e.target.value)
                  }
                />
                {editErrors.endDate && (
                  <div className="error-text">{editErrors.endDate}</div>
                )}
              </div>
              <div>
                <label>Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleEditImageChange}
                />
              </div>
            </div>
            <div className="form-actions">
              <button
                className="save-btn"
                onClick={() => editingId && saveEdit(editingId)}
              >
                Save
              </button>
              <button
                className="cancel-btn"
                onClick={() => {
                  setEditingId(null);
                  setEditData({});
                  setEditErrors({});
                  setEditImageFile(null);
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

export default ProjectsAdmin;
