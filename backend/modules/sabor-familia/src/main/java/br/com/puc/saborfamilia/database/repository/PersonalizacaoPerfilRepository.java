package br.com.puc.saborfamilia.database.repository;

import br.com.puc.saborfamilia.database.entity.PersonalizacaoPerfilEntity;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface PersonalizacaoPerfilRepository extends JpaRepository<PersonalizacaoPerfilEntity, Long> {

  @Query(
    """
      SELECT DISTINCT pp FROM PersonalizacaoPerfilEntity pp
      JOIN FETCH pp.personalizacao
      WHERE pp.perfil.id = :perfilId
      """
  )
  List<PersonalizacaoPerfilEntity> findByPerfilId(@Param("perfilId") Long perfilId);

  @Modifying
  @Query(
    """
      DELETE FROM PersonalizacaoPerfilEntity personalizacaoPerfil
      WHERE personalizacaoPerfil.perfil.id = :perfilId
    """
  )
  void deleteByPerfilId(Long perfilId);
}
