package br.pucgo.ads.projetointegrador.carehub.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.pucgo.ads.projetointegrador.carehub.entity.Usuario;
import br.pucgo.ads.projetointegrador.carehub.repository.CareHubUsuarioRepository;

import java.util.List;
import java.util.Objects;

@Service
public class AdminService {

    @Autowired
    private CareHubUsuarioRepository careHubUsuarioRepository;

    public List<Usuario> listarTodosUsuarios() {
        return careHubUsuarioRepository.findAll();
    }

    public Usuario buscarUsuarioPorId(Long id) {
        Objects.requireNonNull(id, "id não pode ser nulo");
        return careHubUsuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
    }

    @Transactional
    public Usuario alterarStatusUsuario(Long id, Boolean ativo) {
        Objects.requireNonNull(id, "id não pode ser nulo");
        Objects.requireNonNull(ativo, "ativo não pode ser nulo");
        Usuario usuario = careHubUsuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        // Use local Usuario fields: setStatus / setAtivo / setDeletedAt
        usuario.setStatus(ativo ? "ACTIVE" : "INACTIVE");
        usuario.setAtivo(ativo);
        if (!ativo) {
            usuario.setDeletedAt(java.time.OffsetDateTime.now(java.time.ZoneOffset.UTC));
        } else {
            usuario.setDeletedAt(null);
        }
        return careHubUsuarioRepository.save(Objects.requireNonNull(usuario));
    }

    @Transactional
    public void deletarUsuario(Long id) {
        Objects.requireNonNull(id, "id não pode ser nulo");
        Usuario usuario = careHubUsuarioRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        careHubUsuarioRepository.delete(Objects.requireNonNull(usuario));
    }
}
