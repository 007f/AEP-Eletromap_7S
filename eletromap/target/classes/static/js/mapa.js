document.addEventListener('DOMContentLoaded', () => {
    const gerenciarBtn = document.getElementById('btn-gerenciar-unidades');
    const isAdmin = sessionStorage.getItem('isAdmin');

    if (isAdmin === 'true' && gerenciarBtn) {
        gerenciarBtn.style.display = 'inline-flex';
        gerenciarBtn.addEventListener('click', () => { window.location.href = 'admin.html'; });
    }

    const maringaCoords = [-23.425, -51.938];
    const map = L.map('map').setView(maringaCoords, 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
    }).addTo(map);

    const apiUrl = '/unidades';
    const listaUnidadesElement = document.getElementById('lista-unidades');

    async function carregarUnidades() {
        listaUnidadesElement.innerHTML = '<p class="text-center p-4">Carregando mapa elétrico...</p>';
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) throw new Error("Erro na API");
            const unidades = await response.json();
            renderizarLista(unidades);
        } catch (error) {
            listaUnidadesElement.innerHTML = '<p class="status-falha p-4">Falha ao carregar malha de distribuição.</p>';
        }
    }

    function renderizarLista(unidades) {
        listaUnidadesElement.innerHTML = '';
        if (unidades.length === 0) {
            listaUnidadesElement.innerHTML = '<p class="p-4">Nenhuma subestação ativa.</p>';
            return;
        }

        unidades.forEach(unidade => {
            const card = document.createElement('div');
            card.className = 'unidade-card';
            card.dataset.id = unidade.id;

            const statusClasse = getStatusClass(unidade.status);
            const statusLabel = getStatusLabel(unidade.status);

            card.innerHTML = `
                <h3>Subestação ID: #${unidade.id}</h3>
                <p class="endereco">${unidade.endereco}</p>
                <p class="status ${statusClasse}">Módulo: ${statusLabel}</p>
            `;
            listaUnidadesElement.appendChild(card);
        });
    }

    function getStatusClass(status) {
        switch (status) {
            case 'NORMAL': return 'status-ativo';
            case 'FALHA': return 'status-falha';
            case 'IDENTIFICADO': return 'status-indeterminado';
            case 'EM_REPARO': return 'status-indeterminado';
            case 'NORMALIZADO': return 'status-ativo';
            default: return 'status-inativo';
        }
    }

    function getStatusLabel(status) {
        const map = { 'NORMAL': 'Operação Normal', 'FALHA': 'Risco Urgente / Falha', 'IDENTIFICADO': 'Incidente Identificado', 'EM_REPARO': 'Equipe em Campo', 'NORMALIZADO': 'Manutenção Concluída' };
        return map[status] || status;
    }

    carregarUnidades();
});