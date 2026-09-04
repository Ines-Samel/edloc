import { PastilleCompletude, PastilleEtatElement } from "@/components/edl/pastille-etat";
import { completudePiece, type PieceEdl } from "@/lib/edloc";

/*
 * Relecture d'un état des lieux, pièce par pièce. Partagée par le récapitulatif
 * (avant signature) et par la consultation d'un état des lieux signé.
 */
export function ListeRecapitulative({ pieces }: { pieces: PieceEdl[] }) {
  return (
    <>
      {pieces.map((piece) => (
        <section key={piece.idPiece} className="rounded-carte border border-sable bg-card">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-sable px-5 py-4">
            <h2 className="text-sous-titre">{piece.libelle}</h2>
            <PastilleCompletude completude={completudePiece(piece)} />
          </div>

          {piece.elements.length === 0 ? (
            <p className="text-legende px-5 py-4 text-brun">
              Aucun élément constaté dans cette pièce.
            </p>
          ) : (
            <ul className="divide-y divide-sable">
              {piece.elements.map((element) => (
                <li key={element.idElement} className="flex flex-col gap-2 px-5 py-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="text-courant flex-1">{element.libelle}</span>
                    <PastilleEtatElement etat={element.etat} />
                    <span className="text-legende w-20 text-right text-brun">
                      {element.photos.length === 0
                        ? "—"
                        : `${element.photos.length} photo${element.photos.length > 1 ? "s" : ""}`}
                    </span>
                  </div>
                  {element.commentaire ? (
                    <p className="text-legende text-brun">{element.commentaire}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </>
  );
}
