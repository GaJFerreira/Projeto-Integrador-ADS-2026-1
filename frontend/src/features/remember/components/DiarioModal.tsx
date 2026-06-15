import React, { useEffect, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    Stack,
    Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import { useSnackbar } from 'notistack';
import { diariosApi, type CreateDiarioPayload, type Diario, type UpdateDiarioPayload } from '../api/diarios';
import type { ConquistaDetalhes } from '../api/conquistasUsuario';
import { getHojeLocalRemember } from '../utils/date';
import { getMensagemErroRemember } from '../utils/errors';

interface DiarioModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    usuarioId: number;
    diarioParaEditar?: Diario | null;
    onConquistaGanhas?: (conquistas: ConquistaDetalhes[]) => void;
}

export default function DiarioModal({
    open,
    onClose,
    onSuccess,
    usuarioId,
    diarioParaEditar,
    onConquistaGanhas,
}: DiarioModalProps) {
    const { enqueueSnackbar } = useSnackbar();

    const [titulo, setTitulo] = useState('');
    const [conteudo, setConteudo] = useState('');
    const [loading, setLoading] = useState(false);
    const [erroFormulario, setErroFormulario] = useState('');

    useEffect(() => {
        if (!open) {
            return;
        }

        setErroFormulario('');

        if (diarioParaEditar) {
            setTitulo(diarioParaEditar.titulo);
            setConteudo(diarioParaEditar.conteudo);
            return;
        }

        setTitulo('');
        setConteudo('');
    }, [open, diarioParaEditar]);

    const handleSalvar = async () => {
        setErroFormulario('');

        if (!titulo.trim() || !conteudo.trim()) {
            const mensagem = 'Titulo e historia sao obrigatorios para salvar o diario.';
            setErroFormulario(mensagem);
            enqueueSnackbar(mensagem, { variant: 'warning' });
            return;
        }

        if (titulo.trim().length > 255) {
            const mensagem = 'O titulo do diario deve ter no maximo 255 caracteres.';
            setErroFormulario(mensagem);
            enqueueSnackbar(mensagem, { variant: 'warning' });
            return;
        }

        setLoading(true);
        try {
            let response: Diario;

            if (diarioParaEditar) {
                const payload: UpdateDiarioPayload = {
                    titulo,
                    conteudo,
                };
                response = await diariosApi.atualizar(diarioParaEditar.identificadorDiario, payload);
                enqueueSnackbar('Diario atualizado com sucesso!', { variant: 'success' });
            } else {
                const payload: CreateDiarioPayload = {
                    identificadorUsuario: usuarioId,
                    titulo,
                    conteudo,
                    dataEscrita: getHojeLocalRemember(),
                };
                response = await diariosApi.criar(payload);
                enqueueSnackbar('Diario criado com sucesso!', { variant: 'success' });
            }

            if (response.conquistasDesbloqueadas?.length && onConquistaGanhas) {
                onConquistaGanhas(response.conquistasDesbloqueadas);
            }

            if (!diarioParaEditar) {
                setTitulo('');
                setConteudo('');
            }

            onSuccess();
            onClose();
        } catch (error) {
            const mensagem = getMensagemErroRemember(error, 'Erro ao salvar diario.');
            setErroFormulario(mensagem);
            enqueueSnackbar(mensagem, { variant: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const cadernoStyle: React.CSSProperties = {
        background: '#f9f7f3',
        backgroundImage: 'repeating-linear-gradient(to bottom, transparent, transparent 39px, #ccc 40px)',
        lineHeight: '40px',
        border: '1px solid #ccc',
        outline: 'none',
        color: '#000',
        fontSize: '18px',
        fontFamily: 'inherit',
        resize: 'none',
        boxSizing: 'border-box',
    };

    return (
        <Dialog
            open={open}
            onClose={loading ? undefined : onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{ sx: { borderRadius: 4, p: 1 } }}
        >
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h5" color="primary">
                    {diarioParaEditar ? 'Editar Diario' : 'Novo Diario'}
                </Typography>
                <IconButton onClick={onClose} disabled={loading} size="large">
                    <CloseIcon fontSize="large" />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ mt: 1 }}>
                {erroFormulario && (
                    <Alert severity="error" onClose={() => setErroFormulario('')} sx={{ mb: 3 }}>
                        {erroFormulario}
                    </Alert>
                )}

                <Box sx={{ position: 'relative', mb: 3, width: '100%' }}>
                    <input
                        type="text"
                        value={titulo}
                        onChange={(event) => setTitulo(event.target.value)}
                        placeholder="Titulo do dia..."
                        disabled={loading}
                        style={{
                            ...cadernoStyle,
                            width: '100%',
                            height: '64px',
                            padding: '10px 16px',
                            borderRadius: '12px',
                        }}
                    />
                </Box>

                <Box sx={{ position: 'relative', mb: 2, width: '100%' }}>
                    <textarea
                        value={conteudo}
                        onChange={(event) => setConteudo(event.target.value)}
                        disabled={loading}
                        placeholder="Escreva sobre o seu dia aqui..."
                        style={{
                            ...cadernoStyle,
                            width: '100%',
                            height: '400px',
                            padding: '10px 16px',
                            borderRadius: '16px',
                        }}
                    />
                </Box>

                <Stack direction="row" justifyContent="center" pb={2}>
                    <Button
                        onClick={handleSalvar}
                        variant="contained"
                        color="success"
                        size="large"
                        startIcon={<SaveIcon />}
                        disabled={loading}
                        sx={{
                            px: 6,
                            py: 1.5,
                            borderRadius: 3,
                            fontSize: '1.2rem',
                            boxShadow: '0 4px 10px rgba(46, 125, 50, 0.4)',
                        }}
                    >
                        {loading ? 'Salvando...' : 'Salvar'}
                    </Button>
                </Stack>
            </DialogContent>
        </Dialog>
    );
}
