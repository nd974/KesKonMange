import ModalIngredientsList from "./ModalIngredientsList";
import ModalUstensilesList from "./ModalUstensilesList";
import ModalRecipeInfo from "./ModalRecipeInfo";
import ModalWrapper from "./ModalWrapper";
import CommentsSection from "./CommentsSection";
import StepsSection from "./StepsSection";

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CLOUDINARY_RES, CLOUDINARY_RECETTE_NOTFOUND, CLOUDINARY_ICONS} from "../../config/constants";
import { FullStar, HalfStar, EmptyStar } from "../../components/Stars";

import ActionButton from "../../components/ActionButton";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function NewRecipeDetail({ homeId,profileId, id: idProp, compact = false }) {

  const [openInfos, setOpenInfos] = useState(false);
  const [openIngredients, setOpenIngredients] = useState(false);
  const [openUstensils, setOpenUstensils] = useState(false);

   const navigate = useNavigate();
    const { id: idFromUrl } = useParams();
    const id = idProp ?? idFromUrl;
  
    const [recipe, setRecipe] = useState(null);
    const [loading, setLoading] = useState(true);
  
    const [showNutrition, setShowNutrition] = useState(false);
  
    const [myNote, setMyNote] = useState(null);
    const [myComment, setMyComment] = useState("");
    const [loadingStats, setLoadingStats] = useState(true);
  
    const [comments, setComments] = useState([]);
    const [averageNote, setAverageNote] = useState(0);
    const [votesCount, setVotesCount] = useState(0);
    const [usageCount, setUsageCount] = useState(0);
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
          const res = await fetch(`${API_URL}/recipe/get-one/${homeId}/${id}`);
          const data = await res.json();
          setRecipe(data);
        } catch (err) {
          console.error("Erreur fetch recette:", err);
        } finally {
          setLoading(false);
        }
      }
      fetchRecipe();
    }, [homeId, id]);
  
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
            setUsageCount(data.stats.usage_count || 0);
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
      console.log("recipeId:", id, "profileId:", profileId);
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
              .slice(0, 5); // max 5 commentaires
            setComments(filtered);
          }
        } catch (e) {
          console.error("Erreur chargement commentaires:", e);
        }
      }
      loadComments();
    }, [id, profileId]);

    console.log("Comments loaded:", comments);
  
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

    console.log("Recipe detail rendering with recipe:", recipe);

    const times = [recipe.time_prep, recipe.time_cook, recipe.time_rest, recipe.time_clean];

    
  // === LAYOUT COMPACT ===
  if (compact) {
    return (
<div className="flex flex-col lg:flex-row gap-6 items-start mb-4">
  {/* --- Colonne gauche --- */}
  <div className="flex flex-col items-center gap-4 lg:w-auto w-full">
    {/* Image */}
    <img
      src={`${CLOUDINARY_RES}${recipe.picture || CLOUDINARY_RECETTE_NOTFOUND}`}
      onClick={() => navigate(`/recipe/${recipe.id}`)}
      alt={recipe.name}
      className="w-80 h-64 sm:w-[40vh] sm:h-70 rounded-2xl object-cover"
    />

    <div className="w-[40vh] mt-3">
        <ModalRecipeInfo
      tags={recipe.tags}
      times={times}
      level={recipe.level}
      portion={recipe.portion}
      usage_count={usageCount}
      averageNote={averageNote} 
      votesCount={votesCount}
      compact={compact}
    />
    </div>
    <div className="flex gap-3 -mt-1">
      <ActionButton
        icon="🧬"
        label="Nutrition"
        color="accentGreen"
        onClick={() => setShowModalNutrition(true)}
      />

      <ActionButton
        icon="🔗"
        label="Recettes similaires"
        color="softBeige"
        onClick={() => setShowModalNutrition(true)}
      />
    </div>

  </div>

  <div className="w-full lg:flex-1 flex flex-col">
    <div
      className="
        w-full
        max-w-[45vh]
        lg:flex-1
        rounded-3xl
        bg-softBeige
        px-5 py-3
        flex
        flex-col
        gap-4
        mx-auto
        border-2
        border-gray-300
      "
    >
      <StepsSection steps={recipe.steps} />

      <div className="flex justify-center gap-4 mt-1">
        <button
          onClick={() => setOpenIngredients(true)}
          className="bg-pink-100 text-black px-4 py-2 rounded-full shadow text-sm"
        >
          <img
            src={`${CLOUDINARY_RES}${CLOUDINARY_ICONS["Icon_Ing"]}`}
            alt="Menu Icon"
            className="w-6 h-6 inline-block mr-2"
          />
          Ingrédients
        </button>

        <button
          onClick={() => setOpenUstensils(true)}
          className="bg-amber-100 text-black px-4 py-2 rounded-full shadow text-sm"
        >
          🍳 Ustensiles
        </button>
      </div>
    </div>
    <div className="w-full flex flex-col mt-3">
      <ActionButton
        icon="💬"
        label="Voir les commentaires"
        color="danger"
        onClick={() => setShowModalNutrition(true)}
      />
    </div>
  </div>


{openIngredients && (
  <ModalWrapper onClose={() => setOpenIngredients(false)}>
    <ModalIngredientsList ingredients={recipe.ingredients} homeId={homeId} compact={compact}/>
  </ModalWrapper>
)}
{openUstensils && (
  <ModalWrapper onClose={() => setOpenUstensils(false)}>
    <ModalUstensilesList utensils={recipe.utensils} />
  </ModalWrapper>
)}
</div>

    );
  }


  return (

<div className="flex flex-col lg:flex-row gap-6 px-4 py-4 md:px-8 lg:px-16">
    {/* Bloc principal : image + titre + étoiles + détails */}
    <div className="flex flex-col w-full lg:w-2/3 gap-6">
    
        {/* Image + Titre + Étoiles */}
<div className="flex flex-row gap-6">
  {/* Bloc image + titre (titre centré verticalement par rapport à l'image) */}
  <div className="flex flex-row gap-6 items-center flex-1">
    {/* Image */}
    <div className="relative shrink-0">
      <img
        src={`${CLOUDINARY_RES}${recipe.picture || CLOUDINARY_RECETTE_NOTFOUND}`}
        onClick={() => navigate(`/recipe/edit/${recipe.id}`)}
        alt="Recette Carbonara à la cool"
        className="w-32 h-32 sm:w-80 sm:h-80 rounded-full object-cover"
      />
    </div>

    {/* Titre centré verticalement */}
<div className="-ml-16 sm:-ml-28 z-50 flex flex-col justify-center w-full text-left pl-4 sm:pl-8">
  {/* Wrapper pour le clamp */}
  <div
    className="overflow-hidden"
    style={{
      display: "-webkit-box",
      WebkitBoxOrient: "vertical",
      WebkitLineClamp: 4, // limite à 4 lignes
    }}
  >
    <h1
      className="text-2xl sm:text-5xl font-bold leading-tight text-softPink font-display break-words px-2 sm:px-2 sm:py-2"
      style={{
        WebkitTextStroke: "8px white",
        paintOrder: "stroke fill",
        overflow: "visible", // important !
      }}
    >
      {recipe.name}
    </h1>
  </div>
</div>

  </div>

  {/* ModalRecipeInfo (desktop uniquement, aligné en haut) */}
  <div className="hidden lg:flex self-start w-[50vh]">
    <ModalRecipeInfo
      tags={recipe.tags}
      times={times}
      level={recipe.level}
      portion={recipe.portion}
      usage_count={usageCount}
      averageNote={averageNote}
      votesCount={votesCount}
      compact={compact}
    />
  </div>
</div>




        {/* Boutons mobile entre titre et préparation */}
        <div className="flex justify-center gap-4 lg:hidden">
          <button onClick={() => setOpenInfos(true)} className="bg-accentGreen text-white px-4 py-2 rounded-full shadow text-sm">
            ℹ️ Infos
          </button>
          <button onClick={() => setOpenIngredients(true)} className="bg-pink-100 text-black px-4 py-2 rounded-full shadow text-sm">
            <img
              src={`${CLOUDINARY_RES}${CLOUDINARY_ICONS["Icon_Ing"]}`}
              alt="Menu Icon"
              className="w-6 h-6 inline-block mr-2"
            />
            Ingrédients
          </button>
          <button onClick={() => setOpenUstensils(true)} className="bg-amber-100 text-black px-4 py-2 rounded-full shadow text-sm">
            🍳 Ustensiles
          </button>
        </div>

        {/* Bloc beige */}
        <div className="rounded-3xl bg-softBeige p-4 sm:-mt-16 z-50 sm:ml-40 sm:mr-4 h-[53vh] overflow-hidden flex flex-col shadow-2xl">
            <StepsSection steps={recipe.steps} />
        </div>
        


    </div>

    {/* Séparateur vertical (desktop uniquement) */}
    <div className="hidden lg:block border-dashed border-r-8 bg-transparent border-accentGreen"></div>

{/* <div className="hidden lg:block mx-4 h-full border-r-4 border-accentGreen border-dashed"></div> */}

    {/* Sidebar */}
<div className="hidden md:flex lg:w-1/3 w-full flex-shrink-0 h-[83vh]">
  <div className="w-full h-full flex flex-col gap-6 overflow-hidden">

    {/* ING / UST : prennent l'espace restant */}
    <div className="flex flex-col lg:flex-row gap-6 w-full min-h-[40vh] flex-1 overflow-hidden">
      <div className="lg:flex-[60%] flex-1 overflow-y-auto">
        <ModalIngredientsList ingredients={recipe.ingredients} homeId={homeId} />
      </div>
      <div className="lg:flex-[40%] flex-1 overflow-y-auto">
        <ModalUstensilesList utensils={recipe.utensils} />
      </div>
    </div>

    {/* COMMENTAIRES : hauteur naturelle */}
    <div className="shrink-0 max-h-[25vh]">
      <CommentsSection
        comments={comments}
        profileId={profileId}
        recipeId={recipe.id}
      />
    </div>

    <div className="flex w-full shrink-0 max-h-[10vh] justify-center text-center gap-5 -mt-2">
      <ActionButton
        icon="🧬"
        label="Nutrition"
        color="accentGreen"
        onClick={() => setShowModalNutrition(true)}
      />
      <ActionButton
        icon="🔗"
        label="Recettes similaires"
        color="softBeige"
        onClick={() => setShowModalNutrition(true)}
      />
    </div>
  </div>
</div>




    <div className="w-full lg:hidden">
      <CommentsSection comments={comments} profileId={profileId} recipeId={recipe.id}/>
    </div>

    <div className="flex w-full shrink-0 max-h-[10vh] justify-center text-center gap-5 -mt-2 lg:hidden">
      <ActionButton
        icon="🧬"
        label="Nutrition"
        color="accentGreen"
        onClick={() => setShowModalNutrition(true)}
      />
      <ActionButton
        icon="🔗"
        label="Recettes similaires"
        color="softBeige"
        onClick={() => setShowModalNutrition(true)}
      />
    </div>

    {/* --- MODALES MOBILE --- */}
    {openInfos && (
      <ModalWrapper onClose={() => setOpenInfos(false)}>
        <ModalRecipeInfo tags={recipe.tags} times={times} level={recipe.level} portion={recipe.portion} usage_count={usageCount} averageNote={averageNote} votesCount={votesCount} modal={true} compact={compact}/>
      </ModalWrapper>
    )}
    {openIngredients && (
      <ModalWrapper onClose={() => setOpenIngredients(false)}>
        <ModalIngredientsList ingredients={recipe.ingredients} homeId={homeId}/>
      </ModalWrapper>
    )}
    {openUstensils && (
      <ModalWrapper onClose={() => setOpenUstensils(false)}>
        <ModalUstensilesList utensils={recipe.utensils} />
      </ModalWrapper>
    )}

</div>







  );
}