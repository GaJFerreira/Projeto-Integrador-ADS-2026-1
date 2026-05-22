package br.pucgo.ads.projetointegrador.remember.repository;

import br.pucgo.ads.projetointegrador.remember.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UsuarioRememberRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByPlatformUserId(Long platformUserId);
    boolean existsByPlatformUserId(Long platformUserId);
    // Busca pela nossa PK id_usuario
    Optional<Usuario> findByIdUsuario(Long idUsuario);
}