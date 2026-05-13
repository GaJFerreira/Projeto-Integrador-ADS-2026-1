import { useState } from "react";
import {
    Container, Paper, Typography, Button, Box,
    TextField, Chip, Divider, Stack, Alert, Tabs, Tab,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    IconButton, Tooltip, CircularProgress,
} from "@mui/material";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import CoronavirusIcon from "@mui/icons-material/Coronavirus";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import { useNavigate } from "react-router-dom";

export default function CadastroAlergiaDoencaPage() {
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    const [aba, setAba] = useState(0);

    // ── Estados Doenças ───────────────────────────────────────────────────────
    const [doenca, setDoenca] = useState({
        nome: "", codigo: "", categoria: "", nomeAbreviado: "",
        restricaoSexo: "", // ← causaObito removido
    });
    const [doencas, setDoencas] = useState<any[]>([]);
    const [loadingDoencas, setLoadingDoencas] = useState(false);
    const [salvandoDoenca, setSalvandoDoenca] = useState(false);
    const [filtroDoenca, setFiltroDoenca] = useState("");
    const [erroDoenca, setErroDoenca] = useState("");
    const [sucessoDoenca, setSucessoDoenca] = useState(false);

    // ── Estados Alergias ──────────────────────────────────────────────────────
    const [alergia, setAlergia] = useState({ nome: "", codigo: "", categoria: "" });
    const [alergias, setAlergias] = useState<any[]>([]);
    const [loadingAlergias, setLoadingAlergias] = useState(false);
    const [salvandoAlergia, setSalvandoAlergia] = useState(false);
    const [filtroAlergia, setFiltroAlergia] = useState("");
    const [erroAlergia, setErroAlergia] = useState("");
    const [sucessoAlergia, setSucessoAlergia] = useState(false);

    // ── Carregar listas ───────────────────────────────────────────────────────
    const carregarDoencas = async () => {
        setLoadingDoencas(true);
        fetch("http://localhost:8080/api/diario_saude/doencas/listar", {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(r => r.json())
            .then(data => setDoencas(Array.isArray(data) ? data : []))
            .catch(() => setErroDoenca("Erro ao carregar doenças."))
            .finally(() => setLoadingDoencas(false));
    };

    const carregarAlergias = async () => {
        setLoadingAlergias(true);
        fetch("http://localhost:8080/api/diario_saude/alergia/listar", {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(r => r.json())
            .then(data => setAlergias(Array.isArray(data) ? data : []))
            .catch(() => setErroAlergia("Erro ao carregar alergias."))
            .finally(() => setLoadingAlergias(false));
    };

    const handleAbaChange = (_: any, val: number) => {
        setAba(val);
        if (val === 0 && doencas.length === 0) carregarDoencas();
        if (val === 1 && alergias.length === 0) carregarAlergias();
    };

    useState(() => { carregarDoencas(); });

    // ── Salvar Doença ─────────────────────────────────────────────────────────
    const handleSalvarDoenca = async () => {
        if (!doenca.nome.trim()) return setErroDoenca("O nome da doença é obrigatório.");
        if (!doenca.codigo.trim()) return setErroDoenca("O código é obrigatório.");
        setErroDoenca("");
        setSalvandoDoenca(true);
        try {
            const resp = await fetch("http://localhost:8080/api/diario_saude/doencas/criar", {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify(doenca),
            });
            if (!resp.ok) throw new Error();
            setDoenca({ nome: "", codigo: "", categoria: "", nomeAbreviado: "", restricaoSexo: "" });
            setSucessoDoenca(true);
            setTimeout(() => setSucessoDoenca(false), 3000);
            carregarDoencas();
        } catch {
            setErroDoenca("Erro ao cadastrar doença. Verifique se o código já existe.");
        } finally {
            setSalvandoDoenca(false);
        }
    };

    // ── Salvar Alergia ────────────────────────────────────────────────────────
    const handleSalvarAlergia = async () => {
        if (!alergia.nome.trim()) return setErroAlergia("O nome da alergia é obrigatório.");
        if (!alergia.codigo.trim()) return setErroAlergia("O código é obrigatório.");
        setErroAlergia("");
        setSalvandoAlergia(true);
        try {
            const resp = await fetch("http://localhost:8080/api/diario_saude/alergia/criar", {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    code: alergia.codigo,
                    display: alergia.nome,
                    property: alergia.categoria
                        ? [{ code: "category", valueCode: alergia.categoria }]
                        : [],
                }),
            });
            if (!resp.ok) throw new Error();
            setAlergia({ nome: "", codigo: "", categoria: "" });
            setSucessoAlergia(true);
            setTimeout(() => setSucessoAlergia(false), 3000);
            carregarAlergias();
        } catch {
            setErroAlergia("Erro ao cadastrar alergia. Verifique se o código já existe.");
        } finally {
            setSalvandoAlergia(false);
        }
    };

    // ── Filtros ───────────────────────────────────────────────────────────────
    const doencasFiltradas = doencas.filter(d =>
        d.nome?.toLowerCase().includes(filtroDoenca.toLowerCase()) ||
        d.codigo?.toLowerCase().includes(filtroDoenca.toLowerCase()) ||
        d.categoria?.toLowerCase().includes(filtroDoenca.toLowerCase())
    );

    const alergiasFiltradas = alergias.filter(a =>
        a.nome?.toLowerCase().includes(filtroAlergia.toLowerCase()) ||
        a.codigo?.toLowerCase().includes(filtroAlergia.toLowerCase()) ||
        a.categoria?.toLowerCase().includes(filtroAlergia.toLowerCase())
    );

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>

            {/* Cabeçalho */}
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
                    <Button onClick={() => navigate(-1)} sx={{ textTransform: "none" }}>Voltar</Button>
                </Box>
            </Paper>

            {/* Abas */}
            <Paper elevation={2} sx={{ borderRadius: 3 }}>
                <Tabs value={aba} onChange={handleAbaChange} sx={{ borderBottom: "1px solid #e0e0e0", px: 2, pt: 1 }}>
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

                    {/* ── ABA DOENÇAS ──────────────────────────────────────────── */}
                    {aba === 0 && (
                        <Stack spacing={3}>
                            <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: "1px solid #e0e0e0", borderLeft: "4px solid #c62828" }}>
                                <Typography variant="h6" fontWeight={600} mb={2} display="flex" alignItems="center" gap={1}>
                                    <AddCircleIcon color="error" />
                                    Nova Doença
                                </Typography>

                                {sucessoDoenca && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>Doença cadastrada com sucesso!</Alert>}
                                {erroDoenca && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setErroDoenca("")}>{erroDoenca}</Alert>}

                                {/* ← grid de 4 colunas sem o campo Causa de Óbito */}
                                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr 1fr" }, gap: 2 }}>
                                    <TextField
                                        label="Nome *"
                                        fullWidth
                                        value={doenca.nome}
                                        onChange={e => setDoenca(p => ({ ...p, nome: e.target.value }))}
                                        placeholder="Ex: Diabetes Mellitus tipo 2"
                                    />
                                    <TextField
                                        label="Código *"
                                        fullWidth
                                        value={doenca.codigo}
                                        onChange={e => setDoenca(p => ({ ...p, codigo: e.target.value }))}
                                        placeholder="Ex: E11"
                                    />
                                    <TextField
                                        label="Nome Abreviado"
                                        fullWidth
                                        value={doenca.nomeAbreviado}
                                        onChange={e => setDoenca(p => ({ ...p, nomeAbreviado: e.target.value }))}
                                        placeholder="Ex: Diabetes tipo 2"
                                    />
                                    <TextField
                                        label="Categoria"
                                        fullWidth
                                        value={doenca.categoria}
                                        onChange={e => setDoenca(p => ({ ...p, categoria: e.target.value }))}
                                        placeholder="Ex: Endócrina"
                                    />
                                    <TextField
                                        label="Restrição de Sexo"
                                        fullWidth
                                        value={doenca.restricaoSexo}
                                        onChange={e => setDoenca(p => ({ ...p, restricaoSexo: e.target.value }))}
                                        placeholder="Ex: M / F / Ambos"
                                    />
                                </Box>

                                <Button
                                    variant="contained"
                                    color="error"
                                    startIcon={<AddCircleIcon />}
                                    onClick={handleSalvarDoenca}
                                    disabled={salvandoDoenca}
                                    sx={{ mt: 2, borderRadius: 2, textTransform: "none" }}
                                >
                                    {salvandoDoenca ? "Cadastrando..." : "Cadastrar Doença"}
                                </Button>
                            </Paper>

                            <Divider />

                            <Box>
                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                    <Typography variant="h6" fontWeight={600}>Doenças Cadastradas</Typography>
                                    <TextField
                                        size="small"
                                        placeholder="Buscar por nome ou código..."
                                        value={filtroDoenca}
                                        onChange={e => setFiltroDoenca(e.target.value)}
                                        InputProps={{ startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, color: "text.secondary" }} /> }}
                                        sx={{ width: 280 }}
                                    />
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
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {doencasFiltradas.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={5} align="center" sx={{ py: 4, color: "text.secondary" }}>
                                                            {filtroDoenca ? "Nenhuma doença encontrada para esta busca." : "Nenhuma doença cadastrada ainda."}
                                                        </TableCell>
                                                    </TableRow>
                                                ) : (
                                                    doencasFiltradas.slice(0, 50).map((d, i) => (
                                                        <TableRow key={d.id} sx={{ bgcolor: i % 2 === 0 ? "#fafafa" : "#fff" }}>
                                                            <TableCell><Chip label={d.codigo} size="small" color="error" variant="outlined" /></TableCell>
                                                            <TableCell>{d.nome}</TableCell>
                                                            <TableCell>{d.nomeAbreviado ?? "—"}</TableCell>
                                                            <TableCell>{d.categoria ?? "—"}</TableCell>
                                                            <TableCell>{d.restricaoSexo ?? "—"}</TableCell>
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

                    {/* ── ABA ALERGIAS ─────────────────────────────────────────── */}
                    {aba === 1 && (
                        <Stack spacing={3}>
                            <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: "1px solid #e0e0e0", borderLeft: "4px solid #f57c00" }}>
                                <Typography variant="h6" fontWeight={600} mb={2} display="flex" alignItems="center" gap={1}>
                                    <AddCircleIcon sx={{ color: "#f57c00" }} />
                                    Nova Alergia
                                </Typography>

                                {sucessoAlergia && <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>Alergia cadastrada com sucesso!</Alert>}
                                {erroAlergia && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setErroAlergia("")}>{erroAlergia}</Alert>}

                                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr 1fr" }, gap: 2 }}>
                                    <TextField
                                        label="Nome *"
                                        fullWidth
                                        value={alergia.nome}
                                        onChange={e => setAlergia(p => ({ ...p, nome: e.target.value }))}
                                        placeholder="Ex: Alergia a Penicilina"
                                    />
                                    <TextField
                                        label="Código *"
                                        fullWidth
                                        value={alergia.codigo}
                                        onChange={e => setAlergia(p => ({ ...p, codigo: e.target.value }))}
                                        placeholder="Ex: PEN-001"
                                    />
                                    <TextField
                                        label="Categoria"
                                        fullWidth
                                        value={alergia.categoria}
                                        onChange={e => setAlergia(p => ({ ...p, categoria: e.target.value }))}
                                        placeholder="Ex: Medicamento / Alimento"
                                    />
                                </Box>

                                <Button
                                    variant="contained"
                                    sx={{ mt: 2, borderRadius: 2, textTransform: "none", bgcolor: "#f57c00", "&:hover": { bgcolor: "#e65100" } }}
                                    startIcon={<AddCircleIcon />}
                                    onClick={handleSalvarAlergia}
                                    disabled={salvandoAlergia}
                                >
                                    {salvandoAlergia ? "Cadastrando..." : "Cadastrar Alergia"}
                                </Button>
                            </Paper>

                            <Divider />

                            <Box>
                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                    <Typography variant="h6" fontWeight={600}>Alergias Cadastradas</Typography>
                                    <TextField
                                        size="small"
                                        placeholder="Buscar por nome ou código..."
                                        value={filtroAlergia}
                                        onChange={e => setFiltroAlergia(e.target.value)}
                                        InputProps={{ startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, color: "text.secondary" }} /> }}
                                        sx={{ width: 280 }}
                                    />
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
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {alergiasFiltradas.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={3} align="center" sx={{ py: 4, color: "text.secondary" }}>
                                                            {filtroAlergia ? "Nenhuma alergia encontrada para esta busca." : "Nenhuma alergia cadastrada ainda."}
                                                        </TableCell>
                                                    </TableRow>
                                                ) : (
                                                    alergiasFiltradas.slice(0, 50).map((a, i) => (
                                                        <TableRow key={a.id} sx={{ bgcolor: i % 2 === 0 ? "#fafafa" : "#fff" }}>
                                                            <TableCell><Chip label={a.codigo} size="small" sx={{ bgcolor: "#fff3e0", color: "#e65100", fontWeight: 600 }} /></TableCell>
                                                            <TableCell>{a.nome}</TableCell>
                                                            <TableCell>{a.categoria ?? "—"}</TableCell>
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
        </Container>
    );
}