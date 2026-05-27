import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/UseAuth";
import { perfilService } from "../../service/PerfilService";
import "./login.css";

export function Login() {
  const navigate = useNavigate();
  const { salvarPerfil } = useAuth();
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/", { replace: true });
      return;
    }

    perfilService
      .buscarMeuPerfil()
      .then((perfil) => {
        salvarPerfil(perfil);
        navigate("/sabor-familia/home", { replace: true });
      })
      .catch((err) => {
        const status = err?.response?.status;
        if (status === 404 || status === 500 ) {
          navigate("/sabor-familia/cadastro", { replace: true });
        } else if (status === 401 || status === 403) {
          navigate("/", { replace: true });
        } else {
          setErro("Não foi possível verificar seu perfil. Tente novamente.");
        }
      });
  }, []);

  if (erro) {
    return (
      <div className="container">
        <div className="card">
          <h1>Sabor da Família</h1>
          <p className="error">{erro}</p>
          <button className="btn-submit" onClick={() => navigate("/home")}>
            Voltar à plataforma
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card" style={{ textAlign: "center" }}>
        <div className="sf-entry-spinner" />
        <p style={{ marginTop: "1rem", color: "#888", fontSize: 14 }}>
          Verificando seu perfil…
        </p>
      </div>
    </div>
  );
}

export default Login;
