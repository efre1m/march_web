import type { FC } from "react";
import { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import "./EventsAdmin.css";
import ContactInfoAdmin from "./ContactInfoAdmin";

interface ContactMessage {
  id: number;
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
  contactStatus: "new" | "read";
}

const ContactAdmin: FC = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editStatus, setEditStatus] = useState<"new" | "read">("new");

  const fetchMessages = async () => {
    try {
      const res = await axiosInstance.get(
        "/contact-messages?sort=createdAt:desc"
      );

      // Ensure consistent structure from Strapi
      const data = res.data?.data || [];
      setMessages(
        data.map((item: any) => ({
          id: item.id,
          ...item, // if using entityService.findMany, attributes are not nested
        }))
      );
    } catch (err) {
      console.error("Failed to fetch messages", err);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleEditClick = (msg: ContactMessage) => {
    setEditingId(msg.id);
    setEditStatus(msg.contactStatus);
  };

  const handleSaveEdit = async () => {
    if (editingId === null) return;
    try {
      await axiosInstance.put(`/contact-messages/${editingId}`, {
        data: {
          contactStatus: editStatus,
        },
      });
      setEditingId(null);
      fetchMessages();
      alert("Status updated!");
    } catch (err) {
      console.error("Failed to update status", err);
      alert("Failed to update status");
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this message?")) {
      try {
        await axiosInstance.delete(`/contact-messages/${id}`);
        fetchMessages();
        alert("Message deleted!");
      } catch (err) {
        console.error("Failed to delete message", err);
        alert("Failed to delete message");
      }
    }
  };

  return (
    <div className="events-container">
      <h2 className="events-heading">Contact Messages</h2>

      <div className="events-controls">
        <input
          type="text"
          className="search-input"
          placeholder="Search by name, email, or subject..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="events-card-container">
        {messages
          .filter((msg) => {
            const term = searchTerm.toLowerCase();
            return (
              msg.name?.toLowerCase().includes(term) ||
              msg.email?.toLowerCase().includes(term) ||
              msg.subject?.toLowerCase().includes(term)
            );
          })
          .map((msg) => (
            <div className="event-card" key={msg.id}>
              <div className="event-content">
                <label>Name:</label>
                <h3 className="event-title">
                  {msg.name || "No name provided"}
                </h3>

                <label>Email:</label>
                <p>{msg.email || "No email provided"}</p>

                <label>Subject:</label>
                <p>{msg.subject || "No subject provided"}</p>

                <label>Message:</label>
                <p>{msg.message || "No message"}</p>

                <label>Status:</label>
                {editingId === msg.id ? (
                  <select
                    value={editStatus}
                    onChange={(e) =>
                      setEditStatus(e.target.value as "new" | "read")
                    }
                  >
                    <option value="new">New</option>
                    <option value="read">Read</option>
                  </select>
                ) : (
                  <span className={`status-badge ${msg.contactStatus}`}>
                    {msg.contactStatus}
                  </span>
                )}

                <div className="event-actions">
                  {editingId === msg.id ? (
                    <>
                      <button className="save-btn" onClick={handleSaveEdit}>
                        Save
                      </button>
                      <button
                        className="cancel-btn"
                        onClick={() => setEditingId(null)}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="edit-btn"
                        onClick={() => handleEditClick(msg)}
                      >
                        Edit
                      </button>
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(msg.id)}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
      </div>
      <ContactInfoAdmin />
    </div>
  );
};

export default ContactAdmin;
