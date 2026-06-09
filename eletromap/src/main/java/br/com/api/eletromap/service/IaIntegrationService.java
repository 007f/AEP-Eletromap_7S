package br.com.api.eletromap.service;

import br.com.api.eletromap.model.entities.Unidade;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.file.Path;
import java.nio.file.Paths;

@Service
public class IaIntegrationService {

    private final String PYTHON_CMD = "python";

    /**
     * Resolve o caminho do script dinamicamente a partir da raiz do projeto.
     * Assim, funciona em qualquer computador (Windows, Linux, Mac) sem precisar alterar o código.
     */
    private String getScriptPath() {
        Path caminhoRelativo = Paths.get("src", "main", "java", "br", "com", "api", "eletromap", "IA_", "avaliador_ia.py");
        // O toAbsolutePath() traduz o caminho relativo para o caminho completo do PC que estiver rodando
        return caminhoRelativo.toAbsolutePath().toString();
    }

    public boolean verificarFalhaIminente(Unidade unidade) {
        try {
            String idade = String.valueOf(unidade.getIdadeAnos() != null ? unidade.getIdadeAnos() : 0);
            String temp = String.valueOf(unidade.getTemperaturaC() != null ? unidade.getTemperaturaC() : 25.0);
            String vento = String.valueOf(unidade.getVelocidadeVentoKmh() != null ? unidade.getVelocidadeVentoKmh() : 0.0);
            String carga = String.valueOf(unidade.getCargaMw() != null ? unidade.getCargaMw() : 0.0);
            String manut = String.valueOf(unidade.getDiasUltimaManutencao() != null ? unidade.getDiasUltimaManutencao() : 0);
            String clima = unidade.getCondicaoClimatica() != null ? unidade.getCondicaoClimatica() : "Desconhecido";

            // Usamos o método getScriptPath() aqui na chamada do ProcessBuilder
            ProcessBuilder processBuilder = new ProcessBuilder(
                    PYTHON_CMD, getScriptPath(), idade, temp, vento, carga, manut, clima
            );

            Process process = processBuilder.start();

            BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()));
            String output = reader.readLine();

            int exitCode = process.waitFor();

            if (exitCode == 0 && output != null) {
                return output.trim().equals("1");
            } else {
                BufferedReader errorReader = new BufferedReader(new InputStreamReader(process.getErrorStream()));
                System.err.println("[IA ERRO] O script Python falhou. Código: " + exitCode);
                errorReader.lines().forEach(System.err::println);
            }

        } catch (Exception e) {
            System.err.println("[IA WARNING] Falha ao acionar a IA localmente: " + e.getMessage());
        }

        return false;
    }
}