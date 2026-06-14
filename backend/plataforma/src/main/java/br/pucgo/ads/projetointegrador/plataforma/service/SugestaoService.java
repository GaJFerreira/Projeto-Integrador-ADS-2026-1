package br.pucgo.ads.projetointegrador.plataforma.service;

import br.pucgo.ads.projetointegrador.plataforma.dto.SugestaoRequestDto;
import br.pucgo.ads.projetointegrador.plataforma.dto.SugestaoResponseDto;

import java.util.List;

public interface SugestaoService {

    SugestaoResponseDto enviar(SugestaoRequestDto dto, Long userId, String userName, String userEmail);

    List<SugestaoResponseDto> listarTodas();

    List<SugestaoResponseDto> listarPorUsuario(Long userId);

    long contarNaoLidas();

    SugestaoResponseDto marcarComoLida(Long id);

    void deletar(Long id);
}
