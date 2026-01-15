import { useNavigate } from "react-router-dom";
import { CLOUDINARY_RES, CLOUDINARY_RECETTE_NOTFOUND } from "../../config/constants";

export default function ModalIngredientsList({ ingredients }) {
  const navigate = useNavigate();

  const formatNumber = (num) => {
    if (num === null || num === undefined) return "";
    const n = Number(num);
    if (isNaN(n)) return "";
    return n % 1 === 0 ? n : parseFloat(n.toFixed(2));
  };

  const formatAmountWithUnit = (amount, unit) => {
    if (!amount && amount !== 0) return "";
    const formattedAmount = formatNumber(amount);
    if (!unit) return formattedAmount;
    return unit.length < 3 ? `${formattedAmount}${unit}` : `${formattedAmount} ${unit}`;
  };

  return (
    <div className="rounded-3xl p-4 flex flex-col overflow-hidden shadow-lg bg-gray-100 max-h-[55vh] sm:max-h-none sm:h-full">
      <h2 className="font-bold text-lg mb-2">Ingrédients</h2>

      <div className="overflow-y-auto flex-1 thin-scrollbar">
        <ul className="space-y-4">
          {ingredients.map((ingredient) => (
            <li
              key={ingredient.id}
              onClick={() => {
                if (ingredient.recipe_id) {
                  navigate(`/recipe/${ingredient.recipe_id}`);
                } else {
                  navigate(`/ingredients?ingredient=${ingredient.id}`);
                }
              }}
              className="flex gap-4 items-center cursor-pointer hover:bg-gray-200 rounded-xl p-2 transition"
            >
              <img
                src={`${CLOUDINARY_RES}${ingredient.picture || CLOUDINARY_RECETTE_NOTFOUND}`}
                alt={ingredient.name}
                className={`w-12 h-12 object-cover flex-shrink-0 ${ingredient.recipe_id ? "rounded-2xl" : ""}`}
                
              />
              <span>
                  {formatAmountWithUnit(ingredient.amount, ingredient.unit)}
                  {ingredient.amount_item && ingredient.unit_item ? ` [${formatAmountWithUnit(ingredient.amount_item, ingredient.unit_item)}] de ` : " "}
                  {ingredient.name}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
