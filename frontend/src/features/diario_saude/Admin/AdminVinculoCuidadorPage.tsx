import { useState } from "react";
import {
    Container, Paper, Typography, Button, Box,
    Avatar, Chip, Stack, CircularProgress,
    Autocomplete, TextField, IconButton,
    Dialog, DialogTitle, DialogContent, DialogActions,
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import LinkIcon from "@mui/icons-material/Link";
import LinkOffIcon from "@mui/icons-material/LinkOff";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PersonIcon from "@mui/icons-material/Person";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import http from "@/lib/http";

function avatarColor(nome: string): string {
    const cores = ["#1976d2", "#388e3c", "#f57c00", "#7b1fa2", "#c62828", "#00796b"];
    return cores[(nome?.charCodeAt(0) ?? 0) % cores.length];
}

function renderOpcao(props: any, nome: string, id: any) {
    const { key, ...rest } = props;
    return (
        <Box key={String(id)} component="li" {...rest} display="flex" alignItems="center" gap={1.5}>
            <Avatar sx={{ width: 28, height: 28, bgcolor: avatarColor(nome), fontSize: "0.75rem" }}>
                {nome?.[0]?.toUpperCase() ?? "?"}
            </Avatar>
            {nome || "(sem nome)"}
        </Box>
    );
}

export default function AdminVinculoCuidadorPage() {
    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const queryClient = useQueryClient();
    const headers = { Authorization: `Bearer ${token}` };

    const [cuidadorSelecionado, setCuidadorSelecionado] = useState<any>(null);
    const [pacienteSelecionado, setPacienteSelecionado] = useState<any>(null);
    const [confirmarDesvinculo, setConfirmarDesvinculo] = useState<any>(null);

    // Busca todos os usuários e filtra por role.code no frontend
    const { data: todosUsuarios = [], isLoading: loadingUsuarios } = useQuery({
        queryKey: ["admin", "todos-usuarios"],
        queryFn: async () => {
            const { data } = await http.get("/api/users", { headers });
            return Array.isArray(data) ? data : [];
        },
    });

    const cuidadores = todosUsuarios.filter((u: any) => u.role?.code === "CUIDADOR");
    const idosos = todosUsuarios.filter((u: any) => u.role?.code === "IDOSO");

    // Pacientes vinculados ao cuidador selecionado
    const { data: vinculados = [], isLoading: loadingVinculados } = useQuery({
        queryKey: ["admin", "cuidador", cuidadorSelecionado?.id, "pacientes"],
        queryFn: async () => {
            const { data } = await http.get(
                `/api/diario_saude/cuidador-paciente/pacientes/${cuidadorSelecionado.id}`,
                { headers }
            );
            return Array.isArray(data) ? data : [];
        },
        enabled: !!cuidadorSelecionado,
    });

    // Idosos que ainda não estão vinculados a este cuidador
    const pacientesDisponiveis = idosos.filter((u: any) =>
        !vinculados.some((v: any) => v.platformUserId === u.id)
    );

    const vincularMutation = useMutation({
        mutationFn: async () => {
            // Busca o registro clínico do idoso selecionado para pegar o id_usuario
            const { data: clinico } = await http.get(
                `/api/diario_saude/usuario/por-user/${pacienteSelecionado.id}?nome=${encodeURIComponent(pacienteSelecionado.name ?? "")}`,
                { headers }
            );
            await http.post("/api/diario_saude/cuidador-paciente/vincular", null, {
                params: {
                    cuidadorPlatformId: cuidadorSelecionado.id,
                    pacienteId: clinico.id_usuario,
                },
                headers,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin", "cuidador", cuidadorSelecionado?.id] });
            setPacienteSelecionado(null);
        },
        onError: () => alert("Erro ao vincular. Verifique se já existe um vínculo."),
    });

    const desvincularMutation = useMutation({
        mutationFn: async ({ cuidadorId, pacienteId }: { cuidadorId: number; pacienteId: number }) => {
            await http.delete("/api/diario_saude/cuidador-paciente/desvincular", {
                params: { cuidadorPlatformId: cuidadorId, pacienteId },
                headers,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin", "cuidador", cuidadorSelecionado?.id] });
            setConfirmarDesvinculo(null);
        },
        onError: () => alert("Erro ao desvincular."),
    });

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 3, border: "1px solid #e8eaf6", borderTop: "4px solid #1565c0" }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box display="flex" alignItems="center" gap={1.5}>
                        <LinkIcon sx={{ fontSize: 32, color: "#1565c0" }} />
                        <Box>
                            <Typography variant="h5" fontWeight={700} color="#1565c0">VÍNCULOS CUIDADOR-PACIENTE</Typography>
                            <Typography variant="caption" color="text.secondary">Plataforma UNATI — Diário da Saúde</Typography>
                        </Box>
                    </Box>
                    <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} size="small">Voltar</Button>
                </Box>
            </Paper>

            <Stack spacing={3}>
                {/* Selecionar cuidador */}
                <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid #e8eaf6" }}>
                    <Typography fontWeight={700} mb={2} display="flex" alignItems="center" gap={1}>
                        <PersonIcon color="primary" fontSize="small" /> Selecionar Cuidador
                    </Typography>
                    <Autocomplete
                        options={cuidadores}
                        getOptionLabel={(o: any) => o.name ?? ""}
                        value={cuidadorSelecionado}
                        onChange={(_, v) => { setCuidadorSelecionado(v); setPacienteSelecionado(null); }}
                        loading={loadingUsuarios}
                        noOptionsText="Nenhum cuidador encontrado"
                        renderInput={(params) => <TextField {...params} label="Cuidador" size="small" />}
                        renderOption={(props, o: any) => renderOpcao(props, o.name ?? "", o.id)}
                    />
                </Paper>

                {/* Vincular paciente */}
                {cuidadorSelecionado && (
                    <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid #e8eaf6" }}>
                        <Typography fontWeight={700} mb={2} display="flex" alignItems="center" gap={1}>
                            <LinkIcon color="primary" fontSize="small" /> Vincular Novo Paciente
                        </Typography>
                        <Box display="flex" gap={2}>
                            <Autocomplete
                                fullWidth
                                options={pacientesDisponiveis}
                                getOptionLabel={(o: any) => o.name ?? ""}
                                value={pacienteSelecionado}
                                onChange={(_, v) => setPacienteSelecionado(v)}
                                loading={loadingUsuarios}
                                noOptionsText="Nenhum paciente disponível"
                                renderInput={(params) => <TextField {...params} label="Paciente (Idoso)" size="small" />}
                                renderOption={(props, o: any) => renderOpcao(props, o.name ?? "", o.id)}
                            />
                            <Button
                                variant="contained"
                                startIcon={<LinkIcon />}
                                onClick={() => vincularMutation.mutate()}
                                disabled={!pacienteSelecionado || vincularMutation.isPending}
                                sx={{ borderRadius: 2, whiteSpace: "nowrap", minWidth: 120 }}
                            >
                                {vincularMutation.isPending ? "Vinculando..." : "Vincular"}
                            </Button>
                        </Box>
                    </Paper>
                )}

                {/* Lista de vinculados */}
                {cuidadorSelecionado && (
                    <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid #e8eaf6" }}>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                            <Typography fontWeight={700} display="flex" alignItems="center" gap={1}>
                                <PeopleIcon color="primary" fontSize="small" /> Pacientes Vinculados
                            </Typography>
                            <Chip label={vinculados.length} size="small" color="primary" variant="outlined" />
                        </Box>

                        {loadingVinculados ? (
                            <Box display="flex" justifyContent="center" py={3}><CircularProgress size={28} /></Box>
                        ) : vinculados.length === 0 ? (
                            <Box sx={{ p: 3, textAlign: "center", border: "1px dashed #ccc", borderRadius: 2 }}>
                                <Typography color="text.secondary" variant="body2">
                                    Nenhum paciente vinculado a este cuidador.
                                </Typography>
                            </Box>
                        ) : (
                            <Stack spacing={1}>
                                {vinculados.map((p: any) => (
                                    <Box
                                        key={p.id_usuario}
                                        sx={{
                                            p: 1.5, borderRadius: 2,
                                            border: "1px solid #e8eaf6",
                                            display: "flex", alignItems: "center", gap: 1.5,
                                        }}
                                    >
                                        <Avatar sx={{ width: 36, height: 36, bgcolor: avatarColor(p.nome ?? ""), fontSize: "0.85rem" }}>
                                            {p.nome?.[0]?.toUpperCase() ?? "?"}
                                        </Avatar>
                                        <Typography flex={1} fontWeight={500} fontSize="0.9rem">{p.nome}</Typography>
                                        <IconButton size="small" color="error" onClick={() => setConfirmarDesvinculo(p)}>
                                            <LinkOffIcon fontSize="small" />
                                        </IconButton>
                                    </Box>
                                ))}
                            </Stack>
                        )}
                    </Paper>
                )}
            </Stack>

            <Dialog open={!!confirmarDesvinculo} onClose={() => setConfirmarDesvinculo(null)} maxWidth="xs" fullWidth>
                <DialogTitle>
                    <Box display="flex" alignItems="center" gap={1}>
                        <LinkOffIcon color="error" /> Confirmar desvinculação
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        Desvincular <strong>{confirmarDesvinculo?.nome}</strong> do cuidador <strong>{cuidadorSelecionado?.name}</strong>?
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setConfirmarDesvinculo(null)}>Cancelar</Button>
                    <Button
                        variant="contained" color="error"
                        onClick={() => desvincularMutation.mutate({
                            cuidadorId: cuidadorSelecionado.id,
                            pacienteId: confirmarDesvinculo.id_usuario,
                        })}
                        disabled={desvincularMutation.isPending}
                    >
                        {desvincularMutation.isPending ? "Desvinculando..." : "Desvincular"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}