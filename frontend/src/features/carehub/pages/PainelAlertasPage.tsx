import React, { useState } from 'react';
import { 
  Container, Typography, Box, Grid, Card, CardContent, Button, 
  CircularProgress, Paper, Avatar, Snackbar, Alert
} from '@mui/material';
import { WarningAmber, CheckCircle, DirectionsRun, WifiTethering } from '@mui/icons-material';
import { PageHeader } from '../components/PageHeader';
import { useAlertas } from '../hooks/useAlertas';
import dayjs from 'dayjs';

export default function PainelAlertasPage() {
  const { alertas, loading, reconhecerAlerta, playSiren } = useAlertas();
  const [recognizing, setRecognizing] = useState<number | null>(null);
  const [successMsg, setSuccessMsg] = useState('');

  const handleReconhecer = async (id: number) => {
    setRecognizing(id);
    try {
      await reconhecerAlerta(id);
      setSuccessMsg('Alerta reconhecido e encerrado com sucesso!');
    } catch (err) {
      console.error(err);
    } finally {
      setRecognizing(null);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 4 }, px: { xs: 1, sm: 2, md: 3 } }}>
      <PageHeader 
        title="Painel de Emergência (IoT)" 
        subtitle="Central de monitoramento de alertas em tempo real. A tela atualizará automaticamente."
        icon={<WarningAmber sx={{ fontSize: 40, color: '#d32f2f' }} />}
      />

      {/* Botão de teste para o cuidador validar se o som está desbloqueado pelo navegador */}
      <Box display="flex" justifyContent="flex-end" mb={3}>
        <Button 
          variant="outlined" 
          color="inherit" 
          size="small" 
          startIcon={<WifiTethering />}
          onClick={playSiren}
          sx={{ borderRadius: 4, fontWeight: 'bold' }}
        >
          Testar Som do Alarme
        </Button>
      </Box>

      {loading && alertas.length === 0 ? (
        <Box display="flex" justifyContent="center" my={10}>
          <CircularProgress size={60} thickness={4} color="error" />
        </Box>
      ) : alertas.length === 0 ? (
        <Paper 
          elevation={0}
          sx={{ 
            p: 6, 
            textAlign: 'center', 
            borderRadius: 4, 
            bgcolor: '#e8f5e9',
            border: '2px dashed #81c784',
            transition: 'all 0.3s ease'
          }}
        >
          <CheckCircle sx={{ fontSize: 80, color: '#4caf50', mb: 2 }} />
          <Typography variant="h4" color="text.primary" fontWeight="800" gutterBottom>
            Nenhuma Emergência
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.2rem' }}>
            Todos os pacientes monitorados estão seguros no momento.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={4}>
          {alertas.map(alerta => (
            <Grid item xs={12} md={6} lg={4} key={alerta.id}>
              <Card 
                elevation={8}
                sx={{ 
                  borderRadius: 4, 
                  borderTop: '8px solid #d32f2f',
                  bgcolor: '#fff',
                  // Animação CSS para chamar atenção
                  animation: 'pulseRed 2s infinite',
                  '@keyframes pulseRed': {
                    '0%': { boxShadow: '0 0 0 0 rgba(211, 47, 47, 0.5)' },
                    '70%': { boxShadow: '0 0 0 15px rgba(211, 47, 47, 0)' },
                    '100%': { boxShadow: '0 0 0 0 rgba(211, 47, 47, 0)' }
                  }
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box display="flex" alignItems="center" gap={2} mb={3}>
                    <Avatar sx={{ bgcolor: '#ffebee', color: '#d32f2f', width: 64, height: 64 }}>
                      <WarningAmber sx={{ fontSize: 40 }} />
                    </Avatar>
                    <Box>
                      <Typography variant="h5" fontWeight="900" color="error.main" sx={{ textTransform: 'uppercase' }}>
                        Emergência!
                      </Typography>
                      <Typography variant="body2" color="text.secondary" fontWeight="bold">
                        Detectado em: {dayjs(alerta.criadoEm).format('DD/MM/YYYY - HH:mm:ss')}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ bgcolor: '#fafafa', p: 2.5, borderRadius: 3, mb: 4, border: '1px solid #eeeeee' }}>
                    <Typography variant="body1" color="text.primary" gutterBottom sx={{ fontSize: '1.1rem' }}>
                      <strong style={{ color: '#424242' }}>Paciente:</strong> {alerta.clienteNome}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      <strong>Dispositivo:</strong> {alerta.dispositivoNome}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      <strong>Motivo:</strong> Acionamento de {alerta.tipo} via {alerta.origem}
                    </Typography>
                  </Box>

                  <Button 
                    variant="contained" 
                    color="error" 
                    fullWidth 
                    size="large"
                    startIcon={recognizing === alerta.id ? <CircularProgress size={24} color="inherit"/> : <DirectionsRun />}
                    onClick={() => handleReconhecer(alerta.id)}
                    disabled={recognizing === alerta.id}
                    sx={{ 
                      borderRadius: 8, 
                      fontWeight: '900',
                      py: 1.8,
                      fontSize: '1.1rem',
                      textTransform: 'uppercase',
                      letterSpacing: 1
                    }}
                  >
                    {recognizing === alerta.id ? 'Processando...' : 'Reconhecer e Atender'}
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Snackbar 
        open={!!successMsg} 
        autoHideDuration={5000} 
        onClose={() => setSuccessMsg('')}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" variant="filled" sx={{ width: '100%', fontWeight: 'bold', fontSize: '1.1rem', borderRadius: 2 }}>
          {successMsg}
        </Alert>
      </Snackbar>
    </Container>
  );
}
