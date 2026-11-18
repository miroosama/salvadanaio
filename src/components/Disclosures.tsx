"use client";

// Honest fine print in its proper place: findable, plainly stated, low — never
// in the hero or the "Come funziona?" explainer. Confident true narrative in
// front, disclosures here.
export default function Disclosures() {
  return (
    <details className="bg-cream rounded-2xl border border-mint-100 p-5">
      <summary className="font-display text-lg text-warmGray-800 cursor-pointer select-none">
        Termini e note
      </summary>
      <div className="mt-4 space-y-3 text-sm text-warmGray-500 leading-relaxed">
        <p>
          Al momento questi fondi non sono coperti da assicurazione sui depositi
          (FITD). Questo potrebbe cambiare in futuro.
        </p>
        <p>
          Il tasso è variabile e non garantito: dipende dal mercato Aave e può
          cambiare in qualsiasi momento.
        </p>
        <p>
          I saldi sono in dollari digitali (USDC). Il controvalore in euro
          dipende dal cambio €/$ e può salire o scendere.
        </p>
        <p>
          Le stime fiscali non sono consulenza fiscale: verifica la tua
          situazione con un commercialista.
        </p>
      </div>
    </details>
  );
}
