package br.pucgo.ads.projetointegrador.carehub.service;

import br.pucgo.ads.projetointegrador.carehub.dto.agendamento.AgendamentoRequestDTO;
import br.pucgo.ads.projetointegrador.carehub.dto.agendamento.AgendamentoResponseDTO;
import br.pucgo.ads.projetointegrador.carehub.dto.agendamento.ContrapropostaRequestDTO;
import br.pucgo.ads.projetointegrador.carehub.entity.Agendamento;
import br.pucgo.ads.projetointegrador.carehub.entity.Cliente;
import br.pucgo.ads.projetointegrador.carehub.entity.Cuidador;
import br.pucgo.ads.projetointegrador.carehub.entity.RegistroAcompanhamento;
import br.pucgo.ads.projetointegrador.carehub.entity.TipoAtendimento;
import br.pucgo.ads.projetointegrador.carehub.exception.OperacaoNaoPermitidaException;
import br.pucgo.ads.projetointegrador.carehub.repository.AgendamentoRepository;
import br.pucgo.ads.projetointegrador.carehub.repository.ClienteRepository;
import br.pucgo.ads.projetointegrador.carehub.repository.CuidadorRepository;
import br.pucgo.ads.projetointegrador.carehub.repository.RegistroAcompanhamentoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

/**
 * Service de Agendamentos do CareHub.
 *
 * <p><strong>MudanÃ§a de arquitetura:</strong> removidos os imports de
 * {@code plataforma.repository.UserRepository} e {@code plataforma.entity.User}.
 * O mÃ©todo {@code getUserIdByUsernameOrEmail} agora consulta o
 * {@link UsuarioRepository} local ({@code care_hub.usuario}).
 */
@Service
@RequiredArgsConstructor
public class AgendamentoService {

    private final AgendamentoRepository agendamentoRepository;
    private final CuidadorRepository cuidadorRepository;
    private final ClienteRepository clienteRepository;
    private final RegistroAcompanhamentoRepository registroRepository;
    private final UsuarioSyncService usuarioSyncService;

    // â”€â”€ Helper: resolve ID do usuÃ¡rio pelo principal (JWT) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    /**
     * Retorna o ID do usuÃ¡rio local ({@code care_hub.usuario.id}) a partir do
     * username ou email extraÃ­do do JWT ({@code principal.getName()}).
     *
     * <p>Todos os services que recebem {@code Principal} usam este mÃ©todo.
     */
    public Long getUserIdByUsernameOrEmail(String usernameOrEmail) {
        return cuidadorRepository.findByUsername(usernameOrEmail)
                .map(Cuidador::getId)
                .orElseGet(() -> cuidadorRepository.findByEmail(usernameOrEmail)
                        .map(Cuidador::getId)
                        .orElseGet(() -> clienteRepository.findByUsername(usernameOrEmail)
                                .map(Cliente::getId)
                                .orElseGet(() -> clienteRepository.findByEmail(usernameOrEmail)
                                        .map(Cliente::getId)
                                        .orElse(null))));
    }

    private Long getUserIdFromPrincipal(java.security.Principal principal) {
        if (principal == null) {
            throw new OperacaoNaoPermitidaException("Operacao nao autorizada: usuario nao autenticado");
        }

        try {
            java.lang.reflect.Method getIdMethod = principal.getClass().getMethod("getId");
            Object platformUserIdObj = getIdMethod.invoke(principal);
            if (platformUserIdObj instanceof Long platformUserId) {
                Long byPlatform = cuidadorRepository.findByPlatformUserId(platformUserId)
                        .map(Cuidador::getId)
                        .orElseGet(() -> clienteRepository.findByPlatformUserId(platformUserId)
                                .map(Cliente::getId)
                                .orElse(null));
                if (byPlatform != null) {
                    return byPlatform;
                }
            }
        } catch (Exception ignored) {
            // fallback por username/email
        }

        try {
            Object userObj = null;
            try {
                java.lang.reflect.Method getUserMethod = principal.getClass().getMethod("getUser");
                userObj = getUserMethod.invoke(principal);
            } catch (Exception ignored) {
            }

            if (userObj != null) {
                Long platformUserId = null;
                try {
                    java.lang.reflect.Method getIdMethod = principal.getClass().getMethod("getId");
                    Object idObj = getIdMethod.invoke(principal);
                    if (idObj instanceof Long idLong) {
                        platformUserId = idLong;
                    }
                } catch (Exception ignored) {
                }

                java.lang.reflect.Method getUsernameMethod = userObj.getClass().getMethod("getUsername");
                java.lang.reflect.Method getEmailMethod = userObj.getClass().getMethod("getEmail");
                java.lang.reflect.Method getNameMethod = userObj.getClass().getMethod("getName");
                java.lang.reflect.Method getRoleMethod = userObj.getClass().getMethod("getRole");

                String username = (String) getUsernameMethod.invoke(userObj);
                String email = (String) getEmailMethod.invoke(userObj);
                String name = (String) getNameMethod.invoke(userObj);
                Object roleObj = getRoleMethod.invoke(userObj);
                java.lang.reflect.Method getRoleNameMethod = roleObj.getClass().getMethod("getName");
                String platformRole = (String) getRoleNameMethod.invoke(roleObj);

                Object synced = usuarioSyncService.sincronizarOuCriar(platformUserId, username, email, name, platformRole);
                if (synced instanceof Cuidador c && c.getId() != null) {
                    return c.getId();
                }
                if (synced instanceof Cliente cli && cli.getId() != null) {
                    return cli.getId();
                }
            }
        } catch (Exception ignored) {
        }

        return getUserIdByUsernameOrEmail(principal.getName());
    }

