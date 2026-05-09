package br.pucgo.ads.projetointegrador.diario_saude.config;

import br.pucgo.ads.projetointegrador.diario_saude.entity.MedicamentoEntity;
import br.pucgo.ads.projetointegrador.diario_saude.repository.MedicamentoRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;

@Configuration
public class MedicamentosDataInitializer {

    @Bean
    CommandLineRunner initMedicamentos(MedicamentoRepository medicamentoRepository) {
        return args -> {
            if (medicamentoRepository.count() > 0) {
                System.out.println("Medicamentos já populados.");
                return;
            }

            System.out.println("Populando medicamentos...");

            try (BufferedReader br = new BufferedReader(
                    new InputStreamReader(
                            getClass().getResourceAsStream("/data/DADOS_ABERTOS_MEDICAMENTOS.csv"), "UTF-8"))) {

                br.readLine();

                String linha;
                List<MedicamentoEntity> lote = new ArrayList<>();

                while ((linha = br.readLine()) != null) {
                    String[] col = linha.split(";");
                    if (col.length < 5)
                        continue;

                    String nome = col[0].trim();
                    String principioAtivo = col[1].trim();
                    String empresa = col[2].trim();
                    String classe = col[3].trim();
                    String numeroRegistro = col[4].trim();

                    if (nome.isEmpty())
                        continue;

                    lote.add(new MedicamentoEntity(nome, principioAtivo, empresa, classe, numeroRegistro));

                    if (lote.size() >= 500) {
                        medicamentoRepository.saveAll(lote);
                        lote.clear();
                    }
                }

                if (!lote.isEmpty()) {
                    medicamentoRepository.saveAll(lote);
                }

                System.out.println("Medicamentos populados com sucesso!");

            } catch (Exception e) {
                System.err.println("Erro ao popular medicamentos: " + e.getMessage());
            }
        };
    }
}
