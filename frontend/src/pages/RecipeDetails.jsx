import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../components/Header.jsx";
import { FullStar, HalfStar, EmptyStar } from "../components/Stars";
import ModalNutrition from "../components/ModalNutrition";
import { CLOUDINARY_RES, CLOUDINARY_RECETTE_NOTFOUND } from "../config/constants";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function RecipeDetail({ homeId,profileId, id: idProp }) {
  const navigate = useNavigate();
  const { id: idFromUrl } = useParams();
  const id = idProp ?? idFromUrl;

  // const [profileId, setProfileId] = useState(null);

  // useEffect(() => {
  //   // const stored = localStorage.getItem("profile_id");
  //   if (profileId) setProfileId(profileId);
  // }, [profileId]);

  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showNutrition, setShowNutrition] = useState(false);

  const [myNote, setMyNote] = useState(null);
  const [myComment, setMyComment] = useState("");
  const [loadingStats, setLoadingStats] = useState(true);

  const [comments, setComments] = useState([]);
  const [averageNote, setAverageNote] = useState(0);
  const [votesCount, setVotesCount] = useState(0);
  const [statsSaved, setStatsSaved] = useState(false);


  const [similar, setSimilar] = useState([]);

  const [showModalNutrition, setShowModalNutrition] = useState(false);
  const [selectedIngId, setSelectedIngId] = useState(null);

  const formatTime = (minutes) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;

    if (h === 0) return `${m}min`;
    if (m === 0) return `${h}h`;
    return `${h}h${m}`;
  };

  // === Fetch recette ===
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

  // === Fetch stats utilisateur ===
  useEffect(() => {
    if (!profileId) return;
    async function fetchStats() {
      try {
        const res = await fetch(`${API_URL}/recipe/getStats`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ recipeId: id, profileId }),
        });
        const data = await res.json();
        if (data.ok && data.stats) {
          setMyNote(data.stats.note);
          setMyComment(data.stats.comment || "");
          setStatsSaved(data.stats.note !== null || !!data.stats.comment);
        }
      } catch (e) {
        console.error("Erreur chargement stats:", e);
      } finally {
        setLoadingStats(false);
      }
    }
    fetchStats();
  }, [id, profileId]);

  // === Fetch commentaires publics (exclut celui du profil actuel) ===
  useEffect(() => {
    if (!profileId) return;
    async function loadComments() {
      try {
        const res = await fetch(`${API_URL}/recipe/getComments`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ recipeId: id, profileId }),
        });
        const data = await res.json();
        if (data.ok) {
          const filtered = data.comments
            .filter(c => c.profile_id !== profileId)
            .slice(0, 5); // max 5 commentaires
          setComments(filtered);
        }
      } catch (e) {
        console.error("Erreur chargement commentaires:", e);
      }
    }
    loadComments();
  }, [id, profileId]);

  // Fonction pour récupérer la note moyenne
  async function loadRating() {
    if (!id) return;
    try {
      const res = await fetch(`${API_URL}/recipe/getRating`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipeId: id }),
      });
      const data = await res.json();
      if (data.ok) {
        setAverageNote(data.averageNote);
        setVotesCount(data.votesCount);
      }
    } catch (e) {
      console.error("Erreur loadRating:", e);
    }
  }

  // === useEffect initial pour charger la note moyenne ===
  useEffect(() => {
    loadRating();
  }, [id]);

  // === Fetch recettes similaires ===
  useEffect(() => {
    async function fetchSimilar() {
      try {
        const res = await fetch(`${API_URL}/recipe/getSimilar/${id}`);
        const data = await res.json();
        setSimilar(data.slice(0, 5)); // max 5
      } catch (e) {
        console.error("Erreur fetch recettes similaires:", e);
      }
    }
    fetchSimilar();
  }, [id]);

  const deleteValidate = async () => {
    if (!recipe?.id) return;
    if (confirm("Voulez-vous vraiment supprimer cette recette ?")) {
      try {
        const res = await fetch(`${API_URL}/recipe/delete/${recipe.id}`, { method: "DELETE" });
        const data = await res.json();
        if (data.ok) {
          alert("Recette supprimée !");
          navigate("/recipes");
        } else {
          alert("Erreur : " + data.error);
        }
      } catch (e) {
        console.error(e);
        alert("Erreur lors de la suppression");
      }
    }
  };

  // Fonction pour supprimer le commentaire/note
  async function deleteMyComment() {
    if (!profileId) return;
    if (!confirm("Voulez-vous vraiment supprimer votre avis ?")) return;

    try {
      const res = await fetch(`${API_URL}/recipe/deleteStats`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipeId: id, profileId }),
      });
      const data = await res.json();
      if (data.ok) {
        setMyNote(null);
        setMyComment("");
        setStatsSaved(false); // <- ajouter ça
        alert("Votre avis a été supprimé !");
        loadRating();
      } else {
        alert("Erreur : " + data.error);
      }
    } catch (e) {
      console.error(e);
      alert("Erreur lors de la suppression de votre avis");
    }
  }


  async function saveStats(e) {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/recipe/setStats`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipeId: id,
          profileId,
          note: myNote,
          comment: myComment,
        }),
      });
      const data = await res.json();
      if (!data.ok) return alert("Erreur: " + data.error);
      alert("Avis enregistré !");
      setStatsSaved(true);
      loadRating();
    } catch (e) {
      console.error(e);
      alert("Erreur lors de l'enregistrement");
    }
  }

  if (loading) return <div className="p-8 text-center">Chargement...</div>;
  if (!recipe) return <div className="p-8 text-center">Recette introuvable.</div>;

  return (
  <div className={`min-h-screen px-4 md:px-8 lg:px-16 relative ${!idProp ? "py-8" : ""}`}>
      {!idProp && <Header homeId={homeId} /> }

      <div  className={`lg:flex lg:gap-6 ${!idProp ? "py-8" : ""}`}>
        
        {!idProp && (
          // === Colonne gauche : Nutrition desktop ===
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
        )}


        {/* === Colonne centrale : Contenu principal === */}
        <main className={`flex-1 bg-white p-6 relative ${!idProp ? "shadow rounded-lg overflow-hidden" : ""}`}>
            {!idProp && 
              <div className="flex justify-center mt-6 mb-6 space-x-4">
                <button
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                  onClick={deleteValidate}
                >
                  🗑️ Supprimer la recette
                </button>
                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  onClick={() => navigate(`/recipe/edit/${recipe.id}`)}
                >
                  ✏️ Modifier la recette
                </button>
              </div>
            }
            

          {/* Image principale */}
          <img 
            src={`${CLOUDINARY_RES}${recipe.picture || CLOUDINARY_RECETTE_NOTFOUND}`}
            alt="Pâtes à la carbonara"
            className="w-full h-100 object-cover rounded-md mb-6"
          />
          {/* Nom et tags */}
          <div className="flex flex-wrap items-center justify-between mb-3">
            <h1 className="text-3xl font-bold mb-2">{recipe.name}</h1>

            <div className="flex flex-wrap gap-2">
              {/* 3 premiers tags */}
              {recipe.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag.id}
                  className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm"
                >
                  {tag.name}
                </span>
              ))}

              {/* Badge +x si plus de 3 tags */}
              {recipe.tags.length > 3 && (
                <div className="relative group">
                  <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs cursor-pointer">
                    +{recipe.tags.length - 3}
                  </span>

                  {/* Tooltip multiline */}
                  <div className="absolute left-1/2 -translate-x-1/2 mt-1 bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <div className="flex flex-col whitespace-nowrap">
                      {recipe.tags.slice(3).map((tag) => (
                        <span key={tag.id}>{tag.name}</span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

            {/* Note moyenne + 🍏 pour mobile ou si idProp pas défini */}
            {votesCount > 0 && (
              <div className="flex items-center gap-2 mt-2 text-yellow-500">
                <div className="flex gap-1">
                  {Array.from({ length: 5 }, (_, i) => {
                    const starNum = i + 1;

                    if (starNum <= Math.floor(averageNote)) return <FullStar key={i} />;
                    if (starNum - 1 < averageNote && averageNote < starNum) return <HalfStar key={i} />;
                    return <EmptyStar key={i} />;
                  })}
                </div>


                <span className="text-gray-600 text-sm">
                  ({averageNote} / 5 sur {votesCount} vote{votesCount > 1 ? "s" : ""})
                </span>

                {(!idProp ? (
                  // idProp défini → mobile seulement
                  <span
                    className="ml-2 cursor-pointer lg:hidden"
                    onClick={() => setShowNutrition(true)}
                  >
                    🍏
                  </span>
                ) : (
                  // idProp non défini → toujours visible
                  <span
                    className="ml-2 cursor-pointer"
                    onClick={() => setShowNutrition(true)}
                  >
                    🍏
                  </span>
                ))}
              </div>
            )}




          {/* Infos générales */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 text-sm py-4">
            <div>
              <span className="font-semibold block">Préparation</span>
              <span>{formatTime(recipe.time_prep)}</span>
            </div>
            <div>
              <span className="font-semibold block">Cuisson</span>
              <span>{formatTime(recipe.time_cook)}</span>
            </div>
            <div>
              <span className="font-semibold block">Repos</span>
              <span>{formatTime(recipe.time_rest)}</span>
            </div>
            <div>
              <span className="font-semibold block">Nettoyage</span>
              <span>{formatTime(recipe.time_clean)}</span>
            </div>
          </div>

          {/* Autres infos */}
          <div className="flex flex-wrap gap-6 mt-4 text-sm">
            <div>
              <span className="font-semibold">Difficulté :</span>{" "}
              {{
                1: "Très facile",
                2: "Facile",
                3: "Moyen",
                4: "Difficile",
                5: "Très difficile",
              }[recipe.level] || "Non spécifié"}
            </div>

            <div>
              <span className="font-semibold">Portions :</span>{" "}
              {recipe.portion} personne{recipe.portion > 1 ? "s" : ""}
            </div>
          </div>

          {/* Ustensiles */}
          <section className="mt-8">
            <h2 className="text-xl font-semibold mb-2">🔧 Ustensiles</h2>

            <ul className="space-y-2">
              {recipe.utensils?.map((utensil) => (
                <li
                  key={utensil.id}
                  className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded"
                >
                  {/* Nom */}
                  <span>{utensil.name}</span>

                  {/* Image si disponible */}
                  {utensil.picture ? (
                    <img
                      src={`${CLOUDINARY_RES}${utensil.picture}`}
                      alt={utensil.name}
                      className="w-8 h-8 object-contain ml-3"
                    />
                  ) : (
                    <span className="text-gray-400 text-sm ml-3">—</span> // si pas d'image
                    // <img
                    //   src="https://www.manutan.fr/fstrz/r/s/www.manutan.fr/img/S/GRP/ST/AIG17936217.jpg?frz-v=126"
                    //   alt={utensil.name}
                    //   className="w-8 h-8 object-contain ml-3"
                    // />
                  )}
                </li>
              ))}
            </ul>
          </section>


          {/* Ingrédients */}
          <section className="mt-8">
            <h2 className="text-xl font-semibold mb-2">🥕 Ingrédients</h2>

          <ul className="list-disc list-inside space-y-1">
            {recipe.ingredients?.map((ing) => {
              const unit = ing.unit;
              const name = ing.name.toLowerCase();

              const amount = Number(ing.amount);
              const displayAmount = Number.isInteger(amount) ? amount : amount.toFixed(2);

              const displayQty = unit
                ? displayAmount + (unit.length <= 2 ? unit : ` ${unit}`)
                : displayAmount;

              const hasItemUnit = ing.amount_item && ing.unit_item;

              // de / d'
              const deWord = unit
                ? /^[aeiouyh]/i.test(name)
                  ? "d'"
                  : "de "
                : "";

              return (
                <li key={ing.id}>
                  {/* 🔹 Quantité principale */}
                  {displayQty}

                  {/* 🔹 Quantité item (si existe) */}
                  {hasItemUnit && (
                    <>
                      {" "}
                      [{ing.amount_item}{ing.unit_item}]
                    </>
                  )}

                  {/* 🔹 de / d' */}
                  {" "}
                  {deWord}
                  {ing.recipe_id ? (
                    <a
                      href={`/recipe/${ing.recipe_id}`}
                      className="text-blue-600 hover:underline"
                    >
                      {name}
                    </a>
                  ) : (
                    <>
                      {name}
                      <span
                        onClick={() => {
                          console.log("Ingrédient cliqué:", ing.id);
                          setSelectedIngId(ing.id);     // TODO ing.id 👈 On stocke l’ingrédient cliqué
                          setShowModalNutrition(true);  // 👈 On ouvre la modal
                        }}
                        style={{ cursor: "pointer", marginLeft: "8px" }}
                      >
                        {ing.selected ? "🍏" : "❓"}
                      </span>
                    </>
                  )}
                </li>
              );
            })}
          </ul>

          {/* La modal est rendue UNE SEULE FOIS, en bas */}
          {showModalNutrition && (
            <ModalNutrition
              ing_id={selectedIngId}                // 👈 L’id du bon ingrédient
              onClose={() => setShowModalNutrition(false)}
            />
          )}

            


          </section>



          {/* Préparation */}
          <section className="mt-8">
            <h2 className="text-xl font-semibold mb-4">👨‍🍳 Préparation</h2>
            <div className="space-y-4">
              {recipe.steps.map((s) => (
                <div
                  key={s.id}
                  className="p-4 bg-white rounded-2xl shadow-md border border-gray-100"
                >
                  <div className="font-medium mb-2 whitespace-pre-line">
                    {s.number}. {s.description}
                  </div>

                  {(s.time > 0 || s.level > 0) && (
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      {/* Temps */}
                      <div>{s.time > 0 ? `⏱️ ${formatTime(s.time)}` : <span>&nbsp;</span>}</div>

                      {/* Level */}
                      <div className="text-accentGreen">
                        {s.level > 0 ? "★".repeat(Math.round(s.level)) + "☆".repeat(5 - Math.round(s.level)) : ""}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>



          {/* Commentaires */}
          <section className="mt-10">
            <h2 className="text-xl font-semibold mb-3">💬 Commentaires</h2>

            {/* Affichage des commentaires publics */}
            {comments.length === 0 && (
              <p className="text-gray-500 mb-4">Aucun commentaire pour l’instant.</p>
            )}

            {comments.map((c, i) => (
              <div key={i} className="border-t pt-3 mt-3 whitespace-pre-line">
                
                <div className="flex items-center justify-between">
                  {/* Username en gras à gauche */}
                  <p className="font-semibold">{c.username}</p>

                  {/* Étoiles à droite */}
                  {c.note > 0 && (
                    <p className="text-yellow-500 text-sm font-medium">
                      {"★".repeat(c.note)}{"☆".repeat(5 - c.note)}
                    </p>
                  )}
                </div>

                <p>{c.comment}</p>
              </div>
            ))}



            <form onSubmit={saveStats} className="mt-6 border-t pt-4">
              <h3 className="font-semibold mb-2">Votre avis</h3>

              <div className="flex gap-1 mb-3 text-2xl cursor-pointer">
                {[1,2,3,4,5].map(n => (
                  <span key={n} onClick={() => setMyNote(n)} className={n <= (myNote||0) ? "text-yellow-500" : "text-gray-300"}>★</span>
                ))}
              </div>

              <textarea
                className="w-full border rounded p-2 mb-2"
                rows="3"
                maxLength="150"
                placeholder="Votre avis..."
                value={myComment}
                onChange={e => setMyComment(e.target.value)}
              />

<div className="flex gap-2">
  <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
    Enregistrer
  </button>

{statsSaved && (
  <button
    type="button"
    onClick={deleteMyComment}
    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
  >
    Supprimer mon avis
  </button>
)}

</div>

            </form>


          </section>

        </main>


        {!idProp && 
        //* === Colonne droite : Recettes similaires === *//
        <aside className="hidden lg:block w-1/4 bg-white p-4 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">🍝 Recettes similaires</h3>

          {similar.length === 0 ? (
            <p className="text-gray-500 text-sm">Aucune recette similaire trouvée.</p>
          ) : (
            <ul className="space-y-3">
              {similar.slice(0, 5).map(recipe => (
                <li key={recipe.id}>
                  <a
                    href={`/recipe/${recipe.id}`}
                    className="flex items-center gap-2 hover:bg-gray-50 p-2 rounded"
                  >
                    <img
                      src={`${CLOUDINARY_RES}${recipe.picture || CLOUDINARY_RECETTE_NOTFOUND}`}
                      alt={recipe.name}
                      className="w-16 h-16 object-cover rounded-md"
                    />
                    <span>{recipe.name}</span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </aside>
        }

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