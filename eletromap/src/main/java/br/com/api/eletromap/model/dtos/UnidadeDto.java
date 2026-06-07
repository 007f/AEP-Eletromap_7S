package br.com.api.eletromap.model.dtos;

import br.com.api.eletromap.model.enums.Status;

public record UnidadeDto(
        String endereco,
        Status status // Agora o status pode vir do DTO
) { }