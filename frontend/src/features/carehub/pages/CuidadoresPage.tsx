import { useMemo, useState, useEffect } from 'react';
import { isCuidador, checkAndCacheUserType } from '../components/auth';
import { useNavigate } from 'react-router-dom';
import '../components/carehub-accessibility.css';
import {
  Box, Button, Card, CardContent, Chip, FormControlLabel, Pagination, Stack,
  Switch, Typography, CircularProgress, Rating, Avatar, Divider,
  Paper, TextField,
  Alert
} from '@mui/material';
import { cuidadoresApi } from '../api';
import type { CuidadorResponseDTO, Page } from '../types';
import { useQuery } from '@tanstack/react-query';
import { LocationOn, PersonSearch, Search, Clear, Schedule, Visibility } from '@mui/icons-material';
import { PageHeader } from '../components/PageHeader';

export default function CuidadoresPage() {
  const [nome, setNome] = useState('');
  const [cidade, setCidade] = useState('');
  const [disp, setDisp] = useState<boolean | undefined>(true); // Por padrão, mostrar apenas disponíveis
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  // Verificar tipo de usuário e redirecionar se necessário
  useEffect(() => {
    const inicializar = async () => {
      await checkAndCacheUserType();

      // Se for cuidador, redireciona para a lista de prontuários dos seus clientes
      if (isCuidador()) {
        navigate('/carehub/cuidador/prontuarios', { replace: true });
        return;
      }
    };
    inicializar();
  }, [navigate]);

  const params = useMemo(() => ({
    nome: nome.trim() || undefined,
    localizacao: cidade.trim() || undefined,
    disponibilidade: disp,
    page: page - 1,
    size: 6,
    sortBy: 'avaliacaoMedia',
    direction: 'DESC' as const,
  }), [nome, cidade, disp, page]);

  const { data, isFetching, isError, refetch } = useQuery<Page<CuidadorResponseDTO>>({
    queryKey: ['cuidadores', params],
    queryFn: () => cuidadoresApi.buscar(params),
    staleTime: 10000,
    retry: 2,
  });

  // Limpar todos os filtros
  const limparFiltros = () => {
    setNome('');
    setCidade('');
    setDisp(true);
    setPage(1);
  };

  // Verificar se há filtros ativos
  const hasFilters = nome.trim() !== '' || cidade.trim() !== '' || disp === undefined;

  return (
    <Stack gap={3} sx={{ p: 2 }}>
      {/* Header com botão VOLTAR */}
      <PageHeader
        title="Cuidadores Disponíveis"
        subtitle="Encontre o profissional ideal para suas necessidades"
        backTo="/carehub"
      />

      {/* Dica para o usuário */}
      <Alert severity="info" sx={{ borderRadius: 2 }}>
        <Typography variant="body2">
          💡 <strong>Dica:</strong> Os cuidadores são ordenados pela melhor avaliação.
          Use o filtro abaixo para ver apenas os disponíveis agora.
        </Typography>
      </Alert>

      {/* Filtro - Nome, Cidade e Disponibilidade */}
      <Card variant="outlined" sx={{ bgcolor: 'background.default' }}>
        <CardContent sx={{ p: 2 }}>
          <Stack spacing={2}>
            {/* Linha 1: Campos de busca */}
            <Stack direction={{ xs: 'column', sm: 'row' }} gap={2} alignItems={{ sm: 'center' }}>
              {/* Campo de Nome */}
              <TextField
                label="Nome do Cuidador"
                placeholder="Ex: João, Maria..."
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                size="small"
                sx={{
                  flex: 1,
                  minWidth: { xs: '100%', sm: 180 },
                  '& .MuiInputBase-root': { borderRadius: 2 }
                }}
                slotProps={{
                  input: {
                    startAdornment: <PersonSearch sx={{ mr: 1, color: 'text.secondary' }} fontSize="small" />
                  }
                }}
              />

              {/* Campo de Cidade */}
              <TextField
                label="Cidade"
                placeholder="Ex: Goiânia"
                value={cidade}
                onChange={(e) => setCidade(e.target.value)}
                size="small"
                sx={{
                  flex: 1,
                  minWidth: { xs: '100%', sm: 180 },
                  '& .MuiInputBase-root': { borderRadius: 2 }
                }}
                slotProps={{
                  input: {
                    startAdornment: <LocationOn sx={{ mr: 1, color: 'text.secondary' }} fontSize="small" />
                  }
                }}
              />

              {/* Switch Disponibilidade */}
              <Box
                sx={{
                  px: 2,
                  py: 1,
                  bgcolor: disp ? 'success.50' : 'grey.100',
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: disp ? 'success.main' : 'grey.300',
                  display: 'flex',
                  alignItems: 'center',
                  flexShrink: 0
                }}
              >
                <FormControlLabel
                  control={
                    <Switch
                      checked={!!disp}
                      onChange={(e) => setDisp(e.target.checked ? true : undefined)}
                      color="success"
                      size="small"
                    />
                  }
                  label={
                    <Typography variant="body2" fontWeight={disp ? 'bold' : 'normal'}>
                      Disponíveis agora
                    </Typography>
                  }
                  sx={{ m: 0 }}
                />
              </Box>
            </Stack>

            {/* Linha 2: Botões de Ação */}
            <Stack direction="row" gap={1}>
              <Button
                variant="contained"
                size="medium"
                onClick={() => { setPage(1); refetch(); }}
                disabled={isFetching}
                startIcon={<Search />}
                sx={{
                  flex: 1,
                  py: 1,
                  borderRadius: 2
                }}
              >
                {isFetching ? 'Buscando...' : 'Buscar'}
              </Button>

              {hasFilters && (
                <Button
                  variant="outlined"
                  size="medium"
                  onClick={limparFiltros}
                  startIcon={<Clear />}
                  sx={{ borderRadius: 2 }}
                >
                  Limpar
                </Button>
              )}
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {/* Resumo dos filtros ativos */}
      {(disp || cidade.trim() || nome.trim()) && (
        <Paper variant="outlined" sx={{ p: 1.5, bgcolor: 'grey.50' }}>
          <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
            <Typography variant="body2" color="text.secondary" fontWeight="medium">
              Filtros:
            </Typography>
            {nome.trim() && (
              <Chip
                icon={<PersonSearch fontSize="small" />}
                label={nome}
                size="small"
                color="secondary"
                variant="outlined"
                onDelete={() => setNome('')}
              />
            )}
            {cidade.trim() && (
              <Chip
                icon={<LocationOn fontSize="small" />}
                label={cidade}
                size="small"
                color="primary"
                variant="outlined"
                onDelete={() => setCidade('')}
              />
            )}
            {disp && (
              <Chip
                label="Disponíveis"
                size="small"
                color="success"
                variant="outlined"
                onDelete={() => setDisp(undefined)}
              />
            )}
          </Stack>
        </Paper>
      )}

      {/* Loading */}
      {isFetching && (
        <Stack alignItems="center" py={6}>
          <CircularProgress size={60} />
          <Typography variant="h6" color="text.secondary" mt={3}>
            🔍 Buscando cuidadores...
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={1}>
            Aguarde um momento
          </Typography>
        </Stack>
      )}

      {/* Error */}
      {isError && (
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          <Typography variant="body1">
            ❌ Erro ao carregar cuidadores. Verifique sua conexão com a internet e tente novamente.
          </Typography>
          <Button variant="outlined" color="error" sx={{ mt: 2 }} onClick={() => refetch()}>
            Tentar Novamente
          </Button>
        </Alert>
      )}

      {/* Empty */}
      {!isFetching && data && (data.content?.length ?? 0) === 0 && (
        <Card variant="outlined" sx={{ py: 8, textAlign: 'center' }}>
          <PersonSearch sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" mb={2}>
            Nenhum cuidador encontrado
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={3}>
            Tente mudar os filtros de busca ou limpar a pesquisa
          </Typography>
          <Button variant="contained" onClick={limparFiltros} startIcon={<Clear />}>
            Limpar Filtros e Ver Todos
          </Button>
        </Card>
      )}

      {/* Contador de Resultados */}
      {!isFetching && data && (data.content?.length ?? 0) > 0 && (
        <Paper variant="outlined" sx={{ p: 2, bgcolor: 'success.50', borderColor: 'success.main' }}>
          <Typography variant="h6" color="success.dark" textAlign="center">
            ✅ Encontramos {data.totalElements} cuidador{data.totalElements !== 1 ? 'es' : ''} para você!
          </Typography>
        </Paper>
      )}

      {/* Lista */}
      {!isFetching && data && (data.content?.length ?? 0) > 0 && (
        <>
          <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr', lg: '1fr 1fr 1fr' }} gap={3}>
            {data.content.map((c) => (
              <Card
                key={c.id}
                elevation={0}
                sx={{
                  position: 'relative',
                  overflow: 'visible',
                  borderRadius: '20px',
                  border: '1px solid',
                  borderColor: 'rgba(0, 0, 0, 0.08)',
                  bgcolor: 'background.paper',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)',
                  '&:hover': {
                    transform: 'translateY(-6px)',
                    borderColor: 'primary.main',
                    boxShadow: '0 20px 40px rgba(99, 102, 241, 0.08)'
                  }
                }}
              >
                {/* Badge de disponibilidade */}
                {c.disponibilidade && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 16,
                      right: 16,
                      bgcolor: 'success.50',
                      color: 'success.dark',
                      border: '1px solid',
                      borderColor: 'success.200',
                      px: 1.5,
                      py: 0.5,
                      borderRadius: '20px',
                      fontSize: '0.75rem',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.8,
                      zIndex: 1,
                      boxShadow: '0 2px 8px rgba(46, 125, 50, 0.08)'
                    }}
                  >
                    <Box
                      sx={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        bgcolor: 'success.main',
                        animation: 'pulse 1.8s infinite ease-in-out',
                        '@keyframes pulse': {
                          '0%': { transform: 'scale(0.8)', opacity: 0.5 },
                          '50%': { transform: 'scale(1.3)', opacity: 1 },
                          '100%': { transform: 'scale(0.8)', opacity: 0.5 },
                        }
                      }}
                    />
                    Disponível
                  </Box>
                )}

                <CardContent sx={{ p: 3 }}>
                  {/* Header com Avatar e Nome */}
                  <Stack direction="row" spacing={2} alignItems="center" mb={2.5}>
                    <Avatar
                      sx={{
                        width: 56,
                        height: 56,
                        background: '#1565C0',
                        color: 'white',
                        fontSize: '1.4rem',
                        fontWeight: 700,
                        boxShadow: '0 4px 10px rgba(99, 102, 241, 0.15)',
                        border: '2px solid white',
                      }}
                    >
                      {c.nome?.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box flex={1}>
                      <Typography
                        variant="h6"
                        fontWeight={750}
                        mb={0.5}
                        sx={{
                          color: '#1e293b',
                          fontSize: '1.1rem',
                          lineHeight: 1.2,
                          letterSpacing: '-0.01em',
                          marginTop: '25px'
                        }}
                      >
                        {c.nome}
                      </Typography>
                      <Stack direction="row" alignItems="center" gap={0.5} sx={{ color: '#64748b' }}>
                        <LocationOn fontSize="small" sx={{ color: 'primary.main', fontSize: '1rem', opacity: 0.8 }} />
                        <Typography variant="caption" fontWeight={600}>
                          {c.cidade} - {c.estado}
                        </Typography>
                      </Stack>
                    </Box>
                  </Stack>

                  <Divider sx={{ mb: 2, borderColor: 'rgba(0, 0, 0, 0.05)' }} />

                  {/* Avaliação em destaque */}
                  <Paper
                    elevation={0}
                    sx={{
                      bgcolor: '#f8fafc',
                      p: 1.5,
                      mb: 2.5,
                      borderRadius: '12px',
                      border: '1px solid',
                      borderColor: '#e2e8f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <Stack direction="row" alignItems="center" gap={1}>
                      <Rating
                        value={c.avaliacaoMedia || 0}
                        readOnly
                        precision={0.1}
                        size="small"
                        sx={{
                          color: '#f59e0b',
                          '& .MuiRating-iconFilled': {
                            color: '#f59e0b'
                          }
                        }}
                      />
                      <Typography variant="body2" fontWeight="700" sx={{ color: '#1e293b' }}>
                        {c.avaliacaoMedia?.toFixed(1) || '0.0'}
                      </Typography>
                    </Stack>
                    <Typography
                      variant="caption"
                      fontWeight={700}
                      sx={{
                        color: 'primary.main',
                        bgcolor: 'primary.50',
                        px: 1.2,
                        py: 0.5,
                        borderRadius: '20px'
                      }}
                    >
                      {c.totalAvaliacoes || 0} {c.totalAvaliacoes === 1 ? 'avaliação' : 'avaliações'}
                    </Typography>
                  </Paper>

                  {/* Experiência */}
                  <Box mb={2.5}>
                    <Typography
                      variant="caption"
                      sx={{
                        color: '#94a3b8',
                        fontWeight: 800,
                        fontSize: '0.65rem',
                        letterSpacing: '0.05em',
                        textTransform: 'uppercase',
                        display: 'block',
                        mb: 0.5
                      }}
                    >
                      Experiência
                    </Typography>
                    <Typography variant="body2" fontWeight={600} color="#334155" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      💼 {c.experiencia || 'Não informada'}
                    </Typography>
                  </Box>

                  {/* Especialidades */}
                  {c.especialidades && c.especialidades.length > 0 && (
                    <Box mb={3.5}>
                      <Typography
                        variant="caption"
                        sx={{
                          color: '#94a3b8',
                          fontWeight: 800,
                          fontSize: '0.65rem',
                          letterSpacing: '0.05em',
                          textTransform: 'uppercase',
                          display: 'block',
                          mb: 1
                        }}
                      >
                        Especialidades
                      </Typography>
                      <Stack direction="row" gap={0.5} flexWrap="wrap">
                        {c.especialidades.map((e, i) => (
                          <Chip
                            key={i}
                            label={e}
                            size="small"
                            sx={{
                              fontWeight: 600,
                              fontSize: '0.72rem',
                              bgcolor: '#f1f5f9',
                              color: '#475569',
                              border: 'none',
                              borderRadius: '8px',
                              '&:hover': {
                                bgcolor: '#e2e8f0'
                              }
                            }}
                          />
                        ))}
                      </Stack>
                    </Box>
                  )}

                  {/* Botões de ação */}
                  <Stack gap={1.5}>
                    {/* Botão Principal - Agendar */}
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={() => navigate(`/carehub/agendamentos?cuidadorId=${c.id}`)}
                      startIcon={<Schedule fontSize="small" />}
                      sx={{
                        borderRadius: '12px',
                        textTransform: 'none',
                        fontWeight: 700,
                        py: 1.2,
                        fontSize: '0.95rem',
                        background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                        boxShadow: '0 4px 12px rgba(99, 102, 241, 0.15)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
                          transform: 'translateY(-1px)',
                          boxShadow: '0 6px 20px rgba(99, 102, 241, 0.25)'
                        },
                        transition: 'all 0.2s'
                      }}
                    >
                      Agendar Atendimento
                    </Button>

                    {/* Link para ver avaliações */}
                    <Button
                      component="a"
                      href={`/carehub/avaliacoes/${c.id}`}
                      variant="text"
                      fullWidth
                      startIcon={<Visibility fontSize="small" />}
                      sx={{
                        borderRadius: '12px',
                        textTransform: 'none',
                        fontWeight: 650,
                        py: 1,
                        fontSize: '0.88rem',
                        color: '#64748b',
                        '&:hover': {
                          bgcolor: '#f1f5f9',
                          color: '#1e293b'
                        },
                        transition: 'all 0.2s'
                      }}
                    >
                      Ver avaliações ({c.totalAvaliacoes || 0})
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Box>

          {/* Paginação Melhorada */}
          <Stack alignItems="center" mt={4} gap={2}>
            <Typography variant="body1" color="text.secondary">
              Página {page} de {data.totalPages}
            </Typography>
            <Pagination
              page={page}
              onChange={(_, p) => setPage(p)}
              count={data.totalPages}
              color="primary"
              size="large"
              showFirstButton
              showLastButton
              sx={{
                '& .MuiPaginationItem-root': {
                  fontSize: '1.1rem',
                  minWidth: 40,
                  height: 40
                }
              }}
            />
            <Typography variant="body2" color="text.secondary">
              Mostrando {(page - 1) * 6 + 1} - {Math.min(page * 6, data.totalElements)} de {data.totalElements} cuidador{data.totalElements !== 1 ? 'es' : ''}
            </Typography>
          </Stack>
        </>
      )}
    </Stack>
  );
}
