import React, { useState } from 'react';
import { 
  Container, Typography, Box, Button, Grid, Dialog, DialogTitle, 
  DialogContent, DialogActions, TextField, CircularProgress, 
  Paper, IconButton, Tooltip, Alert, Snackbar
} from '@mui/material';
import { Add, ContentCopy, WarningAmber, Sensors } from '@mui/icons-material';
import { PageHeader } from '../components/PageHeader';
import { useDevices } from '../hooks/useDevices';
import { DeviceCard } from '../components/DeviceCard';

export default function MeusDispositivosPage() {
  const { devices, loading, addDevice } = useDevices();
  const [openCreate, setOpenCreate] = useState(false);
  const [nome, setNome] = useState('');
  const [creating, setCreating] = useState(false);

  // Modal de sucesso
  const [openSuccess, setOpenSuccess] = useState(false);
  const [newDeviceData, setNewDeviceData] = useState<{deviceId: string, deviceKeyPlain: string} | null>(null);

  const [snackbarMessage, setSnackbarMessage] = useState('');

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setSnackbarMessage(`${type} copiado com sucesso!`);
  };

  const handleCreateSubmit = async () => {
    if (!nome.trim()) return;
    setCreating(true);
    try {
      // Gera automaticamente um ID simplificado (ex: ESP32-A1B2C3D4) e uma key no padrão UUID
      const generatedId = crypto.randomUUID().split('-')[0].toUpperCase();
      const deviceId = `ESP32-${generatedId}`;
      const deviceKey = crypto.randomUUID().replace(/-/g, '');
      
      const created = await addDevice({
        nome,
        deviceId,
        deviceKey
      });
      
      setNewDeviceData({
        deviceId: created.deviceId,
        deviceKeyPlain: created.deviceKeyPlain || deviceKey
      });
      setOpenCreate(false);
      setNome('');
      setOpenSuccess(true);
    } catch (err) {
      setSnackbarMessage('Erro ao cadastrar dispositivo.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 4 }, px: { xs: 1, sm: 2, md: 3 } }}>
      <PageHeader 
        title="Meus Dispositivos IoT" 
        subtitle="Gerencie seus botões de emergência inteligentes e monitore a conexão em tempo real."
        icon={<Sensors sx={{ fontSize: 40, color: '#0d47a1' }} />}
      />

      <Box display="flex" justifyContent="flex-end" mb={4}>
        <Button 
          variant="contained" 
          startIcon={<Add />}
          onClick={() => setOpenCreate(true)}
          sx={{ 
            borderRadius: 8, 
            px: 3, 
            py: 1.2,
            background: 'linear-gradient(135deg, #1e88e5 0%, #0d47a1 100%)',
            boxShadow: '0 4px 12px rgba(13, 71, 161, 0.3)',
            fontWeight: 'bold',
            '&:hover': {
              background: 'linear-gradient(135deg, #1565c0 0%, #0a3d91 100%)',
            }
          }}
        >
          Novo Dispositivo
        </Button>
      </Box>

      {loading && devices.length === 0 ? (
        <Box display="flex" justifyContent="center" my={10}>
          <CircularProgress size={60} thickness={4} />
        </Box>
      ) : devices.length === 0 ? (
        <Paper 
          elevation={0}
          sx={{ 
            p: 6, 
            textAlign: 'center', 
            borderRadius: 4, 
            bgcolor: '#f8f9fa',
            border: '2px dashed #e0e0e0'
          }}
        >
          <Sensors sx={{ fontSize: 64, color: '#bdbdbd', mb: 2 }} />
          <Typography variant="h5" color="text.secondary" fontWeight="600" gutterBottom>
            Nenhum dispositivo encontrado
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={4}>
            Você ainda não possui um botão de emergência IoT cadastrado em sua conta.
          </Typography>
          <Button variant="outlined" size="large" startIcon={<Add />} onClick={() => setOpenCreate(true)}>
            Cadastrar meu primeiro botão
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {devices.map(device => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={device.id}>
              <DeviceCard device={device} onCopy={handleCopy} />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Modal de Criação de Novo Dispositivo */}
      <Dialog 
        open={openCreate} 
        onClose={() => !creating && setOpenCreate(false)} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: '800', pb: 1, color: '#0d47a1' }}>
          Configurar Novo ESP32
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" color="text.secondary" paragraph>
            Atribua um nome amigável para identificar a localização do seu botão de emergência.
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Nome do Dispositivo (ex: Quarto do Idoso)"
            type="text"
            fullWidth
            variant="outlined"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            disabled={creating}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={() => setOpenCreate(false)} disabled={creating} color="inherit">
            Cancelar
          </Button>
          <Button 
            onClick={handleCreateSubmit} 
            variant="contained" 
            disabled={!nome.trim() || creating}
            startIcon={creating ? <CircularProgress size={20} color="inherit" /> : null}
            sx={{ px: 4, borderRadius: 8 }}
          >
            Finalizar Cadastro
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de ATENÇÃO - Chaves Geradas */}
      <Dialog 
        open={openSuccess} 
        onClose={(_, reason) => {
          if (reason !== 'backdropClick' && reason !== 'escapeKeyDown') {
            setOpenSuccess(false);
          }
        }} 
        maxWidth="sm" 
        fullWidth 
        disableEscapeKeyDown
        PaperProps={{ sx: { borderRadius: 3, borderTop: '6px solid #d32f2f' } }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: '#d32f2f', fontWeight: '800', fontSize: '1.4rem' }}>
          <WarningAmber fontSize="large" /> ATENÇÃO IMPORTANTE
        </DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 4, '& .MuiAlert-message': { width: '100%' }, borderRadius: 2 }}>
            <Typography variant="body1" fontWeight="700" gutterBottom>
              Copie as credenciais abaixo imediatamente!
            </Typography>
            <Typography variant="body2">
              A chave secreta (Device Key) será exibida <b>apenas nesta tela</b> por motivos de segurança. Você precisará colá-las no código C++ do seu ESP32.
            </Typography>
          </Alert>

          {newDeviceData && (
            <Box display="flex" flexDirection="column" gap={2}>
              <Paper variant="outlined" sx={{ p: 2.5, bgcolor: '#fff3e0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: 2, border: '1px solid #ffcc80' }}>
                <Box>
                  <Typography variant="caption" color="warning.dark" fontWeight="800" sx={{ letterSpacing: 1 }}>DEVICE ID</Typography>
                  <Typography variant="h6" sx={{ fontFamily: 'monospace', color: '#e65100', mt: 0.5 }}>{newDeviceData.deviceId}</Typography>
                </Box>
                <Tooltip title="Copiar Device ID">
                  <IconButton onClick={() => handleCopy(newDeviceData.deviceId, 'Device ID')} color="warning" size="large">
                    <ContentCopy />
                  </IconButton>
                </Tooltip>
              </Paper>

              <Paper variant="outlined" sx={{ p: 2.5, bgcolor: '#fff3e0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: 2, border: '1px solid #ffcc80' }}>
                <Box>
                  <Typography variant="caption" color="warning.dark" fontWeight="800" sx={{ letterSpacing: 1 }}>DEVICE KEY (SEGREDO)</Typography>
                  <Typography variant="h6" sx={{ fontFamily: 'monospace', color: '#e65100', mt: 0.5 }}>{newDeviceData.deviceKeyPlain}</Typography>
                </Box>
                <Tooltip title="Copiar Device Key">
                  <IconButton onClick={() => handleCopy(newDeviceData.deviceKeyPlain, 'Device Key')} color="warning" size="large">
                    <ContentCopy />
                  </IconButton>
                </Tooltip>
              </Paper>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenSuccess(false)} variant="contained" color="error" size="large" fullWidth sx={{ borderRadius: 8, fontWeight: 'bold' }}>
            Eu entendi, já copiei as credenciais!
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!snackbarMessage}
        autoHideDuration={4000}
        onClose={() => setSnackbarMessage('')}
        message={snackbarMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Container>
  );
}
