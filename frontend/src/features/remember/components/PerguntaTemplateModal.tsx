import { useEffect, useState } from 'react';
import {
    Alert,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    MenuItem,
    Stack,
    Switch,
    TextField,
    Typography
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import type { CreatePerguntaTemplatePayload } from '../api/perguntas';

interface PerguntaTemplateModalProps {
    open: boolean;
    loading?: boolean;
    onClose: () => void;
    onSubmit: (payload: CreatePerguntaTemplatePayload) => void;
}

const tiposGatilho = [
    { value: 1, label: 'Palavra-chave' },
    { value: 2, label: 'Generico' },
    { value: 3, label: 'Data especial' },
    { value: 4, label: 'Sentimento' },
];

const camposAlvo = [
    { value: '', label: 'Nenhum' },
    { value: 'titulo', label: 'Titulo' },
    { value: 'historia', label: 'Historia da lembranca' },
    { value: 'conteudo', label: 'Conteudo do diario' },
    { value: 'local', label: 'Local' },
    { value: 'pessoasPresentes', label: 'Pessoas presentes' },
];

const camposPlaceholder = [
    { value: '', label: 'Nenhum' },
    { value: 'titulo', label: 'Titulo' },
    { value: 'local', label: 'Local' },
    { value: 'pessoasPresentes', label: 'Pessoas presentes' },
];

export default function PerguntaTemplateModal({
    open,
    loading = false,
    onClose,
    onSubmit
}: PerguntaTemplateModalProps) {
    const [textoTemplate, setTextoTemplate] = useState('');
    const [gatilhoTipo, setGatilhoTipo] = useState(2);
    const [gatilhoValores, setGatilhoValores] = useState('');
    const [campoAlvo, setCampoAlvo] = useState('');
    const [campoPlaceholder, setCampoPlaceholder] = useState('');
    const [ativo, setAtivo] = useState(true);

    const tipoSelecionado = tiposGatilho.find((tipo) => tipo.value === gatilhoTipo);
    const usaGatilhoValores = gatilhoTipo !== 2;
    const usaCampoAlvo = gatilhoTipo === 1 || gatilhoTipo === 4;

    useEffect(() => {
        if (open) {
            setTextoTemplate('');
            setGatilhoTipo(2);
            setGatilhoValores('');
            setCampoAlvo('');
            setCampoPlaceholder('');
            setAtivo(true);
        }
    }, [open]);

    const handleSubmit = () => {
        onSubmit({
            textoTemplate: textoTemplate.trim(),
            gatilhoTipo,
            gatilhoValores: gatilhoValores.trim() || undefined,
            campoAlvo: campoAlvo.trim() || undefined,
            campoPlaceholder: campoPlaceholder.trim() || undefined,
            ativo,
        });
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>
                <Stack direction="row" spacing={1.5} alignItems="center">
                    <AutoAwesomeIcon sx={{ color: '#7b1fa2' }} />
                    <Typography variant="h6" fontWeight={700}>
                        Novo modelo de pergunta
                    </Typography>
                </Stack>
            </DialogTitle>

            <DialogContent>
                <Stack spacing={2.5} sx={{ pt: 1 }}>
                    <Alert severity="info" variant="outlined">
                        O modelo define o texto base usado para gerar perguntas cognitivas. Use chaves para preencher dados da memoria, como {'{titulo}'} ou {'{local}'}.
                    </Alert>

                    <TextField
                        label="Texto do template"
                        value={textoTemplate}
                        onChange={(event) => setTextoTemplate(event.target.value)}
                        fullWidth
                        multiline
                        minRows={3}
                        autoFocus
                        placeholder="Ex.: O que voce lembra sobre {titulo}?"
                        helperText="Escreva a pergunta padrao. Se quiser personalizar, use o mesmo nome escolhido no campo Placeholder."
                    />

                    <TextField
                        select
                        label="Tipo de gatilho"
                        value={gatilhoTipo}
                        onChange={(event) => setGatilhoTipo(Number(event.target.value))}
                        fullWidth
                        helperText={tipoSelecionado ? getAjudaTipo(tipoSelecionado.value) : undefined}
                    >
                        {tiposGatilho.map((tipo) => (
                            <MenuItem key={tipo.value} value={tipo.value}>
                                {tipo.label}
                            </MenuItem>
                        ))}
                    </TextField>

                    {usaGatilhoValores && (
                        <TextField
                            label={gatilhoTipo === 3 ? 'Datas especiais' : 'Palavras ou sentimentos'}
                            value={gatilhoValores}
                            onChange={(event) => setGatilhoValores(event.target.value)}
                            fullWidth
                            placeholder={gatilhoTipo === 3 ? 'NATAL, ANO_NOVO' : 'familia, viagem, alegria'}
                            helperText="Separe multiplos valores por virgula."
                        />
                    )}

                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                        <TextField
                            select
                            label="Campo alvo"
                            value={campoAlvo}
                            onChange={(event) => setCampoAlvo(event.target.value)}
                            fullWidth
                            disabled={!usaCampoAlvo}
                            helperText={usaCampoAlvo ? 'Onde o sistema vai procurar os valores do gatilho.' : 'Nao e necessario para este tipo.'}
                        >
                            {camposAlvo.map((campo) => (
                                <MenuItem key={campo.value} value={campo.value}>
                                    {campo.label}
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            select
                            label="Placeholder"
                            value={campoPlaceholder}
                            onChange={(event) => setCampoPlaceholder(event.target.value)}
                            fullWidth
                            helperText="Campo que substitui a chave no texto do template."
                        >
                            {camposPlaceholder.map((campo) => (
                                <MenuItem key={campo.value} value={campo.value}>
                                    {campo.label}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Stack>

                    <Stack
                        spacing={0.5}
                        sx={{
                            p: 2,
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 2,
                            bgcolor: 'grey.50'
                        }}
                    >
                        <Typography variant="caption" color="text.secondary" fontWeight={700}>
                            Previa
                        </Typography>
                        <Typography variant="body2" color="text.primary">
                            {textoTemplate.trim() || 'A pergunta aparecera aqui conforme voce preencher o texto.'}
                        </Typography>
                    </Stack>

                    <FormControlLabel
                        control={
                            <Switch
                                checked={ativo}
                                onChange={(event) => setAtivo(event.target.checked)}
                            />
                        }
                        label="Template ativo para gerar perguntas"
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
                    disabled={loading || !textoTemplate.trim()}
                    sx={{ bgcolor: '#7b1fa2', '&:hover': { bgcolor: '#6a1b9a' } }}
                >
                    Salvar template
                </Button>
            </DialogActions>
        </Dialog>
    );
}

function getAjudaTipo(tipo: number) {
    switch (tipo) {
        case 1:
            return 'Gera perguntas quando encontrar palavras no campo alvo escolhido.';
        case 2:
            return 'Pode gerar pergunta para qualquer diario ou lembranca.';
        case 3:
            return 'Gera pergunta quando a data da memoria combina com uma data especial.';
        case 4:
            return 'Gera pergunta quando encontrar sentimentos no campo alvo escolhido.';
        default:
            return undefined;
    }
}
