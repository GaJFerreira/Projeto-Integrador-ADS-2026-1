package br.com.puc.listacompras.config;

import br.com.puc.listacompras.database.entity.Categoria;
import br.com.puc.listacompras.database.entity.Produto;
import br.com.puc.listacompras.database.repository.CategoriaRepository;
import br.com.puc.listacompras.database.repository.ProdutoRepository;
import java.math.BigDecimal;
import java.text.Normalizer;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

/**
 * Popula categorias e ~20 produtos comuns com tabela nutricional e custo medio
 * de mercado, apenas se o catalogo estiver vazio.
 *
 * Ligado por default (matchIfMissing=true) — para desligar, defina no
 * application.properties da plataforma OU via variavel de ambiente:
 *   listacompras.seed.enabled=false
 *   LISTACOMPRAS_SEED_ENABLED=false
 *
 * Fontes nutricionais: aproximacoes da Tabela TACO (UNICAMP) / USDA por 100g.
 * Custos: medias de mercado em BRL (referencia de dev, ajustaveis no admin).
 */
@Slf4j
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(
    prefix = "listacompras.seed",
    name = "enabled",
    havingValue = "true",
    matchIfMissing = true
)
public class ListaComprasDataInitializer implements CommandLineRunner {

  private final ProdutoRepository produtoRepository;
  private final CategoriaRepository categoriaRepository;

  @Override
  public void run(String... args) {
    try {
      Map<String, Categoria> categorias = garantirCategorias();
      if (produtoRepository.count() == 0) {
        criarProdutosBase(categorias);
        log.info("ListaComprasDataInitializer: catalogo inicial de produtos criado.");
      } else {
        log.info("ListaComprasDataInitializer: catalogo ja possui produtos, seed ignorado.");
      }
    } catch (Exception e) {
      log.warn("ListaComprasDataInitializer ignorado por falha nao critica: {}", e.getMessage());
    }
  }

  private Map<String, Categoria> garantirCategorias() {
    Map<String, String> catalogo = new LinkedHashMap<>();
    catalogo.put("Graos e Cereais", "Arroz, feijao, aveia e similares");
    catalogo.put("Hortifruti", "Frutas, verduras e legumes");
    catalogo.put("Carnes e Ovos", "Proteinas animais frescas");
    catalogo.put("Laticinios", "Leite, queijos e derivados");
    catalogo.put("Paes e Massas", "Paes, massas e farinaceos");
    catalogo.put("Oleos e Gorduras", "Oleos vegetais e azeites");
    catalogo.put("Bebidas", "Aguas, sucos e similares");

    Map<String, Categoria> resultado = new LinkedHashMap<>();
    for (Map.Entry<String, String> e : catalogo.entrySet()) {
      Categoria c = categoriaRepository.findByNomeIgnoreCase(e.getKey())
          .orElseGet(() -> {
            Categoria nova = new Categoria();
            nova.setNome(e.getKey());
            nova.setDescricao(e.getValue());
            return categoriaRepository.save(nova);
          });
      resultado.put(e.getKey(), c);
    }
    return resultado;
  }

