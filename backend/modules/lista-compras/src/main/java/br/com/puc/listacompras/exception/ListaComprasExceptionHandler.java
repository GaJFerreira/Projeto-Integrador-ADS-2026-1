package br.com.puc.listacompras.exception;

import br.com.puc.listacompras.exception.dto.AlertError;
import br.com.puc.listacompras.exception.dto.ApiError;
import br.com.puc.listacompras.exception.dto.ValidationApiError;
import br.com.puc.listacompras.exception.model.ResourceNotFoundException;
import br.com.puc.listacompras.exception.model.ServiceException;
import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.annotation.Order;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingRequestHeaderException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

/**
 * Tratador de excecoes do modulo lista-compras.
 * Renomeado de ApplicationExceptionHandler para evitar conflito de nome de bean
 * com o br.com.puc.saborfamilia.exception.ApplicationExceptionHandler.
 * Scoped via basePackages para tratar apenas controllers deste modulo.
 */
@Slf4j
@Order(0)
@ControllerAdvice(basePackages = "br.com.puc.listacompras")
public class ListaComprasExceptionHandler {

  @ExceptionHandler(ServiceException.class)
  public ResponseEntity<ApiError> handleServiceException(HttpServletRequest request, ServiceException e) {
    log.error(e.getMessage(), e);

    HttpStatus status = HttpStatus.BAD_REQUEST;

    ApiError apiError = createApiError(
      "Operacao nao permitida.",
      e.getMessage(),
      status,
      request.getRequestURI()
    );

    return ResponseEntity.status(status).body(apiError);
  }

  @ExceptionHandler(IllegalArgumentException.class)
  public ResponseEntity<ApiError> handleIllegalArgumentException(HttpServletRequest request, IllegalArgumentException e) {
    log.error(e.getMessage(), e);

    HttpStatus status = HttpStatus.BAD_REQUEST;

    ApiError apiError = createApiError(
      "Requisicao invalida.",
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
      "Requisicao invalida.",
      "E necessario informar o identificador do usuario na requisicao.",
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
      "Recurso nao encontrado.",
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
      "Operacao conflitante.",
      "Algo mudou enquanto voce realizava esta acao. Atualize a pagina e tente de novo.",
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
      .error("Dados invalidos.")
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
