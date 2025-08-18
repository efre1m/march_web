import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./assets/styles/main.css";
import { AuthProvider } from "./contexts/AuthContext"; // ✅ import it here

const rootElement = document.getElementById("root") as HTMLElement;

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <AuthProvider>
      {" "}
      {/* ✅ Wrap globally */}
      <App />
    </AuthProvider>
  </React.StrictMode>
);
