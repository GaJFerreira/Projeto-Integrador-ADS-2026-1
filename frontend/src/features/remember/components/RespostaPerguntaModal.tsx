import { useEffect, useState } from 'react';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
    TextField,
    Typography
} from '@mui/material';
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer';
import type { PerguntaCognitiva } from '../api/perguntas';

interface RespostaPerguntaModalProps {
    open: boolean;
    pergunta: PerguntaCognitiva | null;
    loading?: boolean;
    onClose: () => void;
    onSubmit: (textoResposta: string) => void;
}

export default function RespostaPerguntaModal({
    open,
    pergunta,
    loading = false,
    onClose,
    onSubmit
}: RespostaPerguntaModalProps) {
    const [textoResposta, setTextoResposta] = useState('');

    useEffect(() => {
        if (open) {
            setTextoResposta('');
        }
    }, [open, pergunta?.identificadorPerguntaCognitiva]);

    const handleSubmit = () => {
        if (textoResposta.trim()) {
            onSubmit(textoResposta.trim());
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>
                <Stack direction="row" spacing={1.5} alignItems="center">
                    <QuestionAnswerIcon sx={{ color: '#7b1fa2' }} />
                    <Typography variant="h6" fontWeight={700}>
                        Responder pergunta
                    </Typography>
                </Stack>
            </DialogTitle>

            <DialogContent>
                <Stack spacing={2.5} sx={{ pt: 1 }}>
                    <Typography variant="body1" color="text.primary" sx={{ fontWeight: 600 }}>
                        {pergunta?.textoPergunta}
                    </Typography>

                    <TextField
                        label="Resposta"
                        value={textoResposta}
                        onChange={(event) => setTextoResposta(event.target.value)}
                        fullWidth
                        multiline
                        minRows={4}
                        autoFocus
                    />
                </Stack>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onClose} disabled={loading}>
                    Cancelar
                </Button>
                <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={loading || !textoResposta.trim()}
                    sx={{ bgcolor: '#7b1fa2', '&:hover': { bgcolor: '#6a1b9a' } }}
                >
                    Salvar resposta
                </Button>
            </DialogActions>
        </Dialog>
    );
}
