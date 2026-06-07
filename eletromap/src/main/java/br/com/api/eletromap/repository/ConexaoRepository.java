package br.com.api.eletromap.repository;

import br.com.api.eletromap.model.entities.Conexao;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ConexaoRepository extends JpaRepository<Conexao, Long> {
}