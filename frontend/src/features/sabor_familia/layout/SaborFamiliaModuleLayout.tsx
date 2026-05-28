import { Outlet } from "react-router-dom";
import "./saborFamiliaModuleLayout.css";

export function SaborFamiliaModuleLayout() {
  return (
    <div className="sf-module-layout">
      <Outlet />
    </div>
  );
}

export default SaborFamiliaModuleLayout;