    private Long getUserIdFromPrincipalOrNull(java.security.Principal principal) {
        try {
            return getUserIdFromPrincipal(principal);
        } catch (RuntimeException ex) {
            return null;
        }
    }

    private boolean principalMatchesCuidador(java.security.Principal principal, Cuidador cuidador) {
        if (principal == null || cuidador == null || principal.getName() == null) return false;
        String actor = principal.getName().trim();
        return actor.equalsIgnoreCase(String.valueOf(cuidador.getUsername()))
                || actor.equalsIgnoreCase(String.valueOf(cuidador.getEmail()));
    }

    private boolean principalMatchesCliente(java.security.Principal principal, Cliente cliente) {
        if (principal == null || cliente == null || principal.getName() == null) return false;
        String actor = principal.getName().trim();
        return actor.equalsIgnoreCase(String.valueOf(cliente.getUsername()))
                || actor.equalsIgnoreCase(String.valueOf(cliente.getEmail()));
    }
    // â”€â”€ Criar agendamento â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    @Transactional
    public AgendamentoResponseDTO criarAgendamento(AgendamentoRequestDTO dto) {
        Long cuidadorId = Objects.requireNonNull(dto.getCuidadorId(), "Cuidador ID cannot be null");
        Long clienteId = Objects.requireNonNull(dto.getClienteId(), "Cliente ID cannot be null");

        Cuidador cuidador = cuidadorRepository.findById(cuidadorId)
                .orElseThrow(() -> new RuntimeException("Cuidador nÃ£o encontrado"));
        Cliente cliente = clienteRepository.findById(clienteId)
                .orElseThrow(() -> new RuntimeException("Cliente nÃ£o encontrado"));

        Agendamento agendamento = new Agendamento();
        agendamento.setCuidador(cuidador);
        agendamento.setCliente(cliente);
        agendamento.setDataHoraInicio(dto.getDataHoraInicio());
        agendamento.setDataHoraFim(dto.getDataHoraFim());
        agendamento.setObservacoes(dto.getObservacoes());

        if (dto.getTipoAtendimento() != null && !dto.getTipoAtendimento().isBlank()) {
            try {
                agendamento.setTipoAtendimento(TipoAtendimento.valueOf(dto.getTipoAtendimento().toUpperCase()));
            } catch (IllegalArgumentException e) {
                agendamento.setTipoAtendimento(TipoAtendimento.ACOMPANHAMENTO);
            }
        } else {
            agendamento.setTipoAtendimento(TipoAtendimento.ACOMPANHAMENTO);
        }

        agendamento = agendamentoRepository.save(agendamento);
        return toResponseDTO(agendamento);
    }

