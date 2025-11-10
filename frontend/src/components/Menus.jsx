import React, { useEffect, useState } from "react";
import dayjs from "dayjs";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function Menus({ selectedDay, setSelectedDay, onPick, onSelectMenu, homeId }) {
  const [menus, setMenus] = useState([]);
  const [currentRecipeIndex, setCurrentRecipeIndex] = useState(0);

  useEffect(() => {
    if (!homeId) return;

    const loadMenus = async () => {
      try {
        // 🔹 Appel à ton backend Node (même route que Calendar)
        const res = await fetch(`${API_URL}/menu/get-byHome?homeId=${homeId}`);
        if (!res.ok) throw new Error("Erreur lors du chargement des menus");
        const data = await res.json();

        // 🔹 On structure les menus comme dans le composant original
        const formattedMenus = data.map((m) => ({
          id: m.id,
          date: dayjs(m.date).format("YYYY-MM-DD"),
          tagName: m.tag ? m.tag.name : null,
          recipes: m.recipes || [],
        }));

        formattedMenus.sort((a, b) => dayjs(a.date).diff(dayjs(b.date)));
        setMenus(formattedMenus);
      } catch (e) {
        console.error("Erreur loadMenus:", e);
        setMenus([]);
      }
    };

    loadMenus();
  }, [homeId]);

  const handleSelectDay = (menu) => {
    setSelectedDay(dayjs(menu.date));
    setCurrentRecipeIndex(0);
    if (onSelectMenu) {
      onSelectMenu(menu);
    } else {
      onPick(menu.recipes[0]);
    }
  };

  // 🔹 Regrouper les menus par date
  const grouped = menus.reduce((acc, m) => {
    acc[m.date] = acc[m.date] || [];
    acc[m.date].push(m);
    return acc;
  }, {});

  const groups = Object.keys(grouped)
    .map((d) => ({ date: d, menus: grouped[d] }))
    .sort((a, b) => dayjs(a.date).diff(dayjs(b.date)));

  return (
    <div>
      <h3 className="text-2xl font-bold text-gray-800 mb-3">
        Menus enregistrés
      </h3>
      <div className="space-y-3">
        {groups.length === 0 && (
          <p className="text-sm text-gray-500">
            Aucun menu enregistré. Rendez-vous sur le calendrier.
          </p>
        )}
        {groups.map((g) => {
          const firstMenu = g.menus[0];
          const previewRecipe = firstMenu.recipes?.[0];
          const tagNames = g.menus.map((mm) => mm.tagName).filter(Boolean);
          return (
            <div
              key={g.date}
              className={`p-4 rounded-lg shadow-soft flex justify-between items-center cursor-pointer ${
                selectedDay?.format("YYYY-MM-DD") === g.date
                  ? "bg-accentGreen text-white"
                  : "bg-white/80"
              }`}
              onClick={() => {
                setSelectedDay(dayjs(g.date));
                if (onSelectMenu)
                  onSelectMenu({ date: g.date, menus: g.menus, tagName: g.tagName });
              }}
            >
              <div>
                <div className="font-semibold text-gray-800">
                  {dayjs(g.date).format("ddd D MMM")}
                </div>
                <div className="text-sm opacity-80">
                  {previewRecipe?.name || "—"}
                </div>
              </div>

              <div
                className={`text-right ${
                  selectedDay?.format("YYYY-MM-DD") === g.date
                    ? "bg-accentGreen text-white"
                    : "bg-white/80"
                }`}
              >
                {g.menus.length} 🍽️
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
