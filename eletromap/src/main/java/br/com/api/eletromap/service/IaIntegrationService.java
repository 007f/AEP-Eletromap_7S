package br.com.api.eletromap.service;

import br.com.api.eletromap.model.dtos.IaPrevisaoRequestDto;
import br.com.api.eletromap.model.dtos.IaPrevisaoResponseDto;
import br.com.api.eletromap.model.entities.Unidade;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class IaIntegrationService {

    // URL do microserviço FastAPI em Python
    private final String IA_API_URL = "http://localhost:5000/prever";
    private final RestTemplate restTemplate;

    public IaIntegrationService() {
        this.restTemplate = new RestTemplate();
    }

    public boolean verificarFalhaIminente(Unidade unidade) {
        // 1. Monta o DTO com os dados do gêmeo digital (com valores padrão caso seja null)
        IaPrevisaoRequestDto request = new IaPrevisaoRequestDto(
                unidade.getIdadeAnos() != null ? unidade.getIdadeAnos() : 0,
                unidade.getTemperaturaC() != null ? unidade.getTemperaturaC() : 25.0,
                unidade.getVelocidadeVentoKmh() != null ? unidade.getVelocidadeVentoKmh() : 0.0,
                unidade.getCargaMw() != null ? unidade.getCargaMw() : 0.0,
                unidade.getDiasUltimaManutencao() != null ? unidade.getDiasUltimaManutencao() : 0,
                unidade.getCondicaoClimatica() != null ? unidade.getCondicaoClimatica() : "Desconhecido"
        );

        try {
            // 2. Dispara a requisição POST para o Python
            ResponseEntity<IaPrevisaoResponseDto> response = restTemplate.postForEntity(
                    IA_API_URL,
                    request,
                    IaPrevisaoResponseDto.class
            );

            // 3. Verifica o resultado
            if (response.getBody() != null) {
                return response.getBody().codigo_risco() == 1; // Retorna true se houver falha iminente
            }
        } catch (Exception e) {
            System.err.println("[IA WARNING] Falha ao comunicar com a IA Python: " + e.getMessage());
        }

        return false;
    }
}