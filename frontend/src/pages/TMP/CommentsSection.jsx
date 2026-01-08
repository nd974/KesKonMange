import { useState, useEffect } from "react";
import { CLOUDINARY_RES } from "../../config/constants";
import ModalWrapper from "./ModalWrapper";
import ModalCommentAdd from "./ModalCommentAdd";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function CommentsSection({ comments, profileId, recipeId }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [myNote, setMyNote] = useState(0);
  const [myComment, setMyComment] = useState("");

  // 🔍 Commentaire existant de l'utilisateur
  const myExistingComment = comments.find(
    (c) => c.profile_id === profileId
  );

  // Préremplissage quand on ouvre la modale
  useEffect(() => {
    if (isModalOpen && myExistingComment) {
      setMyNote(myExistingComment.note);
      setMyComment(myExistingComment.comment);
    }
  }, [isModalOpen]);

  async function saveStats(e) {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/recipe/setStats`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipeId,
          profileId,
          note: myNote,
          comment: myComment,
        }),
      });

      const data = await res.json();
      if (!data.ok) return alert("Erreur: " + data.error);

      alert("Avis enregistré !");
      setIsModalOpen(false);
      window.location.reload();
      // loadRating(); ← si tu as déjà cette fonction
    } catch (e) {
      console.error(e);
      alert("Erreur lors de l'enregistrement");
    }
  }

  async function deleteComment() {
    if (!confirm("Supprimer votre avis ?")) return;

    try {
      const res = await fetch(`${API_URL}/recipe/deleteStats`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipeId,
          profileId,
        }),
      });

      const data = await res.json();
      if (!data.ok) return alert("Erreur: " + data.error);

      alert("Avis supprimé !");
      window.location.reload();
    } catch (e) {
      console.error(e);
      alert("Erreur lors de la suppression");
    }
  }

  return (
    <>
      {/* SECTION COMMENTAIRES */}
      <div className="rounded-3xl p-4 flex flex-col shadow-lg bg-gray-100 h-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-lg">Commentaires</h2>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-softPink text-white px-4 py-1 rounded-full text-sm hover:bg-pink-200 transition"
          >
            {!!myExistingComment ? "Modifier votre avis" : "Laisser un avis"}
            
          </button>
        </div>

        <div className="overflow-y-auto space-y-4 thin-scrollbar">
          {comments.map((comment, index) => (
            comment.comment && (
              <div key={index} className="flex gap-4">
                <img
                  src={`${CLOUDINARY_RES}${comment.profile_avatar}`}
                  alt={comment.username}
                  className="w-12 h-12 rounded-2xl object-cover"
                />

                <div className="flex flex-col w-full">
                  <div className="flex items-center w-full">
                    <div className="flex items-center gap-5">
                      <span
                        className={`font-bold text-sm ${
                          comment.profile_id === profileId
                            ? "text-white bg-accentGreen text-xs px-2 py-1 rounded"
                            : ""
                        }`}
                      >
                        {comment.profile_id === profileId
                          ? "Vous"
                          : comment.profile_name}
                      </span>

                      {comment.note > 0 && (
                        <p className="text-yellow-500 text-sm">
                          {"★".repeat(comment.note)}
                          {"☆".repeat(5 - comment.note)}
                        </p>
                      )}

                    </div>

                    <span className="ml-auto text-xs text-gray-500">
                      {new Date(comment.updated_date).toLocaleDateString("fr-FR")}
                    </span>
                  </div>

                  <p className="text-sm text-black">{comment.comment}</p>
                </div>
              </div>
              )
          ))}
        </div>
      </div>

      {isModalOpen && (
        <ModalWrapper onClose={() => setIsModalOpen(false)}>
          <ModalCommentAdd
            myNote={myNote}
            setMyNote={setMyNote}
            myComment={myComment}
            setMyComment={setMyComment}
            onSubmit={saveStats}
            onDelete={deleteComment}
            hasExistingComment={!!myExistingComment}
          />
        </ModalWrapper>
      )}
    </>
  );
}
