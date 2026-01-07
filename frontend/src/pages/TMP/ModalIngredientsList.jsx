// IngredientsList.jsx
import { CLOUDINARY_RES, CLOUDINARY_RECETTE_NOTFOUND } from "../../config/constants";


export default function ModalIngredientsList({ ingredients }) {

  // Supprime les zéros inutiles
  const formatNumber = (num) => {
    if (num === null || num === undefined) return "";
    const n = Number(num); // convertit en nombre
    if (isNaN(n)) return ""; // si ce n'est pas un nombre, retourne vide
    return n % 1 === 0 ? n : parseFloat(n.toFixed(2)); // entier → 6, décimal → 6.5
  };

  // Met le nombre et l'unité ensemble correctement
  const formatAmountWithUnit = (amount, unit) => {
    if (!amount && amount !== 0) return "";
    const formattedAmount = formatNumber(amount);
    if (!unit) return formattedAmount;
    return unit.length < 3 ? `${formattedAmount}${unit}` : `${formattedAmount} ${unit}`;
  };

  return (
    <div className="rounded-3xl p-4 flex flex-col overflow-hidden shadow-lg bg-gray-100">
      <h2 className="font-bold text-lg mb-2">Ingrédients</h2>
      <div className="overflow-y-auto h-[calc(40vh-40px)] thin-scrollbar">
        <ul className="space-y-4">
          {ingredients.map((ingredient, index) => (
            <li key={index} className="flex gap-4 items-center">
              <img 
                src={`${CLOUDINARY_RES}${ingredient.picture || CLOUDINARY_RECETTE_NOTFOUND}`}
                alt={ingredient.name} 
                className="w-10 h-10 object-cover flex-shrink-0" 
              />
              <div className="flex flex-col">
                <span>
                  {formatAmountWithUnit(ingredient.amount, ingredient.unit)}
                  {ingredient.amount_item && ingredient.unit_item ? ` [${formatAmountWithUnit(ingredient.amount_item, ingredient.unit_item)}] de ` : " "}
                  {ingredient.name}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
