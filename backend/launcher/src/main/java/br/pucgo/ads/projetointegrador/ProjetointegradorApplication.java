package br.pucgo.ads.projetointegrador;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

/**
 * Ponto de entrada da aplicação.
 *
 * scanBasePackages cobre automaticamente:
 *   - br.pucgo.ads.projetointegrador.plataforma.*  (segurança, User, JWT)
 *   - br.pucgo.ads.projetointegrador.listaCompras.* (módulo lista de compras)
 *   - br.pucgo.ads.projetointegrador.remember.*    (módulo lembretes)
 *   - br.pucgo.ads.projetointegrador.<nomeModulo>.* (novos módulos)
 *
 * Para adicionar um novo módulo:
 *   1. Declare-o como dependência no launcher/pom.xml
 *   2. O Spring escaneia automaticamente se o pacote começa com br.pucgo.ads.projetointegrador
 *   3. Se o pacote for diferente (ex: br.com.xxx), adicione em scanBasePackages,
 *      entityBasePackages e repositoryBasePackages abaixo.
 */
@SpringBootApplication(scanBasePackages = {
		"br.pucgo.ads.projetointegrador",   // plataforma + todos os módulos internos
		"br.com.puc.saborfamilia"           // sabor-familia (groupId diferente)
})
@EntityScan(basePackages = {
		"br.pucgo.ads.projetointegrador",   // entidades de todos os módulos internos
		"br.com.puc.saborfamilia"           // entidades do sabor-familia
})
@EnableJpaRepositories(basePackages = {
		"br.pucgo.ads.projetointegrador",   // repositories de todos os módulos internos
		"br.com.puc.saborfamilia"           // repositories do sabor-familia
})
public class ProjetointegradorApplication {

	public static void main(String[] args) {
		SpringApplication.run(ProjetointegradorApplication.class, args);
	}

}
