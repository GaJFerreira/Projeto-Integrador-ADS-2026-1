package br.pucgo.ads.projetointegrador.carehub.repository;

import br.pucgo.ads.projetointegrador.carehub.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repositório local de Usuários do módulo CareHub.
 *
 * <p><strong>Mudança de arquitetura:</strong> anteriormente operava sobre
 * {@code plataforma.entity.User}. Agora opera exclusivamente sobre
 * {@link Usuario} local (schema {@code care_hub}).
 *
 * <p>A sincronização entre {@code plataforma.users} e {@code care_hub.usuario}
 * é feita nos services (ClienteService / CuidadorService) via espelhamento
 * automático no momento da criação do perfil.
 */
@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByEmail(String email);

    Optional<Usuario> findByUsername(String username);

    Optional<Usuario> findByUsernameOrEmail(String username, String email);

    Optional<Usuario> findByPlatformUserId(Long platformUserId);

    boolean existsByEmail(String email);

    boolean existsByUsername(String username);

    boolean existsByPlatformUserId(Long platformUserId);
}
