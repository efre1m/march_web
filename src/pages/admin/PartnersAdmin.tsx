import type { ChangeEvent, FC } from "react";
import { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";
import "./TeamMembers.css";

interface Partner {
  id: number;
  name: string;
  websiteUrl: string;
  logo?: {
    id?: number;
    url: string;
    formats?: {
      small?: { url: string };
      medium?: { url: string };
      large?: { url: string };
    };
  };
}

const PartnersAdmin: FC = () => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [addingNew, setAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [newPartner, setNewPartner] = useState<Partial<Partner>>({
    name: "",
    websiteUrl: "",
  });
  const [newLogoFile, setNewLogoFile] = useState<File | null>(null);
  const [editPartner, setEditPartner] = useState<Partial<Partner>>({});
  const [editLogoFile, setEditLogoFile] = useState<File | null>(null);

  const fetchPartners = async () => {
    try {
      const res = await axiosInstance.get("/partners?populate=logo");
      setPartners(res.data.data);
    } catch (err) {
      console.error("Error fetching partners:", err);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  const handleLogoChange = (
    e: ChangeEvent<HTMLInputElement>,
    isEdit = false
  ) => {
    if (e.target.files && e.target.files[0]) {
      if (isEdit) setEditLogoFile(e.target.files[0]);
      else setNewLogoFile(e.target.files[0]);
    }
  };

  const uploadImage = async (file: File) => {
    const formData = new FormData();
    formData.append("files", file);
    try {
      const res = await axiosInstance.post("/upload", formData);
      return res.data[0].id;
    } catch (err) {
      console.error("Image upload failed:", err);
      return null;
    }
  };

  const addPartner = async () => {
    if (!newPartner.name || !newPartner.websiteUrl) {
      alert("Name and Website URL are required.");
      return;
    }

    let logoId = null;
    if (newLogoFile) logoId = await uploadImage(newLogoFile);

    try {
      await axiosInstance.post("/partners", {
        data: {
          name: newPartner.name,
          websiteUrl: newPartner.websiteUrl,
          logo: logoId || null,
        },
      });
      setNewPartner({ name: "", websiteUrl: "" });
      setNewLogoFile(null);
      setAddingNew(false);
      fetchPartners();
    } catch (err) {
      console.error("Error adding partner:", err);
    }
  };

  const saveEdit = async (id: number) => {
    if (!editPartner.name || !editPartner.websiteUrl) {
      alert("Name and Website URL are required.");
      return;
    }

    let logoId = null;
    if (editLogoFile) logoId = await uploadImage(editLogoFile);
    else if (editPartner.logo?.id) logoId = editPartner.logo.id;

    try {
      await axiosInstance.put(`/partners/${id}`, {
        data: {
          name: editPartner.name,
          websiteUrl: editPartner.websiteUrl,
          logo: logoId || null,
        },
      });
      setEditingId(null);
      setEditPartner({});
      setEditLogoFile(null);
      fetchPartners();
    } catch (err) {
      console.error("Error editing partner:", err);
    }
  };

  const deletePartner = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this partner?")) {
      try {
        await axiosInstance.delete(`/partners/${id}`);
        fetchPartners();
      } catch (err) {
        console.error("Error deleting partner:", err);
      }
    }
  };

  const getImageUrl = (logo?: Partner["logo"]) => {
    const baseUrl = import.meta.env.VITE_BACKEND_URL as string;
    const imagePath =
      logo?.formats?.large?.url ||
      logo?.formats?.medium?.url ||
      logo?.formats?.small?.url ||
      logo?.url;

    return imagePath ? `${baseUrl}${imagePath}` : "";
  };

  return (
    <div className="team-container">
      <h2 className="team-heading">Our Partners</h2>

      <div className="team-controls">
        <input
          type="text"
          className="search-input"
          placeholder="Search partners..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="add-btn" onClick={() => setAddingNew(true)}>
          Add New Partner
        </button>
      </div>

      {addingNew && (
        <form
          className="form-card"
          onSubmit={(e) => {
            e.preventDefault();
            addPartner();
          }}
        >
          <h3 className="form-title">Add Partner</h3>
          <div className="form-grid">
            <input
              type="text"
              placeholder="Name *"
              value={newPartner.name || ""}
              onChange={(e) =>
                setNewPartner({ ...newPartner, name: e.target.value })
              }
              required
            />
            <input
              type="url"
              placeholder="Website URL *"
              value={newPartner.websiteUrl || ""}
              onChange={(e) =>
                setNewPartner({ ...newPartner, websiteUrl: e.target.value })
              }
              required
              pattern="https?://.+"
              title="Please enter a valid URL starting with http:// or https://"
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleLogoChange(e)}
            />
          </div>
          <div className="form-actions">
            <button className="save-btn" type="submit">
              Save
            </button>
            <button
              className="cancel-btn"
              type="button"
              onClick={() => {
                setAddingNew(false);
                setNewPartner({ name: "", websiteUrl: "" });
                setNewLogoFile(null);
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="table-wrapper">
        <table className="team-table">
          <thead>
            <tr>
              <th>NO</th>
              <th>Logo</th>
              <th>Name</th>
              <th>Website</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {partners
              .filter((p) =>
                p.name.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((partner, index) => (
                <tr key={partner.id}>
                  <td>{index + 1}</td>
                  <td>
                    {partner.logo ? (
                      <img
                        src={getImageUrl(partner.logo)}
                        alt={partner.name}
                        className="profile-img"
                        style={{
                          maxWidth: "80px",
                          maxHeight: "50px",
                          objectFit: "contain",
                        }}
                      />
                    ) : (
                      "No Logo"
                    )}
                  </td>
                  <td>{partner.name}</td>
                  <td>
                    <a
                      href={partner.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {partner.websiteUrl}
                    </a>
                  </td>
                  <td>
                    <button
                      className="edit-btn"
                      onClick={() => {
                        setEditingId(partner.id);
                        setEditPartner({
                          name: partner.name,
                          websiteUrl: partner.websiteUrl,
                          logo: partner.logo,
                        });
                        setEditLogoFile(null);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => deletePartner(partner.id)}
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
          <form
            className="modal"
            onSubmit={(e) => {
              e.preventDefault();
              saveEdit(editingId);
            }}
          >
            <h3>Edit Partner</h3>
            <label>Name</label>
            <input
              type="text"
              value={editPartner.name || ""}
              onChange={(e) =>
                setEditPartner({ ...editPartner, name: e.target.value })
              }
              required
            />
            <label>Website URL</label>
            <input
              type="url"
              value={editPartner.websiteUrl || ""}
              onChange={(e) =>
                setEditPartner({ ...editPartner, websiteUrl: e.target.value })
              }
              required
              pattern="https?://.+"
              title="Please enter a valid URL starting with http:// or https://"
            />
            <label>Logo</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleLogoChange(e, true)}
            />
            <div className="form-actions">
              <button className="save-btn" type="submit">
                Save
              </button>
              <button
                className="cancel-btn"
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setEditPartner({});
                  setEditLogoFile(null);
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default PartnersAdmin;
