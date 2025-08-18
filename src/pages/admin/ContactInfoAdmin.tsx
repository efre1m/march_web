import type { FC } from "react";
import { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";
import "./TeamMembers.css";

interface ContactInfo {
  id: number;
  email: string;
  phone: string;
  address: string;
  maplink?: string;
}
// Validation helpers
const isValidEthiopianPhone = (phone: string) => {
  const ethioPattern = /^(09\d{8}|\+2519\d{8})$/;
  const safaricomPattern = /^(07\d{8}|\+2547\d{8})$/;
  return ethioPattern.test(phone) || safaricomPattern.test(phone);
};

const isValidURL = (url: string) => {
  const pattern = /^(https?:\/\/)?([\w\d-]+\.)+[\w\d]{2,}(\/.*)?$/i;
  return pattern.test(url);
};

const ContactInfoAdmin: FC = () => {
  const [contactInfos, setContactInfos] = useState<ContactInfo[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [addingNew, setAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form states
  const [newContactData, setNewContactData] = useState<Partial<ContactInfo>>({
    email: "",
    phone: "",
    address: "",
    maplink: "",
  });
  const [newErrors, setNewErrors] = useState<{ [key: string]: string }>({});

  const [editFormData, setEditFormData] = useState<Partial<ContactInfo>>({});
  const [editErrors, setEditErrors] = useState<{ [key: string]: string }>({});

  // Fetch contact infos
  const fetchContactInfos = async () => {
    try {
      const res = await axiosInstance.get("/contact-infos");
      setContactInfos(res.data.data);
    } catch (err) {
      console.error("Error fetching contact infos:", err);
    }
  };

  useEffect(() => {
    fetchContactInfos();
  }, []);

  // Validation function
  const validateForm = (data: Partial<ContactInfo>) => {
    const errors: { [key: string]: string } = {};

    if (!data.email?.trim()) {
      errors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
      errors.email = "Invalid email format.";
    }

    if (!data.phone?.trim()) {
      errors.phone = "Phone is required.";
    } else if (!isValidEthiopianPhone(data.phone.trim())) {
      errors.phone =
        "Invalid phone number format (Ethio Telecom or Safaricom only).";
    }

    if (!data.address?.trim()) {
      errors.address = "Address is required.";
    }

    if (data.maplink?.trim() && !isValidURL(data.maplink.trim())) {
      errors.maplink = "Invalid URL format.";
    }

    return errors;
  };

  // Input handlers for add form
  const handleNewInputChange = (field: keyof ContactInfo, value: string) => {
    const updated = { ...newContactData, [field]: value };
    setNewContactData(updated);
    setNewErrors(validateForm(updated));
  };

  // Input handlers for edit form
  const handleEditInputChange = (field: keyof ContactInfo, value: string) => {
    const updated = { ...editFormData, [field]: value };
    setEditFormData(updated);
    setEditErrors(validateForm(updated));
  };

  // Add new contact info submit
  const addNewContactInfo = async () => {
    const errors = validateForm(newContactData);
    setNewErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      await axiosInstance.post("/contact-infos", {
        data: newContactData,
      });
      setAddingNew(false);
      setNewContactData({ email: "", phone: "", address: "", maplink: "" });
      setNewErrors({});
      fetchContactInfos();
      alert("New contact info added successfully!");
    } catch (err) {
      console.error("Failed to add contact info", err);
      alert("Failed to add contact info");
    }
  };

  // Save edit submit
  const saveEdit = async (id: number) => {
    const errors = validateForm(editFormData);
    setEditErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      await axiosInstance.put(`/contact-infos/${id}`, {
        data: editFormData,
      });

      setEditingId(null);
      setEditFormData({});
      setEditErrors({});
      fetchContactInfos();
      alert("Contact info updated successfully!");
    } catch (err) {
      console.error("Failed to update contact info", err);
      alert("Failed to update contact info");
    }
  };

  // Delete contact info
  const deleteContactInfo = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this contact info?")) {
      try {
        await axiosInstance.delete(`/contact-infos/${id}`);
        fetchContactInfos();
        alert("Contact info deleted successfully!");
      } catch (err) {
        console.error("Failed to delete contact info", err);
        alert("Failed to delete contact info");
      }
    }
  };

  return (
    <div className="team-container">
      <h2 className="team-heading">Contact Info</h2>

      <div className="team-controls">
        <input
          type="text"
          placeholder="Search by email, phone or address..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          aria-label="Search contact info"
        />
        <button
          className="add-btn"
          onClick={() => setAddingNew(true)}
          aria-label="Add new contact info"
        >
          Add New Contact Info
        </button>
      </div>

      {/* Add New Contact Info Form */}
      {addingNew && (
        <div
          className="form-card"
          role="form"
          aria-label="Add new contact info form"
        >
          <h3 className="form-title">Add New Contact Info</h3>
          <div className="form-grid">
            <div>
              <input
                type="email"
                placeholder="Email *"
                value={newContactData.email || ""}
                onChange={(e) => handleNewInputChange("email", e.target.value)}
                aria-invalid={!!newErrors.email}
                aria-describedby="new-error-email"
              />
              {newErrors.email && (
                <div id="new-error-email" className="error-text">
                  {newErrors.email}
                </div>
              )}
            </div>

            <div>
              <input
                type="tel"
                placeholder="Phone *"
                value={newContactData.phone || ""}
                onChange={(e) => handleNewInputChange("phone", e.target.value)}
                aria-invalid={!!newErrors.phone}
                aria-describedby="new-error-phone"
              />
              {newErrors.phone && (
                <div id="new-error-phone" className="error-text">
                  {newErrors.phone}
                </div>
              )}
            </div>

            <div>
              <input
                type="text"
                placeholder="Address *"
                value={newContactData.address || ""}
                onChange={(e) =>
                  handleNewInputChange("address", e.target.value)
                }
                aria-invalid={!!newErrors.address}
                aria-describedby="new-error-address"
              />
              {newErrors.address && (
                <div id="new-error-address" className="error-text">
                  {newErrors.address}
                </div>
              )}
            </div>

            <div>
              <input
                type="url"
                placeholder="Map Link"
                value={newContactData.maplink || ""}
                onChange={(e) =>
                  handleNewInputChange("maplink", e.target.value)
                }
                aria-invalid={!!newErrors.maplink}
                aria-describedby="new-error-maplink"
              />
              {newErrors.maplink && (
                <div id="new-error-maplink" className="error-text">
                  {newErrors.maplink}
                </div>
              )}
            </div>
          </div>

          <div className="form-actions">
            <button
              className="save-btn"
              onClick={addNewContactInfo}
              disabled={
                Object.keys(newErrors).length > 0 ||
                !newContactData.email?.trim() ||
                !newContactData.phone?.trim() ||
                !newContactData.address?.trim()
              }
            >
              Save
            </button>
            <button
              className="cancel-btn"
              onClick={() => {
                setAddingNew(false);
                setNewContactData({
                  email: "",
                  phone: "",
                  address: "",
                  maplink: "",
                });
                setNewErrors({});
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Contact Info Table */}
      <div className="table-wrapper">
        <table className="team-table">
          <thead>
            <tr>
              <th>NO</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Address</th>
              <th>Map Link</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {contactInfos
              .filter((info) => {
                const term = searchTerm.toLowerCase();
                return (
                  info.email.toLowerCase().includes(term) ||
                  info.phone.toLowerCase().includes(term) ||
                  info.address.toLowerCase().includes(term) ||
                  (info.maplink?.toLowerCase().includes(term) ?? false)
                );
              })
              .map((info, index) => (
                <tr key={info.id}>
                  <td>{index + 1}</td>
                  <td>{info.email}</td>
                  <td>{info.phone}</td>
                  <td>{info.address}</td>
                  <td>
                    {info.maplink ? (
                      <>
                        {/* Show the embed preview */}
                        <iframe
                          src={info.maplink}
                          width="200"
                          height="150"
                          style={{ border: 0 }}
                          allowFullScreen
                          loading="lazy"
                          title={`Map for ${info.address}`}
                        />
                        {/* Optional link to open in Google Maps */}
                        <div style={{ marginTop: "4px" }}>
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                              info.address
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Open in Google Maps
                          </a>
                        </div>
                      </>
                    ) : (
                      "N/A"
                    )}
                  </td>

                  <td>
                    <button
                      className="edit-btn"
                      onClick={() => {
                        setEditingId(info.id);
                        setEditFormData(info);
                        setEditErrors({});
                      }}
                    >
                      Edit
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => deleteContactInfo(info.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editingId && (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-contactinfo-title"
        >
          <div className="modal">
            <h3 id="edit-contactinfo-title">Edit Contact Info</h3>

            <label htmlFor="edit-email">Email</label>
            <input
              id="edit-email"
              type="email"
              value={editFormData.email || ""}
              onChange={(e) => handleEditInputChange("email", e.target.value)}
              aria-invalid={!!editErrors.email}
              aria-describedby="edit-error-email"
            />
            {editErrors.email && (
              <div id="edit-error-email" className="error-text">
                {editErrors.email}
              </div>
            )}

            <label htmlFor="edit-phone">Phone</label>
            <input
              id="edit-phone"
              type="tel"
              value={editFormData.phone || ""}
              onChange={(e) => handleEditInputChange("phone", e.target.value)}
              aria-invalid={!!editErrors.phone}
              aria-describedby="edit-error-phone"
            />
            {editErrors.phone && (
              <div id="edit-error-phone" className="error-text">
                {editErrors.phone}
              </div>
            )}

            <label htmlFor="edit-address">Address</label>
            <input
              id="edit-address"
              type="text"
              value={editFormData.address || ""}
              onChange={(e) => handleEditInputChange("address", e.target.value)}
              aria-invalid={!!editErrors.address}
              aria-describedby="edit-error-address"
            />
            {editErrors.address && (
              <div id="edit-error-address" className="error-text">
                {editErrors.address}
              </div>
            )}

            <label htmlFor="edit-maplink">Map Link</label>
            <input
              id="edit-maplink"
              type="url"
              value={editFormData.maplink || ""}
              onChange={(e) => handleEditInputChange("maplink", e.target.value)}
              aria-invalid={!!editErrors.maplink}
              aria-describedby="edit-error-maplink"
            />
            {editErrors.maplink && (
              <div id="edit-error-maplink" className="error-text">
                {editErrors.maplink}
              </div>
            )}

            <div className="form-actions">
              <button
                className="save-btn"
                onClick={() => saveEdit(editingId)}
                disabled={
                  Object.keys(editErrors).length > 0 ||
                  !editFormData.email?.trim() ||
                  !editFormData.phone?.trim() ||
                  !editFormData.address?.trim()
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

export default ContactInfoAdmin;