    // â”€â”€ Atualizar status â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    @Transactional
    public AgendamentoResponseDTO atualizarStatus(Long id, String status, java.security.Principal principal) {
        Objects.requireNonNull(id, "Agendamento ID cannot be null");
        Agendamento agendamento = agendamentoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Agendamento nÃ£o encontrado"));

        if (principal == null) {
            throw new OperacaoNaoPermitidaException("OperaÃ§Ã£o nÃ£o autorizada: usuÃ¡rio nÃ£o autenticado");
        }

        Long callerId = getUserIdFromPrincipalOrNull(principal);
        boolean isCuidadorCaller = (callerId != null && callerId.equals(agendamento.getCuidador().getId()))
                || principalMatchesCuidador(principal, agendamento.getCuidador());
        boolean isClienteCaller = (callerId != null && callerId.equals(agendamento.getCliente().getId()))
                || principalMatchesCliente(principal, agendamento.getCliente());
        Agendamento.StatusAgendamento novoStatus = Agendamento.StatusAgendamento.valueOf(status);

        switch (novoStatus) {
            case EM_ANDAMENTO:
                if (!isCuidadorCaller) {
                    throw new OperacaoNaoPermitidaException("Apenas o cuidador pode iniciar o atendimento");
                }
                validarInicioAtendimento(agendamento);
                criarRegistroAutomatico(agendamento);
                agendamento.setStatus(novoStatus);
                break;

            case CONFIRMADO:
                if (agendamento.getStatus() == Agendamento.StatusAgendamento.REAGENDADO) {
                    if (!isClienteCaller) {
                        throw new OperacaoNaoPermitidaException("Apenas o cliente pode aceitar a contraproposta");
                    }
                    if (agendamento.getProposedDataHoraInicio() == null || agendamento.getProposedDataHoraFim() == null) {
                        throw new RuntimeException("NÃ£o existe contraproposta pendente para este agendamento");
                    }
                    agendamento.setDataHoraInicio(agendamento.getProposedDataHoraInicio());
                    agendamento.setDataHoraFim(agendamento.getProposedDataHoraFim());
                    agendamento.setProposedDataHoraInicio(null);
                    agendamento.setProposedDataHoraFim(null);
                    agendamento.setStatus(Agendamento.StatusAgendamento.CONFIRMADO);
                } else {
                    if (!isCuidadorCaller) {
                        throw new OperacaoNaoPermitidaException("Apenas o cuidador pode confirmar a proposta inicial");
                    }
                    agendamento.setStatus(Agendamento.StatusAgendamento.CONFIRMADO);
                }
                break;

            case REAGENDADO:
                throw new OperacaoNaoPermitidaException("Use o endpoint de contraproposta para propor nova data");

            case CANCELADO:
                if (!isClienteCaller && !isCuidadorCaller) {
                    throw new OperacaoNaoPermitidaException(
                            "Somente o cliente ou o cuidador podem cancelar este agendamento");
                }
                agendamento.setStatus(Agendamento.StatusAgendamento.CANCELADO);
                break;

            case CONCLUIDO:
                if (!isCuidadorCaller) {
                    throw new OperacaoNaoPermitidaException("Apenas o cuidador pode marcar como concluÃ­do");
                }
                agendamento.setStatus(Agendamento.StatusAgendamento.CONCLUIDO);
                break;

            case PENDENTE:
            default:
                throw new OperacaoNaoPermitidaException("TransiÃ§Ã£o de status nÃ£o permitida");
        }

        agendamento = agendamentoRepository.save(agendamento);
        return toResponseDTO(agendamento);
    }

