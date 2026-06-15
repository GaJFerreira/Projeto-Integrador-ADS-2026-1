import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import {
  Box,
  Button,
  Container,
  Divider,
  Grid,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
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
};

function parseNumero(valor: string): number | null {
  const trimmed = valor.trim().replace(',', '.');
  if (!trimmed) return null;
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : null;
}

export default function AdminProdutoCreatePage() {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [categorias, setCategorias] = useState<AdminCategoria[]>([]);
  const [form, setForm] = useState<FormState>(FORM_INICIAL);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await adminProdutosApi.listarCategorias();
        setCategorias(data);
      } catch (err: any) {
        const message = err?.response?.data?.message || 'Erro ao carregar categorias.';
        enqueueSnackbar(message, { variant: 'warning' });
      }
    })();
  }, [enqueueSnackbar]);

  function handle<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
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
      ativo: true,
    };

    setSalvando(true);
    try {
      await adminProdutosApi.criar(payload);
      enqueueSnackbar('Produto cadastrado com sucesso.', { variant: 'success' });
      navigate('/admin/produtos');
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Erro ao cadastrar produto.';
      enqueueSnackbar(message, { variant: 'error' });
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Container sx={{ py: 3 }}>
      <Box display="flex" alignItems="center" gap={1} mb={2}>
        <IconButton onClick={() => navigate(-1)} aria-label="Voltar">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h3">Novo produto</Typography>
      </Box>

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Stack spacing={3} maxWidth={960}>
          <Stack spacing={2}>
            <Stack direction="row" alignItems="center" spacing={0.75}>
              <Typography variant="h5">Dados gerais</Typography>
              <Tooltip arrow placement="right" title="Informações básicas de identificação do produto no catálogo. Nome e categoria são obrigatórios.">
                <InfoOutlinedIcon sx={{ fontSize: 17, color: 'text.disabled', cursor: 'help' }} />
              </Tooltip>
            </Stack>
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
                  helperText="Formato de venda do produto (ex: kg, g, L, unidade). Exibida junto à quantidade na lista do usuário."
                />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  label="Custo medio (R$)"
                  type="number"
                  inputProps={{ step: '0.01', min: '0' }}
                  value={form.custoMedio}
                  onChange={(e) => handle('custoMedio', e.target.value)}
                  fullWidth
                  helperText="Preço médio de mercado. Utilizado para estimar o custo total da lista de compras do usuário."
                />
              </Grid>
            </Grid>
          </Stack>

          <Divider />

          <Stack spacing={2}>
            <Stack direction="row" alignItems="center" spacing={0.75}>
              <Typography variant="h5">Tabela nutricional</Typography>
              <Tooltip arrow placement="right" title="Estes dados são usados pelo sistema para identificar automaticamente produtos inadequados para determinadas condições de saúde (ex: sódio alto para hipertensos). Preencha com os valores do rótulo do produto.">
                <InfoOutlinedIcon sx={{ fontSize: 17, color: 'text.disabled', cursor: 'help' }} />
              </Tooltip>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              Valores por porção de referência. Campos vazios serão tratados como não informados.
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  label="Porcao (g ou ml)"
                  type="number"
                  inputProps={{ step: '0.01', min: '0' }}
                  value={form.porcaoReferenciaGramas}
                  onChange={(e) => handle('porcaoReferenciaGramas', e.target.value)}
                  fullWidth
                  helperText="Tamanho da porção em que os valores abaixo são baseados. Ex.: se o rótulo diz '30g', preencha 30."
                />
              </Grid>
              <Grid size={{ xs: 6, md: 4 }}>
                <TextField
                  label="Calorias (kcal)"
                  type="number"
                  inputProps={{ step: '0.01', min: '0' }}
                  value={form.calorias}
                  onChange={(e) => handle('calorias', e.target.value)}
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 6, md: 4 }}>
                <TextField
                  label="Proteinas (g)"
                  type="number"
                  inputProps={{ step: '0.01', min: '0' }}
                  value={form.proteinas}
                  onChange={(e) => handle('proteinas', e.target.value)}
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 6, md: 4 }}>
                <TextField
                  label="Carboidratos (g)"
                  type="number"
                  inputProps={{ step: '0.01', min: '0' }}
                  value={form.carboidratos}
                  onChange={(e) => handle('carboidratos', e.target.value)}
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 6, md: 4 }}>
                <TextField
                  label="Acucares (g)"
                  type="number"
                  inputProps={{ step: '0.01', min: '0' }}
                  value={form.acucares}
                  onChange={(e) => handle('acucares', e.target.value)}
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 6, md: 4 }}>
                <TextField
                  label="Fibras (g)"
                  type="number"
                  inputProps={{ step: '0.01', min: '0' }}
                  value={form.fibras}
                  onChange={(e) => handle('fibras', e.target.value)}
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 6, md: 4 }}>
                <TextField
                  label="Gorduras totais (g)"
                  type="number"
                  inputProps={{ step: '0.01', min: '0' }}
                  value={form.gordurasTotais}
                  onChange={(e) => handle('gordurasTotais', e.target.value)}
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 6, md: 4 }}>
                <TextField
                  label="Gorduras saturadas (g)"
                  type="number"
                  inputProps={{ step: '0.01', min: '0' }}
                  value={form.gordurasSaturadas}
                  onChange={(e) => handle('gordurasSaturadas', e.target.value)}
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 6, md: 4 }}>
                <TextField
                  label="Sodio (mg)"
                  type="number"
                  inputProps={{ step: '0.01', min: '0' }}
                  value={form.sodio}
                  onChange={(e) => handle('sodio', e.target.value)}
                  fullWidth
                  helperText="Crítico para usuários com hipertensão ou doenças renais. Acima de 400 mg por porção é considerado alto."
                />
              </Grid>
            </Grid>
          </Stack>

          <Divider />

          <Stack spacing={2}>
            <Stack direction="row" alignItems="center" spacing={0.75}>
              <Typography variant="h5">Tags</Typography>
              <Tooltip arrow placement="right" title="Palavras-chave que facilitam a busca e filtragem de produtos. Use termos que descrevem características importantes, como restrições alimentares ou tipo de alimento.">
                <InfoOutlinedIcon sx={{ fontSize: 17, color: 'text.disabled', cursor: 'help' }} />
              </Tooltip>
            </Stack>
            <TextField
              label="Tags (separadas por vírgula)"
              placeholder="ex: integral, sem gluten, organico"
              value={form.tags}
              onChange={(e) => handle('tags', e.target.value)}
              fullWidth
              multiline
              minRows={2}
              helperText="Palavras-chave separadas por vírgula. Ex.: 'integral, sem lactose, vegetariano'. Facilitam a busca e categorização do produto."
            />
          </Stack>

          <Stack direction="row" spacing={1}>
            <Button variant="outlined" onClick={() => navigate(-1)} disabled={salvando}>
              Cancelar
            </Button>
            <Button type="submit" variant="contained" disabled={salvando}>
              {salvando ? 'Salvando...' : 'Cadastrar produto'}
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Container>
  );
}
