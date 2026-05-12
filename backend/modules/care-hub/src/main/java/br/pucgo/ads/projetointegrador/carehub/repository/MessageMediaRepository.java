package br.pucgo.ads.projetointegrador.carehub.repository;

import br.pucgo.ads.projetointegrador.carehub.entity.MessageMedia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface MessageMediaRepository extends JpaRepository<MessageMedia, Long> {
    MessageMedia findByStorageKey(String storageKey);
    List<MessageMedia> findByCreatedAtBefore(LocalDateTime cutoff);
}
