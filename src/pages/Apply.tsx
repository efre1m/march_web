import React, { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useLocation, Link } from "react-router-dom";
import "./Apply.css";
import axiosInstance from "../utils/axiosInstance";

interface ResumeFile {
  id: number;
  name: string;
  url: string;
}

const Apply: React.FC = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  const vacancyId = searchParams.get("vacancyId");
  const positionTitle = searchParams.get("title");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    resume: null as File | null,
    coverLetter: "",
  });

  const [errors, setErrors] = useState({
    name: false,
    email: false,
    phoneNumber: false,
    resume: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePhone = (phone: string): boolean => {
    const ethioPattern = /^(?:\+2519\d{8}|09\d{8})$/;
    return ethioPattern.test(phone);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: false }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      const validTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];

      if (!validTypes.includes(file.type)) {
        setSubmitError("Only PDF or DOC/DOCX files are allowed.");
        return;
      }

      setFormData((prev) => ({ ...prev, resume: file }));
      if (errors.resume) {
        setErrors((prev) => ({ ...prev, resume: false }));
      }
      setSubmitError("");
    }
  };

  const validateForm = (): boolean => {
    const newErrors = {
      name: !formData.name.trim(),
      email: !validateEmail(formData.email),
      phoneNumber: !validatePhone(formData.phoneNumber),
      resume: !formData.resume,
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some(Boolean);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    if (!vacancyId) {
      setSubmitError("Vacancy ID is missing.");
      return;
    }

    if (!validateForm()) {
      setSubmitError("Please fill all required fields correctly.");
      return;
    }

    setIsSubmitting(true);

    try {
      // ✅ 1. Check if user already applied to this specific job
      const alreadyAppliedRes = await axiosInstance.get("/applications", {
        params: {
          filters: {
            email: { $eq: formData.email },
            vacancy: { id: { $eq: vacancyId } },
          },
        },
      });

      if (alreadyAppliedRes?.data?.data?.length > 0) {
        setSubmitError("You have already applied to this job.");
        setIsSubmitting(false);
        return;
      }

      // ✅ 2. Check how many different jobs the user has applied to
      const allAppsRes = await axiosInstance.get("/applications", {
        params: {
          filters: {
            email: { $eq: formData.email },
          },
          populate: ["vacancy"],
        },
      });

      const applications = allAppsRes.data?.data || [];
      const uniqueJobIds = new Set(
        applications
          .map((app: any) => app.attributes?.vacancy?.data?.id)
          .filter((id: number | undefined) => typeof id === "number")
      );

      if (uniqueJobIds.size >= 3) {
        setSubmitError("You have reached the limit of 3 job applications.");
        setIsSubmitting(false);
        return;
      }
      // ✅ 4. Upload resume
      const fileFormData = new FormData();
      if (formData.resume) {
        fileFormData.append("files", formData.resume);
      }

      const uploadRes = await axiosInstance.post("/upload", fileFormData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (!uploadRes.data || uploadRes.data.length === 0) {
        throw new Error("Failed to upload resume");
      }

      const uploadedFile: ResumeFile = uploadRes.data[0];

      // ✅ 5. Submit application
      const applicationPayload = {
        data: {
          name: formData.name,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          coverLetter: formData.coverLetter,
          appliedAt: new Date().toISOString(),
          vacancyTitle: positionTitle || "Unknown",
          resume: uploadedFile.id,
          vacancy: vacancyId,
        },
      };

      await axiosInstance.post("/applications", applicationPayload);
      const broadcast = new BroadcastChannel("application_channel");
      broadcast.postMessage("new_application_added");

      // ✅ 6. Reset form and notify user
      setFormData({
        name: "",
        email: "",
        phoneNumber: "",
        resume: null,
        coverLetter: "",
      });

      alert("Application submitted successfully!");
    } catch (error) {
      console.error("Submission failed:", error);
      setSubmitError("Failed to submit application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Header />
      <main className="vacancies-page">
        <div className="vacancies-layout">
          <aside className="vacancies-sidebar apply">
            <h3>Application Instructions</h3>
            <p>Please fill out all required fields and upload your resume.</p>
            <p>
              <Link to="/vacancies" className="return-link">
                ← Return to Vacancies
              </Link>
            </p>
          </aside>

          <section className="vacancies-main">
            <h2>Applying for {positionTitle || "a Position"}</h2>
            {positionTitle && (
              <p className="position-subtitle">
                Apply for the position: <strong>{positionTitle}</strong>
              </p>
            )}
            <div className="application-wrapper">
              {submitError && (
                <div className="error-alert">
                  <div className="error-alert-content">
                    <span className="error-alert-icon">⚠️</span>
                    <span>{submitError}</span>
                  </div>
                </div>
              )}

              <form className="application-form" onSubmit={handleSubmit}>
                <label>
                  Full Name <span className="required-asterisk">*</span>
                  <input
                    type="text"
                    name="name"
                    placeholder="Write your full name"
                    value={formData.name}
                    onChange={handleChange}
                    className={errors.name ? "invalid" : ""}
                  />
                  {errors.name && (
                    <span className="field-error">This field is required</span>
                  )}
                </label>

                <label>
                  Email Address <span className="required-asterisk">*</span>
                  <input
                    type="email"
                    name="email"
                    placeholder="example@domain.com"
                    value={formData.email}
                    onChange={handleChange}
                    className={errors.email ? "invalid" : ""}
                  />
                  {errors.email && (
                    <span className="field-error">
                      {!formData.email.includes("@")
                        ? "Email must contain @ symbol"
                        : !formData.email.includes(".")
                          ? "Email must contain a domain (e.g., example.com)"
                          : "Please enter a valid email address"}
                    </span>
                  )}
                </label>

                <label>
                  Phone Number <span className="required-asterisk">*</span>
                  <input
                    type="tel"
                    name="phoneNumber"
                    placeholder="+2519xxxxxxxx or 09xxxxxxxx"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className={errors.phoneNumber ? "invalid" : ""}
                  />
                  {errors.phoneNumber && (
                    <span className="field-error">
                      Must be +2519xxxxxxxx or 09xxxxxxxx
                    </span>
                  )}
                </label>

                <label>
                  Upload Resume (PDF or DOC/DOCX){" "}
                  <span className="required-asterisk">*</span>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className={errors.resume ? "invalid" : ""}
                  />
                  {errors.resume && (
                    <span className="field-error">Resume is required</span>
                  )}
                </label>

                <label>
                  Cover Letter
                  <textarea
                    name="coverLetter"
                    rows={4}
                    placeholder="Explain why you're a good fit..."
                    value={formData.coverLetter}
                    onChange={handleChange}
                  />
                </label>

                <button
                  type="submit"
                  className="apply-button"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit Application"}
                </button>

                <p className="note">
                  <strong>NB:</strong>{" "}
                  <span className="required-asterisk">*</span> indicates
                  required fields.
                </p>
              </form>
            </div>
          </section>

          <aside className="vacancies-rightbar apply">
            <div className="highlight-box">
              <h4>Need Help?</h4>
              <p>
                <Link to="/contact" className="contact-link">
                  Contact our HR
                </Link>{" "}
                if you have issues with the application form.
              </p>
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Apply;
