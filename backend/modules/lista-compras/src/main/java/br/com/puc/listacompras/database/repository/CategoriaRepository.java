package br.com.puc.listacompras.database.repository;

import br.com.puc.listacompras.database.entity.Categoria;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CategoriaRepository extends JpaRepository<Categoria, Long> {

  Optional<Categoria> findByNomeIgnoreCase(String nome);

  List<Categoria> findByNomeContainingIgnoreCase(String nome);
}
