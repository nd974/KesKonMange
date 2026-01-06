import CommentsSection from "./CommentsSection";

export default function RecipeSidebar() {
  // Variables pour Ingrédients et Ustensiles


  const ingredients = [
    { name: "Citron", qte: 1, unit: null, qte_item: null, unit_item: null },
    { name: "Sel", qte: 50, unit: "g", qte_item: null, unit_item: null },
    { name: "Bacon", qte: 1, unit: "tranche", qte_item: 150, unit_item: "g" },
        { name: "Piments", qte: 10, unit: null, qte_item: null, unit_item: null },
    { name: "Poivre", qte: 10, unit: "g", qte_item: null, unit_item: null },
    { name: "Bacons", qte: 1, unit: "tranche", qte_item: 150, unit_item: "g" },
        { name: "Eau", qte: 10, unit: "L", qte_item: null, unit_item: null },
    { name: "Graine de sesame", qte: 1, unit: null, qte_item: null, unit_item: null },
    { name: "bloc de foie gras de canard", qte: 1, unit: "piece", qte_item: 500, unit_item: "g" },
    { name: "Poulet", qte: 1, unit: "tranche", qte_item: 1500, unit_item: "g" },
    // Ajoute d'autres ingrédients selon tes besoins
  ];

  // Variables pour Ustensiles
  const ustensiles = [
    "Casserolle",
    "Batteur",
    "Four",
    "Planche Bois",
    "Couteau", 
    "Ms",
    "Couteau"
  ];
  const img = "https://www.semana.com/resizer/v2/FG7F25FC45FMNE2UJVNQSZIHPE.JPG?smart=true&auth=143a54831945320e6bbc0891973a7deb60011e8ddf1d0b67fce9f3d0f3187b71&width=1280&height=720";

return (
    <div className="w-full h-[80vh] flex flex-col gap-6 p-4 overflow-hidden">
      {/* Conteneur avec 2 colonnes */}
<div className="flex flex-col lg:flex-row gap-6 w-full h-[40vh]">

  {/* Ingrédients (60% largeur) */}
  <div className="rounded-3xl bg-pink-100 p-4 flex flex-col overflow-hidden lg:flex-[55%]">
    <h2 className="font-bold text-lg mb-2">Ingrédients</h2>

    <div className="overflow-y-auto h-full thin-scrollbar">
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

  {/* Ustensiles (40% largeur) */}
<div className="rounded-3xl bg-amber-100 p-4 flex flex-col overflow-hidden lg:flex-[45%]">
  <h2 className="font-bold text-lg mb-2">Ustensiles</h2>

  <div className="overflow-y-auto h-full thin-scrollbar">
    {/* Utilisation de flexbox pour centrer les éléments sur chaque ligne */}
    <div className="grid grid-cols-2 gap-4 justify-items-center">
      {ustensiles.map((ustensil, index) => (
        <div 
          key={index} 
          className="flex flex-col items-center justify-center text-center"
        >
          <img 
            src={img}
            alt={ustensil} 
            className="w-10 h-10 object-cover" 
          />
          <span>{ustensil}</span>
        </div>
      ))}
    </div>
  </div>
</div>


</div>


      <CommentsSection />

    </div>
  );
}
