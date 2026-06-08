package br.com.api.eletromap.model.dtos;

public record IaPrevisaoResponseDto(
        Integer codigo_risco, // 1 = Falha Iminente, 0 = Operacional
        String mensagem
) {}