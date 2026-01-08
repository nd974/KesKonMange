// CommentModal.jsx
export default function ModalCommentAdd({
  myNote,
  setMyNote,
  myComment,
  setMyComment,
  onSubmit,
  onDelete,
  hasExistingComment,
}) {
  return (
    <form
      onSubmit={onSubmit}
      className="bg-white rounded-3xl p-6 space-y-4"
    >
      <h3 className="font-bold text-lg">
        {hasExistingComment ? "Modifier votre avis" : "Laisser un avis"}
      </h3>

      {/* Note */}
      <div className="flex gap-2 text-2xl">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            type="button"
            key={n}
            onClick={() => setMyNote(n)}
            className={n <= myNote ? "text-yellow-500" : "text-gray-300"}
          >
            ★
          </button>
        ))}
      </div>

      {/* Commentaire */}
      <textarea
        className="w-full border rounded-xl p-2"
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
