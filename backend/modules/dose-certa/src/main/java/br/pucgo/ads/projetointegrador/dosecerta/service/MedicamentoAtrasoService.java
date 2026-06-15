package br.pucgo.ads.projetointegrador.dosecerta.service;

import br.pucgo.ads.projetointegrador.dosecerta.database.entity.Medicamento;
import br.pucgo.ads.projetointegrador.dosecerta.database.entity.MedicamentoHorario;
import br.pucgo.ads.projetointegrador.dosecerta.database.repository.MedicamentoHorarioRepository;
import br.pucgo.ads.projetointegrador.dosecerta.sms.SmsService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class MedicamentoAtrasoService {

    private static final Logger logger = LoggerFactory.getLogger(MedicamentoAtrasoService.class);

    private final MedicamentoHorarioRepository horarioRepo;
    private final SmsService smsService;

    public MedicamentoAtrasoService(
            MedicamentoHorarioRepository horarioRepo,
            SmsService smsService
    ) {
        this.horarioRepo = horarioRepo;
        this.smsService = smsService;
    }

    private int obterTempoLimite(Medicamento med) {
        return 1; // sempre 5 minutos de tolerância
    }


    @Transactional
    public void verificarAtrasos() {

        LocalDateTime agora = LocalDateTime.now();
        var horarios = horarioRepo.findAllAbertos();

        DateTimeFormatter horaFmt = DateTimeFormatter.ofPattern("HH:mm");

        for (MedicamentoHorario h : horarios) {
            try {

                var med = h.getMedicamento();
                if (med == null) {
                    logger.warn("⚠️ Horário id={} sem medicamento — ignorando", h.getId());
                    continue;
                }

                // 🔥 USAR SEMPRE A PROXIMA EXECUÇÃO REAL (HOJE OU AMANHÃ)
                LocalDateTime horaPrevista = h.getProximaExecucao();

                // Se o horário ainda não chegou → NÃO notificar
                if (horaPrevista.isAfter(agora)) {
                    continue;
                }

                // Se já tomou → não notificar
                if (h.getTomadoHoje()) {
                    continue;
                }

                // Se já notificou → não notificar
                if (h.getNotificado()) {
                    continue;
                }

                var contatos = med.getContatosEmergencia();

                if (contatos == null || contatos.isEmpty()) {
                    logger.debug("ℹ️ Medicamento id={} sem contatos — pulando", med.getId());
                    continue;
                }

                String nomeMedicamento = med.getMedicamentoAnvisa() != null
                        ? med.getMedicamentoAnvisa().getNomeProduto()
                        : "medicamento";

                String horarioPrevistoFmt = horaPrevista.format(horaFmt);

                String mensagem = String.format(
                        "⚠️ ALERTA: O medicamento %s não foi tomado às %s. Por favor verificar.",
                        nomeMedicamento, horarioPrevistoFmt
                );

                boolean algumEnviado = false;

                for (var contato : contatos) {

                    String numeroBruto = contato.getTelefone();
                    if (numeroBruto == null || numeroBruto.trim().isEmpty()) {
                        logger.warn("Contato id={} sem telefone — ignorando", contato.getId());
                        continue;
                    }

                    String digits = numeroBruto.replaceAll("\\D", "");
                    String telefoneFinal = digits.startsWith("55")
                            ? "+" + digits
                            : "+55" + digits;

                    try {
                        logger.info("📨 Enviando SMS → {} (contato id={}, horarioId={})",
                                telefoneFinal, contato.getId(), h.getId());

                        String sid = smsService.sendSms(telefoneFinal, mensagem);
                        logger.info("✅ SMS enviado (sid={})", sid);

                        algumEnviado = true;

                    } catch (Exception ex) {
                        logger.error("❌ Erro ao enviar SMS para contato id={} ({}) — {}",
                                contato.getId(), numeroBruto, ex.getMessage());
                    }
                }

                if (algumEnviado) {
                    h.setNotificado(true);
                    horarioRepo.save(h);
                    logger.debug("✔️ Horário id={} marcado como notificado", h.getId());
                }

            } catch (Exception e) {
                logger.error("❌ Erro ao processar horario id={}: {}", h.getId(), e.getMessage(), e);
            }
        }
    }
}