package br.com.api.eletromap.controller;

import br.com.api.eletromap.model.dtos.ConexaoCreationDto;
import br.com.api.eletromap.model.dtos.ConexaoDto;
import br.com.api.eletromap.model.entities.Conexao;
import br.com.api.eletromap.model.entities.Unidade;
import br.com.api.eletromap.repository.ConexaoRepository;
import br.com.api.eletromap.repository.UnidadeRepository; // Precisaremos do UnidadeRepository
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/conexoes")
@CrossOrigin(origins = "*") // Libera CORS para o front-end, se necessário
public class ConexaoController {

    private final ConexaoRepository conexaoRepository;
    private final UnidadeRepository unidadeRepository; // Injetar UnidadeRepository

    // Injeção de dependência via construtor
    public ConexaoController(ConexaoRepository conexaoRepository, UnidadeRepository unidadeRepository) {
        this.conexaoRepository = conexaoRepository;
        this.unidadeRepository = unidadeRepository;
    }

    // --- MÉTODO DE CRIAÇÃO CORRIGIDO ---
    @PostMapping
    public ResponseEntity<ConexaoDto> criarConexao(@RequestBody ConexaoCreationDto dto) {
        Optional<Unidade> optionalOrigem = unidadeRepository.findById(dto.unidadeOrigemId());
        Optional<Unidade> optionalDestino = unidadeRepository.findById(dto.unidadeDestinoId());

        if (optionalOrigem.isEmpty() || optionalDestino.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        Conexao novaConexao = new Conexao(optionalOrigem.get(), optionalDestino.get());
        Conexao salva = conexaoRepository.save(novaConexao);

        // Converte a entidade salva para um DTO simples antes de retornar
        ConexaoDto respostaDto = new ConexaoDto(salva.getId(), salva.getOrigem().getId(), salva.getDestino().getId());

        return ResponseEntity.ok(respostaDto);
    }

    // Listar todas as conexões
    // --- MÉTODO DE LISTAGEM CORRIGIDO ---
    @GetMapping
    public ResponseEntity<List<ConexaoDto>> listarConexoes() {
        List<Conexao> conexoes = conexaoRepository.findAll();
        // Converte a lista de entidades para uma lista de DTOs
        List<ConexaoDto> dtos = conexoes.stream()
                .map(c -> new ConexaoDto(c.getId(), c.getOrigem().getId(), c.getDestino().getId()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    // Buscar por ID
    @GetMapping("/{id}")
    public ResponseEntity<ConexaoDto> buscarPorId(@PathVariable Long id) {
        return conexaoRepository.findById(id)
                .map(conexao -> new ConexaoDto(conexao.getId(), conexao.getOrigem().getId(), conexao.getDestino().getId()))
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Deletar conexão
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarConexao(@PathVariable Long id) {
        if (conexaoRepository.existsById(id)) {
            conexaoRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}