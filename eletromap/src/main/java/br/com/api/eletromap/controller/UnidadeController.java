package br.com.api.eletromap.controller;

import br.com.api.eletromap.model.dtos.UnidadeDto;
import br.com.api.eletromap.model.entities.Unidade;
import br.com.api.eletromap.repository.UnidadeRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/unidades")
@CrossOrigin(origins = "*") // Libera CORS para o front-end, se necessário
public class UnidadeController {

    private final UnidadeRepository unidadeRepository;

    // Injeção de dependência via construtor (boa prática)
    public UnidadeController(UnidadeRepository unidadeRepository) {
        this.unidadeRepository = unidadeRepository;
    }

    // Criar nova unidade
    @PostMapping
    public ResponseEntity<Unidade> criarUnidade(@RequestBody UnidadeDto unidadeDto) {
        // Cria uma nova instância de Unidade a partir do DTO
        Unidade novaUnidade = new Unidade(unidadeDto.endereco());
        
        if (unidadeDto.status() != null) {
            novaUnidade.setStatus(unidadeDto.status());
        }

        Unidade salva = this.unidadeRepository.save(novaUnidade);
        return ResponseEntity.ok(salva);
    }

    // Listar todas as unidades
    @GetMapping
    public ResponseEntity<List<Unidade>> listarUnidades() {
        List<Unidade> unidades = this.unidadeRepository.findAll();
        return ResponseEntity.ok(unidades);
    }

    // Buscar por ID
    @GetMapping("/{id}")
    public ResponseEntity<Unidade> buscarPorId(@PathVariable Long id) {
        Optional<Unidade> unidade = this.unidadeRepository.findById(id);
        return unidade.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Atualizar unidade
    @PutMapping("/{id}")
    public ResponseEntity<Unidade> atualizarUnidade(@PathVariable Long id, @RequestBody UnidadeDto unidadeDto) {
        Optional<Unidade> optionalUnidade = this.unidadeRepository.findById(id);

        if (optionalUnidade.isPresent()) {
            Unidade unidadeExistente = optionalUnidade.get();
            unidadeExistente.setEndereco(unidadeDto.endereco());
            unidadeExistente.setStatus(unidadeDto.status());
            // Não atualizamos as listas de conexões aqui, elas são gerenciadas pelo ConexaoController

            Unidade atualizada = this.unidadeRepository.save(unidadeExistente);
            return ResponseEntity.ok(atualizada);
        }
        return ResponseEntity.notFound().build();
    }

    // Deletar unidade
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarUnidade(@PathVariable Long id) {
        if (this.unidadeRepository.existsById(id)) {
            this.unidadeRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}