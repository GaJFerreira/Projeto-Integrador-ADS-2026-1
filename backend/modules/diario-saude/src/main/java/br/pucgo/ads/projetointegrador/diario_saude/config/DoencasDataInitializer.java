package br.pucgo.ads.projetointegrador.diario_saude.config;

import br.pucgo.ads.projetointegrador.diario_saude.entity.DoencasEntity;
import br.pucgo.ads.projetointegrador.diario_saude.repository.DoencaRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.BufferedReader;
import java.io.InputStreamReader;

@Configuration
public class DoencasDataInitializer {

    @Bean
    CommandLineRunner initDoencas(DoencaRepository doencaRepository) {
        return args -> {
            if (doencaRepository.count() > 0) {
                System.out.println("Doenças já populadas.");
                return;
            }

            System.out.println("[Doenças] Tabela vazia — iniciando importação do CSV...");

            try (BufferedReader br = new BufferedReader(new InputStreamReader(
                    DoencasDataInitializer.class.getResourceAsStream("/data/doencas.csv"),
                    "Windows-1252"))) {

                String linha;
                boolean primeira = true;
                int contador = 0;

                while ((linha = br.readLine()) != null) {
                    if (primeira) {
                        primeira = false;
                        if (linha.toUpperCase().contains("SUBCAT") || linha.toUpperCase().contains("DESCRICAO")) {
                            continue;
                        }
                    }

                    if (linha.trim().isEmpty())
                        continue;

                    String[] colunas = linha.split(";", -1);

                    String codigo = colunas.length > 0 ? colunas[0].trim() : null;
                    String categoria = colunas.length > 1 ? colunas[1].trim() : null;
                    String restrSexo = colunas.length > 2 ? colunas[2].trim() : null;
                    String causaObito = colunas.length > 3 ? colunas[3].trim() : null;
                    String nome = colunas.length > 4 ? colunas[4].trim() : null;
                    String nomeAbrev = colunas.length > 5 ? colunas[5].trim() : null;

                    if (codigo == null || codigo.isEmpty())
                        continue;
                    if (nome == null || nome.isEmpty())
                        continue;

                    if (doencaRepository.findByCodigo(codigo).isPresent())
                        continue;

                    DoencasEntity d = new DoencasEntity();
                    d.setCodigo(codigo);
                    d.setCategoria(categoria);
                    d.setRestricaoSexo(restrSexo);
                    d.setCausaObito(causaObito);
                    d.setNome(nome);
                    d.setNomeAbreviado(nomeAbrev);

                    doencaRepository.save(d);
                    contador++;
                }

                System.out.println("[Doenças] Importação concluída! " + contador + " doenças inseridas.");

            } catch (Exception e) {
                System.err.println("[Doenças] Erro ao importar CSV: " + e.getMessage());
            }
        };
    }
}
