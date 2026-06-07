// Aguarda o conteúdo do HTML ser totalmente carregado antes de executar o script
document.addEventListener('DOMContentLoaded', () => {

    // --- INÍCIO da lógica de verificação de login
    const gerenciarBtn = document.getElementById('btn-gerenciar-unidades');
    const isAdmin = sessionStorage.getItem('isAdmin');

    // Se o usuário for admin, mostra o botão de gerenciamento
    if (isAdmin === 'true') {
        gerenciarBtn.style.display = 'inline-flex'; // ou 'block'
        
        // Adiciona o link para a página de admin
        gerenciarBtn.addEventListener('click', () => {
            window.location.href = 'admin.html';
        });
    }
    // --- FIM da lógica de verificação de login

    // --- NOVO BLOCO DE INICIALIZAÇÃO DO MAPA ---
    // Coordenadas aproximadas do centro de Maringá, PR
    const maringaCoords = [-23.425, -51.938]; 
    const initialZoom = 13;

    // Inicializa o mapa e o centraliza em Maringá
    const map = L.map('map').setView(maringaCoords, initialZoom);

    // Adiciona a camada de "azulejos" do mapa (o visual das ruas, etc.)
    // Usaremos o OpenStreetMap, que é gratuito e de código aberto
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    // Exemplo: Adiciona um marcador no centro do mapa para simular uma unidade
    L.marker(maringaCoords).addTo(map)
        .bindPopup('<b>Centro de Maringá</b><br>Aqui poderia ser uma unidade.')
        .openPopup();
    // --- FIM DO NOVO BLOCO ---

    // Define a URL base da API e seleciona o elemento da lista no HTML
    const apiUrl = '/unidades';
    const listaUnidadesElement = document.getElementById('lista-unidades');

    /**
     * Função para buscar as unidades da API e iniciar a renderização.
     */
    async function carregarUnidades() {
        // Exibe uma mensagem de "carregando" enquanto busca os dados
        listaUnidadesElement.innerHTML = '<p>Carregando unidades...</p>';

        try {
            const response = await fetch(apiUrl);

            // Verifica se a resposta da requisição foi bem-sucedida (status 2xx)
            if (!response.ok) {
                throw new Error(`Erro na API: ${response.status} ${response.statusText}`);
            }

            const unidades = await response.json();
            renderizarLista(unidades);

        } catch (error) {
            // Em caso de erro na rede ou na API, exibe uma mensagem de erro
            console.error('Falha ao buscar unidades:', error);
            listaUnidadesElement.innerHTML = '<p class="status-falha">Não foi possível carregar as unidades. Verifique se o back-end está em execução.</p>';
        }
    }

    /**
     * Renderiza a lista de unidades na tela, criando um card para cada uma.
     * @param {Array} unidades - A lista de objetos de unidade vindos da API.
     */
    function renderizarLista(unidades) {
        // Limpa a lista antes de adicionar os novos itens
        listaUnidadesElement.innerHTML = '';

        // Se não houver unidades, exibe uma mensagem informativa
        if (unidades.length === 0) {
            listaUnidadesElement.innerHTML = '<p>Nenhuma unidade cadastrada.</p>';
            return;
        }

        // Itera sobre cada unidade e cria seu elemento HTML
        unidades.forEach(unidade => {
            const card = document.createElement('div');
            card.className = 'unidade-card';
            // Adiciona um data-id para identificar o card, se necessário no futuro
            card.dataset.id = unidade.id;

            // Mapeia o status do Enum do back-end para uma classe CSS
            const statusClasse = getStatusClass(unidade.status);

            card.innerHTML = `
                <h3>Unidade ID: ${unidade.id}</h3>
                <p class="endereco">${unidade.endereco}</p>
                <p class="status ${statusClasse}">Status: ${unidade.status}</p>
            `;

            listaUnidadesElement.appendChild(card);
        });
    }

    /**
     * Retorna a classe CSS correspondente para cada status da unidade.
     * @param {string} status - O status vindo do back-end (ex: "ATIVO").
     * @returns {string} - A classe CSS correspondente (ex: "status-ativo").
     */
    function getStatusClass(status) {
        switch (status) {
            case 'ATIVO':
                return 'status-ativo';
            case 'EM_MANUTENCAO':
                return 'status-falha'; // Usando a classe de falha para manutenção
            case 'INATIVO':
                return 'status-inativo';
            case 'INDETERMINADO':
                return 'status-indeterminado';
            default:
                return 'status-inativo'; // Cor padrão para status desconhecidos
        }
    }

    // --- PONTO DE PARTIDA ---
    // Chama a função principal para carregar os dados assim que a página é aberta
    carregarUnidades();

});