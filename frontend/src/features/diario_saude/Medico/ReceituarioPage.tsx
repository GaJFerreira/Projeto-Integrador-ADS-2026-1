import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Container,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  TextField,
  Autocomplete,
  Chip,
  Divider,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import MedicationIcon from "@mui/icons-material/Medication";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import { useNavigate, useLocation } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { medicamentoApi } from "../api/medicamentoApi";
import { prescricaoMedicamentoApi } from "../api/prescricaoMedicamentoApi";

type Paciente = {
  id_usuario: number;
  nome: string;
  idade: number;
  peso: number;
  altura: number;
};

type Medicamento = {
  id_medicamento?: number;
  nome: string;
  principio_ativo: string;
  concentracao: string;
  via: string;
  dosagem?: string;
  frequencia?: string;
};

const listaVias = ["Oral", "Intravenosa", "Intramuscular", "Inalatória", "Sublingual", "Tópica"];

export default function ReceituarioPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const paciente = location.state?.paciente as Paciente | undefined;
  const prescricaoExistente = location.state?.prescricao;
  const queryClient = useQueryClient();

  const [medList, setMedList] = useState<Medicamento[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<Medicamento>({
    nome: "", principio_ativo: "", concentracao: "", via: "", dosagem: "", frequencia: "",
  });

  useEffect(() => {
    if (!paciente) navigate("/medico");
  }, [paciente, navigate]);

  const { data: listaMedicamentos = [] } = useQuery({
    queryKey: ["medicamentos"],
    queryFn: () => medicamentoApi.listar(),
  });

  const addMedicamentoMutation = useMutation({
    mutationFn: (med: Medicamento) =>
      prescricaoMedicamentoApi.adicionar(prescricaoExistente.id_prescricao, med),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["prescricao", prescricaoExistente.id_prescricao] }),
  });

  const handleAddMedicamento = () => {
    if (!form.nome || !form.concentracao || !form.via || !form.dosagem || !form.frequencia) {
      return alert("Preencha todos os campos do medicamento!");
    }
    setMedList([...medList, form]);
    setForm({ nome: "", principio_ativo: "", concentracao: "", via: "", dosagem: "", frequencia: "" });
    setDialogOpen(false);
  };

  const handleSaveReceita = async () => {
    if (!prescricaoExistente?.id_prescricao) return alert("Nenhuma prescrição iniciada!");
    try {
      for (const med of medList) {
        await addMedicamentoMutation.mutateAsync(med);
      }
      alert("Receita salva com sucesso!");
      navigate(-1);
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar a receita.");
    }
  };

  const dataHoje = new Date().toLocaleDateString("pt-BR");

  const medicoLogado = (() => {
    try {
      return JSON.parse(localStorage.getItem("usuario") || "null") ||
        JSON.parse(localStorage.getItem("user") || "null");
    } catch { return null; }
  })();

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>

      {/* Cabeçalho da clínica */}
      <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 3, borderTop: "4px solid #FF0000" }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={1.5}>
            <LocalHospitalIcon sx={{ fontSize: 36, color: "#FF0000" }} />
            <Box>
              <Typography variant="h5" fontWeight={700} color="#FF0000">
                RECEITUÁRIO MÉDICO
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Plataforma UNATI — Diário da Saúde
              </Typography>
            </Box>
          </Box>
          <Button
            startIcon={<span>←</span>}
            onClick={() => navigate(-1)}
            sx={{ textTransform: "none" }}
          >
            Voltar
          </Button>
        </Box>
      </Paper>

      <Paper elevation={2} sx={{ p: 4, borderRadius: 3 }}>

        {/* Dados do paciente e médico */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 2,
            mb: 3,
            p: 2,
            bgcolor: "#f0f4ff",
            borderRadius: 2,
          }}
        >
          <Box>
            <Typography variant="caption" color="text.secondary">Paciente</Typography>
            <Typography fontWeight={700} fontSize="1rem">{paciente?.nome}</Typography>
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

        {/* Lista de medicamentos */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <MedicationIcon sx={{ color: "#FF0000" }} />
            <Typography variant="h6" fontWeight={600}>Medicamentos Prescritos</Typography>
          </Box>
          <Chip label={`${medList.length} item(s)`} size="small" color="primary" variant="outlined" />
        </Box>

        {medList.length === 0 ? (
          <Box
            sx={{
              p: 4, textAlign: "center", bgcolor: "#fafafa",
              borderRadius: 2, border: "1px dashed #ccc", mb: 2,
            }}
          >
            <MedicationIcon sx={{ fontSize: 40, color: "#ccc", mb: 1 }} />
            <Typography color="text.secondary">Nenhum medicamento adicionado ainda.</Typography>
          </Box>
        ) : (
          <List disablePadding sx={{ mb: 2 }}>
            {medList.map((m, i) => (
              <Paper
                key={`${m.nome}-${i}`}
                elevation={0}
                sx={{ mb: 1.5, p: 2, borderRadius: 2, border: "1px solid #e0e0e0", bgcolor: "#fff" }}
              >
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Typography fontWeight={700}>{m.nome}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {m.principio_ativo} • {m.concentracao} • {m.via}
                    </Typography>
                    <Box display="flex" gap={1} mt={0.5}>
                      <Chip label={`Dosagem: ${m.dosagem}`} size="small" variant="outlined" />
                      <Chip label={`Frequência: ${m.frequencia}`} size="small" variant="outlined" />
                    </Box>
                  </Box>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => setMedList(medList.filter((_, idx) => idx !== i))}
                  >
                    <DeleteOutlineIcon />
                  </IconButton>
                </Box>
              </Paper>
            ))}
          </List>
        )}

        <Button
          startIcon={<AddIcon />}
          variant="outlined"
          fullWidth
          sx={{ mb: 3, borderRadius: 2, py: 1.2 }}
          onClick={() => setDialogOpen(true)}
        >
          Adicionar Medicamento
        </Button>

        <Divider sx={{ mb: 3 }} />

        <Button
          variant="contained"
          fullWidth
          size="large"
          sx={{ borderRadius: 2, py: 1.5, fontSize: "1rem" }}
          onClick={handleSaveReceita}
          disabled={medList.length === 0 || addMedicamentoMutation.isPending}
        >
          {addMedicamentoMutation.isPending ? "Salvando..." : "Salvar Receita"}
        </Button>
      </Paper>

      {/* Dialog de adicionar medicamento */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ borderBottom: "1px solid #eee", pb: 2 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <MedicationIcon sx={{ color: "#FF0000" }} />
            Adicionar Medicamento
          </Box>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={2}>
            <Autocomplete
              options={listaMedicamentos}
              getOptionLabel={(option) => option.nome}
              onChange={(_, newValue) => {
                if (newValue) setForm({
                  ...form,
                  nome: newValue.nome,
                  principio_ativo: newValue.principio_ativo,
                  id_medicamento: newValue.id_medicamento,
                });
              }}
              renderInput={(params) => <TextField {...params} label="Nome do Medicamento" fullWidth />}
            />
            <TextField
              label="Princípio Ativo"
              fullWidth
              value={form.principio_ativo || ""}
              onChange={(e) => setForm({ ...form, principio_ativo: e.target.value })}
            />
            <TextField
              label="Concentração (ex: 500mg)"
              fullWidth
              value={form.concentracao || ""}
              onChange={(e) => setForm({ ...form, concentracao: e.target.value })}
            />
            <Autocomplete
              options={listaVias}
              value={form.via || ""}
              onChange={(_, v) => setForm({ ...form, via: v || "" })}
              renderInput={(params) => <TextField {...params} label="Via de Administração" fullWidth />}
            />
            <TextField
              label="Dosagem (ex: 1 comprimido)"
              fullWidth
              value={form.dosagem || ""}
              onChange={(e) => setForm({ ...form, dosagem: e.target.value })}
            />
            <TextField
              label="Frequência (ex: a cada 8 horas)"
              fullWidth
              value={form.frequencia || ""}
              onChange={(e) => setForm({ ...form, frequencia: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: "1px solid #eee" }}>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleAddMedicamento}>Adicionar</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}