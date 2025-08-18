// src/data/publicationsData.ts

export interface Publication {
  id: string;
  title: string;
  authors: string;
  journal: string;
  year: string;
  link: string;
}

export const publications: Publication[] = [
  {
    id: "1",
    title: "Advancements in AI for Healthcare",
    authors: "A. Tadesse, B. Mekonnen",
    journal: "Journal of Medical AI",
    year: "2024",
    link: "https://example.com/ai-healthcare-paper"
  },
  {
    id: "2",
    title: "Machine Learning for Crop Prediction in Ethiopia",
    authors: "L. Gebre, M. Abebe",
    journal: "African Journal of Agriculture",
    year: "2023",
    link: "https://example.com/crop-prediction"
  }
];
