import React from "react";
import dayjs from "dayjs";
import { useMenusByHome } from "../hooks/useMenu";
import { useEffect } from "react";

import { CLOUDINARY_RES, CLOUDINARY_ICONS } from "../config/constants";

export default function Menus({
  selectedDay,
  setSelectedDay,
  onPick,
  onSelectMenu,
  homeId,
}) {

  const GAP_CARD = 20;

  const RecipesLink = () => (
    <a href="/recipes" className="text-green-600 underline hover:text-green-800">
      Recettes(📝)
    </a>
  );

  const CalendarLink = () => (
    <a href="/calendar" className="text-green-600 underline hover:text-green-800">
      Calendrier
    </a>
  );

  const { data: menus = [], isLoading } = useMenusByHome(homeId);

  const grouped = menus.reduce((acc, m) => {
    acc[m.date] = acc[m.date] || [];
    acc[m.date].push(m);
    return acc;
  }, {});

  const groups = Object.keys(grouped)
    .map((d) => ({ date: d, menus: grouped[d] }))
    .sort((a, b) => dayjs(a.date).diff(dayjs(b.date)));

  useEffect(() => {
    if (!selectedDay || !groups.length) return;

    const group = groups.find(g =>
      dayjs(g.date).isSame(selectedDay, "day")
    );

    if (group) {
      onSelectMenu?.(group); // on laisse le Dashboard gérer si ça doit setter
    }
  }, [selectedDay, groups, onSelectMenu]);


  if (isLoading) {
    return (
      <>
        <h3 className="text-2xl font-bold text-gray-800 flex items-center -mt-1">
          <img
            src={`${CLOUDINARY_RES}${CLOUDINARY_ICONS["Icon_Menu"]}`}
            alt="Menu Icon"
            className="w-6 h-6 inline-block mr-2"
          />
          Menus enregistrés
        </h3>

        <div className="ml-5 mb-5 mt-10 p-5 border-2 border-dashed border-gray-400 rounded text-center text-gray-500 h-[20vh] flex flex-col items-center justify-center gap-2">
          <div>Chargement ...</div>
        </div>
      </>
    );
  }

  return (
    <div>
      <h3 className="text-2xl font-bold text-gray-800 flex items-center -mt-1">
        <img
          src={`${CLOUDINARY_RES}${CLOUDINARY_ICONS["Icon_Menu"]}`}
          alt="Menu Icon"
          className="w-6 h-6 inline-block mr-2"
        />
        Menus enregistrés
      </h3>

      {groups.length === 0 ? (
        <div className="sm:mb-5 ml-5 mt-10 border-2 border-dashed border-gray-400 rounded text-center text-gray-500 h-[20vh] flex flex-col items-center justify-center gap-2">
          <div>Aucun menu enregistré</div>
          <div>
            Création dans <CalendarLink /> ou <RecipesLink />
          </div>
        </div>
      ) : (
        <div className="flex gap-0 overflow-x-auto scroll-smooth mt-5 relative px-5">
          {groups.map((g, index) => {
            const isSelected =
              selectedDay?.format("YYYY-MM-DD") === g.date;

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
                className="min-w-[150px] cursor-pointer transition-transform duration-300 py-5 relative"
                style={{
                  marginLeft: index === 0 ? 0 : -GAP_CARD,
                  transform: isSelected
                    ? "scale(1.1) translateY(-10px)"
                    : "scale(1)",
                  zIndex: isSelected ? GAP_CARD : groups.length - index,
                }}
              >
                {/* CARTE */}
                <div className="rounded-tl-2xl rounded-bl-2xl rounded-br-2xl">
                  <div className="flex rounded-tl-2xl rounded-tr-2xl text-center">
                    <div
                      className={`w-2/4 px-2 py-2 text-sm font-semibold rounded-tl-2xl rounded-tr-2xl ${
                        isSelected ? "bg-accentGreen" : "bg-softBeige"
                      }`}
                    >
                      {dayjs(g.date).format("ddd D")}
                    </div>
                    <div className="w-2/4 bg-transparent" />
                  </div>

                  <div
                    className={`h-[150px] shadow-soft p-3 rounded-tr-2xl rounded-bl-2xl rounded-br-2xl ${
                      isSelected ? "bg-accentGreen" : "bg-softBeige"
                    }`}
                  >
                    <div className="text-lg font-bold mb-4">Menu</div>

                    <div className="absolute bottom-[35px] left-3 flex items-center gap-2">
                      {tags.slice(0, 1).map((tag, i) => (
                        <span
                          key={i}
                          className={`px-2 py-1 rounded-full text-sm ${
                            isSelected
                              ? "bg-[#dfffcf] text-black"
                              : "bg-[#b9b9b9] text-[#b9b9b9]"
                          }`}
                        >
                          {tag}
                        </span>
                      ))}

                      {tags.length > 1 && (
                        <div className="relative group">
                          <span
                            className={`px-2 py-1 rounded-full text-sm cursor-pointer ${
                              isSelected
                                ? "bg-[#dfffcf] text-black"
                                : "bg-[#b9b9b9] text-[#b9b9b9]"
                            }`}
                          >
                            +{tags.length - 1}
                          </span>
                          <div className="absolute left-1/2 -translate-x-1/2 mt-1 w-max bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            {tags.slice(1).join(" / ")}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
