package br.pucgo.ads.projetointegrador.carehub.controller;

import br.pucgo.ads.projetointegrador.carehub.dto.alerta.AlertaEmergenciaResponseDTO;
import br.pucgo.ads.projetointegrador.carehub.dto.alerta.DispositivoIoTCreateRequestDTO;
import br.pucgo.ads.projetointegrador.carehub.dto.alerta.DispositivoIoTResponseDTO;
import br.pucgo.ads.projetointegrador.carehub.dto.alerta.IotAlertRequestDTO;
import br.pucgo.ads.projetointegrador.carehub.service.AlertaEmergenciaService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class AlertaEmergenciaController {

    private final AlertaEmergenciaService alertaEmergenciaService;

    @PostMapping("/api/carehub/iot/alerts")
    public ResponseEntity<?> receberAlertaIoT(
            @RequestHeader(name = "X-Device-Id", required = false) String deviceId,
            @RequestHeader(name = "X-Device-Key", required = false) String deviceKey,
            @RequestBody(required = false) IotAlertRequestDTO request,
            HttpServletRequest servletRequest
    ) {
        try {
            AlertaEmergenciaResponseDTO alerta = alertaEmergenciaService
                    .receberAlerta(deviceId, deviceKey, servletRequest.getRemoteAddr(), request);
            return ResponseEntity.status(HttpStatus.CREATED).body(alerta);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/api/carehub/alertas")
    public ResponseEntity<List<AlertaEmergenciaResponseDTO>> listarAlertas(
            @RequestParam(required = false) String status
    ) {
        return ResponseEntity.ok(alertaEmergenciaService.listarDoUsuarioAutenticado(status));
    }

    @PutMapping("/api/carehub/alertas/{id}/reconhecer")
    public ResponseEntity<AlertaEmergenciaResponseDTO> reconhecerAlerta(@PathVariable Long id) {
        return ResponseEntity.ok(alertaEmergenciaService.reconhecer(id));
    }

    @PostMapping("/api/carehub/iot/devices")
    public ResponseEntity<?> cadastrarDispositivo(@RequestBody DispositivoIoTCreateRequestDTO request) {
        try {
            DispositivoIoTResponseDTO dispositivo = alertaEmergenciaService.cadastrarDispositivoParaUsuarioLogado(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(dispositivo);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/api/carehub/iot/devices")
    public ResponseEntity<List<DispositivoIoTResponseDTO>> listarDispositivos() {
        return ResponseEntity.ok(alertaEmergenciaService.listarDispositivosDoUsuarioLogado());
    }
}
