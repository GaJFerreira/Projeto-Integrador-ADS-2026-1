// src/features/medicamentos/pages/ListaMedicamentosPage.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { Box, Button, Card, CardContent, Typography, Stack, List, ListItem, ListItemText, IconButton, Divider } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useNavigate } from 'react-router-dom';
// ✅ usar medicamentoApi em vez do service local
import { medicamentoApi } from '../api/medicamentoApi';
import type { MedicamentoDTO, MedicamentoHorarioDTO } from '../api/medicamentoApi';

export default function ListaMedicamentosPage() {
  const navigate = useNavigate();
  const [lista, setLista] = useState<MedicamentoDTO[]>([]);
  const [loading, setLoading] = useState(false);

  // ✅ carrega do backend
  const loadAll = async () => {
    try {
      const data = await medicamentoApi.listarMeus();
      setLista(data);
    } catch (err) {
      console.error("Erro ao carregar medicamentos", err);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  // Pega o próximo horário não tomado hoje
  const getProximoHorario = (med: MedicamentoDTO): string | null => {
    if (!med.horarios || med.horarios.length === 0) return null;
    const agora = new Date();
    const minutosAgora = agora.getHours() * 60 + agora.getMinutes();

    const getMin = (h: string) => {
      const [hh, mm] = h.split(':').map(Number);
      return hh * 60 + mm;
    };

    const futuros = med.horarios
      .filter(h => !h.tomadoHoje)
      .map(h => ({ horario: h.horario, minutos: getMin(h.horario) }))
      .filter(h => h.minutos >= minutosAgora);

    if (futuros.length === 0) return med.horarios[0]?.horario ?? null;
    return futuros[0].horario;
  };

  const getMinutosAteProximo = (med: MedicamentoDTO): number => {
    const proximo = getProximoHorario(med);
    if (!proximo) return Infinity;
    const agora = new Date();
    const minutosAgora = agora.getHours() * 60 + agora.getMinutes();
    const [h, m] = proximo.split(':').map(Number);
    return h * 60 + m - minutosAgora;
  };

  const listaOrdenada = useMemo(() => {
    return [...lista].sort((a, b) => getMinutosAteProximo(a) - getMinutosAteProximo(b));
  }, [lista]);

  const formatCountdown = (min: number) => {
    if (min === Infinity) return "";
    if (min <= 0) return "Agora";
    const h = Math.floor(min / 60);
    const m = min % 60;
    return h === 0 ? `Faltam ${m} min` : `Faltam ${h}h ${m}min`;
  };

  const onTomar = async (horarioId: number) => {
    if (!confirm('Deseja registrar que tomou este medicamento agora?')) return;
    setLoading(true);
    try {
      // ✅ chama o backend — JWT identifica o usuário
      await medicamentoApi.registrarTomada(horarioId);
      await loadAll(); // recarrega lista atualizada
    } catch (err) {
      console.error(err);
      alert('Ocorreu um erro ao registrar.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Remover este medicamento?')) return;
    try {
      await medicamentoApi.excluir(id);
      setLista(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      console.error(err);
      alert('Erro ao remover medicamento.');
    }
  };

  return (
    <Box sx={{ py: 4, px: 2, display: 'flex', justifyContent: 'center' }}>
      <Card sx={{ width: '100%', maxWidth: 980, borderRadius: 3 }}>
        <CardContent sx={{ p: { xs: 3, sm: 5 } }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h5" sx={{ fontSize: 24, fontWeight: 700, color: 'primary.main' }}>
              Medicamentos Cadastrados
            </Typography>
            <Stack direction="row" spacing={2}>
              <Button variant="outlined" onClick={() => navigate('/medicamentos/historico')}>Histórico</Button>
              <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/medicamentos/cadastro')}>Novo</Button>
            </Stack>
          </Stack>

          {listaOrdenada.length === 0 ? (
            <Box sx={{ py: 6, textAlign: 'center', bgcolor: '#e9f3ff', borderRadius: 2, border: '1px dashed #9ec9ff' }}>
              <Typography sx={{ fontSize: 20, fontWeight: 700, color: 'primary.main', mb: 1 }}>Nenhum medicamento cadastrado</Typography>
              <Typography sx={{ fontSize: 16, color: 'text.secondary', mb: 3 }}>
                Comece cadastrando seu primeiro medicamento para gerenciar seus horários.
              </Typography>
              <Button variant="contained" onClick={() => navigate('/medicamentos/cadastro')} startIcon={<AddIcon />}>+ Cadastrar Medicamento</Button>
            </Box>
          ) : (
            <List>
              {listaOrdenada.map((m, i) => {
                const proximo = getProximoHorario(m);
                const minutosAte = getMinutosAteProximo(m);
                const countdown = formatCountdown(minutosAte);

                // ✅ tomadoHoje vem do backend via horarios
                const todosHorariosTomados = m.horarios.every(h => h.tomadoHoje);

                // horário mais próximo não tomado para passar o id
                const proximoHorario = m.horarios.find(h => !h.tomadoHoje && h.horario === proximo);

                const destaque = i === 0 ? {
                  bgcolor: "#fff7e6",
                  borderLeft: "6px solid #ff9800"
                } : {};

                return (
                  <React.Fragment key={m.id}>
                    <ListItem sx={{ py: 2, ...destaque }}
                      secondaryAction={
                        <Stack direction="row" spacing={1} alignItems="center">
                          {todosHorariosTomados ? (
                            <Button startIcon={<CheckCircleOutlineIcon />} variant="contained" color="success"
                              sx={{ fontSize: 16, px: 2, minHeight: 44 }} disabled>
                              Tomado
                            </Button>
                          ) : (
                            <Button
                              // ✅ passa o id do horário, não do medicamento
                              onClick={() => proximoHorario && onTomar(proximoHorario.id)}
                              startIcon={<CheckCircleOutlineIcon />}
                              variant="contained" color="primary"
                              sx={{ fontSize: 16, px: 2, minHeight: 44 }}
                              disabled={loading || !proximoHorario}
                            >
                              Marcar como tomado
                            </Button>
                          )}
                          <IconButton onClick={() => navigate('/medicamentos/cadastro', { state: { medicamento: m } })}>
                            <EditIcon />
                          </IconButton>
                          <IconButton onClick={() => handleDelete(m.id)}>
                            <DeleteIcon />
                          </IconButton>
                        </Stack>
                      }
                    >
                      <ListItemText
                        primary={<Typography sx={{ fontSize: 20, fontWeight: 700 }}>{m.nome}</Typography>}
                        secondary={
                          <Typography sx={{ fontSize: 16, color: 'text.secondary' }}>
                            Tarja: <strong>{m.tarja}</strong>
                            {proximo ? ` • Próximo: ${proximo}` : ""}
                            {countdown ? ` • ${countdown}` : ""}
                          </Typography>
                        }
                      />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                );
              })}
            </List>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}