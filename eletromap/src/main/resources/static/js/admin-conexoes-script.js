/**
 * Script para gerenciar a página de Conexões (admin-conexoes.html)
 * Realiza as operações de CRUD para conexões, comunicando-se com a API REST.
 */

// --- Bloco de Configuração e Estado Global ---

// 1. Configuração da API (A CORREÇÃO MAIS IMPORTANTE)
// Define a URL base completa do seu servidor back-end.
const API_BASE_URL = 'http://localhost:8080';
const CONEXOES_API_URL = `${API_BASE_URL}/conexoes`;
const UNIDADES_API_URL = `${API_BASE_URL}/unidades`;

// 2. Variáveis de Estado da Aplicação
let allConexoes = [];      // Guarda a lista completa de conexões vinda da API
let allUnits = [];         // Guarda a lista de unidades para os formulários
let currentIdForDelete = null; // Guarda o ID da conexão a ser excluída

// --- Fim do Bloco de Configuração ---


// --- Inicialização da Aplicação ---

// 3. Ponto de Entrada: Executa quando o HTML está pronto
document.addEventListener('DOMContentLoaded', initializePage);

/**
 * Função principal que inicializa a página.
 */
async function initializePage() {
    const elements = getDOMElements();
    const eventHandlers = createEventHandlers(elements);
    bindEvents(elements, eventHandlers);
    
    showLoadingState(elements);
    try {
        // Carrega os dados de conexões e unidades em paralelo para mais performance
        await Promise.all([
            eventHandlers.handleLoadConexoes(),
            eventHandlers.handleLoadUnits()
        ]);
        showToast('Dados carregados com sucesso!', 'success', elements);
    } catch (error) {
        showErrorState(elements, error);
        showToast('Erro ao carregar dados iniciais.', 'error', elements);
    }
}

// --- Funções de Lógica e Manipulação do DOM ---

/**
 * Agrupa todas as seleções de elementos do DOM em um só lugar.
 * @returns {object} Um objeto com referências para os elementos do HTML.
 */
function getDOMElements() {
    return {
        // Tabela e Contagem
        tableBody: document.getElementById('conexoes-table-body'),
        countElement: document.getElementById('conexoes-count'),
        // Filtros
        searchInput: document.getElementById('search-unit-id'),
        sortBy: document.getElementById('sort-by'),
        // Botões
        addConexaoBtn: document.getElementById('btn-add-conexao'),
        // Modal de Criação
        conexaoModal: document.getElementById('conexao-modal'),
        conexaoForm: document.getElementById('conexao-form'),
        origemSelect: document.getElementById('conexao-origem'),
        destinoSelect: document.getElementById('conexao-destino'),
        closeModalBtn: document.getElementById('close-modal'),
        cancelModalBtn: document.getElementById('cancel-modal'),
        // Modal de Exclusão
        deleteModal: document.getElementById('delete-modal'),
        cancelDeleteBtn: document.getElementById('cancel-delete'),
        confirmDeleteBtn: document.getElementById('confirm-delete'),
        // Notificações
        toastContainer: document.getElementById('toast-container'),
    };
}

/**
 * Cria as funções que manipularão os eventos.
 * @param {object} elements - O objeto de elementos do DOM.
 * @returns {object} Um objeto com as funções de evento.
 */
