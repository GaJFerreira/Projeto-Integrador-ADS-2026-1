package br.pucgo.ads.projetointegrador.carehub.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import br.pucgo.ads.projetointegrador.carehub.dto.cuidador.CuidadorRequestDTO;
import br.pucgo.ads.projetointegrador.carehub.dto.cuidador.CuidadorResponseDTO;
import br.pucgo.ads.projetointegrador.carehub.entity.Cuidador;
import br.pucgo.ads.projetointegrador.carehub.entity.Especialidade;
import br.pucgo.ads.projetointegrador.carehub.repository.CuidadorRepository;
import br.pucgo.ads.projetointegrador.carehub.repository.EspecialidadeRepository;
import br.pucgo.ads.projetointegrador.carehub.repository.CuidadorProjection;

import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.Map;
import java.util.ArrayList;
import java.util.stream.Collectors;
import org.springframework.data.domain.PageImpl;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;

@Service
public class CuidadorService {

    private static final Logger LOG = LoggerFactory.getLogger(CuidadorService.class);

    @Autowired
    private CuidadorRepository cuidadorRepository;

    @Autowired
    private EspecialidadeRepository especialidadeRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    // Cache de preferência: se true, usar convert_from (bytea) primeiro; se false,
    // usar ILIKE (text) primeiro
    private volatile Boolean preferConvertFrom = null;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public List<CuidadorResponseDTO> listarTodos() {
        List<Cuidador> list = cuidadorRepository.findByDeletedAtIsNull();
        List<Long> ids = list.stream().map(Cuidador::getId).filter(Objects::nonNull).collect(Collectors.toList());
        Map<Long, List<String>> map;
        if (ids.isEmpty()) {
            map = java.util.Collections.emptyMap();
        } else {
            List<Object[]> rows = especialidadeRepository.findNamesByCuidadorIds(ids);
            map = rows.stream().collect(Collectors.groupingBy(r -> ((Number) r[0]).longValue(),
                    Collectors.mapping(r -> (String) r[1], Collectors.toList())));
        }
        return list.stream().map(c -> toResponseDTO(c, map.getOrDefault(c.getId(), new ArrayList<>())))
                .collect(Collectors.toList());
    }

