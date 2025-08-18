import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Vacancies from "./pages/Vacancies";
import Projects from "./pages/Projects";
import NewsPage from "./pages/NewsPage";
import SingleNewsPage from "./pages/SingleNewsPage";
import EventsPage from "./pages/EventsPage";
import ScrollToTop from "./components/ScrollToTop";
import Apply from "./pages/Apply";
import Publications from "./pages/Publications";
import Admin from "./pages/admin/Admin";
import Login from "./pages/admin/Login";
import PrivateRoute from "./routes/PrivateRoutes"; // ✅ for protection
import ResetPassword from "./pages/admin/ResetPassword";

const App: React.FC = () => {
  return (
    <Router>
      <ScrollToTop />
      <div className="app">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/NewsPage" element={<NewsPage />} />
          <Route path="/news/:id" element={<SingleNewsPage />} />
          <Route path="/EventsPage" element={<EventsPage />} />
          <Route path="/about" element={<About />} />
          <Route path="/vacancies" element={<Vacancies />} />
          <Route path="/apply" element={<Apply />} />
          <Route path="/Projects" element={<Projects />} />
          <Route path="/Publications" element={<Publications />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route
            path="/admin"
            element={
              <PrivateRoute>
                <Admin />
              </PrivateRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
