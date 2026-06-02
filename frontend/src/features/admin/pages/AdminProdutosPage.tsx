import { useEffect, useState } from 'react';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Chip,
  Container,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Link as MLink,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { adminProdutosApi, type AdminProduto } from '../api/produtos';

function fmtMoeda(valor?: number | null) {
  if (valor == null) return '—';
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function AdminProdutosPage() {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const [rows, setRows] = useState<AdminProduto[]>([]);
  const [loading, setLoading] = useState(false);
  const [filtro, setFiltro] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selected, setSelected] = useState<AdminProduto | null>(null);
  const openMenu = Boolean(anchorEl);

  useEffect(() => {
    loadProdutos();
  }, []);

  async function loadProdutos() {
    setLoading(true);
    try {
      const data = await adminProdutosApi.listar();
      setRows(data);
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Erro ao carregar produtos.';
      enqueueSnackbar(message, { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }

  function handleMenu(e: React.MouseEvent<HTMLButtonElement>, row: AdminProduto) {
    setSelected(row);
    setAnchorEl(e.currentTarget);
  }
  function closeMenu() { setAnchorEl(null); }

  function goEdit(row: AdminProduto) {
    navigate(`/admin/produtos/${row.id}/edit`);
  }

  async function handleDesativar() {
    if (!selected) return closeMenu();
    if (!window.confirm(`Desativar o produto "${selected.nome}"? Ele deixara de aparecer nas buscas dos usuarios.`)) {
      return closeMenu();
    }
    try {
      await adminProdutosApi.desativar(selected.id);
      setRows((prev) => prev.map((r) => (r.id === selected.id ? { ...r, ativo: false } : r)));
      enqueueSnackbar('Produto desativado.', { variant: 'success' });
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Erro ao desativar produto.';
      enqueueSnackbar(message, { variant: 'error' });
    } finally {
      closeMenu();
    }
  }

  const termo = filtro.trim().toLowerCase();
  const linhasFiltradas = termo
    ? rows.filter((r) =>
        (r.nome || '').toLowerCase().includes(termo)
        || (r.marca || '').toLowerCase().includes(termo)
        || (r.categoria?.nome || '').toLowerCase().includes(termo)
      )
    : rows;

  return (
    <Container sx={{ py: 3 }}>
      <Box display="flex" alignItems="center" mb={2}>
        <Typography variant="h3" sx={{ flex: 1 }}>Produtos</Typography>
        <Stack direction="row" spacing={1}>
          <Button variant="contained" onClick={() => navigate('/admin/produtos/novo')}>
            Cadastrar produto
          </Button>
        </Stack>
      </Box>

      <Box mb={2} maxWidth={420}>
        <TextField
          fullWidth
          size="small"
          label="Filtrar por nome, marca ou categoria"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
        />
      </Box>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Nome</TableCell>
              <TableCell>Marca</TableCell>
              <TableCell>Categoria</TableCell>
              <TableCell>Unidade</TableCell>
              <TableCell align="right">Custo medio</TableCell>
              <TableCell align="right">Calorias (porcao)</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Acoes</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={9}>Carregando produtos...</TableCell>
              </TableRow>
            )}
            {!loading && linhasFiltradas.length === 0 && (
              <TableRow>
                <TableCell colSpan={9}>Nenhum produto encontrado.</TableCell>
              </TableRow>
            )}
            {!loading && linhasFiltradas.map((row) => (
              <TableRow key={row.id} hover>
                <TableCell>{row.id}</TableCell>
                <TableCell>
                  <MLink underline="hover" onClick={() => goEdit(row)} sx={{ cursor: 'pointer' }}>
                    {row.nome || '-'}
                  </MLink>
                </TableCell>
                <TableCell>{row.marca || '—'}</TableCell>
                <TableCell>{row.categoria?.nome || '—'}</TableCell>
                <TableCell>{row.unidadeMedida || '—'}</TableCell>
                <TableCell align="right">{fmtMoeda(row.custoMedio ?? row.preco ?? null)}</TableCell>
                <TableCell align="right">
                  {row.calorias != null
                    ? `${row.calorias} kcal${row.porcaoReferenciaGramas ? ` / ${row.porcaoReferenciaGramas}g` : ''}`
                    : '—'}
                </TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={row.ativo ? 'Ativo' : 'Inativo'}
                    color={row.ativo ? 'success' : 'default'}
                    variant={row.ativo ? 'filled' : 'outlined'}
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={(e) => handleMenu(e, row)}>
                    <MoreVertIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Menu anchorEl={anchorEl} open={openMenu} onClose={closeMenu} keepMounted>
        <MenuItem onClick={() => selected && goEdit(selected)}>Editar</MenuItem>
        <MenuItem onClick={handleDesativar} disabled={!selected?.ativo}>
          Desativar
        </MenuItem>
      </Menu>
    </Container>
  );
}
