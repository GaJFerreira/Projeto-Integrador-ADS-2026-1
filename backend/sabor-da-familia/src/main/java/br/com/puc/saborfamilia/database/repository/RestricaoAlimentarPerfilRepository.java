package br.com.puc.saborfamilia.database.repository;

import br.com.puc.saborfamilia.database.entity.PerfilRestricaoAlimentarEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface RestricaoAlimentarPerfilRepository extends JpaRepository<PerfilRestricaoAlimentarEntity, Long> {

  @Modifying
  @Query("DELETE FROM PerfilRestricaoAlimentarEntity p WHERE p.perfil.id = :perfilId")
  void deleteByPerfilId(@Param("perfilId") Long perfilId);

}
