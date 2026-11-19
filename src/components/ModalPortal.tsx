"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

// Renders a modal into document.body so its `fixed inset-0` resolves against the
// viewport and paints above the sticky header. SSR-safe via the mounted guard.
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
