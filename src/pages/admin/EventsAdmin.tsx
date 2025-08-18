import type { FC, ChangeEvent } from "react";
import { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";
import "./EventsAdmin.css";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { format, toZonedTime } from "date-fns-tz";
import { FiCalendar, FiMapPin, FiFileText, FiBookmark } from "react-icons/fi";
import { FaNewspaper } from "react-icons/fa";

interface Event {
  id: number;
  documentId: string;
  title: string;
  description: string;
  slug: string;
  mode: "in-person" | "online" | "hybrid";
  eventStatus: "upcoming" | "in-progress" | "completed" | "cancelled";
  startDate: string;
  endDate: string;
  location: string;
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

const TIMEZONE = "Africa/Addis_Ababa";

const EventsAdmin: FC = () => {
  const backendURL = import.meta.env.VITE_BACKEND_URL as string;
  const [events, setEvents] = useState<Event[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [addingNew, setAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newData, setNewData] = useState<Partial<Event>>({
    title: "",
    description: "",
    slug: "",
    mode: "in-person",
    eventStatus: "upcoming",
    startDate: "",
    endDate: "",
    location: "",
  });
  const [newErrors, setNewErrors] = useState<{ [key: string]: string }>({});
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [editData, setEditData] = useState<Partial<Event>>({});
  const [editErrors, setEditErrors] = useState<{ [key: string]: string }>({});
  const [editImageFile, setEditImageFile] = useState<File | null>(null);

  const parseDescription = (desc: string) => desc || "";

  const formatDateInEurope = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const zonedDate = toZonedTime(date, TIMEZONE);
    return format(zonedDate, "yyyy-MM-dd hh:mm a", { timeZone: TIMEZONE });
  };

  const formatDateForInput = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return format(date, "yyyy-MM-dd'T'HH:mm");
  };

  const createDescription = (text: string) => text;

  const editor = useEditor({
    extensions: [StarterKit],
    content: parseDescription(newData.description || ""),
    onUpdate({ editor }) {
      const text = editor.getText();
      handleNewInputChange("description", createDescription(text));
    },
  });

  const editEditor = useEditor({
    extensions: [StarterKit],
    content: "",
    onUpdate({ editor }) {
      const text = editor.getText();
      handleEditInputChange("description", createDescription(text));
    },
  });

  const fetchEvents = async () => {
    try {
      const res = await axiosInstance.get("/events?populate=image");
      setEvents(res.data.data);
    } catch (err) {
      console.error("Error fetching events:", err);
    }
  };
  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await axiosInstance.get("/events?populate=image");
        const freshEvents = res.data.data;

        const updatedEvents = await Promise.all(
          freshEvents.map(async (event: Event) => {
            if (event.eventStatus === "cancelled") return event;

            const computedStatus = calculateStatus(
              event.startDate,
              event.endDate
            );
            if (event.eventStatus !== computedStatus) {
              try {
                await axiosInstance.put(`/events/${event.id}`, {
                  data: {
                    eventStatus: computedStatus,
                    image: event.image?.id || null, // ✅ Preserve image
                  },
                });
                return { ...event, eventStatus: computedStatus };
              } catch (err) {
                console.error(
                  `Failed to update status for event ${event.id}`,
                  err
                );
                return event;
              }
            }

            return event;
          })
        );

        setEvents(updatedEvents);
      } catch (err) {
        console.error("Failed to fetch events during status sync", err);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, []); // ✅ Only run once on mount

  const calculateStatus = (
    startDate?: string,
    endDate?: string
  ): Event["eventStatus"] => {
    if (!startDate) return "upcoming";
    const now = new Date();
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : null;

    if (now < start) return "upcoming";
    if (end && now > end) return "completed";
    if (now >= start && (!end || now <= end)) return "in-progress";

    return "upcoming";
  };

  const validateEvent = (data: Partial<Event>) => {
    const errors: { [key: string]: string } = {};
    if (!data.title?.trim()) errors.title = "Title is required.";
    if (!data.description || !parseDescription(data.description).trim()) {
      errors.description = "Description is required.";
    }
    if (!data.startDate) errors.startDate = "Start date is required.";
    if (!data.endDate) errors.endDate = "End date is required.";
    if (
      data.startDate &&
      data.endDate &&
      new Date(data.startDate) > new Date(data.endDate)
    ) {
      errors.endDate = "End date must be after start date.";
    }
    if (!data.location?.trim()) errors.location = "Location is required.";
    return errors;
  };

  const handleNewInputChange = (field: keyof Event, value: any) => {
    const updatedData = { ...newData, [field]: value };

    if (field === "startDate" || field === "endDate") {
      updatedData.eventStatus = calculateStatus(
        updatedData.startDate,
        updatedData.endDate
      );
    }

    setNewData(updatedData);
    setNewErrors(validateEvent(updatedData));
  };

  const handleEditInputChange = (field: keyof Event, value: any) => {
    const updatedData = { ...editData, [field]: value };

    if (field === "startDate" || field === "endDate") {
      updatedData.eventStatus = calculateStatus(
        updatedData.startDate,
        updatedData.endDate
      );
    }

    setEditData(updatedData);
    setEditErrors(validateEvent(updatedData));
  };

  const uploadImage = async (file: File) => {
    const formData = new FormData();
    formData.append("files", file);
    try {
      const res = await axiosInstance.post("/upload", formData);
      return res.data[0].id;
    } catch (err) {
      console.error("Error uploading image:", err);
      return null;
    }
  };

  const addNewEvent = async () => {
    const errors = validateEvent(newData);
    setNewErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      let imageId = null;
      if (newImageFile) imageId = await uploadImage(newImageFile);

      await axiosInstance.post("/events", {
        data: {
          ...newData,
          image: imageId,
        },
      });

      setNewData({
        title: "",
        description: createDescription(""),
        slug: "",
        mode: "in-person",
        eventStatus: "upcoming",
        startDate: "",
        endDate: "",
        location: "",
      });
      setNewImageFile(null);
      setAddingNew(false);
      setNewErrors({});
      editor?.commands.setContent("");
      fetchEvents();
      alert("Event added successfully!");
    } catch (err) {
      console.error("Failed to add event", err);
      alert("Failed to add event");
    }
  };

  const saveEdit = async (id: number) => {
    const errors = validateEvent(editData);
    setEditErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      let imageId = null;
      if (editImageFile) imageId = await uploadImage(editImageFile);
      else if (editData.image?.id) imageId = editData.image.id;

      await axiosInstance.put(`/events/${id}`, {
        data: {
          ...editData,
          image: imageId,
        },
      });

      setEditingId(null);
      setEditData({});
      setEditImageFile(null);
      setEditErrors({});
      fetchEvents();
      alert("Event updated successfully!");
    } catch (err) {
      console.error("Failed to update event", err);
      alert("Failed to update event");
    }
  };

  const deleteEvent = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    try {
      const res = await axiosInstance.delete(`/events/${id}`);
      if (res.status === 200 || res.status === 204) {
        setEvents((prev) => prev.filter((e) => e.id !== id));
        alert("Event deleted successfully!");
      } else {
        alert("Failed to delete event.");
      }
    } catch (err) {
      console.error("Failed to delete event", err);
      alert("Failed to delete event");
    }
  };

  const toggleCancelEvent = async (id: number) => {
    const event = events.find((e) => e.id === id);
    if (!event) return;

    const isCancelled = event.eventStatus === "cancelled";
    const newStatus: Event["eventStatus"] = isCancelled
      ? calculateStatus(event.startDate, event.endDate)
      : "cancelled";

    if (
      !window.confirm(
        isCancelled
          ? "Are you sure you want to restore this event?"
          : "Are you sure you want to cancel this event?"
      )
    ) {
      return;
    }

    try {
      await axiosInstance.put(`/events/${id}`, {
        data: {
          eventStatus: newStatus,
          image: event.image?.id || null, // ✅ KEEP EXISTING IMAGE
        },
      });

      setEvents((prev) =>
        prev.map((e) => (e.id === id ? { ...e, eventStatus: newStatus } : e))
      );

      alert(isCancelled ? "Event restored!" : "Event cancelled!");
    } catch (err) {
      console.error("Failed to update event status", err);
      alert("Failed to update event status.");
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
      <h2 className="events-heading">Events Management</h2>
      <div className="events-controls">
        <input
          type="text"
          className="search-input"
          placeholder="Search events..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="add-btn" onClick={() => setAddingNew(true)}>
          Add Event
        </button>
      </div>

      {addingNew && (
        <div className="form-card">
          <h3 className="form-title">Add New Event</h3>
          <div className="form-grid">
            <div>
              <input
                type="text"
                placeholder="Title *"
                value={newData.title || ""}
                onChange={(e) => handleNewInputChange("title", e.target.value)}
              />
              {newErrors.title && (
                <div className="error-text">{newErrors.title}</div>
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
              <select
                value={newData.mode || "in-person"}
                onChange={(e) =>
                  handleNewInputChange("mode", e.target.value as any)
                }
              >
                <option value="in-person">In-Person</option>
                <option value="online">Online</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
            <div>
              <label>Start Date *</label>
              <input
                type="datetime-local"
                value={
                  newData.startDate ? formatDateForInput(newData.startDate) : ""
                }
                onChange={(e) =>
                  handleNewInputChange("startDate", e.target.value)
                }
              />
              {newErrors.startDate && (
                <div className="error-text">{newErrors.startDate}</div>
              )}
            </div>
            <div>
              <label>End Date *</label>
              <input
                type="datetime-local"
                value={
                  newData.endDate ? formatDateForInput(newData.endDate) : ""
                }
                onChange={(e) =>
                  handleNewInputChange("endDate", e.target.value)
                }
              />
              {newErrors.endDate && (
                <div className="error-text">{newErrors.endDate}</div>
              )}
            </div>
            <div>
              <input
                type="text"
                placeholder="Location *"
                value={newData.location || ""}
                onChange={(e) =>
                  handleNewInputChange("location", e.target.value)
                }
              />
              {newErrors.location && (
                <div className="error-text">{newErrors.location}</div>
              )}
            </div>
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handleNewImageChange}
              />
            </div>
          </div>
          <div className="form-actions">
            <button className="save-btn" onClick={addNewEvent}>
              Save
            </button>
            <button className="cancel-btn" onClick={() => setAddingNew(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="events-card-container">
        {events.length > 0 ? (
          events
            .filter(
              (e) =>
                e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                parseDescription(e.description)
                  .toLowerCase()
                  .includes(searchTerm.toLowerCase()) ||
                e.location.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map((e) => (
              <div
                className={`event-card ${
                  e.eventStatus === "cancelled" ? "cancelled-event" : ""
                }`}
                key={e.id}
                style={
                  e.eventStatus === "cancelled"
                    ? {
                        opacity: 0.7,
                        position: "relative",
                        borderLeft: "4px solid #d32f2f",
                      }
                    : {}
                }
              >
                <div className="event-image-container">
                  {e.image ? (
                    <div className="image-wrapper">
                      <img
                        src={
                          e.image?.formats?.large?.url
                            ? backendURL + e.image.formats.large.url
                            : e.image?.formats?.medium?.url
                            ? backendURL + e.image.formats.medium.url
                            : e.image?.formats?.small?.url
                            ? backendURL + e.image.formats.small.url
                            : e.image?.url
                            ? backendURL + e.image.url
                            : ""
                        }
                        className="event-image"
                        alt={e.title}
                      />
                    </div>
                  ) : (
                    <div className="no-image-placeholder">
                      No Image Available
                    </div>
                  )}
                </div>

                <div className="event-content">
                  <h3 className="event-title">
                    <FiBookmark
                      style={{
                        marginRight: "8px",
                        verticalAlign: "middle",
                      }}
                    />
                    {e.title}
                  </h3>

                  <p className="event-meta">
                    <span className={`status-badge ${e.eventStatus}`}>
                      {e.eventStatus === "cancelled"
                        ? "Canceled"
                        : e.eventStatus}
                    </span>
                    <span className="mode-badge">{e.mode}</span>
                  </p>

                  <p className="event-date">
                    <FiCalendar
                      style={{ marginRight: "6px", verticalAlign: "middle" }}
                    />
                    {formatDateInEurope(e.startDate)} –{" "}
                    {formatDateInEurope(e.endDate)}
                  </p>

                  <p className="event-location">
                    <FiMapPin
                      style={{ marginRight: "6px", verticalAlign: "middle" }}
                    />
                    <strong style={{ fontSize: "1.05rem" }}>
                      {e.location}
                    </strong>
                  </p>

                  <div className="event-description">
                    <FiFileText
                      style={{ marginRight: "6px", verticalAlign: "middle" }}
                    />
                    {parseDescription(e.description)}
                  </div>

                  {/* Add your admin buttons here if needed */}
                  <div className="event-actions">
                    <button
                      className="edit-btn"
                      onClick={() => {
                        setEditingId(e.id);
                        setEditData({ ...e });
                        setEditErrors({});
                        setEditImageFile(null);
                        editEditor?.commands.setContent(
                          parseDescription(e.description)
                        );
                      }}
                    >
                      Edit
                    </button>

                    <button
                      className={
                        e.eventStatus === "cancelled"
                          ? "restore-btn"
                          : "cancel-btn"
                      }
                      onClick={() => toggleCancelEvent(e.id)}
                    >
                      {e.eventStatus === "cancelled" ? "Restore" : "Cancel"}
                    </button>

                    <button
                      className="delete-btn"
                      onClick={() => deleteEvent(e.id)}
                    >
                      Delete
                    </button>
                  </div>

                  {e.eventStatus === "cancelled" && (
                    <div
                      style={{
                        position: "absolute",
                        top: "10px",
                        right: "10px",
                        backgroundColor: "#d32f2f",
                        color: "white",
                        padding: "5px 10px",
                        borderRadius: "4px",
                        fontWeight: "bold",
                        fontSize: "0.8rem",
                      }}
                    >
                      Event Canceled
                    </div>
                  )}
                </div>
              </div>
            ))
        ) : (
          <div className="no-news-message">
            <FaNewspaper size={64} color="#ccc" />
            <h2>No Events Available</h2>
            <p>
              Currently, there are no scheduled events. Please check back later
              or follow our updates for future announcements.
            </p>
          </div>
        )}
      </div>

      {editingId && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Edit Event</h3>
            <div className="form-grid">
              <div>
                <label>Title *</label>
                <input
                  type="text"
                  placeholder="Title *"
                  value={editData.title || ""}
                  onChange={(e) =>
                    handleEditInputChange("title", e.target.value)
                  }
                />
                {editErrors.title && (
                  <div className="error-text">{editErrors.title}</div>
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
                <select
                  value={editData.mode || "in-person"}
                  onChange={(e) =>
                    handleEditInputChange("mode", e.target.value as any)
                  }
                >
                  <option value="in-person">In-Person</option>
                  <option value="online">Online</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
              <div>
                <label>Start Date *</label>
                <input
                  type="datetime-local"
                  value={
                    editData.startDate
                      ? formatDateForInput(editData.startDate)
                      : ""
                  }
                  onChange={(e) =>
                    handleEditInputChange("startDate", e.target.value)
                  }
                />
                {editErrors.startDate && (
                  <div className="error-text">{editErrors.startDate}</div>
                )}
              </div>
              <div>
                <label>End Date *</label>
                <input
                  type="datetime-local"
                  value={
                    editData.endDate ? formatDateForInput(editData.endDate) : ""
                  }
                  onChange={(e) =>
                    handleEditInputChange("endDate", e.target.value)
                  }
                />
                {editErrors.endDate && (
                  <div className="error-text">{editErrors.endDate}</div>
                )}
              </div>
              <div>
                <label>Location*</label>
                <input
                  type="text"
                  placeholder="Location *"
                  value={editData.location || ""}
                  onChange={(e) =>
                    handleEditInputChange("location", e.target.value)
                  }
                />
                {editErrors.location && (
                  <div className="error-text">{editErrors.location}</div>
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
                  setEditImageFile(null);
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

export default EventsAdmin;
