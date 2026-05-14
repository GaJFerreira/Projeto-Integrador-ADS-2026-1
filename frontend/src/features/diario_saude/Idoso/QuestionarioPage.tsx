import { useState, useEffect, useRef } from "react";
import {
  Box, Button, Typography, Stack, Collapse,
  Paper, Divider, CircularProgress, Container, Chip, LinearProgress,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import AssignmentIcon from "@mui/icons-material/Assignment";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { questionarioApi } from "../api/questionarioApi";
import type { Opcao, Pergunta, RespostaDTO } from "../api/types";

export default function QuestionarioPage() {
  const navigate = useNavigate();

  const [indiceAtual, setIndiceAtual] = useState(0);
  const [respostas, setRespostas] = useState<RespostaDTO[]>([]);
  const [showDebug, setShowDebug] = useState(false);
  const [refazendo, setRefazendo] = useState(false);
  const respondendoRef = useRef(false);

  const usuario = (() => {
    try {
      return (
        JSON.parse(localStorage.getItem("usuario") || "null") ||
        JSON.parse(localStorage.getItem("user") || "null")
      );
    } catch { return null; }
  })();

  const usuarioId = usuario?.id_usuario ?? usuario?.userId;

  useEffect(() => {
    if (!usuario) navigate("/login");
  }, []);

  const { data: respostasExistentes, isLoading: isLoadingRespostas } = useQuery({
    queryKey: ["questionario", "respostas", usuarioId],
    queryFn: () => questionarioApi.obterRespostas(usuarioId),
    refetchOnWindowFocus: false,
    enabled: !!usuarioId,
  });

  const jaRespondeu =
    !isLoadingRespostas &&
    respostasExistentes !== undefined &&
    respostasExistentes.length > 0;

  const deveCarregarPerguntas =
    !!usuarioId && !isLoadingRespostas && (!jaRespondeu || refazendo);

  const { data: perguntas, isLoading: isLoadingPerguntas, isError, refetch } = useQuery({
    queryKey: ["questionario", "perguntas"],
    queryFn: questionarioApi.listarPerguntas,
    refetchOnWindowFocus: false,
    enabled: deveCarregarPerguntas,
  });

  const enviarMutation = useMutation({
    mutationFn: (resps: RespostaDTO[]) =>
      questionarioApi.enviarRespostas(usuarioId, resps),
    onSuccess: (retorno) => {
      alert(`Questionário finalizado! Pontuação: ${retorno.pontuacao}`);
      navigate(0);
    },
    onError: (err: any) => {
      respondendoRef.current = false;
      console.error("Erro ao enviar respostas:", err);
      alert("Erro ao enviar respostas. Veja o console.");
    },
  });

  if (!usuario) return null;

  const dataHoje = new Date().toLocaleDateString("pt-BR");

  // ── Cabeçalho padrão ────────────────────────────────────────
  const Cabecalho = () => (
    <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 3, borderTop: "4px solid #1976d2" }}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box display="flex" alignItems="center" gap={1.5}>
          <AssignmentIcon sx={{ fontSize: 36, color: "#1976d2" }} />
          <Box>
            <Typography variant="h5" fontWeight={700} color="#1976d2">
              QUESTIONÁRIO DE SAÚDE
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Plataforma UNATI — Diário da Saúde
            </Typography>
          </Box>
        </Box>
        <Button onClick={() => navigate("/saude")} sx={{ textTransform: "none" }}>
          Voltar
        </Button>
      </Box>
    </Paper>
  );

  // ── Carregando histórico ────────────────────────────────────
  if (isLoadingRespostas) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Cabecalho />
        <Paper elevation={2} sx={{ p: 4, borderRadius: 3, textAlign: "center" }}>
          <CircularProgress size={32} />
          <Typography mt={2} color="text.secondary">Carregando seu histórico...</Typography>
        </Paper>
      </Container>
    );
  }

  // ── Já respondeu ────────────────────────────────────────────
  if (jaRespondeu && !refazendo) {
    const pontuacaoAtual = respostasExistentes!.reduce((acc, r) => acc + (r.peso ?? 0), 0);

    const classificacao = (() => {
      if (pontuacaoAtual <= 3) return { label: "Robusto", color: "#2e7d32", descricao: "Sem fragilidade detectada." };
      if (pontuacaoAtual <= 7) return { label: "Pré-frágil", color: "#f57c00", descricao: "Atenção recomendada." };
      return { label: "Frágil", color: "#c62828", descricao: "Acompanhamento necessário." };
    })();

    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Cabecalho />

        <Paper elevation={2} sx={{ p: 4, borderRadius: 3 }}>
          {/* Info do usuário */}
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, mb: 3, p: 2, bgcolor: "#f0f4ff", borderRadius: 2 }}>
            <Box>
              <Typography variant="caption" color="text.secondary">Paciente</Typography>
              <Typography fontWeight={700} fontSize="1rem">
                {usuario?.name ?? usuario?.nome ?? "—"}
              </Typography>
            </Box>
            <Box textAlign="right">
              <Typography variant="caption" color="text.secondary">Data</Typography>
              <Typography fontWeight={700} fontSize="1rem">{dataHoje}</Typography>
            </Box>
          </Box>

          <Divider sx={{ mb: 3 }} />

          <Box textAlign="center">
            <CheckCircleOutlineIcon sx={{ fontSize: 64, color: classificacao.color, mb: 1 }} />
            <Typography variant="h5" fontWeight={700} mb={2}>
              Questionário já respondido
            </Typography>

            <Typography variant="body1" color="text.secondary" mb={1}>
              Sua pontuação atual
            </Typography>
            <Typography variant="h2" fontWeight={800} sx={{ color: classificacao.color }}>
              {pontuacaoAtual}
            </Typography>
            <Chip
              label={classificacao.label}
              sx={{ mt: 1, mb: 0.5, bgcolor: classificacao.color, color: "white", fontWeight: 700, fontSize: 14 }}
            />
            <Typography variant="body2" color="text.secondary" mt={1} mb={3}>
              {classificacao.descricao}
            </Typography>

            <Divider sx={{ mb: 2 }} />

            <Typography variant="body2" color="text.secondary" mb={3}>
              {respostasExistentes!.length} perguntas respondidas
            </Typography>

            <Stack spacing={2} direction={{ xs: "column", sm: "row" }} justifyContent="center">
              <Button
                variant="outlined"
                size="large"
                sx={{ borderRadius: 2, px: 4 }}
                onClick={() => navigate("/saude")}
              >
                Voltar
              </Button>
              <Button
                variant="contained"
                size="large"
                sx={{ borderRadius: 2, px: 4 }}
                onClick={() => {
                  setRefazendo(true);
                  setIndiceAtual(0);
                  setRespostas([]);
                  respondendoRef.current = false;
                }}
              >
                Refazer questionário
              </Button>
            </Stack>
          </Box>
        </Paper>
      </Container>
    );
  }

  // ── Carregando perguntas ────────────────────────────────────
  if (isLoadingPerguntas) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Cabecalho />
        <Paper elevation={2} sx={{ p: 4, borderRadius: 3, textAlign: "center" }}>
          <CircularProgress size={32} />
          <Typography mt={2} color="text.secondary">Carregando questionário...</Typography>
        </Paper>
      </Container>
    );
  }

  if (isError) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Cabecalho />
        <Paper elevation={2} sx={{ p: 4, borderRadius: 3 }}>
          <Typography color="error" mb={2}>Erro ao carregar perguntas.</Typography>
          <Button variant="outlined" onClick={() => refetch()}>Tentar novamente</Button>
        </Paper>
      </Container>
    );
  }

  if (!perguntas || perguntas.length === 0) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Cabecalho />
        <Paper elevation={2} sx={{ p: 4, borderRadius: 3 }}>
          <Typography color="text.secondary">Nenhuma pergunta disponível no questionário.</Typography>
        </Paper>
      </Container>
    );
  }

  const perguntaAtual: Pergunta | undefined = perguntas[indiceAtual];

  if (!perguntaAtual) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Cabecalho />
        <Paper elevation={2} sx={{ p: 4, borderRadius: 3 }}>
          <Typography>Questionário concluído ou pergunta inválida.</Typography>
        </Paper>
      </Container>
    );
  }

  const handleResponder = (opcao: Opcao) => {
    if (respondendoRef.current) return;
    respondendoRef.current = true;

    const nova: RespostaDTO = {
      perguntaId: perguntaAtual.id,
      resposta: opcao.texto,
      peso: opcao.peso,
    };

    const semDuplicata = respostas.filter((r) => r.perguntaId !== perguntaAtual.id);
    const novas = [...semDuplicata, nova];
    setRespostas(novas);

    const ultima = indiceAtual === perguntas.length - 1;
    if (ultima) {
      enviarMutation.mutate(novas);
    } else {
      respondendoRef.current = false;
      setIndiceAtual((n) => n + 1);
    }
  };

  const bloqueado = enviarMutation.isLoading || respondendoRef.current;
  const progresso = Math.round((indiceAtual / perguntas.length) * 100);

  // ── Questionário ────────────────────────────────────────────
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Cabecalho />

      <Paper elevation={2} sx={{ p: 4, borderRadius: 3 }}>

        {/* Info do usuário */}
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, mb: 3, p: 2, bgcolor: "#f0f4ff", borderRadius: 2 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">Paciente</Typography>
            <Typography fontWeight={700} fontSize="1rem">
              {usuario?.name ?? usuario?.nome ?? "—"}
            </Typography>
          </Box>
          <Box textAlign="right">
            <Typography variant="caption" color="text.secondary">Data</Typography>
            <Typography fontWeight={700} fontSize="1rem">{dataHoje}</Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Progresso */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Box display="flex" alignItems="center" gap={1}>
            <AssignmentIcon fontSize="small" sx={{ color: "#1976d2" }} />
            <Typography variant="h6" fontWeight={600}>
              Pergunta {indiceAtual + 1} de {perguntas.length}
            </Typography>
          </Box>
          <Chip
            label={`${progresso}% concluído`}
            size="small"
            color="primary"
            variant="outlined"
          />
        </Box>

        <LinearProgress
          variant="determinate"
          value={progresso}
          sx={{ mb: 3, borderRadius: 2, height: 6 }}
        />

        {/* Pergunta */}
        <Paper
          elevation={0}
          sx={{ p: 3, mb: 3, borderRadius: 2, border: "1px solid #e0e0e0", borderLeft: "4px solid #1976d2" }}
        >
          <Typography variant="h6" fontWeight={600}>
            {perguntaAtual.texto || "— (pergunta sem texto) —"}
          </Typography>
        </Paper>

        {/* Opções */}
        {perguntaAtual.opcoes.length === 0 ? (
          <Box>
            <Typography color="text.secondary" mb={2}>
              Esta pergunta não possui opções reconhecíveis pelo cliente.
            </Typography>
            <Button variant="outlined" onClick={() => setShowDebug((s) => !s)}>
              {showDebug ? "Ocultar debug" : "Mostrar debug"}
            </Button>
            <Collapse in={showDebug}>
              <Box mt={2} sx={{ whiteSpace: "pre-wrap", fontFamily: "monospace", fontSize: 13, p: 2, bgcolor: "#f5f5f5", borderRadius: 2 }}>
                {JSON.stringify(perguntaAtual, null, 2)}
              </Box>
            </Collapse>
          </Box>
        ) : (
          <Stack spacing={1.5}>
            {perguntaAtual.opcoes.map((op, idx) => (
              <Button
                key={idx}
                variant="outlined"
                fullWidth
                sx={{
                  borderRadius: 2, py: 1.5, textAlign: "left", justifyContent: "flex-start",
                  fontWeight: 500, fontSize: "1rem",
                  "&:hover": { bgcolor: "#e3f2fd", borderColor: "#1976d2" },
                }}
                onClick={() => handleResponder(op)}
                disabled={bloqueado}
              >
                {op.texto}
              </Button>
            ))}
          </Stack>
        )}

        <Divider sx={{ mt: 3, mb: 2 }} />

        <Typography variant="body2" color="text.secondary" textAlign="center">
          {respostas.length} de {perguntas.length} respostas registradas
        </Typography>
      </Paper>
    </Container>
  );
}