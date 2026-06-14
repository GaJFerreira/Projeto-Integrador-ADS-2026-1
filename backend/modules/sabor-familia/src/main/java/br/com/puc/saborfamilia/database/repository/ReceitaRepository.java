package br.com.puc.saborfamilia.database.repository;

import br.com.puc.saborfamilia.database.entity.ReceitaEntity;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ReceitaRepository extends JpaRepository<ReceitaEntity, Long> {

  @Query(
    """
      SELECT receita FROM ReceitaEntity receita
      LEFT JOIN FETCH receita.restricoesAlimentares restricao
      LEFT JOIN FETCH restricao.restricao
      WHERE receita.id = :receitaId
    """
  )
  Optional<ReceitaEntity> findByIdWithRestricoes(@Param("receitaId") Long receitaId);

  @Query(
    value =
      """
        SELECT *
        FROM sabor_familia.receita receita
        WHERE (:tipoRefeicao IS NULL OR receita.tipo_refeicao = :tipoRefeicao)
        AND (:titulo IS NULL OR LOWER(receita.titulo) LIKE LOWER(CONCAT('%', :titulo, '%')))
        ORDER BY receita.data_cadastro DESC, receita.id DESC
      """,
    countQuery =
      """
        SELECT COUNT(*)
        FROM sabor_familia.receita receita
        WHERE (:tipoRefeicao IS NULL OR receita.tipo_refeicao = :tipoRefeicao)
        AND (:titulo IS NULL OR LOWER(receita.titulo) LIKE LOWER(CONCAT('%', :titulo, '%')))
      """,
    nativeQuery = true
  )
  Page<ReceitaEntity> buscarExplorar(
    @Param("titulo") String titulo,
    @Param("tipoRefeicao") String tipoRefeicao,
    Pageable pageable
  );

  @Query(
    value =
      """
        SELECT receita.*
        FROM sabor_familia.receita receita
        LEFT JOIN sabor_familia.personalizacao_receita personalizacao ON personalizacao.receita_id = receita.id
        LEFT JOIN sabor_familia.personalizacao p ON p.id = personalizacao.personalizacao_id
        WHERE (:tipoRefeicao IS NULL OR receita.tipo_refeicao = :tipoRefeicao)
        AND (:titulo IS NULL OR LOWER(receita.titulo) LIKE LOWER(CONCAT('%', :titulo, '%')))
        GROUP BY receita.id
        ORDER BY
          COUNT(CASE WHEN p.codigo IN (:codigosPersonalizacao) THEN 1 END) DESC,
          receita.data_cadastro DESC,
          receita.id DESC
      """,
    countQuery =
      """
        SELECT COUNT(*)
        FROM sabor_familia.receita receita
        WHERE (:tipoRefeicao IS NULL OR receita.tipo_refeicao = :tipoRefeicao)
        AND (:titulo IS NULL OR LOWER(receita.titulo) LIKE LOWER(CONCAT('%', :titulo, '%')))
      """,
    nativeQuery = true
  )
  Page<ReceitaEntity> buscarExplorarPersonalizado(
    @Param("titulo") String titulo,
    @Param("tipoRefeicao") String tipoRefeicao,
    @Param("codigosPersonalizacao") List<String> codigosPersonalizacao,
    Pageable pageable
  );

  List<ReceitaEntity> findByPerfilIdOrderByDataCadastroDesc(Long perfilId);

  @Query(
    value =
    """
      SELECT receita FROM ReceitaEntity receita
      WHERE receita.perfil.id = :perfilId
      ORDER BY receita.dataCadastro DESC
    """,
    countQuery =
    """
      SELECT COUNT(receita) FROM ReceitaEntity receita
      WHERE receita.perfil.id = :perfilId
    """
  )
  Page<ReceitaEntity> findByPerfilId(@Param("perfilId") Long perfilId, Pageable pageable);

  @Modifying
  @Query(value = "UPDATE sabor_familia.receita SET count_curtidas = count_curtidas + 1 WHERE id = :receitaId", nativeQuery = true)
  void aumentarContadorCurtidas(@Param("receitaId") Long receitaId);

  @Modifying
  @Query(value = "UPDATE sabor_familia.receita SET count_curtidas = GREATEST(0, count_curtidas - 1) WHERE id = :receitaId", nativeQuery = true)
  void reduzirContadorCurtidas(@Param("receitaId") Long receitaId);

  @Modifying
  @Query(value = "UPDATE sabor_familia.receita SET count_comentarios = count_comentarios + 1 WHERE id = :receitaId", nativeQuery = true)
  void aumentarContadorComentarios(@Param("receitaId") Long receitaId);

  @Modifying
  @Query(value = "UPDATE sabor_familia.receita SET count_comentarios = GREATEST(0, count_comentarios - 1) WHERE id = :receitaId", nativeQuery = true)
  void reduzirContadorComentarios(@Param("receitaId") Long receitaId);

}

