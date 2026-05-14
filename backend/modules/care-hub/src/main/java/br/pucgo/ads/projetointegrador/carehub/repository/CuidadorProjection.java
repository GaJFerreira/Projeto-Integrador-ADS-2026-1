package br.pucgo.ads.projetointegrador.carehub.repository;

/**
 * Projeção de Cuidador para queries nativas que retornam apenas colunas selecionadas.
 *
 * <p>Os nomes dos métodos devem corresponder exatamente aos aliases definidos
 * nas queries nativas em {@link CuidadorRepository}.
 */
public interface CuidadorProjection {
    Long getId();
    String getName();
    String getEmail();
    String getPhone();
    String getExperiencia();
    String getCidade();
    String getEstado();
    Boolean getDisponibilidade();
    java.math.BigDecimal getTaxaHora();
    java.math.BigDecimal getAvaliacaoMedia();
    Integer getTotalAvaliacoes();
    String getBiografia();
    String getFotoPerfil();
    java.time.Instant getCreatedAt();
    Boolean getAtivo();
}
