import React from 'react';
import { Card, CardContent, Typography, Box, Chip, IconButton, Tooltip } from '@mui/material';
import { ContentCopy, Memory, AccessTime, ToggleOn, ToggleOff } from '@mui/icons-material';
import dayjs from 'dayjs';
import type { DispositivoIoTResponseDTO } from '../types';

export interface DeviceCardProps {
  device: DispositivoIoTResponseDTO;
  onCopy: (text: string, type: string) => void;
}

export function DeviceCard({ device, onCopy }: DeviceCardProps) {
  const isOnline = () => {
    if (!device.ultimoBatimentoEm) return false;
    const diff = dayjs().diff(dayjs(device.ultimoBatimentoEm), 'minute');
    return diff <= 2;
  };

  const online = isOnline();

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 4,
        border: '1px solid',
        borderColor: online ? 'rgba(76, 175, 80, 0.18)' : 'rgba(244, 67, 54, 0.18)',
        bgcolor: 'background.paper',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 4px 18px rgba(0, 0, 0, 0.03)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          transform: 'translateY(-5px)',
          boxShadow: online
            ? '0 12px 30px rgba(76, 175, 80, 0.08), 0 4px 12px rgba(0,0,0,0.02)'
            : '0 12px 30px rgba(244, 67, 54, 0.08), 0 4px 12px rgba(0,0,0,0.02)',
          borderColor: online ? 'rgba(76, 175, 80, 0.35)' : 'rgba(244, 67, 54, 0.35)',
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '5px',
          height: '100%',
          bgcolor: online ? '#4caf50' : '#f44336',
          borderRadius: '4px 0 0 4px'
        }
      }}
    >
      <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
        {/* Top Header Row: Icon & Status Badge */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box
            sx={{
              background: online
                ? 'linear-gradient(135deg, rgba(76, 175, 80, 0.12) 0%, rgba(76, 175, 80, 0.04) 100%)'
                : 'linear-gradient(135deg, rgba(244, 67, 54, 0.12) 0%, rgba(244, 67, 54, 0.04) 100%)',
              p: 1,
              borderRadius: '10px',
              display: 'flex',
              color: online ? '#2e7d32' : '#c62828',
            }}
          >
            <Memory sx={{ fontSize: 20 }} />
          </Box>

          <Chip
            icon={
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: online ? '#4caf50' : '#f44336',
                  marginLeft: '8px !important',
                  marginRight: '-4px !important',
                  animation: online ? 'pulse 2s infinite' : 'none',
                  '@keyframes pulse': {
                    '0%': { boxShadow: '0 0 0 0 rgba(76, 175, 80, 0.7)' },
                    '70%': { boxShadow: '0 0 0 6px rgba(76, 175, 80, 0)' },
                    '100%': { boxShadow: '0 0 0 0 rgba(76, 175, 80, 0)' }
                  }
                }}
              />
            }
            label={online ? 'ONLINE' : 'OFFLINE'}
            sx={{
              fontWeight: '800',
              fontSize: '0.675rem',
              height: 24,
              borderRadius: '6px',
              bgcolor: online ? 'rgba(76, 175, 80, 0.08)' : 'rgba(244, 67, 54, 0.08)',
              color: online ? '#2e7d32' : '#c62828',
              border: 'none',
              '& .MuiChip-label': { px: 1 },
              letterSpacing: '0.05em'
            }}
          />
        </Box>

        {/* Device Name */}
        <Typography
          variant="h6"
          fontWeight="800"
          color="text.primary"
          sx={{ letterSpacing: '-0.02em', lineHeight: 1.35, mb: 2.5 }}
        >
          {device.nome}
        </Typography>

        {/* Device ID Section */}
        <Box
          sx={{
            mb: 2.5,
            p: 1.75,
            bgcolor: 'rgba(0, 0, 0, 0.015)',
            borderRadius: 2.5,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            border: '1px dashed rgba(0, 0, 0, 0.08)',
            transition: 'background-color 0.2s',
            '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.035)' }
          }}
        >
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
              fontWeight="700"
              sx={{ letterSpacing: '0.05em', textTransform: 'uppercase', mb: 0.5, fontSize: '0.65rem' }}
            >
              ID do Dispositivo
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600, color: 'text.primary', fontSize: '0.85rem' }}>
              {device.deviceId}
            </Typography>
          </Box>
          <Tooltip title="Copiar ID" arrow>
            <IconButton
              size="small"
              onClick={() => onCopy(device.deviceId, 'Device ID')}
              sx={{
                color: 'text.secondary',
                bgcolor: 'background.paper',
                border: '1px solid rgba(0,0,0,0.06)',
                '&:hover': {
                  color: 'primary.main',
                  bgcolor: 'rgba(25, 118, 210, 0.04)',
                  borderColor: 'rgba(25, 118, 210, 0.2)'
                }
              }}
            >
              <ContentCopy fontSize="small" sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Info Rows */}
        <Box display="flex" flexDirection="column" gap={2} sx={{ borderTop: '1px solid rgba(0,0,0,0.05)', pt: 2.5 }}>
          {/* Último Batimento */}
          <Box display="flex" alignItems="flex-start" gap={1.5}>
            <AccessTime sx={{ fontSize: 18, color: 'text.secondary', mt: 0.25 }} />
            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight="700"
                sx={{ letterSpacing: '0.03em', display: 'block', textTransform: 'uppercase', fontSize: '0.625rem', mb: 0.25 }}
              >
                Último Batimento
              </Typography>
              <Typography variant="body2" color="text.primary" fontWeight="500" sx={{ lineHeight: 1.3 }}>
                {device.ultimoBatimentoEm
                  ? dayjs(device.ultimoBatimentoEm).format('DD/MM/YYYY [às] HH:mm:ss')
                  : 'Nunca conectado'}
              </Typography>
            </Box>
          </Box>

          {/* Status do Sistema — ativo no cadastro E online em tempo real */}
          <Box display="flex" alignItems="flex-start" gap={1.5}>
            {device.ativo && online ? (
              <ToggleOn sx={{ fontSize: 20, color: '#4caf50', mt: 0.25 }} />
            ) : (
              <ToggleOff sx={{ fontSize: 20, color: '#c62828', mt: 0.25 }} />
            )}
            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                fontWeight="700"
                sx={{ letterSpacing: '0.03em', display: 'block', textTransform: 'uppercase', fontSize: '0.625rem', mb: 0.25 }}
              >
                Status do Sistema
              </Typography>
              <Typography
                variant="body2"
                fontWeight="700"
                sx={{
                  lineHeight: 1.3,
                  color: device.ativo && online ? '#2e7d32' : '#c62828',
                }}
              >
                {device.ativo && online
                  ? 'Ativo e Operacional'
                  : !device.ativo
                    ? 'Inativo'
                    : 'Desconectado'}
              </Typography>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}