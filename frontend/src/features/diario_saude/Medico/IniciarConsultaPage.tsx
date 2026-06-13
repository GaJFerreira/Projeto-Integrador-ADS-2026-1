import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container, Paper, Typography, TextField, Box,
  Avatar, Chip, CircularProgress, InputAdornment,
  Card, CardActionArea, CardContent, Grid, Alert,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { useQuery, useMutation } from "@tanstack/react-query";
import type { Prescricao, CriarPrescricaoDTO } from "../api/types";
import http from "@/lib/http";
import RoundedButton from "../components/RoundedButton";

const getAuthHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

const getUsuarioLogado = () => {
  try {
    return (
      JSON.parse(localStorage.getItem("usuario") || "null") ||
      JSON.parse(localStorage.getItem("user") || "null")
    );
  } catch {
    return null;
  }
};

async function listarPacientes(): Promise<any[]> {
  const { data } = await http.get("/api/diario_saude/usuario", {
    headers: getAuthHeader(),
  });
  return Array.isArray(data) ? data : [];
}

function temBiometricos(p: any): boolean {
  return (p.peso ?? 0) > 0 && (p.altura ?? 0) > 0;
}

function avatarColor(nome: string): string {
  const cores = [
    "#1976d2", "#388e3c", "#f57c00", "#7b1fa2",
    "#c62828", "#00796b", "#455a64", "#ad1457",
  ];
  const idx = (nome?.charCodeAt(0) ?? 0) % cores.length;
  return cores[idx];
}

