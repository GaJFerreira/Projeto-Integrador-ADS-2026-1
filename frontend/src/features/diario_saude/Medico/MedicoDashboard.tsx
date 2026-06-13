import { useState, useEffect } from "react";
import {
    Box, Paper, Typography, Button, Container, Avatar, Chip,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { ModuleGridMedico } from "@/features/diario_saude/components/ModuleGridMedico";
import { questionarioApi } from "../api/questionarioApi";
import http from "@/lib/http";

function calcularIdade(dataNascimento: any): number | null {
    if (!dataNascimento) return null;
    try {
        let nasc: Date;
        if (Array.isArray(dataNascimento)) {
            const [ano, mes, dia] = dataNascimento;
            nasc = new Date(ano, mes - 1, dia);
        } else {
            nasc = new Date(dataNascimento);
        }
        const hoje = new Date();
        let idade = hoje.getFullYear() - nasc.getFullYear();
        const m = hoje.getMonth() - nasc.getMonth();
        if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;
        return isNaN(idade) ? null : idade;
    } catch { return null; }
}

export default function DashboardMedico() {
    const location = useLocation();
    const navigate = useNavigate();

    const paciente = location.state?.paciente;
    const prescricao = location.state?.prescricao;

    const [pontuacao, setPontuacao] = useState<number | null>(null);
    const [dadosClinicos, setDadosClinicos] = useState<any>(null);
    const [ultimaAtualizacao, setUltimaAtualizacao] = useState("");

    const token = localStorage.getItem("token");

    useEffect(() => {
        if (!paciente || !prescricao) navigate("/medico");
    }, [paciente, prescricao, navigate]);

    useEffect(() => {
        setUltimaAtualizacao(new Date().toLocaleDateString("pt-BR"));
    }, []);

    useEffect(() => {
        if (!paciente) return;
        const idInterno = paciente.id_usuario ?? paciente.id;
        if (!idInterno) return;
        http.get(`/api/diario_saude/usuario/${idInterno}`, {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then(({ data }) => setDadosClinicos(data))
            .catch(() => setDadosClinicos(null));
    }, [paciente?.id_usuario]);

    useEffect(() => {
        if (!paciente) return;
        const id = paciente.platformUserId ?? paciente.id_usuario ?? paciente.id;
        if (!id) return;
        questionarioApi.obterRespostas(id).then((respostas) => {
            const total = respostas.reduce((acc: number, r: any) => acc + r.peso, 0);
            setPontuacao(total);
        });
    }, [paciente?.id_usuario]);

    if (!paciente || !prescricao) return null;

    const getStatus = () => {
        if (pontuacao === null) return { label: "—", color: "default" as const };
        if (pontuacao <= 6) return { label: "Robusto", color: "success" as const };
        if (pontuacao <= 14) return { label: "Em risco", color: "warning" as const };
        if (pontuacao <= 20) return { label: "Moderadamente frágil", color: "error" as const };
        return { label: "Frágil", color: "error" as const };
    };

    const status = getStatus();
    const dados = dadosClinicos ?? paciente;

    const idadeCalculada = calcularIdade(dados?.dataNascimento) ?? dados?.idade;
    const idadeStr = idadeCalculada != null && idadeCalculada > 0 ? `${idadeCalculada} anos` : null;
    const pesoStr = dados?.peso != null && dados.peso > 0 ? `${dados.peso} kg` : null;
    const alturaStr = dados?.altura != null && dados.altura > 0 ? `${dados.altura} cm` : null;
    const dadosFormatados = [idadeStr, pesoStr, alturaStr].filter(Boolean).join(" • ")
        || "Dados clínicos não informados";

    return (
        <Container maxWidth="lg" sx={{ py: 5 }}>

            {/* Header do paciente */}
            <Paper
                elevation={2}
                sx={{
                    mb: 4, p: 3, borderRadius: 3,
                    borderLeft: "4px solid #1565c0",
                    display: "flex", justifyContent: "space-between",
                    alignItems: "center", flexWrap: "wrap", gap: 2,
                }}
            >
                <Box display="flex" alignItems="center" gap={2}>
                    <Avatar sx={{ width: 56, height: 56, bgcolor: "#1565c0", fontSize: "1.4rem" }}>
                        {(paciente.nome ?? paciente.name)?.charAt(0)}
                    </Avatar>
                    <Box>
                        <Typography variant="h6" fontWeight={700}>
                            {paciente.nome ?? paciente.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {dadosFormatados}
                        </Typography>
                        <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                            <Chip
                                label={status.label}
                                color={status.color}
                                size="small"
                            />
                            <Typography variant="caption" color="text.secondary">
                                Atualizado em: {ultimaAtualizacao}
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </Paper>

            {/* Cards de funcionalidades */}
            <Paper elevation={2} sx={{ p: 4, borderRadius: 3 }}>
                <Typography variant="h5" fontWeight="bold" mb={3} textAlign="center">
                    Painel de Atendimento
                </Typography>
                <ModuleGridMedico paciente={paciente} prescricao={prescricao} />
            </Paper>
        </Container>
    );
}