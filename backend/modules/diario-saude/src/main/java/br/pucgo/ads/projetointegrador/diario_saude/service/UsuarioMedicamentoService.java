package br.pucgo.ads.projetointegrador.diario_saude.service;

import br.pucgo.ads.projetointegrador.diario_saude.entity.UsuarioEntity;
import br.pucgo.ads.projetointegrador.diario_saude.entity.UsuarioMedicamentoEntity;
import br.pucgo.ads.projetointegrador.diario_saude.repository.UsuarioMedicamentoRepository;
import br.pucgo.ads.projetointegrador.diario_saude.repository.UsuarioRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UsuarioMedicamentoService {

    @Autowired
    private UsuarioMedicamentoRepository repo;

    @Autowired
    private UsuarioRepository usuarioRepository;

    public UsuarioMedicamentoEntity adicionar(Long usuarioId, String nome_medicamento,
            String principio_ativo, String concentracao, String via,
            String dosagem, String frequencia) {

        UsuarioEntity usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        return repo.save(new UsuarioMedicamentoEntity(
                usuario, nome_medicamento, principio_ativo,
                concentracao, via, dosagem, frequencia));
    }

    public List<UsuarioMedicamentoEntity> listarPorUsuario(Long usuarioId) {
        return repo.findByUsuario_IdUsuario(usuarioId);
    }

    public void remover(Long id) {
        repo.delete(repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Medicamento não encontrado")));
    }
}
