// UstensilesList.jsx
import { CLOUDINARY_RES, CLOUDINARY_RECETTE_NOTFOUND } from "../../config/constants";

export default function ModalUstensilesList({ utensils }) {
  return (
    <div className="rounded-3xl p-4 flex flex-col overflow-hidden shadow-lg bg-gray-100 max-h-[55vh] sm:max-h-none sm:h-full">
      <h2 className="font-bold text-lg mb-2">Ustensiles</h2>
      <div className="overflow-y-auto flex-1 thin-scrollbar">
        <div className="grid grid-cols-2 gap-4 justify-items-center">
          {utensils.map((utensil, index) => (
            <div 
              key={index} 
              className="flex flex-col items-center justify-center text-center"
            >
              <img 
                src={`${CLOUDINARY_RES}${utensil.picture || CLOUDINARY_RECETTE_NOTFOUND}`}
                alt={utensil.name} 
                className="w-12 h-12 object-cover" 
              />
              <span>{utensil.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
