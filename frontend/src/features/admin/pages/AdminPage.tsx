import { Box, Container, Grid, Typography } from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import BiotechIcon from '@mui/icons-material/Biotech';
import InboxIcon from '@mui/icons-material/Inbox';
import LiveHelpIcon from '@mui/icons-material/LiveHelp';
import AdminModuleCard from '../components/AdminModuleCard';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

export default function AdminPage() {
  return (
    <Container sx={{ py: 3 }}>
      <Box mb={2}>
        <Typography variant="h2" gutterBottom>
          Area do Administrador
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Listagens e areas de gerenciamento
        </Typography>
      </Box>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <AdminModuleCard
            title="Usuarios"
            description="Gerenciar usuarios do sistema"
            to="/admin/usuarios"
            icon={<GroupIcon color="primary" fontSize="large" />}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <AdminModuleCard
            title="Produtos"
            description="Cadastrar produtos da lista de compras (nutricao e custo medio)"
            to="/admin/produtos"
            icon={<Inventory2Icon color="primary" fontSize="large" />}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <AdminModuleCard
            title="Conquistas"
            description="Cadastrar conquistas do sistema para o modulo Remember"
            to="/admin/conquistas"
            icon={<EmojiEventsIcon color="primary" fontSize="large" />}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <AdminModuleCard
            title="Mensagens e Sugestões"
            description="Ver dúvidas e sugestões enviadas pelos usuários"
            to="/admin/duvidas"
            icon={<InboxIcon color="primary" fontSize="large" />}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <AdminModuleCard
            title="Gerenciar FAQ"
            description="Cadastrar perguntas frequentes por módulo"
            to="/admin/faqs"
            icon={<LiveHelpIcon color="primary" fontSize="large" />}
          />
        </Grid>
      </Grid>
    </Container>
  );
}

