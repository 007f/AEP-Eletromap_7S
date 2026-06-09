package br.com.api.eletromap.controller;

import br.com.api.eletromap.model.dtos.ConexaoCreationDto;
import br.com.api.eletromap.model.dtos.ConexaoDto;
import br.com.api.eletromap.model.entities.Conexao;
import br.com.api.eletromap.service.ConexaoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/conexoes")
@CrossOrigin(origins = "*") // Libera CORS para o front-end em React
public class ConexaoController {

    private final ConexaoService conexaoService;

    // Injeção de dependência do Service via construtor
    public ConexaoController(ConexaoService conexaoService) {
        this.conexaoService = conexaoService;
    }

    // Criar nova conexão
    @PostMapping
    public ResponseEntity<?> criarConexao(@RequestBody ConexaoCreationDto dto) {
        try {
            Conexao salva = conexaoService.criarConexao(dto);

            // Converte a entidade salva para um DTO simples antes de retornar
            ConexaoDto respostaDto = new ConexaoDto(salva.getId(), salva.getOrigem().getId(), salva.getDestino().getId());
            return ResponseEntity.ok(respostaDto);

        } catch (RuntimeException e) {
            // Retorna 400 Bad Request se a unidade de origem ou destino não existir
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Listar todas as conexões
    @GetMapping
    public ResponseEntity<List<ConexaoDto>> listarConexoes() {
        List<Conexao> conexoes = conexaoService.listarTodas();

        // Converte a lista de entidades para uma lista de DTOs para proteger a API
        List<ConexaoDto> dtos = conexoes.stream()
                .map(c -> new ConexaoDto(c.getId(), c.getOrigem().getId(), c.getDestino().getId()))
                .collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    // Buscar conexão por ID
    @GetMapping("/{id}")
    public ResponseEntity<ConexaoDto> buscarPorId(@PathVariable Long id) {
        return conexaoService.buscarPorId(id)
                .map(c -> new ConexaoDto(c.getId(), c.getOrigem().getId(), c.getDestino().getId()))
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Deletar conexão
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarConexao(@PathVariable Long id) {
        try {
            conexaoService.deletarConexao(id);
            return ResponseEntity.noContent().build(); // Retorna 204 se apagou com sucesso

        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build(); // Retorna 404 se a conexão não existia
        }
    }
}