import { IS_TESTNET } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="mx-auto max-w-2xl px-5 sm:px-8 py-10 w-full">
      <div className="border-t border-warmGray-200/50 pt-6 flex flex-col items-center gap-2 text-center">
        <span className="font-display text-sm text-warmGray-500">
          Salvadanaio
        </span>
        <p className="text-xs text-warmGray-400">
          {IS_TESTNET
            ? "Alpha · Base Sepolia · non ancora auditato"
            : "Alpha · Base"}
        </p>
        {/* Future: cost-transparency ("cosa ci costa"), GitHub, how-it-works,
            "abbiamo costruito la tua uscita" / off-ramp, links. */}
      </div>
    </footer>
  );
}
