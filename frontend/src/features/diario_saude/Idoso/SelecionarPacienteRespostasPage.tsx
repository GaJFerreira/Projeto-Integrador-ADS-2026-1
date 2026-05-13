import { useState } from "react";
import {
  Typography, TextField, Button,
  Paper, Stack, CircularProgress, Alert
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import PageContainer from "../components/PageContainer";
import PageTitle from "../components/PageTitle";
import BackButton from "../components/BackButton";
import { usuarioApi } from "../api/usuarioApi";

export default function MedicoRespostasQuestionarioPage() {
  const navigate = useNavigate();
  const [busca, setBusca] = useState("");

  const { data: pacientes = [], isLoading, isError } = useQuery({
    queryKey: ["pacientes"],
    queryFn: usuarioApi.listarPacientes,
    refetchOnWindowFocus: false,
  });

  const pacientesFiltrados = pacientes.filter((p: any) =>
    p.nome?.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <PageContainer>
      <BackButton to="/saude" />
      <PageTitle>Questionários dos Pacientes</PageTitle>

      <TextField
        fullWidth
        placeholder="Buscar paciente pelo nome..."
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        sx={{ mb: 3 }}
      />

      {isLoading && <CircularProgress />}

      {isError && (
        <Alert severity="error">Erro ao carregar pacientes. Tente novamente.</Alert>
      )}

      <Stack spacing={2}>
        {pacientesFiltrados.map((paciente: any) => (
          <Paper
            key={paciente.id_usuario}
            elevation={1}
            sx={{
              p: 2, borderRadius: 2,
              display: "flex", justifyContent: "space-between", alignItems: "center"
            }}
          >
            <div>
              <Typography fontWeight={600}>{paciente.nome}</Typography>
              <Typography variant="body2" color="text.secondary">{paciente.email}</Typography>
            </div>
            <Button
              variant="contained"
              onClick={() => navigate("/respostas_questionario", { state: { paciente } })}
            >
              Ver respostas
            </Button>
          </Paper>
        ))}

        {!isLoading && !isError && pacientesFiltrados.length === 0 && (
          <Typography color="text.secondary">
            {busca ? "Nenhum paciente encontrado para essa busca." : "Nenhum paciente cadastrado."}
          </Typography>
        )}
      </Stack>
    </PageContainer>
  );
}