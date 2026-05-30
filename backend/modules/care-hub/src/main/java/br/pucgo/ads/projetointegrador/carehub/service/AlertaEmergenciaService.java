package br.pucgo.ads.projetointegrador.carehub.service;

import br.pucgo.ads.projetointegrador.carehub.dto.alerta.AlertaEmergenciaResponseDTO;
import br.pucgo.ads.projetointegrador.carehub.dto.alerta.DispositivoIoTCreateRequestDTO;
import br.pucgo.ads.projetointegrador.carehub.dto.alerta.DispositivoIoTResponseDTO;
import br.pucgo.ads.projetointegrador.carehub.dto.alerta.IotAlertRequestDTO;
import br.pucgo.ads.projetointegrador.carehub.entity.AlertaEmergencia;
import br.pucgo.ads.projetointegrador.carehub.entity.Cliente;
import br.pucgo.ads.projetointegrador.carehub.entity.Cuidador;
import br.pucgo.ads.projetointegrador.carehub.entity.DispositivoIoT;
import br.pucgo.ads.projetointegrador.carehub.repository.AlertaEmergenciaRepository;
import br.pucgo.ads.projetointegrador.carehub.repository.ClienteRepository;
import br.pucgo.ads.projetointegrador.carehub.repository.DispositivoIoTRepository;
import br.pucgo.ads.projetointegrador.carehub.repository.CuidadorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.extern.slf4j.Slf4j;

