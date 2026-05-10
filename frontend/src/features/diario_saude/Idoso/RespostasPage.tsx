// NÃO ESTA SENDO USADA POR NINGUEM ATE O MOMENTO

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Box, Typography, Stack, Paper, Divider, Chip } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import PageContainer from "../components/PageContainer";
import PageTitle from "../components/PageTitle";
import SectionTitle from "../components/SectionTitle";
import BackButton from "../components/BackButton";

import { questionarioApi } from "../api/questionarioApi";

export default function RespostasPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const origem = location.state?.origem;


  const usuarioLogado = (() => {
    try {
      return (
        JSON.parse(localStorage.getItem("usuario") || "null") ||
        JSON.parse(localStorage.getItem("user") || "null")
      );
    } catch {
      return null;
    }
  })();

  const paciente = location.state?.paciente;

  useEffect(() => {
    if (!usuarioLogado) {
      navigate("/login");
      return;
    }
    const role = usuarioLogado?.roleName ?? usuarioLogado?.role;
    if (role !== "ROLE_MEDICO") {
      navigate("/home");
      return;
    }
    if (!paciente) {
      navigate("/medico");
    }
  }, []);

  const pacienteId = paciente?.id_usuario;

  const {
    data: respostas = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["questionario", "respostas", pacienteId],
    queryFn: () => questionarioApi.obterRespostas(pacienteId),
    refetchOnWindowFocus: false,
    enabled: !!pacienteId,
  });

  if (!usuarioLogado || !paciente) return null;

  if (isLoading) {
    return (
      <PageContainer>
        <BackButton />
        <Typography>Carregando respostas...</Typography>
      </PageContainer>
    );
  }

  if (isError) {
    return (
      <PageContainer>
        <BackButton />
        <Typography color="error">Erro ao carregar respostas.</Typography>
        <Typography
          sx={{ cursor: "pointer", textDecoration: "underline", mt: 1 }}
          onClick={() => refetch()}
        >
          Tentar novamente
        </Typography>
      </PageContainer>
    );
  }

  if (respostas.length === 0) {
    return (
      <PageContainer>
        <BackButton />
        <PageTitle>Questionário de Saúde</PageTitle>
        <Typography color="text.secondary">
          O paciente <strong>{paciente.nome}</strong> ainda não respondeu o questionário.
        </Typography>
      </PageContainer>
    );
  }

  const respostasOrdenadas = respostas.slice().sort((a, b) => a.perguntaId - b.perguntaId);
  const pontuacaoTotal = respostasOrdenadas.reduce((acc, r) => acc + r.peso, 0);

  const classificacao = (() => {
    if (pontuacaoTotal <= 6)
      return { label: "Robusto", color: "#2e7d32", descricao: "Baixa vulnerabilidade clínico-funcional." };
    if (pontuacaoTotal <= 14)
      return { label: "Em risco", color: "#f57c00", descricao: "Vulnerabilidade leve — atenção recomendada." };
    if (pontuacaoTotal <= 20)
      return { label: "Moderadamente frágil", color: "#e65100", descricao: "Vulnerabilidade moderada." };
    return { label: "Altamente frágil", color: "#c62828", descricao: "Alta vulnerabilidade clínico-funcional." };
  })();

  return (
    <PageContainer>
      <BackButton />
      <PageTitle>Questionário de Saúde</PageTitle>

      {/* Cabeçalho com paciente e pontuação */}
      <Paper elevation={2} sx={{ p: 3, borderRadius: 3, mb: 3 }}>
        <Typography variant="subtitle1" color="text.secondary" mb={1}>
          Paciente
        </Typography>
        <Typography variant="h6" fontWeight={700} mb={2}>
          {paciente.nome}
        </Typography>

        <Divider sx={{ mb: 2 }} />

        <Typography variant="subtitle1" color="text.secondary" mb={1}>
          Pontuação total
        </Typography>
        <Typography variant="h3" fontWeight={800} sx={{ color: classificacao.color }}>
          {pontuacaoTotal}
        </Typography>
        <Chip
          label={classificacao.label}
          sx={{
            mt: 1,
            mb: 0.5,
            bgcolor: classificacao.color,
            color: "white",
            fontWeight: 700,
            fontSize: 14,
          }}
        />
        <Typography variant="body2" color="text.secondary" mt={1}>
          {classificacao.descricao}
        </Typography>
      </Paper>

      {/* Lista de respostas */}
      <SectionTitle>Respostas ({respostasOrdenadas.length} perguntas)</SectionTitle>

      <Stack spacing={2} mt={2}>
        {respostasOrdenadas.map((r: any, idx) => (
          <Paper
            key={`${r.perguntaId}-${idx}`}
            elevation={1}
            sx={{ p: 2.5, borderRadius: 2, borderLeft: `4px solid ${r.peso > 0 ? "#f57c00" : "#2e7d32"}` }}
          >
            <Typography variant="caption" color="text.secondary">
              Pergunta {idx + 1}
            </Typography>
            <Typography fontWeight={600} mb={1}>
              {r.perguntaTexto || r.pergunta?.texto || "Pergunta não encontrada"}
            </Typography>
            <Typography mb={0.5}>
              <strong>Resposta:</strong> {r.resposta}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Peso:</strong> {r.peso}
            </Typography>
          </Paper>
        ))}
      </Stack>
    </PageContainer>
  );
}