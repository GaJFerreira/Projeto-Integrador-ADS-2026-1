import { Box } from '@mui/material';
import { ModuleCard } from '../../../components/ModuleCard';
import HistoryIcon from '@mui/icons-material/History';
import CoronavirusIcon from '@mui/icons-material/Coronavirus';
import MonitorWeightIcon from '@mui/icons-material/MonitorWeight';
import QuizIcon from '@mui/icons-material/Quiz';
import { useNavigate } from 'react-router-dom';

export function ModuleGridIdoso() {
    const navigate = useNavigate();

    const paciente = (() => {
        try {
            return JSON.parse(localStorage.getItem("usuario") || "null") ||
                JSON.parse(localStorage.getItem("user") || "null");
        } catch { return null; }
    })();

    const items = [
        {
            icon: <HistoryIcon sx={{ fontSize: 40 }} color="primary" />,
            title: 'Histórico de Consultas',
            desc: 'Veja consultas anteriores.',
            onClick: () => navigate('/historico_consultas'),
        },
        {
            icon: <CoronavirusIcon sx={{ fontSize: 40 }} color="error" />,
            title: 'Informações de Saúde',
            desc: 'Doenças cadastradas do paciente.',
            onClick: () => navigate('/informacoes_saude'),
        },
        {
            icon: <QuizIcon sx={{ fontSize: 40 }} color="success" />,
            title: 'Questionário de Saúde',
            desc: 'Responda o questionário de avaliação.',
            onClick: () => navigate('/questionario_saude'),
        },
        {
            icon: <MonitorWeightIcon sx={{ fontSize: 40 }} color="primary" />,
            title: 'Dados Biométricos',
            desc: 'Atualize seu peso e altura.',
            onClick: () => navigate('/dados_biometricos'),
        }

    ];

    return (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mt: 2 }}>
            {items.map((m) => (
                <ModuleCard key={m.title} icon={m.icon} title={m.title} description={m.desc} onClick={m.onClick} />
            ))}
        </Box>
    );
}