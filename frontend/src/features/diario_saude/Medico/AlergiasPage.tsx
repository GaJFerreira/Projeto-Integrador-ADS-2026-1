import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Autocomplete,
  TextField,
  Container,
  Paper,
  Chip,
  Divider,
  IconButton,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

import { useNavigate, useLocation } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { alergiaApi } from "../api/alergiaApi";
import { usuarioAlergiaApi } from "../api/usuarioAlergiaApi";

import type { Alergia } from "../api/types";

export default function AlergiasPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const paciente = location.state?.paciente;

  const usuarioLogado = (() => {
    try {
      return (
        JSON.parse(localStorage.getItem("usuario") || "null") ||
        JSON.parse(localStorage.getItem("user") || "null")
      );
    } catch {
      return null;
    }
  })();

  const pacienteId = paciente?.id_usuario;

  useEffect(() => {
    if (!paciente) navigate("/medico");
  }, [paciente, navigate]);

  // 🔎 Lista do sistema
  const { data: listaAlergiasSistema = [] as Alergia[] } = useQuery({
    queryKey: ["alergias", "sistema"],
    queryFn: () => alergiaApi.listarSistema(),
  });

  // 👤 Lista do paciente
  const { data: alergiasPaciente = [] as Alergia[] } = useQuery({
    queryKey: ["usuario", pacienteId, "alergias"],
    queryFn: () => usuarioAlergiaApi.listar(pacienteId!),
    enabled: !!pacienteId,
  });

  // ➕ Adicionar
  const addAlergiaMutation = useMutation({
    mutationFn: ({ usuarioId, alergiaId }: { usuarioId: number; alergiaId: number }) =>
      usuarioAlergiaApi.adicionar(usuarioId, alergiaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["usuario", pacienteId, "alergias"] });
      setDialogOpen(false);
      setAlergiaSelecionada(null);
    },
  });

  // ❌ Remover
  const removeAlergiaMutation = useMutation({
    mutationFn: ({ usuarioId, alergiaId }: { usuarioId: number; alergiaId: number }) =>
      usuarioAlergiaApi.remover(usuarioId, alergiaId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["usuario", pacienteId, "alergias"] }),
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [alergiaSelecionada, setAlergiaSelecionada] = useState<Alergia | null>(null);

  const dataHoje = new Date().toLocaleDateString("pt-BR");

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>

      {/* 🔵 Cabeçalho */}
      <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 3, borderTop: "4px solid #FF7F00" }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={1.5}>
            <LocalHospitalIcon sx={{ fontSize: 36, color: "#FF7F00" }} />
            <Box>
              <Typography variant="h5" fontWeight={700} color="#FF7F00">
                ALERGIAS DO PACIENTE
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Plataforma UNATI — Diário da Saúde
              </Typography>
            </Box>
          </Box>

          <Button onClick={() => navigate(-1)}>Voltar</Button>
        </Box>
      </Paper>

      <Paper elevation={2} sx={{ p: 4, borderRadius: 3 }}>

        {/* 👤 Dados */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 2,
            mb: 3,
            p: 2,
            bgcolor: "#f0fff4",
            borderRadius: 2,
          }}
        >
          <Box>
            <Typography variant="caption">Paciente</Typography>
            <Typography fontWeight={700}>{paciente?.nome ?? "—"}</Typography>
          </Box>

          <Box textAlign="right">
            <Typography variant="caption">Responsável</Typography>
            <Typography fontWeight={700}>
              {usuarioLogado?.nome || usuarioLogado?.name || "Usuário"}
            </Typography>
            <Typography variant="body2">{dataHoje}</Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* 📋 Título */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <WarningAmberIcon sx={{ color: "#FF7F00" }} />
            <Typography variant="h6" fontWeight={600}>
              Alergias Cadastradas
            </Typography>
          </Box>

          <Chip
            label={`${alergiasPaciente.length} item(s)`}
            size="small"
            color="warning"
            variant="outlined"
          />
        </Box>

        {/* 📋 Lista */}
        {alergiasPaciente.length === 0 ? (
          <Box
            sx={{
              p: 4,
              textAlign: "center",
              bgcolor: "#fafafa",
              borderRadius: 2,
              border: "1px dashed #ccc",
              mb: 3,
            }}
          >
            <WarningAmberIcon sx={{ fontSize: 40, color: "#ccc", mb: 1 }} />
            <Typography color="text.secondary">
              Nenhuma alergia cadastrada para este paciente.
            </Typography>
          </Box>
        ) : (
          <Stack spacing={1.5} mb={3}>
            {alergiasPaciente.map((a) => (
              <Paper
                key={a.id}
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: "1px solid #e0e0e0",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Box display="flex" alignItems="center" gap={1}>
                  <WarningAmberIcon fontSize="small" sx={{ color: "#FF7F00" }} />
                  <Typography fontWeight={600}>{a.nome}</Typography>
                </Box>

                <IconButton
                  size="small"
                  color="error"
                  onClick={() =>
                    removeAlergiaMutation.mutate({
                      usuarioId: pacienteId,
                      alergiaId: a.id,
                    })
                  }
                >
                  <DeleteOutlineIcon />
                </IconButton>
              </Paper>
            ))}
          </Stack>
        )}

        {/* ➕ Botão */}
        <Button
          startIcon={<AddIcon />}
          variant="outlined"
          fullWidth
          sx={{ borderRadius: 2, py: 1.2 }}
          onClick={() => setDialogOpen(true)}

        >
          Adicionar Alergia
        </Button>
      </Paper>

      {/* Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <WarningAmberIcon sx={{ color: "#FF7F00" }} />
            Adicionar Alergia
          </Box>
        </DialogTitle>

        <DialogContent>
          <Stack spacing={2} mt={2}>
            <Autocomplete
              options={listaAlergiasSistema}
              getOptionLabel={(option) => option.nome}
              isOptionEqualToValue={(option, value) => option.id === value?.id}
              onChange={(_, v) => setAlergiaSelecionada(v)}
              renderInput={(params) => (
                <TextField {...params} label="Selecione a alergia" fullWidth />
              )}
            />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>

          <Button
            variant="contained"
            onClick={() => {
              if (!alergiaSelecionada || !pacienteId)
                return alert("Selecione uma alergia.");

              addAlergiaMutation.mutate({
                usuarioId: pacienteId,
                alergiaId: alergiaSelecionada.id,
              });
            }}
            disabled={addAlergiaMutation.isPending}
          >
            {addAlergiaMutation.isPending ? "Adicionando..." : "Adicionar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}