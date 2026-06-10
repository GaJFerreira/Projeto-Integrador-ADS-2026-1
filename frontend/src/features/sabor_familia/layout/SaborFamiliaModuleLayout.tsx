import { useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { limparCacheMidia } from "../lib/midiaCache";
import Sidebar from "../components/page/homePageComponents/SideBar";
import { BarraInferiorMobile } from "../components/layout/BarraInferiorMobile";
import { ProvedorDialogoConfirmacao } from "../context/DialogoConfirmacao";
import { ChatSocketProvider } from "../context/ChatSocketContext";
import { useAlturaTopbarApp } from "../hooks/useAlturaTopbarApp";
import "../pages/home/homeSaborFamilia.css";
import "./saborFamiliaModuleLayout.css";

const ROTAS_SEM_SIDEBAR = ["/sabor-familia/login", "/sabor-familia/cadastro"];

function exibirSidebar(pathname: string): boolean {
  return !ROTAS_SEM_SIDEBAR.includes(pathname);
}

export function SaborFamiliaModuleLayout() {
  const { pathname } = useLocation();
  const cacheInicializado = useRef(false);
  const layoutRef = useAlturaTopbarApp();
  const comSidebar = exibirSidebar(pathname);
  const chatSocketAtivo =
    comSidebar && typeof localStorage !== "undefined" && !!localStorage.getItem("token");

  if (!cacheInicializado.current) {
    cacheInicializado.current = true;
    limparCacheMidia();
  }

  return (
    <ProvedorDialogoConfirmacao>
      <ChatSocketProvider enabled={chatSocketAtivo}>
      <div ref={layoutRef} className="sf-module-layout">
        {comSidebar ? (
          <div className="home-layout home-layout--com-nav-inferior">
            <Sidebar />
            <div className="home-layout__conteudo">
              <Outlet />
            </div>
            <BarraInferiorMobile />
          </div>
        ) : (
          <Outlet />
        )}
      </div>
      </ChatSocketProvider>
    </ProvedorDialogoConfirmacao>
  );
}

export default SaborFamiliaModuleLayout;
