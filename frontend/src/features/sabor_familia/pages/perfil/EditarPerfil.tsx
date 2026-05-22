import Sidebar from "../../components/page/homePageComponents/SideBar";

export default function EditarPerfil() {
  return (
    <div className="home-layout">
      <Sidebar />
      <main className="perfil-main">
        <div style={{ padding: '2rem' }}>
          <h1>Editar Perfil</h1>
          <p>O formulário de edição entrará aqui.</p>
        </div>
      </main>
    </div>
  );
}
