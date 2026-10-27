import { StrictMode, Suspense, useEffect } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { variants } from "./variants/registry";
import { VariantIndex } from "./variants/Index";

// Path-based switch: /a/, /b/, … render a design draft; anything else shows the index.
const key = window.location.pathname.split("/").filter(Boolean)[0]?.toLowerCase();
const current = variants.find((v) => v.key === key);
// Set before the first render so variant-scoped CSS (html[data-variant="c"]) applies on first paint.
document.documentElement.dataset.variant = current?.key ?? "index";

function Root() {
  useEffect(() => {
    const bg = current?.theme.bg ?? "#0b0b0c";
    document.documentElement.style.background = bg;
    document.body.style.background = bg;
  }, []);
  if (!current) return <VariantIndex />;
  const C = current.Component;
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: current.theme.bg }} />}>
      <C />
    </Suspense>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
