package br.com.api.eletromap.service;

import br.com.api.eletromap.model.dtos.UnidadeDto;
import br.com.api.eletromap.model.entities.Unidade;
import br.com.api.eletromap.model.enums.Status;
import br.com.api.eletromap.repository.UnidadeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class UnidadeService {

    private final UnidadeRepository unidadeRepository;
    private final IaIntegrationService iaIntegrationService;

    // Injeção de dependências
    public UnidadeService(UnidadeRepository unidadeRepository, IaIntegrationService iaIntegrationService) {
        this.unidadeRepository = unidadeRepository;
        this.iaIntegrationService = iaIntegrationService;
    }

    @Transactional
    public Unidade criarUnidade(UnidadeDto dto) {
        // Inicializa com dados básicos e os atributos da IA
        Unidade novaUnidade = new Unidade(dto.endereco(), dto.idadeAnos());
        novaUnidade.setStatus(dto.status() != null ? dto.status() : Status.NORMAL);
        novaUnidade.setTemperaturaC(dto.temperaturaC());
        novaUnidade.setVelocidadeVentoKmh(dto.velocidadeVentoKmh());
        novaUnidade.setCargaMw(dto.cargaMw());
        novaUnidade.setDiasUltimaManutencao(dto.diasUltimaManutencao());
        novaUnidade.setCondicaoClimatica(dto.condicaoClimatica());

        return unidadeRepository.save(novaUnidade);
    }

    public List<Unidade> listarTodas() {
        return unidadeRepository.findAll();
    }

    public Optional<Unidade> buscarPorId(Long id) {
        return unidadeRepository.findById(id);
    }

    @Transactional
    public Unidade atualizarUnidade(Long id, UnidadeDto dto) {
        Unidade unidade = unidadeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Unidade não encontrada"));

        unidade.setEndereco(dto.endereco());
        unidade.setIdadeAnos(dto.idadeAnos());
        unidade.setTemperaturaC(dto.temperaturaC());
        unidade.setVelocidadeVentoKmh(dto.velocidadeVentoKmh());
        unidade.setCargaMw(dto.cargaMw());
        unidade.setDiasUltimaManutencao(dto.diasUltimaManutencao());
        unidade.setCondicaoClimatica(dto.condicaoClimatica());

        // 1. REGRAS DO AUTÔMATO DE ESTADOS FINITOS
        if (dto.status() != null && unidade.getStatus() != dto.status()) {
            validarTransicaoDeStatus(unidade.getStatus(), dto.status());
            unidade.setStatus(dto.status());
        }

        // 2. INTEGRAÇÃO COM A IA (Gêmeo Digital)
        // Após atualizar os dados físicos, consultamos a IA para ver se há risco de queda/falha
        boolean riscoDeFalha = iaIntegrationService.verificarFalhaIminente(unidade);

        if (riscoDeFalha && unidade.getStatus() == Status.NORMAL) {
            // A IA detectou uma anomalia grave: força o autômato para o estado de FALHA
            System.out.println("[ALERTA IA] Falha iminente detectada na unidade ID: " + unidade.getId());
            unidade.setStatus(Status.FALHA);
        }

        return unidadeRepository.save(unidade);
    }

    @Transactional
    public void deletarUnidade(Long id) {
        if (!unidadeRepository.existsById(id)) {
            throw new RuntimeException("Unidade não encontrada para exclusão");
        }
        unidadeRepository.deleteById(id);
    }

    /**
        MÁQUINA DE ESTADOS FINITOS
        Garante que o ciclo de manutenção da Copel siga o fluxo correto.
     */
    private void validarTransicaoDeStatus(Status atual, Status novo) {
        boolean transicaoValida = false;

        switch (atual) {
            case NORMAL:
                // Do estado Normal, só pode ir para Falha (IA/Evento) ou Identificado (Técnico)
                transicaoValida = (novo == Status.FALHA || novo == Status.IDENTIFICADO);
                break;
            case FALHA:
                // Da Falha, a equipe precisa identificar o problema
                transicaoValida = (novo == Status.IDENTIFICADO);
                break;
            case IDENTIFICADO:
                // Após identificado, entra em reparo
                transicaoValida = (novo == Status.EM_REPARO);
                break;
            case EM_REPARO:
                // Após o reparo, a rede é normalizada
                transicaoValida = (novo == Status.NORMALIZADO);
                break;
            case NORMALIZADO:
                // O ciclo se encerra e volta ao monitoramento normal
                transicaoValida = (novo == Status.NORMAL);
                break;
        }

        if (!transicaoValida) {
            throw new IllegalStateException("Transição inválida: O Autômato de Estados não permite mudar de " + atual + " para " + novo);
        }
    }
}