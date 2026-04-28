package br.com.puc.saborfamilia.database.repository;

import br.com.puc.saborfamilia.database.entity.CurtidaReceitaEntity;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface CurtidaReceitaRepository extends JpaRepository<CurtidaReceitaEntity, Long> {

  Optional<CurtidaReceitaEntity> findByReceitaIdAndPerfilId(Long receitaId, Long perfilId);

  @Query(
    "SELECT c.receita.id FROM CurtidaReceitaEntity c WHERE c.perfil.id = :perfilId AND c.receita.id IN :receitaIds"
  )
  List<Long> findReceitaIdsByPerfilIdAndReceitaIdIn(
    @Param("perfilId") Long perfilId,
    @Param("receitaIds") Collection<Long> receitaIds
  );

  @Query(
    """
      SELECT curtida FROM CurtidaReceitaEntity curtida
      JOIN FETCH curtida.perfil
      WHERE curtida.receita.id = :receitaId
    """
  )
  List<CurtidaReceitaEntity> findByReceitaIdWithPerfil(@Param("receitaId") Long receitaId);

}

