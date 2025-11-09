import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import Login from "./pages/Login";
import ProfileSelect from "./pages/ProfileSelect";


function AppRoutes() {
  return (
    <>
      <div>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/profiles" element={<ProfileSelect />} />
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
