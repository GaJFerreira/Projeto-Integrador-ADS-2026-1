import { useEffect, useMemo, useState, useCallback } from "react";
import {
    Box, Typography, Card, CardActionArea, Stack, Chip, Button, Skeleton,
    Dialog, DialogContent, DialogActions, MenuItem, TextField, List, ListItem,
    ListItemText, IconButton, FormControl, InputLabel, Select, CircularProgress,
    Tooltip, FormHelperText,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import EditIcon from "@mui/icons-material/Edit";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import UnarchiveOutlinedIcon from "@mui/icons-material/UnarchiveOutlined";
import PlaylistAddCheckIcon from "@mui/icons-material/PlaylistAddCheck";
import LocalGroceryStoreIcon from "@mui/icons-material/LocalGroceryStore";
import { alpha } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";

import { listaViewService, type ListaDTO } from "../api/service/listaViewService";
import { patologiasService } from "../api/service/patologiaService";
import { listaComprasService } from "../api/service/listaComprasService";
import type { Patologia } from "../types";
import { isIdoso } from "../utils/userRole";
import { EmptyState, ShoppingHeader, ShoppingPage } from "@/features/lista-compras/components/ShoppingUi.tsx";

const STATUS_TABS: { value: "abertas" | "arquivadas" | "todas"; label: string; tip: string }[] = [
    { value: "abertas", label: "Ativos", tip: "Exibe apenas os templates disponíveis para uso imediato." },
    { value: "arquivadas", label: "Arquivados", tip: "Exibe templates desativados, mantidos apenas para consulta." },
    { value: "todas", label: "Todos", tip: "Exibe todos os templates, ativos e arquivados juntos." },
];

export default function TemplatesPage() {
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();

    const [templates, setTemplates] = useState<ListaDTO[]>([]);
    const [patologias, setPatologias] = useState<Patologia[]>([]);
    const [loading, setLoading] = useState(true);

    const [filtroPatologia, setFiltroPatologia] = useState<number | "Todas">("Todas");
    const [filtroStatus, setFiltroStatus] = useState<"abertas" | "arquivadas" | "todas">("abertas");
    const [templateSelecionado, setTemplateSelecionado] = useState<ListaDTO | null>(null);
    const [modalDetalhesOpen, setModalDetalhesOpen] = useState(false);

    const [modalCriarOpen, setModalCriarOpen] = useState(false);
    const [novoTemplateTitulo, setNovoTemplateTitulo] = useState("");
    const [novoTemplatePatologia, setNovoTemplatePatologia] = useState<number | "">("");
    const [criandoTemplate, setCriandoTemplate] = useState(false);

    const carregarDados = useCallback(
        async (isReload = false) => {
            if (!isReload) setLoading(true);
            try {
                const [tpls, pats] = await Promise.all([
                    listaViewService.listarTemplates(),
                    patologiasService.getPatologiasDoUsuario(),
                ]);
                setTemplates(tpls);
                setPatologias(pats);
            } catch (error) {
                console.error("Erro ao carregar dados", error);
                enqueueSnackbar("Erro ao carregar templates.", { variant: "error" });
            } finally {
                setLoading(false);
            }
        },
        [enqueueSnackbar]
    );

    useEffect(() => {
        if (isIdoso()) navigate('/lista-compras', { replace: true });
    }, [navigate]);

    useEffect(() => {
        carregarDados();
    }, [carregarDados]);

    const templatesFiltrados = useMemo(() => {
        let lista = [...templates];
        if (filtroPatologia !== "Todas") lista = lista.filter((t) => t.patologiaId === filtroPatologia);
        if (filtroStatus === "abertas") lista = lista.filter((t) => t.status !== "FINALIZADA");
        else if (filtroStatus === "arquivadas") lista = lista.filter((t) => t.status === "FINALIZADA");
        return lista;
    }, [templates, filtroPatologia, filtroStatus]);

    const totalAtivos = templates.filter((t) => t.status !== "FINALIZADA").length;
    const totalArquivados = templates.filter((t) => t.status === "FINALIZADA").length;
    const totalItensTemplates = templates.reduce((acc, tpl) => acc + (tpl.itens?.length ?? 0), 0);

    const handleAbrirDetalhes = (tpl: ListaDTO) => {
        setTemplateSelecionado(tpl);
        setModalDetalhesOpen(true);
    };

    const handleIrParaEdicaoTemplate = (tpl: ListaDTO) => {
        const query = new URLSearchParams();
        query.set("isTemplate", "1");
        if (tpl.patologiaId) query.set("patologiaId", String(tpl.patologiaId));
        setModalDetalhesOpen(false);
        navigate(`/lista-compras/${tpl.id}/editar?${query.toString()}`);
    };

    const handleCriarTemplate = async () => {
        const titulo = novoTemplateTitulo.trim();
        if (!titulo || criandoTemplate) return;
        setCriandoTemplate(true);
        try {
            const payload = {
                titulo,
                isTemplate: true,
                patologiaId: novoTemplatePatologia || undefined,
                itens: [] as { produtoId: number; qtd: number }[],
            };
            const resposta = await listaComprasService.criarLista(payload);
            enqueueSnackbar("Template criado! Agora adicione os itens.", { variant: "success" });
            setModalCriarOpen(false);
            setNovoTemplateTitulo("");
            setNovoTemplatePatologia("");
            await carregarDados(true);
            const query = new URLSearchParams();
            query.set("isTemplate", "1");
            if (novoTemplatePatologia) query.set("patologiaId", String(novoTemplatePatologia));
            navigate(`/lista-compras/${resposta.id}/editar?${query.toString()}`, { replace: true });
        } catch (error: any) {
            console.error(error);
            enqueueSnackbar(error.response?.data?.erro || "Erro ao criar template.", { variant: "error" });
        } finally {
            setCriandoTemplate(false);
        }
    };

    const formatDate = (iso: string) => {
        try { return new Date(iso).toLocaleDateString("pt-BR"); }
        catch { return iso; }
    };

    const filtersActive = filtroPatologia !== "Todas" || filtroStatus !== "abertas";

    return (
        <ShoppingPage maxWidth={1120}>
            <ShoppingHeader
                eyebrow="Compre com Saúde"
                title="Templates"
                description="Padronize compras por rotina, dieta ou condição de saúde e reaproveite modelos com menos retrabalho."
                icon={<ContentCopyIcon />}
                onBack={() => navigate("/lista-compras", { replace: true })}
                actions={
                    <Tooltip arrow placement="left" title="Crie um modelo de lista de compras para reutilizar em situações recorrentes, como compras semanais ou dietas específicas.">
                    <Button variant="contained" startIcon={<AddIcon />} onClick={() => setModalCriarOpen(true)}>
                        Novo template
                    </Button>
                    </Tooltip>
                }
                metrics={[
                    { label: "Ativos", value: totalAtivos, tone: "success" },
                    { label: "Arquivados", value: totalArquivados, tone: "info" },
                    { label: "Patologias", value: patologias.length, tone: "warning" },
                    { label: "Itens", value: totalItensTemplates, tone: "primary" },
                ]}
            />

            {/* Filtros */}
            <Box sx={(theme) => ({
                mb: 2.5, p: { xs: 1.5, sm: 2 },
                borderRadius: 3, bgcolor: '#fff',
                border: '1px solid', borderColor: alpha(theme.palette.divider, 0.9),
                boxShadow: `0 2px 8px ${alpha('#000', 0.04)}`,
            })}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ xs: 'stretch', sm: 'center' }} flexWrap="wrap" useFlexGap>
                    {/* Pill tabs por status */}
                    <Stack direction="row" spacing={0.75}>
                        {STATUS_TABS.map((tab) => (
                            <Tooltip key={tab.value} arrow placement="top" title={tab.tip}>
                            <Chip
                                label={tab.label}
                                onClick={() => setFiltroStatus(tab.value)}
                                variant={filtroStatus === tab.value ? "filled" : "outlined"}
                                color={filtroStatus === tab.value ? "primary" : "default"}
                                sx={(theme) => ({
                                    fontWeight: filtroStatus === tab.value ? 700 : 500,
                                    cursor: 'pointer',
                                    transition: 'all .15s',
                                    ...(filtroStatus !== tab.value && {
                                        borderColor: alpha(theme.palette.divider, 0.9),
                                        '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.06) },
                                    }),
                                })}
                            />
                            </Tooltip>
                        ))}
                    </Stack>

                    {/* Filtro por patologia */}
                    <Tooltip arrow placement="top" title="Filtra os templates por condição de saúde associada. Templates vinculados a uma patologia foram criados com produtos adequados para aquela condição.">
                    <FormControl size="small" sx={{ width: { xs: '100%', sm: 220 }, ml: { sm: 'auto !important' } }}>
                        <InputLabel>Patologia</InputLabel>
                        <Select
                            value={filtroPatologia}
                            label="Patologia"
                            onChange={(e) => setFiltroPatologia(e.target.value as number | "Todas")}
                        >
                            <MenuItem value="Todas">Todas</MenuItem>
                            {patologias.map((p) => (
                                <MenuItem key={p.id} value={p.id}>{p.nome}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    </Tooltip>

                    {filtersActive && (
                        <Chip
                            label="Limpar filtros"
                            onDelete={() => { setFiltroPatologia("Todas"); setFiltroStatus("abertas"); }}
                            color="primary" variant="outlined" size="small"
                        />
                    )}

                    <Typography variant="caption" color="text.secondary" sx={{ ml: { sm: 1 }, alignSelf: 'center' }}>
                        {templatesFiltrados.length} resultado{templatesFiltrados.length === 1 ? '' : 's'}
                    </Typography>
                </Stack>
            </Box>

            {/* Grid de cards */}
            {loading ? (
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "repeat(3, 1fr)" }, gap: 2 }}>
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} height={210} sx={{ borderRadius: 3, transform: "none" }} />
                    ))}
                </Box>
            ) : templatesFiltrados.length === 0 ? (
                <EmptyState
                    icon={<Inventory2OutlinedIcon />}
                    title="Nenhum template encontrado"
                    description="Crie um novo template ou ajuste os filtros."
                    action={
                        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setModalCriarOpen(true)}>
                            Novo template
                        </Button>
                    }
                />
            ) : (
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "repeat(3, 1fr)" }, gap: 2 }}>
                    {templatesFiltrados.map((tpl) => {
                        const patNome = patologias.find((p) => p.id === tpl.patologiaId)?.nome;
                        const isArquivado = tpl.status === "FINALIZADA";
                        const qtdItens = tpl.itens?.length ?? 0;

                        return (
                            <Card
                                key={tpl.id}
                                elevation={0}
                                sx={(theme) => ({
                                    borderRadius: 3, border: "1px solid", overflow: "hidden",
                                    borderColor: isArquivado ? alpha(theme.palette.grey[400], 0.5) : alpha(theme.palette.primary.main, 0.15),
                                    opacity: isArquivado ? 0.78 : 1,
                                    transition: "transform .18s ease, box-shadow .18s ease, border-color .18s ease",
                                    "&:hover": {
                                        transform: "translateY(-4px)",
                                        boxShadow: `0 16px 32px ${alpha(theme.palette.primary.main, 0.13)}`,
                                        borderColor: theme.palette.primary.main,
                                    },
                                })}
                            >
                                {/* Gradient header */}
                                <Box sx={(theme) => ({
                                    px: 2, py: 1.6,
                                    background: isArquivado
                                        ? `linear-gradient(135deg, ${theme.palette.grey[600]} 0%, ${theme.palette.grey[500]} 100%)`
                                        : `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 60%, ${alpha(theme.palette.primary.light, 0.9)} 100%)`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                })}>
                                    <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
                                        <Box sx={{
                                            width: 34, height: 34, borderRadius: 1.5, flexShrink: 0,
                                            bgcolor: 'rgba(255,255,255,0.18)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}>
                                            <ContentCopyIcon sx={{ fontSize: 18, color: '#fff' }} />
                                        </Box>
                                        <Typography fontWeight={800} sx={{ color: '#fff', fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {tpl.titulo}
                                        </Typography>
                                    </Stack>
                                    {isArquivado && (
                                        <Chip size="small" label="Arquivado" icon={<ArchiveOutlinedIcon style={{ fontSize: 13 }} />}
                                            sx={{ bgcolor: 'rgba(255,255,255,0.18)', color: '#fff', fontSize: '0.65rem', height: 20, flexShrink: 0, ml: 0.5,
                                                  '& .MuiChip-icon': { color: '#fff' } }} />
                                    )}
                                </Box>

                                <Tooltip arrow placement="top" title="Clique para ver os detalhes deste template e usar, editar ou arquivar.">
                                <CardActionArea onClick={() => handleAbrirDetalhes(tpl)} sx={{ px: 2, py: 1.6 }}>
                                    <Stack spacing={1.4}>
                                        <Stack direction="row" spacing={0.8} alignItems="center">
                                            <CalendarMonthOutlinedIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                                            <Typography variant="caption" color="text.secondary">
                                                Criado em {formatDate(tpl.createdAt)}
                                            </Typography>
                                        </Stack>

                                        <Stack direction="row" spacing={0.8} flexWrap="wrap" useFlexGap>
                                            <Chip
                                                size="small"
                                                icon={<AutoAwesomeIcon style={{ fontSize: 12 }} />}
                                                label={`${qtdItens} ${qtdItens === 1 ? 'item' : 'itens'}`}
                                                color="primary" variant="outlined"
                                                sx={{ fontSize: '0.7rem', height: 22, fontWeight: 700 }}
                                            />
                                            {patNome && (
                                                <Chip
                                                    size="small"
                                                    icon={<WarningAmberIcon style={{ fontSize: 12 }} />}
                                                    label={patNome}
                                                    color="warning" variant="outlined"
                                                    sx={{ fontSize: '0.7rem', height: 22, fontWeight: 600 }}
                                                />
                                            )}
                                        </Stack>

                                        {/* Item preview chips */}
                                        {qtdItens > 0 && (
                                            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                                                {(tpl.itens ?? []).slice(0, 2).map((it, i) => (
                                                    <Typography key={i} variant="caption" sx={(theme) => ({
                                                        px: 0.9, py: 0.25, borderRadius: 999,
                                                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                                                        color: 'primary.dark', fontWeight: 600, fontSize: '0.68rem',
                                                    })}>
                                                        {it.produto?.nome ?? `#${it.produtoId}`}
                                                    </Typography>
                                                ))}
                                                {qtdItens > 2 && (
                                                    <Typography variant="caption" sx={(theme) => ({
                                                        px: 0.9, py: 0.25, borderRadius: 999,
                                                        bgcolor: alpha(theme.palette.grey[400], 0.18),
                                                        color: 'text.secondary', fontWeight: 600, fontSize: '0.68rem',
                                                    })}>
                                                        +{qtdItens - 2}
                                                    </Typography>
                                                )}
                                            </Stack>
                                        )}
                                    </Stack>
                                </CardActionArea>
                                </Tooltip>
                            </Card>
                        );
                    })}
                </Box>
            )}

            {/* Modal de Detalhes */}
            <Dialog open={modalDetalhesOpen} onClose={() => setModalDetalhesOpen(false)} fullWidth maxWidth="sm">
                {/* Gradient header */}
                <Box sx={(theme) => ({
                    px: 3, pt: 2.5, pb: 2,
                    background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 70%, ${alpha(theme.palette.primary.light, 0.85)} 100%)`,
                    display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2,
                })}>
                    <Box sx={{ minWidth: 0 }}>
                        <Typography variant="overline" sx={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.65rem', letterSpacing: 1.4, lineHeight: 1 }}>
                            Template
                        </Typography>
                        <Typography variant="h6" fontWeight={900} sx={{ color: '#fff', mt: 0.2, wordBreak: 'break-word' }}>
                            {templateSelecionado?.titulo}
                        </Typography>
                        {templateSelecionado && (
                            <Stack direction="row" spacing={0.8} flexWrap="wrap" useFlexGap sx={{ mt: 0.8 }}>
                                <Chip size="small"
                                    label={templateSelecionado.status === "FINALIZADA" ? "Arquivado" : "Ativo"}
                                    sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: '#fff', fontSize: '0.68rem', height: 20, fontWeight: 700 }}
                                />
                                <Chip size="small"
                                    icon={<CalendarMonthOutlinedIcon style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)' }} />}
                                    label={formatDate(templateSelecionado.createdAt)}
                                    sx={{ bgcolor: 'rgba(255,255,255,0.14)', color: 'rgba(255,255,255,0.9)', fontSize: '0.68rem', height: 20,
                                          '& .MuiChip-icon': { color: 'rgba(255,255,255,0.8)' } }}
                                />
                                <Chip size="small"
                                    icon={<AutoAwesomeIcon style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)' }} />}
                                    label={`${templateSelecionado.itens?.length ?? 0} itens`}
                                    sx={{ bgcolor: 'rgba(255,255,255,0.14)', color: 'rgba(255,255,255,0.9)', fontSize: '0.68rem', height: 20,
                                          '& .MuiChip-icon': { color: 'rgba(255,255,255,0.8)' } }}
                                />
                            </Stack>
                        )}
                    </Box>
                    <IconButton onClick={() => setModalDetalhesOpen(false)} size="small"
                        sx={{ color: 'rgba(255,255,255,0.85)', bgcolor: 'rgba(255,255,255,0.12)',
                              '&:hover': { bgcolor: 'rgba(255,255,255,0.22)' }, flexShrink: 0 }}>
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </Box>

                <DialogContent sx={{ p: 0 }}>
                    {!templateSelecionado?.itens || templateSelecionado.itens.length === 0 ? (
                        <Box sx={{ py: 2 }}>
                            <EmptyState
                                icon={<Inventory2OutlinedIcon />}
                                title="Template vazio"
                                description="Abra a edição para adicionar os itens deste modelo."
                            />
                        </Box>
                    ) : (
                        <List disablePadding>
                            {templateSelecionado.itens.map((item, idx) => (
                                <ListItem
                                    key={`${item.produtoId}-${idx}`}
                                    sx={(theme) => ({
                                        px: 2.5, py: 1.2,
                                        borderBottom: idx < (templateSelecionado.itens?.length ?? 0) - 1 ? `1px solid ${alpha(theme.palette.divider, 0.7)}` : 'none',
                                        '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.03) },
                                    })}
                                >
                                    <Box sx={(theme) => ({
                                        width: 26, height: 26, borderRadius: 1, mr: 1.5, flexShrink: 0,
                                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                                        color: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '0.72rem', fontWeight: 900,
                                    })}>
                                        {idx + 1}
                                    </Box>
                                    <ListItemText
                                        primary={
                                            <Typography fontWeight={700} sx={{ fontSize: '0.9rem' }}>
                                                {item.produto?.nome ?? `Produto #${item.produtoId}`}
                                            </Typography>
                                        }
                                        secondary={
                                            <Typography variant="caption" color="text.secondary">
                                                Qtd: <b>{item.qtd}</b>
                                            </Typography>
                                        }
                                    />
                                    <Chip size="small" label={`×${item.qtd}`} sx={(theme) => ({
                                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                                        color: 'primary.dark', fontWeight: 900, fontSize: '0.78rem', height: 24,
                                    })} />
                                </ListItem>
                            ))}
                        </List>
                    )}
                </DialogContent>

                <DialogActions sx={(theme) => ({ px: 2.5, py: 2, borderTop: `1px solid ${alpha(theme.palette.divider, 0.8)}`, gap: 1, flexWrap: 'wrap' })}>
                    <Tooltip arrow placement="top" title="Abre a tela de edição para adicionar ou remover produtos deste template.">
                    <Box component="span">
                    <Button variant="outlined" startIcon={<EditIcon />}
                        disabled={!templateSelecionado}
                        onClick={() => templateSelecionado && handleIrParaEdicaoTemplate(templateSelecionado)}
                        sx={{ textTransform: 'none' }}>
                        Editar
                    </Button>
                    </Box>
                    </Tooltip>

                    {templateSelecionado?.status !== "FINALIZADA" ? (
                        <Tooltip arrow placement="top" title="Desativa este template para que não apareça mais nos modelos disponíveis. Você ainda poderá consultá-lo em 'Arquivados'.">
                        <Box component="span">
                        <Button color="error" variant="outlined" startIcon={<ArchiveOutlinedIcon />}
                            disabled={!templateSelecionado}
                            onClick={async () => {
                                if (!templateSelecionado) return;
                                await listaComprasService.finalizarLista(templateSelecionado.id);
                                enqueueSnackbar("Template arquivado.", { variant: "success" });
                                setModalDetalhesOpen(false);
                                await carregarDados(true);
                            }}
                            sx={{ textTransform: 'none' }}>
                            Arquivar
                        </Button>
                        </Box>
                        </Tooltip>
                    ) : (
                        <Tooltip arrow placement="top" title="Reativa este template e o torna disponível novamente nos modelos da seção de criação de listas.">
                        <Box component="span">
                        <Button color="primary" variant="outlined" startIcon={<UnarchiveOutlinedIcon />}
                            disabled={!templateSelecionado}
                            onClick={async () => {
                                if (!templateSelecionado) return;
                                await listaComprasService.reabrirLista(templateSelecionado.id);
                                enqueueSnackbar("Template reaberto.", { variant: "success" });
                                setModalDetalhesOpen(false);
                                await carregarDados(true);
                            }}
                            sx={{ textTransform: 'none' }}>
                            Reabrir
                        </Button>
                        </Box>
                        </Tooltip>
                    )}

                    <Tooltip arrow placement="top" title="Vai para a tela de criação de lista, onde você pode selecionar este e outros modelos para montar sua compra rapidamente.">
                    <Button variant="contained" startIcon={<LocalGroceryStoreIcon />}
                        onClick={() => navigate("/lista-compras/nova")}
                        sx={(theme) => ({
                            ml: 'auto', textTransform: 'none', fontWeight: 700,
                            background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                            boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.3)}`,
                        })}>
                        Usar template
                    </Button>
                    </Tooltip>
                </DialogActions>
            </Dialog>

            {/* Modal de Criação */}
            <Dialog open={modalCriarOpen} onClose={() => !criandoTemplate && setModalCriarOpen(false)} fullWidth maxWidth="sm">
                {/* Gradient header */}
                <Box sx={(theme) => ({
                    px: 3, pt: 2.5, pb: 2,
                    background: `linear-gradient(135deg, ${theme.palette.secondary.dark} 0%, ${theme.palette.secondary.main} 100%)`,
                    display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2,
                })}>
                    <Box>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.4 }}>
                            <PlaylistAddCheckIcon sx={{ color: 'rgba(255,255,255,0.85)', fontSize: 20 }} />
                            <Typography variant="h6" fontWeight={900} sx={{ color: '#fff' }}>
                                Novo template
                            </Typography>
                        </Stack>
                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.78)' }}>
                            Defina nome e condição associada. Itens são adicionados na próxima etapa.
                        </Typography>
                    </Box>
                    <IconButton size="small" onClick={() => setModalCriarOpen(false)} disabled={criandoTemplate}
                        sx={{ color: 'rgba(255,255,255,0.85)', bgcolor: 'rgba(255,255,255,0.12)', flexShrink: 0,
                              '&:hover': { bgcolor: 'rgba(255,255,255,0.22)' } }}>
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </Box>

                <DialogContent sx={{ pt: 3, pb: 1 }}>
                    <Stack spacing={2.5}>
                        <TextField
                            label="Nome do template"
                            fullWidth
                            value={novoTemplateTitulo}
                            onChange={(e) => setNovoTemplateTitulo(e.target.value)}
                            placeholder="Ex: Dieta para Café da Manhã"
                            disabled={criandoTemplate}
                            autoFocus
                            onKeyDown={(e) => { if (e.key === 'Enter' && novoTemplateTitulo.trim()) handleCriarTemplate(); }}
                        />
                        <FormControl fullWidth disabled={criandoTemplate}>
                            <InputLabel>Patologia (opcional)</InputLabel>
                            <Select
                                value={novoTemplatePatologia}
                                label="Patologia (opcional)"
                                onChange={(e) => setNovoTemplatePatologia(e.target.value as number | "")}
                            >
                                <MenuItem value=""><em>Nenhuma</em></MenuItem>
                                {patologias.map((p) => (
                                    <MenuItem key={p.id} value={p.id}>{p.nome}</MenuItem>
                                ))}
                            </Select>
                            <FormHelperText>Associar uma condição de saúde ajuda a organizar os templates e facilita a busca para quem gerencia usuários com restrições alimentares.</FormHelperText>
                        </FormControl>
                    </Stack>
                </DialogContent>

                <DialogActions sx={(theme) => ({ px: 2.5, py: 2, borderTop: `1px solid ${alpha(theme.palette.divider, 0.8)}`, gap: 1 })}>
                    <Button onClick={() => setModalCriarOpen(false)} color="error" variant="outlined"
                        disabled={criandoTemplate} sx={{ textTransform: 'none' }}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleCriarTemplate}
                        variant="contained"
                        disabled={!novoTemplateTitulo.trim() || criandoTemplate}
                        startIcon={criandoTemplate ? <CircularProgress size={18} color="inherit" /> : <AddIcon />}
                        sx={(theme) => ({
                            textTransform: 'none', fontWeight: 700,
                            background: !novoTemplateTitulo.trim() || criandoTemplate ? undefined
                                : `linear-gradient(135deg, ${theme.palette.secondary.dark} 0%, ${theme.palette.secondary.main} 100%)`,
                            boxShadow: !novoTemplateTitulo.trim() || criandoTemplate ? 'none'
                                : `0 4px 14px ${alpha(theme.palette.secondary.main, 0.35)}`,
                        })}
                    >
                        {criandoTemplate ? "Criando..." : "Criar template"}
                    </Button>
                </DialogActions>
            </Dialog>
        </ShoppingPage>
    );
}
