import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Container,
  Toolbar,
  Button,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import { deepPurple } from '@mui/material/colors';
import { Outlet, Link as RouterLink, useNavigate } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import logo_unati_horizontal from '../assets/logo_unati_horizontal.png';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { setAuthToken } from '@/lib/http';
import { GlobalAlertListener, GlobalMessageListener } from '@/features/carehub';
import { useQuery } from '@tanstack/react-query';
import { sugestoesApi } from '@/features/duvidas/api/sugestoes';
import { adminUsersApi } from '@/features/admin/api/users';

export default function AppLayout() {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState<{ id: number | null; name: string; username: string }>({
    id: null,
    name: '',
    username: '',
  });
  const [userRole, setUserRole] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('user');
      if (!raw) return;
      const parsed = JSON.parse(raw);
      setUserInfo({
        id: parsed?.userId ?? null,
        name: parsed?.name ?? '',
        username: parsed?.username ?? '',
      });
      setUserRole(parsed?.roleCode || parsed?.roleName || null);
    } catch {
      // ignore parse errors
    }
  }, []);

  const userInitial = useMemo(() => {
    const name = userInfo.name?.trim();
    if (name) return name.charAt(0).toUpperCase();
    const username = userInfo.username?.trim();
    if (username) return username.charAt(0).toUpperCase();
    return 'U';
  }, [userInfo.name, userInfo.username]);

  // Notificação de sugestões não lidas (apenas para admin)
  const isAdmin = userRole?.toUpperCase().includes('ADMIN') ?? false;
  const { data: naoLidasCount } = useQuery({
    queryKey: ['admin', 'sugestoes-count'],
    queryFn: sugestoesApi.contarNaoLidas,
    enabled: isAdmin,
    refetchInterval: 60_000,
  });

  // Busca as informações do perfil (incluindo foto) do usuário logado
  const { data: userProfile } = useQuery({
    queryKey: ['user-profile', userInfo.id],
    queryFn: () => adminUsersApi.porId(userInfo.id as number),
    enabled: !!userInfo.id,
    staleTime: 5 * 60 * 1000,
  });

  function handleOpenMenu(e: React.MouseEvent<HTMLElement>) {
    setAnchorEl(e.currentTarget);
  }
  function handleCloseMenu() {
    setAnchorEl(null);
  }
  function handleEditProfile() {
    handleCloseMenu();
    navigate('/perfil');
  }
  function handleLogout() {
    handleCloseMenu();
    setAuthToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/', { replace: true });
  }

  return (
    <Box sx={{ minHeight: '100dvh', bgcolor: 'background.default' }}>
      <AppBar
        position="fixed"
        elevation={0}
        color="transparent"
        sx={{
          borderBottom: '1px solid #e5eaf2',
          backdropFilter: 'blur(8px)',
          bgcolor: 'rgba(255,255,255,0.85)',
        }}
      >
        <Toolbar>
          <Box component={RouterLink as any} to="/home" sx={{ display: 'inline-flex', alignItems: 'center', mr: 2 }}>
            <Box component="img" src={logo_unati_horizontal} alt="Logo UNATI" sx={{ height: 48 }} />
          </Box>
          <Box sx={{ flex: 1 }} />

          {/* Sino de notificações — visível apenas para admin */}
          {isAdmin && (
            <IconButton
              component={RouterLink as any}
              to="/admin/duvidas"
              sx={{ mr: 1 }}
              title="Mensagens e sugestões"
            >
              <Badge
                badgeContent={naoLidasCount ?? 0}
                color="error"
                max={99}
              >
                <NotificationsIcon />
              </Badge>
            </IconButton>
          )}
          
         {/* Botão para area de administrador — liberado para todos os usuários (demo) */}
         {(
          <Button
            variant="outlined"
            color="primary"
            component={RouterLink as any}
            to="/admin"
            sx={{ mr: 2 }}
          >
            Área do administrador
          </Button>
         )}

          <Avatar
            src={userProfile?.photoUrl || undefined}
            sx={{
              bgcolor: deepPurple[500],
              cursor: 'pointer',
            }}
            onClick={handleOpenMenu}
          >
            {userInitial}
          </Avatar>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleCloseMenu} keepMounted>
            <MenuItem onClick={handleEditProfile}>Meu perfil</MenuItem>
            <MenuItem onClick={handleLogout}>Sair</MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Toolbar />

      <Container sx={{ py: 3 }}>
        <Outlet />
      </Container>

      {userRole && userRole.toUpperCase().includes('CUIDADOR') && (
        <GlobalAlertListener />
      )}

      {userRole && (
        <GlobalMessageListener />
      )}
    </Box>
  );
}
