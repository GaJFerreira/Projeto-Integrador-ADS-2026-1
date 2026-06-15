package br.pucgo.ads.projetointegrador.carehub.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.pucgo.ads.projetointegrador.carehub.dto.prontuario.ProntuarioRequestDTO;
import br.pucgo.ads.projetointegrador.carehub.dto.prontuario.ProntuarioResponseDTO;
import br.pucgo.ads.projetointegrador.carehub.entity.Cliente;
import br.pucgo.ads.projetointegrador.carehub.entity.Prontuario;
import br.pucgo.ads.projetointegrador.carehub.repository.ClienteRepository;
import br.pucgo.ads.projetointegrador.carehub.repository.ProntuarioRepository;

import java.util.Objects;
import java.util.Optional;

@Slf4j
@Service
public class ProntuarioService {

    @Autowired
    private ProntuarioRepository prontuarioRepository;

    @Autowired
    private ClienteRepository clienteRepository;

    @Transactional
    public ProntuarioResponseDTO criarProntuario(ProntuarioRequestDTO dto) {
        Long clienteId = Objects.requireNonNull(dto.getClienteId(), "Cliente ID não pode ser null");

        log.info("[Prontuario] Criando prontuário para clienteId={}", clienteId);

        // 1ª tentativa: buscar por platformUserId (nova arquitetura)
        Optional<Cliente> clienteOpt = clienteRepository.findByPlatformUserId(clienteId);
        if (clienteOpt.isEmpty()) {
            // Fallback: buscar por localId (dados legados ou ID local enviado pelo front)
            log.warn("[Prontuario] Cliente NÃO encontrado por platformUserId={}. Tentando por localId...", clienteId);
            clienteOpt = clienteRepository.findById(clienteId);
        }

        Cliente cliente = clienteOpt
                .orElseThrow(() -> new RuntimeException(
                        "Cliente não encontrado para clienteId=" + clienteId));

        log.info("[Prontuario] Cliente encontrado: localId={}, platformUserId={}, nome={}",
                cliente.getId(), cliente.getPlatformUserId(), cliente.getName());

        // Verificar se já existe prontuário para esse cliente (evitar duplicata)
        Optional<Prontuario> existente = prontuarioRepository.findByClienteId(cliente.getId());
        if (existente.isPresent()) {
            log.warn("[Prontuario] Já existe prontuário (id={}) para cliente localId={}. Atualizando dados recebidos.",
                    existente.get().getId(), cliente.getId());
            Prontuario prontuario = existente.get();
            aplicarDados(dto, prontuario);
            prontuario = prontuarioRepository.save(prontuario);
            return toResponseDTO(prontuario);
        }

        Prontuario prontuario = new Prontuario();
        prontuario.setCliente(cliente);
        aplicarDados(dto, prontuario);

        prontuario = prontuarioRepository.save(prontuario);

        log.info("[Prontuario] Prontuário criado com id={}", prontuario.getId());
        return toResponseDTO(prontuario);
    }

    @Transactional
    public ProntuarioResponseDTO atualizarProntuario(Long id, ProntuarioRequestDTO dto) {
        Objects.requireNonNull(id, "Prontuario ID não pode ser null");

        Prontuario prontuario = prontuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Prontuário não encontrado"));

        aplicarDados(dto, prontuario);

        prontuario = prontuarioRepository.save(prontuario);

        return toResponseDTO(prontuario);
    }

    @Transactional(readOnly = true)
    public ProntuarioResponseDTO buscarPorId(Long id) {
        Objects.requireNonNull(id, "Prontuario ID não pode ser null");

        return prontuarioRepository.findById(id)
                .map(this::toResponseDTO)
                .orElse(null);
    }

