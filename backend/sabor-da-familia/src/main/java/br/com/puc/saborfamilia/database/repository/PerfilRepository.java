package br.com.puc.saborfamilia.database.repository;

import br.com.puc.saborfamilia.database.entity.PerfilEntity;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface PerfilRepository extends JpaRepository<PerfilEntity, Long> {

  Optional<PerfilEntity> findByUsuarioId(Long usuarioId);

  boolean existsByEmail(String email);

  @Query(
    """
      SELECT perfil FROM PerfilEntity perfil
      LEFT JOIN FETCH perfil.restricoesAlimentares restricao
      LEFT JOIN FETCH restricao.restricao
      WHERE perfil.id = :perfilId
    """
  )
  Optional<PerfilEntity> findByIdWithRestricoes(@Param("perfilId") Long perfilId);

  @Query(
    """
      SELECT perfil FROM PerfilEntity perfil
      LEFT JOIN FETCH perfil.restricoesAlimentares restricao
      LEFT JOIN FETCH restricao.restricao
      WHERE perfil.usuarioId = :usuarioId
    """
  )
  Optional<PerfilEntity> findByUsuarioIdWithRestricoes(@Param("usuarioId") Long usuarioId);

}

