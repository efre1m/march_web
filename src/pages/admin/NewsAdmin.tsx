import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/axiosInstance";
import "./NewsAdmin.css";

interface ContentBlock {
  id?: number;
  image?: {
    id?: number;
    url: string;
    formats?: {
      thumbnail?: { url: string };
      small?: { url: string };
      medium?: { url: string };
      large?: { url: string };
    };
  } | null;
  description: string;
  title?: string;
}

interface NewsArticle {
  id: number;
  title: string;
  date: string;
  content_blocks?: ContentBlock[];
}

const NewsAdmin: React.FC = () => {
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [addingNew, setAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedArticles, setExpandedArticles] = useState<
    Record<number, boolean>
  >({}); // <--- per-article single toggle (collapsed/expanded)
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "";

  // Form states
  const [formData, setFormData] = useState({
    title: "",
    date: "",
  });
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Fetch news articles
  const fetchNews = async () => {
    try {
      setIsLoading(true);
      const res = await axiosInstance.get(
        "/news-articles?populate[content_blocks][populate]=image"
      );
      setNewsArticles(res.data.data);
    } catch (err) {
      console.error("Error fetching news:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  // Handle search
  const filteredArticles = newsArticles.filter((article) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      article.title.toLowerCase().includes(searchLower) ||
      (article.content_blocks?.some((block) =>
        block.description.toLowerCase().includes(searchLower)
      ) ??
        false)
    );
  });

  // Helper to truncate HTML -> plain text with a word limit
  const truncateHTML = (html: string, wordLimit: number) => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    const text = tempDiv.textContent || tempDiv.innerText || "";
    const words = text.split(/\s+/).filter(Boolean);
    if (words.length <= wordLimit) return text;
    return words.slice(0, wordLimit).join(" ") + "...";
  };

  // Toggle single "Read more / Read less" per article (controls all blocks)
  const toggleArticleExpand = (articleId: number) => {
    setExpandedArticles((prev) => ({ ...prev, [articleId]: !prev[articleId] }));
  };

  // Handle image upload for content blocks
  const uploadBlockImage = async (file: File) => {
    const form = new FormData();
    form.append("files", file);
    const res = await axiosInstance.post("/upload", form);
    // depending on your backend response shape adjust this; assuming res.data[0].id
    return res.data[0].id;
  };

  // Add new content block
  const addContentBlock = () => {
    setContentBlocks([
      ...contentBlocks,
      {
        description: "",
        title: "",
        image: null,
      } as ContentBlock,
    ]);
  };

  // Update content block
  const updateContentBlock = (
    index: number,
    field: keyof ContentBlock,
    value: any
  ) => {
    const newBlocks = [...contentBlocks];
    newBlocks[index] = { ...newBlocks[index], [field]: value };
    setContentBlocks(newBlocks);
  };

  // Handle content block image change
  const handleBlockImageChange = async (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        const imageId = await uploadBlockImage(file);
        updateContentBlock(index, "image", { id: imageId });
      } catch (err) {
        console.error("Error uploading image:", err);
      }
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.date) {
      newErrors.date = "Date is required";
    }

    if (contentBlocks.length === 0) {
      newErrors.content = "At least one content block is required";
    } else {
      contentBlocks.forEach((block, index) => {
        if (!block.description.trim()) {
          newErrors[`block-${index}-description`] = "Description is required";
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Create new news article
  const createNewsArticle = async () => {
    if (!validateForm()) return;

    try {
      setIsLoading(true);

      const data: any = {
        title: formData.title,
        date: formData.date,
        content_blocks: contentBlocks,
      };

      await axiosInstance.post("/news-articles", { data });

      // Reset form
      setFormData({ title: "", date: "" });
      setContentBlocks([]);
      setAddingNew(false);
      fetchNews();
    } catch (err) {
      console.error("Error creating news article:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Edit news article
  const editNewsArticle = async (id: number) => {
    if (!validateForm()) return;

    try {
      setIsLoading(true);

      const data: any = {
        title: formData.title,
        date: formData.date,
        content_blocks: contentBlocks,
      };

      await axiosInstance.put(`/news-articles/${id}`, { data });

      // Reset form
      setFormData({ title: "", date: "" });
      setContentBlocks([]);
      setEditingId(null);
      fetchNews();
    } catch (err) {
      console.error("Error updating news article:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete news article
  const deleteNewsArticle = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this news article?")) {
      try {
        await axiosInstance.delete(`/news-articles/${id}`);
        fetchNews();
      } catch (err) {
        console.error("Error deleting news article:", err);
      }
    }
  };

  // Set up for editing
  const setupEdit = (article: NewsArticle) => {
    setEditingId(article.id);
    setFormData({
      title: article.title,
      date: article.date,
    });
    setContentBlocks(article.content_blocks || []);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Cancel edit/add
  const cancelForm = () => {
    setAddingNew(false);
    setEditingId(null);
    setFormData({ title: "", date: "" });
    setContentBlocks([]);
    setErrors({});
  };

  return (
    <div className="news-admin-container">
      <div className="news-admin-header">
        <h1>News Management</h1>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search by title or content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            className="add-button"
            onClick={() => {
              setAddingNew(true);
              setEditingId(null);
            }}
          >
            Add News
          </button>
        </div>
      </div>

      {(addingNew || editingId) && (
        <div className="news-form-container">
          <h2>{editingId ? "Edit News Article" : "Add New News Article"}</h2>

          <div className="form-group">
            <label>Title*</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
            />
            {errors.title && <span className="error">{errors.title}</span>}
          </div>

          <div className="form-group">
            <label>Date*</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
            />
            {errors.date && <span className="error">{errors.date}</span>}
          </div>

          <div className="content-blocks-container">
            <h3>Content Blocks</h3>
            {errors.content && <span className="error">{errors.content}</span>}

            {contentBlocks.map((block, index) => (
              <div key={index} className="content-block">
                <div className="block-header">
                  <h4>Block {index + 1}</h4>
                </div>
                <div className="form-group">
                  <label>Image (Optional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleBlockImageChange(index, e)}
                  />
                  {block.image && (
                    <div className="image-preview">
                      <img
                        src={`${BACKEND_URL}${block.image.url}`}
                        alt="Preview"
                      />
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label>Description*</label>
                  <textarea
                    value={block.description}
                    onChange={(e) =>
                      updateContentBlock(index, "description", e.target.value)
                    }
                  />
                  {errors[`block-${index}-description`] && (
                    <span className="error">
                      {errors[`block-${index}-description`]}
                    </span>
                  )}
                </div>
              </div>
            ))}

            <button className="add-block" onClick={addContentBlock}>
              + Add Content Block
            </button>
          </div>

          <div className="form-actions">
            <button
              className="save-button"
              onClick={() =>
                editingId ? editNewsArticle(editingId) : createNewsArticle()
              }
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Save"}
            </button>
            <button className="cancel-button" onClick={cancelForm}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="news-list">
        {isLoading && !addingNew && !editingId ? (
          <div className="loading">Loading...</div>
        ) : filteredArticles.length === 0 ? (
          <div className="no-results">No news articles found</div>
        ) : (
          filteredArticles.map((article) => {
            const isExpanded = !!expandedArticles[article.id];

            // Show Read toggle if there is more than one block OR
            // the first block description is longer than 30 words
            const hasReadToggle =
              (article.content_blocks?.length ?? 0) > 1 ||
              (article.content_blocks &&
                article.content_blocks[0] &&
                (article.content_blocks[0].description || "")
                  .split(/\s+/)
                  .filter(Boolean).length > 30);

            return (
              <div key={article.id} className="news-card">
                <div className="news-card-header">
                  <h3>{article.title}</h3>
                  <div className="news-card-date">
                    {new Date(article.date).toLocaleDateString()}
                  </div>
                </div>

                <div className="content-blocks-preview">
                  {isExpanded ? (
                    // Expanded -> show all blocks in full
                    article.content_blocks?.map((block, index) => (
                      <div key={index} className="content-block-preview">
                        {block.title && (
                          <h4 className="block-title">{block.title}</h4>
                        )}
                        {block.image && (
                          <div className="block-image">
                            <img
                              src={
                                block.image?.formats?.thumbnail?.url
                                  ? `${BACKEND_URL}${block.image.formats.thumbnail.url}`
                                  : `${BACKEND_URL}${block.image.url}`
                              }
                              alt={block.title || `Block ${index + 1}`}
                            />
                          </div>
                        )}
                        <div
                          className="block-description"
                          dangerouslySetInnerHTML={{
                            __html: block.description,
                          }}
                        />
                      </div>
                    ))
                  ) : // Collapsed -> show ONLY the first block truncated to 30 words
                  article.content_blocks && article.content_blocks[0] ? (
                    <div className="content-block-preview">
                      {article.content_blocks[0].title && (
                        <h4 className="block-title">
                          {article.content_blocks[0].title}
                        </h4>
                      )}
                      {article.content_blocks[0].image && (
                        <div className="block-image">
                          <img
                            src={
                              article.content_blocks[0].image?.formats
                                ?.thumbnail?.url
                                ? `${BACKEND_URL}${article.content_blocks[0].image.formats.thumbnail.url}`
                                : `${BACKEND_URL}${article.content_blocks[0].image.url}`
                            }
                            alt={article.content_blocks[0].title || "Preview"}
                          />
                        </div>
                      )}
                      <div
                        className="block-description"
                        // truncated plain text (no HTML tags preserved)
                        dangerouslySetInnerHTML={{
                          __html: truncateHTML(
                            article.content_blocks[0].description,
                            30
                          ),
                        }}
                      />
                    </div>
                  ) : null}

                  {hasReadToggle && (
                    <button
                      className="read-more-button"
                      onClick={() => toggleArticleExpand(article.id)}
                    >
                      {isExpanded ? "Read less" : "Read more"}
                    </button>
                  )}
                </div>

                <div className="news-card-actions">
                  <button
                    className="edit-button"
                    onClick={() => setupEdit(article)}
                  >
                    Edit
                  </button>
                  <button
                    className="delete-button"
                    onClick={() => deleteNewsArticle(article.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default NewsAdmin;
