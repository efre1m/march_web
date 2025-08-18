// TeamMembers.tsx
import type { ChangeEvent, FC } from "react";
import { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";
import "./TeamMembers.css";

interface TeamMember {
  id: number;
  Name: string;
  Position: string;
  Email: string;
  bio?: string;
  quote?: string;
  Image?: {
    id?: number;
    url?: string;
    formats?: {
      thumbnail?: {
        url?: string;
      };
    };
  };
}

const TeamMembers: FC = () => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [addingNew, setAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const baseUrl = import.meta.env.VITE_BACKEND_URL as string;

  const [newMemberData, setNewMemberData] = useState<Partial<TeamMember>>({
    Name: "",
    Position: "",
    Email: "",
    bio: "",
  });
  const [newMemberErrors, setNewMemberErrors] = useState<{
    [key: string]: string;
  }>({});
  const [newImageFile, setNewImageFile] = useState<File | null>(null);

  const [editFormData, setEditFormData] = useState<Partial<TeamMember>>({});
  const [editErrors, setEditErrors] = useState<{ [key: string]: string }>({});
  const [editImageFile, setEditImageFile] = useState<File | null>(null);

  const fetchMembers = async () => {
    try {
      const res = await axiosInstance.get("/team-members?populate=Image");
      setMembers(res.data.data);
    } catch (err) {
      console.error("Error fetching members:", err);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validateMember = (data: Partial<TeamMember>) => {
    const errors: { [key: string]: string } = {};
    if (!data.Name?.trim()) errors.Name = "Name is required.";
    if (!data.Position?.trim()) errors.Position = "Position is required.";
    if (!data.Email?.trim()) {
      errors.Email = "Email is required.";
    } else if (!isValidEmail(data.Email.trim())) {
      errors.Email = "Invalid email format.";
    }
    return errors;
  };

  const handleNewInputChange = (field: keyof TeamMember, value: string) => {
    const updatedData = { ...newMemberData, [field]: value };
    setNewMemberData(updatedData);
    setNewMemberErrors(validateMember(updatedData));
  };

  const handleEditInputChange = (field: keyof TeamMember, value: string) => {
    const updatedData = { ...editFormData, [field]: value };
    setEditFormData(updatedData);
    setEditErrors(validateMember(updatedData));
  };

  const uploadImage = async (file: File) => {
    const formData = new FormData();
    formData.append("files", file);
    try {
      const uploadResponse = await axiosInstance.post("/upload", formData);
      return uploadResponse.data[0].id;
    } catch (err) {
      console.error("Error uploading image:", err);
      return null;
    }
  };

  const addNewMember = async () => {
    const errors = validateMember(newMemberData);
    setNewMemberErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      let imageId = null;
      if (newImageFile) {
        imageId = await uploadImage(newImageFile);
      }

      await axiosInstance.post("/team-members", {
        data: {
          Name: newMemberData.Name,
          Position: newMemberData.Position,
          Email: newMemberData.Email,
          bio: newMemberData.bio || "",
          quote: newMemberData.quote || "",
          Image: imageId || null,
        },
      });

      setNewMemberData({ Name: "", Position: "", Email: "", bio: "" });
      setNewImageFile(null);
      setAddingNew(false);
      fetchMembers();
      alert("New team member added successfully!");
    } catch (err) {
      console.error("Failed to add member", err);
      alert("Failed to add new member");
    }
  };

  const saveEdit = async (id: number) => {
    const errors = validateMember(editFormData);
    setEditErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      let imageId = null;
      if (editImageFile) {
        imageId = await uploadImage(editImageFile);
      } else if (editFormData.Image?.id) {
        imageId = editFormData.Image.id;
      }

      const updateData: any = {
        Name: editFormData.Name,
        Position: editFormData.Position,
        Email: editFormData.Email,
        quote: editFormData.quote || "",
        bio: editFormData.bio || "",
      };
      if (imageId !== null) updateData.Image = imageId;

      await axiosInstance.put(`/team-members/${id}`, { data: updateData });

      setEditingId(null);
      setEditImageFile(null);
      setEditFormData({});
      setEditErrors({});
      fetchMembers();
      alert("Team member updated successfully!");
    } catch (err) {
      console.error("Failed to update member", err);
      alert("Failed to update member");
    }
  };

  const deleteMember = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this member?")) {
      try {
        await axiosInstance.delete(`/team-members/${id}`);
        fetchMembers();
        alert("Team member deleted successfully!");
      } catch (err) {
        console.error("Failed to delete member", err);
        alert("Failed to delete member");
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
    <div className="team-container">
      <h2 className="team-heading">Team Members</h2>

      <div className="team-controls">
        <input
          type="text"
          placeholder="Search members..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          aria-label="Search team members"
        />
        <button className="add-btn" onClick={() => setAddingNew(true)}>
          Add New Member
        </button>
      </div>

      {addingNew && (
        <div className="form-card">
          <h3 className="form-title">Add New Team Member</h3>
          <div className="form-grid">
            <input
              type="text"
              placeholder="Name *"
              value={newMemberData.Name}
              onChange={(e) => handleNewInputChange("Name", e.target.value)}
            />
            {newMemberErrors.Name && (
              <div className="error-text">{newMemberErrors.Name}</div>
            )}

            <input
              type="text"
              placeholder="Position *"
              value={newMemberData.Position}
              onChange={(e) => handleNewInputChange("Position", e.target.value)}
            />
            {newMemberErrors.Position && (
              <div className="error-text">{newMemberErrors.Position}</div>
            )}

            <input
              type="email"
              placeholder="Email *"
              value={newMemberData.Email}
              onChange={(e) => handleNewInputChange("Email", e.target.value)}
            />
            {newMemberErrors.Email && (
              <div className="error-text">{newMemberErrors.Email}</div>
            )}
            <label>Quote</label>
            <textarea
              placeholder="Enter quote"
              value={newMemberData.quote || ""}
              onChange={(e) => handleNewInputChange("quote", e.target.value)}
              rows={2}
            />
            <textarea
              placeholder="Bio"
              value={newMemberData.bio || ""}
              onChange={(e) => handleNewInputChange("bio", e.target.value)}
              rows={3}
            />

            <input
              type="file"
              accept="image/*"
              onChange={handleNewImageChange}
            />
          </div>

          <div className="form-actions">
            <button
              className="save-btn"
              onClick={addNewMember}
              disabled={
                Object.keys(newMemberErrors).length > 0 ||
                !newMemberData.Name?.trim() ||
                !newMemberData.Position?.trim() ||
                !newMemberData.Email?.trim()
              }
            >
              Save
            </button>
            <button
              className="cancel-btn"
              onClick={() => {
                setAddingNew(false);
                setNewMemberData({
                  Name: "",
                  Position: "",
                  Email: "",
                  bio: "",
                });
                setNewImageFile(null);
                setNewMemberErrors({});
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="table-wrapper">
        <table className="team-table">
          <thead>
            <tr>
              <th style={{ width: "4%" }}>NO</th>
              <th style={{ width: "10%" }}>Image</th>
              <th style={{ width: "10%" }}>Name</th>
              <th style={{ width: "10%" }}>Position</th>
              <th style={{ width: "12%" }}>Email</th>
              <th style={{ width: "22%" }}>Quote</th>
              <th style={{ width: "24%" }}>Bio</th>
              <th style={{ width: "8%" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {members
              .filter(
                (m) =>
                  m.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  m.Position.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  m.Email.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((member, index) => (
                <tr key={member.id}>
                  <td>{index + 1}</td>
                  <td>
                    {member.Image?.url ? (
                      <img
                        src={`${baseUrl}${member.Image.url}`}
                        alt={member.Name}
                        className="profile-img"
                      />
                    ) : (
                      <div className="no-image">No Image</div>
                    )}
                  </td>
                  <td>{member.Name}</td>
                  <td>{member.Position}</td>
                  <td>{member.Email}</td>
                  <td className="quote-cell">{member.quote || "-"}</td>
                  <td className="bio-cell">{member.bio || "-"}</td>
                  <td>
                    <button
                      className="edit-btn"
                      onClick={() => {
                        setEditingId(member.id);
                        setEditFormData({
                          Name: member.Name,
                          Position: member.Position,
                          Email: member.Email,
                          bio: member.bio || "",
                          quote: member.quote || "",
                          Image: member.Image,
                        });
                        setEditErrors({});
                        setEditImageFile(null);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => deleteMember(member.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
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
            <h3>Edit Team Member</h3>

            <div className="form-grid">
              <div>
                <label>
                  Name <span className="required-star">*</span>
                </label>
                <input
                  type="text"
                  value={editFormData.Name || ""}
                  onChange={(e) =>
                    handleEditInputChange("Name", e.target.value)
                  }
                  aria-invalid={!!editErrors.Name}
                  className={editErrors.Name ? "input-error" : ""}
                />
                {editErrors.Name && (
                  <div className="error-text">{editErrors.Name}</div>
                )}
              </div>

              <div>
                <label>
                  Position <span className="required-star">*</span>
                </label>
                <input
                  type="text"
                  value={editFormData.Position || ""}
                  onChange={(e) =>
                    handleEditInputChange("Position", e.target.value)
                  }
                  aria-invalid={!!editErrors.Position}
                  className={editErrors.Position ? "input-error" : ""}
                />
                {editErrors.Position && (
                  <div className="error-text">{editErrors.Position}</div>
                )}
              </div>

              <div>
                <label>
                  Email <span className="required-star">*</span>
                </label>
                <input
                  type="email"
                  value={editFormData.Email || ""}
                  onChange={(e) =>
                    handleEditInputChange("Email", e.target.value)
                  }
                  aria-invalid={!!editErrors.Email}
                  className={editErrors.Email ? "input-error" : ""}
                />
                {editErrors.Email && (
                  <div className="error-text">{editErrors.Email}</div>
                )}
              </div>

              <div className="full-width">
                <label>Quote</label>
                <textarea
                  value={editFormData.quote || ""}
                  onChange={(e) =>
                    handleEditInputChange("quote", e.target.value)
                  }
                  rows={2}
                  style={{ resize: "vertical" }}
                />
              </div>

              <div className="full-width">
                <label>Bio</label>
                <textarea
                  value={editFormData.bio || ""}
                  onChange={(e) => handleEditInputChange("bio", e.target.value)}
                  rows={3}
                  style={{ resize: "vertical" }}
                />
              </div>

              <div className="full-width">
                <label>Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleEditImageChange}
                />
                {editImageFile && (
                  <p>
                    Selected: <em>{editImageFile.name}</em>
                  </p>
                )}
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
                display: "flex",
                justifyContent: "flex-end",
                gap: "1rem",
              }}
            >
              <button
                className="save-btn"
                onClick={() => saveEdit(editingId)}
                disabled={
                  Object.keys(editErrors).length > 0 ||
                  !editFormData.Name?.trim() ||
                  !editFormData.Position?.trim() ||
                  !editFormData.Email?.trim()
                }
              >
                Save
              </button>
              <button
                className="cancel-btn"
                onClick={() => {
                  setEditingId(null);
                  setEditFormData({});
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

export default TeamMembers;
