import type { FC } from "react";
import { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";
import "./EventsAdmin.css"; // reuse your admin styles

interface Impact {
  id: number;
  value: string;
  title: string;
  description?: string;
}

const ImpactsAdmin: FC = () => {
  const [impacts, setImpacts] = useState<Impact[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [addingNew, setAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [newData, setNewData] = useState<Partial<Impact>>({
    value: "",
    title: "",
    description: "",
  });

  const [editData, setEditData] = useState<Partial<Impact>>({});

  // Fetch all impacts
  const fetchImpacts = async () => {
    try {
      const res = await axiosInstance.get("/impacts");
      // ✅ Strapi v5 returns flat objects
      const mapped = res.data.map((item: any) => ({
        id: item.id,
        title: item.title,
        value: item.value,
        description: item.description,
      }));
      setImpacts(mapped);
    } catch (err) {
      console.error("Failed to fetch impacts", err);
    }
  };

  useEffect(() => {
    fetchImpacts();
  }, []);

  const handleInput = (
    field: keyof Impact,
    value: string,
    isEdit = false
  ) => {
    if (isEdit) {
      setEditData((prev) => ({ ...prev, [field]: value }));
    } else {
      setNewData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const validateImpact = (data: Partial<Impact>) => {
    return !!data.value && !!data.title;
  };

  const addImpact = async () => {
    if (!validateImpact(newData)) {
      alert("❌ Please fill value and title.");
      return;
    }
    try {
      await axiosInstance.post("/impacts", { data: newData });
      alert("✅ Impact added successfully!");
      setAddingNew(false);
      setNewData({ value: "", title: "", description: "" });
      fetchImpacts(); // refresh list
    } catch (err) {
      console.error("Failed to add impact", err);
      alert("❌ Failed to add impact.");
    }
  };

  const updateImpact = async (id: number) => {
    if (!validateImpact(editData)) {
      alert("❌ Please fill value and title.");
      return;
    }
    try {
      await axiosInstance.put(`/impacts/${id}`, { data: editData });
      alert("✅ Impact updated successfully!");
      setEditingId(null);
      setEditData({});
      fetchImpacts(); // refresh list
    } catch (err) {
      console.error("Failed to update impact", err);
      alert("❌ Failed to update impact.");
    }
  };

  const deleteImpact = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this impact?")) return;
    try {
      await axiosInstance.delete(`/impacts/${id}`);
      alert("✅ Impact deleted successfully!");
      fetchImpacts(); // refresh list
    } catch (err) {
      console.error("Failed to delete impact", err);
      alert("❌ Failed to delete impact.");
    }
  };

  const renderInputClass = (value?: string) =>
    value && value.trim().length > 0
      ? "small-input"
      : "small-input input-error";

  return (
    <div className="events-container">
      <h2 className="events-heading">Impacts Management</h2>

      <div className="events-controls">
        <input
          type="text"
          className="search-input"
          placeholder="Search impacts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="add-btn" onClick={() => setAddingNew(true)}>
          Add Impact
        </button>
      </div>

      {/* Add Form */}
      {addingNew && (
        <div className="form-card">
          <h3 className="form-title">Add Impact</h3>
          <div className="form-grid">
            <div>
              <label>
                Value <span className="required-star">*</span>
              </label>
              <input
                type="text"
                value={newData.value || ""}
                onChange={(e) => handleInput("value", e.target.value)}
                className={renderInputClass(newData.value)}
              />
            </div>
            <div>
              <label>
                Title <span className="required-star">*</span>
              </label>
              <input
                type="text"
                value={newData.title || ""}
                onChange={(e) => handleInput("title", e.target.value)}
                className={renderInputClass(newData.title)}
              />
            </div>
            <div className="full-width">
              <label>Description</label>
              <textarea
                value={newData.description || ""}
                onChange={(e) => handleInput("description", e.target.value)}
                className="small-input"
              />
            </div>
          </div>
          <div className="form-actions">
            <button className="save-btn" onClick={addImpact}>
              Save
            </button>
            <button
              className="cancel-btn"
              onClick={() => setAddingNew(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* List Impacts */}
      <div className="events-card-container">
        {impacts
          .filter((imp) => {
            const term = searchTerm.toLowerCase();
            return (
              imp.value.toLowerCase().includes(term) ||
              imp.title.toLowerCase().includes(term) ||
              (imp.description ?? "").toLowerCase().includes(term)
            );
          })
          .map((imp) => (
            <div className="event-card" key={imp.id}>
              <p>
                <strong>Value:</strong> {imp.value}
              </p>
              <p>
                <strong>Title:</strong> {imp.title}
              </p>
              <p>
                <strong>Description:</strong> {imp.description}
              </p>
              <div className="event-actions">
                <button
                  className="edit-btn"
                  onClick={() => {
                    setEditingId(imp.id);
                    setEditData({ ...imp });
                  }}
                >
                  Edit
                </button>
                <button
                  className="delete-btn"
                  onClick={() => deleteImpact(imp.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
      </div>

      {/* Edit Modal */}
      {editingId && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Edit Impact</h3>
            <div className="form-grid">
              <div>
                <label>
                  Value <span className="required-star">*</span>
                </label>
                <input
                  type="text"
                  value={editData.value || ""}
                  onChange={(e) => handleInput("value", e.target.value, true)}
                  className={renderInputClass(editData.value)}
                />
              </div>
              <div>
                <label>
                  Title <span className="required-star">*</span>
                </label>
                <input
                  type="text"
                  value={editData.title || ""}
                  onChange={(e) => handleInput("title", e.target.value, true)}
                  className={renderInputClass(editData.title)}
                />
              </div>
              <div className="full-width">
                <label>Description</label>
                <textarea
                  value={editData.description || ""}
                  onChange={(e) =>
                    handleInput("description", e.target.value, true)
                  }
                  className="small-input"
                />
              </div>
            </div>
            <div className="form-actions">
              <button
                className="save-btn"
                onClick={() => updateImpact(editingId)}
              >
                Save
              </button>
              <button
                className="cancel-btn"
                onClick={() => {
                  setEditingId(null);
                  setEditData({});
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

export default ImpactsAdmin;
