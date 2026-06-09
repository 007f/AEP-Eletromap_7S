package br.com.api.eletromap.model.entities;

import br.com.api.eletromap.model.enums.Status;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;

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

    // --- NOVOS ATRIBUTOS PARA A INTELIGÊNCIA ARTIFICIAL ---
    private Integer idadeAnos;
    private Double temperaturaC;
    private Double velocidadeVentoKmh;
    private Double cargaMw;
    private Integer diasUltimaManutencao;
    private String condicaoClimatica;

    // Mapeamento para conexões onde esta unidade é a ORIGEM
    // JsonManagerReference impede a chamada de objetos infinitos que se apontam
    @JsonManagedReference("unidade-origem-conexoes")
    @OneToMany(mappedBy = "origem", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<Conexao> conexoesDeOrigem = new ArrayList<>();

    // Mapeamento para conexões onde esta unidade é o DESTINO
    @JsonManagedReference("unidade-destino-conexoes")
    @OneToMany(mappedBy = "destino", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<Conexao> conexoesDeDestino = new ArrayList<>();

    public Unidade() {
        // Construtor padrão para a JPA
    }

    // Construtor atualizado
    public Unidade(String endereco, Integer idadeAnos) {
        this.endereco = endereco;
        this.status = Status.NORMAL; // Conforme seu enum
        this.idadeAnos = idadeAnos;
    }

    // --- Getters e Setters (Antigos e Novos) ---

    public Long getId() { return this.id; }
    public String getEndereco() { return this.endereco; }
    public void setEndereco(String endereco) { this.endereco = endereco; }
    public Status getStatus() { return this.status; }
    public void setStatus(Status status) { this.status = status; }

    public Integer getIdadeAnos() { return idadeAnos; }
    public void setIdadeAnos(Integer idadeAnos) { this.idadeAnos = idadeAnos; }

    public Double getTemperaturaC() { return temperaturaC; }
    public void setTemperaturaC(Double temperaturaC) { this.temperaturaC = temperaturaC; }

    public Double getVelocidadeVentoKmh() { return velocidadeVentoKmh; }
    public void setVelocidadeVentoKmh(Double velocidadeVentoKmh) { this.velocidadeVentoKmh = velocidadeVentoKmh; }

    public Double getCargaMw() { return cargaMw; }
    public void setCargaMw(Double cargaMw) { this.cargaMw = cargaMw; }

    public Integer getDiasUltimaManutencao() { return diasUltimaManutencao; }
    public void setDiasUltimaManutencao(Integer diasUltimaManutencao) { this.diasUltimaManutencao = diasUltimaManutencao; }

    public String getCondicaoClimatica() { return condicaoClimatica; }
    public void setCondicaoClimatica(String condicaoClimatica) { this.condicaoClimatica = condicaoClimatica; }

    public List<Conexao> getConexoesDeOrigem() { return this.conexoesDeOrigem; }
    public void setConexoesDeOrigem(List<Conexao> conexoesDeOrigem) { this.conexoesDeOrigem = conexoesDeOrigem; }
    public List<Conexao> getConexoesDeDestino() { return this.conexoesDeDestino; }
    public void setConexoesDeDestino(List<Conexao> conexoesDeDestino) { this.conexoesDeDestino = conexoesDeDestino; }

    // --- Métodos auxiliares de Grafo ---
    public void addConexaoOrigem(Conexao conexao) {
        this.conexoesDeOrigem.add(conexao);
        conexao.setOrigem(this);
    }
    public void removeConexaoOrigem(Conexao conexao) {
        this.conexoesDeOrigem.remove(conexao);
        conexao.setOrigem(null);
    }
    public void addConexaoDestino(Conexao conexao) {
        this.conexoesDeDestino.add(conexao);
        conexao.setDestino(this);
    }
    public void removeConexaoDestino(Conexao conexao) {
        this.conexoesDeDestino.remove(conexao);
        conexao.setDestino(null);
    }
}