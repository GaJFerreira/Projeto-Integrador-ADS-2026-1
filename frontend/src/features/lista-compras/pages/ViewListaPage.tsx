import { useEffect, useMemo, useState } from "react";
import {
    Box, Typography, Card, CardActionArea, CardContent,
    Stack, Chip, Button, Skeleton, Dialog, DialogContent,
    DialogActions, Snackbar, Alert, List, ListItem,
    ListItemText, ListItemIcon, IconButton, Checkbox, LinearProgress,
} from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import { alpha } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";

import { listaViewService, type ListaDTO } from "../api/service/listaViewService.ts";
import { listaComprasService } from "../api/service/listaComprasService.ts";
import { EmptyState, SectionTitle, ShoppingHeader, ShoppingPage } from "@/features/lista-compras/components/ShoppingUi.tsx";

export default function ViewListaPage() {
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();

    const [listasUsuario, setListasUsuario] = useState<ListaDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [filtroStatus, setFiltroStatus] = useState<"abertas" | "finalizadas" | "todas">("abertas");
    const [snackErroOpen, setSnackErroOpen] = useState(false);
    const [snackErroMsg, setSnackErroMsg] = useState("Erro ao carregar listas.");
    const [listaSelecionada, setListaSelecionada] = useState<ListaDTO | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [marcados, setMarcados] = useState<Set<number>>(new Set());

    const handleAbrirLista = (lista: ListaDTO) => {
        setListaSelecionada(lista);
        setMarcados(new Set());
        setModalOpen(true);
    };

    const handleFecharModal = () => {
        setModalOpen(false);
        setListaSelecionada(null);
    };

    const carregarListas = async () => {
        setLoading(true);
        try {
            const userLists = await listaViewService.listarDoUsuario();
            setListasUsuario(userLists);
        } catch {
            setSnackErroMsg("Erro ao carregar listas. Tente novamente.");
            setSnackErroOpen(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { carregarListas(); }, []);

    const listasFiltradas = useMemo(() => {
        let base = [...listasUsuario];
        if (filtroStatus === "abertas") base = base.filter((l) => l.status !== "FINALIZADA");
        else if (filtroStatus === "finalizadas") base = base.filter((l) => l.status === "FINALIZADA");
        return base;
    }, [listasUsuario, filtroStatus]);

    const totalAbertas = listasUsuario.filter((l) => l.status !== "FINALIZADA").length;
    const totalFinalizadas = listasUsuario.filter((l) => l.status === "FINALIZADA").length;
    const totalItens = listasUsuario.reduce((acc, l) => acc + (l.itens?.length ?? 0), 0);

    const formatDate = (iso: string) => {
        try { return new Date(iso).toLocaleDateString("pt-BR"); }
        catch { return iso; }
    };

    const ListaCard = ({
        lista, variant, onClick, onEditLista,
    }: {
        lista: ListaDTO;
        variant: "template" | "user" | "finalizada";
        onClick?: (l: ListaDTO) => void;
        onEditLista?: (l: ListaDTO) => void;
    }) => {
        const isFinalizada = variant === "finalizada";
        const isAberta = variant === "user" && lista.status !== "FINALIZADA";
        const itemCount = lista.itens?.length ?? 0;
        const itensPreview = lista.itens?.slice(0, 3) ?? [];
        const itensRestantes = (lista.itens?.length ?? 0) - itensPreview.length;

        return (
            <Card
                elevation={0}
                sx={(theme) => ({
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: 3,
                    border: "1px solid",
                    borderColor: isFinalizada
                        ? alpha(theme.palette.grey[300], 0.9)
                        : alpha(theme.palette.primary.main, 0.13),
                    overflow: "hidden",
                    transition: "transform .18s ease, box-shadow .18s ease, border-color .18s ease",
                    boxShadow: isFinalizada
                        ? "none"
                        : `0 2px 8px ${alpha(theme.palette.primary.main, 0.06)}, 0 1px 2px ${alpha("#000", 0.04)}`,
                    "&:hover": {
                        transform: "translateY(-3px)",
                        boxShadow: isFinalizada
                            ? `0 4px 16px ${alpha("#000", 0.08)}`
                            : `0 10px 28px ${alpha(theme.palette.primary.main, 0.14)}`,
                        borderColor: isFinalizada
                            ? alpha(theme.palette.grey[400], 0.9)
                            : alpha(theme.palette.primary.main, 0.3),
                    },
                })}
            >
                <Box sx={(theme) => ({
                    height: 4,
                    flexShrink: 0,
                    background: isFinalizada
                        ? theme.palette.grey[400]
                        : `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${alpha(theme.palette.primary.light, 0.7)} 100%)`,
                })} />

                <CardActionArea
                    onClick={() => isFinalizada ? onClick?.(lista) : onEditLista?.(lista)}
                    sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "stretch", p: 0 }}
                >
                    <CardContent sx={{ p: 2.2, flex: 1 }}>
                        <Stack spacing={1.5}>
                            <Stack direction="row" spacing={1.2} alignItems="flex-start">
                                <Box sx={(theme) => ({
                                    width: 40, height: 40, borderRadius: 2,
                                    display: "grid", placeItems: "center", flexShrink: 0,
                                    bgcolor: isFinalizada
                                        ? alpha(theme.palette.grey[500], 0.1)
                                        : alpha(theme.palette.primary.main, 0.1),
                                    color: isFinalizada ? theme.palette.grey[600] : theme.palette.primary.main,
                                })}>
                                    <ShoppingCartIcon sx={{ fontSize: 20 }} />
                                </Box>
                                <Box sx={{ minWidth: 0, flex: 1 }}>
                                    <Typography fontWeight={900} noWrap title={lista.titulo} sx={{ lineHeight: 1.3 }}>
                                        {lista.titulo}
                                    </Typography>
                                    <Stack direction="row" spacing={0.4} alignItems="center" sx={{ mt: 0.3 }}>
                                        <CalendarMonthOutlinedIcon sx={{ fontSize: 12, color: "text.disabled" }} />
                                        <Typography variant="caption" color="text.disabled">{formatDate(lista.createdAt)}</Typography>
                                    </Stack>
                                </Box>
                            </Stack>

                            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                                <Chip
                                    size="small"
                                    label={isFinalizada ? "Finalizada" : "Aberta"}
                                    icon={isFinalizada ? <CheckCircleIcon /> : undefined}
                                    color={isFinalizada ? "default" : "primary"}
                                    variant={isFinalizada ? "outlined" : "filled"}
                                    sx={{ fontWeight: 700 }}
                                />
                                <Chip
                                    size="small"
                                    label={`${itemCount} ${itemCount === 1 ? "item" : "itens"}`}
                                    variant="outlined"
                                    sx={(theme) => ({ borderColor: alpha(theme.palette.divider, 0.8), color: "text.secondary" })}
                                />
                            </Stack>

                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, minHeight: 28, alignContent: "flex-start" }}>
                                {itensPreview.length === 0 ? (
                                    <Typography variant="caption" color="text.disabled">Sem itens cadastrados.</Typography>
                                ) : (
                                    <>
                                        {itensPreview.map((item) => (
                                            <Chip
                                                key={item.produtoId}
                                                size="small"
                                                label={item.produto?.nome ?? `Produto #${item.produtoId}`}
                                                variant="outlined"
                                                sx={(theme) => ({
                                                    fontSize: "0.7rem", height: 22,
                                                    borderColor: alpha(theme.palette.primary.main, 0.2),
                                                    color: "text.secondary",
                                                })}
                                            />
                                        ))}
                                        {itensRestantes > 0 && (
                                            <Chip size="small" label={`+${itensRestantes} mais`} color="primary" variant="outlined" sx={{ fontSize: "0.7rem", height: 22 }} />
                                        )}
                                    </>
                                )}
                            </Box>
                        </Stack>
                    </CardContent>
                </CardActionArea>

                {isAberta && (
                    <Box sx={(theme) => ({
                        px: 2, py: 1.2,
                        borderTop: `1px solid ${alpha(theme.palette.divider, 0.7)}`,
                        display: "flex", justifyContent: "flex-end",
                        bgcolor: alpha(theme.palette.primary.main, 0.025),
                    })}>
                        <Button
                            size="small" variant="contained" startIcon={<ShoppingBagOutlinedIcon />}
                            sx={{ textTransform: "none", fontWeight: 700, fontSize: "0.78rem" }}
                            onClick={(e) => { e.stopPropagation(); onClick?.(lista); }}
                        >
                            Ir às compras
                        </Button>
                    </Box>
                )}
            </Card>
        );
    };

    const handleIrParaEdicao = (lista: ListaDTO) => navigate(`/lista-compras/${lista.id}/editar`);

    const itensDaListaSelecionada = listaSelecionada?.itens ?? [];
    const totalItensModal = itensDaListaSelecionada.length;
    const marcadosCount = marcados.size;
    const progresso = totalItensModal > 0 ? (marcadosCount / totalItensModal) * 100 : 0;

    return (
        <ShoppingPage maxWidth={1120}>
            <ShoppingHeader
                eyebrow="Compre com Saúde"
                title="Minhas listas"
                description="Acompanhe listas abertas, revise compras arquivadas e volte rapidamente para edição."
                icon={<ShoppingCartIcon />}
                onBack={() => navigate("/lista-compras", { replace: true })}
                actions={
                    <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate("/lista-compras/nova")}>
                        Nova lista
                    </Button>
                }
                metrics={[
                    { label: "Abertas", value: totalAbertas, tone: "success" },
                    { label: "Finalizadas", value: totalFinalizadas, tone: "info" },
                    { label: "Total", value: listasUsuario.length, tone: "primary" },
                    { label: "Itens", value: totalItens, tone: "warning" },
                ]}
            />

            <Box sx={(theme) => ({
                p: { xs: 2, sm: 2.5 },
                borderRadius: 3,
                border: "1px solid",
                borderColor: alpha(theme.palette.divider, 0.9),
                backgroundColor: "#fff",
                boxShadow: `0 2px 8px ${alpha("#000", 0.04)}, 0 16px 40px ${alpha(theme.palette.primary.main, 0.04)}`,
            })}>
                <SectionTitle
                    title="Listas salvas"
                    description={`${listasFiltradas.length} resultado${listasFiltradas.length === 1 ? "" : "s"} no filtro atual.`}
                />

                <Stack direction="row" spacing={0.8} flexWrap="wrap" useFlexGap sx={{ mb: 2.5 }}>
                    {([
                        { key: "abertas", label: `Abertas (${totalAbertas})`, color: "primary" },
                        { key: "finalizadas", label: `Finalizadas (${totalFinalizadas})`, color: "info" },
                        { key: "todas", label: "Todas", color: "primary" },
                    ] as const).map(({ key, label, color }) => (
                        <Chip
                            key={key}
                            label={label}
                            clickable
                            color={filtroStatus === key ? color : "default"}
                            variant={filtroStatus === key ? "filled" : "outlined"}
                            onClick={() => setFiltroStatus(key)}
                            sx={{ fontWeight: filtroStatus === key ? 700 : 400, transition: "all .15s" }}
                        />
                    ))}
                </Stack>

                {loading ? (
                    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" }, gap: 2 }}>
                        {Array.from({ length: 3 }).map((_, i) => (
                            <Skeleton key={i} height={230} sx={{ borderRadius: 3, transform: "none" }} />
                        ))}
                    </Box>
                ) : listasFiltradas.length === 0 ? (
                    <EmptyState
                        icon={<Inventory2OutlinedIcon />}
                        title="Nenhuma lista encontrada"
                        description="Crie uma nova lista ou altere o filtro para ver outros registros."
                        action={
                            <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate("/lista-compras/nova")}>
                                Nova lista
                            </Button>
                        }
                    />
                ) : (
                    <Box sx={{ mt: 1, display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" }, gap: 2 }}>
                        {listasFiltradas.map((l) => (
                            <ListaCard
                                key={l.id}
                                lista={l}
                                variant={l.status === "FINALIZADA" ? "finalizada" : "user"}
                                onClick={handleAbrirLista}
                                onEditLista={handleIrParaEdicao}
                            />
                        ))}
                    </Box>
                )}
            </Box>

            <Dialog
                open={modalOpen}
                onClose={handleFecharModal}
                fullWidth
                maxWidth="sm"
                PaperProps={{ sx: { borderRadius: 3, overflow: "hidden" } }}
            >
                <Box sx={(theme) => ({
                    background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 60%, ${alpha(theme.palette.primary.light, 0.9)} 100%)`,
                    px: 3, pt: 2.5,
                    pb: totalItensModal > 0 && listaSelecionada?.status !== "FINALIZADA" ? 2 : 2.5,
                })}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Typography variant="h6" fontWeight={900} sx={{ color: "#fff" }} noWrap>
                                {listaSelecionada?.titulo ?? "Itens da lista"}
                            </Typography>
                            <Stack direction="row" spacing={0.8} flexWrap="wrap" useFlexGap sx={{ mt: 0.8 }}>
                                <Chip
                                    size="small"
                                    label={listaSelecionada?.status === "FINALIZADA" ? "Finalizada" : "Aberta"}
                                    sx={{ bgcolor: "rgba(255,255,255,0.18)", color: "#fff", fontWeight: 700, border: "1px solid rgba(255,255,255,0.3)" }}
                                />
                                {listaSelecionada && (
                                    <Chip
                                        size="small"
                                        icon={<CalendarMonthOutlinedIcon style={{ color: "rgba(255,255,255,0.75)", fontSize: 13 }} />}
                                        label={formatDate(listaSelecionada.createdAt)}
                                        sx={{ bgcolor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.85)", border: "1px solid rgba(255,255,255,0.2)" }}
                                    />
                                )}
                            </Stack>
                        </Box>
                        <IconButton
                            onClick={handleFecharModal}
                            size="small"
                            sx={{ color: "rgba(255,255,255,0.8)", ml: 1, "&:hover": { bgcolor: "rgba(255,255,255,0.15)" } }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </Stack>

                    {totalItensModal > 0 && listaSelecionada?.status !== "FINALIZADA" && (
                        <Box sx={{ mt: 2 }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.6 }}>
                                <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>
                                    Modo compras
                                </Typography>
                                <Typography variant="caption" fontWeight={900} sx={{ color: "#fff" }}>
                                    {marcadosCount} / {totalItensModal}
                                </Typography>
                            </Stack>
                            <LinearProgress
                                variant="determinate"
                                value={progresso}
                                sx={{
                                    borderRadius: 4, height: 7,
                                    bgcolor: "rgba(255,255,255,0.2)",
                                    "& .MuiLinearProgress-bar": {
                                        bgcolor: progresso === 100 ? "#69f0ae" : "#fff",
                                        borderRadius: 4,
                                    },
                                }}
                            />
                            {progresso === 100 && (
                                <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.8 }}>
                                    <TaskAltIcon sx={{ fontSize: 15, color: "#69f0ae" }} />
                                    <Typography variant="caption" sx={{ color: "#69f0ae", fontWeight: 700 }}>
                                        Todos os itens marcados!
                                    </Typography>
                                </Stack>
                            )}
                        </Box>
                    )}
                </Box>

                <DialogContent sx={{ p: 0 }}>
                    {itensDaListaSelecionada.length === 0 ? (
                        <Box sx={{ p: 3 }}>
                            <EmptyState
                                icon={<Inventory2OutlinedIcon />}
                                title="Lista sem itens"
                                description="Esta lista ainda não possui produtos cadastrados."
                            />
                        </Box>
                    ) : (
                        <List disablePadding>
                            {itensDaListaSelecionada.map((it, idx) => {
                                const checked = marcados.has(it.produtoId);
                                return (
                                    <ListItem
                                        key={`${it.produtoId}-${idx}`}
                                        divider={idx < itensDaListaSelecionada.length - 1}
                                        sx={(theme) => ({
                                            px: 3, py: 1.5,
                                            transition: "background-color .15s, opacity .15s",
                                            opacity: checked ? 0.45 : 1,
                                            bgcolor: checked ? alpha(theme.palette.success.light, 0.07) : "transparent",
                                        })}
                                    >
                                        {listaSelecionada?.status !== "FINALIZADA" && (
                                            <ListItemIcon sx={{ minWidth: 48 }}>
                                                <Checkbox
                                                    edge="start"
                                                    checked={checked}
                                                    size="medium"
                                                    color="success"
                                                    onChange={(e) => {
                                                        setMarcados((prev) => {
                                                            const next = new Set(prev);
                                                            if (e.target.checked) next.add(it.produtoId);
                                                            else next.delete(it.produtoId);
                                                            return next;
                                                        });
                                                    }}
                                                />
                                            </ListItemIcon>
                                        )}
                                        <ListItemText
                                            primary={
                                                <Typography
                                                    fontWeight={700}
                                                    sx={{
                                                        textDecoration: checked ? "line-through" : "none",
                                                        fontSize: "1rem",
                                                        color: checked ? "text.disabled" : "text.primary",
                                                    }}
                                                >
                                                    {it.produto?.nome ?? `Produto #${it.produtoId}`}
                                                </Typography>
                                            }
                                            secondary={
                                                <Typography component="span" variant="body2" color="text.secondary">
                                                    Qtd: {it.qtd}
                                                </Typography>
                                            }
                                        />
                                    </ListItem>
                                );
                            })}
                        </List>
                    )}
                </DialogContent>

                <DialogActions sx={(theme) => ({
                    px: 3, py: 2,
                    borderTop: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
                    gap: 1, flexWrap: "wrap",
                })}>
                    {listaSelecionada && listaSelecionada.status !== "FINALIZADA" && (
                        <Button
                            color="error" variant="outlined" startIcon={<ArchiveOutlinedIcon />}
                            sx={{ textTransform: "none" }}
                            onClick={async () => {
                                try {
                                    await listaComprasService.finalizarLista(listaSelecionada.id);
                                    enqueueSnackbar("Lista arquivada com sucesso.", { variant: "success" });
                                    handleFecharModal();
                                    await carregarListas();
                                } catch (e: any) {
                                    enqueueSnackbar(e.response?.data?.erro || "Erro ao arquivar lista.", { variant: "error" });
                                }
                            }}
                        >
                            Arquivar
                        </Button>
                    )}
                    {listaSelecionada && listaSelecionada.status === "FINALIZADA" && (
                        <Button
                            color="primary" variant="outlined"
                            sx={{ textTransform: "none" }}
                            onClick={async () => {
                                try {
                                    await listaComprasService.reabrirLista(listaSelecionada.id);
                                    enqueueSnackbar("Lista reaberta com sucesso.", { variant: "success" });
                                    handleFecharModal();
                                    await carregarListas();
                                } catch (e: any) {
                                    enqueueSnackbar(e.response?.data?.erro || "Erro ao reabrir lista.", { variant: "error" });
                                }
                            }}
                        >
                            Reabrir lista
                        </Button>
                    )}
                    {listaSelecionada?.status !== "FINALIZADA" && (
                        <Button
                            variant="contained" startIcon={<EditIcon />}
                            sx={{ textTransform: "none", ml: "auto" }}
                            onClick={() => {
                                if (listaSelecionada) { handleFecharModal(); handleIrParaEdicao(listaSelecionada); }
                            }}
                        >
                            Editar itens
                        </Button>
                    )}
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackErroOpen}
                autoHideDuration={5000}
                onClose={() => setSnackErroOpen(false)}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert severity="error" variant="filled" onClose={() => setSnackErroOpen(false)} sx={{ width: "100%" }}>
                    {snackErroMsg}
                </Alert>
            </Snackbar>
        </ShoppingPage>
    );
}
