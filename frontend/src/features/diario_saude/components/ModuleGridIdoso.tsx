import { Box, Paper, Typography } from '@mui/material';
import MonitorWeightIcon from '@mui/icons-material/MonitorWeight';
import CoronavirusIcon from '@mui/icons-material/Coronavirus';
import QuizIcon from '@mui/icons-material/Quiz';
import MedicalInformationIcon from '@mui/icons-material/MedicalInformation';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useNavigate } from 'react-router-dom';

const items = [
    {
        icon: <MonitorWeightIcon sx={{ fontSize: 28 }} />,
        title: 'Dados Biométricos',
        desc: 'Atualize seu peso e altura.',
        path: '/dados_biometricos',
        color: "#1565c0",
        bgcolor: "#e3f2fd",
    },
    {
        icon: <MedicalInformationIcon sx={{ fontSize: 28 }} />,
        title: 'Meu Prontuário',
        desc: 'Visualize seu histórico de saúde.',
        path: '/informacoes_saude',
        color: "#6a1b9a",
        bgcolor: "#f3e5f5",
    },

    {
        icon: <QuizIcon sx={{ fontSize: 28 }} />,
        title: 'Questionário de Saúde',
        desc: 'Responda o questionário de avaliação.',
        path: '/questionario_saude',
        color: "#2e7d32",
        bgcolor: "#e8f5e9",
    },
];

export function ModuleGridIdoso() {
    const navigate = useNavigate();

    return (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            {items.map((m) => (
                <Paper
                    key={m.title}
                    elevation={0}
                    onClick={() => navigate(m.path)}
                    sx={{
                        p: 2.5, borderRadius: 3,
                        border: "1px solid #e8eaf6",
                        cursor: "pointer",
                        display: "flex", alignItems: "center", gap: 2,
                        transition: "all 0.15s ease",
                        "&:hover": {
                            borderColor: m.color,
                            bgcolor: m.bgcolor + "60",
                            transform: "translateY(-1px)",
                        },
                    }}
                >
                    <Box sx={{
                        width: 48, height: 48, borderRadius: 2.5,
                        bgcolor: m.bgcolor,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: m.color, flexShrink: 0,
                    }}>
                        {m.icon}
                    </Box>
                    <Box flex={1} minWidth={0}>
                        <Typography fontWeight={600} fontSize="0.95rem" noWrap>{m.title}</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.3 }}>
                            {m.desc}
                        </Typography>
                    </Box>
                    <ChevronRightIcon sx={{ color: "#bdbdbd", flexShrink: 0 }} />
                </Paper>
            ))}
        </Box>
    );
}