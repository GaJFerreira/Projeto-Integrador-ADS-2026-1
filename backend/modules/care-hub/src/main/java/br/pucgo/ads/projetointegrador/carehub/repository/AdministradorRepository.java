package br.pucgo.ads.projetointegrador.carehub.repository;

import br.pucgo.ads.projetointegrador.carehub.entity.Administrador;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AdministradorRepository extends JpaRepository<Administrador, Long> {
}