export default function IniciarConsulta() {
  const navigate = useNavigate();
  const usuario = getUsuarioLogado();
  const token = localStorage.getItem("token");

  const [search, setSearch] = useState("");
  const [selectedPaciente, setSelectedPaciente] = useState<any>(null);

  const { data: pacientes = [], isLoading, error } = useQuery({
    queryKey: ["pacientes"],
    queryFn: listarPacientes,
    enabled: !!token,
    staleTime: 60_000,
  });

  const filtered = pacientes.filter((p) =>
    p != null && p.nome && p.nome.toLowerCase().includes(search.toLowerCase())
  );

  const criarOuReutilizarPrescricao = useMutation({
    mutationFn: async (pacienteSelecionado: any) => {
      if (!pacienteSelecionado?.id_usuario) throw new Error("Nenhum paciente selecionado");

      const { data: pacienteModulo } = await http.get(
        `/api/diario_saude/usuario/por-user/${pacienteSelecionado.platformUserId ?? pacienteSelecionado.id_usuario}`,
        { headers: getAuthHeader() }
      );
      const idUsuario = pacienteModulo.id_usuario;

      const { data: prescricoes } = await http.get(
        `/api/diario_saude/prescricao/usuario/${idUsuario}`,
        { headers: getAuthHeader() }
      );

      if (Array.isArray(prescricoes) && prescricoes.length > 0) {
        return prescricoes.sort((a: any, b: any) => b.id_prescricao - a.id_prescricao)[0] as Prescricao;
      }

      const payload: CriarPrescricaoDTO = {
        id_medico: usuario?.userId ?? usuario?.id_usuario,
        id_usuario: idUsuario,
        descricao: "Consulta iniciada",
      };
      const { data } = await http.post("/api/diario_saude/prescricao", payload, { headers: getAuthHeader() });
      return data as Prescricao;
    },
    onSuccess: (prescricao, pacienteSelecionado) => {
      navigate("/atendimento/dashboard", {
        state: {
          paciente: { ...pacienteSelecionado, id_usuario: prescricao.id_usuario },
          prescricao,
        },
      });
    },
    onError: (err: any) => {
      alert(err?.response?.data?.message || "Erro ao iniciar a consulta.");
    },
  });

  return (
    <Container maxWidth="sm" sx={{ py: 5 }}>
      <Paper elevation={0} sx={{ borderRadius: 4, border: "1px solid", borderColor: "divider", overflow: "hidden" }}>

        {/* Cabeçalho e busca — fixos no topo do card */}
        <Box sx={{ p: 4, pb: 2 }}>
          <Typography variant="h5" fontWeight={600} textAlign="center" mb={1}>
            Iniciar Consulta
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center" mb={3}>
            Selecione o paciente para iniciar o atendimento
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Erro ao carregar pacientes. Verifique a conexão.
            </Alert>
          )}

          <TextField
            fullWidth
            placeholder="Buscar paciente pelo nome..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: 3 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* Lista rolável com altura máxima */}
        <Box sx={{ maxHeight: 400, overflowY: "auto", px: 4, pb: 2 }}>
          {isLoading ? (
            <Box display="flex" flexDirection="column" alignItems="center" py={4} gap={2}>
              <CircularProgress size={32} />
              <Typography variant="body2" color="text.secondary">Carregando pacientes…</Typography>
            </Box>
          ) : (
            <Grid container spacing={1.5}>
              {filtered.map((p) => {
                const selecionado = selectedPaciente?.id_usuario === p.id_usuario;
                const biometricos = temBiometricos(p);
                const inicial = (p.nome ?? "?")[0]?.toUpperCase() ?? "?";

                return (
                  <Grid size={12} key={p.id_usuario}>
                    <Card
                      elevation={0}
                      sx={{
                        border: "2px solid",
                        borderColor: selecionado ? "primary.main" : "divider",
                        borderRadius: 3,
                        transition: "all 0.15s ease",
                        bgcolor: selecionado ? "primary.light" : "background.paper",
                      }}
                    >
                      <CardActionArea onClick={() => setSelectedPaciente(selecionado ? null : p)} sx={{ p: 0 }}>
                        <CardContent sx={{ display: "flex", alignItems: "center", gap: 2, py: 1.5 }}>
                          <Avatar sx={{
                            bgcolor: selecionado ? "primary.main" : avatarColor(p.nome),
                            width: 44, height: 44, fontWeight: 700, fontSize: 18, flexShrink: 0,
                          }}>
                            {inicial}
                          </Avatar>
                          <Box flex={1} minWidth={0}>
                            <Typography fontWeight={600} noWrap>{p.nome}</Typography>
                            <Box display="flex" gap={0.5} flexWrap="wrap" mt={0.5}>
                              {biometricos ? (
                                <Chip icon={<CheckCircleOutlineIcon />} label="Biométricos OK"
                                  size="small" color="success" variant="outlined" sx={{ fontSize: 11, height: 22 }} />
                              ) : (
                                <Chip icon={<WarningAmberIcon />} label="Sem biométricos"
                                  size="small" color="warning" variant="outlined" sx={{ fontSize: 11, height: 22 }} />
                              )}
                            </Box>
                          </Box>
                          {selecionado && <CheckCircleOutlineIcon color="primary" />}
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </Grid>
                );
              })}

              {filtered.length === 0 && (
                <Grid size={12}>
                  <Typography variant="body2" color="text.secondary" textAlign="center" py={3}>
                    {search ? `Nenhum paciente encontrado para "${search}".` : "Nenhum paciente cadastrado."}
                  </Typography>
                </Grid>
              )}
            </Grid>
          )}
        </Box>

        {/* Botão dentro do card, sempre visível */}
        <Box sx={{
          px: 4, py: 3,
          borderTop: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}>
          {selectedPaciente && (
            <Typography variant="body2" color="primary" fontWeight={600} textAlign="center" mb={1.5}>
              ✓ {selectedPaciente.nome} selecionado
            </Typography>
          )}
          <RoundedButton
            variant="contained"
            size="large"
            fullWidth
            disabled={!selectedPaciente || criarOuReutilizarPrescricao.isPending}
            onClick={() => { if (selectedPaciente) criarOuReutilizarPrescricao.mutate(selectedPaciente); }}
          >
            {criarOuReutilizarPrescricao.isPending ? "Iniciando…" : "Iniciar Consulta"}
          </RoundedButton>
        </Box>

      </Paper>
    </Container>
  );
}