    @Transactional
    public AgendamentoResponseDTO atualizarStatusPorPrincipalName(Long id, String status, java.security.Principal principal) {
        Objects.requireNonNull(id, "Agendamento ID cannot be null");
        Agendamento agendamento = agendamentoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Agendamento não encontrado"));

        if (principal == null || principal.getName() == null || principal.getName().isBlank()) {
            throw new OperacaoNaoPermitidaException("Operação não autorizada: usuário não autenticado");
        }

        boolean isCuidadorCaller = principalMatchesCuidador(principal, agendamento.getCuidador());
        boolean isClienteCaller = principalMatchesCliente(principal, agendamento.getCliente());
        Agendamento.StatusAgendamento novoStatus = Agendamento.StatusAgendamento.valueOf(status);

        switch (novoStatus) {
            case EM_ANDAMENTO:
                if (!isCuidadorCaller) {
                    throw new OperacaoNaoPermitidaException("Apenas o cuidador pode iniciar o atendimento");
                }
                validarInicioAtendimento(agendamento);
                criarRegistroAutomatico(agendamento);
                agendamento.setStatus(novoStatus);
                break;
            case CONFIRMADO:
                if (agendamento.getStatus() == Agendamento.StatusAgendamento.REAGENDADO) {
                    if (!isClienteCaller) {
                        throw new OperacaoNaoPermitidaException("Apenas o cliente pode aceitar a contraproposta");
                    }
                    if (agendamento.getProposedDataHoraInicio() == null || agendamento.getProposedDataHoraFim() == null) {
                        throw new RuntimeException("Não existe contraproposta pendente para este agendamento");
                    }
                    agendamento.setDataHoraInicio(agendamento.getProposedDataHoraInicio());
                    agendamento.setDataHoraFim(agendamento.getProposedDataHoraFim());
                    agendamento.setProposedDataHoraInicio(null);
                    agendamento.setProposedDataHoraFim(null);
                    agendamento.setStatus(Agendamento.StatusAgendamento.CONFIRMADO);
                } else {
                    if (!isCuidadorCaller) {
                        throw new OperacaoNaoPermitidaException("Apenas o cuidador pode confirmar a proposta inicial");
                    }
                    agendamento.setStatus(Agendamento.StatusAgendamento.CONFIRMADO);
                }
                break;
            case CANCELADO:
                if (!isClienteCaller && !isCuidadorCaller) {
                    throw new OperacaoNaoPermitidaException("Somente o cliente ou o cuidador podem cancelar este agendamento");
                }
                agendamento.setStatus(Agendamento.StatusAgendamento.CANCELADO);
                break;
            case CONCLUIDO:
                if (!isCuidadorCaller) {
                    throw new OperacaoNaoPermitidaException("Apenas o cuidador pode marcar como concluído");
                }
                agendamento.setStatus(Agendamento.StatusAgendamento.CONCLUIDO);
                break;
            case REAGENDADO:
                throw new OperacaoNaoPermitidaException("Use o endpoint de contraproposta para propor nova data");
            case PENDENTE:
            default:
                throw new OperacaoNaoPermitidaException("Transição de status não permitida");
        }

        agendamento = agendamentoRepository.save(agendamento);
        return toResponseDTO(agendamento);
    }

    // â”€â”€ Contraproposta â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    @Transactional
    public AgendamentoResponseDTO proporContraproposta(Long id, ContrapropostaRequestDTO dto,
                                                        java.security.Principal principal) {
        Objects.requireNonNull(id, "Agendamento ID cannot be null");
        Agendamento agendamento = agendamentoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Agendamento nÃ£o encontrado"));

        if (principal == null) {
            throw new OperacaoNaoPermitidaException("OperaÃ§Ã£o nÃ£o autorizada: usuÃ¡rio nÃ£o autenticado");
        }

        Long callerId = getUserIdFromPrincipalOrNull(principal);
        boolean isCuidadorCaller = (callerId != null && callerId.equals(agendamento.getCuidador().getId()))
                || principalMatchesCuidador(principal, agendamento.getCuidador());
        if (!isCuidadorCaller) {
            throw new OperacaoNaoPermitidaException("Apenas o cuidador pode propor uma contraproposta");
        }
        if (dto.getDataHoraFim().isBefore(dto.getDataHoraInicio())) {
            throw new RuntimeException("Data/hora de fim da contraproposta deve ser posterior ao inÃ­cio");
        }
        if (dto.getDataHoraInicio().isBefore(OffsetDateTime.now(ZoneOffset.UTC))) {
            throw new RuntimeException("A contraproposta nÃ£o pode ter inÃ­cio no passado");
        }

        agendamento.setProposedDataHoraInicio(dto.getDataHoraInicio());
        agendamento.setProposedDataHoraFim(dto.getDataHoraFim());
        agendamento.setStatus(Agendamento.StatusAgendamento.REAGENDADO);

        agendamento = agendamentoRepository.save(agendamento);
        return toResponseDTO(agendamento);
    }

