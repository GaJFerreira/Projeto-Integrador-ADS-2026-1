import { useState, useEffect } from "react";
import {
    Box, Button, Container, Paper, Typography,
    IconButton, Dialog, DialogTitle, DialogContent,
    DialogActions, Stack, TextField, Chip, Divider,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import { useNavigate, useLocation } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { exercicioRecomendadoApi } from "./exercicioRecomendadoApi";

type Paciente = {
    id_usuario: number;
    nome: string;
    idade: number;
    peso: number;
    altura: number;
};

export default function RecomendacaoExerciciosPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const paciente = location.state?.paciente as Paciente;
    const prescricaoExistente = location.state?.prescricao;
    const queryClient = useQueryClient();

    const [recomendacoes, setRecomendacoes] = useState<string[]>([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [textoRecomendacao, setTextoRecomendacao] = useState("");

    const medicoLogado = (() => {
        try {
            return JSON.parse(localStorage.getItem("usuario") || "null") ||
                JSON.parse(localStorage.getItem("user") || "null");
        } catch { return null; }
    })();

    useEffect(() => {
        if (!paciente) navigate("/medico");
    }, [paciente, navigate]);

    const addExercicioMutation = useMutation({
        mutationFn: (descricao: string) =>
            exercicioRecomendadoApi.adicionar(prescricaoExistente.id_prescricao, descricao),
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: ["prescricao", prescricaoExistente.id_prescricao] }),
    });

    const handleAddRecomendacao = () => {
        if (!textoRecomendacao.trim()) return alert("A recomendação não pode estar vazia!");
        setRecomendacoes((prev) => [...prev, textoRecomendacao.trim()]);
        setTextoRecomendacao("");
        setDialogOpen(false);
    };

    const handleSalvar = async () => {
        if (!prescricaoExistente?.id_prescricao) return alert("Nenhuma prescrição encontrada!");
        try {
            for (const rec of recomendacoes) {
                await addExercicioMutation.mutateAsync(rec);
            }
            alert("Recomendações salvas com sucesso!");
            navigate(-1);
        } catch (e) {
            console.error(e);
            alert("Erro ao salvar as recomendações.");
        }
    };

    const dataHoje = new Date().toLocaleDateString("pt-BR");

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>

            {/* Cabeçalho */}
            <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 3, borderTop: "4px solid #008000" }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box display="flex" alignItems="center" gap={1.5}>
                        <LocalHospitalIcon sx={{ fontSize: 36, color: "#008000" }} />
                        <Box>
                            <Typography variant="h5" fontWeight={700} color="#008000">
                                RECOMENDAÇÃO DE EXERCÍCIOS
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

                {/* Lista de recomendações */}
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Box display="flex" alignItems="center" gap={1}>
                        <FitnessCenterIcon sx={{ color: "#008000" }} />
                        <Typography variant="h6" fontWeight={600}>Exercícios Recomendados</Typography>
                    </Box>
                    <Chip label={`${recomendacoes.length} item(s)`} size="small" color="primary" variant="outlined" />
                </Box>

                {recomendacoes.length === 0 ? (
                    <Box sx={{ p: 4, textAlign: "center", bgcolor: "#fafafa", borderRadius: 2, border: "1px dashed #ccc", mb: 3 }}>
                        <FitnessCenterIcon sx={{ fontSize: 40, color: "#ccc", mb: 1 }} />
                        <Typography color="text.secondary">Nenhuma recomendação adicionada ainda.</Typography>
                    </Box>
                ) : (
                    <Stack spacing={1.5} mb={3}>
                        {recomendacoes.map((rec, i) => (
                            <Paper
                                key={i}
                                elevation={0}
                                sx={{ p: 2, borderRadius: 2, border: "1px solid #e0e0e0", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}
                            >
                                <Box display="flex" alignItems="flex-start" gap={1}>
                                    <FitnessCenterIcon fontSize="small" color="primary" sx={{ mt: 0.3 }} />
                                    <Typography>{rec}</Typography>
                                </Box>
                                <IconButton size="small" color="error" onClick={() => setRecomendacoes(recomendacoes.filter((_, idx) => idx !== i))}>
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
                    sx={{ mb: 3, borderRadius: 2, py: 1.2 }}
                    onClick={() => setDialogOpen(true)}
                >
                    Adicionar Recomendação
                </Button>

                <Divider sx={{ mb: 3 }} />

                <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    sx={{ borderRadius: 2, py: 1.5, fontSize: "1rem" }}
                    onClick={handleSalvar}
                    disabled={recomendacoes.length === 0 || addExercicioMutation.isPending}
                >
                    {addExercicioMutation.isPending ? "Salvando..." : "Salvar Recomendações"}
                </Button>
            </Paper>

            {/* Dialog */}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle sx={{ borderBottom: "1px solid #eee", pb: 2 }}>
                    <Box display="flex" alignItems="center" gap={1}>
                        <FitnessCenterIcon sx={{ color: "#008000" }} />
                        Adicionar Recomendação
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Stack spacing={2} mt={2}>
                        <TextField
                            label="Descreva o exercício recomendado"
                            fullWidth
                            multiline
                            minRows={3}
                            value={textoRecomendacao}
                            onChange={(e) => setTextoRecomendacao(e.target.value)}
                            placeholder="Ex: Caminhada leve por 30 minutos, 3x por semana..."
                        />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 2, borderTop: "1px solid #eee" }}>
                    <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
                    <Button variant="contained" onClick={handleAddRecomendacao}>Adicionar</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}