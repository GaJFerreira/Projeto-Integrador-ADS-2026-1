import { useState } from "react";
import {
  Container, Paper, Typography, Button, Box,
  IconButton, Chip, Divider, Autocomplete, TextField,
  Stack, CircularProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import ScienceIcon from "@mui/icons-material/Science";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import { useNavigate, useLocation } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import http from "@/lib/http";

export default function PedirExamesPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");
  const prescricao = location.state?.prescricao;
  const paciente = location.state?.paciente;
  const idPrescricao = prescricao?.id_prescricao_medica ?? prescricao?.id_prescricao ?? prescricao?.id;
  const idUsuario: number = prescricao?.id_usuario ?? paciente?.id_usuario;
  const queryClient = useQueryClient();

  const [exameSelecionado, setExameSelecionado] = useState<any>(null);

  const medicoLogado = (() => {
    try {
      return JSON.parse(localStorage.getItem("usuario") || "null") ||
        JSON.parse(localStorage.getItem("user") || "null");
    } catch { return null; }
  })();

  // Catálogo de exames
  const { data: listaExames = [], isLoading: loadingExames } = useQuery({
    queryKey: ["exames", "catalogo"],
    queryFn: async () => {
      const { data } = await http.get("/api/diario_saude/exames", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return Array.isArray(data) ? data : [];
    },
  });

  // Busca todas as prescrições do paciente e agrega os exames pendentes
  // Usa o endpoint existente: GET /prescricao/usuario/{id}
  // Cada prescrição já retorna os exames com resultado/data_realizacao
  const { data: examesPendentes = [], isLoading: carregando } = useQuery({
    queryKey: ["usuario", idUsuario, "exames", "pendentes"],
    queryFn: async () => {
      const { data: prescricoes } = await http.get(
        `/api/diario_saude/prescricao/usuario/${idUsuario}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!Array.isArray(prescricoes)) return [];

      // Agrega todos os exames sem resultado de todas as prescrições
      const todos: any[] = prescricoes.flatMap((p: any) =>
        Array.isArray(p.exames) ? p.exames : []
      );
      return todos.filter((e: any) => !e.resultado && !e.data_realizacao);
    },
    enabled: !!idUsuario,
  });

  const adicionarMutation = useMutation({
    mutationFn: async (exame: any) => {
      const { data } = await http.post(
        "/api/diario_saude/prescricao/exame",
        {
          id_exame: exame.id_exame,
          id_prescricao_medica: idPrescricao,
          data_prescricao: new Date().toISOString().split("T")[0],
          observacao: "",
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["usuario", idUsuario, "exames"] });
      setExameSelecionado(null);
    },
    onError: () => alert("Erro ao prescrever exame."),
  });

  const handleAdd = () => {
    if (!exameSelecionado) return;
    const jaAdicionado = examesPendentes.some(
      (e: any) =>
        e.id_exame === exameSelecionado.id_exame
    );
    if (jaAdicionado) return alert("Este exame já está pendente para este paciente.");
    adicionarMutation.mutate(exameSelecionado);
  };

  const dataHoje = new Date().toLocaleDateString("pt-BR");

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 3, borderTop: "4px solid #1565c0" }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={1.5}>
            <LocalHospitalIcon sx={{ fontSize: 36, color: "#1565c0" }} />
            <Box>
              <Typography variant="h5" fontWeight={700} color="#1565c0">PEDIR EXAMES</Typography>
              <Typography variant="body2" color="text.secondary">Plataforma UNATI — Diário da Saúde</Typography>
            </Box>
          </Box>
          <Button onClick={() => navigate(-1)}>Voltar</Button>
        </Box>
      </Paper>

      <Paper elevation={2} sx={{ p: 4, borderRadius: 3 }}>
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, mb: 3, p: 2, bgcolor: "#f0f4ff", borderRadius: 2 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">Paciente</Typography>
            <Typography fontWeight={700}>{paciente?.nome ?? "—"}</Typography>
          </Box>
          <Box textAlign="right">
            <Typography variant="caption" color="text.secondary">Médico Responsável</Typography>
            <Typography fontWeight={700}>{medicoLogado?.name ?? medicoLogado?.nome ?? "Médico"}</Typography>
            <Typography variant="body2" color="text.secondary">{dataHoje}</Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Adicionar exame */}
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <ScienceIcon color="primary" />
          <Typography variant="h6" fontWeight={600}>Pedir Novo Exame</Typography>
        </Box>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mb={3}>
          <Autocomplete
            fullWidth
            options={listaExames}
            getOptionLabel={(o) => o.nome_exame ?? ""}
            value={exameSelecionado}
            onChange={(_, v) => setExameSelecionado(v)}
            loading={loadingExames}
            renderInput={(params) => <TextField {...params} label="Selecione o Exame" />}
          />
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleAdd}
            disabled={!exameSelecionado || adicionarMutation.isPending}
            sx={{ borderRadius: 2, minWidth: 160, py: 1.5 }}
          >
            {adicionarMutation.isPending ? "Salvando..." : "Pedir"}
          </Button>
        </Stack>

        <Divider sx={{ mb: 3 }} />

        {/* Exames pendentes do paciente */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <HourglassEmptyIcon color="warning" />
            <Typography variant="h6" fontWeight={600}>Exames Pendentes do Paciente</Typography>
          </Box>
          <Chip
            label={carregando ? "..." : `${examesPendentes.length} pendente(s)`}
            size="small"
            color="warning"
            variant="outlined"
          />
        </Box>

        {carregando ? (
          <Box display="flex" justifyContent="center" py={3}><CircularProgress size={32} /></Box>
        ) : examesPendentes.length === 0 ? (
          <Box sx={{ p: 4, textAlign: "center", bgcolor: "#fafafa", borderRadius: 2, border: "1px dashed #ccc" }}>
            <ScienceIcon sx={{ fontSize: 40, color: "#ccc", mb: 1 }} />
            <Typography color="text.secondary">Nenhum exame pendente para este paciente.</Typography>
          </Box>
        ) : (
          <Stack spacing={1.5}>
            {examesPendentes.map((ex: any) => (
              <Paper
                key={ex.id_prescricao_exame}
                elevation={0}
                sx={{ p: 2, borderRadius: 2, border: "1px solid #e0e0e0", borderLeft: "4px solid #f57c00" }}
              >
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box display="flex" alignItems="center" gap={1}>
                    <HourglassEmptyIcon fontSize="small" color="warning" />
                    <Box>
                      <Typography fontWeight={600}>{ex.nome_exame ?? "Exame"}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Pedido em: {ex.data_prescricao
                          ? new Date(ex.data_prescricao).toLocaleDateString("pt-BR")
                          : "—"}
                      </Typography>
                    </Box>
                  </Box>
                  <Chip label="Pendente" size="small" color="warning" variant="outlined" />
                </Box>
              </Paper>
            ))}
          </Stack>
        )}
      </Paper>
    </Container>
  );
}