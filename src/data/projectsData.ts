// projectsData.ts
import {
  AiOutlineRobot,
  AiFillMobile,
  AiOutlineFundProjectionScreen,
} from "react-icons/ai";
import { MdDashboard } from "react-icons/md";

export type ProjectStatus = "completed" | "ongoing";

export interface Project {
  icon: React.ComponentType;
  title: string;
  summary: string;
  details: string;
  status: ProjectStatus;
}

export const projects: Project[] = [
  {
    icon: AiOutlineRobot,
    title: "AI Diagnosis Engine",
    summary:
      "A powerful diagnostic assistant to help midwives detect maternal complications early using AI-driven analysis.",
    details:
      "This tool utilizes machine learning models trained on thousands of maternal health records. It enables healthcare workers in remote locations to perform risk assessments and receive diagnostic suggestions instantly — even without internet access.",
    status: "completed",
  },
  {
    icon: AiFillMobile,
    title: "MamaCare App",
    summary:
      "A mobile platform offering personalized maternal health guidance and reminders in real-time.",
    details:
      "The MamaCare app delivers customized alerts, prenatal care checklists, and emergency information to expecting mothers in their local language. Integrated with national health data, it’s a bridge between care and communities.",
    status: "ongoing",
  },
  {
    icon: MdDashboard,
    title: "Clinic Dashboard",
    summary:
      "A centralized dashboard to connect rural health posts with hospitals, improving response times and coordination.",
    details:
      "With real-time patient flow data and alerts, this system empowers health administrators and field officers to make informed decisions, track clinic capacity, and ensure swift maternal care interventions.",
    status: "ongoing",
  },
  {
    icon: AiOutlineFundProjectionScreen,
    title: "Global Data Lab",
    summary:
      "An advanced analytics engine monitoring maternal health trends across over 50 countries.",
    details:
      "This platform collects, visualizes, and interprets global maternal health data, supporting policymakers and researchers with actionable insights to drive equity, funding, and targeted health interventions.",
    status: "completed",
  },
];
