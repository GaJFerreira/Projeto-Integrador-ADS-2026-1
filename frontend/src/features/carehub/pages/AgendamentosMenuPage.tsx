import { Box, Card, CardActionArea, CardContent, Container, Typography, Avatar, Stack, Chip, useTheme } from '@mui/material';
import { AccessTime, AssignmentTurnedIn, CalendarMonth, History } from '@mui/icons-material';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { isCuidador } from '../components/auth';

type MenuOption = {
  title: string;
  description: string;
  icon: ReactNode;
  to: string;
  highlight?: string;
};

export default function AgendamentosMenuPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const usuarioCuidador = isCuidador();

  const options: MenuOption[] = [
    {
      title: 'Futuros Atendimentos',
      description: 'Acompanhe os atendimentos que ainda vao acontecer.',
      icon: <AccessTime />,
      to: '/carehub/proximos',
      highlight: 'Futuros',
    },
    {
      title: 'Ver Agendamentos em Andamento',
      description: 'Consulte a lista principal de agendamentos e seus status.',
      icon: <AssignmentTurnedIn />,
      to: usuarioCuidador ? '/carehub/cuidador/agendamentos' : '/carehub/agendamentos',
      highlight: 'Agendamentos',
    },
    {
      title: 'Histórico de Atendimentos',
      description: 'Veja registros e atendimentos anteriores em um so lugar.',
      icon: <History />,
      to: '/carehub/historico-atendimentos',
      highlight: 'Histórico',
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, md: 3 }, px: { xs: 1.5, sm: 2, md: 3 } }}>
      <PageHeader
        title="Meus Agendamentos"
        subtitle="Escolha como deseja visualizar seus atendimentos"
        backTo="/carehub"
        icon={<CalendarMonth sx={{ color: 'primary.main', fontSize: 34 }} />}
      />

      <Box
        sx={{
          mb: { xs: 2.5, md: 3.5 },
          p: { xs: 2, sm: 2.5, md: 3 },
          borderRadius: 3,
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 10px 28px rgba(13, 71, 161, 0.08)',
        }}
      >
        <Stack spacing={0.75}>
          <Chip
            label="Agenda CareHub"
            size="small"
            color="primary"
            variant="outlined"
            sx={{ alignSelf: 'flex-start', borderRadius: 1, fontWeight: 800 }}
          />
          <Typography
            variant="h5"
            component="h2"
            sx={{
              fontWeight: 800,
              color: 'text.primary',
              fontSize: { xs: '1.35rem', sm: '1.55rem', md: '1.75rem' },
              letterSpacing: 0,
            }}
          >
            Central de atendimentos
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ maxWidth: 720, lineHeight: 1.6, fontSize: { xs: '0.98rem', sm: '1.05rem' } }}
          >
            Acesse rapidamente os próximos compromissos, a lista principal de agendamentos ou o histórico.
          </Typography>
        </Stack>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
          gap: { xs: 2, sm: 2.5, md: 3 },
        }}
      >
        {options.map((option) => (
          <Card
            key={option.title}
            elevation={0}
            sx={{
              height: '100%',
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
              overflow: 'hidden',
              boxShadow: '0 12px 30px rgba(15, 23, 42, 0.08)',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                borderColor: 'primary.main',
                boxShadow: '0 18px 38px rgba(13, 71, 161, 0.16)',
              },
            }}
          >
            <CardActionArea
              onClick={() => navigate(option.to)}
              aria-label={option.title}
              sx={{
                height: '100%',
                p: { xs: 2.25, sm: 2.75, md: 3 },
                alignItems: 'stretch',
                '&.Mui-focusVisible': {
                  outline: `4px solid ${theme.palette.primary.main}`,
                  outlineOffset: '-4px',
                },
              }}
            >
              <CardContent sx={{ p: '0 !important', height: '100%' }}>
                <Stack spacing={2.25} sx={{ height: '100%' }}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Avatar
                      sx={{
                        width: 58,
                        height: 58,
                        bgcolor: `${theme.palette.primary.main}14`,
                        color: 'primary.main',
                        border: `1px solid ${theme.palette.primary.main}22`,
                        '& > svg': { fontSize: 32 },
                      }}
                    >
                      {option.icon}
                    </Avatar>
                    <Chip
                      label={option.highlight}
                      size="small"
                      sx={{
                        borderRadius: 1,
                        bgcolor: 'grey.100',
                        color: 'text.secondary',
                        fontWeight: 700,
                      }}
                    />
                  </Stack>

                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="h6"
                      component="h3"
                      sx={{
                        fontWeight: 800,
                        color: 'text.primary',
                        mb: 1,
                        fontSize: { xs: '1.15rem', sm: '1.25rem' },
                        lineHeight: 1.25,
                        letterSpacing: 0,
                      }}
                    >
                      {option.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ lineHeight: 1.55, fontSize: { xs: '0.95rem', sm: '1rem' } }}
                    >
                      {option.description}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </CardActionArea>
          </Card>
        ))}
      </Box>
    </Container>
  );
}
