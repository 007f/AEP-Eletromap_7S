package br.com.api.eletromap.service;

import br.com.api.eletromap.model.dtos.ConexaoCreationDto;
import br.com.api.eletromap.model.entities.Conexao;
import br.com.api.eletromap.model.entities.Unidade;
import br.com.api.eletromap.repository.ConexaoRepository;
import br.com.api.eletromap.repository.UnidadeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class ConexaoService {

    private final ConexaoRepository conexaoRepository;
    private final UnidadeRepository unidadeRepository;

    // Injeção de dependências via construtor
    public ConexaoService(ConexaoRepository conexaoRepository, UnidadeRepository unidadeRepository) {
        this.conexaoRepository = conexaoRepository;
        this.unidadeRepository = unidadeRepository;
    }

    @Transactional
    public Conexao criarConexao(ConexaoCreationDto dto) {
        // 1. Busca os nós (Unidades) no banco de dados
        Unidade origem = unidadeRepository.findById(dto.unidadeOrigemId())
                .orElseThrow(() -> new RuntimeException("Falha ao criar conexão: Unidade de origem não encontrada (ID: " + dto.unidadeOrigemId() + ")"));

        Unidade destino = unidadeRepository.findById(dto.unidadeDestinoId())
                .orElseThrow(() -> new RuntimeException("Falha ao criar conexão: Unidade de destino não encontrada (ID: " + dto.unidadeDestinoId() + ")"));

        // 2. Instancia a nova aresta.
        // Nota: O peso (distância) está fixo em 0.0 por enquanto. Você pode adicionar a distância no ConexaoCreationDto no futuro, se necessário para o cálculo de rotas.
        Conexao novaConexao = new Conexao(origem, destino, 0.0);

        // 3. Sincroniza o grafo em memória bidirecionalmente usando os métodos auxiliares da entidade
        origem.addConexaoOrigem(novaConexao);
        destino.addConexaoDestino(novaConexao);

        // 4. Salva no banco. O Cascade do JPA cuidará do resto
        return conexaoRepository.save(novaConexao);
    }

    public List<Conexao> listarTodas() {
        return conexaoRepository.findAll();
    }

    public Optional<Conexao> buscarPorId(Long id) {
        return conexaoRepository.findById(id);
    }

    @Transactional
    public void deletarConexao(Long id) {
        // 1. Localiza a conexão
        Conexao conexao = conexaoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Conexão não encontrada para exclusão (ID: " + id + ")"));

        // 2. Desfaz o laço no grafo em memória ANTES de deletar do banco
        // Se pularmos esta etapa, o Hibernate pode lançar uma exceção de violação de chave estrangeira (Constraint Violation)
        conexao.getOrigem().removeConexaoOrigem(conexao);
        conexao.getDestino().removeConexaoDestino(conexao);

        // 3. Efetiva a exclusão
        conexaoRepository.delete(conexao);
    }
}