    @Transactional(readOnly = true)
    public ProntuarioResponseDTO buscarPorClienteId(Long clienteId) {
        log.info("[Prontuario] Buscando prontuário para clienteId={}", clienteId);

        // 1ª tentativa: buscar pelo platformUserId do cliente (nova arquitetura)
        Optional<Prontuario> prontuarioOpt = prontuarioRepository.findByCliente_PlatformUserId(clienteId);
        if (prontuarioOpt.isPresent()) {
            log.info("[Prontuario] Encontrado via platformUserId={}", clienteId);
            return toResponseDTO(prontuarioOpt.get());
        }

        log.warn("[Prontuario] Não encontrado via platformUserId={}. Tentando fallbacks...", clienteId);

        // 2ª tentativa: o clienteId recebido pode ser o localId (dados legados)
        // Busca direto pelo localId na tabela de prontuários
        prontuarioOpt = prontuarioRepository.findByClienteId(clienteId);
        if (prontuarioOpt.isPresent()) {
            log.info("[Prontuario] Encontrado via localId={}", clienteId);
            return toResponseDTO(prontuarioOpt.get());
        }

        // 3ª tentativa: buscar cliente por platformUserId e usar seu localId
        Optional<Cliente> clientePlatformOpt = clienteRepository.findByPlatformUserId(clienteId);
        if (clientePlatformOpt.isPresent()) {
            Long localId = clientePlatformOpt.get().getId();
            log.info("[Prontuario] Cliente encontrado por platformUserId={}, localId={}. Buscando prontuário por localId...",
                    clienteId, localId);
            prontuarioOpt = prontuarioRepository.findByClienteId(localId);
            if (prontuarioOpt.isPresent()) {
                log.info("[Prontuario] Encontrado via cliente.platformUserId={} -> cliente.localId={}", clienteId, localId);
                return toResponseDTO(prontuarioOpt.get());
            }
        }

        // 4ª tentativa: o clienteId é um localId do cliente, verificar seu platformUserId
        Optional<Cliente> clienteLocalOpt = clienteRepository.findById(clienteId);
        if (clienteLocalOpt.isPresent()) {
            Long plId = clienteLocalOpt.get().getPlatformUserId();
            log.info("[Prontuario] Cliente por localId={} tem platformUserId={}. Buscando prontuário por platformUserId...",
                    clienteId, plId);
            if (plId != null) {
                prontuarioOpt = prontuarioRepository.findByCliente_PlatformUserId(plId);
                if (prontuarioOpt.isPresent()) {
                    log.info("[Prontuario] Encontrado via cliente.localId={} -> platformUserId={}", clienteId, plId);
                    return toResponseDTO(prontuarioOpt.get());
                }
            }
        }

        log.warn("[Prontuario] NENHUM prontuário encontrado para clienteId={} (todas as estratégias falharam)", clienteId);
        return null;
    }

    private void aplicarDados(ProntuarioRequestDTO dto, Prontuario prontuario) {
        prontuario.setDataNascimento(dto.getDataNascimento());
        prontuario.setHistoricoMedico(dto.getHistoricoMedico());
        prontuario.setMedicamentosUso(dto.getMedicamentosUso());
        prontuario.setAlergias(dto.getAlergias());
        prontuario.setContatoEmergencia(dto.getContatoEmergencia());
        prontuario.setObservacoesGerais(dto.getObservacoesGerais());
        prontuario.setTipoSanguineo(dto.getTipoSanguineo());
        prontuario.setNecessidadesEspeciais(dto.getNecessidadesEspeciais());
    }

    private ProntuarioResponseDTO toResponseDTO(Prontuario prontuario) {
        ProntuarioResponseDTO dto = new ProntuarioResponseDTO();
        dto.setId(prontuario.getId());
        // Retornar o platformUserId se disponível; caso contrário, localId (compatibilidade)
        Long clientePlatformId = prontuario.getCliente().getPlatformUserId();
        dto.setClienteId(clientePlatformId != null ? clientePlatformId : prontuario.getCliente().getId());
        dto.setClienteNome(prontuario.getCliente().getName());
        dto.setDataNascimento(prontuario.getDataNascimento());
        dto.setHistoricoMedico(prontuario.getHistoricoMedico());
        dto.setMedicamentosUso(prontuario.getMedicamentosUso());
        dto.setAlergias(prontuario.getAlergias());
        dto.setContatoEmergencia(prontuario.getContatoEmergencia());
        dto.setObservacoesGerais(prontuario.getObservacoesGerais());
        dto.setTipoSanguineo(prontuario.getTipoSanguineo());
        dto.setNecessidadesEspeciais(prontuario.getNecessidadesEspeciais());
        dto.setDataCriacao(prontuario.getDataCriacao());
        dto.setDataAtualizacao(prontuario.getDataAtualizacao());
        return dto;
    }
}
