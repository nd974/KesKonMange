import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import Header from "../components/Header";
import ModalPickRecipe from "../components/modals/ModalPickRecipes";
import isoWeek from "dayjs/plugin/isoWeek";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

dayjs.extend(isoWeek);

export default function Calendar({homeId}) {
  const today = dayjs();
  const [currentMonth, setCurrentMonth] = useState(today);
  const [selectedDay, setSelectedDay] = useState(null);
  const [menus, setMenus] = useState([]);
  // const [homeId, setHomeId] = useState(Number(localStorage.getItem("home_id")));

  // --- RELOAD MENUS DEPUIS L'API ---
  const reloadMenus = async (currentHomeId) => {
    if (!currentHomeId) return;
    try {
      const res = await fetch(`${API_URL}/menu/get-byHome?homeId=${currentHomeId}`);
      if (!res.ok) throw new Error("Erreur fetch menus");
      const data = await res.json();

      const expanded = data.map((m) => {
        const dateStr = dayjs(m.date).format("YYYY-MM-DD");
        return {
          id: `${m.id}-${m.tag ? m.tag.id : "noTag"}`,
          menuId: m.id,
          tagId: m.tag ? m.tag.id : null,
          tagName: m.tag ? m.tag.name : null,
          date: dateStr,
          recipes: m.recipes || [],
        };
      });

      setMenus(expanded);
    } catch (e) {
      console.error("Erreur reloadMenus:", e);
      setMenus([]);
    }
  };

  // --- LOAD MENUS AU CHARGEMENT ET QUAND homeId CHANGE ---
  useEffect(() => {
    if (homeId) reloadMenus(homeId);
  }, [homeId]);

  // --- SAVE MENU VIA API ---
  const saveMenu = async (date, selection) => {
    if (!selection) return;

    const dateStr = date.format("YYYY-MM-DD");
    const recipeIds = Array.isArray(selection.recipeIds) ? selection.recipeIds.map(Number) : [];
    const tagId = selection.tagId ? Number(selection.tagId) : null;

    if (recipeIds.length === 0) return alert("Aucune recette sélectionnée.");
    if (!tagId) return alert("Sélectionnez un tag.");
    if (date.isBefore(dayjs(), "day")) return alert("Impossible d'ajouter un menu pour une date passée.");
    if (!homeId) return alert("Erreur : aucun home sélectionné.");

    try {
      const resp = await fetch(`${API_URL}/menu/update-menu`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: dateStr, recipeIds, tagId, homeId }),
      });
      if (!resp.ok) throw new Error("Échec mise à jour serveur");

      // Recharge les menus depuis le serveur
      reloadMenus(homeId);
    } catch (err) {
      console.error("Erreur saveMenu:", err);
      alert("Erreur lors de la sauvegarde du menu : " + err.message);
    }
  };

  const handlePick = (selection) => {
    if (!selectedDay) return alert("Sélectionnez d'abord une date.");
    saveMenu(selectedDay, selection);
  };

  const startOfMonth = currentMonth.startOf("month");
  const startOfGrid = startOfMonth.startOf("isoWeek");
  const days = Array.from({ length: 42 }, (_, i) => startOfGrid.add(i, "day"));

  // const handleChangeHome = (newHomeId) => {
  //   localStorage.setItem("home_id", newHomeId);
  //   setHomeId(Number(newHomeId));
  // };

  return (
    <div className="">
      {/* <Header homeId={homeId}/> onChangeHome={handleChangeHome} currentHomeId={homeId} /> */}

      <div className="flex items-center justify-between py-5">
        <button onClick={() => setCurrentMonth(currentMonth.subtract(1, "month"))}>←</button>
        <div><strong><u>{currentMonth.format("MMMM YYYY").charAt(0).toUpperCase() + currentMonth.format("MMMM YYYY").slice(1)}</u></strong></div>
        <button onClick={() => setCurrentMonth(currentMonth.add(1, "month"))}>→</button>
      </div>

      <div className="grid grid-cols-7 gap-2 text-center font-medium text-gray-600 mb-2">
        {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((d) => <div key={d}>{d}</div>)}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((day, i) => {
          const dateKey = day.format("YYYY-MM-DD");
          const menusForDay = menus.filter((m) => m.date === dateKey);
          const inCurrentMonth = day.month() === currentMonth.month();
          const isPast = day.isBefore(dayjs(), "day");
          const baseBg = !inCurrentMonth ? "bg-gray-100 text-gray-400" : menusForDay.length > 0 ? "bg-softBeige" : "bg-white";

          return (
            <div
              key={i}
              onClick={() => !isPast && setSelectedDay(day)}
              className={`p-3 h-24 border rounded-lg flex flex-col justify-between ${isPast ? "opacity-60 cursor-not-allowed" : "cursor-pointer hover:shadow"} ${baseBg} ${day.isSame(today, "day") ? "border-accentGreen" : ""}`}
            >
              <div className="text-sm font-semibold">{day.format("D")}</div>

            {menusForDay.length > 0 ? (
            <div className="hidden md:block text-xs text-green-900 font-medium">
                {menusForDay.length} menu{menusForDay.length > 1 ? "s" : ""}
            </div>
            ) : (
            <div className="hidden md:block text-xs text-gray-400 italic">
                {isPast ? "Date passée" : "Ajouter un menu"}
            </div>
            )}
            </div>
          );
        })}
      </div>

      {selectedDay && (
        <ModalPickRecipe
          day={selectedDay}
          homeId={homeId}
          onPick={handlePick}
          onClose={() => setSelectedDay(null)}
        />
      )}
    </div>
  );
}
