import { useState } from "react";
import {
  Box, Button, Container, Paper, Typography, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Stack, TextField, Autocomplete, Chip, Divider,
  CircularProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import MedicationIcon from "@mui/icons-material/Medication";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { useNavigate, useLocation } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { medicamentoApi } from "../api/medicamentoApi";
import http from "@/lib/http";

const listaVias = ["Oral", "Intravenosa", "Intramuscular", "Inalatória", "Sublingual", "Tópica"];

type FormMed = {
  id_medicamento?: number;
  nome_medicamento: string;
  principio_ativo: string;
  concentracao: string;
  via: string;
  dosagem: string;
  frequencia: string;
};

const formVazio: FormMed = {
  nome_medicamento: "", principio_ativo: "", concentracao: "",
  via: "", dosagem: "", frequencia: "",
};

export default function ReceituarioPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");
  const paciente = location.state?.paciente;
  const prescricao = location.state?.prescricao;
  const idPrescricao: number = prescricao?.id_prescricao;
  const idUsuario: number = prescricao?.id_usuario ?? paciente?.id_usuario;
  const queryClient = useQueryClient();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [detalhesOpen, setDetalhesOpen] = useState(false);
  const [medDetalhes, setMedDetalhes] = useState<any>(null);
  const [form, setForm] = useState<FormMed>(formVazio);

  const medicoLogado = (() => {
    try {
      return JSON.parse(localStorage.getItem("usuario") || "null") ||
        JSON.parse(localStorage.getItem("user") || "null");
    } catch { return null; }
  })();

  // Catálogo de medicamentos
  const { data: listaMedicamentos = [] } = useQuery({
    queryKey: ["medicamentos"],
    queryFn: () => medicamentoApi.listar(),
  });

  // Busca medicamentos via prescrições do usuário — mesmo padrão dos exames/exercícios
  const { data: medicamentosSalvos = [], isLoading: carregando } = useQuery({
    queryKey: ["usuario", idUsuario, "medicamentos"],
    queryFn: async () => {
      const { data: prescricoes } = await http.get(
        `/api/diario_saude/prescricao/usuario/${idUsuario}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!Array.isArray(prescricoes)) return [];
      const prescricaoAtual = prescricoes.find((p: any) => p.id_prescricao === idPrescricao);
      return Array.isArray(prescricaoAtual?.medicamentos) ? prescricaoAtual.medicamentos : [];
    },
    enabled: !!idUsuario && !!idPrescricao,
  });

  const addMutation = useMutation({
    mutationFn: async (f: FormMed) => {
      const { data } = await http.post(
        "/api/diario_saude/prescricao_medicamento",
        {
          nome_medicamento: f.nome_medicamento,
          principio_ativo: f.principio_ativo,
          concentracao: f.concentracao,
          via: f.via,
          dosagem: f.dosagem,
          frequencia: f.frequencia,
          id_prescricao: idPrescricao,
          id_medicamento: f.id_medicamento ?? 0,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["usuario", idUsuario, "medicamentos"] });
      setDialogOpen(false);
      setForm(formVazio);
    },
    onError: () => alert("Erro ao salvar medicamento."),
  });

  const removeMutation = useMutation({
    mutationFn: async (id: number) => {
      await http.delete(`/api/diario_saude/prescricao_medicamento/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["usuario", idUsuario, "medicamentos"] });
    },
    onError: () => alert("Erro ao remover medicamento."),
  });

  const handleAdd = () => {
    if (!form.nome_medicamento || !form.concentracao || !form.via || !form.dosagem || !form.frequencia)
      return alert("Preencha todos os campos obrigatórios!");
    addMutation.mutate(form);
  };

  const dataHoje = new Date().toLocaleDateString("pt-BR");

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 3, borderTop: "4px solid #FF0000" }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={1.5}>
            <LocalHospitalIcon sx={{ fontSize: 36, color: "#FF0000" }} />
            <Box>
              <Typography variant="h5" fontWeight={700} color="#FF0000">RECEITUÁRIO MÉDICO</Typography>
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
            <Typography fontWeight={700}>{paciente?.nome}</Typography>
            {paciente?.idade > 0 && <Typography variant="body2" color="text.secondary">{paciente.idade} anos</Typography>}
          </Box>
          <Box textAlign="right">
            <Typography variant="caption" color="text.secondary">Médico Responsável</Typography>
            <Typography fontWeight={700}>{medicoLogado?.name ?? medicoLogado?.nome ?? "Médico"}</Typography>
            <Typography variant="body2" color="text.secondary">{dataHoje}</Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <MedicationIcon sx={{ color: "#FF0000" }} />
            <Typography variant="h6" fontWeight={600}>Medicamentos Prescritos</Typography>
          </Box>
          <Chip label={carregando ? "..." : `${medicamentosSalvos.length} item(s)`} size="small" color="primary" variant="outlined" />
        </Box>

        {carregando ? (
          <Box display="flex" justifyContent="center" py={3}><CircularProgress size={32} /></Box>
        ) : medicamentosSalvos.length === 0 ? (
          <Box sx={{ p: 4, textAlign: "center", bgcolor: "#fafafa", borderRadius: 2, border: "1px dashed #ccc", mb: 2 }}>
            <MedicationIcon sx={{ fontSize: 40, color: "#ccc", mb: 1 }} />
            <Typography color="text.secondary">Nenhum medicamento prescrito nesta consulta.</Typography>
          </Box>
        ) : (
          <Stack spacing={1.5} mb={2}>
            {medicamentosSalvos.map((m: any) => (
              <Paper
                key={m.id_prescricao_medicamento}
                elevation={0}
                sx={{ p: 2, borderRadius: 2, border: "1px solid #e0e0e0", cursor: "pointer", "&:hover": { bgcolor: "#f9f9f9" } }}
              >
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                  <Box flex={1} onClick={() => { setMedDetalhes(m); setDetalhesOpen(true); }}>
                    <Typography fontWeight={700}>{m.nome_medicamento}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {[m.principio_ativo, m.concentracao, m.via].filter(Boolean).join(" • ")}
                    </Typography>
                    <Box display="flex" gap={1} mt={0.5} flexWrap="wrap">
                      {m.dosagem && <Chip label={`Dosagem: ${m.dosagem}`} size="small" variant="outlined" />}
                      {m.frequencia && <Chip label={`Frequência: ${m.frequencia}`} size="small" variant="outlined" />}
                    </Box>
                  </Box>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <IconButton size="small" color="info" onClick={() => { setMedDetalhes(m); setDetalhesOpen(true); }}>
                      <InfoOutlinedIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => removeMutation.mutate(m.id_prescricao_medicamento)}
                      disabled={removeMutation.isPending}>
                      <DeleteOutlineIcon />
                    </IconButton>
                  </Box>
                </Box>
              </Paper>
            ))}
          </Stack>
        )}

        <Button startIcon={<AddIcon />} variant="outlined" fullWidth sx={{ borderRadius: 2, py: 1.2 }} onClick={() => setDialogOpen(true)}>
          Adicionar Medicamento
        </Button>
      </Paper>

      {/* Dialog adicionar */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <MedicationIcon sx={{ color: "#FF0000" }} /> Adicionar Medicamento
          </Box>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={2}>
            <Autocomplete
              options={listaMedicamentos}
              getOptionLabel={(o: any) => o.nome || ""}
              onChange={(_, v) => {
                if (v) setForm({ ...form, nome_medicamento: v.nome || "", principio_ativo: v.principio_ativo || "", id_medicamento: v.id_medicamento });
              }}
              renderInput={(params) => <TextField {...params} label="Nome do Medicamento *" fullWidth />}
            />
            <TextField label="Princípio Ativo" fullWidth value={form.principio_ativo}
              onChange={(e) => setForm({ ...form, principio_ativo: e.target.value })} />
            <TextField label="Concentração (ex: 500mg) *" fullWidth value={form.concentracao}
              onChange={(e) => setForm({ ...form, concentracao: e.target.value })} />
            <Autocomplete
              options={listaVias}
              value={form.via}
              onChange={(_, v) => setForm({ ...form, via: v || "" })}
              renderInput={(params) => <TextField {...params} label="Via de Administração *" fullWidth />}
            />
            <TextField label="Dosagem (ex: 1 comprimido) *" fullWidth value={form.dosagem}
              onChange={(e) => setForm({ ...form, dosagem: e.target.value })} />
            <TextField label="Frequência (ex: a cada 8 horas) *" fullWidth value={form.frequencia}
              onChange={(e) => setForm({ ...form, frequencia: e.target.value })} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleAdd} disabled={addMutation.isPending}>
            {addMutation.isPending ? "Salvando..." : "Adicionar"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog detalhes */}
      <Dialog open={detalhesOpen} onClose={() => setDetalhesOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <MedicationIcon sx={{ color: "#FF0000" }} /> Detalhes do Medicamento
          </Box>
        </DialogTitle>
        <DialogContent>
          {medDetalhes && (
            <Stack spacing={2} mt={2}>
              {[
                { label: "Nome", value: medDetalhes.nome_medicamento },
                { label: "Princípio Ativo", value: medDetalhes.principio_ativo },
                { label: "Concentração", value: medDetalhes.concentracao },
                { label: "Via de Administração", value: medDetalhes.via },
                { label: "Dosagem", value: medDetalhes.dosagem },
                { label: "Frequência", value: medDetalhes.frequencia },
              ].filter(f => f.value && f.value !== "-").map(f => (
                <Box key={f.label}>
                  <Typography variant="caption" color="text.secondary">{f.label}</Typography>
                  <Typography fontWeight={500}>{f.value}</Typography>
                </Box>
              ))}
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDetalhesOpen(false)}>Fechar</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}