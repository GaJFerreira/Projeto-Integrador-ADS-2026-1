package br.com.puc.saborfamilia.annotation.validator;

import br.com.puc.saborfamilia.annotation.ValidTipoRefeicao;
import br.com.puc.saborfamilia.database.enums.TipoRefeicaoEnum;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import java.util.Arrays;

public class TipoRefeicaoValidator implements ConstraintValidator<ValidTipoRefeicao, String> {

  @Override
  public boolean isValid(String value, ConstraintValidatorContext context) {
    if (value == null) {
      return true;
    }

    boolean isValid = Arrays.stream(TipoRefeicaoEnum.values()).anyMatch(type -> type.name().equals(value));

    if (!isValid) {
      String validTypes = Arrays.stream(TipoRefeicaoEnum.values())
        .map(Enum::name)
        .reduce((x, y) -> x + ", " + y)
        .orElse("");

      String message = "Tipo de refeição inválido. Os tipos de refeição válidos são: [" + validTypes + "].";

      context.disableDefaultConstraintViolation();
      context.buildConstraintViolationWithTemplate(message).addConstraintViolation();
    }

    return isValid;
  }
}
