// src/features/lista-compras/pages/TemplatesPage.tsx

import { useEffect, useMemo, useState, useCallback } from "react";
import {
    Box,
    Typography,
    Card,
    CardActionArea,
    Stack,
    Chip,
    Button,
    Skeleton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    MenuItem,
    TextField,
    List,
    ListItem,
    ListItemText,
    IconButton,
    FormControl,
    InputLabel,
    Select,
    CircularProgress,
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
import { alpha } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";

import { listaViewService, type ListaDTO } from "../api/service/listaViewService";
import { patologiasService } from "../api/service/patologiaService";
import { listaComprasService } from "../api/service/listaComprasService";
import type { Patologia } from "../types";
import {
    EmptyState,
    SectionTitle,
    ShoppingHeader,
    ShoppingPage,
} from "@/features/lista-compras/components/ShoppingUi.tsx";

export default function TemplatesPage() {
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();

    // Estados de Dados
    const [templates, setTemplates] = useState<ListaDTO[]>([]);
    const [patologias, setPatologias] = useState<Patologia[]>([]);
    const [loading, setLoading] = useState(true);

    // Estados de Filtro e Seleção
    const [filtroPatologia, setFiltroPatologia] = useState<number | "Todas">("Todas");
    const [filtroStatus, setFiltroStatus] = useState<"abertas" | "arquivadas" | "todas">("abertas");
    const [templateSelecionado, setTemplateSelecionado] = useState<ListaDTO | null>(null);
    const [modalDetalhesOpen, setModalDetalhesOpen] = useState(false);

    // Estados de Criação (Novo Template)
    const [modalCriarOpen, setModalCriarOpen] = useState(false);
    const [novoTemplateTitulo, setNovoTemplateTitulo] = useState("");
    const [novoTemplatePatologia, setNovoTemplatePatologia] = useState<number | "">("");
    const [criandoTemplate, setCriandoTemplate] = useState(false);

    // --- Função de Carga de Dados (Memoizada) ---
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

    // --- Carga Inicial ---
    useEffect(() => {
        carregarDados();
    }, [carregarDados]);

    // --- Filtros (Patologia + Status) ---
    const templatesFiltrados = useMemo(() => {
        let lista = [...templates];

        // 1) Filtro por patologia
        if (filtroPatologia !== "Todas") {
            lista = lista.filter((t) => t.patologiaId === filtroPatologia);
        }

        // 2) Filtro por status
        if (filtroStatus === "abertas") {
            lista = lista.filter((t) => t.status !== "FINALIZADA");
        } else if (filtroStatus === "arquivadas") {
            lista = lista.filter((t) => t.status === "FINALIZADA");
        }
        // "todas" não filtra

        return lista;
    }, [templates, filtroPatologia, filtroStatus]);

    const totalAtivos = templates.filter((t) => t.status !== "FINALIZADA").length;
    const totalArquivados = templates.filter((t) => t.status === "FINALIZADA").length;
    const totalItensTemplates = templates.reduce((acc, tpl) => acc + (tpl.itens?.length ?? 0), 0);

    // --- Handlers ---
    const handleAbrirDetalhes = (tpl: ListaDTO) => {
        setTemplateSelecionado(tpl);
        setModalDetalhesOpen(true);
    };

    // Ir para tela de edição de template
    const handleIrParaEdicaoTemplate = (tpl: ListaDTO) => {
        const query = new URLSearchParams();
        query.set("isTemplate", "1");
        if (tpl.patologiaId) {
            query.set("patologiaId", String(tpl.patologiaId));
        }

        // fecha o modal antes de navegar, pra não ficar estado preso
        setModalDetalhesOpen(false);
        navigate(`/lista-compras/${tpl.id}/editar?${query.toString()}`);
    };

    /** Cria template vazio e navega para EditListaPage */
    const handleCriarTemplate = async () => {
        const titulo = novoTemplateTitulo.trim();
        if (!titulo) return;

        if (criandoTemplate) return;
        setCriandoTemplate(true);

        try {
            const payload = {
                titulo,
                isTemplate: true,
                patologiaId: novoTemplatePatologia || undefined,
                itens: [] as { produtoId: number; qtd: number }[],
            };

            const resposta = await listaComprasService.criarLista(payload);

            enqueueSnackbar("Template criado com sucesso! Agora adicione os itens.", {
                variant: "success",
            });

            setModalCriarOpen(false);
            setNovoTemplateTitulo("");
            setNovoTemplatePatologia("");

            await carregarDados(true);

            const query = new URLSearchParams();
            query.set("isTemplate", "1");
            if (novoTemplatePatologia) {
                query.set("patologiaId", String(novoTemplatePatologia));
            }

            navigate(`/lista-compras/${resposta.id}/editar?${query.toString()}`, {
                replace: true,
            });
        } catch (error: any) {
            console.error(error);
            const msg = error.response?.data?.erro || "Erro ao criar template.";
            enqueueSnackbar(msg, { variant: "error" });
        } finally {
            setCriandoTemplate(false);
        }
    };

    // Helper para formatar data
    const formatDate = (iso: string) => {
        try {
            return new Date(iso).toLocaleDateString("pt-BR");
        } catch {
            return iso;
        }
    };

    return (
        <ShoppingPage maxWidth={1120}>
            <ShoppingHeader
                eyebrow="Compre com Saúde"
                title="Templates"
                description="Padronize compras por rotina, dieta ou condição de saúde e reaproveite listas com menos retrabalho."
                icon={<ContentCopyIcon />}
                onBack={() => navigate("/lista-compras", { replace: true })}
                actions={
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setModalCriarOpen(true)}
                    >
                        Novo template
                    </Button>
                }
                metrics={[
                    { label: "Ativos", value: totalAtivos, tone: "success" },
                    { label: "Arquivados", value: totalArquivados, tone: "info" },
                    { label: "Patologias", value: patologias.length, tone: "warning" },
                    { label: "Itens", value: totalItensTemplates, tone: "primary" },
                ]}
            />

            <Box
                sx={(theme) => ({
                    p: { xs: 2, sm: 2.5 },
                    mb: 3,
                    borderRadius: 3,
                    border: "1px solid",
                    borderColor: alpha(theme.palette.divider, 0.95),
                    backgroundColor: "#fff",
                    boxShadow: `0 18px 48px ${alpha(theme.palette.common.black, 0.07)}`,
                })}
            >
                <SectionTitle
                    title="Biblioteca de templates"
                    description={`${templatesFiltrados.length} resultado${templatesFiltrados.length === 1 ? "" : "s"} no filtro atual.`}
                />

                <Stack
                    direction={{ xs: "column", sm: "row" }}
                    alignItems={{ xs: "stretch", sm: "center" }}
                    spacing={2}
                    sx={{ mb: 2.4 }}
                >
                    <FormControl
                        size="small"
                        sx={{
                            width: { xs: "100%", sm: 220 },
                        }}
                    >
                        <InputLabel>Filtrar por Patologia</InputLabel>
                        <Select
                            value={filtroPatologia}
                            label="Filtrar por Patologia"
                            onChange={(e) =>
                                setFiltroPatologia(e.target.value as number | "Todas")
                            }
                        >
                            <MenuItem value="Todas">Todas</MenuItem>
                            {patologias.map((p) => (
                                <MenuItem key={p.id} value={p.id}>
                                    {p.nome}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl
                        size="small"
                        sx={{
                            width: { xs: "100%", sm: 180 },
                        }}
                    >
                        <InputLabel>Status</InputLabel>
                        <Select
                            value={filtroStatus}
                            label="Status"
                            onChange={(e) =>
                                setFiltroStatus(
                                    e.target.value as "abertas" | "arquivadas" | "todas"
                                )
                            }
                        >
                            <MenuItem value="abertas">Abertas</MenuItem>
                            <MenuItem value="arquivadas">Arquivadas</MenuItem>
                            <MenuItem value="todas">Todas</MenuItem>
                        </Select>
                    </FormControl>

                    {(filtroPatologia !== "Todas" || filtroStatus !== "abertas") && (
                        <Chip
                            label="Filtros ativos"
                            onDelete={() => {
                                setFiltroPatologia("Todas");
                                setFiltroStatus("abertas");
                            }}
                            color="primary"
                            variant="outlined"
                        />
                    )}
                </Stack>

                {loading ? (
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: {
                            xs: "1fr",
                            sm: "1fr 1fr",
                            md: "repeat(3, 1fr)",
                        },
                        gap: 2,
                    }}
                >
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} height={186} sx={{ borderRadius: 3, transform: "none" }} />
                    ))}
                </Box>
            ) : templatesFiltrados.length === 0 ? (
                <EmptyState
                    icon={<Inventory2OutlinedIcon />}
                    title="Nenhum template encontrado"
                    description="Crie um novo template ou ajuste os filtros para encontrar outros modelos."
                    action={
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => setModalCriarOpen(true)}
                        >
                            Novo template
                        </Button>
                    }
                />
            ) : (
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: {
                            xs: "1fr",
                            sm: "1fr 1fr",
                            md: "repeat(3, 1fr)",
                        },
                        gap: 2,
                    }}
                >
                    {templatesFiltrados.map((tpl) => {
                        const patNome = patologias.find(
                            (p) => p.id === tpl.patologiaId
                        )?.nome;

                        const isArquivado = tpl.status === "FINALIZADA";

                        return (
                            <Card
                                key={tpl.id}
                                elevation={0}
                                sx={(theme) => ({
                                    height: "100%",
                                    borderRadius: 3,
                                    border: "1px solid",
                                    borderColor: isArquivado
                                        ? alpha(theme.palette.grey[400], 0.8)
                                        : alpha(theme.palette.primary.main, 0.14),
                                    overflow: "hidden",
                                    transition: "transform .18s ease, box-shadow .18s ease, border-color .18s ease",
                                    opacity: isArquivado ? 0.78 : 1,
                                    "&:hover": {
                                        transform: "translateY(-4px)",
                                        boxShadow: `0 18px 36px ${alpha(theme.palette.primary.main, 0.12)}`,
                                        borderColor: theme.palette.primary.main,
                                    },
                                })}
                            >
                                <CardActionArea
                                    onClick={() => handleAbrirDetalhes(tpl)}
                                    sx={{ height: "100%", p: 2 }}
                                >
                                    <Stack spacing={1.5} sx={{ minHeight: 148 }}>
                                        <Stack
                                            direction="row"
                                            justifyContent="space-between"
                                            alignItems="flex-start"
                                        >
                                            <Box
                                                sx={(theme) => ({
                                                    width: 44,
                                                    height: 44,
                                                    borderRadius: 2,
                                                    display: "grid",
                                                    placeItems: "center",
                                                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                                                    color: "primary.main",
                                                })}
                                            >
                                                <ContentCopyIcon />
                                            </Box>
                                            <Stack direction="row" spacing={0.7} flexWrap="wrap" useFlexGap justifyContent="flex-end">
                                                {patNome && (
                                                    <Chip
                                                        icon={
                                                            <WarningAmberIcon
                                                                style={{ fontSize: 16 }}
                                                            />
                                                        }
                                                        label={patNome}
                                                        size="small"
                                                        color="warning"
                                                        variant="outlined"
                                                    />
                                                )}
                                                {isArquivado && (
                                                    <Chip
                                                        label="Arquivado"
                                                        size="small"
                                                        icon={<ArchiveOutlinedIcon />}
                                                        variant="outlined"
                                                    />
                                                )}
                                            </Stack>
                                        </Stack>

                                        <Box>
                                            <Typography
                                                variant="h6"
                                                fontWeight={700}
                                                noWrap
                                                title={tpl.titulo}
                                            >
                                                {tpl.titulo}
                                            </Typography>
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                                sx={{ display: "inline-flex", alignItems: "center", gap: 0.6 }}
                                            >
                                                <CalendarMonthOutlinedIcon sx={{ fontSize: 15 }} />
                                                Criado em {formatDate(tpl.createdAt)}
                                            </Typography>
                                        </Box>

                                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: "auto" }}>
                                            <Chip
                                                size="small"
                                                icon={<AutoAwesomeIcon />}
                                                label={`${tpl.itens?.length || 0} ${tpl.itens?.length === 1 ? "item" : "itens"}`}
                                                variant="outlined"
                                                color="primary"
                                            />
                                        </Stack>
                                    </Stack>
                                </CardActionArea>
                            </Card>
                        );
                    })}
                </Box>
            )}
            </Box>

            <Dialog
                open={modalDetalhesOpen}
                onClose={() => setModalDetalhesOpen(false)}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: 2,
                    }}
                >
                    <Box sx={{ minWidth: 0 }}>
                        <Typography variant="h6" fontWeight={900} noWrap>
                            {templateSelecionado?.titulo}
                        </Typography>
                        {templateSelecionado && (
                            <Stack direction="row" spacing={0.8} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
                                <Chip
                                    size="small"
                                    label={templateSelecionado.status === "FINALIZADA" ? "Arquivado" : "Ativo"}
                                    color={templateSelecionado.status === "FINALIZADA" ? "info" : "success"}
                                />
                                <Chip
                                    size="small"
                                    icon={<CalendarMonthOutlinedIcon />}
                                    label={formatDate(templateSelecionado.createdAt)}
                                    variant="outlined"
                                />
                            </Stack>
                        )}
                    </Box>
                    <IconButton
                        onClick={() => setModalDetalhesOpen(false)}
                        size="small"
                        aria-label="Fechar detalhes do template"
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <DialogContent dividers>
                    {!templateSelecionado?.itens || templateSelecionado.itens.length === 0 ? (
                        <EmptyState
                            icon={<Inventory2OutlinedIcon />}
                            title="Template vazio"
                            description="Abra a edição para adicionar os itens deste modelo."
                        />
                    ) : (
                        <List disablePadding>
                            {templateSelecionado.itens.map((item, idx) => (
                                <ListItem
                                    key={`${item.produtoId}-${idx}`}
                                    divider={idx < (templateSelecionado.itens?.length || 0) - 1}
                                    sx={{ px: 0, py: 1.2 }}
                                >
                                    <ListItemText
                                        primary={
                                            <Typography fontWeight={800}>
                                                {item.produto?.nome || `Produto #${item.produtoId}`}
                                            </Typography>
                                        }
                                        secondary={`Quantidade: ${item.qtd}`}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    )}
                </DialogContent>

                <DialogActions sx={{ px: 3, py: 2.5 }}>
                    <Box
                        sx={{
                            width: "100%",
                            display: "grid",
                            gap: 1.2,

                            gridTemplateColumns: {
                                xs: "1fr 1fr",
                                sm: "auto auto auto",
                            },
                            gridTemplateRows: {
                                xs: "auto auto",
                                sm: "auto",
                            },

                            justifyContent: { sm: "flex-end" },
                            alignItems: "center",
                        }}
                    >
                        <Button
                            variant="outlined"
                            startIcon={<EditIcon />}
                            disabled={!templateSelecionado}
                            onClick={() => {
                                if (templateSelecionado) {
                                    handleIrParaEdicaoTemplate(templateSelecionado);
                                }
                            }}
                            sx={{
                                textTransform: "none",
                                whiteSpace: "nowrap",
                                width: { xs: "100%", sm: "auto" },
                            }}
                        >
                            Editar
                        </Button>

                        {templateSelecionado?.status !== "FINALIZADA" ? (
                            <Button
                                color="error"
                                variant="outlined"
                                startIcon={<ArchiveOutlinedIcon />}
                                disabled={!templateSelecionado}
                                onClick={async () => {
                                    if (!templateSelecionado) return;
                                    await listaComprasService.finalizarLista(templateSelecionado.id);
                                    enqueueSnackbar("Template arquivado.", { variant: "success" });
                                    setModalDetalhesOpen(false);
                                    await carregarDados(true);
                                }}
                                sx={{
                                    textTransform: "none",
                                    whiteSpace: "nowrap",
                                    width: { xs: "100%", sm: "auto" },
                                }}
                            >
                                Arquivar
                            </Button>
                        ) : (
                            <Button
                                color="primary"
                                variant="outlined"
                                disabled={!templateSelecionado}
                                onClick={async () => {
                                    if (!templateSelecionado) return;
                                    await listaComprasService.reabrirLista(templateSelecionado.id);
                                    enqueueSnackbar("Template reaberto.", { variant: "success" });
                                    setModalDetalhesOpen(false);
                                    await carregarDados(true);
                                }}
                                sx={{
                                    textTransform: "none",
                                    whiteSpace: "nowrap",
                                    width: { xs: "100%", sm: "auto" },
                                }}
                            >
                                Reabrir
                            </Button>
                        )}

                        <Button
                            variant="contained"
                            startIcon={<AutoAwesomeIcon />}
                            onClick={() => navigate("/lista-compras/nova")}
                            sx={{
                                textTransform: "none",
                                whiteSpace: "nowrap",
                                gridColumn: { xs: "1 / 3", sm: "auto" },
                                width: { xs: "100%", sm: "auto" },
                                mt: { xs: 0.5, sm: 0 },
                            }}
                        >
                            Usar Template
                        </Button>
                    </Box>
                </DialogActions>
            </Dialog>

            {/* Modal de Criação */}
            <Dialog
                open={modalCriarOpen}
                onClose={() => !criandoTemplate && setModalCriarOpen(false)}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 2,
                    }}
                >
                    <Box>
                        <Typography variant="h6" fontWeight={900}>
                            Criar template
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Defina nome e condição associada.
                        </Typography>
                    </Box>
                    <IconButton
                        size="small"
                        onClick={() => setModalCriarOpen(false)}
                        disabled={criandoTemplate}
                        aria-label="Fechar criação de template"
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 1 }}>
                        <Stack spacing={3}>
                            <TextField
                                label="Nome do template"
                                fullWidth
                                value={novoTemplateTitulo}
                                onChange={(e) =>
                                    setNovoTemplateTitulo(e.target.value)
                                }
                                placeholder="Ex: Dieta para Café da Manhã"
                                disabled={criandoTemplate}
                            />

                            <FormControl fullWidth disabled={criandoTemplate}>
                                <InputLabel>Patologia opcional</InputLabel>
                                <Select
                                    value={novoTemplatePatologia}
                                    label="Patologia opcional"
                                    onChange={(e) =>
                                        setNovoTemplatePatologia(
                                            e.target.value as number | ""
                                        )
                                    }
                                >
                                    <MenuItem value="">
                                        <em>Nenhuma</em>
                                    </MenuItem>
                                    {patologias.map((p) => (
                                        <MenuItem key={p.id} value={p.id}>
                                            {p.nome}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Stack>
                    </Box>
                </DialogContent>
                <DialogActions
                    sx={{
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: 1,
                        flexWrap: "wrap",
                    }}
                >
                    <Button
                        onClick={() => setModalCriarOpen(false)}
                        color="error"
                        variant="outlined"
                        disabled={criandoTemplate}
                        sx={{ textTransform: "none" }}
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleCriarTemplate}
                        variant="contained"
                        disabled={!novoTemplateTitulo || criandoTemplate}
                        startIcon={
                            criandoTemplate ? (
                                <CircularProgress size={20} color="inherit" />
                            ) : null
                        }
                        sx={{ textTransform: "none" }}
                    >
                        {criandoTemplate ? "Criando..." : "Criar"}
                    </Button>
                </DialogActions>
            </Dialog>
        </ShoppingPage>
    );
}
