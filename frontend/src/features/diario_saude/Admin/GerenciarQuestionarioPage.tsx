import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Box, Button, Typography, Stack, Paper, IconButton,
    TextField, Dialog, DialogTitle, DialogContent,
    DialogActions, Divider, CircularProgress,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import PageContainer from "../components/PageContainer";
import PageTitle from "../components/PageTitle";
import BackButton from "../components/BackButton";
import { questionarioApi } from "../api/questionarioApi";
import type { Pergunta } from "../api/types";

type OpcaoForm = { texto: string; peso: number };

export default function GerenciarQuestionarioPage() {
    const queryClient = useQueryClient();

    const [modalAberto, setModalAberto] = useState(false);
    const [perguntaEditando, setPerguntaEditando] = useState<Pergunta | null>(null);
    const [textoInput, setTextoInput] = useState("");
    const [opcoes, setOpcoes] = useState<OpcaoForm[]>([
        { texto: "Sim", peso: 4 },
        { texto: "Não", peso: 0 },
    ]);

    const { data: perguntas = [], isLoading } = useQuery({
        queryKey: ["questionario", "perguntas"],
        queryFn: questionarioApi.listarPerguntas,
        refetchOnWindowFocus: false,
    });

    // Converte o array de opções para o JSON que o backend espera
    function opcoesParaJson(): string {
        const json: Record<string, number> = {};
        opcoes.forEach((o) => { if (o.texto.trim()) json[o.texto.trim()] = o.peso; });
        return JSON.stringify(json);
    }

    const criar = useMutation({
        mutationFn: () => questionarioApi.criarPergunta(textoInput, opcoesParaJson()),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["questionario", "perguntas"] });
            fecharModal();
        },
    });

    const editar = useMutation({
        mutationFn: () =>
            questionarioApi.editarPergunta(perguntaEditando!.id, textoInput, opcoesParaJson()),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["questionario", "perguntas"] });
            fecharModal();
        },
    });

    const deletar = useMutation({
        mutationFn: (id: number) => questionarioApi.deletarPergunta(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["questionario", "perguntas"] }),
    });

    function abrirModalNovo() {
        setPerguntaEditando(null);
        setTextoInput("");
        setOpcoes([
            { texto: "Sim", peso: 4 },
            { texto: "Não", peso: 0 },
        ]);
        setModalAberto(true);
    }

    function abrirModalEditar(p: Pergunta) {
        setPerguntaEditando(p);
        setTextoInput(p.texto);
        setOpcoes(p.opcoes.map((o) => ({ texto: o.texto, peso: o.peso })));
        setModalAberto(true);
    }

    function fecharModal() {
        setModalAberto(false);
        setPerguntaEditando(null);
        setTextoInput("");
        setOpcoes([{ texto: "Sim", peso: 4 }, { texto: "Não", peso: 0 }]);
    }

    function adicionarOpcao() {
        setOpcoes((prev) => [...prev, { texto: "", peso: 0 }]);
    }

    function removerOpcao(idx: number) {
        setOpcoes((prev) => prev.filter((_, i) => i !== idx));
    }

    function atualizarOpcao(idx: number, campo: keyof OpcaoForm, valor: string | number) {
        setOpcoes((prev) =>
            prev.map((op, i) => i === idx ? { ...op, [campo]: valor } : op)
        );
    }

    function salvar() {
        if (!textoInput.trim()) return;
        if (opcoes.length === 0 || opcoes.every((o) => !o.texto.trim())) return;
        if (perguntaEditando) {
            editar.mutate();
        } else {
            criar.mutate();
        }
    }

    function confirmarDeletar(id: number) {
        if (window.confirm("Tem certeza que deseja excluir esta pergunta?")) {
            deletar.mutate(id);
        }
    }

    return (

        <PageContainer>
            <BackButton to="/saude" />
            <PageTitle>Gerenciar Questionário</PageTitle>

            <Box display="flex" justifyContent="flex-end" mb={2}>
                <Button variant="contained" onClick={abrirModalNovo}>
                    + Nova pergunta
                </Button>
            </Box>

            {isLoading ? (
                <CircularProgress />
            ) : (
                <Stack spacing={2}>
                    {perguntas.map((p, idx) => (
                        <Paper key={p.id} elevation={1} sx={{ p: 2.5, borderRadius: 2 }}>
                            <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                                <Box flex={1}>
                                    <Typography variant="caption" color="text.secondary">
                                        Pergunta {idx + 1}
                                    </Typography>
                                    <Typography fontWeight={600} mb={1}>
                                        {p.texto}
                                    </Typography>
                                    <Stack direction="row" spacing={1} flexWrap="wrap">
                                        {p.opcoes.map((o, i) => (
                                            <Typography
                                                key={i}
                                                variant="body2"
                                                sx={{
                                                    px: 1.5, py: 0.5, borderRadius: 2,
                                                    bgcolor: o.peso > 0 ? "#fff3e0" : "#e8f5e9",
                                                    color: o.peso > 0 ? "#e65100" : "#2e7d32",
                                                    fontWeight: 500,
                                                }}
                                            >
                                                {o.texto} (peso: {o.peso})
                                            </Typography>
                                        ))}
                                    </Stack>
                                </Box>
                                <Stack direction="row" spacing={0.5} ml={1}>
                                    <IconButton onClick={() => abrirModalEditar(p)}>
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton color="error" onClick={() => confirmarDeletar(p.id)}>
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </Stack>
                            </Box>
                        </Paper>
                    ))}
                </Stack>
            )}

            {/* Modal criar/editar */}
            <Dialog open={modalAberto} onClose={fecharModal} fullWidth maxWidth="sm">
                <DialogTitle>
                    {perguntaEditando ? "Editar pergunta" : "Nova pergunta"}
                </DialogTitle>

                <DialogContent>
                    <Stack spacing={3} mt={1}>

                        {/* Texto da pergunta */}
                        <TextField
                            label="Texto da pergunta"
                            fullWidth
                            multiline
                            rows={3}
                            value={textoInput}
                            onChange={(e) => setTextoInput(e.target.value)}
                        />

                        {/* Opções visuais */}
                        <Box>
                            <Typography variant="subtitle2" color="text.secondary" mb={1}>
                                Opções de resposta
                            </Typography>

                            <Stack spacing={1.5}>
                                {opcoes.map((op, idx) => (
                                    <Box key={idx} display="flex" alignItems="center" gap={1}>
                                        <TextField
                                            label="Texto da opção"
                                            size="small"
                                            value={op.texto}
                                            onChange={(e) => atualizarOpcao(idx, "texto", e.target.value)}
                                            sx={{ flex: 1 }}
                                        />
                                        <TextField
                                            label="Peso"
                                            size="small"
                                            type="number"
                                            value={op.peso}
                                            onChange={(e) => atualizarOpcao(idx, "peso", Number(e.target.value))}
                                            inputProps={{ min: 0 }}
                                            sx={{ width: 80 }}
                                        />
                                        <IconButton
                                            color="error"
                                            onClick={() => removerOpcao(idx)}
                                            disabled={opcoes.length <= 1}
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </Box>
                                ))}
                            </Stack>

                            <Button
                                startIcon={<AddIcon />}
                                onClick={adicionarOpcao}
                                size="small"
                                sx={{ mt: 1.5 }}
                            >
                                Adicionar opção
                            </Button>
                        </Box>

                    </Stack>
                </DialogContent>

                <Divider />

                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={fecharModal}>Cancelar</Button>
                    <Button
                        variant="contained"
                        onClick={salvar}
                        disabled={criar.isLoading || editar.isLoading}
                    >
                        Salvar
                    </Button>
                </DialogActions>
            </Dialog>
        </PageContainer>
    );
}