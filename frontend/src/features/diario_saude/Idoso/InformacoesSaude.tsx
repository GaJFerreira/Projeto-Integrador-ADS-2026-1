import {
  Container, Paper, Typography, Button, Box,
  Chip, Divider, Stack, CircularProgress, Avatar,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import MonitorWeightIcon from "@mui/icons-material/MonitorWeight";
import StraightenIcon from "@mui/icons-material/Straighten";
import MedicationIcon from "@mui/icons-material/Medication";
import ScienceIcon from "@mui/icons-material/Science";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import CoronavirusIcon from "@mui/icons-material/Coronavirus";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import AssignmentIcon from "@mui/icons-material/Assignment";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import http from "@/lib/http";

function formatarData(data: any): string {
  if (!data) return "—";
  if (Array.isArray(data)) {
    const [ano, mes, dia] = data;
    return new Date(ano, mes - 1, dia).toLocaleDateString("pt-BR");
  }
  const str = String(data);
  // Formato brasileiro "dd/MM/yyyy" — já está formatado
  if (str.includes("/")) return str;
  // Formato ISO "yyyy-MM-dd"
  const [ano, mes, dia] = str.split("T")[0].split("-").map(Number);
  return new Date(ano, mes - 1, dia).toLocaleDateString("pt-BR");
}

function calcularIdade(dataNascimento: any): number | null {
  if (!dataNascimento) return null;
  let nasc: Date;
  if (Array.isArray(dataNascimento)) {
    nasc = new Date(dataNascimento[0], dataNascimento[1] - 1, dataNascimento[2]);
  } else {
    const str = String(dataNascimento);
    // Formato brasileiro "dd/MM/yyyy"
    if (str.includes("/")) {
      const [dia, mes, ano] = str.split("/").map(Number);
      nasc = new Date(ano, mes - 1, dia);
    } else {
      const [ano, mes, dia] = str.split("T")[0].split("-").map(Number);
      nasc = new Date(ano, mes - 1, dia);
    }
  }
  const hoje = new Date();
  let idade = hoje.getFullYear() - nasc.getFullYear();
  if (hoje.getMonth() < nasc.getMonth() ||
    (hoje.getMonth() === nasc.getMonth() && hoje.getDate() < nasc.getDate())) idade--;
  return isNaN(idade) ? null : idade;
}

function StatusSaude({ pontuacao }: { pontuacao: number }) {
  if (pontuacao <= 6) return (
    <Chip label="Robusto" size="small" sx={{ bgcolor: "#e8f5e9", color: "#2e7d32", fontWeight: 600, border: "1px solid #a5d6a7" }} />
  );
  if (pontuacao <= 14) return (
    <Chip label="Em risco" size="small" sx={{ bgcolor: "#fff8e1", color: "#f57f17", fontWeight: 600, border: "1px solid #ffe082" }} />
  );
  if (pontuacao <= 20) return (
    <Chip label="Moderadamente frágil" size="small" sx={{ bgcolor: "#fff3e0", color: "#e65100", fontWeight: 600, border: "1px solid #ffcc80" }} />
  );
  return (
    <Chip label="Frágil" size="small" sx={{ bgcolor: "#ffebee", color: "#c62828", fontWeight: 600, border: "1px solid #ef9a9a" }} />
  );
}

function SecaoCard({ titulo, icone, cor, count, children }: {
  titulo: string; icone: React.ReactNode; cor: string; count: number; children: React.ReactNode;
}) {
  return (
    <Paper elevation={0} sx={{
      borderRadius: 3,
      border: "1px solid #e8eaf6",
      overflow: "hidden",
    }}>
      <Box sx={{
        px: 2.5, py: 1.5,
        bgcolor: `${cor}10`,
        borderBottom: `1px solid ${cor}30`,
        display: "flex", alignItems: "center", justifyContent: "space-between"
      }}>
        <Box display="flex" alignItems="center" gap={1}>
          {icone}
          <Typography fontWeight={600} fontSize="0.95rem">{titulo}</Typography>
        </Box>
        <Chip label={count} size="small" sx={{ bgcolor: `${cor}20`, color: cor, fontWeight: 700, border: "none", fontSize: "0.8rem" }} />
      </Box>
      <Box sx={{ p: 2.5 }}>
        {children}
      </Box>
    </Paper>
  );
}

function MetricaCard({ icone, valor, label, cor }: { icone: React.ReactNode; valor: string; label: string; cor: string }) {
  return (
    <Box sx={{
      flex: 1,
      p: 2,
      borderRadius: 2.5,
      border: "1px solid #e8eaf6",
      bgcolor: "#fafbff",
      textAlign: "center",
      display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5,
    }}>
      <Box sx={{ color: cor }}>{icone}</Box>
      <Typography fontWeight={700} fontSize="1.2rem" color={cor}>{valor}</Typography>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
    </Box>
  );
}

export default function ProntuarioPacientePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");
  const paciente = location.state?.paciente;
  const prescricao = location.state?.prescricao;

  const usuarioLogado = (() => {
    try {
      return JSON.parse(localStorage.getItem("usuario") || "null") ||
        JSON.parse(localStorage.getItem("user") || "null");
    } catch { return null; }
  })();

  const platformUserId = paciente?.platformUserId ?? usuarioLogado?.userId ?? usuarioLogado?.id;
  const idUsuarioModulo: number = prescricao?.id_usuario ?? paciente?.id_usuario;
  const headers = { Authorization: `Bearer ${token}` };

  const { data: dadosClinicos, isLoading: loadingDados } = useQuery({
    queryKey: ["prontuario", "dados", platformUserId],
    queryFn: async () => {
      const { data } = await http.get(`/api/diario_saude/usuario/por-user/${platformUserId}`, { headers });
      return data;
    },
    enabled: !!platformUserId,
  });

  const idUsuario: number = idUsuarioModulo ?? dadosClinicos?.id_usuario;

  const { data: doencas = [], isLoading: loadingDoencas } = useQuery({
    queryKey: ["prontuario", "doencas", idUsuario],
    queryFn: async () => {
      const { data } = await http.get(`/api/diario_saude/usuario-doenca/usuario/${idUsuario}`, { headers });
      return Array.isArray(data) ? data : [];
    },
    enabled: !!idUsuario,
  });

  const { data: alergias = [], isLoading: loadingAlergias } = useQuery({
    queryKey: ["prontuario", "alergias", idUsuario],
    queryFn: async () => {
      const { data } = await http.get(`/api/diario_saude/usuario-alergia/usuario/${idUsuario}`, { headers });
      return Array.isArray(data) ? data : [];
    },
    enabled: !!idUsuario,
  });

  const { data: prescricoes = [], isLoading: loadingPrescricoes } = useQuery({
    queryKey: ["prontuario", "prescricoes", idUsuario],
    queryFn: async () => {
      const { data } = await http.get(`/api/diario_saude/prescricao/usuario/${idUsuario}`, { headers });
      return Array.isArray(data) ? data : [];
    },
    enabled: !!idUsuario,
  });

  const { data: respostas = [] } = useQuery({
    queryKey: ["prontuario", "questionario", platformUserId],
    queryFn: async () => {
      const { data } = await http.get(`/api/diario_saude/questionario/respostas/${platformUserId}`, { headers });
      return Array.isArray(data) ? data : [];
    },
    enabled: !!platformUserId,
  });

  const pontuacaoTotal = respostas.reduce((acc: number, r: any) => acc + (r.peso ?? 0), 0);
  const todosExames = prescricoes.flatMap((p: any) => Array.isArray(p.exames) ? p.exames : []);
  const todosMedicamentos = prescricoes.flatMap((p: any) => Array.isArray(p.medicamentos) ? p.medicamentos : []);
  const todosExercicios = prescricoes.flatMap((p: any) => Array.isArray(p.exerciciosRecomendados) ? p.exerciciosRecomendados : []);

  const carregando = loadingDados || loadingDoencas || loadingAlergias || loadingPrescricoes;
  const nomePaciente = dadosClinicos?.nome ?? paciente?.nome ?? "Paciente";
  const inicial = nomePaciente[0]?.toUpperCase() ?? "P";
  const idade = calcularIdade(dadosClinicos?.dataNascimento) ?? dadosClinicos?.idade;
  const imc = dadosClinicos?.peso > 0 && dadosClinicos?.altura > 0
    ? (dadosClinicos.peso / Math.pow(dadosClinicos.altura / 100, 2)).toFixed(1)
    : null;

  const vazioMsg = (msg: string) => (
    <Typography color="text.secondary" fontSize="0.9rem" sx={{ fontStyle: "italic" }}>{msg}</Typography>
  );

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Cabeçalho */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 3, border: "1px solid #e8eaf6", borderTop: "4px solid #1565c0" }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={1.5}>
            <AssignmentIcon sx={{ fontSize: 32, color: "#1565c0" }} />
            <Box>
              <Typography variant="h5" fontWeight={700} color="#1565c0" letterSpacing={1}>PRONTUÁRIO</Typography>
              <Typography variant="caption" color="text.secondary">Plataforma UNATI — Diário da Saúde</Typography>
            </Box>
          </Box>
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} size="small" sx={{ textTransform: "none" }}>
            Voltar
          </Button>
        </Box>
      </Paper>

      {carregando ? (
        <Box display="flex" justifyContent="center" py={8}><CircularProgress /></Box>
      ) : (
        <Stack spacing={2}>

          {/* Card de identificação */}
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid #e8eaf6", background: "linear-gradient(135deg, #f8f9ff 0%, #eef2ff 100%)" }}>
            <Box display="flex" alignItems="center" gap={2} mb={2.5}>
              <Avatar sx={{
                width: 60, height: 60,
                bgcolor: "#1565c0",
                fontSize: "1.5rem",
                fontWeight: 700,
                boxShadow: "0 2px 8px #1565c040"
              }}>
                {inicial}
              </Avatar>
              <Box flex={1}>
                <Typography variant="h6" fontWeight={700} color="#1a237e">{nomePaciente}</Typography>
                {dadosClinicos?.dataNascimento && (
                  <Typography variant="body2" color="text.secondary">
                    Nascimento: {formatarData(dadosClinicos.dataNascimento)}
                    {idade !== null && ` · ${idade} anos`}
                  </Typography>
                )}
                {respostas.length > 0 && (
                  <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                    <Typography variant="caption" color="text.secondary">Status:</Typography>
                    <StatusSaude pontuacao={pontuacaoTotal} />
                    <Typography variant="caption" color="text.secondary">({pontuacaoTotal} pts)</Typography>
                  </Box>
                )}
              </Box>
            </Box>

            {/* Métricas biométricas */}
            {(dadosClinicos?.peso > 0 || dadosClinicos?.altura > 0 || imc) && (
              <>
                <Divider sx={{ mb: 2 }} />
                <Box display="flex" gap={1.5}>
                  {dadosClinicos?.peso > 0 && (
                    <MetricaCard icone={<MonitorWeightIcon fontSize="small" />} valor={`${dadosClinicos.peso} kg`} label="Peso" cor="#1565c0" />
                  )}
                  {dadosClinicos?.altura > 0 && (
                    <MetricaCard icone={<StraightenIcon fontSize="small" />} valor={`${dadosClinicos.altura} cm`} label="Altura" cor="#1565c0" />
                  )}
                  {imc && (
                    <MetricaCard
                      icone={<PersonIcon fontSize="small" />}
                      valor={imc}
                      label="IMC"
                      cor={parseFloat(imc) < 18.5 ? "#1565c0" : parseFloat(imc) < 25 ? "#2e7d32" : parseFloat(imc) < 30 ? "#f57c00" : "#c62828"}
                    />
                  )}
                </Box>
              </>
            )}
          </Paper>

          {/* Doenças */}
          <SecaoCard titulo="Doenças Diagnosticadas" icone={<CoronavirusIcon sx={{ color: "#c62828", fontSize: 20 }} />} cor="#c62828" count={doencas.length}>
            {doencas.length === 0 ? vazioMsg("Nenhuma doença registrada.") : (
              <Box display="flex" gap={1} flexWrap="wrap">
                {doencas.map((d: any) => (
                  <Chip key={d.id} label={`${d.codigo} — ${d.nome}`} size="small"
                    sx={{ bgcolor: "#ffebee", color: "#b71c1c", border: "1px solid #ef9a9a", fontWeight: 500 }} />
                ))}
              </Box>
            )}
          </SecaoCard>

          {/* Alergias */}
          <SecaoCard titulo="Alergias" icone={<WarningAmberIcon sx={{ color: "#e65100", fontSize: 20 }} />} cor="#e65100" count={alergias.length}>
            {alergias.length === 0 ? vazioMsg("Nenhuma alergia registrada.") : (
              <Box display="flex" gap={1} flexWrap="wrap">
                {alergias.map((a: any) => (
                  <Chip key={a.id} label={a.nome} size="small"
                    sx={{ bgcolor: "#fff3e0", color: "#bf360c", border: "1px solid #ffcc80", fontWeight: 500 }} />
                ))}
              </Box>
            )}
          </SecaoCard>

          {/* Receituário */}
          <SecaoCard titulo="Receituário Médico" icone={<MedicationIcon sx={{ color: "#c62828", fontSize: 20 }} />} cor="#c62828" count={todosMedicamentos.length}>
            {todosMedicamentos.length === 0 ? vazioMsg("Nenhum medicamento prescrito.") : (
              <Stack spacing={1.5}>
                {todosMedicamentos.map((m: any, i: number) => (
                  <Box key={i} sx={{ p: 1.5, borderRadius: 2, bgcolor: "#fff", border: "1px solid #f5e6e6" }}>
                    <Typography fontWeight={600} fontSize="0.9rem">{m.nome_medicamento}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {[m.principio_ativo, m.concentracao, m.via].filter(v => v && v !== "-").join(" · ")}
                    </Typography>
                    <Box display="flex" gap={0.5} mt={0.5} flexWrap="wrap">
                      {m.dosagem && <Chip label={`Dose: ${m.dosagem}`} size="small" variant="outlined" sx={{ fontSize: "0.75rem", height: 22 }} />}
                      {m.frequencia && <Chip label={`Freq: ${m.frequencia}`} size="small" variant="outlined" sx={{ fontSize: "0.75rem", height: 22 }} />}
                    </Box>
                  </Box>
                ))}
              </Stack>
            )}
          </SecaoCard>

          {/* Exames */}
          <SecaoCard titulo="Exames" icone={<ScienceIcon sx={{ color: "#f57c00", fontSize: 20 }} />} cor="#f57c00" count={todosExames.length}>
            {todosExames.length === 0 ? vazioMsg("Nenhum exame solicitado.") : (
              <Stack spacing={1}>
                {todosExames.map((e: any, i: number) => (
                  <Box key={i} sx={{ p: 1.5, borderRadius: 2, bgcolor: "#fff", border: "1px solid #ffe0b2", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <Box flex={1}>
                      <Typography fontWeight={600} fontSize="0.9rem">{e.nome_exame}</Typography>
                      {e.resultado && (
                        <Typography variant="caption" color="text.secondary">Resultado: {e.resultado}</Typography>
                      )}
                    </Box>
                    {e.resultado
                      ? <Chip label="Analisado" size="small" sx={{ bgcolor: "#e8f5e9", color: "#2e7d32", border: "1px solid #a5d6a7", fontSize: "0.75rem", height: 22 }} />
                      : <Chip label="Pendente" size="small" sx={{ bgcolor: "#fff8e1", color: "#f57f17", border: "1px solid #ffe082", fontSize: "0.75rem", height: 22 }} />
                    }
                  </Box>
                ))}
              </Stack>
            )}
          </SecaoCard>

          {/* Exercícios */}
          <SecaoCard titulo="Exercícios Recomendados" icone={<FitnessCenterIcon sx={{ color: "#2e7d32", fontSize: 20 }} />} cor="#2e7d32" count={todosExercicios.length}>
            {todosExercicios.length === 0 ? vazioMsg("Nenhuma recomendação de exercício.") : (
              <Stack spacing={1}>
                {todosExercicios.map((e: any, i: number) => (
                  <Box key={i} sx={{ p: 1.5, borderRadius: 2, bgcolor: "#fff", border: "1px solid #c8e6c9", display: "flex", alignItems: "center", gap: 1 }}>
                    <FitnessCenterIcon sx={{ fontSize: 16, color: "#388e3c" }} />
                    <Typography fontSize="0.9rem">{e.descricao}</Typography>
                  </Box>
                ))}
              </Stack>
            )}
          </SecaoCard>

        </Stack>
      )}
    </Container>
  );
}