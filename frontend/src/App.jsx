import { useEffect, useState } from "react";
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

import RecipeDetail from "./pages/RecipeDetails";
import RecipeAdd from "./pages/RecipeAdd";

import MobileNav from "./components/MobileNav";

import {refreshHomeId, refreshProfileId } from "../session";

function AppRoutes() {
  const location = useLocation();
  const navigate = useNavigate();

  const hideMobileNav =
    location.pathname === "/login" ||
    location.pathname === "/profiles" ||
    location.pathname.startsWith("/settings");
    
  const [home_id, setHomeId] = useState(null);
  const [profile_id, setProfileId] = useState(null);

  const [isLoading, setIsLoading] = useState(true);

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
          <Route path="/" element={<Dashboard key={home_id} homeId={home_id} profileId={profile_id} />} />
          <Route path="/recipes" element={<Recipes key={home_id} homeId={home_id} />} />
          <Route path="/calendar" element={<Calendar key={home_id} homeId={home_id} />} />
          <Route path="/stock" element={<Stock key={home_id} homeId={home_id} />} />
          <Route path="/shopping_list" element={<ShoppingList key={home_id} homeId={home_id}/>} />

          <Route path="/recipe/:id" element={<RecipeDetail key={home_id} homeId={home_id} profileId={profile_id} />} />

          <Route path="/recipe/add" element={<RecipeAdd key={home_id} homeId={home_id} />} />
          <Route path="/recipe/edit/:recipe_id" element={<RecipeAdd key={home_id} homeId={home_id} />} />

          
          <Route path="/shops" element={<TestMap key={home_id} homeId={home_id} profileId={profile_id}/>} />


          <Route path="/settings" element={<Account key={home_id} homeId={home_id} profileId={profile_id}/>} />
          <Route path="/settings/security" element={<Security key={home_id} homeId={home_id} profileId={profile_id}/>} />
          {/* <Route path="/account" element={<Account key={home_id} homeId={home_id} profileId={profile_id}/>} />
          <Route path="/account" element={<Account key={home_id} homeId={home_id} profileId={profile_id}/>} /> */}


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
