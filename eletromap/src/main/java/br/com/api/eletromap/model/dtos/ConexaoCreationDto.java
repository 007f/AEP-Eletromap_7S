package br.com.api.eletromap.model.dtos;

public record ConexaoCreationDto(
    Long unidadeOrigemId,
    Long unidadeDestinoId
) {}
