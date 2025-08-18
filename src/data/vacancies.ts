export type VacancyItem = {
  title: string;
  location: string;
  department: string;
  jobType: "Full-Time" | "Part-Time" | "Contract";
  description: string;
  slug: string;
};

export const vacancies: VacancyItem[] = [
  {
    title: "Frontend Developer",
    location: "Remote",
    department: "Engineering",
    jobType: "Full-Time",
    description:
      "We're looking for a skilled Frontend Developer with strong experience in React, TypeScript, and modern CSS frameworks. You should have 3+ years of professional experience, a deep understanding of responsive design principles, and the ability to write clean, maintainable code. Familiarity with REST APIs, accessibility standards, and performance optimization techniques is essential. This role is ideal for someone passionate about creating seamless user interfaces in the digital health space.",
    slug: "frontend-developer",
  },
  {
    title: "Monitoring & Evaluation Officer",
    location: "London",
    department: "Operations",
    jobType: "Contract",
    description:
      "We're seeking a detail-oriented M&E Officer with experience in project evaluation, data analysis, and reporting within international development or health programs. Candidates should have at least 2–3 years of field or policy-level experience. Proficiency in tools like Excel, Power BI, or Tableau is a plus. A strong understanding of logical frameworks, KPIs, and impact measurement is essential. Excellent communication skills and the ability to work across cross-functional teams is required.",
    slug: "monitoring-evaluation-officer",
  },
  {
    title: "Communications Specialist",
    location: "New York",
    department: "Marketing",
    jobType: "Part-Time",
    description:
      "Join our dynamic outreach team to amplify DHRDC’s presence globally. We're looking for a Communications Specialist with 2+ years of experience in digital marketing, social media management, and content creation. Strong writing, editing, and storytelling skills are a must. Familiarity with platforms like Hootsuite, Canva, or Mailchimp is advantageous. You’ll work closely with marketing and program leads to ensure brand consistency and audience engagement across platforms.",
    slug: "communications-specialist",
  },
];
