package br.com.puc.listacompras.database.repository;

import br.com.puc.listacompras.database.entity.Patologia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PatologiaRepository extends JpaRepository<Patologia, Long> {

}
