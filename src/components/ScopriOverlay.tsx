"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Tab = "chi" | "guida";

// Full-screen "Scopri" overlay (no routes). Hash-driven (#scopri) so the
// Android/browser back button dismisses it instead of leaving the app; Esc, the
// X, and swipe-down all route through the same history pop. Keeps the user in
// the deposit funnel — the honest fine print lives here, not on the hero.
export default function ScopriOverlay() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("chi");
  const panelRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const sync = () => setOpen(window.location.hash === "#scopri");
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  const close = useCallback(() => {
    if (window.location.hash === "#scopri") history.back();
  }, []);

  // Esc + body scroll-lock + focus handling while open.
  useEffect(() => {
    if (!open) return;
    const prevActive = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeBtnRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
        return;
      }
      if (e.key !== "Tab" || !panelRef.current) return;
      // Basic focus trap.
      const nodes = panelRef.current.querySelectorAll<HTMLElement>(
        'button, a[href], [tabindex]:not([tabindex="-1"])'
      );
      if (nodes.length === 0) return;
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      prevActive?.focus?.();
    };
  }, [open, close]);

  // Swipe-down to dismiss (mobile): only when the body is scrolled to the top.
  const drag = useRef({ startY: 0, active: false });
  const onTouchStart = (e: React.TouchEvent) => {
    if ((scrollRef.current?.scrollTop ?? 0) > 0) return;
    drag.current = { startY: e.touches[0].clientY, active: true };
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (!drag.current.active || !panelRef.current) return;
    const dy = e.touches[0].clientY - drag.current.startY;
    panelRef.current.style.transform = `translateY(${Math.max(0, dy)}px)`;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!drag.current.active || !panelRef.current) return;
    const dy = e.changedTouches[0].clientY - drag.current.startY;
    const el = panelRef.current;
    drag.current.active = false;
    if (dy > 110) {
      close();
      el.style.transform = "";
    } else {
      el.style.transition = "transform 0.2s ease-out";
      el.style.transform = "";
      setTimeout(() => {
        if (el) el.style.transition = "";
      }, 220);
    }
  };

  if (!open) return null;

  const tabBtn = (id: Tab, label: string) => (
    <button
      onClick={() => {
        setTab(id);
        scrollRef.current?.scrollTo({ top: 0 });
      }}
      className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
        tab === id
          ? "bg-white text-ink shadow-sm"
          : "text-warmGray-500 hover:text-warmGray-700"
      }`}
      aria-pressed={tab === id}
    >
      {label}
    </button>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Scopri Salvadanaio"
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={close}
      />

      <div
        ref={panelRef}
        className="relative bg-canvas w-full h-[92vh] rounded-t-3xl sm:h-auto sm:max-h-[85vh] sm:max-w-lg sm:rounded-3xl flex flex-col shadow-xl"
      >
        {/* Drag handle + close */}
        <div
          className="pt-3 px-5 shrink-0"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div className="mx-auto w-10 h-1.5 rounded-full bg-warmGray-200 sm:hidden" />
          <div className="flex items-center justify-between mt-3">
            <div className="flex-1 flex gap-1 bg-warmGray-100 rounded-xl p-1 mr-3">
              {tabBtn("chi", "Chi siamo")}
              {tabBtn("guida", "Guida")}
            </div>
            <button
              ref={closeBtnRef}
              onClick={close}
              aria-label="Chiudi"
              className="w-9 h-9 shrink-0 flex items-center justify-center rounded-full text-warmGray-400 hover:text-warmGray-700 hover:bg-warmGray-100 text-2xl leading-none transition-colors"
            >
              ×
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-6">
          {tab === "chi" ? <ChiSiamo /> : <Guida />}
        </div>
      </div>
    </div>
  );
}

function ChiSiamo() {
  return (
    <div className="space-y-4 text-warmGray-600 leading-relaxed">
      <h2 className="font-display text-2xl text-ink">
        I tuoi risparmi, come dovrebbero essere
      </h2>
      <p>
        Salvadanaio nasce da un&apos;idea semplice: i tuoi soldi dovrebbero
        crescere, senza vincoli e senza sorprese. In Italia i conti rendono poco
        o niente, e spesso è la banca a decidere cosa puoi fare con i tuoi
        risparmi.
      </p>
      <p>
        Noi facciamo il contrario. Depositi quando vuoi, prelevi quando vuoi. I
        fondi restano tuoi — le chiavi sono tue, noi non possiamo toccarli né
        bloccarli. E copriamo noi i costi di rete, così non devi pensare alle
        commissioni.
      </p>
      <p>
        Dietro le quinte mettiamo i tuoi dollari digitali a rendita su Aave, uno
        dei protocolli più grandi e collaudati al mondo. Un rendimento reale,
        numeri onesti, tutto in italiano.
      </p>
      <p>
        È un progetto giovane e in crescita. Ti raccontiamo sempre com&apos;è
        fatto, senza nasconderci dietro parole difficili.
      </p>
    </div>
  );
}

function Guida() {
  return (
    <div className="space-y-6 text-warmGray-600 leading-relaxed">
      <section className="space-y-2">
        <h2 className="font-display text-xl text-ink">Cosa sono gli USDC</h2>
        <p>
          USDC è una moneta digitale ancorata al dollaro: 1 USDC vale circa 1
          dollaro, ed è usata da milioni di persone nel mondo. Il tuo saldo è in
          dollari, non in euro — il controvalore in euro dipende dal cambio €/$
          e può salire o scendere.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-display text-xl text-ink">
          Come nasce il rendimento
        </h2>
        <p>
          I tuoi USDC vengono depositati in Aave, il più grande protocollo di
          prestiti decentralizzato al mondo. Chi prende fondi in prestito paga
          interessi, e quegli interessi diventano il tuo rendimento. Matura ogni
          secondo, non a fine mese.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-display text-xl text-ink">
          I tuoi soldi, le tue chiavi
        </h2>
        <p>
          È auto-custodia: i fondi restano sulla blockchain a tuo nome. Noi non
          li teniamo e non possiamo bloccarli. Prelevi quando vuoi, senza
          vincoli né penali.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="font-display text-xl text-ink">Entrare e uscire</h2>
        <p>
          Per iniziare, porti dei dollari digitali (USDC) nel tuo account e li
          depositi con un tocco. Per uscire, prelevi: i tuoi USDC tornano
          disponibili e puoi riconvertirli quando vuoi.
        </p>
      </section>

      <section className="space-y-3 border-t border-warmGray-200/70 pt-5">
        <h2 className="font-display text-lg text-warmGray-700">Termini e note</h2>
        <div className="space-y-3 text-sm text-warmGray-500">
          <p>
            Al momento questi fondi non sono coperti da assicurazione sui
            depositi (FITD). Questo potrebbe cambiare in futuro.
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
      </section>
    </div>
  );
}
