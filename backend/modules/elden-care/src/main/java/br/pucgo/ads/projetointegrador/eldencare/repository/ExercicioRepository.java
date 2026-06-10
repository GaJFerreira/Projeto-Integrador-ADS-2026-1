package br.pucgo.ads.projetointegrador.eldencare.repository;

import br.pucgo.ads.projetointegrador.eldencare.domain.ex_exercicio;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ExercicioRepository extends JpaRepository<ex_exercicio, UUID> {

    Optional<ex_exercicio> findByNome(String nome);

    Optional<ex_exercicio> findByNomeIgnoreCase(String nome);
}
