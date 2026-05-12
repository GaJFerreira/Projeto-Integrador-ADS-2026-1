import React, { useState } from 'react';
import { Box, Container, Typography, Paper, Button, Grid, Fade } from '@mui/material';
import { PageHeader } from '../components/PageHeader';
import ElderlyIcon from '@mui/icons-material/Elderly';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export default function CareHubAjudaPage() {
  const [view, setView] = useState<'options' | 'idoso' | 'cuidador'>('options');

  const handleBack = () => setView('options');

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <PageHeader
        title="Precisa de Ajuda?"
        subtitle="Veja como utilizar o Sistema"
        backTo="/carehub"
      />

      <Paper elevation={3} sx={{ p: { xs: 3, sm: 5 }, borderRadius: 4, minHeight: '400px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>

        {view === 'options' && (
          <Fade in={view === 'options'}>
            <Box sx={{ width: '100%', textAlign: 'center' }}>
              <Typography variant="h5" color="text.primary" sx={{ mb: 5, fontWeight: 'bold' }}>
                Selecione o seu perfil para ver as orientações:
              </Typography>
              <Grid container spacing={4} justifyContent="center">
                <Grid item xs={12} sm={5}>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="primary"
                    onClick={() => setView('idoso')}
                    sx={{
                      p: 4,
                      borderRadius: 4,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 2,
                      borderWidth: 2,
                      '&:hover': { borderWidth: 2, transform: 'translateY(-4px)', boxShadow: 4, bgcolor: 'primary.50' },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <ElderlyIcon sx={{ fontSize: 80 }} />
                    <Typography variant="h5" fontWeight="bold">
                      Sou Idoso
                    </Typography>
                  </Button>
                </Grid>
                <Grid item xs={12} sm={5}>
                  <Button
                    fullWidth
                    variant="outlined"
                    color="secondary"
                    onClick={() => setView('cuidador')}
                    sx={{
                      p: 4,
                      borderRadius: 4,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 2,
                      borderWidth: 2,
                      '&:hover': { borderWidth: 2, transform: 'translateY(-4px)', boxShadow: 4, bgcolor: 'secondary.50' },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <HealthAndSafetyIcon sx={{ fontSize: 80 }} />
                    <Typography variant="h5" fontWeight="bold">
                      Sou Cuidador
                    </Typography>
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Fade>
        )}

        {view === 'idoso' && (
          <Fade in={view === 'idoso'}>
            <Box sx={{ width: '100%' }}>
              <Button
                startIcon={<ArrowBackIcon />}
                onClick={handleBack}
                sx={{ mb: 4, fontSize: '1.1rem', fontWeight: 'bold' }}
                color="primary"
              >
                Voltar para o início
              </Button>

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, gap: 2 }}>
                <Box sx={{ p: 2, borderRadius: '50%', bgcolor: 'primary.light', color: 'primary.dark', display: 'flex', boxShadow: 2 }}>
                  <ElderlyIcon sx={{ fontSize: 48 }} />
                </Box>
                <Box>
                  <Typography variant="h4" color="primary.main" fontWeight="bold">
                    Guia do Idoso
                  </Typography>
                  <Typography variant="subtitle1" color="text.secondary">
                    Olá! Veja como é fácil usar o sistema para cuidar da sua saúde.
                  </Typography>
                </Box>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, borderLeft: '6px solid', borderColor: 'primary.main', bgcolor: 'primary.50' }}>
                    <Typography variant="h6" color="primary.dark" fontWeight="bold" gutterBottom>
                      1. Como marcar um atendimento
                    </Typography>
                    <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.6 }}>
                      Para encontrar alguém para cuidar de você, acesse a opção <strong>“Buscar Cuidadores”</strong>. Lá você verá os profissionais disponíveis. Depois de escolher quem você prefere, é só selecionar os dias, horários e o tipo de ajuda que precisa.
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, height: '100%', borderColor: 'grey.300' }}>
                    <Typography variant="h6" color="primary.main" fontWeight="bold" gutterBottom>
                      2. Seus próximos compromissos
                    </Typography>
                    <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.6 }}>
                      Quer saber quem virá te visitar logo? Em <strong>“Próximos Atendimentos”</strong>, você vê tudo o que está marcado para os próximos 7 dias.
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, height: '100%', borderColor: 'grey.300' }}>
                    <Typography variant="h6" color="primary.main" fontWeight="bold" gutterBottom>
                      3. Consultar agendamentos
                    </Typography>
                    <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.6 }}>
                      Para conferir todos os agendamentos que você já fez, basta acessar a área <strong>“Meus Agendamentos”</strong>.
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12}>
                  <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, borderColor: 'grey.300' }}>
                    <Typography variant="h6" color="primary.main" fontWeight="bold" gutterBottom>
                      4. Detalhes das visitas passadas
                    </Typography>
                    <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.6 }}>
                      Se quiser ver o que o cuidador escreveu sobre como foram os atendimentos que já aconteceram, entre em <strong>“Histórico de Atendimentos”</strong>.
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12}>
                  <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, borderColor: 'grey.300', bgcolor: 'secondary.50' }}>
                    <Typography variant="h6" color="secondary.main" fontWeight="bold" gutterBottom>
                      5. Conversar com o cuidador
                    </Typography>
                    <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.6 }}>
                      Precisa tirar uma dúvida? Acesse <strong>“Mensagens”</strong> para conversar direto com o profissional que já tem um horário marcado com você.
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          </Fade>
        )}

        {view === 'cuidador' && (
          <Fade in={view === 'cuidador'}>
            <Box sx={{ width: '100%' }}>
              <Button
                startIcon={<ArrowBackIcon />}
                onClick={handleBack}
                sx={{ mb: 4, fontSize: '1.1rem', fontWeight: 'bold' }}
                color="secondary"
              >
                Voltar para o início
              </Button>

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, gap: 2 }}>
                <Box sx={{ p: 2, borderRadius: '50%', bgcolor: 'secondary.light', color: 'secondary.dark', display: 'flex', boxShadow: 2 }}>
                  <HealthAndSafetyIcon sx={{ fontSize: 48 }} />
                </Box>
                <Box>
                  <Typography variant="h4" color="secondary.main" fontWeight="bold">
                    Guia do Cuidador
                  </Typography>
                  <Typography variant="subtitle1" color="text.secondary">
                    Olá! Organizamos este espaço para facilitar a gestão dos seus cuidados diários.
                  </Typography>
                </Box>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, height: '100%', borderColor: 'grey.300' }}>
                    <Typography variant="h6" color="secondary.main" fontWeight="bold" gutterBottom>
                      1. Agenda da semana
                    </Typography>
                    <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.6 }}>
                      Para se organizar melhor, acesse <strong>“Próximos Atendimentos”</strong> e veja todas as suas visitas marcadas para os próximos 7 dias.
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, height: '100%', borderColor: 'grey.300' }}>
                    <Typography variant="h6" color="secondary.main" fontWeight="bold" gutterBottom>
                      2. Gestão de serviços
                    </Typography>
                    <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.6 }}>
                      Em <strong>“Meus Agendamentos”</strong>, você acompanha o status de cada serviço: desde pedidos pendentes até os atendimentos finalizados.
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12}>
                  <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, borderLeft: '6px solid', borderColor: 'secondary.main', bgcolor: 'secondary.50' }}>
                    <Typography variant="h6" color="secondary.dark" fontWeight="bold" gutterBottom>
                      3. Prontuários e Saúde
                    </Typography>
                    <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.6 }}>
                      Precisa de detalhes técnicos? Em <strong>“Prontuários”</strong>, você acessa as informações de saúde essenciais de cada idoso sob seus cuidados.
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, height: '100%', borderColor: 'grey.300' }}>
                    <Typography variant="h6" color="secondary.main" fontWeight="bold" gutterBottom>
                      4. Registrar acompanhamento
                    </Typography>
                    <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.6 }}>
                      Não esqueça de preencher o <strong>“Registro de Acompanhamento”</strong> após cada visita para anotar a evolução do paciente.
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, height: '100%', borderColor: 'grey.300' }}>
                    <Typography variant="h6" color="secondary.main" fontWeight="bold" gutterBottom>
                      5. Histórico de registros
                    </Typography>
                    <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.6 }}>
                      Se precisar consultar anotações antigas, acesse o <strong>“Histórico de Atendimentos”</strong> para ver todo o passado clínico do paciente.
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={12}>
                  <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, borderColor: 'grey.300', bgcolor: 'primary.50' }}>
                    <Typography variant="h6" color="primary.main" fontWeight="bold" gutterBottom>
                      6. Conversar com o paciente
                    </Typography>
                    <Typography variant="body1" sx={{ fontSize: '1.1rem', lineHeight: 1.6 }}>
                      Dúvidas sobre o local ou horário? Vá em <strong>“Mensagens”</strong> e fale diretamente com o idoso ou familiar responsável.
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          </Fade>
        )}

      </Paper>
    </Container>
  );
}
