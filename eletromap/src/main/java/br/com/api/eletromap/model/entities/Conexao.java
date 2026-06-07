package br.com.api.eletromap.model.entities;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;

@Entity
@Table(name = "tb_conexoes")
public class Conexao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonBackReference("unidade-origem-conexoes") // Deve bater exatamente com o nome da Unidade
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "origem_id", nullable = false)
    private Unidade origem;

    @JsonBackReference("unidade-destino-conexoes") // Deve bater exatamente com o nome da Unidade
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "destino_id", nullable = false)
    private Unidade destino;

    private Double distancia; // Pode ser interpretado como peso do grafo (distância ou impedância)

    public Conexao() {
        // Construtor padrão para o JPA
    }

    public Conexao(Unidade origem, Unidade destino, Double distancia) {
        this.origem = origem;
        this.destino = destino;
        this.distancia = distancia;
    }

    // --- Getters e Setters ---

    public Long getId() {
        return id;
    }

    public Unidade getOrigem() {
        // Nota: Devido ao FetchType.LAZY, certifique-se de acessar dentro de uma transação aberta se precisar carregar a entidade inteira
        return origem;
    }

    public void setOrigem(Unidade origem) {
        this.origem = origem;
    }

    public Unidade getDestino() {
        return destino;
    }

    public void setDestino(Unidade destino) {
        this.destino = destino;
    }

    public Double getDistancia() {
        return distancia;
    }

    public void setDistancia(Double distancia) {
        this.distancia = distancia;
    }
}