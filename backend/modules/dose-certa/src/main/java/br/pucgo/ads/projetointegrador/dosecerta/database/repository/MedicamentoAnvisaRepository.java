package br.pucgo.ads.projetointegrador.dosecerta.database.repository;

import br.pucgo.ads.projetointegrador.dosecerta.database.entity.MedicamentoAnvisa;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MedicamentoAnvisaRepository extends JpaRepository<MedicamentoAnvisa, Long> {

    List<MedicamentoAnvisa> findByNomeProdutoContainingIgnoreCase(String nome);

    List<MedicamentoAnvisa> findByPrincipioAtivoContainingIgnoreCase(String principio);

    List<MedicamentoAnvisa> findByNumeroRegistroProduto(String numeroRegistroProduto);

    boolean existsByNumeroRegistroProduto(String numeroRegistroProduto);

    List<MedicamentoAnvisa> findTop20ByOrderByNomeProdutoAsc();

    // Busca por nome do produto E verifica se está na Farmácia Popular
    boolean existsByNomeProdutoContainingIgnoreCaseAndFarmaciaPopularTrue(String nome);
}
