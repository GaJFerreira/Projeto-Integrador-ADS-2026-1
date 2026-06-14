import { Route, Routes, Navigate } from 'react-router-dom';
import AppLayout from '@/layouts/AppLayout';
import { ModuleGrid } from '@/components/ModuleGrid';
import UsuariosPage from '@/features/grupo1/pages/UsuariosPage';
import LoginPage from '@/features/auth/pages/LoginPage';
import AdminPage from '@/features/admin/pages/AdminPage';
import EditUsuarioPage from '@/features/admin/pages/EditUsuarioPage';
import EditMedicoPage from '@/features/admin/pages/EditMedicoPage';
import EditCuidadorPage from '@/features/admin/pages/EditCuidadorPage';
import AdminUsuariosPage from '@/features/admin/pages/AdminUsuariosPage';
import AdminPermissoesPage from '@/features/admin/pages/AdminPermissoesPage';
import AdminMedicosPage from '@/features/admin/pages/AdminMedicosPage';
import AdminCuidadoresPage from '@/features/admin/pages/AdminCuidadoresPage';
import AdminUsuarioCreatePage from '@/features/admin/pages/AdminUsuarioCreatePage';
import AdminProdutosPage from '@/features/admin/pages/AdminProdutosPage';
import AdminProdutoCreatePage from '@/features/admin/pages/AdminProdutoCreatePage';
import AdminProdutoEditPage from '@/features/admin/pages/AdminProdutoEditPage';
import AtendimentoMedico from '@/features/atendimento/AtendimentoMedico';

// Elden Care
import QuestionarioEldenCare from '@/features/eldercare/QuestionarioDemo';

//Care Hub
import { CareHubRoutes } from '@/features/carehub/routes/CareHubRoutes';

//Diário Saúde
        
import InformacoesSaude from '@/features/diario_saude/Idoso/InformacoesSaude';
import QuestionarioPage from '@/features/diario_saude/Idoso/QuestionarioPage';
import HistoricoConsultasPage from '@/features/diario_saude/Idoso/HistoricoConsultasPage';
import DadosBiometricosPage from '@/features/diario_saude/Idoso/DadosBiometricosPage';
import SaudeMenuPage from '@/features/diario_saude/Idoso/SaudeMenuPage';
import ReceituarioPage from '@/features/diario_saude/Medico/ReceituarioPage';
import DiagnosticarDoencaPage from '@/features/diario_saude/Medico/DiagnosticarDoencaPage';
import IniciarConsulta from '@/features/diario_saude/Medico/IniciarConsultaPage';
import MedicoDashboard from '@/features/diario_saude/Medico/MedicoDashboard';
import InformacoesMedicoPage from '@/features/diario_saude/Medico/InformacoesMedicoPage';
import PedirExamesPage from '@/features/diario_saude/Medico/PedirExamesPage';
import RecomendacaoExerciciosPage from '@/features/diario_saude/Medico/RecomendacaoExerciciosPage';
import HistoricoConsultasMedicoPage from '@/features/diario_saude/Medico/HistoricoConsultasMedicoPage';
import AlergiasPage from '@/features/diario_saude/Medico/AlergiasPage';
import MedicoRespostasQuestionarioPage from '@/features/diario_saude/Medico/MedicoRespostasQuestionarioPage';
import RegistrarResultadoExamePage from '@/features/diario_saude/Medico/RegistrarResultadoExamePage';
import GerenciarQuestionarioPage from '@/features/diario_saude/Admin/GerenciarQuestionarioPage';
import CadastroAlergiaDoencaPage from '@/features/diario_saude/Admin/CadastroAlergiaDoencaPage';
        
//Lista Compras     
        
import ListaComprasPage from '@/features/lista-compras/pages/ListaComprasPage';
import CreateListaPage from '@/features/lista-compras/pages/CreateListaPage';
import EditListaPage from '@/features/lista-compras/pages/EditListaPage';
import ViewListaPage from '@/features/lista-compras/pages/ViewListaPage';
import TemplatesPage from '@/features/lista-compras/pages/TemplatesPage';

// ✅ Remember — Diário Cognitivo
import RememberPage from '@/features/remember/pages/RememberPage';
import AdminConquistasPage from '@/features/remember/pages/AdminConquistasPage';
import AdminCreateConquistaPage from '@/features/remember/pages/AdminCreateConquistaPage';
import AdminEditConquistaPage from '@/features/remember/pages/AdminEditConquistaPage';