function createEventHandlers(elements) {
    const handlers = {
        // Carrega as conexões da API e renderiza a tabela
        handleLoadConexoes: async () => {
            allConexoes = await fetchAPI(CONEXOES_API_URL);
            handlers.applyFiltersAndSort();
        },
        // Carrega as unidades e popula os seletores do modal
        handleLoadUnits: async () => {
            allUnits = await fetchAPI(UNIDADES_API_URL);
            populateSelects(elements, allUnits);
        },
        // Aplica os filtros e a ordenação atuais e renderiza a tabela
        applyFiltersAndSort: () => {
            const searchTerm = elements.searchInput.value.toLowerCase().trim();
            const sortBy = elements.sortBy.value;

            const filtered = allConexoes.filter(c => {
                if (!searchTerm) return true;
                const originId = c.idOrigem?.toString() || '';
                const destId = c.idDestino?.toString() || '';
                return originId.includes(searchTerm) || destId.includes(searchTerm);
            });

            filtered.sort((a, b) => {
                switch (sortBy) {
                    case 'origem': return a.idOrigem - b.idOrigem;
                    case 'destino': return a.idDestino - b.idDestino;
                    default: return a.id - b.id;
                }
            });
            
            renderTable(elements, filtered, allUnits);
            updateCount(elements, filtered.length);
        },
        // Lida com o envio do formulário de criação
        handleFormSubmit: async (event) => {
            event.preventDefault();
            const origemId = elements.origemSelect.value;
            const destinoId = elements.destinoSelect.value;

            if (!origemId || !destinoId) {
                return showToast('Por favor, selecione a origem e o destino.', 'error', elements);
            }
            if (origemId === destinoId) {
                return showToast('A origem e o destino não podem ser iguais.', 'error', elements);
            }

            try {
                const newConnectionData = {
                    unidadeOrigemId: parseInt(origemId),
                    unidadeDestinoId: parseInt(destinoId)
                };
                await fetchAPI(CONEXOES_API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(newConnectionData),
                });
                await handlers.handleLoadConexoes();
                showToast('Conexão criada com sucesso!', 'success', elements);
                closeModal(elements.conexaoModal);
            } catch (error) {
                showToast('Falha ao criar conexão.', 'error', elements);
                console.error("Erro ao criar conexão:", error);
            }
        },
        // Abre o modal de exclusão
        handleOpenDeleteModal: (id) => {
            currentIdForDelete = id;
            openModal(elements.deleteModal);
        },
        // Confirma e executa a exclusão
        handleConfirmDelete: async () => {
            if (!currentIdForDelete) return;
            try {
                await fetchAPI(`${CONEXOES_API_URL}/${currentIdForDelete}`, { method: 'DELETE' });
                await handlers.handleLoadConexoes();
                showToast('Conexão excluída com sucesso!', 'success', elements);
            } catch (error) {
                showToast('Falha ao excluir conexão.', 'error', elements);
                console.error("Erro ao excluir conexão:", error);
            } finally {
                closeModal(elements.deleteModal);
                currentIdForDelete = null;
            }
        },
    };
    return handlers;
}

/**
 * Vincula todas as funções de evento aos elementos do DOM.
 * @param {object} elements - Objeto de elementos do DOM.
 * @param {object} handlers - Objeto com as funções de evento.
 */
function bindEvents(elements, handlers) {
    elements.searchInput.addEventListener('input', debounce(handlers.applyFiltersAndSort, 300));
    elements.sortBy.addEventListener('change', handlers.applyFiltersAndSort);
    
    elements.addConexaoBtn.addEventListener('click', () => openModal(elements.conexaoModal));
    elements.closeModalBtn.addEventListener('click', () => closeModal(elements.conexaoModal));
    elements.cancelModalBtn.addEventListener('click', () => closeModal(elements.conexaoModal));
    elements.conexaoForm.addEventListener('submit', handlers.handleFormSubmit);
    
    elements.cancelDeleteBtn.addEventListener('click', () => closeModal(elements.deleteModal));
    elements.confirmDeleteBtn.addEventListener('click', handlers.handleConfirmDelete);

    // Delegação de eventos para o botão de excluir na tabela
    elements.tableBody.addEventListener('click', (event) => {
        const deleteButton = event.target.closest('button[data-action="delete"]');
        if (deleteButton) {
            const id = parseInt(deleteButton.dataset.id, 10);
            handlers.handleOpenDeleteModal(id);
        }
    });
}


// --- Funções de Renderização e UI ---

