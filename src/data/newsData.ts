export type NewsItem = {
  title: string;
  description: string;
  date: string;
  imageUrl: string;
  slug: string; // Used for routing to individual pages
};

export const newsItems: NewsItem[] = [
  {
    title: "Maternal Mortality Drops 20%",
    slug: "maternal-mortality-drops-20",
    description:
      "The maternal mortality rate in Ethiopia has decreased by 20% due to recent healthcare reforms. These improvements include expanded access to prenatal care, better-trained community health workers, and increased investment in rural health services. This progress marks a major step forward in ensuring safer pregnancies and childbirth for women across the country.",
    date: "2025-07-03",
    imageUrl: "/images/news/adigrat.jpg",
  },
  {
    title: "DHRDC Presents at Global Health Conference",
    slug: "dhrdc-global-health-conference",
    description:
      "The Digital Health Research and Development Center (DHRDC) participated in a prestigious international health conference, presenting its latest innovations in community health monitoring. The team showcased how data-driven tools and digital solutions are being used to improve healthcare delivery and inform public health policies across the region.",
    date: "2025-06-30",
    imageUrl: "/images/news/news_selekleka.jpg",
  },
  {
    title: "New Mobile App Empowers Health Workers",
    slug: "dhrdc-mobile-health-app",
    description:
      "DHRDC has launched a new mobile application that equips community DHRDC has launched a new mobile application that equips community health workers with real-time access DHRDC has launched a new mobile application that equips community health workers with real-time access  health workers with real-time access to patient records, appointment scheduling, and vaccination tracking. The app aims to streamline healthcare service delivery in rural areas with limited infrastructure.",
    date: "2025-06-25",
    imageUrl: "/images/news/news_selekleka.jpg",
  },
  {
    title: "Digital Dashboard Tracks Maternal Care",
    slug: "dhrdc-digital-dashboard",
    description:
      "A digital dashboard developed by DHRDC is now helping health officials track maternal care data across multiple regions. The platform provides interactive visualizations of key indicators like antenatal visits, skilled birth attendance, and postpartum care.",
    date: "2025-06-18",
    imageUrl: "/images/news/adigrat.jpg",
  },
];
