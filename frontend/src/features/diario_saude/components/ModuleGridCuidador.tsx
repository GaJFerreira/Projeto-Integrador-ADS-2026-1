import { Box, Paper, Typography } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useNavigate } from 'react-router-dom';

const items = [
    {
        icon: <PeopleIcon sx={{ fontSize: 28 }} />,
        title: 'Meus Pacientes',
        desc: 'Ver e gerenciar seus pacientes vinculados.',
        path: '/cuidador/pacientes',
        color: "#1565c0",
        bgcolor: "#e3f2fd",
    },
];

export function ModuleGridCuidador() {
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