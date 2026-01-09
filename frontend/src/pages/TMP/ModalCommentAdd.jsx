// CommentModal.jsx
import { useState, useEffect } from "react";

export default function ModalCommentAdd({
  myNote,
  setMyNote,
  myComment,
  setMyComment,
  onSubmit,
  onDelete,
  hasExistingComment,
}) {
  const [voterActive, setVoterActive] = useState(false);

  useEffect(() => {
    setVoterActive(myNote !== null && myNote !== undefined);
  }, [myNote]);

  const handleToggleVoter = () => {
    if (voterActive) {
      // Si on désactive "Voter", on met myNote à null
      setMyNote(null);
    }
    setVoterActive(!voterActive);
  };

  return (
    <form
      onSubmit={onSubmit}
      className="bg-white rounded-3xl p-6 space-y-4"
    >
      <h3 className="font-bold text-lg">
        {hasExistingComment ? "Modifier avis" : "Laisser un avis"}
      </h3>

      {/* Note + Bouton à droite */}
      <div className="flex items-center gap-4 text-2xl">
        {/* Étoiles */}
        {voterActive && (
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                type="button"
                key={n}
                onClick={() => setMyNote(myNote === n ? 0 : n)}
                className={n <= myNote ? "text-yellow-500" : "text-gray-300"}
              >
                ★
              </button>
            ))}
          </div>
        )}

        {/* Bouton Voter / Ne pas voter */}
        <button
          type="button"
          onClick={handleToggleVoter}
          className={`px-4 py-1 rounded-full text-sm ${
            voterActive ? "bg-gray-300 text-gray-800" : "bg-softBeige"
          }`}
        >
          {voterActive ? "Ne pas voter" : "Voter"}
        </button>
      </div>

      {/* Commentaire */}
      <textarea
        className="w-full border rounded-xl p-2 mt-2"
        rows={4}
        placeholder="Votre commentaire..."
        value={myComment}
        onChange={(e) => setMyComment(e.target.value)}
      />

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2">
        {hasExistingComment && (
          <button
            type="button"
            onClick={onDelete}
            className="px-4 py-1 rounded-full bg-softPink text-white"
          >
            Supprimer
          </button>
        )}

        <button
          type="submit"
          className="px-4 py-1 rounded-full bg-accentGreen text-white"
        >
          Enregistrer
        </button>
      </div>
    </form>
  );
}
