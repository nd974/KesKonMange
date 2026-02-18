import { useRef, useState } from "react";
import { CLOUDINARY_RES } from "../config/constants";

export default function AvatarRow({
  title,
  avatars,
  selectedAvatar,
  onSelect,
}) {
  const rowRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollButtons = () => {
    const el = rowRef.current;
    if (!el) return;

    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(
      el.scrollLeft + el.clientWidth < el.scrollWidth
    );
  };

  const scroll = (direction) => {
    rowRef.current.scrollBy({
      left: direction * 240,
      behavior: "smooth",
    });

    // léger délai pour recalculer après le scroll
    setTimeout(updateScrollButtons, 300);
  };

  return (
    <div className="relative mb-8">
      <div className="flex items-center justify-left gap-2 mb-4">
        <h3 className="text-lg font-semibold">
          {title}
        </h3>

        {title === "Personnel" && (
          <button
            onClick={() => alert("Fonctionnalité à venir !")}
            className="text-sm p-2 bg-accentGreen text-white rounded-lg shadow hover:bg-green-700 transition duration-200"
          >
            Upload
          </button>
        )}
      </div>


      <div className="relative">
        {/* Bouton < */}
        {canScrollLeft && avatars.length > 1 && (
          <button
            onClick={() => scroll(-1)}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 backdrop-blur border rounded-full w-8 h-8 flex items-center justify-center shadow"
          >
            ‹
          </button>
        )}

        {/* Avatars */}
        <div
        ref={rowRef}
        onScroll={updateScrollButtons}
        className={`flex gap-4 overflow-x-hidden transition-all ${
            canScrollLeft ? "pl-10" : "pl-0"
        } ${canScrollRight ? "pr-10" : "pr-0"}`}
        >
          {avatars.map((avatar) => (
            <button
              key={avatar}
              onClick={() => onSelect(avatar)}
              className={`min-w-[80px] h-[80px] rounded overflow-hidden border-2 transition ${
                selectedAvatar === avatar
                  ? "border-accentGreen p-1"
                  : "border-transparent hover:border-gray-300"
              }`}
            >
              <img
                src={`${CLOUDINARY_RES}${avatar}`}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>

        {/* Bouton > */}
        {canScrollRight && avatars.length > 1 &&(
          <button
            onClick={() => scroll(1)}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 backdrop-blur border rounded-full w-8 h-8 flex items-center justify-center shadow"
          >
            ›
          </button>
        )}
      </div>
    </div>
  );
}
