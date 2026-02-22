import { useRef, useState } from "react";
import { CLOUDINARY_RECETTE_NOTFOUND, CLOUDINARY_RES } from "../config/constants";

export default function AvatarRow({
  title,
  avatars,
  selectedAvatar,
  onSelect,
  profileId,
}) {
  const rowRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const fileInputRef = useRef(null);

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

  console.log("selectedAvatar in AvatarRow:", selectedAvatar);
  console.log("Personnel avatar:", `${CLOUDINARY_RES}profile_avatar_${profileId}?t=${Date.now()}`)

  return (
    <div className={`relative ${title === "Upload" ? "-mb-6" : "mb-8"}`}>
      <div className="flex items-center justify-left gap-2 mb-4">
        <h3 className="text-lg font-semibold">
          {title === "Upload" ? "" : title}
        </h3>

        {title === "Upload" && (
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-sm p-2 bg-accentGreen text-white rounded-lg shadow hover:bg-green-700 transition duration-200"
            >
              ⬇️ Importer un avatar personnalisé
            </button>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={(e) => {
                const file = e.target.files[0];
                if (!file) return;

                if (!file.type.startsWith("image/")) {
                  alert("Veuillez sélectionner une image valide");
                  return;
                }

                onSelect(file); // 🔥 On envoie le File au parent
                e.target.value = ""; // reset pour pouvoir re-upload la même image
              }}
            />
          </div>
        )}

      </div>


      <div className="relative">
        {/* Bouton < */}
        {canScrollLeft && avatars.length > 4 && (
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
          {
            avatars.map((avatar, index) => (
              <button
                key={`${avatar}-${index}`}
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
            ))
          }
        </div>



        {/* Bouton > */}
        {canScrollRight && avatars.length > 4 &&(
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
