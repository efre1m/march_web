import {
  FaHeartbeat,
  FaLightbulb,
  FaBalanceScale,
  FaUsers,
} from "react-icons/fa";
import "./CoreValues.css";

const coreValues = [
  {
    icon: <FaHeartbeat />,
    title: "Compassion-Driven Care",
    description:
      "We prioritize empathy and dignity in every innovation, ensuring respectful, human-centered healthcare for mothers and children.",
  },
  {
    icon: <FaLightbulb />,
    title: "Innovation with Purpose",
    description:
      "We apply advanced digital technologies to drive meaningful improvements in maternal and child health outcomes.",
  },
  {
    icon: <FaBalanceScale />,
    title: "Equity and Access",
    description:
      "We are committed to bridging healthcare gaps and delivering inclusive solutions that reach underserved communities.",
  },
  {
    icon: <FaUsers />,
    title: "Collaborative Progress",
    description:
      "We believe sustainable impact is achieved through strong partnerships across disciplines, sectors, and geographies.",
  },
];

const CoreValues = () => {
  return (
    <section className="core-values-section">
      <h2 className="core-values-title">Our Core Values</h2>
      <div className="core-values-grid">
        {coreValues.map((value, index) => (
          <div key={index} className="core-value-card">
            <div className="core-icon">{value.icon}</div>
            <h3>{value.title}</h3>
            <p>{value.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default CoreValues;
