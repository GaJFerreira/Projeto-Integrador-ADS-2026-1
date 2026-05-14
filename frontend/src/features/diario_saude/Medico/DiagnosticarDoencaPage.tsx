import { useState, useEffect } from "react";
import {
  Box, Button, Typography, Stack, Dialog, DialogTitle,
  DialogContent, DialogActions, Autocomplete, TextField,
  Container, Paper, Chip, Divider, IconButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import CoronavirusIcon from "@mui/icons-material/Coronavirus";
import { useNavigate, useLocation } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { doencaApi } from "../api/doencaApi";
import { usuarioDoencaApi } from "../api/usuarioDoencaApi";

export default function DiagnosticarDoencaPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const paciente = location.state?.paciente;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [doencaSelecionada, setDoencaSelecionada] = useState<any>(null);

  const medicoLogado = (() => {
    try {
      return JSON.parse(localStorage.getItem("usuario") || "null") ||
        JSON.parse(localStorage.getItem("user") || "null");
    } catch { return null; }
  })();

  useEffect(() => {
    if (!paciente) navigate("/medico");
  }, [paciente, navigate]);

  const { data: listaDoencasSistema = [] } = useQuery({
    queryKey: ["doencas", "sistema"],
    queryFn: () => doencaApi.listar(),
  });

  const { data: doencasPaciente = [] as any[] } = useQuery({
    queryKey: ["usuario", paciente?.id_usuario, "doencas"],
    queryFn: () => usuarioDoencaApi.listar(paciente.id_usuario),
    enabled: !!paciente?.id_usuario,
  });

  const addDoencaMutation = useMutation({
    mutationFn: ({ usuarioId, doencaId }: { usuarioId: number; doencaId: number }) =>
      usuarioDoencaApi.adicionar(usuarioId, doencaId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["usuario", paciente?.id_usuario, "doencas"] });
      setDialogOpen(false);
      setDoencaSelecionada(null);
    },
  });

  const removeDoencaMutation = useMutation({
    mutationFn: ({ usuarioId, doencaId }: { usuarioId: number; doencaId: number }) =>
      usuarioDoencaApi.remover(usuarioId, doencaId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["usuario", paciente?.id_usuario, "doencas"] }),
  });

  const dataHoje = new Date().toLocaleDateString("pt-BR");

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>

      {/* Cabeçalho */}
      <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 3, borderTop: "4px solid #6A1B94" }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={1.5}>
            <LocalHospitalIcon sx={{ fontSize: 36, color: "#6A1B94" }} />
            <Box>
              <Typography variant="h5" fontWeight={700} color="#6A1B94">
                DIAGNÓSTICO DE DOENÇAS
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Plataforma UNATI — Diário da Saúde
              </Typography>
            </Box>
          </Box>
          <Button onClick={() => navigate(-1)} sx={{ textTransform: "none" }}>
            Voltar
          </Button>
        </Box>
      </Paper>

      <Paper elevation={2} sx={{ p: 4, borderRadius: 3 }}>

        {/* Dados paciente e médico */}
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, mb: 3, p: 2, bgcolor: "#f0f4ff", borderRadius: 2 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">Paciente</Typography>
            <Typography fontWeight={700} fontSize="1rem">{paciente?.nome ?? "—"}</Typography>
            {paciente?.idade && (
              <Typography variant="body2" color="text.secondary">{paciente.idade} anos</Typography>
            )}
          </Box>
          <Box textAlign="right">
            <Typography variant="caption" color="text.secondary">Médico Responsável</Typography>
            <Typography fontWeight={700} fontSize="1rem">
              {medicoLogado?.name ?? medicoLogado?.nome ?? "Médico"}
            </Typography>
            <Typography variant="body2" color="text.secondary">{dataHoje}</Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Lista de doenças */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <CoronavirusIcon sx={{ color: "#6A1B9A" }} />
            <Typography variant="h6" fontWeight={600}>Doenças Diagnosticadas</Typography>
          </Box>
          <Chip label={`${doencasPaciente.length} item(s)`} size="small" color="error" variant="outlined" />
        </Box>

        {doencasPaciente.length === 0 ? (
          <Box sx={{ p: 4, textAlign: "center", bgcolor: "#fafafa", borderRadius: 2, border: "1px dashed #ccc", mb: 3 }}>
            <CoronavirusIcon sx={{ fontSize: 40, color: "#ccc", mb: 1 }} />
            <Typography color="text.secondary">Nenhuma doença cadastrada para este paciente.</Typography>
          </Box>
        ) : (
          <Stack spacing={1.5} mb={3}>
            {doencasPaciente.map((d: any) => (
              <Paper
                key={d.id ?? d.doenca?.id}
                elevation={0}
                sx={{ p: 2, borderRadius: 2, border: "1px solid #e0e0e0", display: "flex", justifyContent: "space-between", alignItems: "center" }}
              >
                <Box display="flex" alignItems="center" gap={1}>
                  <CoronavirusIcon fontSize="small" sx={{ color: "#6A1B9A" }} />
                  <Box>
                    <Typography fontWeight={600}>{d.nome ?? d.doenca?.nome}</Typography>
                    {(d.categoria ?? d.doenca?.categoria) && (
                      <Typography variant="body2" color="text.secondary">
                        {d.categoria ?? d.doenca?.categoria}
                      </Typography>
                    )}
                  </Box>
                </Box>
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => removeDoencaMutation.mutate({
                    usuarioId: paciente.id_usuario,
                    doencaId: d.id ?? d.doenca?.id
                  })}
                >
                  <DeleteOutlineIcon />
                </IconButton>
              </Paper>
            ))}
          </Stack>
        )}

        <Button
          startIcon={<AddIcon />}
          variant="outlined"
          fullWidth
          onClick={() => setDialogOpen(true)}
        >
          Adicionar Doença
        </Button>
      </Paper>

      {/* Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ borderBottom: "1px solid #eee", pb: 2 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <CoronavirusIcon sx={{ color: "#6A1B9A" }} />
            Adicionar Doença
          </Box>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={2}>
            <Autocomplete
              options={listaDoencasSistema}
              getOptionLabel={(option) => option.nome}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              onChange={(_, v) => setDoencaSelecionada(v)}
              renderOption={(props, option) => (
                <li {...props} key={option.id}>{option.nome}</li>
              )}
              renderInput={(params) => (
                <TextField {...params} label="Pesquise a doença" fullWidth />
              )}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: "1px solid #eee" }}>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button
            variant="contained"

            onClick={() => {
              if (!doencaSelecionada || !paciente) return alert("Selecione uma doença.");
              addDoencaMutation.mutate({ usuarioId: paciente.id_usuario, doencaId: doencaSelecionada.id });
            }}
            disabled={addDoencaMutation.isPending}
          >
            {addDoencaMutation.isPending ? "Adicionando..." : "Adicionar"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}