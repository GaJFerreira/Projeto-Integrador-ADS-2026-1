package br.com.puc.saborfamilia.database.repository;

import br.com.puc.saborfamilia.database.entity.ReceitaRestricaoAlimentarEntity;
import br.com.puc.saborfamilia.enums.StatusEnum;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface RestricaoAlimentarReceitaRepository extends JpaRepository<ReceitaRestricaoAlimentarEntity, Long> {

  @Query(
    """
      SELECT DISTINCT restricaoReceita FROM ReceitaRestricaoAlimentarEntity restricaoReceita
      JOIN FETCH restricaoReceita.restricao
      JOIN FETCH restricaoReceita.receita
      WHERE restricaoReceita.receita.id IN :receitaIds
      AND restricaoReceita.restricao.status = :status
    """
  )
  List<ReceitaRestricaoAlimentarEntity> findByReceitaIdInAndStatus(
    @Param("receitaIds") List<Long> receitaIds,
    @Param("status") StatusEnum status
  );

  @Modifying
  @Query(
    """
      DELETE FROM ReceitaRestricaoAlimentarEntity restricaoReceita
      WHERE restricaoReceita.receita.id = :receitaId
    """
  )
  void deleteByReceitaId(@Param("receitaId") Long receitaId);

}
