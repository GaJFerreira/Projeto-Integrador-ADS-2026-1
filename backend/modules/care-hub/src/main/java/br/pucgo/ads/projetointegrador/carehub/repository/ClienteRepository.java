package br.pucgo.ads.projetointegrador.carehub.repository;

import br.pucgo.ads.projetointegrador.carehub.entity.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClienteRepository extends JpaRepository<Cliente, Long> {

    /** Clientes ativos (sem soft-delete). */
    List<Cliente> findByDeletedAtIsNull();

    boolean existsByUsername(String username);

    Optional<Cliente> findByUsername(String username);
    Optional<Cliente> findByEmail(String email);

    Optional<Cliente> findByPlatformUserId(Long platformUserId);
}
