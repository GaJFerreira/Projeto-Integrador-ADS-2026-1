import {
    Typography, Button, Paper, Stack,
    CircularProgress, Alert, Container,
    Box, Divider, Chip,
} from "@mui/material";
import AssignmentIcon from "@mui/icons-material/Assignment";
import PersonIcon from "@mui/icons-material/Person";
import { useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { questionarioApi } from "../api/questionarioApi";

export default function MedicoRespostasQuestionarioPage() {
    const navigate = useNavigate();
    const location = useLocation();

    // ✅ pega o paciente do state — igual RecomendacaoExerciciosPage
    const paciente = location.state?.paciente;
    const prescricao = location.state?.prescricao;

    const medicoLogado = (() => {
        try {
            return JSON.parse(localStorage.getItem("usuario") || "null") ||
                JSON.parse(localStorage.getItem("user") || "null");
        } catch { return null; }
    })();

    const { data: respostas = [], isLoading, isError } = useQuery({
        queryKey: ["questionario", "respostas", paciente?.id_usuario],
        queryFn: () => questionarioApi.obterRespostas(paciente.id_usuario),
        enabled: !!paciente?.id_usuario,
        refetchOnWindowFocus: false,
    });

    const dataHoje = new Date().toLocaleDateString("pt-BR");

    const pontuacaoTotal = respostas.reduce((acc: number, r: any) => acc + (r.peso ?? 0), 0);

    const classificacao = (() => {
        if (pontuacaoTotal <= 6) return { label: "Robusto", color: "#2e7d32" };
        if (pontuacaoTotal <= 14) return { label: "Em risco", color: "#f57c00" };
        if (pontuacaoTotal <= 20) return { label: "Moderadamente frágil", color: "#e65100" };
        return { label: "Altamente frágil", color: "#c62828" };
    })();

    if (!paciente) {
        navigate("/medico");
        return null;
    }

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>

            {/* Cabeçalho */}
            <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 3, borderTop: "4px solid #1976d2" }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box display="flex" alignItems="center" gap={1.5}>
                        <AssignmentIcon sx={{ fontSize: 36, color: "#1976d2" }} />
                        <Box>
                            <Typography variant="h5" fontWeight={700} color="#1976d2">
                                QUESTIONÁRIO DE SAÚDE
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
                        <Typography fontWeight={700} fontSize="1rem">{paciente.nome}</Typography>
                        {paciente.idade > 0 && (
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

                {/* Pontuação */}
                {respostas.length > 0 && (
                    <Box sx={{ p: 3, mb: 3, borderRadius: 2, border: `2px solid ${classificacao.color}`, textAlign: "center" }}>
                        <Typography variant="caption" color="text.secondary">Pontuação total</Typography>
                        <Typography variant="h2" fontWeight={800} sx={{ color: classificacao.color }}>
                            {pontuacaoTotal}
                        </Typography>
                        <Chip
                            label={classificacao.label}
                            sx={{ bgcolor: classificacao.color, color: "white", fontWeight: 700, mt: 1 }}
                        />
                    </Box>
                )}

                {/* Lista de respostas */}
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Box display="flex" alignItems="center" gap={1}>
                        <AssignmentIcon sx={{ color: "#1976d2" }} />
                        <Typography variant="h6" fontWeight={600}>Respostas</Typography>
                    </Box>
                    <Chip
                        label={`${respostas.length} pergunta(s)`}
                        size="small"
                        color="primary"
                        variant="outlined"
                    />
                </Box>

                {isLoading && <CircularProgress />}

                {isError && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        Erro ao carregar respostas. Tente novamente.
                    </Alert>
                )}

                {!isLoading && respostas.length === 0 && (
                    <Box sx={{ p: 4, textAlign: "center", bgcolor: "#fafafa", borderRadius: 2, border: "1px dashed #ccc" }}>
                        <AssignmentIcon sx={{ fontSize: 40, color: "#ccc", mb: 1 }} />
                        <Typography color="text.secondary">
                            Este paciente ainda não respondeu o questionário.
                        </Typography>
                    </Box>
                )}

                <Stack spacing={1.5}>
                    {respostas.map((r: any, idx: number) => (
                        <Paper
                            key={r.perguntaId}
                            elevation={0}
                            sx={{
                                p: 2, borderRadius: 2,
                                border: "1px solid #e0e0e0",
                                borderLeft: `4px solid ${r.peso > 0 ? "#f57c00" : "#2e7d32"}`,
                            }}
                        >
                            <Typography variant="caption" color="text.secondary">
                                Pergunta {idx + 1}
                            </Typography>
                            <Typography fontWeight={600} mb={0.5}>
                                {r.perguntaTexto ?? r.pergunta?.texto ?? "—"}
                            </Typography>
                            <Typography variant="body2">
                                <strong>Resposta:</strong> {r.resposta}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                <strong>Peso:</strong> {r.peso}
                            </Typography>
                        </Paper>
                    ))}
                </Stack>
            </Paper>
        </Container>
    );
}