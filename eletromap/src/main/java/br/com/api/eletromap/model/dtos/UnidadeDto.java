package br.com.api.eletromap.model.dtos;

import br.com.api.eletromap.model.enums.Status;

public record UnidadeDto(
        String endereco,
        Status status,

        // Novos atributos vindos do medidor IoT/Frontend
        Integer idadeAnos,
        Double temperaturaC,
        Double velocidadeVentoKmh,
        Double cargaMw,
        Integer diasUltimaManutencao,
        String condicaoClimatica
) { }