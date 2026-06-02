package br.pucgo.ads.projetointegrador.eldencare.controller;

import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/elden-care")
public class EldenCarePingController {

    // GET /api/elden-care/ping — health check público
    @GetMapping("/ping")
    public Map<String, Object> ping() {
        return Map.of(
                "ok", true,
                "service", "elden-care",
                "ts", java.time.Instant.now().toString()
        );
    }
}
