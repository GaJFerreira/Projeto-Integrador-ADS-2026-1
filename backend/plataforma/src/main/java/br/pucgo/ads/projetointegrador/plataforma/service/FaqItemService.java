package br.pucgo.ads.projetointegrador.plataforma.service;

import br.pucgo.ads.projetointegrador.plataforma.dto.FaqItemDto;
import java.util.List;

public interface FaqItemService {
    List<FaqItemDto> findAll();
    FaqItemDto create(FaqItemDto dto);
    FaqItemDto update(Long id, FaqItemDto dto);
    void delete(Long id);
}
