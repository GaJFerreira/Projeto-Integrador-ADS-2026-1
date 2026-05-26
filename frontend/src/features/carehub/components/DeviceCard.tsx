import React from 'react';
import { Card, CardContent, Typography, Box, Chip, IconButton, Tooltip } from '@mui/material';
import { ContentCopy, Memory, WifiOff, Wifi } from '@mui/icons-material';
import dayjs from 'dayjs';
import type { DispositivoIoTResponseDTO } from '../types';

export interface DeviceCardProps {
  device: DispositivoIoTResponseDTO;
  onCopy: (text: string, type: string) => void;
}

export function DeviceCard({ device, onCopy }: DeviceCardProps) {
  // Lógica de status Online: último batimento há menos de 2 minutos
  const isOnline = () => {
    if (!device.ultimoBatimentoEm) return false;
    const diff = dayjs().diff(dayjs(device.ultimoBatimentoEm), 'minute');
    return diff <= 2;
  };

  const online = isOnline();

  return (
    <Card 
      elevation={3} 
      sx={{ 
        borderRadius: 3, 
        borderLeft: `6px solid ${online ? '#4caf50' : '#f44336'}`,
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
        }
      }}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <Box 
              sx={{ 
                bgcolor: 'rgba(13, 71, 161, 0.1)', 
                p: 1, 
                borderRadius: '50%', 
                display: 'flex' 
              }}
            >
              <Memory sx={{ color: '#0d47a1' }} />
            </Box>
            <Typography variant="h6" fontWeight="700" color="text.primary">
              {device.nome}
            </Typography>
          </Box>
          <Chip 
            icon={online ? <Wifi fontSize="small" /> : <WifiOff fontSize="small" />} 
            label={online ? 'ONLINE' : 'OFFLINE'} 
            color={online ? 'success' : 'error'} 
            size="small" 
            variant="filled"
            sx={{ fontWeight: 'bold' }}
          />
        </Box>

        <Box 
          sx={{ 
            mb: 2, 
            p: 1.5, 
            bgcolor: '#f8f9fa', 
            borderRadius: 2, 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            border: '1px solid #e0e0e0'
          }}
        >
          <Box>
            <Typography variant="caption" color="text.secondary" display="block" fontWeight="600">
              DEVICE ID
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600, color: '#424242' }}>
              {device.deviceId}
            </Typography>
          </Box>
          <Tooltip title="Copiar Device ID">
            <IconButton size="small" onClick={() => onCopy(device.deviceId, 'Device ID')} color="primary">
              <ContentCopy fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        <Box display="flex" flexDirection="column" gap={0.5}>
          <Typography variant="body2" color="text.secondary">
            <strong style={{ color: '#616161' }}>Último Batimento:</strong>{' '}
            {device.ultimoBatimentoEm ? dayjs(device.ultimoBatimentoEm).format('DD/MM/YYYY [às] HH:mm:ss') : 'Nunca conectado'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong style={{ color: '#616161' }}>Status:</strong> {device.ativo ? 'Ativo' : 'Inativo'}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
