import { useEffect, useMemo, useRef, useState } from 'react';
import {
    Box, Typography, Autocomplete, TextField, Button, Card,
    CardActionArea, List, ListItem, ListItemText, IconButton,
    Stack, Snackbar, Chip, Tooltip, Alert, ListItemIcon,
    useMediaQuery, useTheme,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import RecommendIcon from '@mui/icons-material/Recommend';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import LocalGroceryStoreIcon from '@mui/icons-material/LocalGroceryStore';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import ViewListIcon from '@mui/icons-material/ViewList';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import FavoriteIcon from '@mui/icons-material/Favorite';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useNavigate } from 'react-router-dom';
import { alpha } from '@mui/material/styles';

import type { Produto, ListaItemVM, Patologia, ProdutoSubstituivel } from '../types';
import { listaComprasService } from '../api/service/listaComprasService.ts';
import { listaViewService, type ListaDTO } from '@/features/lista-compras/api/service/listaViewService.ts';
import { patologiasService } from '@/features/lista-compras/api/service/patologiaService.ts';
import { produtoService } from '@/features/lista-compras/api/service/produtoService.ts';
import { EmptyState, SectionTitle, ShoppingHeader, ShoppingPage } from '@/features/lista-compras/components/ShoppingUi.tsx';
import { isIdoso } from '../utils/userRole';

const normalize = (s: string) => s.trim().toLowerCase();

