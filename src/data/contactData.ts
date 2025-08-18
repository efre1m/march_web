// src/data/contactData.ts
import { FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import type { IconType } from 'react-icons';

export interface ContactMethod {
  icon: IconType;
  title: string;
  value: string;
  link: string;
}

export const contactMethods: ContactMethod[] = [
  {
    icon: FiMail,
    title: "Email",
    value: "info@march.org",
    link: "mailto:info@march.org"
  },
  {
    icon: FiPhone,
    title: "Phone",
    value: "+251 123 456 789",
    link: "tel:+251123456789"
  },
  {
    icon: FiMapPin,
    title: "Address",
    value: "Mekelle, Ethiopia",
    link: "https://maps.google.com"
  }
];