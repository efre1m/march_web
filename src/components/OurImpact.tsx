import {
  FaHeartbeat,
  FaGlobe,
  FaChartLine,
  FaHandsHelping,
} from "react-icons/fa";
import "./OurImpact.css";

const impacts = [
  {
    icon: <FaHeartbeat />,
    value: "75%",
    title: "Improved Maternal Survival",
    description:
      "Contributed to a 75% increase in maternal survival rates in partner regions through research-driven interventions.",
  },
  {
    icon: <FaGlobe />,
    value: "50+",
    title: "Countries Impacted",
    description:
      "Expanded our healthcare programs across more than 50 countries, reaching millions of mothers and newborns.",
  },
  {
    icon: <FaChartLine />,
    value: "30%",
    title: "Reduction in Neonatal Mortality",
    description:
      "Achieved a 30% reduction in neonatal deaths by implementing data-driven healthcare strategies.",
  },
  {
    icon: <FaHandsHelping />,
    value: "1000+",
    title: "Healthcare Workers Trained",
    description:
      "Trained over 1,000 healthcare professionals in advanced maternal and child health practices and digital tools.",
  },
];

const OurImpact = () => {
  return (
    <section className="impact-section" aria-label="Our Impact">
      <h2 className="impact-title">Our Impact</h2>
      <div className="impact-grid">
        {impacts.map((impact, index) => (
          <div key={index} className="impact-card" tabIndex={0}>
            <div className="impact-icon">{impact.icon}</div>
            <p className="impact-value">{impact.value}</p>
            <h3 className="impact-title-small">{impact.title}</h3>
            <p className="impact-description">{impact.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default OurImpact;
