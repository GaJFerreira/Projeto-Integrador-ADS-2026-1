package br.pucgo.ads.projetointegrador.dosecerta.database.repository;

import br.pucgo.ads.projetointegrador.dosecerta.database.entity.ContatoEmergencia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContatoEmergenciaRepository extends JpaRepository<ContatoEmergencia, Long> {

    // Lista todos os contatos de um usuário
    List<ContatoEmergencia> findByPlatformUserId(Long platformUserId);

    // Verifica se já existe contato com mesmo telefone para o mesmo usuário
    boolean existsByPlatformUserIdAndTelefone(Long platformUserId, String telefone);
}
