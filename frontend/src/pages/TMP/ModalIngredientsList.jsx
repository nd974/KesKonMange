// IngredientsList.jsx
export default function ModalIngredientsList({ ingredients, img }) {
    console.log(ingredients);
  return (
    <div className="rounded-3xl p-4 flex flex-col overflow-hidden shadow-lg bg-gray-100">
      <h2 className="font-bold text-lg mb-2">Ingrédients</h2>
      <div className="overflow-y-auto h-[calc(40vh-40px)] thin-scrollbar">
        <ul className="space-y-4">
          {ingredients.map((ingredient, index) => (
            <li key={index} className="flex gap-4 items-center">
              <img 
                src={img}
                alt={ingredient.name} 
                className="w-10 h-10 object-cover flex-shrink-0" 
              />
              <div className="flex flex-col">
                <span>
                  {ingredient.qte} {ingredient.unit ? ingredient.unit : ""} 
                  {ingredient.qte_item && ingredient.unit_item ? ` [${ingredient.qte_item}${ingredient.unit_item}] de ` : " "} 
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
