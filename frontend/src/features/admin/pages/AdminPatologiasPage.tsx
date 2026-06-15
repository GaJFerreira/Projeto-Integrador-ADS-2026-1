import { useEffect, useState } from 'react';
import { useSnackbar } from 'notistack';
import {
  Box, Button, Chip, Container, Dialog, DialogActions, DialogContent,
  DialogTitle, Divider, IconButton, Stack, Tab, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Tabs, TextField,
  Tooltip, Typography, Autocomplete,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditIcon from '@mui/icons-material/Edit';
import LinkIcon from '@mui/icons-material/Link';
import CloseIcon from '@mui/icons-material/Close';
import BiotechIcon from '@mui/icons-material/Biotech';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { adminPatologiasApi, type AdminPatologia, type PatologiaItem, type PatologiaItemPayload } from '../api/patologias';
import { adminUsersApi, type AdminUser } from '../api/users';
import { adminProdutosApi, type AdminProduto } from '../api/produtos';

// ─── Form modal (criar / editar patologia) ───────────────────────────────────

interface FormModalProps {
  open: boolean;
  initial?: AdminPatologia | null;
  onClose: () => void;
  onSaved: (p: AdminPatologia) => void;
}

function PatologiaFormModal({ open, initial, onClose, onSaved }: FormModalProps) {
  const { enqueueSnackbar } = useSnackbar();
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setNome(initial?.nome ?? '');
    setDescricao(initial?.descricao ?? '');
  }, [initial, open]);

  async function handleSave() {
    if (!nome.trim()) { enqueueSnackbar('Nome é obrigatório.', { variant: 'warning' }); return; }
    setSaving(true);
    try {
      const payload = { nome: nome.trim(), descricao: descricao.trim() || undefined };
      const saved = initial
        ? await adminPatologiasApi.atualizar(initial.id, payload)
        : await adminPatologiasApi.criar(payload);
      enqueueSnackbar(initial ? 'Patologia atualizada.' : 'Patologia cadastrada.', { variant: 'success' });
      onSaved(saved);
    } catch (err: any) {
      enqueueSnackbar(err?.response?.data?.message || 'Erro ao salvar.', { variant: 'error' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{initial ? 'Editar Patologia' : 'Cadastrar Patologia'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Nome *"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            fullWidth
            inputProps={{ maxLength: 150 }}
          />
          <TextField
            label="Descrição"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            fullWidth
            multiline
            rows={3}
            inputProps={{ maxLength: 500 }}
            helperText="Explique brevemente o que é esta condição e como ela afeta as escolhas alimentares do usuário. Máx. 500 caracteres."
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>Cancelar</Button>
        <Button variant="contained" onClick={handleSave} disabled={saving}>
          {saving ? 'Salvando…' : 'Salvar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Vínculo drawer/dialog ────────────────────────────────────────────────────

interface VinculoDialogProps {
  open: boolean;
  patologia: AdminPatologia | null;
  allUsers: AdminUser[];
  allProdutos: AdminProduto[];
  onClose: () => void;
}

function VinculoDialog({ open, patologia, allUsers, allProdutos, onClose }: VinculoDialogProps) {
  const { enqueueSnackbar } = useSnackbar();
  const [tab, setTab] = useState(0);

  // Usuários
  const [usuarioIds, setUsuarioIds] = useState<number[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userSelecionado, setUserSelecionado] = useState<AdminUser | null>(null);
  const [savingUser, setSavingUser] = useState(false);

  // Restrições de produtos
  const [itens, setItens] = useState<PatologiaItem[]>([]);
  const [loadingItens, setLoadingItens] = useState(false);
  const [produtoSel, setProdutoSel] = useState<AdminProduto | null>(null);
  const [sugestaoSel, setSugestaoSel] = useState<AdminProduto | null>(null);
  const [savingItem, setSavingItem] = useState(false);

  useEffect(() => {
    if (!open || !patologia) return;
    setTab(0);
    setUserSelecionado(null);
    setProdutoSel(null);
    setSugestaoSel(null);
    loadUsuarios();
    loadItens();
  }, [open, patologia]);

  async function loadUsuarios() {
    if (!patologia) return;
    setLoadingUsers(true);
    try {
      const ids = await adminPatologiasApi.listarUsuarios(patologia.id);
      setUsuarioIds(ids);
    } catch { enqueueSnackbar('Erro ao carregar usuários.', { variant: 'error' }); }
    finally { setLoadingUsers(false); }
  }

  async function loadItens() {
    if (!patologia) return;
    setLoadingItens(true);
    try {
      const data = await adminPatologiasApi.listarItens(patologia.id);
      setItens(data);
    } catch { enqueueSnackbar('Erro ao carregar restrições.', { variant: 'error' }); }
    finally { setLoadingItens(false); }
  }

  async function handleVincularUser() {
    if (!patologia || !userSelecionado) return;
    setSavingUser(true);
    try {
      await adminPatologiasApi.vincularUsuario(patologia.id, userSelecionado.id);
      setUsuarioIds((prev) => [...prev, userSelecionado.id]);
      setUserSelecionado(null);
      enqueueSnackbar('Usuário vinculado.', { variant: 'success' });
    } catch (err: any) {
      enqueueSnackbar(err?.response?.data?.message || 'Erro ao vincular.', { variant: 'error' });
    } finally { setSavingUser(false); }
  }

  async function handleDesvincularUser(usuarioId: number) {
    if (!patologia) return;
    try {
      await adminPatologiasApi.desvincularUsuario(patologia.id, usuarioId);
      setUsuarioIds((prev) => prev.filter((id) => id !== usuarioId));
      enqueueSnackbar('Vínculo removido.', { variant: 'success' });
    } catch (err: any) {
      enqueueSnackbar(err?.response?.data?.message || 'Erro ao desvincular.', { variant: 'error' });
    }
  }

  async function handleVincularProduto() {
    if (!patologia || !produtoSel) return;
    const payload: PatologiaItemPayload = {
      patologiaId: patologia.id,
      produtoId: produtoSel.id,
      produtoSugestaoId: sugestaoSel?.id ?? null,
    };
    setSavingItem(true);
    try {
      const novo = await adminPatologiasApi.vincularProduto(payload);
      setItens((prev) => [...prev, novo]);
      setProdutoSel(null);
      setSugestaoSel(null);
      enqueueSnackbar('Restrição vinculada.', { variant: 'success' });
    } catch (err: any) {
      enqueueSnackbar(err?.response?.data?.message || 'Erro ao vincular produto.', { variant: 'error' });
    } finally { setSavingItem(false); }
  }

  async function handleDesvincularProduto(itemId: number) {
    try {
      await adminPatologiasApi.desvincularProduto(itemId);
      setItens((prev) => prev.filter((i) => i.id !== itemId));
      enqueueSnackbar('Restrição removida.', { variant: 'success' });
    } catch (err: any) {
      enqueueSnackbar(err?.response?.data?.message || 'Erro ao remover.', { variant: 'error' });
    }
  }

  const usuariosVinculados = allUsers.filter((u) => usuarioIds.includes(u.id));
  const usuariosDisponiveis = allUsers.filter((u) => !usuarioIds.includes(u.id));
  const produtosDisponiveis = allProdutos.filter((p) => p.ativo !== false);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h6" component="span">Vínculos — </Typography>
            <Typography variant="h6" component="span" color="primary.main">{patologia?.nome}</Typography>
          </Box>
          <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
        </Stack>
      </DialogTitle>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab label={`Usuários (${usuarioIds.length})`} />
          <Tab label={`Restrições de Produtos (${itens.length})`} />
        </Tabs>
      </Box>

      <DialogContent sx={{ minHeight: 340 }}>
        {/* ── Tab Usuários ── */}
        {tab === 0 && (
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              Usuários que possuem esta condição de saúde
              <Tooltip arrow placement="top" title="Ao vincular um usuário, o sistema passará a alertá-lo automaticamente quando ele adicionar produtos restritos para esta condição em suas listas de compras.">
                <InfoOutlinedIcon sx={{ fontSize: 15, color: 'text.disabled', cursor: 'help' }} />
              </Tooltip>
            </Typography>

            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
              <Autocomplete
                options={usuariosDisponiveis}
                getOptionLabel={(u) => `${u.name} (${u.username})`}
                value={userSelecionado}
                onChange={(_, v) => setUserSelecionado(v)}
                renderInput={(params) => <TextField {...params} label="Buscar usuário" size="small" />}
                sx={{ flex: 1 }}
                isOptionEqualToValue={(a, b) => a.id === b.id}
              />
              <Tooltip arrow placement="top" title="Vincula o usuário selecionado a esta patologia. A partir daí, ele receberá alertas de restrição ao montar suas listas de compras.">
              <Box component="span">
              <Button
                variant="contained"
                startIcon={<PersonAddIcon />}
                disabled={!userSelecionado || savingUser}
                onClick={handleVincularUser}
                sx={{ whiteSpace: 'nowrap' }}
              >
                Vincular
              </Button>
              </Box>
              </Tooltip>
            </Stack>

            {loadingUsers ? (
              <Typography color="text.secondary" variant="body2">Carregando…</Typography>
            ) : usuariosVinculados.length === 0 ? (
              <Typography color="text.secondary" variant="body2">Nenhum usuário vinculado.</Typography>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Nome</TableCell>
                      <TableCell>Username</TableCell>
                      <TableCell>Role</TableCell>
                      <TableCell align="right">Ação</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {usuariosVinculados.map((u) => (
                      <TableRow key={u.id} hover>
                        <TableCell>{u.id}</TableCell>
                        <TableCell>{u.name}</TableCell>
                        <TableCell>{u.username}</TableCell>
                        <TableCell>
                          <Chip size="small" label={u.role?.name ?? '—'} variant="outlined" />
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip arrow title="Remove o vínculo deste usuário com a patologia. Ele não receberá mais alertas de restrição relacionados a esta condição.">
                            <IconButton size="small" color="error" onClick={() => handleDesvincularUser(u.id)}>
                              <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}

        {/* ── Tab Restrições ── */}
        {tab === 1 && (
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              Produtos que devem ser alertados para usuários com esta condição
              <Tooltip arrow placement="top" title="Quando um usuário com esta patologia adicionar um produto restrito em sua lista de compras, ele receberá um alerta automático e uma sugestão do produto substituto informado aqui.">
                <InfoOutlinedIcon sx={{ fontSize: 15, color: 'text.disabled', cursor: 'help' }} />
              </Tooltip>
            </Typography>

            <Stack spacing={1} sx={{ mb: 2 }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ sm: 'center' }}>
                <Tooltip arrow placement="top" title="Produto que deve ser alertado quando um usuário com esta condição tentar adicioná-lo em sua lista de compras.">
                <Autocomplete
                  options={produtosDisponiveis}
                  getOptionLabel={(p) => p.nome}
                  value={produtoSel}
                  onChange={(_, v) => { setProdutoSel(v); setSugestaoSel(null); }}
                  renderInput={(params) => <TextField {...params} label="Produto restrito *" size="small" />}
                  sx={{ flex: 1 }}
                  isOptionEqualToValue={(a, b) => a.id === b.id}
                />
                </Tooltip>
                <Tooltip arrow placement="top" title="Produto alternativo mais adequado que será sugerido ao usuário quando ele tentar adicionar o produto restrito. Este campo é opcional.">
                <Autocomplete
                  options={produtosDisponiveis.filter((p) => p.id !== produtoSel?.id)}
                  getOptionLabel={(p) => p.nome}
                  value={sugestaoSel}
                  onChange={(_, v) => setSugestaoSel(v)}
                  renderInput={(params) => <TextField {...params} label="Sugestão de substituto" size="small" />}
                  sx={{ flex: 1 }}
                  isOptionEqualToValue={(a, b) => a.id === b.id}
                />
                </Tooltip>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  disabled={!produtoSel || savingItem}
                  onClick={handleVincularProduto}
                  sx={{ whiteSpace: 'nowrap', flexShrink: 0 }}
                >
                  Adicionar
                </Button>
              </Stack>
              <Typography variant="caption" color="text.secondary">
                O substituto é opcional — quando informado, será sugerido ao usuário no momento da compra.
              </Typography>
            </Stack>

            <Divider sx={{ mb: 1.5 }} />

            {loadingItens ? (
              <Typography color="text.secondary" variant="body2">Carregando…</Typography>
            ) : itens.length === 0 ? (
              <Typography color="text.secondary" variant="body2">Nenhuma restrição cadastrada.</Typography>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Produto restrito</TableCell>
                      <TableCell>Sugestão de substituto</TableCell>
                      <TableCell align="right">Ação</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {itens.map((item) => (
                      <TableRow key={item.id} hover>
                        <TableCell>{item.produto.nome}</TableCell>
                        <TableCell>{item.produtoSugestao?.nome ?? <em style={{ opacity: 0.5 }}>—</em>}</TableCell>
                        <TableCell align="right">
                          <Tooltip arrow title="Remove este produto da lista de restrições. O sistema não alertará mais sobre ele para usuários com esta condição.">
                            <IconButton size="small" color="error" onClick={() => handleDesvincularProduto(item.id)}>
                              <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function AdminPatologiasPage() {
  const { enqueueSnackbar } = useSnackbar();
  const [patologias, setPatologias] = useState<AdminPatologia[]>([]);
  const [allUsers, setAllUsers] = useState<AdminUser[]>([]);
  const [allProdutos, setAllProdutos] = useState<AdminProduto[]>([]);
  const [loading, setLoading] = useState(false);
  const [filtro, setFiltro] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<AdminPatologia | null>(null);

  const [vinculoOpen, setVinculoOpen] = useState(false);
  const [vinculoTarget, setVinculoTarget] = useState<AdminPatologia | null>(null);

  useEffect(() => {
    loadAll();
  }, []);

  async function loadAll() {
    setLoading(true);
    try {
      const [pats, users, produtos] = await Promise.all([
        adminPatologiasApi.listar(),
        adminUsersApi.listar(),
        adminProdutosApi.listar(),
      ]);
      setPatologias(pats);
      setAllUsers(users);
      setAllProdutos(produtos);
    } catch {
      enqueueSnackbar('Erro ao carregar dados.', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  }

  function abrirFormNovo() { setEditTarget(null); setFormOpen(true); }
  function abrirFormEditar(p: AdminPatologia) { setEditTarget(p); setFormOpen(true); }
  function abrirVinculos(p: AdminPatologia) { setVinculoTarget(p); setVinculoOpen(true); }

  function handleSaved(saved: AdminPatologia) {
    setPatologias((prev) => {
      const idx = prev.findIndex((p) => p.id === saved.id);
      if (idx >= 0) { const clone = [...prev]; clone[idx] = saved; return clone; }
      return [...prev, saved].sort((a, b) => a.nome.localeCompare(b.nome));
    });
    setFormOpen(false);
  }

  async function handleExcluir(p: AdminPatologia) {
    if (!window.confirm(`Excluir a patologia "${p.nome}"? Esta ação remove todos os vínculos associados.`)) return;
    try {
      await adminPatologiasApi.excluir(p.id);
      setPatologias((prev) => prev.filter((x) => x.id !== p.id));
      enqueueSnackbar('Patologia excluída.', { variant: 'success' });
    } catch (err: any) {
      enqueueSnackbar(err?.response?.data?.message || 'Erro ao excluir.', { variant: 'error' });
    }
  }

  const termo = filtro.trim().toLowerCase();
  const linhas = termo
    ? patologias.filter((p) => p.nome.toLowerCase().includes(termo) || (p.descricao ?? '').toLowerCase().includes(termo))
    : patologias;

  return (
    <Container sx={{ py: 3 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Box>
          <Stack direction="row" alignItems="center" spacing={1}>
            <BiotechIcon color="primary" />
            <Typography variant="h3">Patologias</Typography>
          </Stack>
          <Typography variant="body2" color="text.secondary">
            Cadastre condições de saúde e configure restrições de produtos e vínculos com usuários.
          </Typography>
        </Box>
        <Tooltip arrow placement="left" title="Abre o formulário para cadastrar uma nova condição de saúde. Após o cadastro, você poderá vincular usuários e configurar produtos restritos.">
        <Button variant="contained" startIcon={<AddIcon />} onClick={abrirFormNovo}>
          Cadastrar patologia
        </Button>
        </Tooltip>
      </Stack>

      <Box mb={2} maxWidth={380}>
        <TextField
          fullWidth size="small"
          label="Filtrar por nome ou descrição"
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
              <TableCell>Descrição</TableCell>
              <TableCell align="right">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && (
              <TableRow><TableCell colSpan={4}>Carregando…</TableCell></TableRow>
            )}
            {!loading && linhas.length === 0 && (
              <TableRow><TableCell colSpan={4}>Nenhuma patologia encontrada.</TableCell></TableRow>
            )}
            {!loading && linhas.map((p) => (
              <TableRow key={p.id} hover>
                <TableCell>{p.id}</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>{p.nome}</TableCell>
                <TableCell sx={{ color: 'text.secondary', maxWidth: 320 }}>
                  {p.descricao ?? <em style={{ opacity: 0.45 }}>Sem descrição</em>}
                </TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                    <Tooltip arrow title="Vincular usuários que possuem esta condição e configurar quais produtos são restritos — com sugestões de substitutos.">
                      <IconButton size="small" color="primary" onClick={() => abrirVinculos(p)}>
                        <LinkIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip arrow title="Editar o nome e a descrição desta condição de saúde.">
                      <IconButton size="small" onClick={() => abrirFormEditar(p)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip arrow title="Excluir permanentemente esta patologia e todos os seus vínculos com usuários e produtos restritos.">
                      <IconButton size="small" color="error" onClick={() => handleExcluir(p)}>
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <PatologiaFormModal
        open={formOpen}
        initial={editTarget}
        onClose={() => setFormOpen(false)}
        onSaved={handleSaved}
      />

      <VinculoDialog
        open={vinculoOpen}
        patologia={vinculoTarget}
        allUsers={allUsers}
        allProdutos={allProdutos}
        onClose={() => setVinculoOpen(false)}
      />
    </Container>
  );
}
