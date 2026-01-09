import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";

import Login from "./pages/Login";
import ProfileSelect from "./pages/ProfileSelect";
import Dashboard from "./pages/Dashboard";
import Recipes from "./pages/Recipes";
import Calendar from "./pages/Calendar";
import Stock from "./pages/Stock";
import ShoppingList from "./pages/ShoppingList";

import TestMap from "./pages/TestMap";

import Account from "./pages/settings/Settings";
import Security from "./pages/settings/Security";
import User from "./pages/settings/User";
import Homes from "./pages/settings/Homes";

import TermsOfUse from "./pages/settings/footer/TermsOfUse";

import RecipeDetail from "./pages/RecipeDetails";
import RecipeAdd from "./pages/RecipeAdd";

import MobileNav from "./components/MobileNav";

import {refreshHomeId, refreshProfileId } from "../session";


import Header from "./components/Header";
import Footer from "./components/Footer";


import NewRecipeDetail from "./pages/TMP/NewRecipeDetail";

function AppRoutes() {
  const location = useLocation();
  const navigate = useNavigate();

  const hideMobileNav =
    location.pathname === "/login" ||
    location.pathname === "/profiles" ||
    location.pathname.startsWith("/settings");

  const pathSign =
    location.pathname === "/login" ||
    location.pathname === "/profiles";
    
  const [home_id, setHomeId] = useState(null);
  const [profile_id, setProfileId] = useState(null);

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState(null);
  const [dbStatus, setDbStatus] = useState("checking");

  // ✅ TEST DB
  useEffect(() => {
    async function testDB() {
      try {
        console.log("DB CHECK START");
        const res = await fetch(`${API_URL}/home/testDB`);

        if (!res.ok) throw new Error("API error");

        await res.json();
        console.log("DB OK");
        setDbStatus("ok");
      } catch (e) {
        console.error("DB ERROR", e);
        setDbStatus("error");
      }
    }

    testDB();
  }, []);

  useEffect(() => {
    async function loadHome() {
      // 🔹 Lis la valeur actuelle de home_id depuis IndexedDB
      const currentHomeId = await refreshHomeId();
      setHomeId(currentHomeId);

      const currentProfileId = await refreshProfileId();
      setProfileId(currentProfileId);

      if (!currentHomeId && location.pathname !== "/login") {
        navigate("/login", { replace: true });
      } else if (currentHomeId && !currentProfileId && location.pathname !== "/profiles") {
        navigate("/profiles", { replace: true });
      }
      setIsLoading(false);
    }

    loadHome();
  }, [location.pathname, navigate]);

  // ⏳ Attente test DB
  console.log("DB STATUS:", dbStatus);
  if (dbStatus === "error") {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>MAINTENANCE</p>
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
    <div
      lang="fr"
      translate="no"
      className={`min-h-screen flex flex-col ${hideMobileNav ? "" : "pb-12 md:pb-0"}`}
    >
      {/* HEADER + CONTENU */}
      <div className="flex-1">
        <div className={!pathSign ? "px-4 md:px-8 lg:px-16 py-8" : ""}>
          {!pathSign && (<div className="print:hidden">
              <Header
                homeId={home_id}
                inAccount={location.pathname.startsWith("/settings")}
              />
            </div>
          )}

          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/profiles" element={<ProfileSelect key={home_id} homeId={home_id} />} />
            <Route path="/" element={<Dashboard key={home_id} homeId={home_id} profileId={profile_id} />} />
            <Route path="/recipes" element={<Recipes key={home_id} homeId={home_id} profileId={profile_id}/>} />
            <Route path="/calendar" element={<Calendar key={home_id} homeId={home_id} profileId={profile_id}/>} />
            <Route path="/stock" element={<Stock key={home_id} homeId={home_id} />} />
            <Route path="/shopping_list" element={<ShoppingList key={home_id} homeId={home_id} />} />

            <Route path="/recipe/:id" element={<RecipeDetail key={home_id} homeId={home_id} profileId={profile_id} />} />
            <Route path="/recipe/add" element={<RecipeAdd key={home_id} homeId={home_id} profileId={profile_id}/>} />
            <Route path="/recipe/edit/:recipe_id" element={<RecipeAdd key={home_id} homeId={home_id} />} />



            <Route path="/settings" element={<Account key={home_id} homeId={home_id} profileId={profile_id} />} />
            <Route path="/settings/user" element={<User key={home_id} homeId={home_id} profileId={profile_id} />} />
            <Route path="/settings/security" element={<Security key={home_id} homeId={home_id} profileId={profile_id} />} />
            <Route path="/settings/homes" element={<Homes key={home_id} homeId={home_id} profileId={profile_id} />} />

            <Route path="/settings/termsofuse" element={<TermsOfUse />} />
            


            <Route path="/new_recipe_details/:id" element={<NewRecipeDetail key={home_id} homeId={home_id} profileId={profile_id} />} />
            <Route path="/shops" element={<TestMap key={home_id} homeId={home_id} profileId={profile_id} />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>

      {/* FOOTER */}
      {!pathSign && hideMobileNav && <div className="print:hidden"><Footer/></div>}
    </div>

    {/* MOBILE NAV */}
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
