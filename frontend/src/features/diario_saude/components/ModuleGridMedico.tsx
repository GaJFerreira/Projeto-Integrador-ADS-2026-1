import { Box, Paper, Typography } from '@mui/material';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import ScienceIcon from '@mui/icons-material/Science';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import MedicationIcon from '@mui/icons-material/Medication';
import BiotechIcon from '@mui/icons-material/Biotech';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import QuizIcon from '@mui/icons-material/Quiz';
import MedicalInformationIcon from '@mui/icons-material/MedicalInformation';
import CoronavirusIcon from '@mui/icons-material/Coronavirus';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useNavigate } from 'react-router-dom';

type Paciente = {
  id_usuario: number;
  nome: string;
  idade: number;
  peso: number;
  altura: number;
  alergias?: string;
};

const getItems = (paciente: Paciente, prescricao: any) => [
  {
    icon: <MedicationIcon sx={{ fontSize: 26 }} />,
    title: 'Receituário',
    desc: 'Prescrever medicamentos.',
    color: "#c62828", bgcolor: "#ffebee",
    path: '/atendimento/receituario', state: { paciente, prescricao },
  },
  {
    icon: <ScienceIcon sx={{ fontSize: 26 }} />,
    title: 'Pedir Exames',
    desc: 'Solicitar exames laboratoriais.',
    color: "#1565c0", bgcolor: "#e3f2fd",
    path: '/atendimento/exames', state: { paciente, prescricao },
  },
  {
    icon: <BiotechIcon sx={{ fontSize: 26 }} />,
    title: 'Resultado de Exames',
    desc: 'Registrar resultados dos exames.',
    color: "#f57c00", bgcolor: "#fff3e0",
    path: '/atendimento/resultado-exames', state: { paciente, prescricao },
  },
  {
    icon: <FitnessCenterIcon sx={{ fontSize: 26 }} />,
    title: 'Exercícios',
    desc: 'Recomendar exercícios físicos.',
    color: "#2e7d32", bgcolor: "#e8f5e9",
    path: '/atendimento/exercicios', state: { paciente, prescricao },
  },
  {
    icon: <CoronavirusIcon sx={{ fontSize: 26 }} />,
    title: 'Diagnosticar Doenças',
    desc: 'Registrar diagnósticos CID-10.',
    color: "#6a1b9a", bgcolor: "#f3e5f5",
    path: '/atendimento/doencas', state: { paciente, prescricao },
  },
  {
    icon: <WarningAmberIcon sx={{ fontSize: 26 }} />,
    title: 'Alergias',
    desc: 'Gerenciar alergias do paciente.',
    color: "#e65100", bgcolor: "#fbe9e7",
    path: '/atendimento/alergias', state: { paciente },
  },
  {
    icon: <QuizIcon sx={{ fontSize: 26 }} />,
    title: 'Questionário de Saúde',
    desc: 'Ver respostas e pontuação.',
    color: "#00796b", bgcolor: "#e0f2f1",
    path: '/medico/respostas-questionario', state: { paciente },
  },
  {
    icon: <MedicalInformationIcon sx={{ fontSize: 26 }} />,
    title: 'Prontuário Eletrônico',
    desc: 'Histórico completo do paciente.',
    color: "#1565c0", bgcolor: "#e3f2fd",
    path: '/informacoes_saude', state: { paciente, prescricao },
  },
];

export function ModuleGridMedico({ paciente, prescricao }: { paciente: Paciente; prescricao: any }) {
  const navigate = useNavigate();
  const items = getItems(paciente, prescricao);

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
      {items.map((m) => (
        <Paper
          key={m.title}
          elevation={0}
          onClick={() => navigate(m.path, { state: m.state })}
          sx={{
            p: 2, borderRadius: 3,
            border: "1px solid #e8eaf6",
            cursor: "pointer",
            display: "flex", alignItems: "center", gap: 1.5,
            transition: "all 0.15s ease",
            "&:hover": {
              borderColor: m.color,
              bgcolor: m.bgcolor + "50",
              transform: "translateY(-1px)",
            },
          }}
        >
          <Box sx={{
            width: 44, height: 44, borderRadius: 2,
            bgcolor: m.bgcolor,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: m.color, flexShrink: 0,
          }}>
            {m.icon}
          </Box>
          <Box flex={1} minWidth={0}>
            <Typography fontWeight={600} fontSize="0.88rem" noWrap>{m.title}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.3, fontSize: "0.75rem" }}>
              {m.desc}
            </Typography>
          </Box>
          <ChevronRightIcon sx={{ color: "#bdbdbd", fontSize: 18, flexShrink: 0 }} />
        </Paper>
      ))}
    </Box>
  );
}