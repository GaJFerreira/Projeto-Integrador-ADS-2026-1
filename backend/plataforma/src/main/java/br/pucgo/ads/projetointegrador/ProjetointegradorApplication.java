package br.pucgo.ads.projetointegrador;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication(scanBasePackages =
	{
		"br.pucgo.ads.projetointegrador",
		"br.com.puc.saborfamilia",
		"br.pucgo.ads.projetointegrador.carehub"
	}
)
@EntityScan(basePackages =
	{
		"br.pucgo.ads.projetointegrador.plataforma.entity",
 		"br.com.puc.saborfamilia.database.entity",
		"br.pucgo.ads.projetointegrador.carehub.entity"
	}
)
@EnableJpaRepositories(basePackages =
	{
		"br.pucgo.ads.projetointegrador.plataforma.repository",
		"br.com.puc.saborfamilia.database.repository",
		"br.pucgo.ads.projetointegrador.carehub.repository"
	}
)
public class ProjetointegradorApplication {

	public static void main(String[] args) {
		SpringApplication.run(ProjetointegradorApplication.class, args);
	}

}
