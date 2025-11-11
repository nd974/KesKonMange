import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "../components/Header.jsx";
import { CLOUDINARY_RES, CLOUDINARY_RECETTE_NOTFOUND } from "../config/constants";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function RecipeDetail({homeId}) {
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showNutrition, setShowNutrition] = useState(false);

  useEffect(() => {
    async function fetchRecipe() {
      try {
        const res = await fetch(`${API_URL}/recipe/get-one/${id}`);
        const data = await res.json();
        setRecipe(data);
      } catch (err) {
        console.error("Erreur fetch recette:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchRecipe();
  }, [id]);

  if (loading) return <div className="p-8 text-center">Chargement...</div>;
  if (!recipe) return <div className="p-8 text-center">Recette introuvable.</div>;

  return (
  <div className="min-h-screen px-4 md:px-8 lg:px-16 py-8 relative">
      <Header homeId={homeId}/>

      <div className="lg:flex lg:gap-6 py-8">

        {/* === Colonne gauche : Nutrition desktop === */}
        <aside className="hidden lg:block w-1/4 bg-white p-4 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">🍏 Infos nutritionnelles</h3>
          <ul className="space-y-2 text-sm">
            <li><span className="font-semibold">Calories :</span> 520 kcal / part</li>
            <li><span className="font-semibold">Protéines :</span> 22 g</li>
            <li><span className="font-semibold">Lipides :</span> 18 g</li>
            <li><span className="font-semibold">Glucides :</span> 65 g</li>
            <li><span className="font-semibold">Fibres :</span> 3 g</li>
            <li><span className="font-semibold">Sucres :</span> 2 g</li>
            <li><span className="font-semibold">Sodium :</span> 500 mg</li>
          </ul>
        </aside>

        {/* === Colonne centrale : Contenu principal === */}
        <main className="flex-1 bg-white shadow rounded-lg overflow-hidden p-6 relative">

          {/* Image principale */}
          <img 
            src="https://res.cloudinary.com/dsnaosp8u/image/upload/v1762801940/pate_carbonara_dxp9jr.jpg" 
            alt="Pâtes à la carbonara"
            className="w-full h-80 object-cover rounded-md mb-6"
          />

          {/* Nom et tags */}
          <div className="flex flex-wrap items-center justify-between mb-3">
            <h1 className="text-3xl font-bold mb-2">Pâtes à la Carbonara</h1>
            <div className="flex flex-wrap gap-2">
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">Italien</span>
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">Rapide</span>
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">Pâtes</span>
              {/* Tooltip */}
                <div className="relative group">
                    <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs cursor-pointer">
                        +1
                    </span>
                    {/* Tooltip */}
                    <div className="absolute left-1/2 -translate-x-1/2 mt-1 w-max bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap">
                        Gras
                    </div>
                </div>
            </div>
          </div>

          {/* Note moyenne + 🍏 pour mobile */}
          <div className="flex items-center gap-2 mt-2 text-yellow-500">
            ⭐⭐⭐⭐☆
            <span className="text-gray-600 text-sm">(4.2 / 5 sur 128 votes)</span>
            {/* Mobile only 🍏 */}
            <span 
              className="ml-2 cursor-pointer lg:hidden" 
              onClick={() => setShowNutrition(true)}
            >
              🍏
            </span>
          </div>

          {/* Infos générales */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 text-sm">
            <div>
              <span className="font-semibold block">Préparation</span>
              <span>10 min</span>
            </div>
            <div>
              <span className="font-semibold block">Cuisson</span>
              <span>15 min</span>
            </div>
            <div>
              <span className="font-semibold block">Repos</span>
              <span>0 min</span>
            </div>
            <div>
              <span className="font-semibold block">Nettoyage</span>
              <span>5 min</span>
            </div>
          </div>

          {/* Autres infos */}
          <div className="flex flex-wrap gap-6 mt-4 text-sm">
            <div><span className="font-semibold">Difficulté :</span> Facile</div>
            <div><span className="font-semibold">Portions :</span> 2 personnes</div>
          </div>

          {/* Ustensiles */}
          <section className="mt-8">
            <h2 className="text-xl font-semibold mb-2">🧂 Ustensiles nécessaires</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>Poêle antiadhésive</li>
              <li>Casserole</li>
              <li>Passoire</li>
              <li>Fouet</li>
            </ul>
          </section>

          {/* Ingrédients */}
          <section className="mt-8">
            <h2 className="text-xl font-semibold mb-2">🥕 Ingrédients</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>200 g de spaghetti</li>
              <li>100 g de lardons fumés</li>
              <li>2 œufs</li>
              <li>40 g de parmesan râpé</li>
              <li>Sel, poivre noir</li>
            </ul>
          </section>

          {/* Préparation */}
          <section className="mt-8">
            <h2 className="text-xl font-semibold mb-2">👨‍🍳 Préparation</h2>
            <ol className="list-decimal list-inside space-y-2">
              <li>Faites cuire les pâtes dans une grande casserole d’eau salée.</li>
              <li>Faites revenir les lardons à la poêle sans matière grasse.</li>
              <li>Battez les œufs avec le parmesan et un peu de poivre.</li>
              <li>Égouttez les pâtes, puis mélangez-les aux lardons et au mélange œufs-fromage.</li>
              <li>Servez chaud avec un peu de parmesan râpé en plus.</li>
            </ol>
          </section>

          {/* Commentaires */}
          <section className="mt-10">
            <h2 className="text-xl font-semibold mb-3">💬 Commentaires</h2>

            <div className="border-t pt-3 mt-3">
              <p className="font-semibold">Marie — ⭐⭐⭐⭐⭐</p>
              <p>Recette simple et délicieuse ! J’ai ajouté un peu de crème pour plus d’onctuosité 😋</p>
            </div>

            <div className="border-t pt-3 mt-3">
              <p className="font-semibold">Lucas — ⭐⭐⭐⭐☆</p>
              <p>Très bon, mais un peu salé à cause des lardons.</p>
            </div>

            <form className="mt-6 border-t pt-4">
              <h3 className="font-semibold mb-2">Laisser un commentaire</h3>
              <textarea className="w-full border rounded p-2 mb-2" rows="3" placeholder="Votre avis..."></textarea>
              <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Envoyer</button>
            </form>
          </section>

        </main>

        {/* === Colonne droite : Recettes similaires === */}
        <aside className="hidden lg:block w-1/4 bg-white p-4 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">🍝 Recettes similaires</h3>
          <ul className="space-y-3">
            <li>
              <a href="#" className="flex items-center gap-2 hover:bg-gray-50 p-2 rounded">
                <img src="https://res.cloudinary.com/dsnaosp8u/image/upload/v1762801940/pate_carbonara_dxp9jr.jpg"
                  alt="Spaghetti bolognaise" className="w-16 h-16 object-cover rounded-md"/>
                <span>Spaghetti à la bolognaise</span>
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center gap-2 hover:bg-gray-50 p-2 rounded">
                <img src="https://res.cloudinary.com/dsnaosp8u/image/upload/v1762801940/pate_carbonara_dxp9jr.jpg" 
                  alt="Tagliatelles aux champignons" className="w-16 h-16 object-cover rounded-md"/>
                <span>Tagliatelles aux champignons</span>
              </a>
            </li>
            <li>
              <a href="#" className="flex items-center gap-2 hover:bg-gray-50 p-2 rounded">
                <img src="https://res.cloudinary.com/dsnaosp8u/image/upload/v1762801940/pate_carbonara_dxp9jr.jpg" 
                  alt="Pâtes au pesto" className="w-16 h-16 object-cover rounded-md" />
                <span>Pâtes au pesto</span>
              </a>
            </li>
          </ul>
        </aside>

      </div>

     {showNutrition && (
      // Fond cliquable
      <div
        className="fixed inset-0 z-40 bg-black/50"
        onClick={() => setShowNutrition(false)} // ferme si on clique sur le fond
      >
        {/* Slide */}
        <div
          className={`fixed top-0 left-0 w-64 h-full bg-white shadow-lg p-4 transition-transform duration-300 z-50
                      ${showNutrition ? "translate-x-0" : "-translate-x-full"}`}
          onClick={(e) => e.stopPropagation()} // empêche la fermeture si on clique dans la slide
        >
          <button
            className="mb-4 text-gray-600 hover:text-gray-900"
            onClick={() => setShowNutrition(false)}
          >
            ❌ Fermer
          </button>
          <h3 className="text-xl font-semibold mb-4">🍏 Infos nutritionnelles</h3>
          <ul className="space-y-2 text-sm">
            <li><span className="font-semibold">Calories :</span> 520 kcal / part</li>
            <li><span className="font-semibold">Protéines :</span> 22 g</li>
            <li><span className="font-semibold">Lipides :</span> 18 g</li>
            <li><span className="font-semibold">Glucides :</span> 65 g</li>
            <li><span className="font-semibold">Fibres :</span> 3 g</li>
            <li><span className="font-semibold">Sucres :</span> 2 g</li>
            <li><span className="font-semibold">Sodium :</span> 500 mg</li>
          </ul>
        </div>
      </div>
    )}


    </div>

  );
}
