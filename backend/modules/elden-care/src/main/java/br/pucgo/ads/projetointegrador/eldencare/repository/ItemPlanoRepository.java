package br.pucgo.ads.projetointegrador.eldencare.repository;

import br.pucgo.ads.projetointegrador.eldencare.domain.ex_item_plano;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ItemPlanoRepository extends JpaRepository<ex_item_plano, UUID> {

    // busca os itens de um dia em ordem
    List<ex_item_plano> findByDia_IdOrderByOrdemAsc(UUID diaId);
}