import java.lang.reflect.Method;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AlertaEmergenciaService {

    private final DispositivoIoTRepository dispositivoIoTRepository;
    private final AlertaEmergenciaRepository alertaEmergenciaRepository;
    private final ClienteRepository clienteRepository;
    private final CuidadorRepository cuidadorRepository;
    private final PasswordEncoder passwordEncoder;
    private final UsuarioSyncService usuarioSyncService;

    @Transactional
    public AlertaEmergenciaResponseDTO receberAlerta(String deviceId, String deviceKey, String remoteIp, IotAlertRequestDTO request) {
        if (deviceId == null || deviceId.isBlank() || deviceKey == null || deviceKey.isBlank()) {
            throw new IllegalArgumentException("Credenciais do dispositivo não informadas");
        }

        DispositivoIoT dispositivo = dispositivoIoTRepository.findByDeviceId(deviceId)
                .orElseThrow(() -> new IllegalArgumentException("Dispositivo não encontrado"));

        if (!Boolean.TRUE.equals(dispositivo.getAtivo())) {
            throw new IllegalArgumentException("Dispositivo inativo");
        }
        if (!passwordEncoder.matches(deviceKey, dispositivo.getApiKeyHash())) {
            throw new IllegalArgumentException("Credencial do dispositivo inválida");
        }

        dispositivo.setUltimoIp(remoteIp);
        dispositivo.setUltimoBatimentoEm(OffsetDateTime.now());

        AlertaEmergencia alerta = new AlertaEmergencia();
        alerta.setCliente(dispositivo.getCliente());
        alerta.setDispositivo(dispositivo);
        alerta.setTipo(normalizarTipo(request != null ? request.getTipo() : null));
        alerta.setStatus("PENDENTE");
        alerta.setOrigem("ESP32");
        alerta.setObservacao(request != null ? request.getObservacao() : null);

        // Vincula o cuidador ativo do cliente diretamente no alerta.
        // Isso elimina a dependência de JOIN com Agendamento na consulta do cuidador.
        List<Cuidador> cuidadoresAtivos = cuidadorRepository
                .findCuidadoresAtivosDoCliente(dispositivo.getCliente().getId());
        if (!cuidadoresAtivos.isEmpty()) {
            alerta.setCuidador(cuidadoresAtivos.get(0)); // pega o mais recente
            log.info("Alerta vinculado ao cuidador id={} para o cliente id={}",
                    cuidadoresAtivos.get(0).getId(), dispositivo.getCliente().getId());
        } else {
            log.warn("Cliente id={} não possui cuidador ativo. Alerta criado sem cuidador vinculado.",
                    dispositivo.getCliente().getId());
        }

        alerta = alertaEmergenciaRepository.save(alerta);
        dispositivoIoTRepository.save(dispositivo);
        return toResponse(alerta);
    }

    @Transactional(readOnly = false)
    public List<AlertaEmergenciaResponseDTO> listarDoUsuarioAutenticado(String status) {
        Long platformUserId = getPlatformUserIdFromAuth();
        
        var clienteOpt = clienteRepository.findByPlatformUserId(platformUserId);
        if (clienteOpt.isPresent()) {
            Cliente cliente = clienteOpt.get();
            List<AlertaEmergencia> alertas = (status == null || status.isBlank())
                    ? alertaEmergenciaRepository.findByCliente_IdOrderByCriadoEmDesc(cliente.getId())
                    : alertaEmergenciaRepository.findByCliente_IdAndStatusOrderByCriadoEmDesc(cliente.getId(), status.toUpperCase(Locale.ROOT));
            return alertas.stream().map(this::toResponse).toList();
        }

        var cuidadorOpt = cuidadorRepository.findByPlatformUserId(platformUserId);
        if (cuidadorOpt.isPresent()) {
            Long cuidadorId = cuidadorOpt.get().getId();
            List<AlertaEmergencia> alertas = (status == null || status.isBlank())
                    ? alertaEmergenciaRepository.findByCuidador_IdOrderByCriadoEmDesc(cuidadorId)
                    : alertaEmergenciaRepository.findByCuidador_IdAndStatusOrderByCriadoEmDesc(cuidadorId, status.toUpperCase(Locale.ROOT));
            return alertas.stream().map(this::toResponse).toList();
        }

        throw new IllegalArgumentException("Usuário autenticado não é nem Cliente nem Cuidador do CareHub");
    }

    @Transactional
    public AlertaEmergenciaResponseDTO reconhecer(Long alertaId) {
        AlertaEmergencia alerta = alertaEmergenciaRepository.findById(alertaId)
                .orElseThrow(() -> new IllegalArgumentException("Alerta não encontrado"));
        alerta.setStatus("RECONHECIDO");
        alerta.setReconhecidoEm(OffsetDateTime.now());
        alerta = alertaEmergenciaRepository.save(alerta);
        return toResponse(alerta);
    }

    @Transactional
    public DispositivoIoTResponseDTO cadastrarDispositivoParaUsuarioLogado(DispositivoIoTCreateRequestDTO request) {
        Long platformUserId = getPlatformUserIdFromAuth();
        Cliente cliente = clienteRepository.findByPlatformUserId(platformUserId)
                .orElseThrow(() -> new IllegalArgumentException("Apenas Clientes podem cadastrar dispositivos IoT."));

        String deviceId = request.getDeviceId();
        if (deviceId == null || deviceId.isBlank()) {
            deviceId = "esp32-" + UUID.randomUUID().toString().substring(0, 8);
        }
        if (dispositivoIoTRepository.findByDeviceId(deviceId).isPresent()) {
            throw new IllegalArgumentException("deviceId já cadastrado");
        }

        String rawKey = (request.getDeviceKey() == null || request.getDeviceKey().isBlank())
                ? UUID.randomUUID().toString().replace("-", "")
                : request.getDeviceKey().trim();

        DispositivoIoT dispositivo = new DispositivoIoT();
        dispositivo.setCliente(cliente);
        dispositivo.setNome((request.getNome() == null || request.getNome().isBlank()) ? "Botão de Emergência" : request.getNome().trim());
        dispositivo.setDeviceId(deviceId);
        dispositivo.setApiKeyHash(passwordEncoder.encode(rawKey));
        dispositivo.setAtivo(true);
        dispositivo = dispositivoIoTRepository.save(dispositivo);

        DispositivoIoTResponseDTO dto = toResponse(dispositivo);
        dto.setDeviceKeyPlain(rawKey);
        return dto;
    }

    @Transactional(readOnly = false)
    public List<DispositivoIoTResponseDTO> listarDispositivosDoUsuarioLogado() {
        Long platformUserId = getPlatformUserIdFromAuth();
        var clienteOpt = clienteRepository.findByPlatformUserId(platformUserId);
        if (clienteOpt.isPresent()) {
            return dispositivoIoTRepository.findByCliente_Id(clienteOpt.get().getId()).stream().map(this::toResponse).toList();
        }
        var cuidadorOpt = cuidadorRepository.findByPlatformUserId(platformUserId);
        if (cuidadorOpt.isPresent()) {
            // Cuidadores não possuem dispositivos próprios, eles veem os alertas dos clientes
            return List.of();
        }
        throw new IllegalArgumentException("Usuário autenticado não é nem Cliente nem Cuidador do CareHub");
    }

    private AlertaEmergenciaResponseDTO toResponse(AlertaEmergencia alerta) {
        AlertaEmergenciaResponseDTO dto = new AlertaEmergenciaResponseDTO();
        dto.setId(alerta.getId());
        dto.setStatus(alerta.getStatus());
        dto.setTipo(alerta.getTipo());
        dto.setOrigem(alerta.getOrigem());
        dto.setObservacao(alerta.getObservacao());
        dto.setClienteId(alerta.getCliente().getId());
        dto.setClienteNome(alerta.getCliente().getName());
        dto.setDispositivoId(alerta.getDispositivo().getId());
        dto.setDeviceId(alerta.getDispositivo().getDeviceId());
        dto.setDispositivoNome(alerta.getDispositivo().getNome());
        dto.setCriadoEm(alerta.getCriadoEm());
        dto.setReconhecidoEm(alerta.getReconhecidoEm());
        return dto;
    }

    private Long getPlatformUserIdFromAuth() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new IllegalArgumentException("Usuário não autenticado");
        }
        Object principal = authentication.getPrincipal();
        try {
            Method getIdMethod = principal.getClass().getMethod("getId");
            Long platformUserId = (Long) getIdMethod.invoke(principal);

            try {
                Method getUserMethod = principal.getClass().getMethod("getUser");
                Object userObj = getUserMethod.invoke(principal);

                Method getUsernameMethod = userObj.getClass().getMethod("getUsername");
                String username = (String) getUsernameMethod.invoke(userObj);

                Method getEmailMethod = userObj.getClass().getMethod("getEmail");
                String email = (String) getEmailMethod.invoke(userObj);

                Method getNameMethod = userObj.getClass().getMethod("getName");
                String name = (String) getNameMethod.invoke(userObj);

                Method getRoleMethod = userObj.getClass().getMethod("getRole");
                Object roleObj = getRoleMethod.invoke(userObj);
                Method getRoleNameMethod = roleObj.getClass().getMethod("getName");
                String platformRole = (String) getRoleNameMethod.invoke(roleObj);

                usuarioSyncService.sincronizarOuCriar(platformUserId, username, email, name, platformRole);
            } catch (Exception e) {
                log.warn("Não foi possível extrair os dados completos do usuário para sincronização: {}", e.getMessage());
            }

            return platformUserId;
        } catch (Exception e) {
            throw new IllegalArgumentException("Não foi possível obter o id do usuário autenticado");
        }
    }

    private String normalizarTipo(String tipo) {
        if (tipo == null || tipo.isBlank()) {
            return "BOTAO_PANICO";
        }
        return tipo.trim().toUpperCase(Locale.ROOT);
    }

    private DispositivoIoTResponseDTO toResponse(DispositivoIoT dispositivo) {
        DispositivoIoTResponseDTO dto = new DispositivoIoTResponseDTO();
        dto.setId(dispositivo.getId());
        dto.setNome(dispositivo.getNome());
        dto.setDeviceId(dispositivo.getDeviceId());
        dto.setAtivo(dispositivo.getAtivo());
        dto.setUltimoBatimentoEm(dispositivo.getUltimoBatimentoEm());
        return dto;
    }
}
