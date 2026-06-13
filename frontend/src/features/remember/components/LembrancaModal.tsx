import React, { useEffect, useState } from 'react';
import {
    Alert,
    Box,
    Button,
    Chip,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    Stack,
    Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SaveIcon from '@mui/icons-material/Save';
import { useSnackbar } from 'notistack';
import { lembrancasApi, type CreateLembrancaPayload, type Lembranca, type UpdateLembrancaPayload } from '../api/lembrancas';
import type { ConquistaDetalhes } from '../api/conquistasUsuario';
import { formatarDataInputRemember } from '../utils/date';
import { getMensagemErroRemember } from '../utils/errors';

const toBase64 = (file: File) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
});

const getHojeLocal = () => {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const dia = String(hoje.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
};

interface LembrancaModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    usuarioId: number;
    lembrancaParaEditar?: Lembranca | null;
    onConquistaGanhas?: (conquistas: ConquistaDetalhes[]) => void;
}

export default function LembrancaModal({
    open,
    onClose,
    onSuccess,
    usuarioId,
    lembrancaParaEditar,
    onConquistaGanhas,
}: LembrancaModalProps) {
    const { enqueueSnackbar } = useSnackbar();

    const [titulo, setTitulo] = useState('');
    const [dataAcontecimento, setDataAcontecimento] = useState('');
    const [local, setLocal] = useState('');
    const [historia, setHistoria] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [nomePessoaTemp, setNomePessoaTemp] = useState('');
    const [listaPessoas, setListaPessoas] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [erroFormulario, setErroFormulario] = useState('');

    useEffect(() => {
        if (!open) {
            return;
        }

        setErroFormulario('');

        if (lembrancaParaEditar) {
            setTitulo(lembrancaParaEditar.titulo);
            setDataAcontecimento(formatarDataInputRemember(lembrancaParaEditar.dataAcontecimento));
            setLocal(lembrancaParaEditar.local || '');
            setHistoria(lembrancaParaEditar.historia);
            setListaPessoas(
                lembrancaParaEditar.pessoasPresentes
                    ? lembrancaParaEditar.pessoasPresentes.split(',').map((pessoa) => pessoa.trim()).filter(Boolean)
                    : []
            );
            setPreviewUrl(lembrancaParaEditar.imagem || '');
            setSelectedFile(null);
            setNomePessoaTemp('');
            return;
        }

        setTitulo('');
        setDataAcontecimento(getHojeLocal());
        setLocal('');
        setHistoria('');
        setListaPessoas([]);
        setPreviewUrl('');
        setSelectedFile(null);
        setNomePessoaTemp('');
    }, [open, lembrancaParaEditar]);

    const handleAddPessoa = () => {
        const pessoa = nomePessoaTemp.trim();

        if (!pessoa) {
            return;
        }

        setListaPessoas((pessoas) => [...pessoas, pessoa]);
        setNomePessoaTemp('');
    };

    const handleRemovePessoa = (index: number) => {
        setListaPessoas((pessoas) => pessoas.filter((_, pessoaIndex) => pessoaIndex !== index));
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    };

    const handleSalvar = async () => {
        setErroFormulario('');

        if (!titulo.trim() || !historia.trim() || !dataAcontecimento) {
            const mensagem = 'Titulo, data e historia sao obrigatorios.';
            setErroFormulario(mensagem);
            enqueueSnackbar(mensagem, { variant: 'warning' });
            return;
        }

        if (dataAcontecimento > getHojeLocal()) {
            const mensagem = 'A data do acontecimento nao pode ser no futuro.';
            setErroFormulario(mensagem);
            enqueueSnackbar(mensagem, { variant: 'error' });
            return;
        }

        setLoading(true);
        try {
            const base64Image = selectedFile ? await toBase64(selectedFile) : undefined;
            const pessoasPresentes = listaPessoas.join(', ');
            let response: Lembranca;

            if (lembrancaParaEditar) {
                const payload: UpdateLembrancaPayload = {
                    titulo,
                    dataAcontecimento,
                    local,
                    historia,
                    pessoasPresentes,
                    imagem: base64Image,
                };
                response = await lembrancasApi.atualizar(lembrancaParaEditar.identificadorLembranca, payload);
                enqueueSnackbar('Lembranca atualizada!', { variant: 'success' });
            } else {
                const payload: CreateLembrancaPayload = {
                    identificadorUsuario: usuarioId,
                    titulo,
                    dataAcontecimento,
                    local,
                    historia,
                    pessoasPresentes,
                    imagem: base64Image,
                };
                response = await lembrancasApi.criar(payload);
                enqueueSnackbar('Lembranca criada!', { variant: 'success' });
            }

            if (response.conquistasDesbloqueadas?.length && onConquistaGanhas) {
                onConquistaGanhas(response.conquistasDesbloqueadas);
            }

            onSuccess();
            onClose();
        } catch (error) {
            const mensagem = getMensagemErroRemember(error, 'Erro ao salvar lembranca.');
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

    const inputComLinhaStyle: React.CSSProperties = {
        ...cadernoStyle,
        height: '64px',
        padding: '10px 16px',
        borderRadius: '12px',
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
                    {lembrancaParaEditar ? 'Editar Lembranca' : 'Nova Lembranca'}
                </Typography>
                <IconButton onClick={onClose} disabled={loading} size="large">
                    <CloseIcon fontSize="large" />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ mt: 1 }}>
                <Stack spacing={3}>
                    {erroFormulario && (
                        <Alert severity="error" onClose={() => setErroFormulario('')}>
                            {erroFormulario}
                        </Alert>
                    )}

                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 2 }}>
                        <input
                            accept="image/*"
                            style={{ display: 'none' }}
                            id="upload-lembranca-file"
                            type="file"
                            onChange={handleFileChange}
                            disabled={loading}
                        />
                        <label htmlFor="upload-lembranca-file">
                            <Box
                                sx={{
                                    width: 500,
                                    height: 450,
                                    bgcolor: '#fafafa',
                                    borderRadius: 3,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    overflow: 'hidden',
                                    border: '2px dashed #ccc',
                                    cursor: 'pointer',
                                    transition: 'border 0.3s',
                                    position: 'relative',
                                    '&:hover': { borderColor: '#1976d2', bgcolor: '#f0f7ff' },
                                }}
                            >
                                {previewUrl ? (
                                    <img
                                        src={previewUrl}
                                        alt="Preview"
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                ) : (
                                    <Stack alignItems="center" spacing={1} color="text.secondary">
                                        <CloudUploadIcon sx={{ fontSize: 40 }} />
                                        <Typography variant="body2">Adicionar foto</Typography>
                                    </Stack>
                                )}
                            </Box>
                        </label>
                    </Box>

                    <Box sx={{ width: '100%' }}>
                        <input
                            type="text"
                            value={titulo}
                            onChange={(event) => setTitulo(event.target.value)}
                            placeholder="Titulo da lembranca..."
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

                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, ml: 1 }}>
                                Data do Acontecimento
                            </Typography>
                            <input
                                type="date"
                                value={dataAcontecimento}
                                onChange={(event) => setDataAcontecimento(event.target.value)}
                                max={getHojeLocal()}
                                disabled={loading}
                                style={{ ...inputComLinhaStyle, width: '100%' }}
                            />
                        </Box>

                        <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, ml: 1 }}>
                                Local (Opcional)
                            </Typography>
                            <input
                                type="text"
                                value={local}
                                onChange={(event) => setLocal(event.target.value)}
                                placeholder="Ex: Casa da Vovo"
                                disabled={loading}
                                style={{ ...inputComLinhaStyle, width: '100%' }}
                            />
                        </Box>
                    </Stack>

                    <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, ml: 1 }}>
                            Participantes
                        </Typography>
                        <Stack direction="row" spacing={1} mb={2}>
                            <Box sx={{ flex: 1 }}>
                                <input
                                    type="text"
                                    value={nomePessoaTemp}
                                    onChange={(event) => setNomePessoaTemp(event.target.value)}
                                    placeholder="Digite o nome..."
                                    disabled={loading}
                                    style={{ ...inputComLinhaStyle, width: '100%' }}
                                    onKeyDown={(event) => {
                                        if (event.key === 'Enter') {
                                            event.preventDefault();
                                            handleAddPessoa();
                                        }
                                    }}
                                />
                            </Box>
                            <Button
                                variant="contained"
                                onClick={handleAddPessoa}
                                disabled={!nomePessoaTemp.trim() || loading}
                                sx={{ borderRadius: 3, minWidth: 60, height: 64 }}
                            >
                                <AddIcon fontSize="large" />
                            </Button>
                        </Stack>

                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {listaPessoas.map((pessoa, index) => (
                                <Chip
                                    key={`${pessoa}-${index}`}
                                    label={pessoa}
                                    onDelete={() => handleRemovePessoa(index)}
                                    disabled={loading}
                                    sx={{ fontSize: '1rem', py: 2.5, px: 1, borderRadius: 2, bgcolor: '#f0f0f0' }}
                                />
                            ))}
                        </Box>
                    </Box>

                    <Box sx={{ width: '100%' }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, ml: 1 }}>
                            Historia da Lembranca
                        </Typography>
                        <textarea
                            value={historia}
                            onChange={(event) => setHistoria(event.target.value)}
                            disabled={loading}
                            placeholder="Conte como foi esse momento especial..."
                            style={{
                                ...cadernoStyle,
                                width: '100%',
                                height: '350px',
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
                </Stack>
            </DialogContent>
        </Dialog>
    );
}
