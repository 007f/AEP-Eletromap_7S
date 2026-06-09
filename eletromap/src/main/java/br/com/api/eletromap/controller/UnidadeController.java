package br.com.api.eletromap.controller;

import br.com.api.eletromap.model.dtos.UnidadeDto;
import br.com.api.eletromap.model.entities.Unidade;
import br.com.api.eletromap.service.UnidadeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/unidades")
@CrossOrigin(origins = "*") // Libera CORS para o front-end em React
public class UnidadeController {

    private final UnidadeService unidadeService;

    // Injeção de dependência do Service via construtor
    public UnidadeController(UnidadeService unidadeService) {
        this.unidadeService = unidadeService;
    }

    // Criar nova unidade
    @PostMapping
    public ResponseEntity<Unidade> criarUnidade(@RequestBody UnidadeDto unidadeDto) {
        Unidade salva = unidadeService.criarUnidade(unidadeDto);
        return ResponseEntity.ok(salva);
    }

    // Listar todas as unidades
    @GetMapping
    public ResponseEntity<List<Unidade>> listarUnidades() {
        List<Unidade> unidades = unidadeService.listarTodas();
        return ResponseEntity.ok(unidades);
    }

    // Buscar por ID
    @GetMapping("/{id}")
    public ResponseEntity<Unidade> buscarPorId(@PathVariable Long id) {
        Optional<Unidade> unidade = unidadeService.buscarPorId(id);
        return unidade.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Atualizar unidade (Aqui roda a IA e o Autômato de Estados nos bastidores)
    @PutMapping("/{id}")
    public ResponseEntity<?> atualizarUnidade(@PathVariable Long id, @RequestBody UnidadeDto unidadeDto) {
        try {
            Unidade atualizada = unidadeService.atualizarUnidade(id, unidadeDto);
            return ResponseEntity.ok(atualizada);

        } catch (IllegalStateException e) {
            // Captura o erro do Autômato de Estados caso o técnico tente pular uma etapa da manutenção
            return ResponseEntity.badRequest().body(e.getMessage());

        } catch (RuntimeException e) {
            // Captura o erro caso a unidade não exista
            return ResponseEntity.notFound().build();
        }
    }

    // Deletar unidade
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarUnidade(@PathVariable Long id) {
        try {
            unidadeService.deletarUnidade(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}