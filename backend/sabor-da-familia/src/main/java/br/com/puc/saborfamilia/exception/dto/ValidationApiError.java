package br.com.puc.saborfamilia.exception.dto;

import java.time.LocalDateTime;
import java.util.List;
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
public class ValidationApiError {

  private String error;
  private String message;
  private int status;
  private LocalDateTime timestamp;
  private List<AlertError> errors;
  private String path;

}


