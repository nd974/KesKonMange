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
      <h3 className="text-lg font-semibold mb-3">{title}</h3>

      <div className="relative">
        {/* Bouton < */}
        {canScrollLeft && (
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
        {canScrollRight && (
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
