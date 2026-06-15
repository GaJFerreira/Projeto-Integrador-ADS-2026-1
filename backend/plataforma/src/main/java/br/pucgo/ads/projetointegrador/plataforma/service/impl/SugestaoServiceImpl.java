package br.pucgo.ads.projetointegrador.plataforma.service.impl;

import br.pucgo.ads.projetointegrador.plataforma.dto.SugestaoRequestDto;
import br.pucgo.ads.projetointegrador.plataforma.dto.SugestaoResponseDto;
import br.pucgo.ads.projetointegrador.plataforma.entity.Sugestao;
import br.pucgo.ads.projetointegrador.plataforma.exception.ApiException;
import br.pucgo.ads.projetointegrador.plataforma.repository.SugestaoRepository;
import br.pucgo.ads.projetointegrador.plataforma.service.SugestaoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SugestaoServiceImpl implements SugestaoService {

    private final SugestaoRepository sugestaoRepository;

    @Override
    @Transactional
    public SugestaoResponseDto enviar(SugestaoRequestDto dto, Long userId, String userName, String userEmail) {
        if (dto.getAssunto() == null || dto.getAssunto().isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "O assunto é obrigatório.");
        }
        if (dto.getMensagem() == null || dto.getMensagem().isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "A mensagem é obrigatória.");
        }
        if (dto.getTipo() == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "O tipo é obrigatório.");
        }

        Sugestao sugestao = new Sugestao();
        sugestao.setUserId(userId);
        sugestao.setUserName(userName);
        sugestao.setUserEmail(userEmail);
        sugestao.setTipo(dto.getTipo());
        sugestao.setAssunto(dto.getAssunto());
        sugestao.setMensagem(dto.getMensagem());
        sugestao.setLida(false);

        return toDto(sugestaoRepository.save(sugestao));
    }

    @Override
    public List<SugestaoResponseDto> listarTodas() {
        return sugestaoRepository.findAllByOrderByCreatedAtDesc()
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    public List<SugestaoResponseDto> listarPorUsuario(Long userId) {
        return sugestaoRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    public long contarNaoLidas() {
        return sugestaoRepository.countByLidaFalse();
    }

    @Override
    @Transactional
    public SugestaoResponseDto marcarComoLida(Long id) {
        Sugestao sugestao = sugestaoRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Sugestão não encontrada com id: " + id));
        sugestao.setLida(true);
        return toDto(sugestaoRepository.save(sugestao));
    }

    @Override
    @Transactional
    public void deletar(Long id) {
        if (!sugestaoRepository.existsById(id)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Sugestão não encontrada com id: " + id);
        }
        sugestaoRepository.deleteById(id);
    }

    private SugestaoResponseDto toDto(Sugestao s) {
        SugestaoResponseDto dto = new SugestaoResponseDto();
        dto.setId(s.getId());
        dto.setUserId(s.getUserId());
        dto.setUserName(s.getUserName());
        dto.setUserEmail(s.getUserEmail());
        dto.setTipo(s.getTipo());
        dto.setAssunto(s.getAssunto());
        dto.setMensagem(s.getMensagem());
        dto.setLida(s.getLida());
        dto.setCreatedAt(s.getCreatedAt());
        return dto;
    }
}
