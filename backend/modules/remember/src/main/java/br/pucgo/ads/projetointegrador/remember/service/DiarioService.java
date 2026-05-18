package br.pucgo.ads.projetointegrador.remember.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.pucgo.ads.projetointegrador.remember.dto.conquista.ConquistaResponseDTO;
import br.pucgo.ads.projetointegrador.remember.dto.diario.DiarioRequestDTO;
import br.pucgo.ads.projetointegrador.remember.dto.diario.DiarioResponseDTO;
import br.pucgo.ads.projetointegrador.remember.dto.diario.DiarioUpdateDTO;
import br.pucgo.ads.projetointegrador.remember.entity.Diario;
import br.pucgo.ads.projetointegrador.remember.entity.Usuario;
import br.pucgo.ads.projetointegrador.remember.exception.RecursoNaoEncontradoException;
import br.pucgo.ads.projetointegrador.remember.repository.DiarioRepository;
import br.pucgo.ads.projetointegrador.remember.repository.UsuarioRememberRepository;

@Service
public class DiarioService {

    private final DiarioRepository diarioRepository;
    private final ConquistaService conquistaService;
    private final GameService gamificationService;
    private final UsuarioRememberRepository usuarioRepository; // Novo Repositório injetado

    @Autowired
    public DiarioService(
            DiarioRepository diarioRepository,
            ConquistaService conquistaService,
            GameService gamificationService,
            UsuarioRememberRepository usuarioRepository
    ) {
        this.diarioRepository = diarioRepository;
        this.conquistaService = conquistaService;
        this.gamificationService = gamificationService;
        this.usuarioRepository = usuarioRepository;
    }

    /**
     * Salva uma nova página do diário e garante que o usuário existe no schema local.
     */
    @Transactional
    public DiarioResponseDTO salvarDiario(DiarioRequestDTO requestDTO) {
        // --- LÓGICA DE PROVISIONAMENTO DE USUÁRIO ---
        Long idUser = requestDTO.getIdentificadorUsuario();

        Usuario usuario = usuarioRepository.findByIdUsuario(idUser).orElse(null);
        
        if (usuario == null) {
            usuario = new Usuario();
            usuario.setIdUsuario(idUser);
            usuario.setPlatformUserId(idUser);
            usuario.setNome("Usuário " + idUser);
            usuario.setEmail("usuario" + idUser + "@puc.br");
        
            // O saveAndFlush garante que o banco receba o dado AGORA, 
            // evitando o erro de Optimistic Locking na sequência da transação.
            usuario = usuarioRepository.saveAndFlush(usuario);
        }

        // 2. Agora sim, cria o diário
        Diario novoDiario = new Diario();
        novoDiario.setIdentificadorUsuario(usuario.getIdUsuario());
        novoDiario.setTitulo(requestDTO.getTitulo());
        novoDiario.setConteudo(requestDTO.getConteudo());
        novoDiario.setDataEscrita(requestDTO.getDataEscrita());

        Diario diarioSalvo = diarioRepository.save(novoDiario);
        
        DiarioResponseDTO response = new DiarioResponseDTO(diarioSalvo);

        List<ConquistaResponseDTO> conquistasGanhas = gamificationService
                .verificarTodasConquistasDiario(diarioSalvo.getIdentificadorUsuario());

        response.setConquistasDesbloqueadas(conquistasGanhas);

        return response;
    }

    public DiarioResponseDTO buscarDiarioPorId(Long identificador, Long identificadorUsuario) {
        Diario diario = diarioRepository.findById(identificador)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Diário não encontrado com o ID: " + identificador));
        validarDonoDiario(diario, identificadorUsuario);
        return new DiarioResponseDTO(diario);
    }

    public List<DiarioResponseDTO> listarDiariosPorUsuario(Long identificadorUsuario) {
        List<Diario> diarios = diarioRepository.findAllByIdentificadorUsuarioOrderByDataEscritaDesc(identificadorUsuario);
        return diarios.stream()
                .map(DiarioResponseDTO::new)
                .collect(Collectors.toList());
    }

    public DiarioResponseDTO atualizarDiario(Long identificador, DiarioUpdateDTO diarioUpdateDto, Long identificadorUsuario) {
        Diario diarioExistente = diarioRepository.findById(identificador)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Diário não encontrado com o ID: " + identificador));
        validarDonoDiario(diarioExistente, identificadorUsuario);

        diarioExistente.setTitulo(diarioUpdateDto.getTitulo());
        diarioExistente.setConteudo(diarioUpdateDto.getConteudo());

        Diario diarioAtualizado = diarioRepository.save(diarioExistente);
        return new DiarioResponseDTO(diarioAtualizado);
    }

    public void deletarDiario(Long identificador, Long identificadorUsuario) {
        Diario diario = diarioRepository.findById(identificador)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Diário não encontrado com o ID: " + identificador));
        validarDonoDiario(diario, identificadorUsuario);
        diarioRepository.delete(diario);
    }

    private void validarDonoDiario(Diario diario, Long identificadorUsuario) {
        if (!diario.getIdentificadorUsuario().equals(identificadorUsuario)) {
            throw new AccessDeniedException("Usuário não autorizado a acessar este diário.");
        }
    }
}
