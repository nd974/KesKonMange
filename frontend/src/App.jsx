import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";

import Login from "./pages/Login";
import ProfileSelect from "./pages/ProfileSelect";
import Dashboard from "./pages/Dashboard";
import Recipes from "./pages/Recipes";
import Calendar from "./pages/Calendar";
import Stock from "./pages/Stock";
import ShoppingList from "./pages/ShoppingList";

import RecipeDetail from "./pages/RecipeDetails";
import RecipeAdd from "./pages/RecipeAdd";

import MobileNav from "./components/MobileNav";

import {refreshHomeId } from "../session";

function AppRoutes() {
  const location = useLocation();
  const navigate = useNavigate();

  const hideMobileNav = ["/login", "/profiles"].includes(location.pathname);

  const [home_id, setHomeId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [serverError, setServerError] = useState(false);

  const isLocal = window.location.hostname === "localhost";

  async function checkBackend() {
    try {
      const res = await fetch("https://keskonmange.onrender.com/home/homes-get/1");
      return res.ok;
    } catch {
      return false;
    }
  }

  useEffect(() => {
    async function init() {
      const backendOK = await checkBackend();

      if (!backendOK) {
        setServerError(true);
        return;
      }

      async function loadHome() {
        const currentHomeId = await refreshHomeId();
        setHomeId(currentHomeId);

        const profileId = localStorage.getItem("profile_id");

        if (!currentHomeId && location.pathname !== "/login") {
          navigate("/login", { replace: true });
        } else if (currentHomeId && !profileId && location.pathname !== "/profiles") {
          navigate("/profiles", { replace: true });
        }

        setIsLoading(false);
      }

      await loadHome();
    }

    init();
  }, [location.pathname, navigate]);

  // ❗ N'afficher l'erreur QUE si on n'est PAS en local
  if (serverError && !isLocal) {
    return (
      <div className="flex flex-col justify-center items-center h-screen text-center">
        <h1 className="text-3xl font-bold mb-4">🚨 Serveur indisponible</h1>
        <p className="text-lg text-gray-600">Notre service est temporairement hors-ligne.</p>
        <p className="text-lg text-gray-600">Veuillez réessayer dans quelques minutes.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <>
      <div lang="fr" translate="no" className={hideMobileNav ? "" : "pb-12 md:pb-0"}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/profiles" element={<ProfileSelect key={home_id} homeId={home_id} />} />
          <Route path="/" element={<Dashboard key={home_id} homeId={home_id} />} />
          <Route path="/recipes" element={<Recipes key={home_id} homeId={home_id} />} />
          <Route path="/calendar" element={<Calendar key={home_id} homeId={home_id} />} />
          <Route path="/stock" element={<Stock key={home_id} homeId={home_id} />} />
          <Route path="/shopping_list" element={<ShoppingList key={home_id} homeId={home_id} />} />
          <Route path="/recipe/:id" element={<RecipeDetail key={home_id} homeId={home_id} />} />
          <Route path="/recipe/add" element={<RecipeAdd key={home_id} homeId={home_id} />} />
          <Route path="/recipe/edit/:recipe_id" element={<RecipeAdd key={home_id} homeId={home_id} />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

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
