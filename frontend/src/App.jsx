import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";

import Login from "./pages/onboarding/Login";
import ProfileSelect from "./pages/onboarding/ProfileSelect";


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

import OldRecipeDetail from "./pages/OldRecipeDetails";
import RecipeAdd from "./pages/RecipeAdd";

import MobileNav from "./components/MobileNav";

import {refreshHomeId, refreshProfileId } from "../session";


import Header from "./components/Header";
import Footer from "./components/Footer";


import NewRecipeDetail from "./pages/TMP/NewRecipeDetail";

import Notifications from "./pages/Notifications";


import UnusedIngredients from "./pages/utils/UnusedIngredients";

import { Toaster } from "react-hot-toast";

import "./lib/dayjs";

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
  
  async function fetchWithAuth(url, options = {}) {
    const res = await fetch(url, {
      ...options,
      credentials: "include", // pour envoyer les cookies si JWT dans cookie
    });

    if (res.status === 401) {
      // Session invalide → reset IndexedDB et redirection
      await setProfileId(0);
      navigate("/profiles");
      return null;
    }

    return res.json();
  }

  useEffect(() => {
    async function verifySession() {
      if (!home_id || !profile_id) return;

      // attend que le cookie soit réellement attaché
      await new Promise(r => setTimeout(r, 200));

      try {
        const data = await fetchWithAuth(`${API_URL}/sessions/get/${profile_id}`);
        if (!data) return; // 401 déjà géré dans fetchWithAuth
      } catch (err) {
        console.error("Session invalide:", err);
      }
    }
    verifySession();
  }, [home_id, profile_id]);




  // const menu_add = {id:1, datetime:"31/01/2026", tag_id:"Brunch"};//Table Menu

  // Table profiles_notifications(id, profile_id, subject, date_create, read, link, home_id)
  // const [notifications, setNotifications] = useState([
  //     {
  //       id: 1,
  //       subject: `Nouveau menu – ${menu_add.datetime} [${menu_add.tag_id}]`,
  //       date: "31/12/2025",
  //       to_home: {id:6, name:"Andre Malraux", email:"admin@gmail.com"},
  //       to_profile: {id:5, username:"nd974", name:"Nicolas"},
  //       read: false,
  //       body: `Bonjour,

  // Un nouveau menu a été proposé pour le brunch du 31/01/2026.

  // Merci de confirmer votre participation.`,
  //       actions: [
  //         { label: "✅ Accepter", type: "accept" },
  //         { label: "❌ Refuser", type: "reject" }
  //       ],
  //       link: "/calendar/2025-12-31"
  //     },
  //     {
  //       id: 2,
  //       subject: `Inscription - ${menu_add.datetime} [${menu_add.tag_id}]`,
  //       to: {id:6, name:"Andre Malraux", email:"admin@gmail.com"},
  //       date: "30/12/2025",
  //       read: true,
  //       body: "Nicolas s'est inscrit à l'événement Brunch.",
  //     },    
  //   ]);

  // ✅ TEST DB
  useEffect(() => {
    async function testDB() {
      try {
        const res = await fetch(`${API_URL}/home/testDB`);
        if (!res.ok) throw new Error("API error");
        await res.json();
        setDbStatus("ok");
      } catch (e) {
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

  useEffect(() => {
    const needReload = sessionStorage.getItem("firstLoginReload");

    if (needReload) {
      sessionStorage.removeItem("firstLoginReload");
      window.location.reload();
    }
  }, []);


  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!home_id || !profile_id) return;

    async function loadNotifications() {
      try {
        const res = await fetch(
          `${API_URL}/notifications/get?home_id=${home_id}&profile_id=${profile_id}`
        );

        if (!res.ok) throw new Error("API error");

        const data = await res.json();
        setNotifications(data);
      } catch (err) {
        console.error("Erreur chargement notifications:", err);
      }
    }

    loadNotifications();
  }, [home_id, profile_id]);


  console.log(notifications);

  const unreadCountNotif = notifications.filter(n => !n.read).length;




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
                unreadCountNotif={unreadCountNotif}
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

            <Route path="/recipe/:id" element={<NewRecipeDetail key={home_id} homeId={home_id} profileId={profile_id} />} />
            <Route path="/recipe/add" element={<RecipeAdd key={home_id} homeId={home_id} profileId={profile_id}/>} />
            <Route path="/recipe/edit/:recipe_id" element={<RecipeAdd key={home_id} homeId={home_id} />} />



            <Route path="/settings" element={<Account key={home_id} homeId={home_id} profileId={profile_id} />} />
            <Route path="/settings/user" element={<User key={home_id} homeId={home_id} profileId={profile_id} />} />
            <Route path="/settings/security" element={<Security key={home_id} homeId={home_id} profileId={profile_id} />} />
            <Route path="/settings/homes" element={<Homes key={home_id} homeId={home_id} profileId={profile_id} />} />

            <Route path="/notifications" element={<Notifications key={home_id} homeId={home_id} notifications={notifications} setNotifications={setNotifications}/>} />

            <Route path="/settings/termsofuse" element={<TermsOfUse />} />

            <Route path="/old_recipe_details" element={<OldRecipeDetail key={home_id} homeId={home_id} profileId={profile_id} />} />
            <Route path="/shops" element={<TestMap key={home_id} homeId={home_id} profileId={profile_id} />} />


            <Route path="/utils/unusedIngredients" element={<UnusedIngredients key={home_id} homeId={home_id} profileId={profile_id}  />} />

            <Route path="*" element={<Navigate to="/" replace />} />


            

          </Routes>


          <Toaster position="top-center" toastOptions={{ duration: 1500}}/>
        </div>
      </div>

      {/* FOOTER */}
      {/* <div className="print:hidden"><Footer/></div> */}
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
