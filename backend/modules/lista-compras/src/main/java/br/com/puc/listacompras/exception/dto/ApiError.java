package br.com.puc.listacompras.exception.dto;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApiError {

  private String error;
  private String message;
  private int status;
  private LocalDateTime timestamp;
  private String path;

}
