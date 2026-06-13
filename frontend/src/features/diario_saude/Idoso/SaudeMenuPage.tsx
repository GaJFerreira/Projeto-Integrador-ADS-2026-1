import { Container, Paper, Typography, Box, Avatar, Chip } from "@mui/material";
import { ModuleGridSaude } from "../components/ModuleGridSaude";
import FavoriteIcon from "@mui/icons-material/Favorite";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import PersonIcon from "@mui/icons-material/Person";

function getSaudacao(): string {
  const hora = new Date().getHours();
  if (hora < 12) return "Bom dia";
  if (hora < 18) return "Boa tarde";
  return "Boa noite";
}

function getRoleInfo(role: string): { label: string; color: string; bgcolor: string; icon: React.ReactNode } {
  if (role === "ROLE_MEDICO") return {
    label: "Médico",
    color: "#1565c0",
    bgcolor: "#e3f2fd",
    icon: <LocalHospitalIcon sx={{ fontSize: 14 }} />,
  };
  if (role === "ROLE_ADMIN") return {
    label: "Administrador",
    color: "#6a1b9a",
    bgcolor: "#f3e5f5",
    icon: <AdminPanelSettingsIcon sx={{ fontSize: 14 }} />,
  };
  if (role === "ROLE_CUIDADOR") return {
    label: "Cuidador",
    color: "#00796b",
    bgcolor: "#e0f2f1",
    icon: <FavoriteIcon sx={{ fontSize: 14 }} />,
  };
  return {
    label: "Paciente",
    color: "#2e7d32",
    bgcolor: "#e8f5e9",
    icon: <PersonIcon sx={{ fontSize: 14 }} />,
  };
}

function getMensagem(role: string, nome: string): string {
  const primeiro = nome?.split(" ")[0] ?? nome;
  if (role === "ROLE_MEDICO") return `Pronto para atender seus pacientes hoje, Dr(a). ${primeiro}?`;
  if (role === "ROLE_ADMIN") return `Gerencie o sistema com segurança, ${primeiro}.`;
  if (role === "ROLE_CUIDADOR") return `Seus pacientes estão aguardando seus cuidados, ${primeiro}.`;
  return `Cuide bem da sua saúde, ${primeiro}. Estamos aqui para ajudar!`;
}

export default function SaudeMenuPage() {
  const usuario = (() => {
    try {
      return JSON.parse(localStorage.getItem("usuario") || "null") ||
        JSON.parse(localStorage.getItem("user") || "null");
    } catch { return null; }
  })();

  const nome = usuario?.name ?? usuario?.nome ?? "Usuário";
  const role = usuario?.roleName ?? usuario?.role ?? "";
  const inicial = nome[0]?.toUpperCase() ?? "U";
  const saudacao = getSaudacao();
  const roleInfo = getRoleInfo(role);
  const mensagem = getMensagem(role, nome);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>

      {/* Banner de boas-vindas */}
      <Paper
        elevation={0}
        sx={{
          mb: 3, p: 3, borderRadius: 3,
          background: "linear-gradient(135deg, #1565c0 0%, #1976d2 60%, #42a5f5 100%)",
          color: "#fff",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Círculos decorativos */}
        <Box sx={{
          position: "absolute", top: -30, right: -30,
          width: 120, height: 120, borderRadius: "50%",
          bgcolor: "rgba(255,255,255,0.08)",
        }} />
        <Box sx={{
          position: "absolute", bottom: -20, right: 60,
          width: 80, height: 80, borderRadius: "50%",
          bgcolor: "rgba(255,255,255,0.06)",
        }} />

        <Box display="flex" alignItems="center" gap={2} position="relative">
          <Avatar sx={{
            width: 56, height: 56,
            bgcolor: "rgba(255,255,255,0.2)",
            border: "2px solid rgba(255,255,255,0.4)",
            fontSize: "1.4rem", fontWeight: 700,
          }}>
            {inicial}
          </Avatar>
          <Box flex={1}>
            <Box display="flex" alignItems="center" gap={1} mb={0.3}>
              <Typography variant="body2" sx={{ opacity: 0.85 }}>
                {saudacao},
              </Typography>
              <Chip
                icon={roleInfo.icon}
                label={roleInfo.label}
                size="small"
                sx={{
                  bgcolor: "rgba(255,255,255,0.2)",
                  color: "#fff",
                  border: "1px solid rgba(255,255,255,0.3)",
                  fontSize: "0.7rem",
                  height: 20,
                  "& .MuiChip-icon": { color: "#fff" },
                }}
              />
            </Box>
            <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.2 }}>
              {nome}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.8, mt: 0.5, fontSize: "0.85rem" }}>
              {mensagem}
            </Typography>
          </Box>
          <FavoriteIcon sx={{ fontSize: 32, opacity: 0.3, flexShrink: 0 }} />
        </Box>
      </Paper>

      {/* Grid de módulos */}
      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: "1px solid #e8eaf6" }}>
        <Box display="flex" alignItems="center" gap={1} mb={3}>
          <LocalHospitalIcon sx={{ color: "#1565c0", fontSize: 22 }} />
          <Typography variant="h6" fontWeight={700} color="#1565c0">
            Módulos disponíveis
          </Typography>
        </Box>
        <ModuleGridSaude />
      </Paper>

    </Container>
  );
}