package br.com.puc.listacompras.database.repository;

import br.com.puc.listacompras.database.entity.UsuarioPatologia;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface UsuarioPatologiaRepository extends JpaRepository<UsuarioPatologia, Long> {

  @Query("""
      select up.patologia.id
      from UsuarioPatologia up
      where up.usuarioId = :usuarioId
  """)
  List<Long> findPatologiaIdsByUsuarioId(@Param("usuarioId") Long usuarioId);
}
