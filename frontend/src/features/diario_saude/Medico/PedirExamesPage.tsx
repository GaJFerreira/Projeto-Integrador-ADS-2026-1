import { useState, useEffect } from "react";
import {
  Container, Paper, Typography, Button, Box,
  IconButton, Chip, Divider, Autocomplete, TextField, Stack,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AddIcon from "@mui/icons-material/Add";
import ScienceIcon from "@mui/icons-material/Science";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import { useNavigate, useLocation } from "react-router-dom";

export default function PrescreverExamePage() {
  const navigate = useNavigate();
  const location = useLocation();

  const token = localStorage.getItem("token");
  const prescricao = location.state?.prescricao;
  const paciente = location.state?.paciente;
  const idPrescricaoMedica =
    prescricao?.id_prescricao_medica ?? prescricao?.id_prescricao ?? prescricao?.id;

  const [listaExames, setListaExames] = useState<any[]>([]);
  const [exameSelecionado, setExameSelecionado] = useState<any>(null);
  const [examesPrescritos, setExamesPrescritos] = useState<any[]>([]);
  const [loadingExames, setLoadingExames] = useState(false);

  const medicoLogado = (() => {
    try {
      return JSON.parse(localStorage.getItem("usuario") || "null") ||
        JSON.parse(localStorage.getItem("user") || "null");
    } catch { return null; }
  })();

  useEffect(() => {
    if (!idPrescricaoMedica) {
      alert("Prescrição médica não encontrada. Inicie a consulta primeiro.");
      navigate(-1);
    }
  }, [idPrescricaoMedica, navigate]);

  useEffect(() => {
    if (!token) return;
    setLoadingExames(true);
    fetch("http://localhost:8080/api/diario_saude/exames", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => setListaExames(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Erro ao carregar exames:", err))
      .finally(() => setLoadingExames(false));
  }, [token]);

  const handleAddExame = () => {
    if (!exameSelecionado) return;
    if (examesPrescritos.some((x) => x.id_exame === exameSelecionado.id_exame)) return;
    setExamesPrescritos((prev) => [...prev, exameSelecionado]);
    setExameSelecionado(null);
  };

  const handleRemove = (id: number) => {
    setExamesPrescritos((prev) => prev.filter((e) => e.id_exame !== id));
  };

  const handleSalvar = async () => {
    if (!token || !idPrescricaoMedica || examesPrescritos.length === 0) return;
    try {
      for (const e of examesPrescritos) {
        const resp = await fetch("http://localhost:8080/api/diario_saude/prescricao/exame", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            id_exame: e.id_exame,
            id_prescricao_medica: idPrescricaoMedica,
            data_prescricao: new Date().toISOString().split("T")[0],
            observacao: "",
          }),
        });
        if (!resp.ok) throw new Error(`Erro ao salvar exame (status ${resp.status})`);
      }
      alert("Exames prescritos com sucesso!");
      navigate(-1);
    } catch (err) {
      console.error(err);
      alert("Erro ao prescrever exames.");
    }
  };

  const dataHoje = new Date().toLocaleDateString("pt-BR");

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>

      {/* Cabeçalho */}
      <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 3, borderTop: "4px solid #1565c0" }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={1.5}>
            <LocalHospitalIcon sx={{ fontSize: 36, color: "#1565c0" }} />
            <Box>
              <Typography variant="h5" fontWeight={700} color="#1565c0">
                PRESCRIÇÃO DE EXAMES
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

        {/* Seleção de exame */}
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <ScienceIcon color="primary" />
          <Typography variant="h6" fontWeight={600}>Adicionar Exame</Typography>
        </Box>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mb={3}>
          <Autocomplete
            fullWidth
            options={listaExames}
            getOptionLabel={(option) => option.nome_exame ?? ""}
            value={exameSelecionado}
            onChange={(_, v) => setExameSelecionado(v)}
            loading={loadingExames}
            renderInput={(params) => (
              <TextField {...params} label="Selecione o Exame" />
            )}
          />
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleAddExame}
            disabled={!exameSelecionado}
            sx={{ borderRadius: 2, minWidth: 160, py: 1.5 }}
          >
            Adicionar
          </Button>
        </Stack>

        {/* Lista de exames prescritos */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" fontWeight={600}>Exames Prescritos</Typography>
          <Chip label={`${examesPrescritos.length} item(s)`} size="small" color="primary" variant="outlined" />
        </Box>

        {examesPrescritos.length === 0 ? (
          <Box sx={{ p: 4, textAlign: "center", bgcolor: "#fafafa", borderRadius: 2, border: "1px dashed #ccc", mb: 3 }}>
            <ScienceIcon sx={{ fontSize: 40, color: "#ccc", mb: 1 }} />
            <Typography color="text.secondary">Nenhum exame adicionado ainda.</Typography>
          </Box>
        ) : (
          <Stack spacing={1.5} mb={3}>
            {examesPrescritos.map((ex) => (
              <Paper
                key={ex.id_exame}
                elevation={0}
                sx={{ p: 2, borderRadius: 2, border: "1px solid #e0e0e0", display: "flex", justifyContent: "space-between", alignItems: "center" }}
              >
                <Box display="flex" alignItems="center" gap={1}>
                  <ScienceIcon fontSize="small" color="primary" />
                  <Typography fontWeight={600}>{ex.nome_exame}</Typography>
                </Box>
                <IconButton size="small" color="error" onClick={() => handleRemove(ex.id_exame)}>
                  <DeleteOutlineIcon />
                </IconButton>
              </Paper>
            ))}
          </Stack>
        )}

        <Divider sx={{ mb: 3 }} />

        <Button
          variant="contained"
          fullWidth
          size="large"
          sx={{ borderRadius: 2, py: 1.5, fontSize: "1rem" }}
          onClick={handleSalvar}
          disabled={examesPrescritos.length === 0}
        >
          Salvar Prescrição de Exames
        </Button>
      </Paper>
    </Container>
  );
}