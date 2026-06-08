package br.com.api.eletromap.repository;

import br.com.api.eletromap.model.entities.Unidade;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UnidadeRepository extends JpaRepository<Unidade, Long> {
    // Repository
    // Sim, e so isso memo... Spring eh um amigao S2
}
