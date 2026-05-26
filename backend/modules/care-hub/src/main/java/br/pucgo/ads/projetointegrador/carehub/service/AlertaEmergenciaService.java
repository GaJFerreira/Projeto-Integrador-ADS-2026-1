package br.pucgo.ads.projetointegrador.carehub.service;

import br.pucgo.ads.projetointegrador.carehub.dto.alerta.AlertaEmergenciaResponseDTO;
import br.pucgo.ads.projetointegrador.carehub.dto.alerta.DispositivoIoTCreateRequestDTO;
import br.pucgo.ads.projetointegrador.carehub.dto.alerta.DispositivoIoTResponseDTO;
import br.pucgo.ads.projetointegrador.carehub.dto.alerta.IotAlertRequestDTO;
import br.pucgo.ads.projetointegrador.carehub.entity.AlertaEmergencia;
import br.pucgo.ads.projetointegrador.carehub.entity.Cliente;
import br.pucgo.ads.projetointegrador.carehub.entity.DispositivoIoT;
import br.pucgo.ads.projetointegrador.carehub.repository.AlertaEmergenciaRepository;
import br.pucgo.ads.projetointegrador.carehub.repository.ClienteRepository;
import br.pucgo.ads.projetointegrador.carehub.repository.DispositivoIoTRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.lang.reflect.Method;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AlertaEmergenciaService {

    private final DispositivoIoTRepository dispositivoIoTRepository;
    private final AlertaEmergenciaRepository alertaEmergenciaRepository;
    private final ClienteRepository clienteRepository;
    private final PasswordEncoder passwordEncoder;

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
        alerta.setStatus("NOVO");
        alerta.setOrigem("ESP32");
        alerta.setObservacao(request != null ? request.getObservacao() : null);

        alerta = alertaEmergenciaRepository.save(alerta);
        dispositivoIoTRepository.save(dispositivo);
        return toResponse(alerta);
    }

    @Transactional(readOnly = true)
    public List<AlertaEmergenciaResponseDTO> listarDoUsuarioAutenticado(String status) {
        Long platformUserId = getPlatformUserIdFromAuth();
        Cliente cliente = clienteRepository.findByPlatformUserId(platformUserId)
                .orElseThrow(() -> new IllegalArgumentException("Cliente do CareHub não encontrado para o usuário autenticado"));

        List<AlertaEmergencia> alertas = (status == null || status.isBlank())
                ? alertaEmergenciaRepository.findByCliente_IdOrderByCriadoEmDesc(cliente.getId())
                : alertaEmergenciaRepository.findByCliente_IdAndStatusOrderByCriadoEmDesc(cliente.getId(), status.toUpperCase(Locale.ROOT));

        return alertas.stream().map(this::toResponse).toList();
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
                .orElseThrow(() -> new IllegalArgumentException("Cliente do CareHub não encontrado para o usuário autenticado"));

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

    @Transactional(readOnly = true)
    public List<DispositivoIoTResponseDTO> listarDispositivosDoUsuarioLogado() {
        Long platformUserId = getPlatformUserIdFromAuth();
        Cliente cliente = clienteRepository.findByPlatformUserId(platformUserId)
                .orElseThrow(() -> new IllegalArgumentException("Cliente do CareHub não encontrado para o usuário autenticado"));
        return dispositivoIoTRepository.findByCliente_Id(cliente.getId()).stream().map(this::toResponse).toList();
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
            Object id = getIdMethod.invoke(principal);
            return Long.valueOf(Objects.toString(id));
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
