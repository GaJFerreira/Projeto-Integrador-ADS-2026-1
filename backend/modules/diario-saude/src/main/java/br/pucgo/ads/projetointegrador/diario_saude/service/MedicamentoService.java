package br.pucgo.ads.projetointegrador.diario_saude.service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import br.pucgo.ads.projetointegrador.diario_saude.dto.MedicamentoDTO;
import br.pucgo.ads.projetointegrador.diario_saude.entity.MedicamentoEntity;
import br.pucgo.ads.projetointegrador.diario_saude.repository.MedicamentoRepository;

@Service
public class MedicamentoService {

    @Autowired
    private MedicamentoRepository medicamentoRepository;

    public List<MedicamentoDTO> listarTodos() {
        return medicamentoRepository.findAll().stream().map(MedicamentoDTO::new).toList();
    }

    public void inserir(MedicamentoDTO medicamento) {
        medicamentoRepository.save(new MedicamentoEntity(medicamento));
    }

    public MedicamentoDTO alterar(MedicamentoDTO medicamento) {
        return new MedicamentoDTO(medicamentoRepository.save(new MedicamentoEntity(medicamento)));
    }

    public void excluir(Long id) {
        medicamentoRepository.delete(medicamentoRepository.findById(id).get());
    }

    public MedicamentoDTO buscarPorId(Long id) {
        return new MedicamentoDTO(medicamentoRepository.findById(id).get());
    }

    public void importarCSV(MultipartFile file) {
        try (BufferedReader br = new BufferedReader(
                new InputStreamReader(file.getInputStream(), "UTF-8"))) {

            br.readLine(); // pula cabeçalho

            String linha;
            List<MedicamentoEntity> lote = new java.util.ArrayList<>();

            while ((linha = br.readLine()) != null) {
                String[] col = linha.split(";");
                if (col.length < 5)
                    continue; // ✅ novo CSV tem 5 colunas

                String nome = col[0].trim();
                String principioAtivo = col[1].trim();
                String empresa = col[2].trim();
                String classe = col[3].trim();
                String numeroRegistro = col[4].trim();

                if (nome.isEmpty())
                    continue;

                if (!medicamentoRepository.existsByNome(nome)) {
                    lote.add(new MedicamentoEntity(nome, principioAtivo, empresa, classe, numeroRegistro));
                }

                // ✅ salva em lotes de 500
                if (lote.size() >= 500) {
                    medicamentoRepository.saveAll(lote);
                    lote.clear();
                }
            }

            if (!lote.isEmpty()) {
                medicamentoRepository.saveAll(lote);
            }

        } catch (Exception e) {
            throw new RuntimeException("Erro ao importar CSV de medicamentos: " + e.getMessage(), e);
        }
    }
}
