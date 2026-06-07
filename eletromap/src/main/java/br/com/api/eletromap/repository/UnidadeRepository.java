package br.com.api.eletromap.repository;

import org.springframework.data.jpa.repository.JpaRepository;

public interface UnidadeRepository extends JpaRepository<Unidade, Long> {
    // Repository
    // Sim, e so isso memo... Spring eh um amigao S2
}
