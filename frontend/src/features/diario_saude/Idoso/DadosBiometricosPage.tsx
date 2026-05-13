import { useState, useEffect } from "react";
import {
    Container, Paper, Typography, Button, Box,
    TextField, Divider, Stack, CircularProgress, Alert,
} from "@mui/material";
import MonitorWeightIcon from "@mui/icons-material/MonitorWeight";
import StraightenIcon from "@mui/icons-material/Straighten";
import SaveIcon from "@mui/icons-material/Save";
import { useNavigate } from "react-router-dom";

export default function DadosBiometricosPage() {
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    const usuarioLogado = (() => {
        try {
            return JSON.parse(localStorage.getItem("usuario") || "null") ||
                JSON.parse(localStorage.getItem("user") || "null");
        } catch { return null; }
    })();

    const usuarioId = usuarioLogado?.id_usuario ?? usuarioLogado?.userId;

    const userId = usuarioLogado?.userId ?? usuarioLogado?.id;

    const [peso, setPeso] = useState<string>("");
    const [altura, setAltura] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [sucesso, setSucesso] = useState(false);
    const [erro, setErro] = useState("");

    const [dadosUsuario, setDadosUsuario] = useState<any>(null);

    useEffect(() => {
        const idParaBusca = userId ?? usuarioId;

        if (!idParaBusca) {
            setErro("Usuário não encontrado. Faça login novamente.");
            setLoading(false);
            return;
        }

        const url = userId
            ? `http://localhost:8080/api/diario_saude/usuario/por-user/${userId}`
            : `http://localhost:8080/api/diario_saude/usuario/${usuarioId}`;

        fetch(url, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(async r => {
                if (!r.ok) throw new Error();
                return r.json();
            })
            .then(data => {
                console.log("DADOS DO USUARIO:", JSON.stringify(data));
                setDadosUsuario(data);
                setPeso(data.peso?.toString() ?? "");
                setAltura(data.altura?.toString() ?? "");
            })
            .catch(() => setErro("Erro ao carregar dados. Tente novamente."))
            .finally(() => setLoading(false));
    }, [userId, usuarioId]);

    const handleSalvar = async () => {
        const pesoNum = parseFloat(peso);
        const alturaNum = parseFloat(altura);

        if (!peso || isNaN(pesoNum) || pesoNum <= 0 || pesoNum > 300)
            return setErro("Informe um peso válido (entre 1 e 300 kg).");
        if (!altura || isNaN(alturaNum) || alturaNum <= 0 || alturaNum > 250)
            return setErro("Informe uma altura válida (entre 1 e 250 cm).");
        if (!dadosUsuario)
            return setErro("Dados do usuário não carregados. Recarregue a página.");

        setErro("");
        setSalvando(true);

        try {
            const idAtual = dadosUsuario.id_usuario ?? null;

            if (!idAtual) {
                setErro("Não foi possível identificar o registro. Recarregue a página.");
                return;
            }

            const putResp = await fetch(
                `http://localhost:8080/api/diario_saude/usuario`,
                {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        ...dadosUsuario,       // já tem userId correto vindo do backend
                        id_usuario: idAtual,
                        peso: pesoNum,
                        altura: alturaNum,
                    }),
                }
            );
            if (!putResp.ok) throw new Error("Erro ao salvar.");

            // ✅ atualiza o estado local com os novos valores sem precisar recarregar
            setDadosUsuario((prev: any) => ({ ...prev, peso: pesoNum, altura: alturaNum }));
            setSucesso(true);
            setTimeout(() => setSucesso(false), 3000);
        } catch (e: any) {
            setErro(e.message ?? "Erro ao salvar. Tente novamente.");
        } finally {
            setSalvando(false);
        }
    };

    const imc = (() => {
        const p = parseFloat(peso);
        const a = parseFloat(altura) / 100;
        if (!p || !a || a <= 0) return null;
        return (p / (a * a)).toFixed(1);
    })();

    const classificacaoImc = (valor: number) => {
        if (valor < 18.5) return { label: "Abaixo do peso", color: "#1565c0" };
        if (valor < 25) return { label: "Peso normal", color: "#2e7d32" };
        if (valor < 30) return { label: "Sobrepeso", color: "#f57c00" };
        return { label: "Obesidade", color: "#c62828" };
    };

    return (
        <Container maxWidth="sm" sx={{ py: 4 }}>

            <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 3, borderTop: "4px solid #1565c0" }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box display="flex" alignItems="center" gap={1.5}>
                        <MonitorWeightIcon sx={{ fontSize: 36, color: "#1565c0" }} />
                        <Box>
                            <Typography variant="h5" fontWeight={700} color="#1565c0">
                                Dados Biométricos
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
                {loading ? (
                    <Box display="flex" justifyContent="center" py={4}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <Stack spacing={3}>

                        {sucesso && (
                            <Alert severity="success" sx={{ borderRadius: 2 }}>
                                Dados atualizados com sucesso!
                            </Alert>
                        )}
                        {erro && (
                            <Alert severity="error" sx={{ borderRadius: 2 }} onClose={() => setErro("")}>
                                {erro}
                            </Alert>
                        )}

                        <Box>
                            <Box display="flex" alignItems="center" gap={1} mb={1}>
                                <MonitorWeightIcon color="primary" fontSize="small" />
                                <Typography fontWeight={600}>Peso</Typography>
                            </Box>
                            <TextField
                                fullWidth
                                label="Peso (kg)"
                                type="number"
                                value={peso}
                                onChange={e => setPeso(e.target.value)}
                                inputProps={{ min: 1, max: 300, step: 0.1 }}
                                placeholder="Ex: 70.5"
                            />
                        </Box>

                        <Box>
                            <Box display="flex" alignItems="center" gap={1} mb={1}>
                                <StraightenIcon color="primary" fontSize="small" />
                                <Typography fontWeight={600}>Altura</Typography>
                            </Box>
                            <TextField
                                fullWidth
                                label="Altura (cm)"
                                type="number"
                                value={altura}
                                onChange={e => setAltura(e.target.value)}
                                inputProps={{ min: 1, max: 250, step: 1 }}
                                placeholder="Ex: 165"
                            />
                        </Box>

                        {imc && (
                            <>
                                <Divider />
                                <Box sx={{
                                    p: 2.5, borderRadius: 2,
                                    bgcolor: "#f0f4ff",
                                    border: "1px solid #c5cae9",
                                    textAlign: "center",
                                }}>
                                    <Typography variant="caption" color="text.secondary">
                                        IMC calculado
                                    </Typography>
                                    <Typography variant="h4" fontWeight={700} color="#1565c0">
                                        {imc}
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        fontWeight={600}
                                        sx={{ color: classificacaoImc(parseFloat(imc)).color }}
                                    >
                                        {classificacaoImc(parseFloat(imc)).label}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
                                        Este valor é apenas informativo. Consulte seu médico.
                                    </Typography>
                                </Box>
                            </>
                        )}

                        <Button
                            variant="contained"
                            size="large"
                            startIcon={<SaveIcon />}
                            onClick={handleSalvar}
                            disabled={salvando || !dadosUsuario}
                            sx={{ borderRadius: 2, py: 1.5 }}
                        >
                            {salvando ? "Salvando..." : "Salvar Alterações"}
                        </Button>

                    </Stack>
                )}
            </Paper>
        </Container>
    );
}