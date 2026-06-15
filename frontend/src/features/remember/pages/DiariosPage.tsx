import { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    CircularProgress,
    Alert,
} from '@mui/material';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { useSnackbar } from 'notistack';
import { diariosApi, type Diario } from '../api/diarios';
import DiarioCard from '../components/DiarioCard';
import DiarioModal from '../components/DiarioModal';
import { getMensagemErroRemember } from '../utils/errors';

interface DiariosPageProps {
    usuarioId: number;
}

export default function DiariosPage({ usuarioId }: DiariosPageProps) {
    const { enqueueSnackbar } = useSnackbar();

    const [diarios, setDiarios] = useState<Diario[]>([]);
    const [loading, setLoading] = useState(true);
    const [erroPagina, setErroPagina] = useState('');

    // Estados para controlar a EDIÇÃO
    const [modalOpen, setModalOpen] = useState(false);
    const [diarioEditando, setDiarioEditando] = useState<Diario | null>(null);

    useEffect(() => {
        if (usuarioId) {
            carregarDiarios();
        }
    }, [usuarioId]);

    async function carregarDiarios() {
        setLoading(true);
        setErroPagina('');
        try {
            const dados = await diariosApi.listarPorUsuario(usuarioId);
            setDiarios(dados);
        } catch (error) {
            const mensagem = getMensagemErroRemember(error, 'Erro ao carregar diarios.');
            setErroPagina(mensagem);
            enqueueSnackbar(mensagem, { variant: 'error' });
        } finally {
            setLoading(false);
        }
    }

    // --- ABRIR EDIÇÃO ---
    const handleEditDiario = (id: number) => {
        const diarioEncontrado = diarios.find(d => d.identificadorDiario === id);
        if (diarioEncontrado) {
            setDiarioEditando(diarioEncontrado);
            setModalOpen(true);
        }
    };

    // --- EXCLUIR DIÁRIO ---
    const handleDeleteDiario = async (id: number) => {
        setErroPagina('');
        try {
            await diariosApi.remover(id);
            enqueueSnackbar('Diário excluído com sucesso!', { variant: 'success' });
            // Remove da lista localmente para não precisar recarregar tudo do servidor
            setDiarios((prev) => prev.filter(d => d.identificadorDiario !== id));
        } catch (error) {
            const mensagem = getMensagemErroRemember(error, 'Erro ao excluir diario.');
            setErroPagina(mensagem);
            enqueueSnackbar(mensagem, { variant: 'error' });
        }
    };

    // --- CALLBACKS DO MODAL ---
    const handleCloseModal = () => {
        setModalOpen(false);
        setDiarioEditando(null);
    };

    const handleSuccess = () => {
        carregarDiarios(); // Recarrega a lista após salvar/editar
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" py={10}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <>
            {erroPagina && (
                <Alert severity="error" onClose={() => setErroPagina('')} sx={{ mb: 3 }}>
                    {erroPagina}
                </Alert>
            )}

            {diarios.length === 0 ? (
                <Box textAlign="center" py={8} sx={{ opacity: 0.7 }}>
                    <MenuBookIcon sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                        Nenhum diário encontrado.
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Clique em "Novo Registro" acima para começar a escrever.
                    </Typography>
                </Box>
            ) : (
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: {
                            xs: '1fr',
                            sm: 'repeat(2, minmax(0, 1fr))',
                            md: 'repeat(3, minmax(0, 1fr))',
                        },
                        gap: 3,
                        mt: 2,
                    }}
                >
                    {diarios.map((item) => (
                        <Box key={item.identificadorDiario}>
                            <DiarioCard
                                diario={item}
                                onClick={handleEditDiario}   // Clicar no card edita
                                onDelete={handleDeleteDiario} // Clicar na lixeira deleta
                            />
                        </Box>
                    ))}
                </Box>
            )}

            {/* Modal de Edição (Invisível até clicar no card) */}
            <DiarioModal
                open={modalOpen}
                onClose={handleCloseModal}
                onSuccess={handleSuccess}
                usuarioId={usuarioId}
                diarioParaEditar={diarioEditando}
            />
        </>
    );
}
