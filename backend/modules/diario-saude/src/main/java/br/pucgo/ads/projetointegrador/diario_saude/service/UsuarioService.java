package br.pucgo.ads.projetointegrador.diario_saude.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import br.pucgo.ads.projetointegrador.diario_saude.repository.UsuarioRepository;
import br.pucgo.ads.projetointegrador.diario_saude.dto.UsuarioDTO;
import br.pucgo.ads.projetointegrador.diario_saude.entity.UsuarioEntity;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    public List<UsuarioDTO> listarTodos() {
        return usuarioRepository.findAll().stream().map(UsuarioDTO::new).toList();
    }

    public void inserir(UsuarioDTO usuario) {
        UsuarioEntity usuarioEntity = new UsuarioEntity(usuario);
        if (usuario.getPlatformUserId() != null) {
            usuarioEntity.setPlatformUserId(usuario.getPlatformUserId());
        }
        usuarioRepository.save(usuarioEntity);
    }

    public UsuarioDTO alterar(UsuarioDTO usuario) {
        UsuarioEntity entity = usuarioRepository.findByPlatformUserId(usuario.getPlatformUserId())
                .orElseThrow(() -> new RuntimeException(
                        "Paciente não encontrado para platformUserId: " + usuario.getPlatformUserId()));

        entity.setNome(usuario.getNome());
        entity.setIdade(usuario.getIdade());
        entity.setPeso(usuario.getPeso());
        entity.setAltura(usuario.getAltura());

        return new UsuarioDTO(usuarioRepository.save(entity));
    }

    public void excluir(Long id) {
        usuarioRepository.deleteById(id);
    }

    public UsuarioDTO buscarPorId(Long id) {
        return new UsuarioDTO(usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado: id=" + id)));
    }

    /**
     * Busca ou cria o registro clínico do paciente no módulo diario-saude.
     * @param platformUserId ID do usuário na plataforma
     * @param nome Nome a usar na criação (pode ser null; será preenchido pelo médico depois)
     */
    public UsuarioEntity buscarOuCriarPaciente(Long platformUserId, String nome) {
        Optional<UsuarioEntity> existente = usuarioRepository.findByPlatformUserId(platformUserId);
        if (existente.isPresent()) {
            return existente.get();
        }

        UsuarioEntity entity = new UsuarioEntity();
        entity.setPlatformUserId(platformUserId);
        entity.setNome(nome != null ? nome : "");
        entity.setIdade(0);
        entity.setPeso(0);
        entity.setAltura(0);

        return usuarioRepository.save(entity);
    }
}