// Jogos
import JogosPage from "@/features/jogos/pages/JogosPage.tsx";

// Dose Certa
import CadastroMedicamento from '@/features/medicamentos/components/CadastroMedicamento';
import HistoricoMedicamentosPage from '@/features/medicamentos/pages/HistoricoMedicamentosPage';
import ListaMedicamentosPage from '@/features/medicamentos/pages/ListaMedicamentosPage';
import InitialPage from '@/features/medicamentos/pages/InicialPage';
import EditarMedicamentoPage from "@/features/medicamentos/pages/EditarMedicamentoPage";


//Sabor Familia

import LoginSaborFamilia from '@/features/sabor_familia/pages/login/login';
import CriarPerfil from '@/features/sabor_familia/pages/perfil/CriarPerfil';
import { HomeSaborFamilia } from '@/features/sabor_familia/pages/home/HomeSaborFamilia';
import AddReceita from '@/features/sabor_familia/pages/receita/AdicionarReceita';
import EditarReceita from '@/features/sabor_familia/pages/receita/EditarReceita';
import ReceitaDetalhe from '@/features/sabor_familia/pages/receita/ReceitaDetalhe';
import ErrorSaborFamilia from '@/features/sabor_familia/pages/error/Error';
import Perfil from '@/features/sabor_familia/pages/perfil/Perfil';
import { Explorar } from '@/features/sabor_familia/pages/explorar/Explorar';
import { Chat } from '@/features/sabor_familia/pages/chat/Chat';
import { Favoritos } from '@/features/sabor_familia/pages/favoritos/Favoritos';
import { VerSeguidores, VerSeguindo } from '@/features/sabor_familia/pages/ver_seguidores/VerSeguidores';
import { Configuracoes } from '@/features/sabor_familia/pages/configuracoes/Configuracoes';
import { AuthProvider } from '@/features/sabor_familia/context/AuthProvider';
import SaborFamiliaModuleLayout from '@/features/sabor_familia/layout/SaborFamiliaModuleLayout';


function Home() {
  return (
    <div>
      <h1 style={{ fontSize: '2rem', margin: 0 }}>Plataforma de Auxílio ao Idoso</h1>
      <p style={{ fontSize: '1.125rem', lineHeight: 1.7, color: '#345' }}>
        Bem-vindo(a)! Esta é uma plataforma para promover bem-estar e inclusão.
      </p>
      <h2 style={{ fontSize: '1.6rem' }}>Módulos</h2>
      <ModuleGrid />
    </div>
  );
}

