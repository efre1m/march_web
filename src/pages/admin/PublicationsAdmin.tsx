import type { FC } from "react";
import { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";
import "./EventsAdmin.css";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

interface Publication {
  id: number;
  title: string;
  authors: string;
  journal: string;
  link: string;
  abstract?: string;
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
  year: string;
}

const PublicationsAdmin: FC = () => {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [addingNew, setAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const baseUrl = import.meta.env.VITE_BACKEND_URL as string;

  const [newData, setNewData] = useState<Partial<Publication>>({
    title: "",
    authors: "",
    journal: "",
    link: "",
    abstract: "",
    year: "",
  });
  const [editData, setEditData] = useState<Partial<Publication>>({});

  const [newErrors, setNewErrors] = useState<{ [key: string]: string }>({});
  const [editErrors, setEditErrors] = useState<{ [key: string]: string }>({});

  const editor = useEditor({
    extensions: [StarterKit],
    content: newData.abstract || "",
    onUpdate: ({ editor }) =>
      handleNewInputChange("abstract", editor.getHTML()),
  });

  const editEditor = useEditor({
    extensions: [StarterKit],
    content: editData.abstract || "",
    onUpdate: ({ editor }) =>
      handleEditInputChange("abstract", editor.getHTML()),
  });

  const validatePublication = (data: Partial<Publication>) => {
    const errors: { [key: string]: string } = {};
    if (!data.title?.trim()) errors.title = "Title is required.";
    if (!data.authors?.trim()) errors.authors = "Authors are required.";
    if (!data.journal?.trim()) errors.journal = "Journal is required.";
    if (!data.link?.trim()) {
      errors.link = "Link is required.";
    } else {
      try {
        new URL(data.link);
      } catch {
        errors.link = "Link must be a valid URL.";
      }
    }
    if (!data.year?.trim()) errors.year = "Year is required.";
    return errors;
  };

  const fetchPublications = async () => {
    try {
      const res = await axiosInstance.get("/publications?populate=image");
      setPublications(res.data.data);
    } catch (err) {
      console.error("Failed to fetch publications", err);
    }
  };

  useEffect(() => {
    fetchPublications();
  }, []);

  const handleNewInputChange = (field: keyof Publication, value: string) => {
    const updated = { ...newData, [field]: value };
    setNewData(updated);
    setNewErrors(validatePublication(updated));
  };

  const handleEditInputChange = (field: keyof Publication, value: string) => {
    const updated = { ...editData, [field]: value };
    setEditData(updated);
    setEditErrors(validatePublication(updated));
  };

  const uploadImage = async (file: File): Promise<number | null> => {
    const formData = new FormData();
    formData.append("files", file);
    try {
      const { data } = await axiosInstance.post("/upload", formData);
      return data[0]?.id ?? null;
    } catch (err) {
      console.error("Failed to upload image", err);
      return null;
    }
  };

  const addPublication = async () => {
    const errors = validatePublication(newData);
    setNewErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      const imageId = newImageFile ? await uploadImage(newImageFile) : null;
      await axiosInstance.post("/publications", {
        data: { ...newData, image: imageId },
      });
      setNewData({
        title: "",
        authors: "",
        journal: "",
        link: "",
        abstract: "",
        year: "",
      });
      setNewImageFile(null);
      setAddingNew(false);
      fetchPublications();
      alert("Publication added successfully!");
    } catch (err) {
      console.error("Failed to add publication", err);
      alert("Failed to add publication");
    }
  };

  const saveEdit = async (id: number) => {
    const errors = validatePublication(editData);
    setEditErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      const imageId = editImageFile
        ? await uploadImage(editImageFile)
        : editData.image?.id ?? null;

      const updateData = {
        title: editData.title,
        authors: editData.authors,
        journal: editData.journal,
        link: editData.link,
        abstract: editData.abstract,
        year: editData.year,
        image: imageId,
      };

      await axiosInstance.put(`/publications/${id}`, { data: updateData });
      setEditingId(null);
      setEditData({});
      setEditImageFile(null);
      fetchPublications();
      alert("Publication updated successfully!");
    } catch (err) {
      console.error("Failed to update publication", err);
      alert("Failed to update publication");
    }
  };

  const deletePublication = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this publication?"))
      return;
    try {
      await axiosInstance.delete(`/publications/${id}`);
      fetchPublications();
      alert("Publication deleted successfully!");
    } catch (err) {
      console.error("Failed to delete publication", err);
      alert("Failed to delete publication");
    }
  };

  const handleNewImageChange = ({ target }: any) => {
    if (target.files?.[0]) setNewImageFile(target.files[0]);
  };

  const handleEditImageChange = ({ target }: any) => {
    if (target.files?.[0]) setEditImageFile(target.files[0]);
  };

  return (
    <div className="events-container">
      <h2 className="events-heading">Publications Management</h2>

      <div className="events-controls">
        <input
          type="text"
          className="search-input"
          placeholder="Search publications..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="add-btn" onClick={() => setAddingNew(true)}>
          Add Publication
        </button>
      </div>

      {addingNew && (
        <div className="form-card">
          <h3 className="form-title">Add Publication</h3>
          <div className="form-grid">
            {["title", "authors", "journal", "link", "year"].map((field) => (
              <div key={field}>
                <label>{field[0].toUpperCase() + field.slice(1)} *</label>
                <input
                  type="text"
                  value={(newData as any)[field] || ""}
                  onChange={(e) =>
                    handleNewInputChange(field as any, e.target.value)
                  }
                  className="small-input"
                />
                {newErrors[field] && (
                  <div className="error-text">{newErrors[field]}</div>
                )}
              </div>
            ))}
            <div>
              <label>Abstract</label>
              <div className="editor-wrapper">
                <EditorContent editor={editor} />
              </div>
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
            <button className="save-btn" onClick={addPublication}>
              Save
            </button>
            <button className="cancel-btn" onClick={() => setAddingNew(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="events-card-container">
        {publications
          .filter((p) => {
            const term = searchTerm.toLowerCase();
            return (
              p.title.toLowerCase().includes(term) ||
              p.authors.toLowerCase().includes(term) ||
              p.journal.toLowerCase().includes(term) ||
              p.year.toLowerCase().includes(term) ||
              p.link.toLowerCase().includes(term)
            );
          })
          .map((p) => (
            <div className="event-card" key={p.id}>
              {p.image ? (
                <img
                  src={`${baseUrl}${
                    p.image.formats?.large?.url ||
                    p.image.formats?.medium?.url ||
                    p.image.formats?.small?.url ||
                    p.image.url
                  }`}
                  className="event-image"
                  alt={p.title}
                />
              ) : (
                <div className="no-image">No Image</div>
              )}
              <div className="event-content">
                <label>Title:</label>
                <h3 className="event-title">{p.title}</h3>

                <label>Authors:</label>
                <p>{p.authors}</p>

                <label>Journal:</label>
                <p>{p.journal}</p>

                <label>Year:</label>
                <p>{p.year}</p>

                <label>Link:</label>
                <p>
                  <a href={p.link} target="_blank" rel="noopener noreferrer">
                    {p.link}
                  </a>
                </p>

                <label>Abstract:</label>
                <div
                  className="event-description"
                  dangerouslySetInnerHTML={{ __html: p.abstract || "" }}
                />

                <div className="event-actions">
                  <button
                    className="edit-btn"
                    onClick={() => {
                      setEditingId(p.id);
                      setEditData({ ...p });
                      setEditImageFile(null);
                      editEditor?.commands.setContent(p.abstract || "");
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => deletePublication(p.id)}
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
            <h3>Edit Publication</h3>
            <div
              className="form-grid"
              style={{ maxHeight: "70vh", overflowY: "auto" }}
            >
              {["title", "authors", "journal", "link", "year"].map((field) => (
                <div key={field}>
                  <label>{field[0].toUpperCase() + field.slice(1)} *</label>
                  <input
                    type="text"
                    value={(editData as any)[field] || ""}
                    onChange={(e) =>
                      handleEditInputChange(field as any, e.target.value)
                    }
                    className="small-input"
                  />
                  {editErrors[field] && (
                    <div className="error-text">{editErrors[field]}</div>
                  )}
                </div>
              ))}
              <div>
                <label>Abstract</label>
                <div className="editor-wrapper" style={{ minHeight: "150px" }}>
                  <EditorContent editor={editEditor} />
                </div>
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

export default PublicationsAdmin;
