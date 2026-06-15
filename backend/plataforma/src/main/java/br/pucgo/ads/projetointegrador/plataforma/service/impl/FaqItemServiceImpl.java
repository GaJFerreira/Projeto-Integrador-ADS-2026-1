package br.pucgo.ads.projetointegrador.plataforma.service.impl;

import br.pucgo.ads.projetointegrador.plataforma.dto.FaqItemDto;
import br.pucgo.ads.projetointegrador.plataforma.entity.FaqItem;
import br.pucgo.ads.projetointegrador.plataforma.repository.FaqItemRepository;
import br.pucgo.ads.projetointegrador.plataforma.service.FaqItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FaqItemServiceImpl implements FaqItemService {

    private final FaqItemRepository repository;

    @Override
    @Transactional(readOnly = true)
    public List<FaqItemDto> findAll() {
        return repository.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public FaqItemDto create(FaqItemDto dto) {
        FaqItem entity = toEntity(dto);
        return toDto(repository.save(entity));
    }

    @Override
    @Transactional
    public FaqItemDto update(Long id, FaqItemDto dto) {
        FaqItem entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("FAQ não encontrado com ID: " + id));
        entity.setModulo(dto.getModulo());
        entity.setCor(dto.getCor());
        entity.setPergunta(dto.getPergunta());
        entity.setResposta(dto.getResposta());
        return toDto(repository.save(entity));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("FAQ não encontrado com ID: " + id);
        }
        repository.deleteById(id);
    }

    private FaqItemDto toDto(FaqItem entity) {
        FaqItemDto dto = new FaqItemDto();
        dto.setId(entity.getId());
        dto.setModulo(entity.getModulo());
        dto.setCor(entity.getCor());
        dto.setPergunta(entity.getPergunta());
        dto.setResposta(entity.getResposta());
        return dto;
    }

    private FaqItem toEntity(FaqItemDto dto) {
        FaqItem entity = new FaqItem();
        entity.setModulo(dto.getModulo());
        entity.setCor(dto.getCor());
        entity.setPergunta(dto.getPergunta());
        entity.setResposta(dto.getResposta());
        return entity;
    }
}
