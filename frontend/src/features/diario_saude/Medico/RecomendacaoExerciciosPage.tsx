import { useState } from "react";
import {
    Box, Button, Container, Paper, Typography,
    IconButton, Dialog, DialogTitle, DialogContent,
    DialogActions, Stack, TextField, Chip, Divider,
    CircularProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import { useNavigate, useLocation } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import http from "@/lib/http";

export default function RecomendacaoExerciciosPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const token = localStorage.getItem("token");
    const paciente = location.state?.paciente;
    const prescricao = location.state?.prescricao;
    const idPrescricao: number = prescricao?.id_prescricao;
    const idUsuario: number = prescricao?.id_usuario ?? paciente?.id_usuario;
    const queryClient = useQueryClient();

    const [dialogOpen, setDialogOpen] = useState(false);
    const [textoRecomendacao, setTextoRecomendacao] = useState("");

    const medicoLogado = (() => {
        try {
            return JSON.parse(localStorage.getItem("usuario") || "null") ||
                JSON.parse(localStorage.getItem("user") || "null");
        } catch { return null; }
    })();

    // Busca exercícios via prescrições do usuário — mesmo padrão do PedirExamesPage
    const { data: exerciciosSalvos = [], isLoading: carregando } = useQuery({
        queryKey: ["usuario", idUsuario, "exercicios"],
        queryFn: async () => {
            const { data: prescricoes } = await http.get(
                `/api/diario_saude/prescricao/usuario/${idUsuario}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (!Array.isArray(prescricoes)) return [];
            // Pega só os exercícios da prescrição atual
            const prescricaoAtual = prescricoes.find((p: any) => p.id_prescricao === idPrescricao);
            return Array.isArray(prescricaoAtual?.exerciciosRecomendados)
                ? prescricaoAtual.exerciciosRecomendados
                : [];
        },
        enabled: !!idUsuario && !!idPrescricao,
    });

    const addMutation = useMutation({
        mutationFn: async (descricao: string) => {
            const { data } = await http.post(
                "/api/diario_saude/exercicio-recomendado",
                { idPrescricao, descricao },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["usuario", idUsuario, "exercicios"] });
            setTextoRecomendacao("");
            setDialogOpen(false);
        },
        onError: () => alert("Erro ao salvar recomendação."),
    });

    const removeMutation = useMutation({
        mutationFn: async (id: number) => {
            await http.delete(`/api/diario_saude/exercicio-recomendado/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["usuario", idUsuario, "exercicios"] });
        },
        onError: () => alert("Erro ao remover recomendação."),
    });

    const handleAdd = () => {
        if (!textoRecomendacao.trim()) return alert("A recomendação não pode estar vazia!");
        addMutation.mutate(textoRecomendacao.trim());
    };

    const dataHoje = new Date().toLocaleDateString("pt-BR");

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
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
                        <Typography fontWeight={700}>
                            {medicoLogado?.name ?? medicoLogado?.nome ?? "Médico"}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">{dataHoje}</Typography>
                    </Box>
                </Box>

                <Divider sx={{ mb: 3 }} />

                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Box display="flex" alignItems="center" gap={1}>
                        <FitnessCenterIcon sx={{ color: "#008000" }} />
                        <Typography variant="h6" fontWeight={600}>Exercícios Recomendados</Typography>
                    </Box>
                    <Chip
                        label={carregando ? "..." : `${exerciciosSalvos.length} item(s)`}
                        size="small"
                        color="primary"
                        variant="outlined"
                    />
                </Box>

                {carregando ? (
                    <Box display="flex" justifyContent="center" py={3}>
                        <CircularProgress size={32} />
                    </Box>
                ) : exerciciosSalvos.length === 0 ? (
                    <Box sx={{ p: 4, textAlign: "center", bgcolor: "#fafafa", borderRadius: 2, border: "1px dashed #ccc", mb: 3 }}>
                        <FitnessCenterIcon sx={{ fontSize: 40, color: "#ccc", mb: 1 }} />
                        <Typography color="text.secondary">Nenhuma recomendação adicionada ainda.</Typography>
                    </Box>
                ) : (
                    <Stack spacing={1.5} mb={3}>
                        {exerciciosSalvos.map((rec: any) => (
                            <Paper
                                key={rec.id}
                                elevation={0}
                                sx={{
                                    p: 2, borderRadius: 2, border: "1px solid #e0e0e0",
                                    borderLeft: "4px solid #008000",
                                    display: "flex", justifyContent: "space-between", alignItems: "center",
                                }}
                            >
                                <Box display="flex" alignItems="center" gap={1} flex={1}>
                                    <FitnessCenterIcon fontSize="small" sx={{ color: "#008000" }} />
                                    <Typography sx={{ wordBreak: "break-word" }}>{rec.descricao}</Typography>
                                </Box>
                                <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() => removeMutation.mutate(rec.id)}
                                    disabled={removeMutation.isPending}
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
                    sx={{ borderRadius: 2, py: 1.2 }}
                    onClick={() => setDialogOpen(true)}
                >
                    Adicionar Recomendação
                </Button>
            </Paper>

            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle sx={{ borderBottom: "1px solid #eee", pb: 2 }}>
                    <Box display="flex" alignItems="center" gap={1}>
                        <FitnessCenterIcon sx={{ color: "#008000" }} />
                        Adicionar Recomendação de Exercício
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
                    <Button
                        variant="contained"
                        onClick={handleAdd}
                        disabled={addMutation.isPending}
                    >
                        {addMutation.isPending ? "Salvando..." : "Adicionar"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}