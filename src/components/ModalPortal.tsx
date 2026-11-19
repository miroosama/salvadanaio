"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

// Renders a modal overlay into document.body, so its `fixed inset-0` resolves
// against the viewport (not an ancestor) and paints above the sticky header —
// otherwise the backdrop only covers the content area and leaves a split at the
// header. SSR-safe via the mounted guard (document is client-only).
export default function ModalPortal({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return createPortal(children, document.body);
}
