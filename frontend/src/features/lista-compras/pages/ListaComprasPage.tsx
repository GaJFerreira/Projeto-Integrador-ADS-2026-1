import { Box, Typography } from '@mui/material';
import { ModuleCard } from '@/components/ModuleCard';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ListAltIcon from '@mui/icons-material/ListAlt';
import { useNavigate } from 'react-router-dom';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import { isIdoso } from '../utils/userRole';


export default function ListaComprasPage() {
    const navigate = useNavigate();

    const allItems = [
        {
            icon: <AddCircleOutlineIcon sx={{ fontSize: 40 }} />,
            title: 'Criar nova lista',
            desc: 'Monte uma lista de compras com alertas automáticos para suas condições de saúde e sugestões de produtos alternativos.',
            to: '/lista-compras/nova',
        },
        {
            icon: <ListAltIcon sx={{ fontSize: 40 }} />,
            title: 'Minhas listas',
            desc: 'Acesse suas listas salvas, marque itens no modo compras e arquive compras concluídas.',
            to: '/lista-compras/listas',
        },
        {
            icon: <FileCopyIcon sx={{ fontSize: 40 }} />,
            title: 'Templates',
            desc: 'Gerencie modelos de listas pré-configurados para reutilizar em compras recorrentes ou dietas específicas.',
            to: '/lista-compras/templates',
        },
    ];

    const items = isIdoso() ? allItems.slice(0, 2) : allItems;

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
                Compre com Saúde
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Escolha uma opção para continuar.
            </Typography>

            {/* mesmo layout do seu ModuleGrid */}
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                        xs: '1fr',
                        sm: '1fr 1fr',
                        md: '1fr 1fr 1fr',
                    },
                    gap: 2,
                }}
            >
                {items.map((m) => (
                    <ModuleCard
                        key={m.title}
                        icon={m.icon}
                        title={m.title}
                        description={m.desc}
                        onClick={() => navigate(m.to)}
                    />
                ))}
            </Box>
        </Box>
    );
}
