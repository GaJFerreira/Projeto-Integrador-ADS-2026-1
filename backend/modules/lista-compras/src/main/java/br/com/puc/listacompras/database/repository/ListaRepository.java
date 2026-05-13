package br.com.puc.listacompras.database.repository;

import br.com.puc.listacompras.database.entity.Lista;
import br.com.puc.listacompras.database.enums.StatusListaEnum;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ListaRepository extends JpaRepository<Lista, Long> {

  List<Lista> findByUsuarioId(Long usuarioId);

  List<Lista> findByUsuarioIdAndStatus(Long usuarioId, StatusListaEnum status);

  List<Lista> findByUsuarioIdAndStatusOrderByCreatedAtDesc(Long usuarioId, StatusListaEnum status);

  List<Lista> findByTemplateTrue();

  List<Lista> findByUsuarioIdAndTemplateFalse(Long usuarioId);

  List<Lista> findByUsuarioIdAndTemplateFalseOrderByCreatedAtDesc(Long usuarioId);

  List<Lista> findByTemplateTrueOrderByTituloAsc();

  List<Lista> findByUsuarioIdOrderByCreatedAtDesc(Long usuarioId);

  boolean existsByUsuarioIdAndTituloIgnoreCase(Long usuarioId, String titulo);

  List<Lista> findByTemplateTrueAndPatologiaIsNullOrderByTituloAsc();

  @Query("""
      select l
      from Lista l
      where l.template = true
        and (l.patologia is null or l.patologia.id in :patologiaIds)
      order by l.titulo asc
  """)
  List<Lista> buscarTemplatesPorPatologiasOuGenericos(@Param("patologiaIds") List<Long> patologiaIds);

}
