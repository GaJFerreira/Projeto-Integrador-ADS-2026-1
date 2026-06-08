import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import {
  Box,
  Button,
  Container,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {
  adminProdutosApi,
  type AdminCategoria,
  type AdminProdutoPayload,
} from '../api/produtos';

type FormState = {
  nome: string;
  categoriaId: string;
  marca: string;
  unidadeMedida: string;
  custoMedio: string;

  porcaoReferenciaGramas: string;
  calorias: string;
  proteinas: string;
  carboidratos: string;
  gordurasTotais: string;
  gordurasSaturadas: string;
  fibras: string;
  sodio: string;
  acucares: string;

  tags: string;
  ativo: boolean;
};

const FORM_INICIAL: FormState = {
  nome: '',
  categoriaId: '',
  marca: '',
  unidadeMedida: '',
  custoMedio: '',
  porcaoReferenciaGramas: '',
  calorias: '',
  proteinas: '',
  carboidratos: '',
  gordurasTotais: '',
  gordurasSaturadas: '',
  fibras: '',
  sodio: '',
  acucares: '',
  tags: '',
  ativo: true,
};

function parseNumero(valor: string): number | null {
  const trimmed = valor.trim().replace(',', '.');
  if (!trimmed) return null;
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : null;
}

function toStr(v?: number | null) {
  return v == null ? '' : String(v);
}

export default function AdminProdutoEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [categorias, setCategorias] = useState<AdminCategoria[]>([]);
  const [form, setForm] = useState<FormState>(FORM_INICIAL);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [custoOriginal, setCustoOriginal] = useState<string>('');

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const [produto, cats] = await Promise.all([
          adminProdutosApi.porId(Number(id)),
          adminProdutosApi.listarCategorias(),
        ]);
        setCategorias(cats);
        setForm({
          nome: produto.nome || '',
          categoriaId: produto.categoria?.id ? String(produto.categoria.id) : '',
          marca: produto.marca || '',
          unidadeMedida: produto.unidadeMedida || '',
          custoMedio: toStr(produto.custoMedio),
          porcaoReferenciaGramas: toStr(produto.porcaoReferenciaGramas),
          calorias: toStr(produto.calorias),
          proteinas: toStr(produto.proteinas),
          carboidratos: toStr(produto.carboidratos),
          gordurasTotais: toStr(produto.gordurasTotais),
          gordurasSaturadas: toStr(produto.gordurasSaturadas),
          fibras: toStr(produto.fibras),
          sodio: toStr(produto.sodio),
          acucares: toStr(produto.acucares),
          tags: produto.tags || '',
          ativo: produto.ativo ?? true,
        });
        setCustoOriginal(toStr(produto.custoMedio));
      } catch (err: any) {
        const message = err?.response?.data?.message || 'Erro ao carregar produto.';
        enqueueSnackbar(message, { variant: 'error' });
        navigate('/admin/produtos');
      } finally {
        setCarregando(false);
      }
    })();
  }, [id, enqueueSnackbar, navigate]);

  function handle<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!id) return;
    if (!form.nome.trim()) {
      enqueueSnackbar('Informe o nome do produto.', { variant: 'warning' });
      return;
    }
    if (!form.categoriaId) {
      enqueueSnackbar('Selecione uma categoria.', { variant: 'warning' });
      return;
    }

    const payload: AdminProdutoPayload = {
      nome: form.nome.trim(),
      categoriaId: Number(form.categoriaId),
      marca: form.marca.trim() || null,
      unidadeMedida: form.unidadeMedida.trim() || null,
      custoMedio: parseNumero(form.custoMedio),
      porcaoReferenciaGramas: parseNumero(form.porcaoReferenciaGramas),
      calorias: parseNumero(form.calorias),
      proteinas: parseNumero(form.proteinas),
      carboidratos: parseNumero(form.carboidratos),
      gordurasTotais: parseNumero(form.gordurasTotais),
      gordurasSaturadas: parseNumero(form.gordurasSaturadas),
      fibras: parseNumero(form.fibras),
      sodio: parseNumero(form.sodio),
      acucares: parseNumero(form.acucares),
      tags: form.tags.trim() || null,
      ativo: form.ativo,
    };

    setSalvando(true);
    try {
      await adminProdutosApi.atualizar(Number(id), payload);
      enqueueSnackbar('Produto atualizado com sucesso.', { variant: 'success' });
      navigate('/admin/produtos');
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Erro ao atualizar produto.';
      enqueueSnackbar(message, { variant: 'error' });
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) {
    return (
      <Container sx={{ py: 3 }}>
        <Typography>Carregando produto...</Typography>
      </Container>
    );
  }

  const custoMudou = form.custoMedio !== custoOriginal;

  return (
    <Container sx={{ py: 3 }}>
      <Box display="flex" alignItems="center" gap={1} mb={2}>
        <IconButton onClick={() => navigate(-1)} aria-label="Voltar">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h3" sx={{ flex: 1 }}>Editar produto</Typography>
        <FormControlLabel
          control={
            <Switch
              checked={form.ativo}
              onChange={(_, v) => handle('ativo', v)}
            />
          }
          label={form.ativo ? 'Ativo' : 'Inativo'}
        />
      </Box>

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Stack spacing={3} maxWidth={960}>
          <Stack spacing={2}>
            <Typography variant="h5">Dados gerais</Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 8 }}>
                <TextField
                  label="Nome do produto"
                  value={form.nome}
                  onChange={(e) => handle('nome', e.target.value)}
                  required
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  select
                  label="Categoria"
                  value={form.categoriaId}
                  onChange={(e) => handle('categoriaId', e.target.value)}
                  required
                  fullWidth
                >
                  {categorias.map((c) => (
                    <MenuItem key={c.id} value={c.id}>{c.nome}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  label="Marca (opcional)"
                  value={form.marca}
                  onChange={(e) => handle('marca', e.target.value)}
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  label="Unidade de medida"
                  placeholder="ex: kg, g, L, un"
                  value={form.unidadeMedida}
                  onChange={(e) => handle('unidadeMedida', e.target.value)}
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  label="Custo medio (R$)"
                  type="number"
                  inputProps={{ step: '0.01', min: '0' }}
                  value={form.custoMedio}
                  onChange={(e) => handle('custoMedio', e.target.value)}
                  helperText={custoMudou ? 'O carimbo de atualizacao sera renovado ao salvar.' : ' '}
                  fullWidth
                />
              </Grid>
            </Grid>
          </Stack>

          <Divider />

          <Stack spacing={2}>
            <Typography variant="h5">Tabela nutricional</Typography>
            <Typography variant="body2" color="text.secondary">
              Valores por porcao de referencia. Campos vazios serao tratados como nao informados.
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField label="Porcao (g ou ml)" type="number" inputProps={{ step: '0.01', min: '0' }}
                  value={form.porcaoReferenciaGramas} onChange={(e) => handle('porcaoReferenciaGramas', e.target.value)} fullWidth />
              </Grid>
              <Grid size={{ xs: 6, md: 4 }}>
                <TextField label="Calorias (kcal)" type="number" inputProps={{ step: '0.01', min: '0' }}
                  value={form.calorias} onChange={(e) => handle('calorias', e.target.value)} fullWidth />
              </Grid>
              <Grid size={{ xs: 6, md: 4 }}>
                <TextField label="Proteinas (g)" type="number" inputProps={{ step: '0.01', min: '0' }}
                  value={form.proteinas} onChange={(e) => handle('proteinas', e.target.value)} fullWidth />
              </Grid>
              <Grid size={{ xs: 6, md: 4 }}>
                <TextField label="Carboidratos (g)" type="number" inputProps={{ step: '0.01', min: '0' }}
                  value={form.carboidratos} onChange={(e) => handle('carboidratos', e.target.value)} fullWidth />
              </Grid>
              <Grid size={{ xs: 6, md: 4 }}>
                <TextField label="Acucares (g)" type="number" inputProps={{ step: '0.01', min: '0' }}
                  value={form.acucares} onChange={(e) => handle('acucares', e.target.value)} fullWidth />
              </Grid>
              <Grid size={{ xs: 6, md: 4 }}>
                <TextField label="Fibras (g)" type="number" inputProps={{ step: '0.01', min: '0' }}
                  value={form.fibras} onChange={(e) => handle('fibras', e.target.value)} fullWidth />
              </Grid>
              <Grid size={{ xs: 6, md: 4 }}>
                <TextField label="Gorduras totais (g)" type="number" inputProps={{ step: '0.01', min: '0' }}
                  value={form.gordurasTotais} onChange={(e) => handle('gordurasTotais', e.target.value)} fullWidth />
              </Grid>
              <Grid size={{ xs: 6, md: 4 }}>
                <TextField label="Gorduras saturadas (g)" type="number" inputProps={{ step: '0.01', min: '0' }}
                  value={form.gordurasSaturadas} onChange={(e) => handle('gordurasSaturadas', e.target.value)} fullWidth />
              </Grid>
              <Grid size={{ xs: 6, md: 4 }}>
                <TextField label="Sodio (mg)" type="number" inputProps={{ step: '0.01', min: '0' }}
                  value={form.sodio} onChange={(e) => handle('sodio', e.target.value)} fullWidth />
              </Grid>
            </Grid>
          </Stack>

          <Divider />

          <Stack spacing={2}>
            <Typography variant="h5">Tags</Typography>
            <TextField
              label="Tags (separadas por virgula)"
              placeholder="ex: integral, sem gluten, organico"
              value={form.tags}
              onChange={(e) => handle('tags', e.target.value)}
              fullWidth
              multiline
              minRows={2}
            />
          </Stack>

          <Stack direction="row" spacing={1}>
            <Button variant="outlined" onClick={() => navigate(-1)} disabled={salvando}>
              Cancelar
            </Button>
            <Button type="submit" variant="contained" disabled={salvando}>
              {salvando ? 'Salvando...' : 'Salvar alteracoes'}
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Container>
  );
}
