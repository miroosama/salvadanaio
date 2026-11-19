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
      className={`relative pb-3 text-sm font-semibold tracking-wide transition-colors ${
        tab === id ? "text-ink" : "text-warmGray-400 hover:text-warmGray-600"
      }`}
      aria-pressed={tab === id}
    >
      {label}
      {tab === id && (
        <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-terracotta-500" />
      )}
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
        className="absolute inset-0 bg-black/50"
        onClick={close}
      />

      <div
        ref={panelRef}
        className="relative bg-card border-[1.5px] border-mint-300 w-full max-h-[88vh] rounded-t-2xl sm:max-h-[82vh] sm:max-w-lg sm:rounded-2xl flex flex-col shadow-modal"
      >
        {/* Drag handle + close */}
        <div
          className="pt-3 px-6 shrink-0"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div className="mx-auto w-10 h-1.5 rounded-full bg-warmGray-200 sm:hidden" />
          <div className="flex items-end justify-between mt-4 border-b border-warmGray-200/70">
            <div className="flex gap-6">
              {tabBtn("chi", "Chi siamo")}
              {tabBtn("guida", "Guida")}
            </div>
            <button
              ref={closeBtnRef}
              onClick={close}
              aria-label="Chiudi"
              className="mb-1 w-9 h-9 shrink-0 flex items-center justify-center rounded-full text-warmGray-400 hover:text-warmGray-700 hover:bg-warmGray-100 text-2xl leading-none transition-colors"
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

// Chi siamo is the closest thing to our "who we are" blog — bilingual on
// purpose (Italian first, English below). The rest of the app stays Italian.
const CHI_SIAMO_IT = [
  "Salvadanaio nasce da un'idea semplice. I tuoi soldi dovrebbero crescere ed essere davvero tuoi, senza vincoli, senza trucchi, senza sorprese. Oggi hai due scelte, e ti deludono entrambe.",
  "C'è la banca. Rende poco o niente, blocca i tuoi soldi con vincoli e penali, è lenta a restituirteli, ed è lei a decidere cosa puoi farne. I tuoi risparmi non sono mai davvero nelle tue mani.",
  "E c'è la cripto com'è oggi, che spesso non è meglio. Commissioni nascoste che si mangiano i tuoi guadagni. Token creati solo per essere gonfiati e abbandonati. App che si dicono decentralizzate ma in realtà centralizzano la custodia legandola alla tua identità dietro il loro portale. Tante promesse, poca onestà.",
  "Iniziare è semplice: un account smart facile, senza seed phrase e senza gergo tecnico, e senza commissioni, perché i costi di rete li copriamo noi. Non esiste nessun nostro token da gonfiare e abbandonare, solo i tuoi dollari che rendono davvero su Aave, uno dei protocolli più grandi e collaudati al mondo, aperto e verificabile, con numeri onesti al netto delle tasse. E i tuoi soldi sono sempre tuoi, liberi di spostarsi su qualsiasi wallet, quando vuoi, senza vincoli e senza niente che possiamo bloccare.",
  "L'account smart è la via d'ingresso facile. Stiamo costruendo strumenti aperti per una vera auto-custodia, con le chiavi completamente nelle tue mani e pronte per il tuo hardware wallet, così diventare del tutto indipendente è qualcosa in cui cresci, non qualcosa che devi strapparci.",
  "Non ci chiamiamo Salvadanaio per caso. È il salvadanaio che avevi da bambino, il primo posto dove hai messo i tuoi soldi. Facile da riempire, e facile da rompere nel momento in cui vuoi ciò che c'è dentro. È tutta qui la promessa: facile iniziare, gratis mettere i soldi, gratis portarli via. Salvadanaio è un progetto giovane e il primo pezzo di un piano più grande, un ecosistema in crescita di prodotti e strumenti DeFi. Lo costruiamo su basi solide — un onboarding vero, un onramp semplice, educazione finanziaria e una crescita costante — così tutto ciò che verrà dopo è resiliente e solido.",
];

