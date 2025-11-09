import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import Login from "./pages/Login";
import ProfileSelect from "./pages/ProfileSelect";
import Dashboard from "./pages/Dashboard";
import Calendar from "./pages/Calendar";



import MobileNav from "./components/MobileNav";

function AppRoutes() {
  const location = useLocation();
  const hideMobileNav = ["/login", "/profiles"].includes(location.pathname);

  return (
    <>
      <div className={hideMobileNav ? "" : "pb-12 md:pb-0"}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/profiles" element={<ProfileSelect />} />
          <Route path="/" element={<Dashboard />} />
          <Route path="/calendar" element={<Calendar />} />
        </Routes>
      </div>

      {/* ✅ Affiche MobileNav sauf pour /login et /profiles */}
      {!hideMobileNav && <MobileNav />}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
