import React, { useEffect, useState } from "react";
import dayjs from "dayjs";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

import { CLOUDINARY_RES, CLOUDINARY_ICONS } from "../config/constants";

export default function Menus({
  selectedDay,
  setSelectedDay,
  onPick,
  onSelectMenu,
  homeId,
}) {
  const [menus, setMenus] = useState([]);

  const GAP_CARD = 20; // Espace entre les cartes en pixels

  useEffect(() => {
    if (!homeId) return;

    const loadMenus = async () => {
      try {
        const res = await fetch(
          `${API_URL}/menu/get-byHome?homeId=${homeId}`
        );
        if (!res.ok) throw new Error("Erreur chargement menus");
        const data = await res.json();

        const formatted = data
          .map((m) => ({
            id: m.id,
            date: dayjs(m.date).format("YYYY-MM-DD"),
            tagName: m.tag ? m.tag.name : null,
            recipes: m.recipes || [],
          }))
          .sort((a, b) => dayjs(a.date).diff(dayjs(b.date)));

        setMenus(formatted);
      } catch (e) {
        console.error(e);
        setMenus([]);
      }
    };

    loadMenus();
  }, [homeId]);

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
      <h3 className="text-2xl font-bold text-gray-800 flex items-center">
        <img
          src={`${CLOUDINARY_RES}${CLOUDINARY_ICONS["Icon_Menu"]}`}
          alt="Menu Icon"
          className="w-6 h-6 inline-block mr-2"
        />
        Menus enregistrés
      </h3>
      
      <div className="flex gap-0 overflow-x-auto scroll-smooth mt-3 relative px-5">
        {groups.map((g, index) => {
          const isSelected = selectedDay?.format("YYYY-MM-DD") === g.date;
          const tags = g.menus
            .map((m) => m.tagName)
            .filter(Boolean);

          return (
            <div
              key={g.date}
              onClick={() => {
                setSelectedDay(dayjs(g.date));
                onSelectMenu?.({ date: g.date, menus: g.menus });
              }}
              className={`min-w-[150px] cursor-pointer transition-transform duration-300 py-5 relative z-${index}`}
              style={{
                // Combine les deux transforms
                marginLeft: index === 0 ? 0 : isSelected ? -GAP_CARD : -GAP_CARD,
                transform: isSelected ? "scale(1.1) translateY(-10px)" : "scale(1)", // Gestion de l'effet de superposition et de l'élévation
                zIndex: isSelected ? GAP_CARD : groups.length - index, // Assurer un z-index plus élevé pour les cartes à gauche
              }}
            >
              {/* VRAIE CARTE */}
              <div className="rounded-tl-2xl rounded-bl-2xl rounded-br-2xl">
                {/* BANDEAU HAUT (Top Bandeau) */}
                <div className="flex rounded-tl-2xl rounded-tr-2xl text-center">
                  <div
                    className={`w-2/4 px-2 py-2 text-sm font-semibold rounded-tl-2xl rounded-tr-2xl ${
                      isSelected ? "bg-accentGreen" : "bg-softBeige"
                    }`}
                  >
                    {dayjs(g.date).format("ddd D")}
                  </div>
                  {/* Section sans fond ici */}
                  <div className="w-2/4 bg-transparent" />
                </div>

                {/* CONTENU (Content) */}
                <div
                  className={`h-[150px] shadow-soft p-3 rounded-tr-2xl rounded-bl-2xl rounded-br-2xl ${
                    isSelected ? "bg-accentGreen" : "bg-softBeige"
                  }`}
                >
                  <div className="text-lg font-bold mb-4">Menu</div> {/* Marge réduite ici */}

                  <div className="absolute bottom-[35px] left-3 flex items-center gap-2">
  {/* Affichage des tags visibles */}
  {tags.length > 0 &&
    tags.slice(0, 1).map((tag, index) => (
      <span
        key={index}
        className={`px-2 py-1 rounded-full text-sm ${
          isSelected
            ? "bg-[#dfffcf] text-black"
            : "bg-[#b9b9b9] text-[#b9b9b9]"
        }`}
      >
        {tag}
      </span>
    ))}

  {/* Affichage du "+X" si des tags restent */}
  {tags.length > 1 && (
    <span
      className={`px-2 py-1 rounded-full text-sm cursor-pointer ${
        isSelected
          ? "bg-[#dfffcf] text-black"
          : "bg-[#b9b9b9] text-[#b9b9b9]"
      }`}
    >
      +{tags.length - 1}
    </span>
  )}
</div>

                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
