import { useState } from "react";
import {
    Container, Paper, Typography, Button, Box,
    Chip, Divider, Stack, TextField, CircularProgress,
    Dialog, DialogTitle, DialogContent, DialogActions,
} from "@mui/material";
import ScienceIcon from "@mui/icons-material/Science";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import { useNavigate, useLocation } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import http from "@/lib/http";

function formatarData(data: any): string {
    if (!data) return "—";
    if (Array.isArray(data)) {
        const [ano, mes, dia] = data;
        return new Date(ano, mes - 1, dia).toLocaleDateString("pt-BR");
    }
    return new Date(data).toLocaleDateString("pt-BR");
}

export default function RegistrarResultadoExamePage() {
    const navigate = useNavigate();
    const location = useLocation();
    const token = localStorage.getItem("token");
    const paciente = location.state?.paciente;
    const prescricao = location.state?.prescricao;
    const idUsuario: number = prescricao?.id_usuario;
    const queryClient = useQueryClient();

    const [dialogOpen, setDialogOpen] = useState(false);
    const [exameAtivo, setExameAtivo] = useState<any>(null);
    const [resultado, setResultado] = useState("");
    const [dataRealizacao, setDataRealizacao] = useState("");

    // IDs salvos localmente nesta sessão para evitar loop visual
    const [salvosSessao, setSalvosSessao] = useState<Set<number>>(new Set());

    const medicoLogado = (() => {
        try {
            return JSON.parse(localStorage.getItem("usuario") || "null") ||
                JSON.parse(localStorage.getItem("user") || "null");
        } catch { return null; }
    })();

    // Busca prescrições do paciente e agrega todos os exames
    // Usa o endpoint existente: GET /prescricao/usuario/{id}
    const { data: todosExames = [], isLoading: carregando } = useQuery({
        queryKey: ["usuario", idUsuario, "exames", "todos"],
        queryFn: async () => {
            const { data: prescricoes } = await http.get(
                `/api/diario_saude/prescricao/usuario/${idUsuario}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (!Array.isArray(prescricoes)) return [];
            return prescricoes.flatMap((p: any) =>
                Array.isArray(p.exames) ? p.exames : []
            );
        },
        enabled: !!idUsuario,
    });

    // Pendentes: sem resultado no banco E não salvos nesta sessão
    const pendentes = todosExames.filter(
        (e: any) =>
            !e.resultado &&
            !e.data_realizacao &&
            !salvosSessao.has(e.id_prescricao_exame)
    );

    // Analisados: com resultado no banco OU salvos nesta sessão
    const analisados = todosExames.filter(
        (e: any) =>
            (e.resultado && e.data_realizacao) ||
            salvosSessao.has(e.id_prescricao_exame)
    );

    const salvarMutation = useMutation({
        mutationFn: async ({ id, resultado, dataRealizacao }: { id: number; resultado: string; dataRealizacao: string }) => {
            await http.put(
                `/api/diario_saude/prescricao/exame/${id}/resultado`,
                { resultado, data_realizacao: dataRealizacao },
                { headers: { Authorization: `Bearer ${token}` } }
            );
        },
        onSuccess: (_, { id }) => {
            // Marca como salvo nesta sessão imediatamente — sem refetch que causava o loop
            setSalvosSessao(prev => new Set(prev).add(id));
            // Invalida em background para sincronizar com o servidor
            queryClient.invalidateQueries({ queryKey: ["usuario", idUsuario, "exames"] });
            setDialogOpen(false);
            setExameAtivo(null);
            setResultado("");
            setDataRealizacao("");
        },
        onError: () => alert("Erro ao salvar resultado."),
    });

    const handleAbrirDialog = (exame: any) => {
        setExameAtivo(exame);
        setResultado("");
        setDataRealizacao("");
        setDialogOpen(true);
    };

    const handleSalvar = () => {
        if (!resultado.trim()) return alert("Informe o resultado.");
        if (!dataRealizacao) return alert("Informe a data de realização.");
        salvarMutation.mutate({ id: exameAtivo.id_prescricao_exame, resultado, dataRealizacao });
    };

    const nomeExame = (ex: any) => ex.nome_exame ?? "Exame";
    const dataHoje = new Date().toLocaleDateString("pt-BR");

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 3, borderTop: "4px solid #1565c0" }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box display="flex" alignItems="center" gap={1.5}>
                        <LocalHospitalIcon sx={{ fontSize: 36, color: "#1565c0" }} />
                        <Box>
                            <Typography variant="h5" fontWeight={700} color="#1565c0">RESULTADO DE EXAMES</Typography>
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

                {carregando ? (
                    <Box display="flex" justifyContent="center" py={4}><CircularProgress /></Box>
                ) : (
                    <>
                        {/* Pendentes */}
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                            <Box display="flex" alignItems="center" gap={1}>
                                <HourglassEmptyIcon color="warning" />
                                <Typography variant="h6" fontWeight={600}>Aguardando Resultado</Typography>
                            </Box>
                            <Chip label={`${pendentes.length} pendente(s)`} size="small" color="warning" variant="outlined" />
                        </Box>

                        {pendentes.length === 0 ? (
                            <Box sx={{ p: 3, textAlign: "center", bgcolor: "#f1f8e9", borderRadius: 2, border: "1px dashed #81c784", mb: 3 }}>
                                <CheckCircleIcon sx={{ fontSize: 36, color: "#2e7d32", mb: 1 }} />
                                <Typography color="success.main" fontWeight={600}>Todos os exames foram analisados!</Typography>
                            </Box>
                        ) : (
                            <Stack spacing={1.5} mb={3}>
                                {pendentes.map((ex: any) => (
                                    <Paper
                                        key={ex.id_prescricao_exame}
                                        elevation={0}
                                        sx={{
                                            p: 2, borderRadius: 2,
                                            border: "1px solid #e0e0e0",
                                            borderLeft: "4px solid #f57c00",
                                        }}
                                    >
                                        <Box display="flex" justifyContent="space-between" alignItems="center">
                                            <Box display="flex" alignItems="center" gap={1}>
                                                <HourglassEmptyIcon fontSize="small" color="warning" />
                                                <Box>
                                                    <Typography fontWeight={600}>{nomeExame(ex)}</Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Pedido em: {formatarData(ex.data_prescricao)}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            <Button
                                                variant="contained"
                                                size="small"
                                                onClick={() => handleAbrirDialog(ex)}
                                                sx={{ borderRadius: 2, whiteSpace: "nowrap" }}
                                            >
                                                Registrar Resultado
                                            </Button>
                                        </Box>
                                    </Paper>
                                ))}
                            </Stack>
                        )}

                        <Divider sx={{ mb: 3 }} />

                        {/* Analisados */}
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                            <Box display="flex" alignItems="center" gap={1}>
                                <CheckCircleIcon sx={{ color: "#2e7d32" }} />
                                <Typography variant="h6" fontWeight={600}>Exames Analisados</Typography>
                            </Box>
                            <Chip label={`${analisados.length} analisado(s)`} size="small" color="success" variant="outlined" />
                        </Box>

                        {analisados.length === 0 ? (
                            <Box sx={{ p: 3, textAlign: "center", bgcolor: "#fafafa", borderRadius: 2, border: "1px dashed #ccc" }}>
                                <Typography color="text.secondary">Nenhum exame analisado ainda.</Typography>
                            </Box>
                        ) : (
                            <Stack spacing={1.5}>
                                {analisados.map((ex: any) => (
                                    <Paper
                                        key={ex.id_prescricao_exame}
                                        elevation={0}
                                        sx={{
                                            p: 2, borderRadius: 2,
                                            border: "1px solid #e0e0e0",
                                            borderLeft: "4px solid #2e7d32",
                                        }}
                                    >
                                        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                                            <Box display="flex" alignItems="flex-start" gap={1}>
                                                <CheckCircleIcon fontSize="small" sx={{ color: "#2e7d32", mt: 0.3 }} />
                                                <Box>
                                                    <Typography fontWeight={600}>{nomeExame(ex)}</Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Realizado em: {formatarData(ex.data_realizacao)}
                                                    </Typography>
                                                    <Paper elevation={0} sx={{ p: 1, bgcolor: "#f1f8e9", borderRadius: 1, mt: 0.5 }}>
                                                        <Typography variant="body2">{ex.resultado}</Typography>
                                                    </Paper>
                                                </Box>
                                            </Box>
                                            <Chip label="Analisado" size="small" color="success" variant="outlined" />
                                        </Box>
                                    </Paper>
                                ))}
                            </Stack>
                        )}
                    </>
                )}
            </Paper>

            {/* Dialog registrar resultado */}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>
                    <Box display="flex" alignItems="center" gap={1}>
                        <ScienceIcon color="primary" />
                        Registrar Resultado — {exameAtivo && nomeExame(exameAtivo)}
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Stack spacing={2} mt={2}>
                        <TextField
                            label="Resultado *"
                            fullWidth multiline minRows={3}
                            value={resultado}
                            onChange={(e) => setResultado(e.target.value)}
                            placeholder="Descreva o resultado do exame..."
                        />
                        <TextField
                            label="Data de realização *"
                            type="date" fullWidth
                            value={dataRealizacao}
                            onChange={(e) => setDataRealizacao(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
                    <Button
                        variant="contained"
                        onClick={handleSalvar}
                        disabled={salvarMutation.isPending}
                    >
                        {salvarMutation.isPending ? "Salvando..." : "Salvar Resultado"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}