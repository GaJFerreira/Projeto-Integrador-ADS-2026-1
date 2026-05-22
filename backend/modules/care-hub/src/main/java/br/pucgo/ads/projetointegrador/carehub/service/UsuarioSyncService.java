package br.pucgo.ads.projetointegrador.carehub.service;

import br.pucgo.ads.projetointegrador.carehub.dto.perfil.PerfilRequestDTO;
import br.pucgo.ads.projetointegrador.carehub.dto.perfil.PerfilResponseDTO;
import br.pucgo.ads.projetointegrador.carehub.entity.Cliente;
import br.pucgo.ads.projetointegrador.carehub.entity.Cuidador;
import br.pucgo.ads.projetointegrador.carehub.entity.Especialidade;
import br.pucgo.ads.projetointegrador.carehub.repository.ClienteRepository;
import br.pucgo.ads.projetointegrador.carehub.repository.CuidadorRepository;
import br.pucgo.ads.projetointegrador.carehub.repository.EspecialidadeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class UsuarioSyncService {

    private final ClienteRepository clienteRepository;
    private final CuidadorRepository cuidadorRepository;
    private final EspecialidadeRepository especialidadeRepository;

    @Transactional
    public Object sincronizarOuCriar(Long platformUserId, String username, String email, String name, String platformRole) {
        if (platformUserId == null) {
            throw new IllegalArgumentException("platformUserId não pode ser nulo para sincronização");
        }

        boolean isCuidador = platformRole != null && 
                (platformRole.toUpperCase().contains("CUIDADOR"));

        if (isCuidador) {
            Optional<Cuidador> cuidadorExistente = cuidadorRepository.findByPlatformUserId(platformUserId);
            if (cuidadorExistente.isPresent()) {
                log.info("Cuidador já sincronizado localmente: username={}, platformUserId={}", username, platformUserId);
                return cuidadorExistente.get();
            }
            log.info("Sincronizando novo cuidador da plataforma: username={}, email={}, role={}", username, email, platformRole);
            Cuidador cuidador = new Cuidador();
            cuidador.setPlatformUserId(platformUserId);
            cuidador.setUsername(username);
            cuidador.setEmail(email);
            cuidador.setName(name);
            cuidador.setRole("CAREHUB_CUIDADOR");
            cuidador.setAtivo(true);
            cuidador.setStatus("ACTIVE");
            return cuidadorRepository.save(cuidador);
        } else {
            Optional<Cliente> clienteExistente = clienteRepository.findByPlatformUserId(platformUserId);
            if (clienteExistente.isPresent()) {
                log.info("Cliente já sincronizado localmente: username={}, platformUserId={}", username, platformUserId);
                return clienteExistente.get();
            }
            log.info("Sincronizando novo cliente da plataforma: username={}, email={}, role={}", username, email, platformRole);
            Cliente cliente = new Cliente();
            cliente.setPlatformUserId(platformUserId);
            cliente.setUsername(username);
            cliente.setEmail(email);
            cliente.setName(name);
            cliente.setRole("CAREHUB_CLIENTE");
            cliente.setAtivo(true);
            cliente.setStatus("ACTIVE");
            
            if (platformRole != null && platformRole.toUpperCase().contains("IDOSO")) {
                cliente.setTipoCliente("IDOSO");
            } else {
                cliente.setTipoCliente("CLIENTE");
            }
            return clienteRepository.save(cliente);
        }
    }

    @Transactional(readOnly = true)
    public PerfilResponseDTO obterPerfilCompleto(Object usuarioLocal) {
        if (usuarioLocal instanceof Cuidador) {
            return toResponseDTO((Cuidador) usuarioLocal);
        } else if (usuarioLocal instanceof Cliente) {
            return toResponseDTO((Cliente) usuarioLocal);
        } else {
            throw new RuntimeException("Tipo de usuário local desconhecido");
        }
    }

    @Transactional
    public PerfilResponseDTO completarOuAtualizarPerfil(Object usuarioLocal, PerfilRequestDTO dto) {
        if (usuarioLocal instanceof Cuidador) {
            Cuidador cuidador = (Cuidador) usuarioLocal;
            
            if (dto.getName() != null) cuidador.setName(dto.getName());
            if (dto.getEmail() != null) cuidador.setEmail(dto.getEmail());
            if (dto.getPhone() != null) cuidador.setTelefone(dto.getPhone());
            if (dto.getExperiencia() != null) cuidador.setExperiencia(dto.getExperiencia());
            if (dto.getCidade() != null) cuidador.setCidade(dto.getCidade());
            if (dto.getEstado() != null) cuidador.setEstado(dto.getEstado());
            if (dto.getTaxaHora() != null) cuidador.setTaxaHora(dto.getTaxaHora());
            if (dto.getBiografia() != null) cuidador.setBiografia(dto.getBiografia());
            if (dto.getFotoPerfil() != null) cuidador.setFotoPerfil(dto.getFotoPerfil());
            
            if (dto.getEspecialidades() != null) {
                Set<Especialidade> especialidades = new HashSet<>();
                for (String nomeEsp : dto.getEspecialidades()) {
                    Especialidade esp = especialidadeRepository.findByNomeIgnoreCase(nomeEsp)
                            .orElseGet(() -> {
                                Especialidade nova = new Especialidade();
                                nova.setNome(nomeEsp);
                                return especialidadeRepository.save(nova);
                            });
                    especialidades.add(esp);
                }
                cuidador.setEspecialidades(especialidades);
            }
            
            Cuidador salvo = cuidadorRepository.save(cuidador);
            return toResponseDTO(salvo);
        } else if (usuarioLocal instanceof Cliente) {
            Cliente cliente = (Cliente) usuarioLocal;
            
            if (dto.getName() != null) cliente.setName(dto.getName());
            if (dto.getEmail() != null) cliente.setEmail(dto.getEmail());
            if (dto.getPhone() != null) cliente.setTelefone(dto.getPhone());
            if (dto.getEndereco() != null) cliente.setEndereco(dto.getEndereco());
            if (dto.getNecessidades() != null) cliente.setNecessidades(dto.getNecessidades());
            if (dto.getContatoEmergencia() != null) cliente.setContatoEmergencia(dto.getContatoEmergencia());
            if (dto.getTipoCliente() != null) cliente.setTipoCliente(dto.getTipoCliente());
            
            Cliente salvo = clienteRepository.save(cliente);
            return toResponseDTO(salvo);
        } else {
             throw new RuntimeException("Tipo de usuário local desconhecido");
        }
    }

    private PerfilResponseDTO toResponseDTO(Cuidador cuidador) {
        PerfilResponseDTO dto = new PerfilResponseDTO();
        dto.setId(cuidador.getId());
        dto.setPlatformUserId(cuidador.getPlatformUserId());
        dto.setUsername(cuidador.getUsername());
        dto.setEmail(cuidador.getEmail());
        dto.setName(cuidador.getName());
        dto.setRole(cuidador.getRole());
        dto.setPhone(cuidador.getTelefone());
        dto.setAtivo(cuidador.getAtivo());
        dto.setStatus(cuidador.getStatus());
        
        dto.setExperiencia(cuidador.getExperiencia());
        dto.setCidade(cuidador.getCidade());
        dto.setEstado(cuidador.getEstado());
        dto.setTaxaHora(cuidador.getTaxaHora());
        dto.setAvaliacaoMedia(cuidador.getAvaliacaoMedia());
        dto.setTotalAvaliacoes(cuidador.getTotalAvaliacoes());
        dto.setBiografia(cuidador.getBiografia());
        dto.setFotoPerfil(cuidador.getFotoPerfil());
        
        List<Object[]> rows = especialidadeRepository.findNamesByCuidadorIds(List.of(cuidador.getId()));
        dto.setEspecialidades(rows.stream()
                .map(r -> (String) r[1])
                .collect(Collectors.toList()));
        return dto;
    }

    private PerfilResponseDTO toResponseDTO(Cliente cliente) {
        PerfilResponseDTO dto = new PerfilResponseDTO();
        dto.setId(cliente.getId());
        dto.setPlatformUserId(cliente.getPlatformUserId());
        dto.setUsername(cliente.getUsername());
        dto.setEmail(cliente.getEmail());
        dto.setName(cliente.getName());
        dto.setRole(cliente.getRole());
        dto.setPhone(cliente.getTelefone());
        dto.setAtivo(cliente.getAtivo());
        dto.setStatus(cliente.getStatus());
        
        dto.setEndereco(cliente.getEndereco());
        dto.setNecessidades(cliente.getNecessidades());
        dto.setContatoEmergencia(cliente.getContatoEmergencia());
        dto.setTipoCliente(cliente.getTipoCliente());
        return dto;
    }
}
