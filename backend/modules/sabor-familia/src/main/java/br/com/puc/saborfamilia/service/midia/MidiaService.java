package br.com.puc.saborfamilia.service.midia;

import br.com.puc.saborfamilia.enums.TipoEntidadeEnum;
import java.util.Collection;
import java.util.Set;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

public interface MidiaService {

  ResponseEntity<byte[]> buscarMidia(TipoEntidadeEnum tipoEntidade, Long entidadeId);

  void salvarMidia(Long usuarioId, TipoEntidadeEnum tipoEntidade, Long entidadeId, MultipartFile arquivo);

  boolean possuiMidia(TipoEntidadeEnum tipoEntidade, Long entidadeId);

  Set<Long> buscarEntidadeIdsComMidia(TipoEntidadeEnum tipoEntidade, Collection<Long> entidadeIds);

  void removerMidia(TipoEntidadeEnum tipoEntidade, Long entidadeId);

}
