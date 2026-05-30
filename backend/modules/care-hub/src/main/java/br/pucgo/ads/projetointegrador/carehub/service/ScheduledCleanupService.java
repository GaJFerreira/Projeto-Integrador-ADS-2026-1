package br.pucgo.ads.projetointegrador.carehub.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import br.pucgo.ads.projetointegrador.carehub.repository.MessageMediaRepository;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;

@Component
public class ScheduledCleanupService {

    @Autowired
    private MessageMediaRepository messageMediaRepository;

    // Executar uma vez por dia às 03h30
    @Scheduled(cron = "0 30 3 * * *")
    public void cleanupOldMedia() {
        try {
            OffsetDateTime cutoff = OffsetDateTime.now(ZoneOffset.UTC).minusDays(7);
            List<br.pucgo.ads.projetointegrador.carehub.entity.MessageMedia> olds = messageMediaRepository
                    .findByCreatedAtBefore(cutoff);
            if (olds == null || olds.isEmpty())
                return;
            for (br.pucgo.ads.projetointegrador.carehub.entity.MessageMedia m : olds) {
                if (m == null)
                    continue;
                try {
                    messageMediaRepository.delete(java.util.Objects.requireNonNull(m));
                } catch (Exception ex) {
                    System.err.println("Falha ao excluir o ID de mídia=" + (m == null ? "null" : m.getId()) + ": "
                            + ex.getMessage());
                }
            }
            System.out.println("ScheduledCleanupService: deleted " + olds.size() + " old media entries.");
        } catch (Exception ex) {
            System.err.println("ScheduledCleanupService failed: " + ex.getMessage());
        }
    }
}
