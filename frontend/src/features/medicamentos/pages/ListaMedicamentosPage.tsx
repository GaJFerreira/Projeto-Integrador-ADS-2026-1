// src/features/medicamentos/pages/ListaMedicamentosPage.tsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Stack,
  Divider,
  Chip,
  IconButton,
  Alert,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import HomeIcon from "@mui/icons-material/Home";
import HistoryIcon from "@mui/icons-material/History";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

import { useNavigate } from "react-router-dom";
import { medicamentoApi, type MedicamentoDTO } from "../api/medicamentoApi";

// Notificação
import MedicationNotifier from "@/features/medicamentos/components/MedicationNotifier";

// DATA FORMATADA
const dataHojeUpper = new Date()
  .toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
  .toUpperCase();

export default function ListaMedicamentosPage() {
  const navigate = useNavigate();


  const [lista, setLista] = useState<MedicamentoDTO[]>([]);
  const [dadosOriginais, setDadosOriginais] = useState<MedicamentoDTO[]>([]);
  const [loading, setLoading] = useState(false);

  const isToday = (iso?: string | null) => {
    if (!iso) return false;
    const d = new Date(iso);
    const now = new Date();
    return (
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate()
    );
  };

const getAlertaEstoque = (diasRestantes?: number | null) => {
    if (diasRestantes === null || diasRestantes === undefined) return null;
    if (diasRestantes > 5) return null;

    if (diasRestantes <= 0) {
      return { texto: "⚠️ Seu medicamento acaba hoje!", cor: "error" as const };
    }
    if (diasRestantes === 1) {
      return { texto: "⚠️ Seu medicamento está acabando em 1 dia!", cor: "error" as const };
    }
    return {
      texto: `⚠️ Seu medicamento está acabando em ${diasRestantes} dias!`,
      cor: diasRestantes <= 2 ? ("error" as const) : ("warning" as const),
    };
  };

  const carregar = async () => {

    setLoading(true);
    try {
      const dados = await medicamentoApi.listarMeus();

      setDadosOriginais(dados); // Envia a lista completa para o Notifier

      const filtrados = dados.filter(
        (m) =>
          m.horarios &&
          m.horarios.some(
            (h) => isToday(h.proximaExecucao) && !h.tomadoHoje
          )
      );

      const getProximoHorario = (m: MedicamentoDTO) => {
        const horariosHoje = m.horarios
          .filter((h) => isToday(h.proximaExecucao) && !h.tomadoHoje)
          .map((h) => new Date(h.proximaExecucao).getTime());

        if (horariosHoje.length === 0) return Infinity;
        return Math.min(...horariosHoje);
      };

      const ordenados = [...filtrados].sort(
        (a, b) => getProximoHorario(a) - getProximoHorario(b)
      );

      setLista(ordenados);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregar();
  }, []);

  const onTomar = async (horarioId: number) => {
    if (!confirm("Confirmar a tomada?")) return;
    try {
      await medicamentoApi.registrarTomada(horarioId);
      await carregar();
    } catch {
      alert("Erro ao registrar tomada.");
    }
  };

  const tarjaColor: Record<string, string> = {
    PRETA: "#000",
    VERMELHA: "#DB0012",
    AMARELA: "#DBC100",
    SEM_TARJA: "#1565C0",
  };

  return (
    <Box sx={{ py: 4, px: 2, display: "flex", justifyContent: "center" }}>
      
      {/* Notificação agora recebe TODOS os medicamentos */}
      <MedicationNotifier medicamentos={dadosOriginais} />

      <Card sx={{ width: "100%", maxWidth: 860, borderRadius: 2, boxShadow: 4 }}>
        <CardContent>
          
          {/* Cabeçalho */}
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
            <Box>
              <Typography sx={{ fontSize: 24, fontWeight: 700, color: "primary.main" }}>
                MEDICAMENTOS EM USO
              </Typography>

              <Typography
                sx={{
                  fontSize: 16,
                  color: "#444",
                  mt: 0.5,
                  textTransform: "capitalize",
                }}
              >
                {dataHojeUpper}
              </Typography>
            </Box>

            <Stack direction="row" spacing={1}>
              <Button variant="contained" startIcon={<HomeIcon />} onClick={() => navigate("/home")}>
                Home
              </Button>

              <Button
                variant="outlined"
                startIcon={<HistoryIcon />}
                onClick={() => navigate("/dose-certa/historico")}
              >
                Histórico
              </Button>

              <Button
                variant="contained"
                color="success"
                startIcon={<AddIcon />}
               onClick={() => navigate("/dose-certa/cadastro")}
              >
                Cadastrar
              </Button>
            </Stack>
          </Stack>

          {/* Lista */}
          {lista.length === 0 ? (
            <Typography sx={{ textAlign: "center", py: 5, fontSize: 18 }}>
              Nenhum medicamento para hoje ✨
            </Typography>
          ) : (
            <Stack spacing={2}>
              {lista.map((m) => {
                const horariosDeHoje = m.horarios.filter((h) => isToday(h.proximaExecucao));

                return (
                  <Box
                    key={m.id}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      backgroundColor: "#f9f9f9",
                      boxShadow: 1,
                    }}
                  >
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                      <Typography sx={{ fontSize: 18, fontWeight: 700 }}>{m.nome}</Typography>

                      <Stack direction="row" spacing={1} alignItems="center">
                        <Chip
                          label={m.tarja === "SEM_TARJA" ? "COMUM" : m.tarja}
                          size="small"
                          sx={{
                            bgcolor: tarjaColor[m.tarja],
                            color: "white",
                            fontWeight: 600,
                          }}
                        />

                        <IconButton onClick={() => navigate(`/dose-certa/editar/${m.id}`)}>
                          <EditIcon fontSize="small" />
                        </IconButton>

                        <IconButton
                          onClick={() => {
                            if (confirm("Deseja realmente remover este medicamento?")) {
                              medicamentoApi
                                .excluir(m.id)
                                .then(() => carregar())
                                .catch(() => alert("Erro ao remover medicamento."));
                            }
                          }}
                        >
                          <DeleteIcon color="error" fontSize="small" />
                        </IconButton>
                      </Stack>
                    </Stack>

                    <Divider sx={{ my: 1 }} />

                     {/* Alerta de estoque acabando */}
                    {(() => {
                      const alerta = getAlertaEstoque(m.diasRestantes);
                      if (!alerta) return null;
                      return (
                        <Alert
                          severity={alerta.cor}
                          icon={<WarningAmberIcon fontSize="small" />}
                          sx={{ mb: 1, py: 0.5, fontSize: 14, fontWeight: 600, borderRadius: 1 }}
                        >
                          {alerta.texto}
                        </Alert>
                      );
                    })()}
                    <Stack spacing={1}>
                      {horariosDeHoje.length === 0 ? (
                        <Typography sx={{ fontSize: 16, color: "text.secondary" }}>
                          Nenhum horário para hoje.
                        </Typography>
                      ) : (
                        horariosDeHoje.map((h) => (
                          <Stack
                            key={h.id}
                            direction="row"
                            alignItems="center"
                            justifyContent="space-between"
                          >
                            <Typography sx={{ fontSize: 18 }}>⏰ {h.horario}</Typography>

                            {h.tomadoHoje ? (
                              <Chip label="Tomado" color="success" size="small" />
                            ) : (
                              <Button
                                variant="outlined"
                                startIcon={<CheckCircleOutlineIcon />}
                                onClick={() => onTomar(h.id)}
                              >
                                Tomar
                              </Button>
                            )}
                          </Stack>
                        ))
                      )}
                    </Stack>
                  </Box>
                );
              })}
            </Stack>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
