import { useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { limparCacheMidia } from "../lib/midiaCache";
import Sidebar from "../components/page/homePageComponents/SideBar";
import { ProvedorDialogoConfirmacao } from "../context/DialogoConfirmacao";
import "../pages/home/homeSaborFamilia.css";
import "./saborFamiliaModuleLayout.css";

const ROTAS_SEM_SIDEBAR = ["/sabor-familia/login", "/sabor-familia/cadastro"];

function exibirSidebar(pathname: string): boolean {
  return !ROTAS_SEM_SIDEBAR.includes(pathname);
}

export function SaborFamiliaModuleLayout() {
  const { pathname } = useLocation();
  const cacheInicializado = useRef(false);
  const comSidebar = exibirSidebar(pathname);

  if (!cacheInicializado.current) {
    cacheInicializado.current = true;
    limparCacheMidia();
  }

  return (
    <ProvedorDialogoConfirmacao>
      <div className="sf-module-layout">
        {comSidebar ? (
          <div className="home-layout">
            <Sidebar />
            <Outlet />
          </div>
        ) : (
          <Outlet />
        )}
      </div>
    </ProvedorDialogoConfirmacao>
  );
}

export default SaborFamiliaModuleLayout;