const CHI_SIAMO_EN = [
  "Salvadanaio started from a simple idea. Your money should grow and be truly yours, with no lock-ups, no tricks, no surprises. Today you get two choices, and both let you down.",
  "There's the bank. It pays little or nothing, locks your money behind terms and penalties, is slow to give it back, and it decides what you can do with it. Your savings are never really in your hands.",
  "And there's crypto as it is today, which often isn't any better. Hidden fees that eat your returns. Tokens made only to be pumped and dumped. Apps that call themselves decentralized while quietly centralizing custody by tying it to your identity behind their portal. Plenty of promises, little honesty.",
  "Getting started is simple: an easy smart account with no seed phrase and no jargon, and no fees, because we cover the network costs ourselves. There's no token of ours to pump and dump, just your dollars earning real yield on Aave, one of the largest and most battle-tested protocols in the world, open and verifiable, at honest numbers after tax. And your money is always yours, free to move to any wallet, any time, with no strings and nothing we can freeze.",
  "The smart account is the easy way in. We're building open tooling for true self-custody, your keys fully in your own hands and ready for your own hardware wallet, so going fully independent is something you grow into, never something you fight us for.",
  "There's a reason we're called Salvadanaio. It's the piggybank you had as a kid, the first place you ever kept your own money. Easy to feed, and easy to smash open the moment you want what's inside. That's the whole promise: easy to start, free to put your money in, free to take it out. Salvadanaio is a young project and the first piece of a bigger plan, a growing ecosystem of DeFi products and tools. We're building it on a strong foundation — real onboarding, a simple onramp, financial literacy, and steady growth — so everything that comes next is resilient and sound.",
];

function ChiSiamo() {
  return (
    <div className="space-y-8 leading-relaxed">
      <section className="space-y-4 text-warmGray-600">
        <h2 className="font-display text-2xl text-ink">
          I tuoi risparmi, come dovrebbero essere
        </h2>
        {CHI_SIAMO_IT.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </section>

      <section className="space-y-4 text-warmGray-500 border-t border-warmGray-200/70 pt-8">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold tracking-widest uppercase text-warmGray-400">
            English
          </span>
          <span className="flex-1 h-px bg-warmGray-200/70" />
        </div>
        <h2 className="font-display text-2xl text-warmGray-700">
          Your savings, the way they should be
        </h2>
        {CHI_SIAMO_EN.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </section>
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
          dollaro, ed è usata da milioni di persone nel mondo. Nell&apos;app usi
          sempre USDC sulla rete Base. Il tuo saldo è in dollari, non in euro —
          il controvalore in euro dipende dal cambio €/$ e può salire o scendere.
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
        <h2 className="font-display text-xl text-ink">Il tuo account</h2>
        <p>
          Il tuo account è un wallet Coinbase Smart Wallet: lo crei e lo sblocchi
          con Face ID o impronta — una passkey — senza seed phrase da annotare.
          Il recupero dell&apos;accesso passa da Coinbase (keys.coinbase.com);
          noi non deteniamo le tue chiavi e non possiamo accedere al tuo account.
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

      <section className="space-y-2">
        <h2 className="font-display text-xl text-ink">Niente blocco</h2>
        <p>
          Nessun vincolo, nessuna penale. Depositi e prelevi quando vuoi, i tuoi
          soldi restano sempre tuoi. A differenza di un conto deposito
          vincolato, non c&apos;è una durata fissa né una penale per uscire.
        </p>
        <p>
          L&apos;unico momento in cui un prelievo può richiedere un attimo è se
          il pool di Aave è temporaneamente al massimo utilizzo. In quel caso
          ritiri subito la parte disponibile e il resto si libera man mano che i
          prestiti vengono rimborsati. Non è un vincolo e non ci sono penali, è
          solo la liquidità del mercato che torna disponibile. Con USDC capita
          raramente.
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