    public Page<CuidadorResponseDTO> buscarComFiltros(String nome, String localizacao, String especialidade,
            Boolean disponibilidade,
            Pageable pageable) {
        // Detecte primeiro os tipos das colunas; se as colunas forem binárias (bytea),
        // a consulta JPQL LIKE irá falhar
        // — skip JPQL
        initColumnTypePreferenceIfNeeded();
        if (Boolean.TRUE.equals(preferConvertFrom)) {
            // caminho preferido convert_from nativo
            Pageable pageableNoSort = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize());
            try {
                org.springframework.data.domain.Page<CuidadorProjection> proj = cuidadorRepository
                        .buscarProjectionNative(nome, localizacao, especialidade, disponibilidade, pageableNoSort);
                return mapProjectionPageWithEspecialidades(proj, pageableNoSort);
            } catch (org.springframework.dao.InvalidDataAccessResourceUsageException ex) {
                LOG.warn("Falha na consulta nativa `convert_from`; recorrendo à consulta nativa simples `ILIKE`", ex);
                org.springframework.data.domain.Page<CuidadorProjection> proj = cuidadorRepository
                        .buscarProjectionNative(nome, localizacao, especialidade, disponibilidade, pageableNoSort);
                return mapProjectionPageWithEspecialidades(proj, pageableNoSort);
            }
        }
        // preferConvertFrom == false (colunas de texto) — tente JPQL primeiro e recorra
        // a ILIKE nativo se JPQL falhar
        try {
            Page<Cuidador> page = cuidadorRepository.buscarComFiltros(nome, localizacao, especialidade, disponibilidade,
                    pageable);
            return mapPageWithEspecialidades(page, pageable);
        } catch (org.springframework.dao.InvalidDataAccessResourceUsageException ex) {
            Pageable pageableNoSort = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize());
            try {
                org.springframework.data.domain.Page<CuidadorProjection> proj = cuidadorRepository
                        .buscarProjectionNative(nome, localizacao, especialidade, disponibilidade, pageableNoSort);
                return mapProjectionPageWithEspecialidades(proj, pageableNoSort);
            } catch (org.springframework.dao.InvalidDataAccessResourceUsageException ex2) {
                LOG.warn(
                        "Falha na consulta nativa ILIKE, recorrendo à consulta nativa convert_from como último recurso",
                        ex2);
                org.springframework.data.domain.Page<CuidadorProjection> proj = cuidadorRepository
                        .buscarProjectionNative(nome, localizacao, especialidade, disponibilidade, pageableNoSort);
                return mapProjectionPageWithEspecialidades(proj, pageableNoSort);
            }
        }
    }

    private void initColumnTypePreferenceIfNeeded() {
        if (preferConvertFrom != null)
            return;
        synchronized (this) {
            if (preferConvertFrom != null)
                return;
            try {
                boolean anyBytea = false;
                String[][] checks = new String[][] {
                        { "ch_cuidador", "cidade" },
                        { "ch_cuidador", "estado" },
                        { "ch_especialidade", "nome" }
                };
                for (String[] chk : checks) {
                    String table = chk[0];
                    String column = chk[1];
                    try {
                        // 1) current_schema()
                        String sql = "select udt_name from information_schema.columns where table_schema = current_schema() and table_name = ? and column_name = ? limit 1";
                        String udt = null;
                        try {
                            udt = jdbcTemplate.queryForObject(sql, String.class, table, column);
                            LOG.debug("UDT detectado para {}.{}: {}", table, column, udt);
                        } catch (Exception e) {
                            // ignore
                        }
                        // 2) public schema fallback
                        if (udt == null) {
                            try {
                                String sql2 = "select udt_name from information_schema.columns where table_schema = 'public' and table_name = ? and column_name = ? limit 1";
                                udt = jdbcTemplate.queryForObject(sql2, String.class, table, column);
                                LOG.debug("UDT detectado para {}.{} no esquema public: {}", table, column, udt);
                            } catch (Exception e) {
                                // ignore
                            }
                        }
                        // 3) busca ampla em esquemas/variantes de nome de tabela (case-insensitive)
                        if (udt == null) {
                            try {
                                String sql3 = "select udt_name from information_schema.columns where lower(table_name) = lower(?) and lower(column_name) = lower(?) limit 1";
                                udt = jdbcTemplate.queryForObject(sql3, String.class, table, column);
                                LOG.debug("UDT detectado para {}.{} via busca ampla: {}", table, column, udt);
                            } catch (Exception e) {
                                // ignore
                            }
                        }
                        if (udt != null && udt.equalsIgnoreCase("bytea")) {
                            anyBytea = true;
                            LOG.debug("Coluna {}.{} é bytea -> preferirá convert_from", table, column);
                            break;
                        }
                    } catch (Exception e) {
                        LOG.debug("Erro ao sondar o tipo da coluna para {}.{}: {}", table, column, e.getMessage());
                    }
                }
                preferConvertFrom = anyBytea;
                LOG.info("Detecção de colunas do CuidadorService concluída. preferConvertFrom={}", preferConvertFrom);
            } catch (Exception e) {
                preferConvertFrom = false;
                LOG.warn("Erro ao detectar tipos de colunas do carehub; padronizando preferConvertFrom=false", e);
            }
        }
    }

    public CuidadorResponseDTO buscarPorId(Long id) {
        Objects.requireNonNull(id, "Cuidador ID não pode ser null");

        Cuidador cuidador = cuidadorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cuidador não encontrado"));
        List<Object[]> rows = especialidadeRepository.findNamesByCuidadorIds(java.util.List.of(id));
        List<String> nomes = rows.stream().map(r -> (String) r[1]).collect(Collectors.toList());
        return toResponseDTO(cuidador, nomes);
    }

    @Transactional
    public CuidadorResponseDTO atualizar(Long id, CuidadorRequestDTO dto) {
        Objects.requireNonNull(id, "Cuidador ID não pode ser null");

        Cuidador cuidador = cuidadorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cuidador não encontrado"));

        if (dto.getNome() != null)
            cuidador.setName(dto.getNome());
        if (dto.getEmail() != null)
            cuidador.setEmail(dto.getEmail());
        if (dto.getTelefone() != null)
            cuidador.setTelefone(dto.getTelefone());
        if (dto.getExperiencia() != null)
            cuidador.setExperiencia(dto.getExperiencia());

        // Mapear especialidades via tabela de junção
        if (dto.getEspecialidades() != null && !dto.getEspecialidades().isEmpty()) {
            Set<Especialidade> especialidades = new HashSet<>();
            for (String nomeEspecialidade : dto.getEspecialidades()) {
                Especialidade especialidade = especialidadeRepository.findByNomeIgnoreCase(nomeEspecialidade)
                        .orElseGet(() -> {
                            // Criar nova especialidade se não existir
                            Especialidade nova = new Especialidade();
                            nova.setNome(nomeEspecialidade);
                            return especialidadeRepository.save(nova);
                        });
                especialidades.add(especialidade);
            }
            cuidador.setEspecialidades(especialidades);
        }

        if (dto.getDisponibilidade() != null)
            cuidador.setDisponibilidade(dto.getDisponibilidade());
        if (dto.getLocalizacao() != null) {
            // heurística simples: "Cidade-UF" ou apenas Cidade
            String loc = dto.getLocalizacao();
            if (loc.contains("-")) {
                String[] parts = loc.split("-");
                cuidador.setCidade(parts[0].trim());
                cuidador.setEstado(parts[1].trim().substring(0, Math.min(2, parts[1].trim().length())).toUpperCase());
            } else {
                cuidador.setCidade(loc);
            }
        }
        if (dto.getBiografia() != null)
            cuidador.setBiografia(dto.getBiografia());
        if (dto.getFotoPerfil() != null)
            cuidador.setFotoPerfil(dto.getFotoPerfil());

        Objects.requireNonNull(cuidador, "Cuidador não pode ser null");
        cuidador = cuidadorRepository.save(cuidador);
        List<Object[]> rows = especialidadeRepository.findNamesByCuidadorIds(java.util.List.of(cuidador.getId()));
        List<String> nomes = rows.stream().map(r -> (String) r[1]).collect(Collectors.toList());
        return toResponseDTO(cuidador, nomes);
    }

    @Transactional
    public void deletar(Long id) {
        Objects.requireNonNull(id, "Cuidador ID não pode ser null");

        Cuidador cuidador = cuidadorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cuidador não encontrado"));
        cuidador.setAtivo(false);
        cuidadorRepository.save(cuidador);
    }

    private CuidadorResponseDTO toResponseDTO(Cuidador cuidador, List<String> especialidades) {
        CuidadorResponseDTO dto = new CuidadorResponseDTO();
        dto.setId(cuidador.getId());
        dto.setPlatformUserId(cuidador.getPlatformUserId());
        dto.setNome(cuidador.getName());
        dto.setEmail(cuidador.getEmail());
        dto.setTelefone(cuidador.getTelefone());
        dto.setExperiencia(cuidador.getExperiencia());
        dto.setEspecialidades(especialidades == null ? new ArrayList<>() : especialidades);
        dto.setCidade(cuidador.getCidade());
        dto.setEstado(cuidador.getEstado());
        dto.setDisponibilidade(cuidador.getDisponibilidade());
        dto.setAvaliacaoMedia(cuidador.getAvaliacaoMedia());
        dto.setTaxaHora(cuidador.getTaxaHora());
        dto.setTotalAvaliacoes(cuidador.getTotalAvaliacoes());
        dto.setBiografia(cuidador.getBiografia());
        dto.setFotoPerfil(cuidador.getFotoPerfil());
        dto.setAtivo(cuidador.getAtivo());
        dto.setCriadoEm(cuidador.getCreatedAt());
        return dto;
    }

    private Page<CuidadorResponseDTO> mapPageWithEspecialidades(Page<Cuidador> page, Pageable pageable) {
        List<Cuidador> content = page.getContent();
        List<Long> ids = content.stream().map(Cuidador::getId).filter(Objects::nonNull).collect(Collectors.toList());
        Map<Long, List<String>> map;
        if (ids.isEmpty()) {
            map = java.util.Collections.emptyMap();
        } else {
            List<Object[]> rows = especialidadeRepository.findNamesByCuidadorIds(ids);
            map = rows.stream().collect(Collectors.groupingBy(r -> ((Number) r[0]).longValue(),
                    Collectors.mapping(r -> (String) r[1], Collectors.toList())));
        }
        List<CuidadorResponseDTO> dtos = content.stream()
                .map(c -> toResponseDTO(c, map.getOrDefault(c.getId(), new ArrayList<>())))
                .collect(Collectors.toList());
        List<CuidadorResponseDTO> safeList = dtos == null ? new ArrayList<>() : dtos;
        return new PageImpl<CuidadorResponseDTO>(safeList, Objects.requireNonNull(pageable), page.getTotalElements());
    }

    private Page<CuidadorResponseDTO> mapProjectionPageWithEspecialidades(
            org.springframework.data.domain.Page<CuidadorProjection> page, Pageable pageable) {
        List<CuidadorProjection> content = page.getContent();
        List<Long> ids = content.stream().map(CuidadorProjection::getId).filter(Objects::nonNull)
                .collect(Collectors.toList());
        Map<Long, List<String>> map;
        if (ids.isEmpty()) {
            map = java.util.Collections.emptyMap();
        } else {
            List<Object[]> rows = especialidadeRepository.findNamesByCuidadorIds(ids);
            map = rows.stream().collect(Collectors.groupingBy(r -> ((Number) r[0]).longValue(),
                    Collectors.mapping(r -> (String) r[1], Collectors.toList())));
        }
        List<CuidadorResponseDTO> dtos = content.stream().map(p -> {
            CuidadorResponseDTO dto = new CuidadorResponseDTO();
            dto.setId(p.getId());
            dto.setPlatformUserId(p.getPlatformUserId());
            dto.setNome(p.getName());
            dto.setEmail(p.getEmail());
            dto.setTelefone(p.getPhone());
            dto.setExperiencia(p.getExperiencia());
            dto.setEspecialidades(map.getOrDefault(p.getId(), new ArrayList<>()));
            dto.setCidade(p.getCidade());
            dto.setEstado(p.getEstado());
            dto.setDisponibilidade(p.getDisponibilidade());
            dto.setAvaliacaoMedia(p.getAvaliacaoMedia());
            dto.setTaxaHora(p.getTaxaHora());
            dto.setTotalAvaliacoes(p.getTotalAvaliacoes());
            dto.setBiografia(p.getBiografia());
            dto.setFotoPerfil(p.getFotoPerfil());
            dto.setAtivo(p.getAtivo());
            dto.setCriadoEm(p.getCreatedAt() == null ? null
                    : OffsetDateTime.ofInstant(p.getCreatedAt(), ZoneOffset.UTC));
            return dto;
        }).collect(Collectors.toList());
        List<CuidadorResponseDTO> safeList2 = dtos == null ? new ArrayList<>() : dtos;
        return new PageImpl<CuidadorResponseDTO>(safeList2, Objects.requireNonNull(pageable), page.getTotalElements());
    }
}
