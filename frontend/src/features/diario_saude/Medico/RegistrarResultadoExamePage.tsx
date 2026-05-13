import { useState, useEffect } from "react";
import {
    Container, Paper, Typography, Button, Box,
    Chip, Divider, Stack, TextField, CircularProgress,
} from "@mui/material";
import ScienceIcon from "@mui/icons-material/Science";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useNavigate, useLocation } from "react-router-dom";

export default function RegistrarResultadoExamePage() {
    const navigate = useNavigate();
    const location = useLocation();

    const token = localStorage.getItem("token");
    const prescricao = location.state?.prescricao;
    const paciente = location.state?.paciente;
    const idPrescricao = prescricao?.id_prescricao_medica
        ?? prescricao?.id_prescricao
        ?? prescricao?.id;

    const [exames, setExames] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [salvando, setSalvando] = useState<number | null>(null);
    const [resultados, setResultados] = useState<Record<number, { resultado: string; data_realizacao: string }>>({});

    const medicoLogado = (() => {
        try {
            return JSON.parse(localStorage.getItem("usuario") || "null") ||
                JSON.parse(localStorage.getItem("user") || "null");
        } catch { return null; }
    })();

    const carregarExamesPendentes = () => {
        if (!idPrescricao) return;
        setLoading(true);

        fetch(`http://localhost:8080/api/diario_saude/prescricao/exame/prescricao/${idPrescricao}/pendentes`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(r => r.json())
            .then(data => {
                const lista = Array.isArray(data) ? data : [];
                setExames(lista);

                // Inicializa os campos de resultado vazios (são pendentes, não têm resultado ainda)
                const init: Record<number, { resultado: string; data_realizacao: string }> = {};
                lista.forEach((e: any) => {
                    init[e.id_prescricao_exame] = {
                        resultado: "",
                        data_realizacao: "",
                    };
                });
                setResultados(init);
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        if (!idPrescricao) { navigate(-1); return; }
        carregarExamesPendentes();
    }, [idPrescricao]);

    const handleSalvarResultado = async (idExame: number) => {
        const dados = resultados[idExame];
        if (!dados?.resultado?.trim()) return alert("Informe o resultado antes de salvar.");
        if (!dados?.data_realizacao) return alert("Informe a data de realização antes de salvar.");

        setSalvando(idExame);
        try {
            const resp = await fetch(
                `http://localhost:8080/api/diario_saude/prescricao/exame/${idExame}/resultado`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                    body: JSON.stringify(dados),
                }
            );
            if (!resp.ok) throw new Error();

            alert("Resultado salvo com sucesso!");

            setExames(prev => prev.filter(e => e.id_prescricao_exame !== idExame));

        } catch {
            alert("Erro ao salvar resultado.");
        } finally {
            setSalvando(null);
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
                                RESULTADO DE EXAMES
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
                        {paciente?.idade > 0 && (
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

                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Box display="flex" alignItems="center" gap={1}>
                        <ScienceIcon sx={{ color: "#1565c0" }} />
                        <Typography variant="h6" fontWeight={600}>Exames Pendentes de Análise</Typography>
                    </Box>
                    {/* ✅ Chip atualiza conforme exames são analisados */}
                    <Chip
                        label={`${exames.length} pendente(s)`}
                        size="small"
                        color={exames.length === 0 ? "success" : "warning"}
                        variant="outlined"
                    />
                </Box>

                {loading && <CircularProgress />}

                {/* Mensagem de sucesso quando todos foram analisados */}
                {!loading && exames.length === 0 && (
                    <Box sx={{ p: 4, textAlign: "center", bgcolor: "#f1f8e9", borderRadius: 2, border: "1px dashed #81c784" }}>
                        <CheckCircleIcon sx={{ fontSize: 40, color: "#2e7d32", mb: 1 }} />
                        <Typography color="success.main" fontWeight={600}>
                            Todos os exames já foram analisados!
                        </Typography>
                        <Typography variant="body2" color="text.secondary" mt={0.5}>
                            Não há exames pendentes para esta prescrição.
                        </Typography>
                    </Box>
                )}

                <Stack spacing={2}>
                    {exames.map((exame: any) => {
                        const id = exame.id_prescricao_exame;
                        return (
                            <Paper
                                key={id}
                                elevation={0}
                                sx={{
                                    p: 2.5, borderRadius: 2,
                                    border: "1px solid #e0e0e0",
                                    borderLeft: "4px solid #1565c0", // ✅ sempre azul — são todos pendentes
                                }}
                            >
                                <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                                    <ScienceIcon fontSize="small" color="primary" />
                                    <Typography fontWeight={700}>
                                        {exame.exame?.nome_exame ?? "Exame"}
                                    </Typography>
                                    <Chip
                                        label="Pendente"
                                        size="small"
                                        color="warning"
                                        variant="outlined"
                                    />
                                </Box>

                                <Stack spacing={1.5}>
                                    <TextField
                                        label="Resultado"
                                        fullWidth
                                        multiline
                                        minRows={2}
                                        value={resultados[id]?.resultado ?? ""}
                                        onChange={e => setResultados(prev => ({
                                            ...prev,
                                            [id]: { ...prev[id], resultado: e.target.value }
                                        }))}
                                        placeholder="Descreva o resultado do exame..."
                                    />
                                    <TextField
                                        label="Data de realização"
                                        type="date"
                                        fullWidth
                                        value={resultados[id]?.data_realizacao ?? ""}
                                        onChange={e => setResultados(prev => ({
                                            ...prev,
                                            [id]: { ...prev[id], data_realizacao: e.target.value }
                                        }))}
                                        InputLabelProps={{ shrink: true }}
                                    />
                                    <Button
                                        variant="contained"
                                        onClick={() => handleSalvarResultado(id)}
                                        disabled={salvando === id}
                                        sx={{ borderRadius: 2, alignSelf: "flex-end" }}
                                    >
                                        {salvando === id ? "Salvando..." : "Salvar resultado"}
                                    </Button>
                                </Stack>
                            </Paper>
                        );
                    })}
                </Stack>
            </Paper>
        </Container>
    );
}