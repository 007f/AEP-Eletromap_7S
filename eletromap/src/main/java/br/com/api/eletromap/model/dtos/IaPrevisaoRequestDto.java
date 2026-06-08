package br.com.api.eletromap.model.dtos;

public record IaPrevisaoRequestDto(
        Integer Idade_Anos,
        Double Temperatura_C,
        Double Velocidade_Vento_kmh,
        Double Carga_MW,
        Integer Dias_Ultima_Manutencao,
        String Condicao_Climatica
) {}