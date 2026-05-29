import { useEffect, useState } from 'react';
import type React from 'react';
import {
    Box,
    CircularProgress,
    Paper,
    Stack,
    ToggleButton,
    ToggleButtonGroup,
    Typography
} from '@mui/material';
import PsychologyIcon from '@mui/icons-material/Psychology';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import { useSnackbar } from 'notistack';
import PerguntaCard from '../components/PerguntaCard';
import RespostaPerguntaModal from '../components/RespostaPerguntaModal';
import {
    perguntasApi,
    type PerguntaCognitiva,
    type RespostaPergunta,
    type StatusPerguntaFiltro
} from '../api/perguntas';
import { formatarDataRemember } from '../utils/date';
import type { ConquistaDetalhes } from '../api/conquistasUsuario';

type Visualizacao = StatusPerguntaFiltro | 'RESPOSTAS';

interface PerguntasCognitivasPageProps {
    onConquistaGanhas?: (conquistas: ConquistaDetalhes[]) => void;
}

export default function PerguntasCognitivasPage({ onConquistaGanhas }: PerguntasCognitivasPageProps) {
    const { enqueueSnackbar } = useSnackbar();

    const [visualizacao, setVisualizacao] = useState<Visualizacao>('PENDENTES');
    const [perguntas, setPerguntas] = useState<PerguntaCognitiva[]>([]);
    const [respostas, setRespostas] = useState<RespostaPergunta[]>([]);
    const [loading, setLoading] = useState(true);

    const [perguntaSelecionada, setPerguntaSelecionada] = useState<PerguntaCognitiva | null>(null);
    const [modalRespostaAberto, setModalRespostaAberto] = useState(false);
    const [salvandoResposta, setSalvandoResposta] = useState(false);

    useEffect(() => {
        carregarDados();
    }, [visualizacao]);

    async function carregarDados() {
        setLoading(true);
        try {
            if (visualizacao === 'RESPOSTAS') {
                const dados = await perguntasApi.listarRespostas();
                setRespostas(dados);
            } else {
                if (visualizacao === 'PENDENTES') {
                    await perguntasApi.gerar();
                }
                const dados = await perguntasApi.listar(visualizacao);
                setPerguntas(dados);
            }
        } catch (error) {
            enqueueSnackbar('Erro ao carregar perguntas cognitivas.', { variant: 'error' });
        } finally {
            setLoading(false);
        }
    }

    const handleResponder = (pergunta: PerguntaCognitiva) => {
        setPerguntaSelecionada(pergunta);
        setModalRespostaAberto(true);
    };

    const handleSalvarResposta = async (textoResposta: string) => {
        if (!perguntaSelecionada) return;

        setSalvandoResposta(true);
        try {
            const response = await perguntasApi.responder({
                identificadorPergunta: perguntaSelecionada.identificadorPerguntaCognitiva,
                textoResposta,
            });
            if (response.conquistasDesbloqueadas?.length) {
                onConquistaGanhas?.(response.conquistasDesbloqueadas);
            }
            enqueueSnackbar('Resposta salva com sucesso!', { variant: 'success' });
            setModalRespostaAberto(false);
            setPerguntaSelecionada(null);
            setVisualizacao('PENDENTES');
            await perguntasApi.gerar();
            const dados = await perguntasApi.listar('PENDENTES');
            setPerguntas(dados);
        } catch (error) {
            enqueueSnackbar('Erro ao salvar resposta.', { variant: 'error' });
        } finally {
            setSalvandoResposta(false);
        }
    };

    const handleVisualizacaoChange = (_event: React.MouseEvent<HTMLElement>, value: Visualizacao | null) => {
        if (value) {
            setVisualizacao(value);
        }
    };

    return (
        <Box>
            <Paper
                elevation={0}
                sx={{
                    p: 2,
                    mb: 3,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    bgcolor: 'background.paper'
                }}
            >
                <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    spacing={2}
                    alignItems={{ xs: 'stretch', md: 'center' }}
                    justifyContent="space-between"
                >
                    <ToggleButtonGroup
                        value={visualizacao}
                        exclusive
                        onChange={handleVisualizacaoChange}
                        size="small"
                        color="primary"
                    >
                        <ToggleButton value="PENDENTES">Pendentes</ToggleButton>
                        <ToggleButton value="RESPONDIDAS">Respondidas</ToggleButton>
                        <ToggleButton value="RESPOSTAS">Respostas</ToggleButton>
                    </ToggleButtonGroup>

                    <Stack spacing={0.5}>
                        <Typography variant="body2" color="text.secondary">
                            As perguntas sao criadas automaticamente conforme seus diarios e lembrancas.
                        </Typography>
                    </Stack>
                </Stack>
            </Paper>

            {loading ? (
                <Box display="flex" justifyContent="center" py={10}>
                    <CircularProgress sx={{ color: '#7b1fa2' }} />
                </Box>
            ) : visualizacao === 'RESPOSTAS' ? (
                <RespostasList respostas={respostas} />
            ) : (
                <PerguntasList
                    perguntas={perguntas}
                    onResponder={handleResponder}
                    visualizacao={visualizacao}
                />
            )}

            <RespostaPerguntaModal
                open={modalRespostaAberto}
                pergunta={perguntaSelecionada}
                loading={salvandoResposta}
                onClose={() => setModalRespostaAberto(false)}
                onSubmit={handleSalvarResposta}
            />

        </Box>
    );
}

