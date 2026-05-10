import { useState, useEffect } from "react";
import {
    Box, Paper, Typography, Button, Container, Avatar, Chip,
} from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { ModuleGridMedico } from "@/features/diario_saude/components/ModuleGridMedico";
import { questionarioApi } from "../api/questionarioApi";
import { usuarioApi } from "../api/usuarioApi";

export default function DashboardMedico() {
    const location = useLocation();
    const navigate = useNavigate();

    const paciente = location.state?.paciente;
    const prescricao = location.state?.prescricao;

    const [pontuacao, setPontuacao] = useState<number | null>(null);
    const [dadosClinicos, setDadosClinicos] = useState<any>(null);
    const [ultimaAtualizacao, setUltimaAtualizacao] = useState("");

    useEffect(() => {
        if (!paciente || !prescricao) navigate("/medico");
    }, [paciente, prescricao, navigate]);

    useEffect(() => {
        setUltimaAtualizacao(new Date().toLocaleDateString("pt-BR"));
    }, []);

    useEffect(() => {
        if (!paciente) return;
        const id = paciente.id_usuario ?? paciente.id;
        usuarioApi.porUsuarioId(id)
            .then(setDadosClinicos)
            .catch(() => setDadosClinicos(null));
    }, [paciente?.id_usuario ?? paciente?.id]);

    useEffect(() => {
        if (!paciente) return;
        const id = paciente.id_usuario ?? paciente.id;
        questionarioApi.obterRespostas(id).then((respostas) => {
            const total = respostas.reduce((acc: number, r: any) => acc + r.peso, 0);
            setPontuacao(total);
        });
    }, [paciente?.id_usuario ?? paciente?.id]);

    if (!paciente || !prescricao) return null;

    const getStatus = () => {
        if (pontuacao === null) return { label: "—", color: "default" as const };
        if (pontuacao <= 6) return { label: "Estável", color: "success" as const };
        if (pontuacao <= 10) return { label: "Atenção", color: "warning" as const };
        return { label: "Crítico", color: "error" as const };
    };

    const status = getStatus();

    const dados = dadosClinicos ?? paciente;
    const dadosFormatados = [
        dados?.idade && `${dados.idade} anos`,
        dados?.peso && `${dados.peso} kg`,
        dados?.altura && `${dados.altura} m`,
    ].filter(Boolean).join(" • ") || "Dados clínicos não informados";

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

                <Button
                    variant="outlined"
                    size="small"
                    onClick={() => navigate("/atendimento/historico-medico", { state: { paciente, prescricao } })}
                >
                    Ver Histórico
                </Button>
            </Paper>

            {/* Cards de funcionalidades */}
            <Paper elevation={2} sx={{ p: 4, borderRadius: 3 }}>
                <Typography variant="h5" fontWeight="bold" mb={3} textAlign="center">
                    Funcionalidades do Sistema
                </Typography>
                <ModuleGridMedico paciente={paciente} prescricao={prescricao} />
            </Paper>
        </Container>
    );
}