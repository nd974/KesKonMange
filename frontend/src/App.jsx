import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import Login from "./pages/Login";
import ProfileSelect from "./pages/ProfileSelect";
import Dashboard from "./pages/Dashboard";

function AppRoutes() {
  return (
    <>
      <div>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/profiles" element={<ProfileSelect />} />
          <Route path="/" element={<Dashboard />} />
        </Routes>
      </div>
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
