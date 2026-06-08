package br.com.api.eletromap.model.dtos;

public record ConexaoCreationDto(
        Long unidadeOrigemId,
        Long unidadeDestinoId,
        Double distancia // Campo adicionado para o peso do grafo
) {}
