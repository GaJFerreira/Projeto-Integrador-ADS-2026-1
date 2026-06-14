package br.pucgo.ads.projetointegrador.dosecerta.service;

import br.pucgo.ads.projetointegrador.dosecerta.dto.ContatoEmergenciaDTO;
import br.pucgo.ads.projetointegrador.dosecerta.database.entity.ContatoEmergencia;
import br.pucgo.ads.projetointegrador.dosecerta.database.repository.ContatoEmergenciaRepository;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ContatoEmergenciaService {

    private final ContatoEmergenciaRepository repository;

    public ContatoEmergenciaService(ContatoEmergenciaRepository repository) {
        this.repository = repository;
    }

    // ======================
    // LISTAR POR USUÁRIO
    // ======================
    public List<ContatoEmergencia> listarPorUsuario(Long platformUserId) {
        return repository.findByPlatformUserId(platformUserId);
    }

    // ======================
    // BUSCAR POR ID
    // ======================
    public ContatoEmergencia buscarPorId(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Contato não encontrado!"));
    }

    // ======================
    // CRIAR USANDO DTO (RECOMENDADO)
    // ======================
    @Transactional
    public ContatoEmergencia criar(ContatoEmergenciaDTO dto, Long platformUserId) {


        // 2️⃣ Evita duplicidade de telefone
        boolean existeTelefone = repository.existsByPlatformUserIdAndTelefone(platformUserId, dto.getTelefone());
        if (existeTelefone) {
            throw new IllegalArgumentException("Já existe um contato com este telefone para o usuário.");
        }

        // 3️⃣ Criar entidade
        ContatoEmergencia contato = new ContatoEmergencia();
        contato.setPlatformUserId(platformUserId);
        contato.setNome(dto.getNome());
        contato.setTelefone(dto.getTelefone());
        contato.setRelacao(dto.getRelacao());

        // 4️⃣ Persistir
        return repository.save(contato);
    }

    // ======================
    // ATUALIZAR USANDO DTO (NOVO MÉTODO)
    // ======================
    @Transactional
    public ContatoEmergencia atualizar(Long id, ContatoEmergenciaDTO dto) {

        // 1️⃣ Busca o contato existente
        ContatoEmergencia contato = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Contato não encontrado!"));

        Long platformUserId = contato.getPlatformUserId();

        // 2️⃣ Verifica duplicidade de telefone (somente se for alterar)
        boolean telefoneJaExiste = repository.existsByPlatformUserIdAndTelefone(platformUserId, dto.getTelefone());

        if (telefoneJaExiste && !contato.getTelefone().equals(dto.getTelefone())) {
            throw new IllegalArgumentException("Já existe outro contato com este telefone para o usuário.");
        }

        // 3️⃣ Atualiza dados
        contato.setNome(dto.getNome());
        contato.setTelefone(dto.getTelefone());
        contato.setRelacao(dto.getRelacao());

        // 4️⃣ Salva
        return repository.save(contato);
    }


    // ======================
    // EXCLUIR
    // ======================
    @Transactional
    public void excluir(Long id) {
        ContatoEmergencia contato = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Contato não encontrado!"));
        repository.delete(contato);
    }
}
