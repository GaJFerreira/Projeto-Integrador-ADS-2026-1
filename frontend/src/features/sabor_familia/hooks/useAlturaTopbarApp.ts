import { useLayoutEffect, useRef } from "react";

const ALTURA_PADRAO_TOPBAR = 64;

function medirTopbar(): number {
  const appBar = document.querySelector<HTMLElement>(".MuiAppBar-root");
  if (!appBar) return ALTURA_PADRAO_TOPBAR;
  return Math.ceil(appBar.getBoundingClientRect().height);
}

/** Ajusta --sf-app-top no layout do módulo conforme a altura real do header da plataforma. */
export function useAlturaTopbarApp() {
  const layoutRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const layout = layoutRef.current;
    if (!layout) return;

    const sincronizar = () => {
      layout.style.setProperty("--sf-app-top", `${medirTopbar()}px`);
    };

    sincronizar();

    const appBar = document.querySelector<HTMLElement>(".MuiAppBar-root");
    const observer = appBar ? new ResizeObserver(sincronizar) : null;
    if (appBar && observer) observer.observe(appBar);

    window.addEventListener("resize", sincronizar);
    window.addEventListener("orientationchange", sincronizar);

    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", sincronizar);
      window.removeEventListener("orientationchange", sincronizar);
    };
  }, []);

  return layoutRef;
}
