import { useState, useEffect } from "react";
import {
    Container, Paper, Typography, Button, Box,
    TextField, Divider, Stack, CircularProgress, Alert,
} from "@mui/material";
import MonitorWeightIcon from "@mui/icons-material/MonitorWeight";
import StraightenIcon from "@mui/icons-material/Straighten";
import CakeIcon from "@mui/icons-material/Cake";
import SaveIcon from "@mui/icons-material/Save";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useNavigate, useLocation } from "react-router-dom";
import http from "@/lib/http";

export default function CuidadorDadosBiometricosPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const token = localStorage.getItem("token");
    const paciente = location.state?.paciente;

    const platformUserId = paciente?.platformUserId ?? paciente?.id_usuario;

    const [peso, setPeso] = useState<string>("");
    const [altura, setAltura] = useState<string>("");
    const [dataNascimento, setDataNascimento] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [sucesso, setSucesso] = useState(false);
    const [erro, setErro] = useState("");
    const [dadosUsuario, setDadosUsuario] = useState<any>(null);

    const headers = { Authorization: `Bearer ${token}` };

    useEffect(() => {
        if (!platformUserId) { navigate(-1); return; }

        http.get(`/api/diario_saude/usuario/por-user/${platformUserId}`, { headers })
            .then(({ data }) => {
                setDadosUsuario(data);
                setPeso(data.peso?.toString() ?? "");
                setAltura(data.altura?.toString() ?? "");
                if (data.dataNascimento) {
                    const d = data.dataNascimento;
                    if (Array.isArray(d)) {
                        const [ano, mes, dia] = d;
                        setDataNascimento(`${ano}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`);
                    } else {
                        const str = String(d);
                        if (str.includes("/")) {
                            // Formato brasileiro "dd/MM/yyyy" → converte para "yyyy-MM-dd"
                            const [dia, mes, ano] = str.split("/");
                            setDataNascimento(`${ano}-${mes.padStart(2, "0")}-${dia.padStart(2, "0")}`);
                        } else {
                            setDataNascimento(str.split("T")[0]);
                        }
                    }
                }
            })
            .catch(() => setErro("Erro ao carregar dados do paciente."))
            .finally(() => setLoading(false));
    }, [platformUserId]);

    const handleSalvar = async () => {
        const pesoNum = parseFloat(peso);
        const alturaNum = parseFloat(altura);

        if (!peso || isNaN(pesoNum) || pesoNum <= 0 || pesoNum > 300)
            return setErro("Informe um peso válido.");
        if (!altura || isNaN(alturaNum) || alturaNum <= 0 || alturaNum > 250)
            return setErro("Informe uma altura válida.");
        if (!dataNascimento)
            return setErro("Informe a data de nascimento.");
        if (!dadosUsuario) return;

        setErro("");
        setSalvando(true);

        try {
            await http.put(
                `/api/diario_saude/usuario`,
                {
                    ...dadosUsuario,
                    id_usuario: dadosUsuario.id_usuario,
                    peso: pesoNum,
                    altura: alturaNum,
                    dataNascimento,
                },
                { headers }
            );
            setSucesso(true);
            setTimeout(() => setSucesso(false), 3000);
        } catch {
            setErro("Erro ao salvar. Tente novamente.");
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

    return (
        <Container maxWidth="sm" sx={{ py: 4 }}>
            <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 3, border: "1px solid #e8eaf6", borderTop: "4px solid #1565c0" }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box display="flex" alignItems="center" gap={1.5}>
                        <MonitorWeightIcon sx={{ fontSize: 32, color: "#1565c0" }} />
                        <Box>
                            <Typography variant="h5" fontWeight={700} color="#1565c0">DADOS BIOMÉTRICOS</Typography>
                            <Typography variant="caption" color="text.secondary">{paciente?.nome}</Typography>
                        </Box>
                    </Box>
                    <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} size="small">Voltar</Button>
                </Box>
            </Paper>

            <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: "1px solid #e8eaf6" }}>
                {loading ? (
                    <Box display="flex" justifyContent="center" py={4}><CircularProgress /></Box>
                ) : (
                    <Stack spacing={3}>
                        {sucesso && <Alert severity="success" sx={{ borderRadius: 2 }}>Dados atualizados com sucesso!</Alert>}
                        {erro && <Alert severity="error" sx={{ borderRadius: 2 }} onClose={() => setErro("")}>{erro}</Alert>}

                        <Box>
                            <Box display="flex" alignItems="center" gap={1} mb={1}>
                                <CakeIcon color="primary" fontSize="small" />
                                <Typography fontWeight={600}>Data de Nascimento</Typography>
                            </Box>
                            <TextField
                                fullWidth label="Data de Nascimento *" type="date"
                                value={dataNascimento} onChange={e => setDataNascimento(e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                inputProps={{ max: new Date().toISOString().split("T")[0] }}
                                helperText={idadeCalculada !== null ? `${idadeCalculada} anos` : ""}
                            />
                        </Box>

                        <Box>
                            <Box display="flex" alignItems="center" gap={1} mb={1}>
                                <MonitorWeightIcon color="primary" fontSize="small" />
                                <Typography fontWeight={600}>Peso</Typography>
                            </Box>
                            <TextField
                                fullWidth label="Peso (kg) *" type="number"
                                value={peso} onChange={e => setPeso(e.target.value)}
                                inputProps={{ min: 1, max: 300, step: 0.1 }}
                            />
                        </Box>

                        <Box>
                            <Box display="flex" alignItems="center" gap={1} mb={1}>
                                <StraightenIcon color="primary" fontSize="small" />
                                <Typography fontWeight={600}>Altura</Typography>
                            </Box>
                            <TextField
                                fullWidth label="Altura (cm) *" type="number"
                                value={altura} onChange={e => setAltura(e.target.value)}
                                inputProps={{ min: 1, max: 250, step: 1 }}
                            />
                        </Box>

                        {imc && (
                            <>
                                <Divider />
                                <Box sx={{ p: 2.5, borderRadius: 2, bgcolor: "#f0f4ff", border: "1px solid #c5cae9", textAlign: "center" }}>
                                    <Typography variant="caption" color="text.secondary">IMC calculado</Typography>
                                    <Typography variant="h4" fontWeight={700} color="#1565c0">{imc}</Typography>
                                </Box>
                            </>
                        )}

                        <Button
                            variant="contained" size="large"
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