package br.pucgo.ads.projetointegrador;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication(scanBasePackages = {
		"br.pucgo.ads.projetointegrador",
		"br.com.puc.saborfamilia",
<<<<<<< feature/remember
		"br.com.puc.listacompras",
   		//"br.pucgo.ads.projetointegrador.carehub"
   		"br.pucgo.ads.projetointegrador.remember"

	}
)
@EntityScan(basePackages =
	{
		"br.pucgo.ads.projetointegrador.plataforma.entity",
 		"br.com.puc.saborfamilia.database.entity",
		"br.com.puc.listacompras.database.entity",
		"br.pucgo.ads.projetointegrador.remember.entity"
  //"br.pucgo.ads.projetointegrador.carehub.entity"
	}
)
@EnableJpaRepositories(basePackages =
	{
		"br.pucgo.ads.projetointegrador.plataforma.repository",
		"br.com.puc.saborfamilia.database.repository",
		"br.com.puc.listacompras.database.repository",
		"br.pucgo.ads.projetointegrador.remember.repository"
  //"br.pucgo.ads.projetointegrador.carehub.repository"
	}
)
=======
		"br.pucgo.ads.projetointegrador.diario_saude",
  //"br.pucgo.ads.projetointegrador.carehub",
		"br.com.puc.listacompras"
})
@EntityScan(basePackages = {
		"br.pucgo.ads.projetointegrador.plataforma.entity",
		"br.com.puc.saborfamilia.database.entity",
		"br.pucgo.ads.projetointegrador.diario_saude.entity",
	//"br.pucgo.ads.projetointegrador.carehub.entity",
		"br.com.puc.listacompras.database.entity"
})
@EnableJpaRepositories(basePackages = {
		"br.pucgo.ads.projetointegrador.plataforma.repository",
		"br.com.puc.saborfamilia.database.repository",
		"br.pucgo.ads.projetointegrador.diario_saude.repository",
	//"br.pucgo.ads.projetointegrador.carehub.repository",
		"br.com.puc.listacompras.database.repository"
})
>>>>>>> develop
public class ProjetointegradorApplication {

	public static void main(String[] args) {
		SpringApplication.run(ProjetointegradorApplication.class, args);
	}
}