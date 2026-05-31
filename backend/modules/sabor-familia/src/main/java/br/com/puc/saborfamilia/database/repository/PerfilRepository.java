package br.com.puc.saborfamilia.database.repository;

import br.com.puc.saborfamilia.database.entity.PerfilEntity;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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

  @Query(
    value =
      """
        SELECT *
        FROM sabor_familia.perfil perfil
        WHERE perfil.id <> :perfilIdExcluir
        AND (:nome IS NULL OR perfil.nome LIKE CONCAT('%', :nome, '%'))
        ORDER BY perfil.data_cadastro DESC, perfil.id DESC
      """,
    countQuery =
      """
        SELECT COUNT(*)
        FROM sabor_familia.perfil perfil
        WHERE perfil.id <> :perfilIdExcluir
        AND (:nome IS NULL OR perfil.nome LIKE CONCAT('%', :nome, '%'))
      """,
    nativeQuery = true
  )
  Page<PerfilEntity> buscarExplorar(
    @Param("perfilIdExcluir") Long perfilIdExcluir,
    @Param("nome") String nome,
    Pageable pageable
  );

  @Query(
    value =
      """
        SELECT perfil.*
        FROM sabor_familia.perfil perfil
        LEFT JOIN sabor_familia.personalizacao_perfil personalizacaoPerfil ON personalizacaoPerfil.perfil_id = perfil.id
        LEFT JOIN sabor_familia.personalizacao personalizacao ON personalizacao.id = personalizacaoPerfil.personalizacao_id
        WHERE perfil.id <> :perfilIdExcluir
        AND (:nome IS NULL OR perfil.nome LIKE CONCAT('%', :nome, '%'))
        GROUP BY perfil.id
        ORDER BY
          COUNT(CASE WHEN personalizacao.codigo IN (:codigosPersonalizacao) THEN 1 END) DESC,
          perfil.data_cadastro DESC,
          perfil.id DESC
      """,
    countQuery =
      """
        SELECT COUNT(*)
        FROM sabor_familia.perfil perfil
        WHERE perfil.id <> :perfilIdExcluir
        AND (:nome IS NULL OR perfil.nome LIKE CONCAT('%', :nome, '%'))
      """,
    nativeQuery = true
  )
  Page<PerfilEntity> buscarExplorarPersonalizado(
    @Param("perfilIdExcluir") Long perfilIdExcluir,
    @Param("nome") String nome,
    @Param("codigosPersonalizacao") List<String> codigosPersonalizacao,
    Pageable pageable
  );

}

