import { useState, useEffect } from "react";
import {
    Container, Paper, Typography, Button, Box,
    TextField, Divider, Stack, CircularProgress, Alert,
} from "@mui/material";
import MonitorWeightIcon from "@mui/icons-material/MonitorWeight";
import StraightenIcon from "@mui/icons-material/Straighten";
import CakeIcon from "@mui/icons-material/Cake";
import SaveIcon from "@mui/icons-material/Save";
import { useNavigate } from "react-router-dom";
import http from "@/lib/http";

function parseDateToInput(dataNascimento: any): string {
    if (!dataNascimento) return "";
    try {
        // Array [ano, mes, dia] — formato do Spring/Jackson
        if (Array.isArray(dataNascimento)) {
            const [ano, mes, dia] = dataNascimento;
            return `${ano}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
        }
        const str = dataNascimento.toString();
        // Formato brasileiro "dd/MM/yyyy"
        if (str.includes("/")) {
            const [dia, mes, ano] = str.split("/");
            return `${ano}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
        }
        // String ISO "2000-05-15T00:00:00" ou "2000-05-15"
        return str.includes("T") ? str.split("T")[0] : str;
    } catch {
        return "";
    }
}

export default function DadosBiometricosPage() {
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    const usuarioLogado = (() => {
        try {
            return JSON.parse(localStorage.getItem("usuario") || "null") ||
                JSON.parse(localStorage.getItem("user") || "null");
        } catch { return null; }
    })();

    const userId = usuarioLogado?.userId ?? usuarioLogado?.id;

    const [peso, setPeso] = useState<string>("");
    const [altura, setAltura] = useState<string>("");
    const [dataNascimento, setDataNascimento] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [sucesso, setSucesso] = useState(false);
    const [erro, setErro] = useState("");
    const [dadosUsuario, setDadosUsuario] = useState<any>(null);

    useEffect(() => {
        if (!userId) {
            setErro("Usuário não encontrado. Faça login novamente.");
            setLoading(false);
            return;
        }

        const nomeReal = usuarioLogado?.username ?? usuarioLogado?.name ?? "";

        http.get(`/api/diario_saude/usuario/por-user/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
            params: nomeReal ? { nome: nomeReal } : undefined,
        })
            .then(({ data }) => {
                setDadosUsuario(data);
                setPeso(data.peso > 0 ? data.peso.toString() : "");
                setAltura(data.altura > 0 ? data.altura.toString() : "");
                setDataNascimento(parseDateToInput(data.dataNascimento));
            })
            .catch(() => setErro("Erro ao carregar dados. Tente novamente."))
            .finally(() => setLoading(false));
    }, [userId]);

    const handleSalvar = async () => {
        const pesoNum = parseFloat(peso);
        const alturaNum = parseFloat(altura);

        if (!peso || isNaN(pesoNum) || pesoNum <= 0 || pesoNum > 300)
            return setErro("Informe um peso válido (entre 1 e 300 kg).");
        if (!altura || isNaN(alturaNum) || alturaNum <= 0 || alturaNum > 250)
            return setErro("Informe uma altura válida (entre 1 e 250 cm).");
        if (!dataNascimento)
            return setErro("Informe a data de nascimento.");
        if (!dadosUsuario)
            return setErro("Dados do usuário não carregados. Recarregue a página.");

        setErro("");
        setSalvando(true);

        try {
            const { data } = await http.put(
                `/api/diario_saude/usuario`,
                {
                    ...dadosUsuario,
                    id_usuario: dadosUsuario.id_usuario,
                    peso: pesoNum,
                    altura: alturaNum,
                    dataNascimento,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setDadosUsuario(data);
            setPeso(data.peso > 0 ? data.peso.toString() : pesoNum.toString());
            setAltura(data.altura > 0 ? data.altura.toString() : alturaNum.toString());
            setDataNascimento(parseDateToInput(data.dataNascimento));
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

    const idadeCalculada = (() => {
        if (!dataNascimento) return null;
        const hoje = new Date();
        const nasc = new Date(dataNascimento);
        let idade = hoje.getFullYear() - nasc.getFullYear();
        const m = hoje.getMonth() - nasc.getMonth();
        if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;
        return idade;
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
                    <Button onClick={() => navigate(-1)}>Voltar</Button>
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

                        {/* Data de Nascimento */}
                        <Box>
                            <Box display="flex" alignItems="center" gap={1} mb={1}>
                                <CakeIcon color="primary" fontSize="small" />
                                <Typography fontWeight={600}>Data de Nascimento</Typography>
                            </Box>
                            <TextField
                                fullWidth
                                label="Data de Nascimento *"
                                type="date"
                                value={dataNascimento}
                                onChange={e => setDataNascimento(e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                inputProps={{ max: new Date().toISOString().split("T")[0] }}
                                helperText={idadeCalculada !== null ? `${idadeCalculada} anos` : ""}
                            />
                        </Box>

                        {/* Peso */}
                        <Box>
                            <Box display="flex" alignItems="center" gap={1} mb={1}>
                                <MonitorWeightIcon color="primary" fontSize="small" />
                                <Typography fontWeight={600}>Peso</Typography>
                            </Box>
                            <TextField
                                fullWidth
                                label="Peso (kg) *"
                                type="number"
                                value={peso}
                                onChange={e => setPeso(e.target.value)}
                                inputProps={{ min: 1, max: 300, step: 0.1 }}
                                placeholder="Ex: 70.5"
                            />
                        </Box>

                        {/* Altura */}
                        <Box>
                            <Box display="flex" alignItems="center" gap={1} mb={1}>
                                <StraightenIcon color="primary" fontSize="small" />
                                <Typography fontWeight={600}>Altura</Typography>
                            </Box>
                            <TextField
                                fullWidth
                                label="Altura (cm) *"
                                type="number"
                                value={altura}
                                onChange={e => setAltura(e.target.value)}
                                inputProps={{ min: 1, max: 250, step: 1 }}
                                placeholder="Ex: 165"
                            />
                        </Box>

                        {/* IMC */}
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