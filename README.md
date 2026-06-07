# Mapeamento e Monitoramento da Rede Elétrica Municipal

> Um sistema que monitora a rede elétrica urbana em tempo real, identifica falhas rapidamente e envia alertas para agilizar o reparo.

---

## 📖 Sobre o Projeto

Com o crescimento acelerado das cidades, é cada vez mais desafiador garantir que a distribuição de energia elétrica funcione sem interrupções longas. Este projeto propõe uma solução de software que se integra ao sistema de gestão da Copel (PR) e recebe dados de sensores inteligentes espalhados pela cidade. A partir desses dados, o sistema:

- Mapeia a rede elétrica em um **dashboard interativo**;
- Detecta falhas automaticamente e envia **alertas imediatos**;
- Simplifica o fluxo de abertura e acompanhamento de **chamados de manutenção**;
- Gera relatórios e gráficos para ajudar na tomada de decisão e no aprimoramento contínuo.

Tudo isso em uma interface leve, fácil de usar e pensada para operadores de controle e técnicos de campo.

---

## 🎯 Objetivos e Funcionalidades

### 1. Integração de Dados
- **Consumo de API da Copel**   
Carrega informações em tempo real para saber quais pontos da rede estão ativos ou apresentando falhas.
- **Recepção de Dados em JSON**   
O sistema recebe dados dos sensores (em JSON) contendo campos como:
```json
{
  "sensorId": "SENSOR-123",
  "timestamp": "2025-05-31T10:15:00Z",
  "voltageLevel": 220.5,
  "status": "OK" // ou "FALHA"
}
```

### 2. Dashboard de Monitoramento
- **Mapa Interativo**   
Exibe a cidade com marcadores coloridos (verde = tudo ok, vermelho = falha) para cada sensor instalado.
- **Filtros Dinâmicos**   
É possível filtrar por região, tipo de falha (queda total, oscilação, etc.) e período (última hora, dia, semana).
- **Lista de Eventos Recentes**   
Na lateral, mostra uma lista com as últimas falhas detectadas. Basta clicar para ver detalhes e abrir um chamado de manutenção.

### 3. Alertas e Notificações
- **Push Notification & E-mail**   
Assim que um sensor reporta falha, o operador recebe um alerta no navegador ou um e-mail (configurável).
- **Registro em Log**   
Cada alerta fica registrado em um log histórico com data, hora, sensor, tipo de falha e status (“lido” ou “não lido”).

### 4. Gestão de Incidentes
- **Abertura de Chamados**   
No próprio dashboard, o operador pode abrir um chamado vinculando o sensor afetado, descrevendo o problema e atribuindo prioridade.
- **Atualização de Status pelo Técnico**   
O técnico de campo recebe o chamado no celular/tablet e atualiza o status (ex.: “Em Andamento”, “Resolvido”). Tudo fica salvo no histórico para consulta posterior.

### 5. Relatórios e Histórico
- **Exportação de Dados (CSV/PDF)**   
Gere relatórios com métricas como “tempo médio de resposta”, “número de falhas por dia” e outros indicadores.
- **Gráficos Simples**   
Visualize, diretamente no front-end, gráficos que mostram a evolução de falhas ao longo do tempo.

### 6. Administração
- **Gerenciamento de Usuários**   
Crie, edite ou desative contas de Operador, Técnico e Administrador. Cada perfil tem permissões específicas.
- **Configuração de Limites de Alerta**   
Defina, por exemplo, a tensão mínima que deve ser considerada falha antes de disparar um alerta.

---

## 🏗️ Arquitetura e Tecnologias

- **Back-end**
  - Linguagem: **Java**
  - Framework: **Spring**
  - Banco de Dados: **H2** (em memória) ou **SQLite** (persistente em arquivo)
- **Front-end**
  - Linguagens: **HTML**, **CSS** e **JavaScript**
  - Comunicação: `fetch()` (função do JavaScript) para consumir a API REST do back-end
  - Ferramentas adicionais (**opcionais**): **React** ou **Angular**. **Leaflet** ou **OpenLayers** para renderizar o mapa interativo da cidade
- **Outras Ferramentas**
  - **Maven** (build e gerenciamento de dependências Java)
  - **npm** (opcional, mas necessário em caso de front-end com React)
 
---

## 🚀 Como Começar

### Pré-Requisitos
1. **Java JDK 21**
2. **Git**
3. **Node.js** e **npm** (opcionais)
4. **DB Browser for SQLite** (opcional e só se for utilizar SQLite)
