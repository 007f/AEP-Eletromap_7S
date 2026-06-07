package br.com.api.eletromap.model.entities;

import package br.com.api.eletromap.model.entities;

import br.com.api.eletromap.model.enums.Status;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

br.com.api.eletromap.model.enums.Status;
import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonManagedReference; // Importar

import java.util.ArrayList;
import java.util.List;

@Entity
public class Unidade {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String endereco;

    @Enumerated(EnumType.STRING)
    private Status status;

    // Mapeamento para conexões onde esta unidade é a ORIGEM
    @JsonManagedReference("unidade-origem-conexoes") // Nome da referência
    @OneToMany(mappedBy = "origem", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<Conexao> conexoesDeOrigem = new ArrayList<>();

    // Mapeamento para conexões onde esta unidade é o DESTINO
    @JsonManagedReference("unidade-destino-conexoes") // Nome da referência
    @OneToMany(mappedBy = "destino", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<Conexao> conexoesDeDestino = new ArrayList<>();

    public Unidade() {
        // Construtor padrao para a JPA
    }

    public Unidade(String endereco) {
        this.endereco = endereco;
        this.status = Status.ATIVO;
    }

    // --- Getters e Setters ---

    public Long getId() {
        return this.id;
    }

    public String getEndereco() {
        return this.endereco;
    }

    public void setEndereco(String endereco) {
        this.endereco = endereco;
    }

    public Status getStatus() {
        return this.status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    public List<Conexao> getConexoesDeOrigem() {
        return this.conexoesDeOrigem;
    }

    public void setConexoesDeOrigem(List<Conexao> conexoesDeOrigem) {
        this.conexoesDeOrigem = conexoesDeOrigem;
    }

    public List<Conexao> getConexoesDeDestino() {
        return this.conexoesDeDestino;
    }

    public void setConexoesDeDestino(List<Conexao> conexoesDeDestino) {
        this.conexoesDeDestino = conexoesDeDestino;
    }

    // Métodos auxiliares para adicionar/remover conexões (opcional, mas útil)
    public void addConexaoOrigem(Conexao conexao) {
        this.conexoesDeOrigem.add(conexao);
        conexao.setOrigem(this);
    }

    public void removeConexaoOrigem(Conexao conexao) {
        this.conexoesDeOrigem.remove(conexao);
        conexao.setOrigem(null); // Importante para que a conexão não tenha mais uma origem
    }

    public void addConexaoDestino(Conexao conexao) {
        this.conexoesDeDestino.add(conexao);
        conexao.setDestino(this);
    }

    public void removeConexaoDestino(Conexao conexao) {
        this.conexoesDeDestino.remove(conexao);
        conexao.setDestino(null); // Importante para que a conexão não tenha mais um destino
    }
}