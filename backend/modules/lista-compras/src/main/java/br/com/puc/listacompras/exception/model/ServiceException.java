package br.com.puc.listacompras.exception.model;

public class ServiceException extends RuntimeException {

  public ServiceException(String message) {
    super(message);
  }
}
