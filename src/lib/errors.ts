// Maps a raw wallet/RPC/contract error to a friendly Italian title while
// keeping the original text (detail) for an expandable "details" section.
export interface FriendlyError {
  title: string;
  detail: string;
}

export function parseTxError(err: unknown): FriendlyError {
  const e = err as {
    name?: string;
    shortMessage?: string;
    details?: string;
    message?: string;
  };
  const raw = e?.shortMessage || e?.details || e?.message || String(err);
  const lower = raw.toLowerCase();

  if (
    e?.name === "UserRejectedRequestError" ||
    lower.includes("user rejected") ||
    lower.includes("user denied") ||
    lower.includes("rejected the request")
  ) {
    return { title: "Hai annullato l'operazione.", detail: raw };
  }
  if (lower.includes("insufficient funds")) {
    return {
      title: "Fondi insufficienti per coprire le commissioni di rete.",
      detail: raw,
    };
  }
  if (lower.includes("exceeds balance") || lower.includes("transfer amount")) {
    return { title: "Saldo insufficiente per questa operazione.", detail: raw };
  }
  if (lower.includes("revert")) {
    return {
      title: "La transazione è stata rifiutata dalla blockchain.",
      detail: raw,
    };
  }
  if (lower.includes("timeout") || lower.includes("network") || lower.includes("fetch")) {
    return { title: "Problema di rete. Riprova tra poco.", detail: raw };
  }

  return { title: "Qualcosa è andato storto. Riprova.", detail: raw };
}