export default function CreateListaPage() {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [catalogo, setCatalogo] = useState<Produto[]>([]);
    const [listaItens, setListaItens] = useState<ListaItemVM[]>([]);
    const [templates, setTemplates] = useState<ListaDTO[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(null);
    const [opcoesAutocomplete, setOpcoesAutocomplete] = useState<{ label: string; value: number }[]>([]);
    const [riscosPorProduto, setRiscosPorProduto] = useState<Record<number, ProdutoSubstituivel[]>>({});
    const [patologias, setPatologias] = useState<Patologia[]>([]);
    const [loadingPats, setLoadingPats] = useState(false);
    const [warnOpen, setWarnOpen] = useState(false);
    const [warnMsg, setWarnMsg] = useState('');
    const [tituloLista, setTituloLista] = useState('');
    const [saving, setSaving] = useState(false);
    const [errorOpen, setErrorOpen] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const showError = (msg: string) => { setErrorMsg(msg); setErrorOpen(true); };

    const templatesForDisplay = useMemo(() => templates.filter((t) => t.status !== 'FINALIZADA'), [templates]);

    const carregouRef = useRef(false);

    useEffect(() => {
        if (carregouRef.current) return;
        carregouRef.current = true;
        const loadInicial = async () => {
            try {
                setLoadingPats(true);
                const pats = await patologiasService.getPatologiasDoUsuario();
                setPatologias(pats);
                setLoadingPats(false);
                if (!isIdoso()) {
                    const tpls = await listaViewService.listarTemplates();
                    setTemplates(tpls);
                }
            } catch (e) {
                showError('Erro ao carregar dados iniciais da lista de compras');
                console.error('Erro ao carregar dados iniciais da lista de compras', e);
            } finally {
                setLoadingPats(false);
            }
        };
        loadInicial();
    }, []);

    useEffect(() => {
        if (inputValue.trim().length < 3) { setOpcoesAutocomplete([]); return; }
        let ativo = true;
        const handler = setTimeout(async () => {
            try {
                const produtos = await listaComprasService.searchProdutosByNome(inputValue);
                if (!ativo) return;
                setOpcoesAutocomplete(produtos.map((p) => ({ label: p.nome, value: p.id })));
            } catch { showError('Erro ao buscar produtos para autocomplete.'); }
        }, 300);
        return () => { ativo = false; clearTimeout(handler); };
    }, [inputValue]);

    const ensureProduto = (nomeDigitado: string): Produto => {
        const nn = normalize(nomeDigitado);
        const existente = catalogo.find((p) => p.nome_normalizado === nn);
        if (existente) return existente;
        const novo: Produto = { id: -Date.now(), nome: nomeDigitado.trim(), nome_normalizado: nn, ativo: true, is_personalizado: true };
        setCatalogo((prev) => [novo, ...prev]);
        return novo;
    };

    const addProdutoNaLista = (produto: Produto, qtd = 1) => {
        setListaItens((prev) => {
            const idx = prev.findIndex((li) => li.produto.id === produto.id);
            if (idx >= 0) {
                const clone = [...prev];
                clone[idx] = { ...clone[idx], qtd: clone[idx].qtd + qtd };
                return clone;
            }
            return [...prev, { produto, qtd }];
        });
    };

    const handleFinalizarLista = async () => {
        if (saving) return;
        const titulo = tituloLista.trim();
        if (!titulo) { showError('Informe um título para a lista.'); return; }
        if (listaItens.length === 0) { showError('Adicione ao menos um item na lista.'); return; }
        const itensValidos = listaItens.filter((li) => li.produto.id > 0);
        if (itensValidos.length === 0) { showError('Não há itens válidos para salvar (apenas personalizados locais).'); return; }
        const payload = { titulo, itens: itensValidos.map((li) => ({ produtoId: li.produto.id, qtd: li.qtd })) };
        try {
            setSaving(true);
            await listaComprasService.criarLista(payload);
            navigate('/lista-compras/listas');
        } catch {
            showError('Erro ao salvar a lista. Tente novamente.');
        } finally {
            setSaving(false);
        }
    };

    const handleAdicionar = async () => {
        const texto = (produtoSelecionado?.nome || inputValue).trim();
        if (!texto) return;
        const p = produtoSelecionado ?? ensureProduto(texto);
        addProdutoNaLista(p, 1);
        setProdutoSelecionado(null);
        setInputValue('');
        if (p.id > 0) {
            try {
                const substituiveis = await produtoService.listarSubstituiveis(p.id);
                if (substituiveis.length > 0) {
                    setRiscosPorProduto((prev) => ({ ...prev, [p.id]: substituiveis }));
                    const nomesPats = Array.from(new Set(substituiveis.map((s) => s.patologia.nome))).join(', ');
                    setWarnMsg(`Atenção: "${p.nome}" pode não ser adequado para: ${nomesPats}. Veja as sugestões na lista.`);
                    setWarnOpen(true);
                }
            } catch (e) { console.error('Erro ao buscar substituíveis para produto', p, e); }
        }
    };

    const substituirProdutoNaLista = (produtoId: number, sugestao: Produto) => {
        setListaItens((prev) => prev.map((li) => li.produto.id === produtoId ? { ...li, produto: sugestao } : li));
        setCatalogo((prev) => { const exists = prev.some((p) => p.id === sugestao.id); return exists ? prev : [sugestao, ...prev]; });
        setRiscosPorProduto((prev) => { const clone = { ...prev }; delete clone[produtoId]; return clone; });
    };

    const copiarTemplate = (tpl: ListaDTO) => {
        const itensTemplate = tpl.itens;
        if (!itensTemplate || itensTemplate.length === 0) { showError('Este modelo não possui itens cadastrados.'); return; }
        setListaItens((prev) => {
            const map = new Map<number, { produto: Produto; qtd: number }>();
            prev.forEach((li) => map.set(li.produto.id, { produto: li.produto, qtd: li.qtd }));
            itensTemplate.forEach((it) => {
                const pApi = it.produto;
                if (!pApi) return;
                const produtoApi = pApi as Produto & { nomeNormalizado?: string; isPersonalizado?: boolean };
                const produto: Produto = {
                    id: produtoApi.id, nome: produtoApi.nome,
                    nome_normalizado: produtoApi.nome_normalizado ?? produtoApi.nomeNormalizado?.toLowerCase().trim() ?? produtoApi.nome.toLowerCase().trim(),
                    ativo: produtoApi.ativo ?? true,
                    is_personalizado: produtoApi.is_personalizado ?? produtoApi.isPersonalizado ?? false,
                };
                const qtdTemplate = Number(it.qtd ?? 1);
                const existente = map.get(produto.id);
                if (existente) map.set(produto.id, { produto: existente.produto, qtd: existente.qtd + qtdTemplate });
                else map.set(produto.id, { produto, qtd: qtdTemplate });
            });
            setCatalogo((old) => {
                const ids = new Set(old.map((p) => p.id));
                const extras: Produto[] = [];
                map.forEach(({ produto }) => { if (!ids.has(produto.id)) extras.push(produto); });
                return [...old, ...extras];
            });
            return Array.from(map.values());
        });
    };

    const handleLimparLista = () => { setListaItens([]); setProdutoSelecionado(null); setInputValue(''); };
    const incQtd = (id: number) => setListaItens((prev) => prev.map((li) => li.produto.id === id ? { ...li, qtd: li.qtd + 1 } : li));
    const decQtd = (id: number) => setListaItens((prev) => prev.map((li) => li.produto.id === id ? { ...li, qtd: Math.max(1, li.qtd - 1) } : li));
    const remover = (id: number) => setListaItens((prev) => prev.filter((li) => li.produto.id !== id));

    const totalProdutos = listaItens.length;
    const totalUnidades = listaItens.reduce((acc, li) => acc + li.qtd, 0);
    const totalAlertas = listaItens.filter((li) => (riscosPorProduto[li.produto.id] ?? []).length > 0).length;

    return (
        <ShoppingPage maxWidth={1180}>
            <ShoppingHeader
                eyebrow="Compre com Saúde"
                title="Criar nova lista"
                description="Monte uma compra organizada com alertas de restrição e modelos prontos para acelerar a rotina."
                icon={<PlaylistAddCheckIcon />}
                onBack={() => navigate('/lista-compras', { replace: true })}
                actions={
                    <Button variant="contained" startIcon={<ViewListIcon />} onClick={() => navigate('/lista-compras/listas')}>
                        Minhas listas
                    </Button>
                }
                metrics={[
                    { label: 'Produtos', value: totalProdutos, tone: 'primary' },
                    { label: 'Unidades', value: totalUnidades, tone: 'success' },
                    { label: 'Alertas', value: totalAlertas, tone: 'warning' },
                    ...(!isIdoso() ? [{ label: 'Modelos', value: templatesForDisplay.length, tone: 'info' as const }] : []),
                ]}
            />

            {/* Seção 1: Detalhes da lista */}
            <Box sx={(theme) => ({
                mb: 2.5, borderRadius: 3, overflow: 'hidden',
                border: '1px solid', borderColor: alpha(theme.palette.primary.main, 0.12),
                boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.05)}, 0 1px 2px ${alpha('#000', 0.04)}`,
            })}>
                <Box sx={(theme) => ({
                    height: 4,
                    background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${alpha(theme.palette.primary.light, 0.7)} 100%)`,
                })} />
                <Box sx={{ p: { xs: 2, sm: 2.5 }, bgcolor: '#fff' }}>
                    <Stack spacing={2}>
                        <TextField
                            fullWidth
                            label="Título da lista"
                            placeholder="Ex: Compras da semana"
                            value={tituloLista}
                            onChange={(e) => setTituloLista(e.target.value)}
                            helperText="Dê um nome para identificar esta lista mais tarde. Exemplo: 'Compras de outubro' ou 'Feira semanal'."
                            sx={(theme) => ({
                                '& .MuiOutlinedInput-root': {
                                    '&.Mui-focused fieldset': { borderColor: theme.palette.primary.main, borderWidth: 2 },
                                },
                            })}
                        />

                        <Box>
                            <Typography variant="subtitle2" fontWeight={700} color="text.secondary" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <FavoriteIcon sx={{ fontSize: 15, color: 'warning.main' }} />
                                Condições de saúde consideradas
                                <Tooltip arrow placement="top" title="Essas são as condições de saúde registradas no seu perfil. Ao adicionar um produto que seja restrito para alguma dessas condições, você receberá um alerta automático com a sugestão de um produto alternativo mais saudável.">
                                    <InfoOutlinedIcon sx={{ fontSize: 15, color: 'text.disabled', cursor: 'help' }} />
                                </Tooltip>
                            </Typography>
                            {loadingPats ? (
                                <Chip label="Carregando..." variant="outlined" size="small" />
                            ) : patologias.length === 0 ? (
                                <Typography variant="caption" color="text.disabled">
                                    Nenhuma condição cadastrada no perfil.
                                </Typography>
                            ) : (
                                <Stack direction="row" spacing={0.8} flexWrap="wrap" useFlexGap>
                                    {patologias.map((p) => (
                                        <Chip
                                            key={p.id}
                                            size="small"
                                            icon={<WarningAmberIcon sx={{ fontSize: '14px !important' }} />}
                                            label={p.nome}
                                            sx={(theme) => ({
                                                fontWeight: 700,
                                                color: theme.palette.warning.dark,
                                                bgcolor: alpha(theme.palette.warning.light, 0.22),
                                                border: `1px solid ${alpha(theme.palette.warning.dark, 0.2)}`,
                                                '& .MuiChip-icon': { color: theme.palette.warning.dark },
                                            })}
                                        />
                                    ))}
                                </Stack>
                            )}
                        </Box>
                    </Stack>
                </Box>
            </Box>

            {/* Seção 2: Modelos rápidos (admin/cuidador only) */}
            {!isIdoso() && <Box sx={(theme) => ({
                mb: 2.5, borderRadius: 3, overflow: 'hidden',
                border: '1px solid', borderColor: alpha(theme.palette.primary.main, 0.12),
                boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.05)}, 0 1px 2px ${alpha('#000', 0.04)}`,
            })}>
                <Box sx={(theme) => ({
                    px: { xs: 2, sm: 2.5 }, py: 1.5,
                    background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                })}>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <AutoAwesomeIcon sx={{ color: 'rgba(255,255,255,0.9)', fontSize: 18 }} />
                        <Typography variant="subtitle2" fontWeight={700} sx={{ color: '#fff' }}>
                            Modelos rápidos
                        </Typography>
                        <Tooltip arrow placement="top" title="Modelos são listas pré-criadas que você pode copiar com um clique. Selecione um modelo abaixo para adicionar automaticamente todos os seus produtos à lista atual.">
                            <InfoOutlinedIcon sx={{ fontSize: 15, color: 'rgba(255,255,255,0.7)', cursor: 'help' }} />
                        </Tooltip>
                        <Chip
                            size="small"
                            label={`${templatesForDisplay.length} disponíveis`}
                            sx={{ bgcolor: 'rgba(255,255,255,0.18)', color: '#fff', fontSize: '0.68rem', height: 20, fontWeight: 600 }}
                        />
                    </Stack>
                    <Button
                        variant="text"
                        size="small"
                        onClick={() => navigate('/lista-compras/templates')}
                        sx={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.78rem', textTransform: 'none', fontWeight: 600,
                              '&:hover': { bgcolor: 'rgba(255,255,255,0.12)' } }}
                    >
                        Ver todos
                    </Button>
                </Box>
                <Box sx={{ p: { xs: 1.5, sm: 2 }, bgcolor: '#fff' }}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'stretch', sm: 'flex-start' }} justifyContent="space-between" spacing={2}>
                        <Box sx={{
                            flex: 1, width: '100%',
                            ...(isMobile ? {} : { maxWidth: '76%' }),
                            display: 'flex', flexDirection: 'row', alignItems: 'center',
                            overflowX: 'auto', gap: 1.25, py: 0.5, px: 0.5,
                            '&::-webkit-scrollbar': { height: 5 },
                            '&::-webkit-scrollbar-thumb': { borderRadius: 999, backgroundColor: 'rgba(0,0,0,0.15)' },
                        }}>
                            {templatesForDisplay.length === 0 ? (
                                <Typography color="text.secondary" variant="body2" sx={{ px: 1, py: 1.5 }}>
                                    Nenhum modelo ativo encontrado.
                                </Typography>
                            ) : (
                                templatesForDisplay.map((t) => (
                                    <Card
                                        key={t.id}
                                        elevation={0}
                                        sx={(theme) => ({
                                            flex: '0 0 210px', maxWidth: 210, borderRadius: 2.5,
                                            border: '1px solid', borderColor: alpha(theme.palette.primary.main, 0.15),
                                            overflow: 'hidden',
                                            transition: 'transform 0.16s ease, box-shadow 0.16s ease',
                                            '&:hover': {
                                                transform: 'translateY(-2px)',
                                                boxShadow: `0 8px 20px ${alpha(theme.palette.primary.main, 0.14)}`,
                                                borderColor: theme.palette.primary.main,
                                            },
                                        })}
                                    >
                                        <Box sx={(theme) => ({
                                            height: 3,
                                            background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${alpha(theme.palette.primary.light, 0.6)})`,
                                        })} />
                                        <Tooltip arrow placement="top" title={`Clique para copiar os itens de "${t.titulo}" para a sua lista atual. Os produtos já adicionados serão mantidos.`}>
                        <CardActionArea onClick={() => copiarTemplate(t)} sx={{ px: 1.5, py: 1.2 }}>
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <Box sx={(theme) => ({
                                                    width: 34, height: 34, borderRadius: 1.5, flexShrink: 0,
                                                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                                                    color: 'primary.main',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                })}>
                                                    <ContentCopyIcon sx={{ fontSize: 17 }} />
                                                </Box>
                                                <Box sx={{ minWidth: 0 }}>
                                                    <Typography fontWeight={800} variant="body2" noWrap sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                        {t.titulo}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {t.itens?.length ?? 0} itens
                                                    </Typography>
                                                </Box>
                                            </Stack>
                                        </CardActionArea>
                                        </Tooltip>
                                    </Card>
                                ))
                            )}
                        </Box>
                        <Tooltip arrow placement="top" title="Remove todos os produtos da lista para que você possa recomeçar do zero.">
                        <Box component="span">
                        <Button
                            variant="outlined" color="error" startIcon={<RestartAltIcon />}
                            sx={{ height: 44, whiteSpace: 'nowrap', flexShrink: 0, width: { xs: '100%', sm: 'auto' }, textTransform: 'none' }}
                            onClick={handleLimparLista}
                            disabled={saving || listaItens.length === 0}
                        >
                            Limpar lista
                        </Button>
                        </Box>
                        </Tooltip>
                    </Stack>
                </Box>
            </Box>}

            {/* Seção 3: Adicionar itens + lista */}
            <Box sx={(theme) => ({
                mb: 2.5, borderRadius: 3, overflow: 'hidden',
                border: '1px solid', borderColor: alpha(theme.palette.divider, 0.9),
                boxShadow: `0 2px 8px ${alpha('#000', 0.04)}`,
                bgcolor: '#fff',
            })}>
                {/* Adicionar */}
                <Box sx={(theme) => ({
                    p: { xs: 2, sm: 2.5 },
                    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.7)}`,
                    bgcolor: alpha(theme.palette.primary.main, 0.015),
                })}>
                    <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5, color: 'text.secondary' }}>
                        Adicionar produto à lista
                    </Typography>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                        <Autocomplete
                            fullWidth
                            options={opcoesAutocomplete}
                            inputValue={inputValue}
                            onInputChange={(_, v) => setInputValue(v)}
                            onChange={(_, opt) => {
                                if (!opt) { setProdutoSelecionado(null); return; }
                                if (typeof opt === 'string') { setProdutoSelecionado(null); setInputValue(opt); return; }
                                let p = catalogo.find((c) => c.id === opt.value) || null;
                                if (!p) {
                                    p = { id: opt.value, nome: opt.label, nome_normalizado: opt.label.toLowerCase(), ativo: true, is_personalizado: false };
                                    setCatalogo((prev) => [p!, ...prev]);
                                }
                                setProdutoSelecionado(p);
                            }}
                            freeSolo
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Buscar produto"
                                    placeholder="Digite ao menos 3 letras..."
                                    size="medium"
                                    helperText="Digite pelo menos 3 letras para pesquisar no catálogo. Caso não encontre, você pode digitar o nome manualmente."
                                />
                            )}
                        />
                        <Tooltip arrow placement="top" title="Toque aqui para incluir o produto pesquisado na sua lista de compras.">
                        <Button
                            onClick={handleAdicionar}
                            variant="contained"
                            startIcon={<LocalGroceryStoreIcon />}
                            sx={(theme) => ({
                                px: 3,
                                minWidth: { xs: '100%', sm: 148 },
                                height: 56,
                                textTransform: 'none',
                                fontWeight: 700,
                                background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                                boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.35)}`,
                                '&:hover': { boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.45)}` },
                            })}
                        >
                            Adicionar
                        </Button>
                        </Tooltip>
                    </Stack>
                </Box>

                {/* Lista de itens */}
                <Box sx={{ p: { xs: 2, sm: 2.5 } }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                        <Box>
                            <Typography variant="subtitle2" fontWeight={700} color="text.secondary">
                                Itens da lista
                            </Typography>
                            <Typography variant="caption" color="text.disabled">
                                {totalUnidades} unidade{totalUnidades === 1 ? '' : 's'} em {totalProdutos} produto{totalProdutos === 1 ? '' : 's'}
                                {totalAlertas > 0 && ` · ${totalAlertas} alerta${totalAlertas === 1 ? '' : 's'}`}
                            </Typography>
                        </Box>
                        {isIdoso() && listaItens.length > 0 && (
                            <Tooltip arrow title="Remove todos os produtos da lista para começar de novo.">
                            <Button size="small" variant="outlined" color="error" startIcon={<RestartAltIcon />}
                                sx={{ textTransform: 'none', fontSize: '0.78rem' }} onClick={handleLimparLista}>
                                Limpar
                            </Button>
                            </Tooltip>
                        )}
                    </Stack>

                    {listaItens.length === 0 ? (
                        <EmptyState
                            icon={<LocalGroceryStoreIcon />}
                            title="Sua lista ainda está vazia"
                            description="Busque e adicione produtos pelo campo acima."
                        />
                    ) : (
                        <List disablePadding sx={{ borderRadius: 2.5, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
                            {listaItens.map((li, idx) => {
                                const riscos = riscosPorProduto[li.produto.id] ?? [];
                                const hasRisk = riscos.length > 0;
                                const primeiraSugestao = riscos[0]?.produtoSugestao;

                                const actionButtons = (
                                    <Stack direction="row" spacing={0.5} alignItems="center" flexShrink={0}>
                                        {hasRisk && primeiraSugestao && (
                                            <Tooltip arrow placement="top" title={`Este produto pode ser inadequado para sua condição de saúde. Toque aqui para substituir por "${primeiraSugestao.nome}", uma opção mais indicada.`}>
                                                <IconButton
                                                    size="small"
                                                    sx={(theme) => ({
                                                        color: theme.palette.warning.dark,
                                                        bgcolor: alpha(theme.palette.warning.light, 0.18),
                                                        '&:hover': { bgcolor: alpha(theme.palette.warning.light, 0.35) },
                                                    })}
                                                    onClick={() => substituirProdutoNaLista(li.produto.id, {
                                                        id: primeiraSugestao.id, nome: primeiraSugestao.nome,
                                                        nome_normalizado: primeiraSugestao.nomeNormalizado?.toLowerCase().trim() ?? primeiraSugestao.nome.toLowerCase().trim(),
                                                        ativo: primeiraSugestao.ativo ?? true,
                                                        is_personalizado: primeiraSugestao.isPersonalizado ?? false,
                                                    })}
                                                >
                                                    <RecommendIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                        <Stack direction="row" spacing={0} alignItems="center"
                                            sx={(theme) => ({
                                                border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
                                                borderRadius: 2, overflow: 'hidden',
                                            })}
                                        >
                                            <Tooltip arrow title="Diminuir a quantidade deste produto">
                                            <IconButton size="small" onClick={() => decQtd(li.produto.id)} sx={{ borderRadius: 0, width: 30, height: 30 }}>
                                                <RemoveIcon sx={{ fontSize: 14 }} />
                                            </IconButton>
                                            </Tooltip>
                                            <Tooltip arrow title="Quantidade atual deste produto na lista">
                                            <Typography variant="body2" sx={(theme) => ({
                                                minWidth: 32, textAlign: 'center', fontWeight: 900,
                                                fontSize: '0.875rem', px: 0.5,
                                                bgcolor: alpha(theme.palette.primary.main, 0.07),
                                                color: 'primary.main',
                                                cursor: 'default',
                                            })}>
                                                {li.qtd}
                                            </Typography>
                                            </Tooltip>
                                            <Tooltip arrow title="Aumentar a quantidade deste produto">
                                            <IconButton size="small" onClick={() => incQtd(li.produto.id)} sx={{ borderRadius: 0, width: 30, height: 30 }}>
                                                <AddIcon sx={{ fontSize: 14 }} />
                                            </IconButton>
                                            </Tooltip>
                                        </Stack>
                                        <Tooltip arrow title="Remover este produto da lista">
                                        <IconButton size="small" color="error" onClick={() => remover(li.produto.id)}
                                            sx={(theme) => ({ '&:hover': { bgcolor: alpha(theme.palette.error.light, 0.15) } })}>
                                            <DeleteOutlineIcon fontSize="small" />
                                        </IconButton>
                                        </Tooltip>
                                    </Stack>
                                );

                                return (
                                    <ListItem
                                        key={li.produto.id}
                                        sx={(theme) => ({
                                            px: { xs: 1.5, sm: 2 },
                                            py: isMobile ? 1.6 : 1.25,
                                            minHeight: 64,
                                            alignItems: isMobile ? 'flex-start' : 'center',
                                            flexDirection: isMobile ? 'column' : 'row',
                                            borderBottom: idx < listaItens.length - 1 ? `1px solid ${theme.palette.divider}` : 'none',
                                            borderLeft: hasRisk ? `3px solid ${theme.palette.warning.main}` : '3px solid transparent',
                                            bgcolor: hasRisk ? alpha(theme.palette.warning.light, 0.06) : 'transparent',
                                            transition: 'background-color .15s',
                                            '&:hover': {
                                                bgcolor: hasRisk ? alpha(theme.palette.warning.light, 0.12) : alpha(theme.palette.primary.light, 0.04),
                                            },
                                            gap: isMobile ? 0.5 : 0,
                                        })}
                                        secondaryAction={!isMobile ? actionButtons : undefined}
                                    >
                                        {hasRisk ? (
                                            <ListItemIcon sx={{ minWidth: 30 }}>
                                                <Tooltip title={
                                                    <Box>
                                                        <Typography fontWeight={600}>Pode não ser adequado para:</Typography>
                                                        {riscos.map((r) => (
                                                            <Box key={r.patologia.id}>{r.patologia.nome}: <b>{r.produtoSugestao?.nome ?? 'sem sugestão'}</b></Box>
                                                        ))}
                                                    </Box>
                                                }>
                                                    <WarningAmberIcon color="warning" fontSize="small" />
                                                </Tooltip>
                                            </ListItemIcon>
                                        ) : (
                                            <ListItemIcon sx={{ minWidth: 30 }} />
                                        )}

                                        <ListItemText
                                            primary={
                                                <Stack direction="row" spacing={0.8} alignItems="center" flexWrap={isMobile ? 'wrap' : 'nowrap'} sx={{ rowGap: 0.5 }}>
                                                    <Typography fontWeight={700} sx={{ fontSize: '0.95rem' }}>
                                                        {li.produto.nome}
                                                    </Typography>
                                                    {li.produto.is_personalizado && (
                                                        <Chip size="small" label="Personalizado" variant="outlined" sx={{ fontSize: '0.65rem', height: 18 }} />
                                                    )}
                                                    {hasRisk && (
                                                        <Chip size="small" label="Restrição" color="warning" variant="outlined" sx={{ fontSize: '0.65rem', height: 18 }} />
                                                    )}
                                                </Stack>
                                            }
                                            secondary={
                                                hasRisk
                                                    ? 'Há uma sugestão mais adequada para esta condição.'
                                                    : li.produto.is_personalizado ? 'Item personalizado' : 'Produto do catálogo'
                                            }
                                        />

                                        {isMobile && (
                                            <Box sx={{ mt: 0.75, width: '100%', display: 'flex', justifyContent: 'flex-end' }}>
                                                {actionButtons}
                                            </Box>
                                        )}
                                    </ListItem>
                                );
                            })}
                        </List>
                    )}
                </Box>
            </Box>

            {/* Footer */}
            <Stack
                direction={{ xs: 'column-reverse', sm: 'row' }}
                justifyContent="space-between"
                alignItems={{ xs: 'stretch', sm: 'center' }}
                spacing={1}
                sx={(theme) => ({
                    p: { xs: 1.5, sm: 2 },
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: alpha(theme.palette.primary.main, 0.12),
                    bgcolor: alpha('#fff', 0.92),
                    backdropFilter: 'blur(12px)',
                    boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.08)}`,
                    position: { xs: 'sticky', sm: 'static' },
                    bottom: { xs: 8, sm: 'auto' },
                    zIndex: 1,
                })}
            >
                <Typography color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' }, fontSize: '0.9rem' }}>
                    {totalProdutos > 0
                        ? `${totalProdutos} produto${totalProdutos === 1 ? '' : 's'} pronto${totalProdutos === 1 ? '' : 's'} para salvar`
                        : 'Adicione produtos para salvar a lista'}
                </Typography>

                <Stack direction={{ xs: 'column-reverse', sm: 'row' }} spacing={1}>
                    <Tooltip arrow title="Descarta as alterações e volta à tela anterior sem salvar a lista.">
                    <Button
                        variant="outlined" color="error"
                        onClick={() => navigate('/lista-compras')}
                        disabled={saving}
                        sx={{ textTransform: 'none', width: { xs: '100%', sm: 'auto' } }}
                    >
                        Cancelar
                    </Button>
                    </Tooltip>
                    <Tooltip arrow placement="top" title="Salva sua lista com todos os produtos adicionados. Você poderá acessá-la depois em 'Minhas listas'.">
                    <Box component="span">
                    <Button
                        variant="contained"
                        onClick={handleFinalizarLista}
                        startIcon={saving ? undefined : <CheckCircleIcon />}
                        disabled={saving || listaItens.length === 0}
                        sx={(theme) => ({
                            width: { xs: '100%', sm: 'auto' },
                            textTransform: 'none', fontWeight: 700,
                            background: saving ? undefined : `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                            boxShadow: saving ? 'none' : `0 4px 14px ${alpha(theme.palette.primary.main, 0.35)}`,
                        })}
                    >
                        {saving ? 'Salvando...' : 'Finalizar lista'}
                    </Button>
                    </Box>
                    </Tooltip>
                </Stack>
            </Stack>

            <Snackbar open={warnOpen} autoHideDuration={7000} onClose={() => setWarnOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                <Alert onClose={() => setWarnOpen(false)} severity="warning" variant="filled" sx={{ width: '100%' }}>{warnMsg}</Alert>
            </Snackbar>
            <Snackbar open={errorOpen} autoHideDuration={6000} onClose={() => setErrorOpen(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert onClose={() => setErrorOpen(false)} severity="error" variant="filled" sx={{ width: '100%' }}>{errorMsg}</Alert>
            </Snackbar>
        </ShoppingPage>
    );
}
