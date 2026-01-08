import { CLOUDINARY_RES } from "../../config/constants";

export default function CommentsSection({ comments, profileId }) {

  return (
    <div className="rounded-3xl p-4 flex flex-col overflow-hidden h-full shadow-lg bg-gray-100">
        {/* Titre + bouton */}
        <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-lg">Commentaires</h2>
            <button className="bg-softPink text-white px-4 py-1 rounded-full text-sm hover:bg-pink-200 transition">
            Laisser un avis
            </button>
        </div>

        {/* Liste des commentaires */}
        <div className="overflow-y-auto max-h-[30vh] space-y-4 thin-scrollbar">
            {comments.map((comment, index) => (
              <div key={index} className="flex gap-4">
                  {/* Avatar */}
                  <img
                  src={`${CLOUDINARY_RES}${comment.profile_avatar}`}
                  alt={comment.username}
                  className="w-12 h-12 rounded-2xl object-cover flex-shrink-0"
                  />

                  {/* Texte du commentaire */}
                  <div className="flex flex-col w-full">
                  {/* Nom à gauche, date à droite */}
                    <div className="flex items-center w-full">
                      <div className="flex items-center gap-5">
                          <span
                            className={`font-bold text-sm ${
                              comment.profile_id === profileId ? "text-white bg-accentGreen text-xs p-[0.2rem]" : ""
                            }`}
                          >
                            {comment.profile_id === profileId ? "Vous" : comment.profile_name}
                          </span>
                          <p className="text-yellow-500 text-sm font-medium">
                          {"★".repeat(comment.note)}{"☆".repeat(5 - comment.note)}
                        </p>
                      </div>

                      <span className="ml-auto text-xs text-gray-500 mr-2">
                        {new Date(comment.updated_date).toLocaleDateString("fr-FR")}
                      </span>
                    </div>
                    <p className="text-sm text-black whitespace-pre-line mr-1">{comment.comment}</p>
                  </div>
              </div>
            ))}
        </div>
        </div>

  );
}
