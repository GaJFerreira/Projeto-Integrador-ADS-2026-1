package br.com.puc.saborfamilia.annotation;

import br.com.puc.saborfamilia.annotation.validator.TipoRefeicaoValidator;
import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Documented
@Constraint(validatedBy = TipoRefeicaoValidator.class)
@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidTipoRefeicao {

  String message() default "Tipo de refeição inválido.";

  Class<?>[] groups() default {};

  Class<? extends Payload>[] payload() default {};

}