  private void criarProdutosBase(Map<String, Categoria> cat) {
    LocalDateTime agora = LocalDateTime.now();

    // (nome, categoria, marca, unidade, custoMedio, porcao_g, kcal, prot, carb, gord, gordSat, fibra, sodio_mg, acucar)
    salvar("Arroz branco tipo 1", cat.get("Graos e Cereais"), null, "kg", "8.50",
        "100", "128", "2.5", "28.1", "0.2", "0.1", "1.6", "1", "0", agora);
    salvar("Feijao carioca", cat.get("Graos e Cereais"), null, "kg", "9.20",
        "100", "76", "4.8", "13.6", "0.5", "0.1", "8.5", "2", "0.3", agora);
    salvar("Aveia em flocos", cat.get("Graos e Cereais"), null, "kg", "12.00",
        "30", "118", "4.0", "20.4", "2.4", "0.5", "2.8", "1", "0.3", agora);
    salvar("Macarrao espaguete", cat.get("Paes e Massas"), null, "kg", "6.80",
        "100", "371", "13.0", "75.0", "1.5", "0.3", "3.2", "5", "2.5", agora);
    salvar("Pao frances", cat.get("Paes e Massas"), null, "un", "0.80",
        "50", "150", "4.0", "29.5", "1.5", "0.3", "1.6", "324", "0.6", agora);

    salvar("Banana prata", cat.get("Hortifruti"), null, "kg", "5.90",
        "100", "98", "1.3", "26.0", "0.1", "0.0", "2.0", "0", "12.2", agora);
    salvar("Maca", cat.get("Hortifruti"), null, "kg", "9.90",
        "100", "56", "0.3", "15.2", "0.0", "0.0", "1.3", "0", "10.4", agora);
    salvar("Tomate", cat.get("Hortifruti"), null, "kg", "7.50",
        "100", "15", "1.1", "3.1", "0.2", "0.0", "1.2", "4", "2.5", agora);
    salvar("Cenoura", cat.get("Hortifruti"), null, "kg", "4.50",
        "100", "34", "1.3", "7.7", "0.2", "0.0", "3.2", "65", "3.7", agora);
    salvar("Alface lisa", cat.get("Hortifruti"), null, "un", "3.50",
        "100", "11", "1.4", "1.7", "0.2", "0.0", "1.8", "10", "0.8", agora);
    salvar("Batata inglesa", cat.get("Hortifruti"), null, "kg", "6.20",
        "100", "52", "1.2", "11.9", "0.0", "0.0", "1.3", "2", "0.5", agora);

    salvar("Peito de frango sem osso", cat.get("Carnes e Ovos"), null, "kg", "22.90",
        "100", "159", "32.0", "0.0", "3.0", "0.9", "0.0", "77", "0.0", agora);
    salvar("Carne moida bovina (acem)", cat.get("Carnes e Ovos"), null, "kg", "32.50",
        "100", "212", "26.7", "0.0", "11.0", "4.6", "0.0", "72", "0.0", agora);
    salvar("Ovo de galinha", cat.get("Carnes e Ovos"), null, "duzia", "11.50",
        "50", "70", "6.0", "0.6", "5.0", "1.6", "0.0", "62", "0.6", agora);

    salvar("Leite integral UHT", cat.get("Laticinios"), null, "L", "5.20",
        "200", "122", "6.4", "9.4", "6.4", "4.0", "0.0", "100", "9.0", agora);
    salvar("Queijo muzzarela", cat.get("Laticinios"), null, "kg", "39.90",
        "30", "85", "6.7", "0.9", "6.0", "3.7", "0.0", "163", "0.3", agora);
    salvar("Iogurte natural", cat.get("Laticinios"), null, "un", "3.90",
        "170", "100", "5.5", "11.0", "3.5", "2.1", "0.0", "70", "10.5", agora);

    salvar("Oleo de soja", cat.get("Oleos e Gorduras"), null, "L", "8.50",
        "13", "115", "0.0", "0.0", "13.0", "1.8", "0.0", "0", "0.0", agora);
    salvar("Azeite de oliva extra virgem", cat.get("Oleos e Gorduras"), null, "L", "29.90",
        "13", "115", "0.0", "0.0", "13.0", "1.9", "0.0", "0", "0.0", agora);

    salvar("Agua mineral sem gas", cat.get("Bebidas"), null, "L", "2.50",
        "200", "0", "0.0", "0.0", "0.0", "0.0", "0.0", "1", "0.0", agora);
  }

  private void salvar(String nome, Categoria categoria, String marca, String unidade, String custo,
      String porcao, String kcal, String prot, String carb, String gord, String gordSat,
      String fibra, String sodio, String acucar, LocalDateTime quando) {
    Produto p = new Produto();
    p.setNome(nome);
    p.setNomeNormalizado(normalizarNome(nome));
    p.setCategoria(categoria);
    p.setMarca(marca);
    p.setUnidadeMedida(unidade);
    p.setCustoMedio(new BigDecimal(custo));
    p.setCustoMedioAtualizadoEm(quando);
    p.setPorcaoReferenciaGramas(new BigDecimal(porcao));
    p.setCalorias(new BigDecimal(kcal));
    p.setProteinas(new BigDecimal(prot));
    p.setCarboidratos(new BigDecimal(carb));
    p.setGordurasTotais(new BigDecimal(gord));
    p.setGordurasSaturadas(new BigDecimal(gordSat));
    p.setFibras(new BigDecimal(fibra));
    p.setSodio(new BigDecimal(sodio));
    p.setAcucares(new BigDecimal(acucar));
    p.setAtivo(true);
    p.setIsPersonalizado(false);
    produtoRepository.save(p);
  }

  private String normalizarNome(String nome) {
    if (nome == null) return null;
    return Normalizer.normalize(nome, Normalizer.Form.NFD)
        .replaceAll("[\\p{InCombiningDiacriticalMarks}]", "")
        .toLowerCase()
        .trim();
  }
}