function PerguntasList({
    perguntas,
    onResponder,
    visualizacao
}: {
    perguntas: PerguntaCognitiva[];
    onResponder: (pergunta: PerguntaCognitiva) => void;
    visualizacao: StatusPerguntaFiltro;
}) {
    if (perguntas.length === 0) {
        return (
            <Box textAlign="center" py={8} sx={{ opacity: 0.7 }}>
                <PsychologyIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                    {visualizacao === 'PENDENTES'
                        ? 'Nenhuma pergunta pendente no momento.'
                        : 'Nenhuma pergunta respondida encontrada.'}
                </Typography>
                {visualizacao === 'PENDENTES' && (
                    <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 520, mx: 'auto', mt: 1 }}>
                        Adicione novos diarios ou lembrancas para que o Remember gere novas perguntas cognitivas sem repetir as anteriores.
                    </Typography>
                )}
            </Box>
        );
    }

    return (
        <Box
            sx={{
                display: 'grid',
                gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'repeat(2, minmax(0, 1fr))',
                    md: 'repeat(3, minmax(0, 1fr))'
                },
                gap: 3,
                mt: 1
            }}
        >
            {perguntas.map((pergunta) => (
                <Box key={pergunta.identificadorPerguntaCognitiva}>
                    <PerguntaCard pergunta={pergunta} onResponder={onResponder} />
                </Box>
            ))}
        </Box>
    );
}

function RespostasList({ respostas }: { respostas: RespostaPergunta[] }) {
    if (respostas.length === 0) {
        return (
            <Box textAlign="center" py={8} sx={{ opacity: 0.7 }}>
                <QuestionAnswerIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                    Nenhuma resposta encontrada.
                </Typography>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                display: 'grid',
                gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'repeat(2, minmax(0, 1fr))',
                    md: 'repeat(3, minmax(0, 1fr))'
                },
                gap: 3,
                mt: 1
            }}
        >
            {respostas.map((resposta) => {
                const dataFormatada = formatarDataRemember(
                    resposta.dataResposta ?? (resposta as any).data_resposta ?? (resposta as any).data
                );

                return (
                    <Box key={resposta.identificadorRespostaPerguntaUsuario}>
                        <Paper
                            elevation={3}
                            sx={{
                                height: '100%',
                                p: 2.5,
                                borderLeft: '6px solid #2e7d32',
                                borderRadius: 2
                            }}
                        >
                            <Stack spacing={1.5}>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <QuestionAnswerIcon sx={{ fontSize: 20, color: '#2e7d32' }} />
                                    <Typography variant="caption" color="text.secondary" fontWeight="bold">
                                        {dataFormatada}
                                    </Typography>
                                </Stack>

                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{
                                        display: '-webkit-box',
                                        overflow: 'hidden',
                                        WebkitBoxOrient: 'vertical',
                                        WebkitLineClamp: 5,
                                    }}
                                >
                                    {resposta.textoResposta}
                                </Typography>
                            </Stack>
                        </Paper>
                    </Box>
                );
            })}
        </Box>
    );
}
