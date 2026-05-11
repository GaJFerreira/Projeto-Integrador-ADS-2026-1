import { useEffect, useMemo, useRef, useState } from 'react';
import {
    Box,
    Typography,
    Autocomplete,
    TextField,
    Button,
    Card,
    CardActionArea,
    List,
    ListItem,
    ListItemText,
    IconButton,
    Stack,
    Snackbar,
    Chip,
    Tooltip,
    Alert,
    ListItemIcon,
    useMediaQuery,
    useTheme,
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
import { useNavigate } from 'react-router-dom';
import { alpha } from '@mui/material/styles';

import type {
    Produto,
    ListaItemVM,
    Patologia,
    ProdutoSubstituivel,
} from '../types';
import { listaComprasService } from '../api/service/listaComprasService.ts';
import { listaViewService, type ListaDTO } from '@/features/lista-compras/api/service/listaViewService.ts';
import { patologiasService } from '@/features/lista-compras/api/service/patologiaService.ts';
import { produtoService } from '@/features/lista-compras/api/service/produtoService.ts';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import {
    EmptyState,
    SectionTitle,
    ShoppingHeader,
    ShoppingPage,
} from '@/features/lista-compras/components/ShoppingUi.tsx';

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
    const [opcoesAutocomplete, setOpcoesAutocomplete] = useState<
        { label: string; value: number }[]
    >([]);

    const [riscosPorProduto, setRiscosPorProduto] = useState<
        Record<number, ProdutoSubstituivel[]>
    >({});

    const [patologias, setPatologias] = useState<Patologia[]>([]);
    const [loadingPats, setLoadingPats] = useState(false);

    // snackbar de alerta por patologia
    const [warnOpen, setWarnOpen] = useState(false);
    const [warnMsg, setWarnMsg] = useState('');

    const [tituloLista, setTituloLista] = useState('');

    const [saving, setSaving] = useState(false);

    const [errorOpen, setErrorOpen] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const [successOpen, setSuccessOpen] = useState(false);

    const showError = (msg: string) => {
        setErrorMsg(msg);
        setErrorOpen(true);
    };

    const templatesForDisplay = useMemo(() => {
        return templates.filter((t) => t.status !== 'FINALIZADA');
    }, [templates]);

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

                const tpls = await listaViewService.listarTemplates();

                setTemplates(tpls);
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
        if (inputValue.trim().length < 3) {
            setOpcoesAutocomplete([]);
            return;
        }
        let ativo = true;
        const handler = setTimeout(async () => {
            try {
                const produtos = await listaComprasService.searchProdutosByNome(inputValue);
                if (!ativo) return;

                setOpcoesAutocomplete(
                    produtos.map((p) => ({
                        label: p.nome,
                        value: p.id,
                    })),
                );
            } catch (e) {
                showError('Erro ao buscar produtos para autocomplete.');
            }
        }, 300);

        return () => {
            ativo = false;
            clearTimeout(handler);
        };
    }, [inputValue]);

    const ensureProduto = (nomeDigitado: string): Produto => {
        const nn = normalize(nomeDigitado);
        const existente = catalogo.find((p) => p.nome_normalizado === nn);
        if (existente) return existente;

        const novo: Produto = {
            id: -Date.now(),
            nome: nomeDigitado.trim(),
            nome_normalizado: nn,
            ativo: true,
            is_personalizado: true,
        };
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

        if (!titulo) {
            showError('Informe um título para a lista.');
            return;
        }

        if (listaItens.length === 0) {
            showError('Adicione ao menos um item na lista.');
            return;
        }

        const itensValidos = listaItens.filter((li) => li.produto.id > 0);

        if (itensValidos.length === 0) {
            showError('Não há itens válidos para salvar (apenas personalizados locais).');
            return;
        }

        const payload = {
            titulo,
            itens: itensValidos.map((li) => ({
                produtoId: li.produto.id,
                qtd: li.qtd,
            })),
        };

        try {
            setSaving(true);

            await listaComprasService.criarLista(payload);
            resetState();
            setSuccessOpen(true);
        } catch (e) {
            showError(
                'Erro ao carregar dados iniciais da lista de compras. Tente novamente.',
            );
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
                    setRiscosPorProduto((prev) => ({
                        ...prev,
                        [p.id]: substituiveis,
                    }));

                    const nomesPats = Array.from(
                        new Set(substituiveis.map((s) => s.patologia.nome)),
                    ).join(', ');
                    setWarnMsg(
                        `Atenção: "${p.nome}" pode não ser adequado para: ${nomesPats}. ` +
                        `Veja as sugestões na lista.`,
                    );
                    setWarnOpen(true);
                }
            } catch (e) {
                console.error('Erro ao buscar substituíveis para produto', p, e);
            }
        }
    };

    const substituirProdutoNaLista = (produtoId: number, sugestao: Produto) => {
        setListaItens((prev) =>
            prev.map((li) =>
                li.produto.id === produtoId ? { ...li, produto: sugestao } : li,
            ),
        );

        setCatalogo((prev) => {
            const exists = prev.some((p) => p.id === sugestao.id);
            return exists ? prev : [sugestao, ...prev];
        });

        setRiscosPorProduto((prev) => {
            const clone = { ...prev };
            delete clone[produtoId];
            return clone;
        });
    };

    const copiarTemplate = (tpl: ListaDTO) => {
        const itensTemplate = tpl.itens;
        if (!itensTemplate || itensTemplate.length === 0) {
            showError('Este modelo não possui itens cadastrados.');
            return;
        }
        setListaItens((prev) => {
            const map = new Map<number, { produto: Produto; qtd: number }>();

            prev.forEach((li) => {
                map.set(li.produto.id, { produto: li.produto, qtd: li.qtd });
            });

            itensTemplate.forEach((it) => {
                const pApi = it.produto;
                if (!pApi) return;
                const produtoApi = pApi as Produto & {
                    nomeNormalizado?: string;
                    isPersonalizado?: boolean;
                };

                const produto: Produto = {
                    id: produtoApi.id,
                    nome: produtoApi.nome,
                    nome_normalizado:
                        produtoApi.nome_normalizado ??
                        produtoApi.nomeNormalizado?.toLowerCase().trim() ??
                        produtoApi.nome.toLowerCase().trim(),
                    ativo: produtoApi.ativo ?? true,
                    is_personalizado:
                        produtoApi.is_personalizado ??
                        produtoApi.isPersonalizado ??
                        false,
                };

                const qtdTemplate = Number(it.qtd ?? 1);
                const existente = map.get(produto.id);

                if (existente) {
                    map.set(produto.id, {
                        produto: existente.produto,
                        qtd: existente.qtd + qtdTemplate,
                    });
                } else {
                    map.set(produto.id, { produto, qtd: qtdTemplate });
                }
            });

            setCatalogo((old) => {
                const ids = new Set(old.map((p) => p.id));
                const extras: Produto[] = [];
                map.forEach(({ produto }) => {
                    if (!ids.has(produto.id)) {
                        extras.push(produto);
                    }
                });
                return [...old, ...extras];
            });

            return Array.from(map.values());
        });
    };

    const handleLimparLista = () => {
        setListaItens([]);
        setProdutoSelecionado(null);
        setInputValue('');
    };

    const resetState = () => {
        setTituloLista('');
        setListaItens([]);
        setProdutoSelecionado(null);
        setInputValue('');
        setOpcoesAutocomplete([]);
    };

    const incQtd = (id: number) =>
        setListaItens((prev) =>
            prev.map((li) =>
                li.produto.id === id ? { ...li, qtd: li.qtd + 1 } : li,
            ),
        );

    const decQtd = (id: number) =>
        setListaItens((prev) =>
            prev.map((li) =>
                li.produto.id === id
                    ? { ...li, qtd: Math.max(1, li.qtd - 1) }
                    : li,
            ),
        );

    const remover = (id: number) =>
        setListaItens((prev) => prev.filter((li) => li.produto.id !== id));

    const totalProdutos = listaItens.length;
    const totalUnidades = listaItens.reduce((acc, li) => acc + li.qtd, 0);
    const totalAlertas = listaItens.filter(
        (li) => (riscosPorProduto[li.produto.id] ?? []).length > 0,
    ).length;

    return (
        <ShoppingPage maxWidth={1180}>
            <ShoppingHeader
                eyebrow="Compre com Saúde"
                title="Criar nova lista"
                description="Monte uma compra organizada com alertas de restrição e modelos prontos para acelerar a rotina."
                icon={<PlaylistAddCheckIcon />}
                onBack={() => navigate('/lista-compras', { replace: true })}
                actions={
                    <>
                        <Button
                            variant="contained"
                            startIcon={<ViewListIcon />}
                            onClick={() => navigate('/lista-compras/listas')}
                        >
                            Minhas listas
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<ContentCopyIcon />}
                            onClick={() => navigate('/lista-compras/templates')}
                        >
                            Templates
                        </Button>
                    </>
                }
                metrics={[
                    { label: 'Produtos', value: totalProdutos, tone: 'primary' },
                    { label: 'Unidades', value: totalUnidades, tone: 'success' },
                    { label: 'Alertas', value: totalAlertas, tone: 'warning' },
                    { label: 'Modelos', value: templatesForDisplay.length, tone: 'info' },
                ]}
            />

            <Box
                sx={(theme) => ({
                    mb: 2.4,
                    p: { xs: 2, sm: 2.5 },
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: alpha(theme.palette.primary.main, 0.14),
                    bgcolor: 'background.paper',
                    boxShadow: `0 16px 42px ${alpha(theme.palette.primary.main, 0.07)}`,
                })}
            >
                <Stack spacing={2}>
                    <TextField
                        fullWidth
                        label="Título da lista"
                        placeholder="Ex: Compras da semana"
                        value={tituloLista}
                        onChange={(e) => setTituloLista(e.target.value)}
                    />

                    <Box>
                        <SectionTitle
                            title="Condições consideradas"
                            description="Os alertas aparecem nos itens que tiverem sugestões mais adequadas."
                        />

                        {loadingPats ? (
                            <Chip label="Carregando condições..." variant="outlined" />
                        ) : patologias.length === 0 ? (
                            <Chip label="Nenhuma condição cadastrada" variant="outlined" />
                        ) : (
                            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                {patologias.map((p) => (
                                    <Chip
                                        key={p.id}
                                        icon={<WarningAmberIcon />}
                                        label={p.nome}
                                        sx={(theme) => ({
                                            height: 34,
                                            fontWeight: 800,
                                            color: theme.palette.warning.dark,
                                            backgroundColor: alpha(theme.palette.warning.light, 0.24),
                                            border: '1px solid',
                                            borderColor: alpha(theme.palette.warning.dark, 0.24),
                                            '& .MuiChip-icon': {
                                                color: theme.palette.warning.dark,
                                            },
                                        })}
                                    />
                                ))}
                            </Stack>
                        )}
                    </Box>
                </Stack>
            </Box>

            <Box
                sx={(theme) => ({
                    mb: 3,
                    p: { xs: 2, sm: 2.5 },
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: alpha(theme.palette.divider, 0.9),
                    backgroundColor: '#ffffff',
                    boxShadow: `0 18px 48px ${alpha(theme.palette.common.black, 0.07)}`,
                })}
            >
                <Stack spacing={2}>
                    {/* Modelos rápidos */}
                    <Box>
                        <SectionTitle
                            title="Modelos rápidos"
                            description="Listas prontas para começar com menos passos."
                            action={
                                <Button
                                    variant="text"
                                    size="small"
                                    startIcon={<AutoAwesomeIcon />}
                                    onClick={() => navigate('/lista-compras/templates')}
                                    sx={{ px: 1 }}
                                >
                                    Ver todos
                                </Button>
                            }
                        />

                        <Stack
                            direction={{ xs: 'column', sm: 'row' }}
                            alignItems={{ xs: 'stretch', sm: 'flex-start' }}
                            justifyContent="space-between"
                            spacing={2}
                        >
                            <Box
                                sx={{
                                    flex: 1,
                                    width: '100%',
                                    ...(isMobile ? {} : { maxWidth: '76%' }),
                                    display: 'flex',
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    overflowX: 'auto',
                                    gap: 1.25,
                                    py: 1,
                                    px: 1,
                                    borderRadius: 2.5,
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    backgroundColor: 'rgba(247,249,252,0.84)',
                                    '&::-webkit-scrollbar': {
                                        height: 6,
                                    },
                                    '&::-webkit-scrollbar-thumb': {
                                        borderRadius: 999,
                                        backgroundColor: 'rgba(0,0,0,0.20)',
                                    },
                                }}
                            >
                                {templatesForDisplay.length === 0 ? (
                                    <Typography color="text.secondary" sx={{ px: 1, py: 1.2 }}>
                                        Nenhum modelo ativo encontrado.
                                    </Typography>
                                ) : (
                                    templatesForDisplay.map((t) => (
                                        <Card
                                            key={t.id}
                                            elevation={0}
                                            sx={(theme) => ({
                                                flex: '0 0 238px',
                                                maxWidth: 238,
                                                minHeight: 76,
                                                borderRadius: 2,
                                                border: '1px solid',
                                                borderColor: alpha(theme.palette.primary.main, 0.14),
                                                display: 'flex',
                                                alignItems: 'stretch',
                                                backgroundColor: 'background.paper',
                                                transition:
                                                    'transform 0.16s ease, box-shadow 0.16s ease, border-color 0.16s',
                                                '&:hover': {
                                                    transform: 'translateY(-2px)',
                                                    boxShadow: `0 14px 28px ${alpha(theme.palette.primary.main, 0.12)}`,
                                                    borderColor: theme.palette.primary.light,
                                                },
                                            })}
                                        >
                                            <CardActionArea
                                                onClick={() => copiarTemplate(t)}
                                                sx={{
                                                    px: 1.35,
                                                    py: 1,
                                                }}
                                            >
                                                <Stack
                                                    direction="row"
                                                    spacing={1.25}
                                                    alignItems="center"
                                                >
                                                    <Box
                                                        sx={(theme) => ({
                                                            width: 38,
                                                            height: 38,
                                                            borderRadius: 2,
                                                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                                                            color: 'primary.main',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            flexShrink: 0,
                                                        })}
                                                    >
                                                        <ContentCopyIcon sx={{ fontSize: 20 }} />
                                                    </Box>

                                                    <Box sx={{ minWidth: 0 }}>
                                                        <Typography
                                                            fontWeight={800}
                                                            variant="body2"
                                                            sx={{
                                                                whiteSpace: 'nowrap',
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',
                                                            }}
                                                        >
                                                            {t.titulo}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {t.itens?.length ?? 0} itens
                                                        </Typography>
                                                    </Box>
                                                </Stack>
                                            </CardActionArea>
                                        </Card>
                                    ))
                                )}
                            </Box>

                            <Button
                                variant="outlined"
                                color="error"
                                startIcon={<RestartAltIcon />}
                                sx={{
                                    height: 48,
                                    whiteSpace: 'nowrap',
                                    flexShrink: 0,
                                    width: { xs: '100%', sm: 'auto' },
                                    alignSelf: { xs: 'stretch', sm: 'center' },
                                }}
                                onClick={handleLimparLista}
                                disabled={saving || listaItens.length === 0}
                            >
                                Limpar lista
                            </Button>
                        </Stack>
                    </Box>

                    {/* Campo de adição */}
                    <Box>
                        <SectionTitle
                            title="Adicionar itens"
                            description="Busque no catálogo ou registre um item personalizado."
                        />
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                            <Autocomplete
                                fullWidth
                                options={opcoesAutocomplete}
                                inputValue={inputValue}
                                onInputChange={(_, v) => setInputValue(v)}
                                onChange={(_, opt) => {
                                    if (!opt) {
                                        setProdutoSelecionado(null);
                                        return;
                                    }
                                    if (typeof opt === 'string') {
                                        setProdutoSelecionado(null);
                                        setInputValue(opt);
                                        return;
                                    }

                                    let p =
                                        catalogo.find((c) => c.id === opt.value) || null;

                                    if (!p) {
                                        p = {
                                            id: opt.value,
                                            nome: opt.label,
                                            nome_normalizado: opt.label.toLowerCase(),
                                            ativo: true,
                                            is_personalizado: false,
                                        };
                                        setCatalogo((prev) => [p!, ...prev]);
                                    }

                                    setProdutoSelecionado(p);
                                }}
                                freeSolo
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Adicionar item"
                                        placeholder="Digite ou selecione um produto"
                                        size="medium"
                                    />
                                )}
                            />
                            <Button
                                onClick={handleAdicionar}
                                variant="contained"
                                startIcon={<LocalGroceryStoreIcon />}
                                sx={{
                                    px: 3,
                                    minWidth: { xs: '100%', sm: 140 },
                                    height: 56,
                                    textTransform: 'none',
                                    fontWeight: 600,
                                }}
                            >
                                Adicionar
                            </Button>
                        </Stack>
                    </Box>

                    {/* Itens da lista */}
                    <Box>
                        <SectionTitle
                            title="Itens da lista"
                            description={`${totalUnidades} unidade${totalUnidades === 1 ? '' : 's'} em ${totalProdutos} produto${totalProdutos === 1 ? '' : 's'}.`}
                        />

                        {listaItens.length === 0 ? (
                            <EmptyState
                                icon={<LocalGroceryStoreIcon />}
                                title="Sua lista ainda está vazia"
                                description="Adicione produtos pelo campo acima ou comece usando um modelo."
                            />
                        ) : (
                            <List
                                disablePadding
                                sx={{
                                    backgroundColor: '#ffffff',
                                    borderRadius: 2.5,
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    overflow: 'hidden',
                                }}
                            >
                            {listaItens.map((li, idx) => {
                                const riscos = riscosPorProduto[li.produto.id] ?? [];
                                const hasRisk = riscos.length > 0;
                                const primeiraSugestao = riscos[0]?.produtoSugestao;

                                const actionButtons = (
                                    <Stack
                                        direction="row"
                                        spacing={0.5}
                                        alignItems="center"
                                    >
                                        {hasRisk && primeiraSugestao && (
                                            <Tooltip
                                                title={`Trocar por ${primeiraSugestao.nome}`}
                                            >
                                                <IconButton
                                                    size="small"
                                                    color="warning"
                                                    aria-label={`Trocar ${li.produto.nome} por ${primeiraSugestao.nome}`}
                                                    onClick={() =>
                                                        substituirProdutoNaLista(
                                                            li.produto.id,
                                                            {
                                                                id: primeiraSugestao.id,
                                                                nome: primeiraSugestao.nome,
                                                                nome_normalizado:
                                                                    primeiraSugestao.nomeNormalizado
                                                                        ?.toLowerCase()
                                                                        .trim() ??
                                                                    primeiraSugestao.nome
                                                                        .toLowerCase()
                                                                        .trim(),
                                                                ativo:
                                                                    primeiraSugestao.ativo ??
                                                                    true,
                                                                is_personalizado:
                                                                    primeiraSugestao.isPersonalizado ??
                                                                    false,
                                                            },
                                                        )
                                                    }
                                                >
                                                    <RecommendIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        )}

                                        <IconButton
                                            size="small"
                                            aria-label={`Diminuir quantidade de ${li.produto.nome}`}
                                            onClick={() => decQtd(li.produto.id)}
                                        >
                                            <RemoveIcon fontSize="small" />
                                        </IconButton>

                                        <Typography
                                            variant="body2"
                                            sx={(theme) => ({
                                                minWidth: 34,
                                                height: 30,
                                                px: 1,
                                                borderRadius: 1.5,
                                                display: 'grid',
                                                placeItems: 'center',
                                                textAlign: 'center',
                                                fontWeight: 900,
                                                bgcolor: alpha(theme.palette.primary.main, 0.08),
                                                color: 'primary.main',
                                            })}
                                        >
                                            {li.qtd}
                                        </Typography>

                                        <IconButton
                                            size="small"
                                            aria-label={`Aumentar quantidade de ${li.produto.nome}`}
                                            onClick={() => incQtd(li.produto.id)}
                                        >
                                            <AddIcon fontSize="small" />
                                        </IconButton>

                                        <IconButton
                                            size="small"
                                            color="error"
                                            aria-label={`Remover ${li.produto.nome}`}
                                            onClick={() => remover(li.produto.id)}
                                        >
                                            <DeleteOutlineIcon fontSize="small" />
                                        </IconButton>
                                    </Stack>
                                );

                                return (
                                    <ListItem
                                        key={li.produto.id}
                                        sx={(theme) => ({
                                            px: { xs: 1.5, sm: 2 },
                                            py: isMobile ? 1.6 : 1.25,
                                            minHeight: isMobile ? undefined : 72,
                                            alignItems: isMobile ? 'flex-start' : 'center',
                                            flexDirection: isMobile ? 'column' : 'row',
                                            borderBottom:
                                                idx < listaItens.length - 1
                                                    ? `1px solid ${theme.palette.divider}`
                                                    : 'none',
                                            ...(hasRisk && {
                                                borderLeft: `4px solid ${theme.palette.warning.main}`,
                                                backgroundColor: alpha(theme.palette.warning.light, 0.12),
                                            }),
                                            '&:hover': {
                                                bgcolor: hasRisk
                                                    ? alpha(theme.palette.warning.light, 0.16)
                                                    : alpha(theme.palette.primary.light, 0.045),
                                            },
                                            gap: isMobile ? 0.5 : 0,
                                        })}
                                        secondaryAction={!isMobile ? actionButtons : undefined}
                                    >
                                        {hasRisk ? (
                                            <ListItemIcon sx={{ minWidth: 30 }}>
                                                <Tooltip
                                                    title={
                                                        <Box>
                                                            <Typography fontWeight={600}>
                                                                Pode não ser adequado para:
                                                            </Typography>
                                                            {riscos.map((r) => (
                                                                <Box
                                                                    key={r.patologia.id}
                                                                >
                                                                    {r.patologia.nome}: <b>{r.produtoSugestao?.nome ?? 'sem sugestão cadastrada'}</b>
                                                                </Box>
                                                            ))}
                                                        </Box>
                                                    }
                                                >
                                                    <WarningAmberIcon
                                                        color="warning"
                                                        fontSize="small"
                                                    />
                                                </Tooltip>
                                            </ListItemIcon>
                                        ) : (
                                            <ListItemIcon sx={{ minWidth: 30 }} />
                                        )}

                                        <ListItemText
                                            primary={
                                                <Stack
                                                    direction="row"
                                                    spacing={1}
                                                    alignItems="center"
                                                    sx={{
                                                        flexWrap: isMobile
                                                            ? 'wrap'
                                                            : 'nowrap',
                                                        rowGap: 0.5,
                                                    }}
                                                >
                                                    <Typography fontWeight={600}>
                                                        {li.produto.nome}
                                                    </Typography>

                                                    {li.produto.is_personalizado && (
                                                        <Chip
                                                            size="small"
                                                            label="Personalizado"
                                                            variant="outlined"
                                                        />
                                                    )}

                                                    {hasRisk && (
                                                        <Chip
                                                            size="small"
                                                            label="Restrição"
                                                            color="warning"
                                                            variant="outlined"
                                                        />
                                                    )}
                                                </Stack>
                                            }
                                            secondary={
                                                hasRisk
                                                    ? 'Há uma sugestão mais adequada para esta condição.'
                                                    : li.produto.is_personalizado
                                                      ? 'Item personalizado'
                                                      : 'Produto do catálogo'
                                            }
                                        />

                                        {isMobile && (
                                            <Box
                                                sx={{
                                                    mt: 0.75,
                                                    width: '100%',
                                                    display: 'flex',
                                                    justifyContent: 'flex-end',
                                                }}
                                            >
                                                {actionButtons}
                                            </Box>
                                        )}
                                    </ListItem>
                                );
                            })}
                        </List>
                        )}
                    </Box>
                </Stack>
            </Box>

            <Stack
                direction={{ xs: 'column-reverse', sm: 'row' }}
                justifyContent="space-between"
                alignItems={{ xs: 'stretch', sm: 'center' }}
                spacing={1}
                sx={(theme) => ({
                    mt: 3,
                    p: 1.5,
                    borderRadius: 3,
                    border: '1px solid',
                    borderColor: alpha(theme.palette.divider, 0.95),
                    bgcolor: alpha(theme.palette.background.paper, 0.92),
                    backdropFilter: 'blur(12px)',
                    position: { xs: 'sticky', sm: 'static' },
                    bottom: { xs: 8, sm: 'auto' },
                    zIndex: 1,
                })}
            >
                <Typography
                    color="text.secondary"
                    sx={{
                        display: { xs: 'none', sm: 'block' },
                        fontSize: '0.95rem',
                    }}
                >
                    {totalProdutos > 0
                        ? `${totalProdutos} produto${totalProdutos === 1 ? '' : 's'} pronto${totalProdutos === 1 ? '' : 's'} para salvar`
                        : 'Adicione produtos para salvar a lista'}
                </Typography>

                <Stack direction={{ xs: 'column-reverse', sm: 'row' }} spacing={1}>
                <Button
                    variant="outlined"
                    color="error"
                    onClick={() => navigate('/lista-compras')}
                    disabled={saving}
                    sx={{
                        textTransform: 'none',
                        width: { xs: '100%', sm: 'auto' },
                    }}
                >
                    Cancelar
                </Button>
                <Button
                    variant="contained"
                    onClick={handleFinalizarLista}
                    startIcon={<CheckCircleIcon />}
                    disabled={saving || listaItens.length === 0}
                    sx={{ width: { xs: '100%', sm: 'auto' } }}
                >
                    {saving ? 'Salvando...' : 'Finalizar lista'}
                </Button>
                </Stack>
            </Stack>

            <Snackbar
                open={warnOpen}
                autoHideDuration={7000}
                onClose={() => setWarnOpen(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={() => setWarnOpen(false)}
                    severity="warning"
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    {warnMsg}
                </Alert>
            </Snackbar>

            <Snackbar
                open={successOpen}
                autoHideDuration={4000}
                onClose={() => setSuccessOpen(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={() => setSuccessOpen(false)}
                    severity="success"
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    Lista criada com sucesso!
                </Alert>
            </Snackbar>

            <Snackbar
                open={errorOpen}
                autoHideDuration={6000}
                onClose={() => setErrorOpen(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    onClose={() => setErrorOpen(false)}
                    severity="error"
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    {errorMsg}
                </Alert>
            </Snackbar>
        </ShoppingPage>
    );
}
