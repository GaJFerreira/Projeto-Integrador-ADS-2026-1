import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  InputAdornment,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import http from '../libHttp';
import { initializeAuthToken } from '../components/auth';
import { useNavigate } from 'react-router-dom';

type PerfilResponse = {
  platformUserId?: number;
  role?: string;
  name?: string;
  email?: string;
  phone?: string;
  endereco?: string;
  necessidades?: string;
  contatoEmergencia?: string;
  experiencia?: string;
  cidade?: string;
  estado?: string;
  taxaHora?: number;
  especialidades?: string[];
};

function formatarTelefone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits.length ? `(${digits}` : '';
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export default function CareHubPrimeiroAcessoPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [novaEspecialidade, setNovaEspecialidade] = useState('');
  const [isCuidador, setIsCuidador] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    endereco: '',
    necessidades: '',
    contatoEmergencia: '',
    experiencia: '',
    cidade: '',
    estado: '',
    taxaHora: '',
    biografia: '',
    especialidades: [] as string[]
  });

  useEffect(() => {
    const carregar = async () => {
      await initializeAuthToken();
      try {
        const { data } = await http.get<PerfilResponse>('/api/carehub/perfil');
        const role = (data?.role || '').toUpperCase();
        const cuidador = role.includes('CUIDADOR');
        setIsCuidador(cuidador);

        setForm({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          endereco: data.endereco || '',
          necessidades: data.necessidades || '',
          contatoEmergencia: data.contatoEmergencia || '',
          experiencia: data.experiencia || '',
          cidade: data.cidade || '',
          estado: data.estado || '',
          taxaHora: data.taxaHora != null ? String(data.taxaHora) : '',
          biografia: '',
          especialidades: Array.isArray(data.especialidades) ? data.especialidades : []
        });
      } catch {
        setErro('Nao foi possivel carregar seu perfil. Tente novamente.');
      } finally {
        setLoading(false);
      }
    };
    carregar();
  }, [navigate]);

  const phoneDigits = (v: string) => v.replace(/\D/g, '');

  const formValido = useMemo(() => {
    const base =
      form.name.trim().length > 1 &&
      form.email.trim().length > 3 &&
      phoneDigits(form.phone).length === 11;

    if (!base) return false;

    if (isCuidador) {
      return (
        form.experiencia.trim().length >= 3 &&
        form.cidade.trim().length >= 2 &&
        form.estado.trim().length === 2 &&
        Number(form.taxaHora) > 0 &&
        form.especialidades.length > 0 &&
        form.biografia.trim().length >= 3
      );
    }

    return (
      form.endereco.trim().length >= 3 &&
      form.necessidades.trim().length >= 3 &&
      form.contatoEmergencia.trim().length >= 3
    );
  }, [form, isCuidador]);

  const addEspecialidade = () => {
    const esp = novaEspecialidade.trim();
    if (!esp) return;
    if (form.especialidades.some((e) => e.toLowerCase() === esp.toLowerCase())) {
      setNovaEspecialidade('');
      return;
    }
    setForm((prev) => ({ ...prev, especialidades: [...prev.especialidades, esp] }));
    setNovaEspecialidade('');
  };

  const removerEspecialidade = (esp: string) => {
    setForm((prev) => ({ ...prev, especialidades: prev.especialidades.filter((e) => e !== esp) }));
  };

  const salvar = async () => {
    if (!formValido) return;
    setErro(null);
    setSaving(true);
    try {
      await http.post('/api/carehub/perfil/completar', {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: phoneDigits(form.phone),
        endereco: form.endereco.trim() || null,
        necessidades: form.necessidades.trim() || null,
        contatoEmergencia: form.contatoEmergencia.trim() || null,
        experiencia: form.experiencia.trim() || null,
        cidade: form.cidade.trim() || null,
        estado: form.estado.trim().toUpperCase() || null,
        taxaHora: form.taxaHora ? Number(form.taxaHora) : null,
        biografia: form.biografia.trim() || null,
        especialidades: form.especialidades
      });

      navigate('/carehub', { replace: true });
    } catch {
      setErro('Nao foi possivel salvar seus dados. Revise as informacoes e tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography>Carregando seu cadastro...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Card>
        <CardContent>
          <Stack spacing={2.5}>
            <Box>
              <Typography variant="h5" fontWeight={700}>
                Confirmacao de dados do CareHub
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Primeiro acesso ao CareHub: confirme seus dados para continuar.
              </Typography>
            </Box>

            {erro && <Alert severity="error">{erro}</Alert>}

            {/* Campos comuns — nome e email mantidos como estavam (puxados da API) */}
            <TextField
              label="Nome completo"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              required
            />
            <TextField
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
              required
            />

            {/* Telefone com máscara (XX) XXXXX-XXXX */}
            <TextField
              label="Telefone"
              value={form.phone}
              onChange={(e) =>
                setForm((p) => ({ ...p, phone: formatarTelefone(e.target.value) }))
              }
              placeholder="(XX) XXXXX-XXXX"
              inputProps={{ maxLength: 16 }}
              helperText={phoneDigits(form.phone).length > 0 && phoneDigits(form.phone).length < 11 ? 'Digite os 11 dígitos com DDD' : ''}
              required
            />

            {/* Campos do Cliente (não-cuidador) — todos obrigatórios */}
            {!isCuidador && (
              <>
                <TextField
                  label="Endereco"
                  value={form.endereco}
                  onChange={(e) => setForm((p) => ({ ...p, endereco: e.target.value }))}
                  required
                />
                <TextField
                  label="Necessidades"
                  value={form.necessidades}
                  onChange={(e) => setForm((p) => ({ ...p, necessidades: e.target.value }))}
                  multiline
                  minRows={2}
                  required
                />
                <TextField
                  label="Contato de emergencia"
                  value={form.contatoEmergencia}
                  onChange={(e) => setForm((p) => ({ ...p, contatoEmergencia: e.target.value }))}
                  required
                />
              </>
            )}

            {/* Campos do Cuidador — todos obrigatórios */}
            {isCuidador && (
              <>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <TextField
                    fullWidth
                    label="Cidade"
                    value={form.cidade}
                    onChange={(e) => setForm((p) => ({ ...p, cidade: e.target.value }))}
                    required
                  />
                  <TextField
                    label="UF"
                    value={form.estado}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        estado: e.target.value.replace(/[^a-zA-Z]/g, '').slice(0, 2).toUpperCase()
                      }))
                    }
                    inputProps={{ maxLength: 2, style: { textTransform: 'uppercase', letterSpacing: '0.15em' } }}
                    placeholder="GO"
                    sx={{ width: { xs: '100%', sm: 120 } }}
                    required
                  />
                </Stack>

                <TextField
                  label="Experiencia"
                  value={form.experiencia}
                  onChange={(e) => setForm((p) => ({ ...p, experiencia: e.target.value }))}
                  multiline
                  minRows={2}
                  required
                />

                <TextField
                  label="Valor por hora"
                  type="number"
                  value={form.taxaHora}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '' || Number(val) >= 0) {
                      setForm((p) => ({ ...p, taxaHora: val }));
                    }
                  }}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">R$</InputAdornment>
                  }}
                  inputProps={{ min: 0, step: 0.01 }}
                  required
                />

                <TextField
                  label="Biografia"
                  value={form.biografia}
                  onChange={(e) => setForm((p) => ({ ...p, biografia: e.target.value }))}
                  multiline
                  minRows={2}
                  required
                />

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                  <TextField
                    fullWidth
                    label="Adicionar especialidade"
                    value={novaEspecialidade}
                    onChange={(e) => setNovaEspecialidade(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addEspecialidade();
                      }
                    }}
                    helperText={form.especialidades.length === 0 ? 'Adicione ao menos uma especialidade' : ''}
                  />
                  <Button variant="outlined" onClick={addEspecialidade} sx={{ height: 56, px: 3 }}>
                    Adicionar
                  </Button>
                </Stack>

                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                  {form.especialidades.map((esp) => (
                    <Chip key={esp} label={esp} onDelete={() => removerEspecialidade(esp)} />
                  ))}
                </Stack>
              </>
            )}

            {!formValido && (
              <Alert severity="info">Preencha todos os campos obrigatorios para concluir.</Alert>
            )}

            <Button
              variant="contained"
              size="large"
              disabled={!formValido || saving}
              onClick={salvar}
            >
              {saving ? 'Salvando...' : 'Confirmar e entrar no CareHub'}
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Container>
  );
}
