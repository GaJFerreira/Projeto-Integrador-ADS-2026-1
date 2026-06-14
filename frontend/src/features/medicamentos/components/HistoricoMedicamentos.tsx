// src/features/Medicamentos/components/HistoricoMedicamentos.tsx
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Stack,
  List,
  ListItem
} from '@mui/material';
import { Link } from 'react-router-dom';
import type { Medicamento } from '../types/medicamento';
import { medicamentoApi } from "../api/medicamentoApi"; // ✅ adicionar

interface HistoricoMedicamentosProps {
  historico: Medicamento[];
//   usuarioId?: number; // opcional, mas ideal
}

const HistoricoMedicamentos: React.FC<HistoricoMedicamentosProps> = ({
  historico,
//   usuarioId = 1 // ⚠️ Troque depois pelo ID real
}) => {

  const [eventosLocal, setEventosLocal] = useState(() => {
    return historico
      .flatMap((med) =>
        (med.checkins || [])
          .filter((iso) => !!iso)
          .map((iso) => {
            const date = new Date(iso);
            return {
              id: `${med.id}-${iso}`,
              nome: med.nome,
              iso,
              horario: date.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              }),
              data: date.toLocaleDateString()
            };
          })
      )
      .sort((a, b) => (a.iso < b.iso ? 1 : -1));
  });


// 🗑️ Função apagar histórico
const apagarHistorico = async () => {
  const confirmar = window.confirm(
    "⚠️ ATENÇÃO!\n\nVocê realmente deseja APAGAR TODO o histórico de medicamentos?\n\n" +
    "Esta ação é permanente e não pode ser desfeita."
  );

  if (!confirmar) return;

  try {
      await medicamentoApi.limparHistorico(); // ✅ sem usuarioId — JWT cuida disso
      setEventosLocal([]);
      alert("✔ Histórico apagado com sucesso!");
    }  catch (error) {
    console.error("Erro ao apagar histórico", error);
    alert("❌ Ocorreu um erro ao apagar o histórico.");
  }
};

  return (
    <Box
      sx={{
        maxWidth: 900,
        mx: 'auto',
        my: 5,
        p: 3,
        backgroundColor: 'background.paper',
        borderRadius: 3,
        boxShadow: 3
      }}
    >
      {/* Cabeçalho */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" color="primary" fontWeight={700}>
          Histórico de Medicamentos
        </Typography>

        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            color="error"
            onClick={apagarHistorico}
          >
            🗑️ Apagar Histórico
          </Button>

          <Button component={Link} to="/medicamentos/lista" variant="outlined">
            📋 Lista
          </Button>
        </Stack>
      </Stack>

      {/* Caso não haja eventos */}
      {eventosLocal.length === 0 ? (
        <Box
          sx={{
            textAlign: 'center',
            p: 6,
            border: '2px dashed #90caf9',
            borderRadius: '16px',
            backgroundColor: '#e3f2fd',
            color: 'primary.main'
          }}
        >
          <Typography variant="h4" mb={1}>
            💊
          </Typography>
          <Typography variant="h6" mb={1}>
            Nenhuma ação registrada
          </Typography>
          <Typography variant="body2" color="text.secondary">
            O histórico aparecerá aqui quando você marcar "Tomar agora".
          </Typography>
        </Box>
      ) : (
        <List>
          {eventosLocal.map((ev) => (
            <ListItem key={ev.id} sx={{ px: 0, mb: 2 }}>
              <Card sx={{ width: '100%', borderRadius: 2, boxShadow: 2 }}>
                <CardContent>
                  <Typography variant="subtitle1" color="primary" fontWeight={700}>
                    {ev.nome}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Data: <strong>{ev.data}</strong> • Horário: <strong>{ev.horario}</strong>
                  </Typography>
                </CardContent>
              </Card>
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

export default HistoricoMedicamentos;
