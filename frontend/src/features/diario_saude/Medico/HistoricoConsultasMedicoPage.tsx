import { useState, useEffect } from "react";
import {
    Box, Paper, Typography, List, ListItemText,
    ListItemButton, Divider, Dialog, DialogTitle,
    DialogContent, DialogActions, Button, Container, Chip,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MedicationIcon from "@mui/icons-material/Medication";
import ScienceIcon from "@mui/icons-material/Science";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { useLocation, useNavigate } from "react-router-dom";
import type { Prescricao, PrescricaoMedicamento, PrescricaoExame } from "../api/types";
import { prescricaoApi } from "../api/prescricaoApi";

function formatFrequencia(f: string | number | undefined) {
    if (!f) return "-";
    const num = typeof f === "string" ? parseInt(f) : f;
    return isNaN(num) ? String(f) : `${num}h`;
}

function formatarData(data: string) {
    if (!data) return "—";
    return new Date(data).toLocaleDateString("pt-BR");
}

export default function HistoricoConsultasMedicoPage() {
    const location = useLocation();
    const navigate = useNavigate();

    const paciente = location.state?.paciente;
    if (!paciente) {
        navigate("/atendimento/dashboard");
        return null;
    }

    const idUsuario: number = location.state?.prescricao?.id_usuario ?? paciente?.id_usuario;

    const [consultas, setConsultas] = useState<Prescricao[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [consultaSelecionada, setConsultaSelecionada] = useState<Prescricao | null>(null);

    useEffect(() => {
        if (!idUsuario) return;

        prescricaoApi.porUsuario(idUsuario)
            .then((res) => {
                // Mostra todas as consultas, sem filtrar por itens
                const ordenadas = [...res].sort((a, b) =>
                    new Date(b.data_prescricao).getTime() - new Date(a.data_prescricao).getTime()
                );
                setConsultas(ordenadas);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
            });
    }, [idUsuario]);

    const handleClickConsulta = (consulta: Prescricao) => {
        setConsultaSelecionada(consulta);
        setDialogOpen(true);
    };

    const handleClose = () => {
        setDialogOpen(false);
        setConsultaSelecionada(null);
    };

    const totalItens = (c: Prescricao) =>
        (c.medicamentos?.length ?? 0) +
        (c.exames?.length ?? 0) +
        (c.exerciciosRecomendados?.length ?? 0);

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate(-1)}
                sx={{ textTransform: "none", mb: 2 }}
            >
                Voltar
            </Button>

            <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 3, borderTop: "4px solid #1565c0" }}>
                <Typography variant="h5" fontWeight={700} color="#1565c0">
                    Histórico de Consultas
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {paciente.nome}
                </Typography>
            </Paper>

            {loading ? (
                <Typography color="text.secondary" align="center" mt={2}>Carregando…</Typography>
            ) : consultas.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: "center", borderRadius: 3 }}>
                    <Typography color="text.secondary">Nenhuma consulta encontrada.</Typography>
                </Paper>
            ) : (
                <List disablePadding sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                    {consultas.map(c => (
                        <Paper
                            key={c.id_prescricao}
                            elevation={0}
                            sx={{ borderRadius: 2, border: "1px solid #e0e0e0", borderLeft: "4px solid #1565c0" }}
                        >
                            <ListItemButton
                                onClick={() => handleClickConsulta(c)}
                                sx={{ borderRadius: 2, py: 2, px: 2 }}
                            >
                                <Box display="flex" justifyContent="space-between" alignItems="center" width="100%">
                                    <Box display="flex" alignItems="center" gap={1.5}>
                                        <CalendarTodayIcon fontSize="small" color="primary" />
                                        <Box>
                                            <Typography fontWeight={600}>
                                                Consulta — {formatarData(c.data_prescricao)}
                                            </Typography>
                                            <Box display="flex" gap={0.5} mt={0.5} flexWrap="wrap">
                                                {(c.medicamentos?.length ?? 0) > 0 && (
                                                    <Chip icon={<MedicationIcon />} label={`${c.medicamentos!.length} med.`} size="small" color="error" variant="outlined" />
                                                )}
                                                {(c.exames?.length ?? 0) > 0 && (
                                                    <Chip icon={<ScienceIcon />} label={`${c.exames!.length} exame(s)`} size="small" color="warning" variant="outlined" />
                                                )}
                                                {(c.exerciciosRecomendados?.length ?? 0) > 0 && (
                                                    <Chip icon={<FitnessCenterIcon />} label={`${c.exerciciosRecomendados!.length} exerc.`} size="small" color="success" variant="outlined" />
                                                )}
                                                {totalItens(c) === 0 && (
                                                    <Chip label="Sem itens" size="small" variant="outlined" />
                                                )}
                                            </Box>
                                        </Box>
                                    </Box>
                                </Box>
                            </ListItemButton>
                        </Paper>
                    ))}
                </List>
            )}

            {/* Dialog detalhado */}
            <Dialog open={dialogOpen} onClose={handleClose} fullWidth maxWidth="sm">
                <DialogTitle>
                    <Box display="flex" alignItems="center" gap={1}>
                        <CalendarTodayIcon color="primary" />
                        Consulta — {consultaSelecionada && formatarData(consultaSelecionada.data_prescricao)}
                    </Box>
                </DialogTitle>
                <DialogContent dividers>

                    {/* Medicamentos */}
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <MedicationIcon color="error" fontSize="small" />
                        <Typography variant="subtitle1" fontWeight="bold">Medicamentos</Typography>
                    </Box>
                    {(consultaSelecionada?.medicamentos?.length ?? 0) === 0 ? (
                        <Typography color="text.secondary" mb={2}>Nenhum medicamento prescrito.</Typography>
                    ) : (
                        <List dense disablePadding sx={{ mb: 2 }}>
                            {consultaSelecionada?.medicamentos?.map((m: PrescricaoMedicamento, i) => (
                                <Paper key={i} elevation={0} sx={{ p: 2, mb: 1, border: "1px solid #eee", borderRadius: 2 }}>
                                    <Typography fontWeight={700}>{m.nome_medicamento || "-"}</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {[m.principio_ativo, m.concentracao, m.via].filter(Boolean).join(" • ")}
                                    </Typography>
                                    <Box display="flex" gap={1} mt={0.5} flexWrap="wrap">
                                        {m.dosagem && <Chip label={`Dosagem: ${m.dosagem}`} size="small" variant="outlined" />}
                                        {m.frequencia && <Chip label={`Frequência: ${formatFrequencia(m.frequencia)}`} size="small" variant="outlined" />}
                                    </Box>
                                </Paper>
                            ))}
                        </List>
                    )}

                    <Divider sx={{ my: 2 }} />

                    {/* Exames */}
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <ScienceIcon color="warning" fontSize="small" />
                        <Typography variant="subtitle1" fontWeight="bold">Exames</Typography>
                    </Box>
                    {(consultaSelecionada?.exames?.length ?? 0) === 0 ? (
                        <Typography color="text.secondary" mb={2}>Nenhum exame solicitado.</Typography>
                    ) : (
                        <List dense disablePadding sx={{ mb: 2 }}>
                            {consultaSelecionada?.exames?.map((e: PrescricaoExame, i) => (
                                <Paper key={i} elevation={0} sx={{ p: 1.5, mb: 1, border: "1px solid #eee", borderRadius: 2 }}>
                                    <Typography fontWeight={600}>{e.nome_exame || "Exame desconhecido"}</Typography>
                                    {e.resultado && (
                                        <Typography variant="body2" color="text.secondary">
                                            Resultado: {e.resultado}
                                        </Typography>
                                    )}
                                </Paper>
                            ))}
                        </List>
                    )}

                    <Divider sx={{ my: 2 }} />

                    {/* Exercícios */}
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <FitnessCenterIcon sx={{ color: "#008000" }} fontSize="small" />
                        <Typography variant="subtitle1" fontWeight="bold">Exercícios Recomendados</Typography>
                    </Box>
                    {(consultaSelecionada?.exerciciosRecomendados?.length ?? 0) === 0 ? (
                        <Typography color="text.secondary">Nenhuma recomendação de exercício.</Typography>
                    ) : (
                        <List dense disablePadding>
                            {consultaSelecionada?.exerciciosRecomendados?.map((e: any, i: number) => (
                                <Paper key={i} elevation={0} sx={{ p: 1.5, mb: 1, border: "1px solid #eee", borderRadius: 2 }}>
                                    <Typography>{e.descricao}</Typography>
                                </Paper>
                            ))}
                        </List>
                    )}

                    {/* Observações */}
                    {consultaSelecionada?.observacoes && (
                        <>
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="subtitle1" fontWeight="bold">Observações</Typography>
                            <Typography>{consultaSelecionada.observacoes}</Typography>
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Fechar</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}