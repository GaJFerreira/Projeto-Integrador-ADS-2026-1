package br.com.puc.saborfamilia.exception;

import br.com.puc.saborfamilia.exception.dto.AlertError;
import br.com.puc.saborfamilia.exception.dto.ApiError;
import br.com.puc.saborfamilia.exception.dto.ValidationApiError;
import br.com.puc.saborfamilia.exception.model.ResourceNotFoundException;
import br.com.puc.saborfamilia.exception.model.ServiceException;
import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingRequestHeaderException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@Slf4j
@ControllerAdvice
public class ApplicationExceptionHandler {

  @ExceptionHandler(Exception.class)
  public ResponseEntity<ApiError> handleException(HttpServletRequest request, Exception e) {
    log.error(e.getMessage(), e);

    HttpStatus status = HttpStatus.INTERNAL_SERVER_ERROR;

    ApiError apiError = createApiError(
      "Erro interno.",
      "Ocorreu um erro inesperado. Tente novamente mais tarde.",
      status,
      request.getRequestURI()
    );

    return ResponseEntity.status(status).body(apiError);
  }

  @ExceptionHandler(ServiceException.class)
  public ResponseEntity<ApiError> handleServiceException(HttpServletRequest request, ServiceException e) {
    log.error(e.getMessage(), e);

    HttpStatus status = HttpStatus.BAD_REQUEST;

    ApiError apiError = createApiError(
      "Operação não permitida.",
      e.getMessage(),
      status,
      request.getRequestURI()
    );

    return ResponseEntity.status(status).body(apiError);
  }

  @ExceptionHandler(MissingRequestHeaderException.class)
  public ResponseEntity<ApiError> handleMissingRequestHeaderException(HttpServletRequest request, MissingRequestHeaderException e) {
    log.error(e.getMessage(), e);

    HttpStatus status = HttpStatus.BAD_REQUEST;

    ApiError apiError = createApiError(
      "Requisição inválida.",
      "É necessário informar o identificador do usuário na requisição.",
      status,
      request.getRequestURI()
    );
    return ResponseEntity.status(status).body(apiError);
  }

  @ExceptionHandler(ResourceNotFoundException.class)
  public ResponseEntity<ApiError> handleResourceNotFoundException(HttpServletRequest request, ResourceNotFoundException e) {
    log.error(e.getMessage(), e);

    HttpStatus status = HttpStatus.NOT_FOUND;

    ApiError apiError = createApiError(
      "Recurso não encontrado.",
      e.getMessage(),
      status,
      request.getRequestURI()
    );

    return ResponseEntity.status(status).body(apiError);
  }

  @ExceptionHandler(DataIntegrityViolationException.class)
  public ResponseEntity<ApiError> handleDataIntegrityViolation(HttpServletRequest request, DataIntegrityViolationException e) {
    log.error(e.getMessage(), e);

    HttpStatus status = HttpStatus.CONFLICT;

    ApiError apiError = createApiError(
      "Operação conflitante.",
      "Algo mudou enquanto você realizava esta ação. Atualize a página e tente de novo.",
      status,
      request.getRequestURI()
    );

    return ResponseEntity.status(status).body(apiError);
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<ValidationApiError> handleMethodArgumentNotValidException(HttpServletRequest request, MethodArgumentNotValidException e) {
    HttpStatus status = HttpStatus.BAD_REQUEST;

    String path = request.getRequestURI();

    List<AlertError> alerts = new ArrayList<>();

    if (e.getBindingResult().hasErrors()) {
      for (FieldError fieldError : e.getBindingResult().getFieldErrors()) {
        alerts.add(new AlertError(fieldError.getField(), fieldError.getDefaultMessage()));
      }
    }

    ValidationApiError apiError = ValidationApiError.builder()
      .error("Dados inválidos.")
      .message("Verifique os campos indicados e tente novamente.")
      .status(status.value())
      .timestamp(LocalDateTime.now())
      .errors(alerts)
      .path(path)
      .build();

    return ResponseEntity.status(status).body(apiError);
  }

  private ApiError createApiError(String error, String message, HttpStatus status, String path) {
    return ApiError.builder()
      .error(error)
      .message(message)
      .status(status.value())
      .timestamp(LocalDateTime.now())
      .path(path)
      .build();
  }

}
