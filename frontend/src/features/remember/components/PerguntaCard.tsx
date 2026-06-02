import React from 'react';
import {
    Button,
    Card,
    CardContent,
    Chip,
    Stack,
    Tooltip,
    Typography
} from '@mui/material';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import type { PerguntaCognitiva } from '../api/perguntas';
import { formatarDataRemember } from '../utils/date';

interface PerguntaCardProps {
    pergunta: PerguntaCognitiva;
    onResponder: (pergunta: PerguntaCognitiva) => void;
}

export default function PerguntaCard({ pergunta, onResponder }: PerguntaCardProps) {
    const dataFormatada = formatarDataRemember(
        pergunta.dataGeracao ?? (pergunta as any).data_geracao ?? (pergunta as any).data
    );

    const pendente = pergunta.status === 'ENVIADA';

    const handleResponder = (event: React.MouseEvent) => {
        event.stopPropagation();
        onResponder(pergunta);
    };

    return (
        <Card
            elevation={3}
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6
                },
                borderLeft: '6px solid #7b1fa2',
                borderRadius: 2
            }}
        >
            <CardContent sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2} mb={1.5}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <QuestionAnswerIcon sx={{ fontSize: 20, color: '#7b1fa2', opacity: 0.85 }} />
                        <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ fontSize: '0.85rem' }}>
                            Pergunta cognitiva
                        </Typography>
                    </Stack>

                    <Chip
                        size="small"
                        label={pendente ? 'Pendente' : 'Respondida'}
                        color={pendente ? 'warning' : 'success'}
                        variant="outlined"
                    />
                </Stack>

                <Typography
                    variant="h6"
                    component="div"
                    sx={{
                        lineHeight: 1.35,
                        fontWeight: 600,
                        mb: 2,
                        flexGrow: 1
                    }}
                >
                    {pergunta.textoPergunta}
                </Typography>

                <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <CalendarTodayIcon fontSize="small" sx={{ color: 'text.disabled' }} />
                        <Typography variant="caption" color="text.secondary">
                            {dataFormatada}
                        </Typography>
                    </Stack>

                    {pendente && (
                        <Tooltip title="Responder pergunta">
                            <Button
                                variant="contained"
                                size="small"
                                startIcon={<QuestionAnswerIcon />}
                                onClick={handleResponder}
                                sx={{ bgcolor: '#7b1fa2', '&:hover': { bgcolor: '#6a1b9a' } }}
                            >
                                Responder
                            </Button>
                        </Tooltip>
                    )}
                </Stack>
            </CardContent>
        </Card>
    );
}