    @Transactional
    public AgendamentoResponseDTO aceitarContraproposta(Long id, java.security.Principal principal) {
        Objects.requireNonNull(id, "Agendamento ID cannot be null");
        Agendamento agendamento = agendamentoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Agendamento nÃ£o encontrado"));

        if (principal == null) {
            throw new OperacaoNaoPermitidaException("OperaÃ§Ã£o nÃ£o autorizada: usuÃ¡rio nÃ£o autenticado");
        }

        Long callerId = getUserIdFromPrincipalOrNull(principal);
        boolean isClienteCaller = (callerId != null && callerId.equals(agendamento.getCliente().getId()))
                || principalMatchesCliente(principal, agendamento.getCliente());
        if (!isClienteCaller) {
            throw new OperacaoNaoPermitidaException("Apenas o cliente pode aceitar a contraproposta");
        }
        if (agendamento.getStatus() != Agendamento.StatusAgendamento.REAGENDADO) {
            throw new RuntimeException("NÃ£o hÃ¡ contraproposta pendente para este agendamento");
        }
        if (agendamento.getProposedDataHoraInicio() == null || agendamento.getProposedDataHoraFim() == null) {
            throw new RuntimeException("Dados da contraproposta invÃ¡lidos");
        }

        agendamento.setDataHoraInicio(agendamento.getProposedDataHoraInicio());
        agendamento.setDataHoraFim(agendamento.getProposedDataHoraFim());
        agendamento.setProposedDataHoraInicio(null);
        agendamento.setProposedDataHoraFim(null);
        agendamento.setStatus(Agendamento.StatusAgendamento.CONFIRMADO);

        agendamento = agendamentoRepository.save(agendamento);
        return toResponseDTO(agendamento);
    }

