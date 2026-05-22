import { useLogin } from "../../hooks/UsePerfil";
import { useNavigate } from "react-router-dom";
import "./login.css";

export function Login() {
  const { login, loading, error } = useLogin();
    const navigate = useNavigate();
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    const usernameOrEmail = (form.elements.namedItem("usernameOrEmail") as HTMLInputElement).value;
    const password        = (form.elements.namedItem("password")        as HTMLInputElement).value;

    await login(usernameOrEmail, password);
  };

  return (
    <div className="container">
      <div className="card">
        <h1>Sabor da Família</h1>
        <p>Entre com seu usuário ou e-mail</p>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Usuário ou e-mail</label>
            <input
              name="usernameOrEmail"
              placeholder="usuario ou exemplo@email.com"
              required
            />
          </div>
          <div className="field">
            <label>Senha</label>
            <input
              name="password"
              type="password"
              placeholder="Sua senha"
              required
            />
          </div>

          <p className="cp-cadastro-link">
            Não tem um perfil?{" "}
            <button type="button" className="cp-link-btn" onClick={() => navigate("/sabor-familia/cadastro")}>
              Criar perfil
            </button>
          </p>

          <button className="btn-submit" type="submit" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </button>
          {error && <p className="error">{error}</p>}
        </form>
      </div>
    </div>
  );
}

export default Login;
