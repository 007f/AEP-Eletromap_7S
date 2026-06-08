package br.com.api.eletromap.model.dtos;

public record ConexaoDto(
        Long id,
        Long idOrigem, // Alterado de Integer para Long
        Long idDestino // Alterado de Integer para Long
) {}