export function AppRoutes() {
  return (
    <Routes>
      {/* Tela inicial: Login */}
      <Route path="/" element={<LoginPage />} />

      {/* Áreas autenticadas */}
      <Route element={<AppLayout />}>
        <Route path="/home" element={<Home />} />

        {/* Rotas administrativas */}
        <Route path="admin" element={<AdminPage />} />
        <Route path="admin/usuarios" element={<AdminUsuariosPage />} />
        <Route path="admin/usuarios/novo" element={<AdminUsuarioCreatePage />} />
        <Route path="admin/permissoes" element={<AdminPermissoesPage />} />
        <Route path="admin/medicos" element={<AdminMedicosPage />} />
        <Route path="admin/cuidadores" element={<AdminCuidadoresPage />} />
        <Route path="admin/usuarios/:id/edit" element={<EditUsuarioPage />} />
        <Route path="admin/medicos/:id/edit" element={<EditMedicoPage />} />
        <Route path="admin/cuidadores/:id/edit" element={<EditCuidadorPage />} />

        {/* Admin: Produtos da Lista de Compras */}
        <Route path="admin/produtos" element={<AdminProdutosPage />} />
        <Route path="admin/produtos/novo" element={<AdminProdutoCreatePage />} />
        <Route path="admin/produtos/:id/edit" element={<AdminProdutoEditPage />} />

        {/* Rotas gerais */}
        <Route path="usuarios" element={<UsuariosPage />} />

        {/* Nova rota: Atendimento Médico */}
        <Route path="atendimento" element={<AtendimentoMedico />} />
        <Route path="atendimento/receituario" element={<ReceituarioPage />} />
        <Route path="atendimento/exames" element={<PedirExamesPage />} />
        <Route path="atendimento/exercicios" element={<RecomendacaoExerciciosPage />} />
        <Route path="atendimento/alergias" element={<AlergiasPage />} />
        <Route path="atendimento/doencas" element={<DiagnosticarDoencaPage />} />
        <Route path="atendimento/historico-medico" element={<HistoricoConsultasMedicoPage />} />
        <Route path="atendimento/resultado-exames" element={<RegistrarResultadoExamePage />} />
        <Route path="medico" element={<IniciarConsulta />} />
        <Route path="medico/respostas-questionario" element={<MedicoRespostasQuestionarioPage />} />
        <Route path="atendimento/dashboard" element={<MedicoDashboard />} />
        <Route path="informacoes_medico" element={<InformacoesMedicoPage />} />

        {/* Compre com Saúde (Lista de Compras) */}
        <Route path="lista-compras" element={<ListaComprasPage />} />
        <Route path="lista-compras/nova" element={<CreateListaPage />} />
        <Route path="lista-compras/listas" element={<ViewListaPage />} />
        <Route path="lista-compras/templates" element={<TemplatesPage />} />
        <Route path="lista-compras/:listaId/editar" element={<EditListaPage />} />

        {/* Elden Care */}
        <Route path="elden-care/questionario" element={<QuestionarioEldenCare />} />

         {/* CareHub */}
        <Route path="carehub/*" element={<CareHubRoutes />} />

        {/* Rota fallback */}
        <Route path="*" element={<Navigate to="/home" replace />} />

        {/* ── diario-saude: Admin */}
        <Route path="admin/questionario" element={<GerenciarQuestionarioPage />} />
        <Route path="admin/cadastro-alergia-doenca" element={<CadastroAlergiaDoencaPage />} />

        {/* ── diario-saude: Idoso */}
        <Route path="saude" element={<SaudeMenuPage />} />
        <Route path="historico_consultas" element={<HistoricoConsultasPage />} />
        <Route path="informacoes_saude" element={<InformacoesSaude />} />
        <Route path="questionario_saude" element={<QuestionarioPage />} />
        <Route path="dados_biometricos" element={<DadosBiometricosPage />} />


        {/* Diário Cognitivo (Remember) */}
        <Route path="remember" element={<RememberPage />} />

        {/* Admin: Gestão de Conquistas do Remember */}
        <Route path="admin/conquistas" element={<AdminConquistasPage />} />
        <Route path="admin/conquistas/novo" element={<AdminCreateConquistaPage />} />
        <Route path="admin/conquistas/:id/edit" element={<AdminEditConquistaPage />} />


        {/* Jogos */}
        <Route path="jogos" element={<JogosPage/>}/>

        {/* Rotas de Medicamentos */}
        <Route path="dose-certa">
        <Route path="" element={<InitialPage />} />
        <Route path="cadastro" element={<CadastroMedicamento />} />
        <Route path="editar/:id" element={<EditarMedicamentoPage />} />
        <Route path="historico" element={<HistoricoMedicamentosPage />} />
        <Route path="listagem" element={<ListaMedicamentosPage />} />
        <Route path="lista" element={<ListaMedicamentosPage />} />
        </Route>


        {/* Rotas Modulo Sabor_Familia */}
        <Route
          path="sabor-familia"
          element={
            <AuthProvider>
              <SaborFamiliaModuleLayout />
            </AuthProvider>
          }
        >
          <Route path="login" element={<LoginSaborFamilia />} />
          <Route path="cadastro" element={<CriarPerfil />} />
          <Route path="home" element={<HomeSaborFamilia />} />
          <Route path="explorar" element={<Explorar />} />
          <Route path="mensagens" element={<Chat />} />
          <Route path="configuracoes" element={<Configuracoes />} />
          <Route path="favoritos" element={<Favoritos />} />
          <Route path="perfil/:perfilId/seguidores" element={<VerSeguidores />} />
          <Route path="perfil/:perfilId/seguindo" element={<VerSeguindo />} />
          <Route path="receita/nova" element={<AddReceita />} />
          <Route path="receita/:receitaId/editar" element={<EditarReceita />} />
          <Route path="receita/:receitaId" element={<ReceitaDetalhe />} />
          <Route path="perfil/:perfilId" element={<Perfil />} />
          <Route path="error" element={<ErrorSaborFamilia />} />
          <Route path="*" element={<ErrorSaborFamilia />} />
        </Route>

      </Route>
    </Routes>
  );
}