    // â”€â”€ Consultas â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    @Transactional(readOnly = true)
    public List<AgendamentoResponseDTO> listarPorCuidador(Long cuidadorId) {
        return agendamentoRepository.findByCuidadorIdOrderByDataSolicitacaoDesc(cuidadorId)
                .stream().map(this::toResponseDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AgendamentoResponseDTO> listarPorCliente(Long clienteId) {
        return agendamentoRepository.findByClienteIdOrderByDataSolicitacaoDesc(clienteId)
                .stream().map(this::toResponseDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AgendamentoResponseDTO buscarPorId(Long id) {
        if (id == null) throw new IllegalArgumentException("ID do agendamento nÃ£o pode ser nulo");
        return toResponseDTO(agendamentoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Agendamento nÃ£o encontrado")));
    }

    @Transactional(readOnly = true)
    public List<AgendamentoResponseDTO> listarPorCuidadorEPeriodo(Long cuidadorId,
                                                                    OffsetDateTime inicio,
                                                                    OffsetDateTime fim) {
        return agendamentoRepository.findByCuidadorAndPeriodo(cuidadorId, inicio, fim)
                .stream().map(this::toResponseDTO).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AgendamentoResponseDTO> listarProximos(Long userId, int dias) {
        OffsetDateTime agora = OffsetDateTime.now(ZoneOffset.UTC);
        OffsetDateTime limite = agora.plusDays(dias);
        return agendamentoRepository.findProximosAgendamentos(userId, agora, limite)
                .stream().map(this::toResponseDTO).collect(Collectors.toList());
    }

    @Transactional
    public void cancelarAgendamento(Long id) {
        Objects.requireNonNull(id, "Agendamento ID cannot be null");
        Agendamento agendamento = agendamentoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Agendamento nÃ£o encontrado"));
        agendamento.setStatus(Agendamento.StatusAgendamento.CANCELADO);
        agendamentoRepository.save(agendamento);
    }

    @Transactional(readOnly = true)
    public boolean podeEditarProntuario(Long cuidadorId, Long clienteId) {
        Objects.requireNonNull(cuidadorId, "Cuidador ID cannot be null");
        Objects.requireNonNull(clienteId, "Cliente ID cannot be null");
        OffsetDateTime inicioHoje = OffsetDateTime.now(ZoneOffset.UTC).toLocalDate().atStartOfDay().atOffset(ZoneOffset.UTC);
        OffsetDateTime fimHoje = inicioHoje.plusDays(1);
        return agendamentoRepository.existsAgendamentoAtivoHoje(cuidadorId, clienteId, inicioHoje, fimHoje);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> verificarPodeIniciar(Long id) {
        Objects.requireNonNull(id, "Agendamento ID cannot be null");
        Map<String, Object> resultado = new HashMap<>();
        Agendamento agendamento = agendamentoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Agendamento nÃ£o encontrado"));

        OffsetDateTime agora = OffsetDateTime.now(ZoneOffset.UTC);
        OffsetDateTime inicioPermitido = agendamento.getDataHoraInicio().minusMinutes(30);
        OffsetDateTime fimPermitido = agendamento.getDataHoraFim();
        boolean podeIniciar = !agora.isBefore(inicioPermitido) && !agora.isAfter(fimPermitido);

        resultado.put("podeIniciar", podeIniciar);
        resultado.put("agora", agora.toString());
        resultado.put("inicioPermitido", inicioPermitido.toString());
        resultado.put("fimPermitido", fimPermitido.toString());
        resultado.put("dataHoraInicio", agendamento.getDataHoraInicio().toString());
        resultado.put("motivo", podeIniciar
                ? "VocÃª pode iniciar o atendimento agora."
                : (agora.isBefore(inicioPermitido)
                        ? "Ainda nÃ£o estÃ¡ no horÃ¡rio. VocÃª poderÃ¡ iniciar 30 minutos antes."
                        : "O horÃ¡rio agendado jÃ¡ passou."));
        return resultado;
    }

    public List<AgendamentoResponseDTO> listarAvaliacoesPendentes(Long clienteId) {
        Objects.requireNonNull(clienteId, "Cliente ID nÃ£o pode ser null");
        return agendamentoRepository.findAgendamentosPendentesAvaliacaoByClienteId(clienteId)
                .stream().map(this::toResponseDTO).collect(Collectors.toList());
    }

    public long contarAvaliacoesPendentes(Long clienteId) {
        Objects.requireNonNull(clienteId, "Cliente ID nÃ£o pode ser null");
        return agendamentoRepository.countAvaliacoesPendentesByClienteId(clienteId);
    }

    public long contarPendentesCuidador(Long cuidadorId) {
        Objects.requireNonNull(cuidadorId, "Cuidador ID nÃ£o pode ser null");
        return agendamentoRepository.countPendentesByCuidadorId(cuidadorId);
    }

    public long contarReagendadosCliente(Long clienteId) {
        Objects.requireNonNull(clienteId, "Cliente ID nÃ£o pode ser null");
        return agendamentoRepository.countReagendadosByClienteId(clienteId);
    }

    // â”€â”€ Helpers privados â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    private void validarInicioAtendimento(Agendamento agendamento) {
        OffsetDateTime agora = OffsetDateTime.now(ZoneOffset.UTC);
        OffsetDateTime inicioPermitido = agendamento.getDataHoraInicio().minusMinutes(30);
        OffsetDateTime fimPermitido = agendamento.getDataHoraFim();
        if (agora.isBefore(inicioPermitido)) {
            throw new OperacaoNaoPermitidaException(
                    String.format("NÃ£o Ã© possÃ­vel iniciar o atendimento ainda. Agendado para %s. " +
                                  "VocÃª poderÃ¡ iniciÃ¡-lo a partir de %s (30 min antes).",
                            agendamento.getDataHoraInicio(), inicioPermitido));
        }
        if (agora.isAfter(fimPermitido)) {
            throw new OperacaoNaoPermitidaException(
                    String.format("NÃ£o Ã© possÃ­vel iniciar o atendimento. O horÃ¡rio jÃ¡ passou (tÃ©rmino: %s).",
                            fimPermitido));
        }
    }

    private void criarRegistroAutomatico(Agendamento agendamento) {
        boolean jaExiste = registroRepository.existsByAgendamentoId(agendamento.getId());
        if (!jaExiste) {
            RegistroAcompanhamento registro = new RegistroAcompanhamento();
            registro.setAgendamento(agendamento);
            registro.setCuidador(agendamento.getCuidador());
            registro.setCliente(agendamento.getCliente());
            registro.setDataHoraRegistro(OffsetDateTime.now(ZoneOffset.UTC));
            registro.setObservacoes("Atendimento iniciado - Aguardando preenchimento pelo cuidador");
            registroRepository.save(registro);
        }
    }

    private AgendamentoResponseDTO toResponseDTO(Agendamento agendamento) {
        AgendamentoResponseDTO dto = new AgendamentoResponseDTO();
        dto.setId(agendamento.getId());
        dto.setCuidadorId(agendamento.getCuidador().getId());
        dto.setCuidadorNome(agendamento.getCuidador().getName());
        dto.setClienteId(agendamento.getCliente().getId());
        dto.setClienteNome(agendamento.getCliente().getName());
        dto.setDataHoraInicio(agendamento.getDataHoraInicio());
        dto.setDataHoraFim(agendamento.getDataHoraFim());
        dto.setStatus(agendamento.getStatus().name());
        dto.setObservacoes(agendamento.getObservacoes());
        if (agendamento.getTipoAtendimento() != null) {
            dto.setTipoAtendimento(agendamento.getTipoAtendimento().name());
        }
        dto.setDataSolicitacao(agendamento.getDataSolicitacao());
        dto.setProposedDataHoraInicio(agendamento.getProposedDataHoraInicio());
        dto.setProposedDataHoraFim(agendamento.getProposedDataHoraFim());
        return dto;
    }
}







