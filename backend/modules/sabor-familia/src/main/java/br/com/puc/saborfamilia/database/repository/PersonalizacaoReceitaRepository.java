package br.com.puc.saborfamilia.database.repository;

import br.com.puc.saborfamilia.database.entity.PersonalizacaoReceitaEntity;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface PersonalizacaoReceitaRepository extends JpaRepository<PersonalizacaoReceitaEntity, Long> {

  @Query(
    """
      SELECT DISTINCT pr FROM PersonalizacaoReceitaEntity pr
      JOIN FETCH pr.personalizacao
      WHERE pr.receita.id = :receitaId
      """
  )
  List<PersonalizacaoReceitaEntity> findByReceitaId(@Param("receitaId") Long receitaId);

  @Query(
    """
      SELECT DISTINCT pr FROM PersonalizacaoReceitaEntity pr
      JOIN FETCH pr.personalizacao
      WHERE pr.receita.id IN :receitaIds
      """
  )
  List<PersonalizacaoReceitaEntity> findByReceitaIdIn(@Param("receitaIds") Collection<Long> receitaIds);

  @Modifying
  @Query(
    """
      DELETE FROM PersonalizacaoReceitaEntity personalizacaoReceita
      WHERE personalizacaoReceita.receita.id = :receitaId
    """
  )
  void deleteByReceitaId(Long receitaId);
}
