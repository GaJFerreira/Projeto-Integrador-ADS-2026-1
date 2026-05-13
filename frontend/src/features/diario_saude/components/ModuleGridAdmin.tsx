import { Box } from '@mui/material';
import { ModuleCard } from '../../../components/ModuleCard';
import SettingsIcon from '@mui/icons-material/Settings';
import { useNavigate } from 'react-router-dom';

export function ModuleGridAdmin() {
    const navigate = useNavigate();

    const items = [
        {
            icon: <SettingsIcon sx={{ fontSize: 40 }} color="warning" />,
            title: 'Gerenciar Questionário',
            desc: 'Adicionar, editar ou excluir perguntas.',
            onClick: () => navigate('/admin/questionario'),
        },
        {
            icon: <SettingsIcon sx={{ fontSize: 40 }} color="warning" />,
            title: 'Cadastro de Alergias e Doenças',
            desc: 'Cadastro de alergias e doenças.',
            onClick: () => navigate('/admin/cadastro-alergia-doenca'),
        },
    ];

    return (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mt: 2 }}>
            {items.map((m) => (
                <ModuleCard key={m.title} icon={m.icon} title={m.title} description={m.desc} onClick={m.onClick} />
            ))}
        </Box>
    );
}