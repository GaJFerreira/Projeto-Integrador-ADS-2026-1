import {
  Box,
  Button,
  Container,
  Divider,
  IconButton,
  InputAdornment,
  Stack,
  Switch,
  TextField,
  Typography,
  Avatar,
} from '@mui/material';
import { deepPurple } from '@mui/material/colors';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import PersonIcon from '@mui/icons-material/Person';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { adminUsersApi, type UpdateUserPayload } from '@/features/admin/api/users';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [userRole, setUserRole] = useState<string | null>(null);

  const userInfo = useMemo(() => {
    try {
      const raw = localStorage.getItem('user');
      if (!raw) return { id: null as number | null, name: '', username: '' };
      const parsed = JSON.parse(raw);
      setUserRole(parsed?.roleCode || parsed?.roleName || null);
      return {
        id: parsed?.userId ?? null,
        name: parsed?.name ?? '',
        username: parsed?.username ?? '',
      };
    } catch {
      return { id: null as number | null, name: '', username: '' };
    }
  }, []);

  const isMedico = userRole?.toUpperCase().includes('MEDICO') ?? false;
  const isCuidador = userRole?.toUpperCase().includes('CUIDADOR') ?? false;

  const userInitial = useMemo(() => {
    const name = userInfo.name?.trim();
    if (name) return name.charAt(0).toUpperCase();
    const username = userInfo.username?.trim();
    if (username) return username.charAt(0).toUpperCase();
    return 'U';
  }, [userInfo]);

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<UpdateUserPayload>({
    name: '',
    username: '',
    email: '',
    phone: '',
    birthDate: '',
    photoUrl: '',
    crm: '',
    certificacao: '',
    experiencia: '',
  });
  const [changePassword, setChangePassword] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (userInfo.id) loadProfile();
  }, [userInfo.id]);

  async function loadProfile() {
    if (!userInfo.id) return;
    setLoading(true);
    try {
      const data = await adminUsersApi.porId(userInfo.id);
      let parsedBirthDate = '';
      if (data.birthDate) {
        if (Array.isArray(data.birthDate)) {
          const [y, m, d] = data.birthDate;
          parsedBirthDate = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        } else {
          const dateStr = String(data.birthDate).substring(0, 10);
          // Se for no formato DD/MM/YYYY, converte para YYYY-MM-DD
          if (dateStr.includes('/')) {
            const [d, m, y] = dateStr.split('/');
            parsedBirthDate = `${y}-${m}-${d}`;
          } else {
            parsedBirthDate = dateStr;
          }
        }
      }

      setForm({
        name: data.name || '',
        username: data.username || '',
        email: data.email || '',
        phone: data.phone || '',
        birthDate: parsedBirthDate,
        photoUrl: data.photoUrl || '',
        crm: data.crm || '',
        certificacao: data.certificacao || '',
        experiencia: data.experiencia || '',
      });
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Erro ao carregar perfil.';
      enqueueSnackbar(msg, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }

  function handleChange<K extends keyof UpdateUserPayload>(key: K, value: UpdateUserPayload[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!userInfo.id) return;

    if (changePassword) {
      if (!password || !confirmPassword) {
        enqueueSnackbar('Informe a senha e a confirmação.', { variant: 'warning' });
        return;
      }
      if (password !== confirmPassword) {
        enqueueSnackbar('As senhas não conferem.', { variant: 'warning' });
        return;
      }
    }

    setLoading(true);
    try {
      const payload: UpdateUserPayload = { ...form };
      if (changePassword) payload.password = password;
      await adminUsersApi.atualizar(userInfo.id, payload);
      enqueueSnackbar('Perfil atualizado com sucesso!', { variant: 'success' });
      navigate(-1);
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Erro ao salvar perfil.';
      enqueueSnackbar(msg, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      {/* Cabeçalho */}
      <Stack direction="row" alignItems="center" spacing={1} mb={4}>
        <IconButton onClick={() => navigate(-1)} aria-label="Voltar">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" fontWeight={700}>
          Meu Perfil
        </Typography>
      </Stack>

      {/* Avatar */}
      <Stack alignItems="center" mb={4}>
        <Avatar
          src={form.photoUrl || undefined}
          sx={{
            bgcolor: deepPurple[500],
            width: 80,
            height: 80,
            fontSize: '2rem',
            mb: 1,
          }}
        >
          {!form.photoUrl && userInitial}
        </Avatar>
        <Typography variant="h6" fontWeight={600}>
          {form.name || userInfo.name || '—'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {form.email || '—'}
        </Typography>
      </Stack>

      <Divider sx={{ mb: 3 }} />

      {/* Formulário */}
      <Box component="form" onSubmit={handleSave} noValidate>
        <Stack spacing={2.5}>
          <Typography variant="subtitle1" fontWeight={600} color="text.secondary">
            <PersonIcon sx={{ verticalAlign: 'middle', mr: 0.5, fontSize: 18 }} />
            Informações pessoais
          </Typography>

          <TextField
            label="Nome"
            value={form.name}
            onChange={(e) => handleChange('name', e.target.value)}
            required
            fullWidth
            disabled={loading}
          />
          <TextField
            label="Username"
            value={form.username}
            onChange={(e) => handleChange('username', e.target.value)}
            required
            fullWidth
            disabled={loading}
          />
          <TextField
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => handleChange('email', e.target.value)}
            required
            fullWidth
            disabled={loading}
          />

          <TextField
            label="Telefone"
            value={form.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            fullWidth
            disabled={loading}
          />
          <TextField
            label="Data de Nascimento"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={form.birthDate}
            onChange={(e) => handleChange('birthDate', e.target.value)}
            fullWidth
            disabled={loading}
          />
          <TextField
            label="URL da Foto de Perfil"
            placeholder="https://exemplo.com/foto.jpg"
            value={form.photoUrl}
            onChange={(e) => handleChange('photoUrl', e.target.value)}
            fullWidth
            disabled={loading}
            helperText="Cole um link de uma imagem para usar como foto de perfil"
          />

          {/* Campos específicos por tipo de usuário */}
          {isMedico && (
            <TextField
              label="CRM (médico)"
              value={form.crm}
              onChange={(e) => handleChange('crm', e.target.value)}
              fullWidth
              disabled={loading}
              required
            />
          )}
          {isCuidador && (
            <>
              <TextField
                label="Certificação (cuidador)"
                value={form.certificacao}
                onChange={(e) => handleChange('certificacao', e.target.value)}
                fullWidth
                disabled={loading}
                required
              />
              <TextField
                label="Experiência (cuidador)"
                value={form.experiencia}
                onChange={(e) => handleChange('experiencia', e.target.value)}
                fullWidth
                disabled={loading}
                required
              />
            </>
          )}

          <Divider />

          {/* Alterar senha */}
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Switch
              checked={changePassword}
              onChange={() =>
                setChangePassword((v) => {
                  if (!v) {
                    setPassword('');
                    setConfirmPassword('');
                  }
                  return !v;
                })
              }
              color="primary"
              disabled={loading}
            />
            <Typography variant="body1">Alterar senha</Typography>
          </Stack>

          {changePassword && (
            <>
              <TextField
                label="Nova senha"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
                disabled={loading}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPassword((v) => !v)} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                label="Confirme a nova senha"
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                fullWidth
                disabled={loading}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowConfirm((v) => !v)} edge="end">
                        {showConfirm ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </>
          )}

          <Stack direction="row" spacing={1.5} pt={1}>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => navigate(-1)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
            >
              {loading ? 'Salvando...' : 'Salvar alterações'}
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Container>
  );
}
