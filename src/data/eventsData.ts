export type EventItem = {
  title: string;
  description: string;
  date: string;
  location: string;
  imageUrl: string;
  slug: string; // Used for routing to individual event detail pages
};

export const eventsItems: EventItem[] = [
  {
    title: "National Health Innovation Summit 2025",
    slug: "national-health-innovation-summit-2025",
    description:
      "Join healthcare leaders, technologists, and policy makers at the 2025 Health Innovation Summit to discuss digital transformation in public health, AI in diagnostics, and community-led health solutions.",
    date: "2025-08-15",
    location: "Addis Ababa, Ethiopia",
    imageUrl: "/images/events/event1.jpg",
  },
  {
    title: "Mobile Health App Training Workshop",
    slug: "mobile-health-app-training",
    description:
      "A hands-on training event for community health workers to learn and use the new DHRDC mobile app. The workshop covers patient data management, vaccine scheduling, and health reporting tools.",
    date: "2025-07-20",
    location: "Mekelle, Ethiopia",
    imageUrl: "/images/events/event2.jpg",
  },
  {
    title: "Maternal Health Awareness Week",
    slug: "maternal-health-awareness-week",
    description:
      "A week-long series of community outreach events, seminars, and screenings focused on improving maternal health outcomes in rural regions. Organized in partnership with regional health bureaus.",
    date: "2025-09-10",
    location: "Tigray Region, Ethiopia",
    imageUrl: "/images/events/event1.jpg",
  },
  {
    title: "Digital Health Policy Roundtable",
    slug: "digital-health-policy-roundtable",
    description:
      "A closed-door policy roundtable bringing together government officials, researchers, and NGOs to evaluate Ethiopia’s digital health roadmap and recommend scalable implementation strategies.",
    date: "2025-10-01",
    location: "Bahir Dar, Ethiopia",
    imageUrl: "/images/events/event2.jpg",
  },
];
