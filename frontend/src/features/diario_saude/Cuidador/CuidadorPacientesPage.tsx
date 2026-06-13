import { useState } from "react";
import {
    Container, Paper, Typography, Button, Box,
    Avatar, Chip, Stack, CircularProgress,
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, InputAdornment,
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import MonitorWeightIcon from "@mui/icons-material/MonitorWeight";
import MedicalInformationIcon from "@mui/icons-material/MedicalInformation";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import SearchIcon from "@mui/icons-material/Search";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import http from "@/lib/http";

function avatarColor(nome: string): string {
    const cores = ["#1976d2", "#388e3c", "#f57c00", "#7b1fa2", "#c62828", "#00796b"];
    return cores[(nome?.charCodeAt(0) ?? 0) % cores.length];
}

export default function CuidadorPacientesPage() {
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    const cuidadorLogado = (() => {
        try {
            return JSON.parse(localStorage.getItem("usuario") || "null") ||
                JSON.parse(localStorage.getItem("user") || "null");
        } catch { return null; }
    })();

    const cuidadorPlatformId = cuidadorLogado?.userId ?? cuidadorLogado?.id;
    const headers = { Authorization: `Bearer ${token}` };

    const [busca, setBusca] = useState("");
    const [pacienteSelecionado, setPacienteSelecionado] = useState<any>(null);
    const [dialogOpen, setDialogOpen] = useState(false);

    const { data: pacientes = [], isLoading } = useQuery({
        queryKey: ["cuidador", cuidadorPlatformId, "pacientes"],
        queryFn: async () => {
            const { data } = await http.get(
                `/api/diario_saude/cuidador-paciente/pacientes/${cuidadorPlatformId}`,
                { headers }
            );
            return Array.isArray(data) ? data : [];
        },
        enabled: !!cuidadorPlatformId,
    });

    const pacientesFiltrados = pacientes.filter((p: any) =>
        (p.nome ?? "").toLowerCase().includes(busca.toLowerCase())
    );

    const temBiometricos = (p: any) => (p?.peso ?? 0) > 0 && (p?.altura ?? 0) > 0;

    const handleAcessar = (paciente: any) => {
        setPacienteSelecionado(paciente);
        setDialogOpen(true);
    };

    const handleNavegar = (destino: string) => {
        setDialogOpen(false);
        navigate(destino, {
            state: {
                paciente: pacienteSelecionado,
                modoLeitura: destino === "/informacoes_saude",
            }
        });
    };

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            {/* Header */}
            <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 3, border: "1px solid #e8eaf6", borderTop: "4px solid #1565c0" }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box display="flex" alignItems="center" gap={1.5}>
                        <PeopleIcon sx={{ fontSize: 32, color: "#1565c0" }} />
                        <Box>
                            <Typography variant="h5" fontWeight={700} color="#1565c0">MEUS PACIENTES</Typography>
                            <Typography variant="caption" color="text.secondary">Plataforma UNATI — Diário da Saúde</Typography>
                        </Box>
                    </Box>
                    <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} size="small">Voltar</Button>
                </Box>
            </Paper>

            {/* Barra de pesquisa */}
            <Paper elevation={0} sx={{ p: 2, mb: 2, borderRadius: 3, border: "1px solid #e8eaf6" }}>
                <TextField
                    fullWidth
                    size="small"
                    placeholder="Pesquisar paciente pelo nome..."
                    value={busca}
                    onChange={e => setBusca(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon sx={{ color: "#9e9e9e" }} />
                            </InputAdornment>
                        ),
                    }}
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                />
            </Paper>

            {/* Lista de pacientes */}
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid #e8eaf6" }}>
                {isLoading ? (
                    <Box display="flex" justifyContent="center" py={6}><CircularProgress /></Box>
                ) : pacientes.length === 0 ? (
                    <Box sx={{ p: 4, textAlign: "center" }}>
                        <PeopleIcon sx={{ fontSize: 48, color: "#ccc", mb: 1 }} />
                        <Typography color="text.secondary">Nenhum paciente vinculado ainda.</Typography>
                        <Typography variant="caption" color="text.secondary">
                            Entre em contato com o administrador para vincular pacientes.
                        </Typography>
                    </Box>
                ) : pacientesFiltrados.length === 0 ? (
                    <Box sx={{ p: 4, textAlign: "center" }}>
                        <SearchIcon sx={{ fontSize: 48, color: "#ccc", mb: 1 }} />
                        <Typography color="text.secondary">Nenhum paciente encontrado para "{busca}".</Typography>
                    </Box>
                ) : (
                    <Stack spacing={1.5}>
                        <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5 }}>
                            {pacientesFiltrados.length} paciente{pacientesFiltrados.length !== 1 ? "s" : ""} encontrado{pacientesFiltrados.length !== 1 ? "s" : ""}
                        </Typography>
                        {pacientesFiltrados.map((p: any) => (
                            <Paper
                                key={p.id_usuario}
                                elevation={0}
                                onClick={() => handleAcessar(p)}
                                sx={{
                                    p: 2, borderRadius: 3,
                                    border: "1px solid #e8eaf6",
                                    cursor: "pointer",
                                    display: "flex", alignItems: "center", gap: 2,
                                    "&:hover": { borderColor: "#1565c0", bgcolor: "#f8f9ff" },
                                    transition: "all 0.15s ease",
                                }}
                            >
                                <Avatar sx={{ bgcolor: avatarColor(p.nome ?? ""), width: 48, height: 48, fontWeight: 700, fontSize: "1.1rem" }}>
                                    {p.nome?.[0]?.toUpperCase() ?? "?"}
                                </Avatar>
                                <Box flex={1} minWidth={0}>
                                    <Typography fontWeight={600} fontSize="1rem" noWrap>{p.nome}</Typography>
                                    <Box display="flex" gap={0.5} mt={0.3} flexWrap="wrap">
                                        {temBiometricos(p) ? (
                                            <Chip
                                                icon={<CheckCircleOutlineIcon />}
                                                label={`${p.peso} kg · ${p.altura} cm`}
                                                size="small" color="success" variant="outlined"
                                                sx={{ fontSize: 11, height: 20 }}
                                            />
                                        ) : (
                                            <Chip
                                                icon={<WarningAmberIcon />}
                                                label="Biométricos não preenchidos"
                                                size="small" color="warning" variant="outlined"
                                                sx={{ fontSize: 11, height: 20 }}
                                            />
                                        )}
                                        {p.dataNascimento && (
                                            <Chip
                                                label={`${calcularIdade(p.dataNascimento)} anos`}
                                                size="small" variant="outlined"
                                                sx={{ fontSize: 11, height: 20 }}
                                            />
                                        )}
                                    </Box>
                                </Box>
                                <ChevronRightIcon sx={{ color: "#bdbdbd" }} />
                            </Paper>
                        ))}
                    </Stack>
                )}
            </Paper>

            {/* Dialog de ações */}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ pb: 1 }}>
                    <Box display="flex" alignItems="center" gap={1.5}>
                        <Avatar sx={{ bgcolor: avatarColor(pacienteSelecionado?.nome ?? ""), width: 40, height: 40 }}>
                            {pacienteSelecionado?.nome?.[0]?.toUpperCase() ?? "?"}
                        </Avatar>
                        <Box>
                            <Typography fontWeight={700}>{pacienteSelecionado?.nome}</Typography>
                            <Typography variant="caption" color="text.secondary">Selecione uma ação</Typography>
                        </Box>
                    </Box>
                </DialogTitle>
                <DialogContent sx={{ pt: 1 }}>
                    <Stack spacing={1.5}>
                        <Paper
                            elevation={0}
                            onClick={() => handleNavegar("/cuidador/biometricos")}
                            sx={{
                                p: 2, borderRadius: 2, border: "1px solid #e3f2fd",
                                cursor: "pointer", display: "flex", alignItems: "center", gap: 1.5,
                                "&:hover": { bgcolor: "#e3f2fd" }, transition: "all 0.15s",
                            }}
                        >
                            <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: "#e3f2fd", display: "flex", alignItems: "center", justifyContent: "center", color: "#1565c0" }}>
                                <MonitorWeightIcon />
                            </Box>
                            <Box>
                                <Typography fontWeight={600} fontSize="0.9rem">Dados Biométricos</Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {temBiometricos(pacienteSelecionado)
                                        ? `Peso: ${pacienteSelecionado?.peso} kg · Altura: ${pacienteSelecionado?.altura} cm`
                                        : "Preencher peso, altura e data de nascimento"}
                                </Typography>
                            </Box>
                            <ChevronRightIcon sx={{ color: "#bdbdbd", ml: "auto" }} />
                        </Paper>

                        <Paper
                            elevation={0}
                            onClick={() => handleNavegar("/informacoes_saude")}
                            sx={{
                                p: 2, borderRadius: 2, border: "1px solid #f3e5f5",
                                cursor: "pointer", display: "flex", alignItems: "center", gap: 1.5,
                                "&:hover": { bgcolor: "#f3e5f5" }, transition: "all 0.15s",
                            }}
                        >
                            <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: "#f3e5f5", display: "flex", alignItems: "center", justifyContent: "center", color: "#6a1b9a" }}>
                                <MedicalInformationIcon />
                            </Box>
                            <Box>
                                <Typography fontWeight={600} fontSize="0.9rem">Prontuário</Typography>
                                <Typography variant="caption" color="text.secondary">Visualizar histórico completo de saúde</Typography>
                            </Box>
                            <ChevronRightIcon sx={{ color: "#bdbdbd", ml: "auto" }} />
                        </Paper>
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 2, pt: 0 }}>
                    <Button onClick={() => setDialogOpen(false)} size="small">Cancelar</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}

function calcularIdade(dataNascimento: any): number {
    try {
        let nasc: Date;
        if (Array.isArray(dataNascimento)) {
            nasc = new Date(dataNascimento[0], dataNascimento[1] - 1, dataNascimento[2]);
        } else {
            const str = String(dataNascimento);
            if (str.includes("/")) {
                // Formato brasileiro "dd/MM/yyyy"
                const [dia, mes, ano] = str.split("/").map(Number);
                nasc = new Date(ano, mes - 1, dia);
            } else {
                // Formato ISO "yyyy-MM-dd"
                const [ano, mes, dia] = str.split("T")[0].split("-").map(Number);
                nasc = new Date(ano, mes - 1, dia);
            }
        }
        const hoje = new Date();
        let idade = hoje.getFullYear() - nasc.getFullYear();
        const m = hoje.getMonth() - nasc.getMonth();
        if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;
        return isNaN(idade) ? 0 : idade;
    } catch { return 0; }
}