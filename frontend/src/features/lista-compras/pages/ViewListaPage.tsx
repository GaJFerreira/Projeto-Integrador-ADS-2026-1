import { useEffect, useMemo, useState } from "react";
import {
    Box,
    Typography,
    Card,
    CardActionArea,
    CardContent,
    Stack,
    Chip,
    Button,
    Skeleton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Snackbar,
    Alert,
    List,
    ListItem,
    ListItemText,
    IconButton,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import { alpha } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";

import { listaViewService, type ListaDTO } from "../api/service/listaViewService.ts";
import { listaComprasService } from "../api/service/listaComprasService.ts";
import {
    EmptyState,
    SectionTitle,
    ShoppingHeader,
    ShoppingPage,
} from "@/features/lista-compras/components/ShoppingUi.tsx";

export default function ViewListaPage() {
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();

    const [listasUsuario, setListasUsuario] = useState<ListaDTO[]>([]);
    const [loading, setLoading] = useState(true);

    // filtro de status: abertas | finalizadas | todas
    const [filtroStatus, setFiltroStatus] = useState<"abertas" | "finalizadas" | "todas">("abertas");

    // snackbar genérico de erro
    const [snackErroOpen, setSnackErroOpen] = useState(false);
    const [snackErroMsg, setSnackErroMsg] = useState("Erro ao carregar listas.");

    const [listaSelecionada, setListaSelecionada] = useState<ListaDTO | null>(null);
    const [modalOpen, setModalOpen] = useState(false);

    const handleAbrirLista = (lista: ListaDTO) => {
        setListaSelecionada(lista);
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

    useEffect(() => {
        carregarListas();
    }, []);

    // aplica o filtro de status em cima de todas as listas do usuário
    const listasFiltradas = useMemo(() => {
        let base = [...listasUsuario];

        if (filtroStatus === "abertas") {
            base = base.filter((l) => l.status !== "FINALIZADA");
        } else if (filtroStatus === "finalizadas") {
            base = base.filter((l) => l.status === "FINALIZADA");
        }
        // "todas" => não filtra

        return base;
    }, [listasUsuario, filtroStatus]);

    const totalAbertas = listasUsuario.filter((l) => l.status !== "FINALIZADA").length;
    const totalFinalizadas = listasUsuario.filter((l) => l.status === "FINALIZADA").length;
    const totalItens = listasUsuario.reduce((acc, lista) => acc + (lista.itens?.length ?? 0), 0);

    const formatDate = (iso: string) => {
        try {
            const d = new Date(iso);
            return d.toLocaleDateString("pt-BR");
        } catch {
            return iso;
        }
    };

    const ListaCard = ({
                           lista,
                           variant,
                           onClick,
                           onEditLista,
                       }: {
        lista: ListaDTO;
        variant: "template" | "user" | "finalizada";
        onClick?: (lista: ListaDTO) => void;
        onEditLista?: (lista: ListaDTO) => void;
    }) => {
        const isTemplate = variant === "template";
        const isFinalizada = variant === "finalizada";
        const isAberta = variant === "user" && lista.status !== "FINALIZADA";
        const itemCount = lista.itens?.length ?? 0;
        const previewItems = lista.itens
            ?.slice(0, 3)
            .map((item) => item.produto?.nome ?? `Produto #${item.produtoId}`)
            .join(", ");

        return (
            <Card
                elevation={0}
                sx={(theme) => ({
                    height: "100%",
                    borderRadius: 3,
                    border: "1px solid",
                    borderColor: isFinalizada
                        ? alpha(theme.palette.grey[400], 0.78)
                        : alpha(theme.palette.primary.main, 0.14),
                    background: isFinalizada
                        ? alpha(theme.palette.grey[100], 0.84)
                        : isTemplate
                            ? alpha(theme.palette.primary.light, 0.08)
                            : "#fff",
                    overflow: "hidden",
                    transition: "transform .18s ease, box-shadow .18s ease, border-color .18s ease",
                    "&:hover": {
                        transform: "translateY(-4px)",
                        boxShadow: `0 18px 36px ${alpha(theme.palette.primary.main, 0.12)}`,
                        borderColor: isFinalizada
                            ? alpha(theme.palette.grey[500], 0.9)
                            : isTemplate
                                ? theme.palette.primary.light
                                : theme.palette.grey[300],
                    },
                })}
            >
                <CardActionArea onClick={() => onClick?.(lista)} sx={{ p: 0 }}>
                    <CardContent sx={{ p: 2.2, height: "100%" }}>
                        <Stack spacing={1.5} sx={{ height: "100%" }}>
                            <Stack direction="row" spacing={1.2} alignItems="flex-start">
                                <Box
                                    sx={(theme) => ({
                                        width: 42,
                                        height: 42,
                                        borderRadius: 2,
                                        display: "grid",
                                        placeItems: "center",
                                        backgroundColor: isTemplate
                                            ? theme.palette.primary.main
                                            : isFinalizada
                                                ? theme.palette.grey[500]
                                                : theme.palette.success.main,
                                        boxShadow: `0 10px 18px ${alpha(
                                            isFinalizada ? theme.palette.grey[500] : theme.palette.success.main,
                                            0.18
                                        )}`,
                                    })}
                                >
                                    {isTemplate ? (
                                        <ContentCopyIcon sx={{ color: "#fff", fontSize: 21 }} />
                                    ) : (
                                        <ShoppingCartIcon sx={{ color: "#fff", fontSize: 21 }} />
                                    )}
                                </Box>

                                <Box sx={{ minWidth: 0, flex: 1 }}>
                                    <Typography fontWeight={900} noWrap title={lista.titulo}>
                                        {lista.titulo}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Criada em {formatDate(lista.createdAt)}
                                    </Typography>
                                </Box>
                            </Stack>

                            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                                <Chip
                                    size="small"
                                    label={lista.status === "FINALIZADA" ? "Finalizada" : "Aberta"}
                                    icon={
                                        lista.status === "FINALIZADA" ? (
                                            <CheckCircleIcon />
                                        ) : undefined
                                    }
                                    color={lista.status === "FINALIZADA" ? "info" : "success"}
                                    variant="filled"
                                />

                                <Chip
                                    size="small"
                                    label={`${itemCount} ${itemCount === 1 ? "item" : "itens"}`}
                                    variant="outlined"
                                />
                            </Stack>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{
                                    minHeight: 40,
                                    display: "-webkit-box",
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: "vertical",
                                    overflow: "hidden",
                                }}
                            >
                                {previewItems || "Sem itens cadastrados."}
                            </Typography>

                            {isAberta && (
                                <Box sx={{ display: "flex", justifyContent: "flex-end", mt: "auto" }}>
                                    <Button
                                        size="small"
                                        variant="outlined"
                                        startIcon={<EditIcon />}
                                        sx={{
                                            textTransform: "none",
                                            fontWeight: 800,
                                            fontSize: "0.82rem",
                                            minWidth: "auto",
                                            px: 1.2,
                                            py: 0.55,
                                        }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onEditLista?.(lista);
                                        }}
                                    >
                                        Editar itens
                                    </Button>
                                </Box>
                            )}
                        </Stack>
                    </CardContent>
                </CardActionArea>
            </Card>
        );
    };

    const handleIrParaEdicao = (lista: ListaDTO) => {
        navigate(`/lista-compras/${lista.id}/editar`);
    };

    const itensDaListaSelecionada = listaSelecionada?.itens ?? [];

    return (
        <ShoppingPage maxWidth={1120}>
            <ShoppingHeader
                eyebrow="Compre com Saúde"
                title="Minhas listas"
                description="Acompanhe listas abertas, revise compras arquivadas e volte rapidamente para edição."
                icon={<ShoppingCartIcon />}
                onBack={() => navigate("/lista-compras", { replace: true })}
                actions={
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => navigate("/lista-compras/nova")}
                    >
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

            <Box
                sx={(theme) => ({
                    p: { xs: 2, sm: 2.5 },
                    borderRadius: 3,
                    border: "1px solid",
                    borderColor: alpha(theme.palette.divider, 0.95),
                    backgroundColor: "#fff",
                    boxShadow: `0 18px 48px ${alpha(theme.palette.common.black, 0.07)}`,
                })}
            >
                <SectionTitle
                    title="Listas salvas"
                    description={`${listasFiltradas.length} resultado${listasFiltradas.length === 1 ? "" : "s"} no filtro atual.`}
                />

                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2.2 }}>
                    <Chip
                        label={`Abertas (${totalAbertas})`}
                        clickable
                        color={filtroStatus === "abertas" ? "success" : "default"}
                        variant={filtroStatus === "abertas" ? "filled" : "outlined"}
                        onClick={() => setFiltroStatus("abertas")}
                    />
                    <Chip
                        label={`Finalizadas (${totalFinalizadas})`}
                        clickable
                        color={filtroStatus === "finalizadas" ? "info" : "default"}
                        variant={filtroStatus === "finalizadas" ? "filled" : "outlined"}
                        onClick={() => setFiltroStatus("finalizadas")}
                    />
                    <Chip
                        label="Todas"
                        clickable
                        color={filtroStatus === "todas" ? "primary" : "default"}
                        variant={filtroStatus === "todas" ? "filled" : "outlined"}
                        onClick={() => setFiltroStatus("todas")}
                    />
                </Stack>

                {loading ? (
                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: {
                                xs: "1fr",
                                sm: "repeat(2, 1fr)",
                                md: "repeat(3, 1fr)",
                            },
                            gap: 2,
                        }}
                    >
                        {Array.from({ length: 3 }).map((_, i) => (
                            <Skeleton key={i} height={176} sx={{ borderRadius: 3, transform: "none" }} />
                        ))}
                    </Box>
                ) : listasFiltradas.length === 0 ? (
                    <EmptyState
                        icon={<Inventory2OutlinedIcon />}
                        title="Nenhuma lista encontrada"
                        description="Crie uma nova lista ou altere o filtro para ver outros registros."
                        action={
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={() => navigate("/lista-compras/nova")}
                            >
                                Nova lista
                            </Button>
                        }
                    />
                ) : (
                    <Box
                        sx={{
                            mt: 1,
                            display: "grid",
                            gridTemplateColumns: {
                                xs: "1fr",
                                sm: "repeat(2, 1fr)",
                                md: "repeat(3, 1fr)",
                            },
                            gap: 2,
                        }}
                    >
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

            <Dialog open={modalOpen} onClose={handleFecharModal} fullWidth maxWidth="sm">
                <DialogTitle
                    sx={{
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        gap: 2,
                        pb: 1.5,
                    }}
                >
                    <Box sx={{ minWidth: 0 }}>
                        <Typography variant="h6" fontWeight={900} noWrap>
                            {listaSelecionada?.titulo ?? "Itens da lista"}
                        </Typography>
                        {listaSelecionada && (
                            <Stack direction="row" spacing={0.8} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
                                <Chip
                                    size="small"
                                    label={listaSelecionada.status === "FINALIZADA" ? "Finalizada" : "Aberta"}
                                    color={listaSelecionada.status === "FINALIZADA" ? "info" : "success"}
                                />
                                <Chip
                                    size="small"
                                    icon={<CalendarMonthOutlinedIcon />}
                                    label={formatDate(listaSelecionada.createdAt)}
                                    variant="outlined"
                                />
                            </Stack>
                        )}
                    </Box>
                    <IconButton onClick={handleFecharModal} size="small" aria-label="Fechar detalhes da lista">
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <DialogContent dividers>
                    {itensDaListaSelecionada.length === 0 ? (
                        <EmptyState
                            icon={<Inventory2OutlinedIcon />}
                            title="Lista sem itens"
                            description="Esta lista ainda não possui produtos cadastrados."
                        />
                    ) : (
                        <List disablePadding>
                            {itensDaListaSelecionada.map((it, idx) => (
                                <ListItem
                                    key={`${it.produtoId}-${idx}`}
                                    divider={idx < itensDaListaSelecionada.length - 1}
                                    sx={{ px: 0, py: 1.2 }}
                                >
                                    <ListItemText
                                        primary={
                                            <Typography fontWeight={800}>
                                                {it.produto?.nome ?? `Produto #${it.produtoId}`}
                                            </Typography>
                                        }
                                        secondary={
                                            <Typography component="span" variant="body2" color="text.secondary">
                                                Quantidade: {it.qtd}
                                            </Typography>
                                        }
                                    />
                                </ListItem>
                            ))}
                        </List>
                    )}
                </DialogContent>

                <DialogActions sx={{ px: 3, py: 2, gap: 1, flexWrap: "wrap" }}>
                    {listaSelecionada && listaSelecionada.status !== "FINALIZADA" && (
                        <Button
                            color="error"
                            variant="outlined"
                            startIcon={<ArchiveOutlinedIcon />}
                            onClick={async () => {
                                try {
                                    await listaComprasService.finalizarLista(listaSelecionada.id);
                                    enqueueSnackbar("Lista arquivada com sucesso.", {
                                        variant: "success",
                                    });
                                    handleFecharModal();
                                    await carregarListas();
                                } catch (e: any) {
                                    console.error(e);
                                    const msg =
                                        e.response?.data?.erro ||
                                        "Erro ao arquivar lista.";
                                    enqueueSnackbar(msg, { variant: "error" });
                                }
                            }}
                        >
                            Arquivar lista
                        </Button>
                    )}

                    {listaSelecionada && listaSelecionada.status === "FINALIZADA" && (
                        <Button
                            color="primary"
                            variant="outlined"
                            onClick={async () => {
                                try {
                                    await listaComprasService.reabrirLista(listaSelecionada.id);
                                    enqueueSnackbar("Lista reaberta com sucesso.", {
                                        variant: "success",
                                    });
                                    handleFecharModal();
                                    await carregarListas();
                                } catch (e: any) {
                                    console.error(e);
                                    const msg =
                                        e.response?.data?.erro ||
                                        "Erro ao reabrir lista.";
                                    enqueueSnackbar(msg, { variant: "error" });
                                }
                            }}
                        >
                            Reabrir lista
                        </Button>
                    )}

                    {listaSelecionada?.status !== "FINALIZADA" && (
                        <Button
                            variant="contained"
                            startIcon={<EditIcon />}
                            onClick={() => {
                                if (listaSelecionada) {
                                    handleFecharModal();
                                    handleIrParaEdicao(listaSelecionada);
                                }
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
                <Alert
                    severity="error"
                    variant="filled"
                    onClose={() => setSnackErroOpen(false)}
                    sx={{ width: "100%" }}
                >
                    {snackErroMsg}
                </Alert>
            </Snackbar>
        </ShoppingPage>
    );
}
