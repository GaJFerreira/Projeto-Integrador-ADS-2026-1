import { useState } from "react";
import {
    Container, Paper, Typography, Button, Box,
    TextField, Chip, Divider, Stack, Alert, Tabs, Tab,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    IconButton, CircularProgress, Dialog, DialogTitle,
    DialogContent, DialogActions,
} from "@mui/material";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import CoronavirusIcon from "@mui/icons-material/Coronavirus";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import { useNavigate } from "react-router-dom";
import http from "@/lib/http";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function CadastroAlergiaDoencaPage() {
    const navigate = useNavigate();
    const token = localStorage.getItem("token");
    const queryClient = useQueryClient();

    const [aba, setAba] = useState(0);
    const [filtroDoenca, setFiltroDoenca] = useState("");
    const [filtroAlergia, setFiltroAlergia] = useState("");
    const [confirmarDelete, setConfirmarDelete] = useState<{ id: number; nome: string; tipo: "doenca" | "alergia" } | null>(null);

    // ── Formulários ───────────────────────────────────────────────────────────
    const [doenca, setDoenca] = useState({ nome: "", codigo: "", categoria: "", nomeAbreviado: "", restricaoSexo: "" });
    const [alergia, setAlergia] = useState({ nome: "", codigo: "", categoria: "" });
    const [erroDoenca, setErroDoenca] = useState("");
    const [erroAlergia, setErroAlergia] = useState("");
    const [sucessoDoenca, setSucessoDoenca] = useState(false);
    const [sucessoAlergia, setSucessoAlergia] = useState(false);

    const headers = { Authorization: `Bearer ${token}` };

    // ── Queries ───────────────────────────────────────────────────────────────
    const { data: doencas = [], isLoading: loadingDoencas } = useQuery({
        queryKey: ["doencas"],
        queryFn: async () => {
            const { data } = await http.get("/api/diario_saude/doencas/listar", { headers });
            return Array.isArray(data) ? data : [];
        },
    });

    const { data: alergias = [], isLoading: loadingAlergias } = useQuery({
        queryKey: ["alergias"],
        queryFn: async () => {
            const { data } = await http.get("/api/diario_saude/alergia/listar", { headers });
            return Array.isArray(data) ? data : [];
        },
        enabled: aba === 1,
    });

    // ── Mutations ─────────────────────────────────────────────────────────────
    const criarDoencaMutation = useMutation({
        mutationFn: async () => {
            await http.post("/api/diario_saude/doencas/criar", doenca, { headers });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["doencas"] });
            setDoenca({ nome: "", codigo: "", categoria: "", nomeAbreviado: "", restricaoSexo: "" });
            setSucessoDoenca(true);
            setTimeout(() => setSucessoDoenca(false), 3000);
            setErroDoenca("");
        },
        onError: () => setErroDoenca("Erro ao cadastrar doença. Verifique se o código já existe."),
    });

    const deletarDoencaMutation = useMutation({
        mutationFn: async (id: number) => {
            await http.delete(`/api/diario_saude/doencas/${id}`, { headers });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["doencas"] });
            setConfirmarDelete(null);
        },
        onError: () => alert("Erro ao deletar doença."),
    });

    const criarAlergiaMutation = useMutation({
        mutationFn: async () => {
            await http.post("/api/diario_saude/alergia/criar", {
                code: alergia.codigo,
                display: alergia.nome,
                property: alergia.categoria
                    ? [{ code: "category", valueCode: alergia.categoria }]
                    : [],
            }, { headers });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["alergias"] });
            setAlergia({ nome: "", codigo: "", categoria: "" });
            setSucessoAlergia(true);
            setTimeout(() => setSucessoAlergia(false), 3000);
            setErroAlergia("");
        },
        onError: () => setErroAlergia("Erro ao cadastrar alergia. Verifique se o código já existe."),
    });

    const deletarAlergiaMutation = useMutation({
        mutationFn: async (id: number) => {
            await http.delete(`/api/diario_saude/alergia/${id}`, { headers });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["alergias"] });
            setConfirmarDelete(null);
        },
        onError: () => alert("Erro ao deletar alergia."),
    });

    // ── Handlers ──────────────────────────────────────────────────────────────
    const handleSalvarDoenca = () => {
        if (!doenca.nome.trim()) return setErroDoenca("O nome da doença é obrigatório.");
        if (!doenca.codigo.trim()) return setErroDoenca("O código é obrigatório.");
        criarDoencaMutation.mutate();
    };

    const handleSalvarAlergia = () => {
        if (!alergia.nome.trim()) return setErroAlergia("O nome da alergia é obrigatório.");
        if (!alergia.codigo.trim()) return setErroAlergia("O código é obrigatório.");
        criarAlergiaMutation.mutate();
    };

    const handleConfirmarDelete = () => {
        if (!confirmarDelete) return;
        if (confirmarDelete.tipo === "doenca") deletarDoencaMutation.mutate(confirmarDelete.id);
        else deletarAlergiaMutation.mutate(confirmarDelete.id);
    };

    // ── Filtros ───────────────────────────────────────────────────────────────
    const doencasFiltradas = doencas.filter((d: any) =>
        d.nome?.toLowerCase().includes(filtroDoenca.toLowerCase()) ||
        d.codigo?.toLowerCase().includes(filtroDoenca.toLowerCase())
    );

    const alergiasFiltradas = alergias.filter((a: any) =>
        a.nome?.toLowerCase().includes(filtroAlergia.toLowerCase()) ||
        a.codigo?.toLowerCase().includes(filtroAlergia.toLowerCase())
    );

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 3, borderTop: "4px solid #1565c0" }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box display="flex" alignItems="center" gap={1.5}>
                        <LocalHospitalIcon sx={{ fontSize: 36, color: "#1565c0" }} />
                        <Box>
                            <Typography variant="h5" fontWeight={700} color="#1565c0">
                                Cadastro de Alergias e Doenças
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Plataforma UNATI — Diário da Saúde
                            </Typography>
                        </Box>
                    </Box>
                    <Button onClick={() => navigate(-1)}>Voltar</Button>
                </Box>
            </Paper>

            <Paper elevation={2} sx={{ borderRadius: 3 }}>
                <Tabs value={aba} onChange={(_, v) => setAba(v)} sx={{ borderBottom: "1px solid #e0e0e0", px: 2, pt: 1 }}>
                    <Tab label={
                        <Box display="flex" alignItems="center" gap={1}>
                            <CoronavirusIcon fontSize="small" />
                            Doenças
                            <Chip label={doencas.length} size="small" color="error" variant="outlined" />
                        </Box>
                    } />
                    <Tab label={
                        <Box display="flex" alignItems="center" gap={1}>
                            <WarningAmberIcon fontSize="small" />
                            Alergias
                            <Chip label={alergias.length} size="small" color="warning" variant="outlined" />
                        </Box>
                    } />
                </Tabs>

                <Box sx={{ p: 3 }}>

                    {/* ── ABA DOENÇAS ── */}
                    {aba === 0 && (
                        <Stack spacing={3}>
                            <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: "1px solid #e0e0e0", borderLeft: "4px solid #c62828" }}>
                                <Typography variant="h6" fontWeight={600} mb={2} display="flex" alignItems="center" gap={1}>
                                    <AddCircleIcon color="error" /> Nova Doença
                                </Typography>

                                {sucessoDoenca && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>Doença cadastrada com sucesso!</Alert>}
                                {erroDoenca && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setErroDoenca("")}>{erroDoenca}</Alert>}

                                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr 1fr" }, gap: 2 }}>
                                    <TextField label="Nome *" fullWidth value={doenca.nome}
                                        onChange={e => setDoenca(p => ({ ...p, nome: e.target.value }))} />
                                    <TextField label="Código *" fullWidth value={doenca.codigo}
                                        onChange={e => setDoenca(p => ({ ...p, codigo: e.target.value }))} />
                                    <TextField label="Nome Abreviado" fullWidth value={doenca.nomeAbreviado}
                                        onChange={e => setDoenca(p => ({ ...p, nomeAbreviado: e.target.value }))} />
                                    <TextField label="Categoria" fullWidth value={doenca.categoria}
                                        onChange={e => setDoenca(p => ({ ...p, categoria: e.target.value }))} />
                                    <TextField label="Restrição de Sexo" fullWidth value={doenca.restricaoSexo}
                                        onChange={e => setDoenca(p => ({ ...p, restricaoSexo: e.target.value }))} />
                                </Box>

                                <Button variant="contained" color="error" startIcon={<AddCircleIcon />}
                                    onClick={handleSalvarDoenca} disabled={criarDoencaMutation.isPending}
                                    sx={{ mt: 2, borderRadius: 2 }}>
                                    {criarDoencaMutation.isPending ? "Cadastrando..." : "Cadastrar Doença"}
                                </Button>
                            </Paper>

                            <Divider />

                            <Box>
                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                    <Typography variant="h6" fontWeight={600}>
                                        Doenças Cadastradas
                                        <Chip label={doencasFiltradas.length} size="small" color="error" variant="outlined" sx={{ ml: 1 }} />
                                    </Typography>
                                    <TextField size="small" placeholder="Buscar por nome ou código..."
                                        value={filtroDoenca} onChange={e => setFiltroDoenca(e.target.value)}
                                        InputProps={{ startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, color: "text.secondary" }} /> }}
                                        sx={{ width: 280 }} />
                                </Box>

                                {loadingDoencas ? (
                                    <Box display="flex" justifyContent="center" py={4}><CircularProgress /></Box>
                                ) : (
                                    <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #e0e0e0", borderRadius: 2 }}>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow sx={{ bgcolor: "#a21010" }}>
                                                    <TableCell sx={{ color: "#fff", fontWeight: 700 }}>Código</TableCell>
                                                    <TableCell sx={{ color: "#fff", fontWeight: 700 }}>Nome</TableCell>
                                                    <TableCell sx={{ color: "#fff", fontWeight: 700 }}>Nome Abreviado</TableCell>
                                                    <TableCell sx={{ color: "#fff", fontWeight: 700 }}>Categoria</TableCell>
                                                    <TableCell sx={{ color: "#fff", fontWeight: 700 }}>Restr. Sexo</TableCell>
                                                    <TableCell sx={{ color: "#fff", fontWeight: 700 }} align="center">Ação</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {doencasFiltradas.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={6} align="center" sx={{ py: 4, color: "text.secondary" }}>
                                                            {filtroDoenca ? "Nenhuma doença encontrada." : "Nenhuma doença cadastrada ainda."}
                                                        </TableCell>
                                                    </TableRow>
                                                ) : (
                                                    doencasFiltradas.slice(0, 50).map((d: any, i: number) => (
                                                        <TableRow key={d.id} sx={{ bgcolor: i % 2 === 0 ? "#fafafa" : "#fff" }}>
                                                            <TableCell><Chip label={d.codigo} size="small" color="error" variant="outlined" /></TableCell>
                                                            <TableCell>{d.nome}</TableCell>
                                                            <TableCell>{d.nomeAbreviado ?? "—"}</TableCell>
                                                            <TableCell>{d.categoria ?? "—"}</TableCell>
                                                            <TableCell>{d.restricaoSexo ?? "—"}</TableCell>
                                                            <TableCell align="center">
                                                                <IconButton size="small" color="error"
                                                                    onClick={() => setConfirmarDelete({ id: d.id, nome: d.nome, tipo: "doenca" })}>
                                                                    <DeleteIcon fontSize="small" />
                                                                </IconButton>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                )}
                                            </TableBody>
                                        </Table>
                                        {doencasFiltradas.length > 50 && (
                                            <Box sx={{ p: 1.5, textAlign: "center", bgcolor: "#f5f5f5" }}>
                                                <Typography variant="caption" color="text.secondary">
                                                    Exibindo 50 de {doencasFiltradas.length} resultados. Use a busca para filtrar.
                                                </Typography>
                                            </Box>
                                        )}
                                    </TableContainer>
                                )}
                            </Box>
                        </Stack>
                    )}

                    {/* ── ABA ALERGIAS ── */}
                    {aba === 1 && (
                        <Stack spacing={3}>
                            <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: "1px solid #e0e0e0", borderLeft: "4px solid #f57c00" }}>
                                <Typography variant="h6" fontWeight={600} mb={2} display="flex" alignItems="center" gap={1}>
                                    <AddCircleIcon sx={{ color: "#f57c00" }} /> Nova Alergia
                                </Typography>

                                {sucessoAlergia && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>Alergia cadastrada com sucesso!</Alert>}
                                {erroAlergia && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setErroAlergia("")}>{erroAlergia}</Alert>}

                                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr 1fr" }, gap: 2 }}>
                                    <TextField label="Nome *" fullWidth value={alergia.nome}
                                        onChange={e => setAlergia(p => ({ ...p, nome: e.target.value }))} />
                                    <TextField label="Código *" fullWidth value={alergia.codigo}
                                        onChange={e => setAlergia(p => ({ ...p, codigo: e.target.value }))} />
                                    <TextField label="Categoria" fullWidth value={alergia.categoria}
                                        onChange={e => setAlergia(p => ({ ...p, categoria: e.target.value }))} />
                                </Box>

                                <Button variant="contained" startIcon={<AddCircleIcon />}
                                    onClick={handleSalvarAlergia} disabled={criarAlergiaMutation.isPending}
                                    sx={{ mt: 2, borderRadius: 2, bgcolor: "#f57c00", "&:hover": { bgcolor: "#e65100" } }}>
                                    {criarAlergiaMutation.isPending ? "Cadastrando..." : "Cadastrar Alergia"}
                                </Button>
                            </Paper>

                            <Divider />

                            <Box>
                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                    <Typography variant="h6" fontWeight={600}>
                                        Alergias Cadastradas
                                        <Chip label={alergiasFiltradas.length} size="small" color="warning" variant="outlined" sx={{ ml: 1 }} />
                                    </Typography>
                                    <TextField size="small" placeholder="Buscar por nome ou código..."
                                        value={filtroAlergia} onChange={e => setFiltroAlergia(e.target.value)}
                                        InputProps={{ startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, color: "text.secondary" }} /> }}
                                        sx={{ width: 280 }} />
                                </Box>

                                {loadingAlergias ? (
                                    <Box display="flex" justifyContent="center" py={4}><CircularProgress /></Box>
                                ) : (
                                    <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #e0e0e0", borderRadius: 2 }}>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow sx={{ bgcolor: "#e65100" }}>
                                                    <TableCell sx={{ color: "#fff", fontWeight: 700 }}>Código</TableCell>
                                                    <TableCell sx={{ color: "#fff", fontWeight: 700 }}>Nome</TableCell>
                                                    <TableCell sx={{ color: "#fff", fontWeight: 700 }}>Categoria</TableCell>
                                                    <TableCell sx={{ color: "#fff", fontWeight: 700 }} align="center">Ação</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {alergiasFiltradas.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={4} align="center" sx={{ py: 4, color: "text.secondary" }}>
                                                            {filtroAlergia ? "Nenhuma alergia encontrada." : "Nenhuma alergia cadastrada ainda."}
                                                        </TableCell>
                                                    </TableRow>
                                                ) : (
                                                    alergiasFiltradas.slice(0, 50).map((a: any, i: number) => (
                                                        <TableRow key={a.id} sx={{ bgcolor: i % 2 === 0 ? "#fafafa" : "#fff" }}>
                                                            <TableCell><Chip label={a.codigo} size="small" sx={{ bgcolor: "#fff3e0", color: "#e65100", fontWeight: 600 }} /></TableCell>
                                                            <TableCell>{a.nome}</TableCell>
                                                            <TableCell>{a.categoria ?? "—"}</TableCell>
                                                            <TableCell align="center">
                                                                <IconButton size="small" color="error"
                                                                    onClick={() => setConfirmarDelete({ id: a.id, nome: a.nome, tipo: "alergia" })}>
                                                                    <DeleteIcon fontSize="small" />
                                                                </IconButton>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                )}
                                            </TableBody>
                                        </Table>
                                        {alergiasFiltradas.length > 50 && (
                                            <Box sx={{ p: 1.5, textAlign: "center", bgcolor: "#f5f5f5" }}>
                                                <Typography variant="caption" color="text.secondary">
                                                    Exibindo 50 de {alergiasFiltradas.length} resultados. Use a busca para filtrar.
                                                </Typography>
                                            </Box>
                                        )}
                                    </TableContainer>
                                )}
                            </Box>
                        </Stack>
                    )}
                </Box>
            </Paper>

            {/* Dialog de confirmação de delete */}
            <Dialog open={!!confirmarDelete} onClose={() => setConfirmarDelete(null)} maxWidth="xs" fullWidth>
                <DialogTitle>
                    <Box display="flex" alignItems="center" gap={1}>
                        <DeleteIcon color="error" />
                        Confirmar exclusão
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        Tem certeza que deseja excluir <strong>{confirmarDelete?.nome}</strong>?
                        Esta ação não pode ser desfeita.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setConfirmarDelete(null)}>Cancelar</Button>
                    <Button variant="contained" color="error" onClick={handleConfirmarDelete}
                        disabled={deletarDoencaMutation.isPending || deletarAlergiaMutation.isPending}>
                        {(deletarDoencaMutation.isPending || deletarAlergiaMutation.isPending) ? "Excluindo..." : "Excluir"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}