/**
 * Preenche a tabela com os dados das conexões.
 * @param {object} elements - Objeto de elementos do DOM.
 * @param {Array} conexoes - A lista de conexões a ser renderizada.
 * @param {Array} units - A lista de todas as unidades para encontrar os endereços.
 */
function renderTable(elements, conexoes, units) {
    if (conexoes.length === 0) {
        showEmptyState(elements);
        return;
    }
    
    const unitsMap = new Map(units.map(u => [u.id, u.endereco]));

    elements.tableBody.innerHTML = conexoes.map(conexao => `
        <tr class="hover:bg-gray-50">
            <td class="px-6 py-4 text-sm font-medium text-gray-900">#${conexao.id}</td>
            <td class="px-6 py-4 text-sm text-gray-700">
                <span class="font-bold">ID: ${conexao.idOrigem}</span> - ${escapeHtml(unitsMap.get(conexao.idOrigem) || 'N/A')}
            </td>
            <td class="px-6 py-4 text-sm text-gray-700">
                <span class="font-bold">ID: ${conexao.idDestino}</span> - ${escapeHtml(unitsMap.get(conexao.idDestino) || 'N/A')}
            </td>
            <td class="px-6 py-4 text-right">
                <button data-action="delete" data-id="${conexao.id}" title="Excluir conexão" class="text-red-600 hover:text-red-900 p-1">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

/**
 * Popula os menus de seleção (origem e destino) no modal.
 * @param {object} elements - Objeto de elementos do DOM.
 * @param {Array} units - A lista de unidades para popular os seletores.
 */
function populateSelects(elements, units) {
    const createOption = unit => `<option value="${unit.id}">ID: ${unit.id} - ${escapeHtml(unit.endereco)}</option>`;
    const optionsHtml = units.map(createOption).join('');
    
    elements.origemSelect.innerHTML = `<option value="">Selecione a unidade de origem</option>${optionsHtml}`;
    elements.destinoSelect.innerHTML = `<option value="">Selecione a unidade de destino</option>${optionsHtml}`;
}

function updateCount(elements, count) {
    elements.countElement.textContent = count;
}

function showLoadingState(elements) {
    elements.tableBody.innerHTML = `<tr><td colspan="4" class="text-center p-12 text-gray-500">Carregando...</td></tr>`;
}

function showEmptyState(elements) {
    elements.tableBody.innerHTML = `<tr><td colspan="4" class="text-center p-12 text-gray-500">Nenhuma conexão encontrada.</td></tr>`;
}

function showErrorState(elements, error) {
    console.error("Erro na API:", error);
    elements.tableBody.innerHTML = `<tr><td colspan="4" class="text-center p-12 text-red-500">Erro ao carregar os dados.</td></tr>`;
}


// --- Funções Utilitárias ---

/**
 * Função genérica para fazer requisições à API.
 * @param {string} url - A URL da API.
 * @param {object} options - As opções da requisição fetch.
 * @returns {Promise<any>} O resultado JSON da requisição.
 */
async function fetchAPI(url, options = {}) {
    const response = await fetch(url, options);
    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Falha na requisição: ${response.status} ${response.statusText} - ${errorBody}`);
    }
    // Retorna um JSON vazio se a resposta for 204 No Content (como em um DELETE)
    return response.status === 204 ? {} : response.json();
}

function openModal(modalElement) {
    modalElement.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeModal(modalElement) {
    modalElement.classList.add('hidden');
    document.body.style.overflow = 'auto';
}

function showToast(message, type = 'info', elements) {
    const toast = document.createElement('div');
    const colors = { info: 'bg-blue-500', success: 'bg-green-500', error: 'bg-red-500' };
    toast.className = `${colors[type]} text-white px-4 py-3 rounded-lg shadow-lg`;
    toast.textContent = message;
    elements.toastContainer.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function debounce(func, wait) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

function escapeHtml(text = '') {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}