// Variáveis Globais
let allUnits = [];
let filteredUnits = [];
let currentEditingId = null;
const apiUrl = '/unidades';

// Elementos do DOM
const elements = {
    searchInput: document.getElementById('search-address'),
    filterStatus: document.getElementById('filter-status'),
    sortBy: document.getElementById('sort-by'),
    clearFiltersBtn: document.getElementById('btn-clear-filters'),
    addUnitBtn: document.getElementById('btn-add-unit'),
    unitsTableBody: document.getElementById('units-table-body'),
    unitsCount: document.getElementById('units-count'),
    unitModal: document.getElementById('unit-modal'),
    deleteModal: document.getElementById('delete-modal'),
    unitForm: document.getElementById('unit-form'),
    modalTitle: document.getElementById('modal-title'),
    unitAddress: document.getElementById('unit-address'),
    unitStatus: document.getElementById('unit-status'),
    closeModalBtn: document.getElementById('close-modal'),
    cancelModalBtn: document.getElementById('cancel-modal'),
    saveUnitBtn: document.getElementById('save-unit'),
    cancelDeleteBtn: document.getElementById('cancel-delete'),
    confirmDeleteBtn: document.getElementById('confirm-delete'),
    toastContainer: document.getElementById('toast-container')
};

// Inicializar a Aplicação
document.addEventListener('DOMContentLoaded', function() {
    loadUnits();
    bindEvents();
});

// Vincular todos os 'eventListeners'
function bindEvents() {
    // Eventos de pesquisa e filtragem
    elements.searchInput.addEventListener('input', debounce(applyFilters, 300));
    elements.filterStatus.addEventListener('change', applyFilters);
    elements.sortBy.addEventListener('change', applyFilters);
    elements.clearFiltersBtn.addEventListener('click', clearFilters);

    // Eventos modal
    elements.addUnitBtn.addEventListener('click', openAddModal);
    elements.closeModalBtn.addEventListener('click', closeModal);
    elements.cancelModalBtn.addEventListener('click', closeModal);
    elements.unitForm.addEventListener('submit', handleFormSubmit);

    // Eventos deletar modal
    elements.cancelDeleteBtn.addEventListener('click', closeDeleteModal);
    elements.confirmDeleteBtn.addEventListener('click', confirmDelete);

    // Fechar modais quando clicado fora
    elements.unitModal.addEventListener('click', function(e) {
        if (e.target === elements.unitModal) closeModal();
    });
    elements.deleteModal.addEventListener('click', function(e) {
        if (e.target === elements.deleteModal) closeDeleteModal();
    });

    // Tecla ESC para fechar modais
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
            closeDeleteModal();
        }
    });
}

// Funções API
async function loadUnits() {
    try {
        showLoadingState();
        const response = await fetch(apiUrl);
                
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
                
        allUnits = await response.json();
        filteredUnits = [...allUnits];
        applyFilters();
        showToast('Unidades carregadas com sucesso!', 'success');
    } catch (error) {
        console.error('Erro ao carregar unidades:', error);
        showErrorState();
        showToast('Erro ao carregar unidades. Verifique sua conexão.', 'error');
    }
}

async function createUnit(unitData) {
    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(unitData)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const newUnit = await response.json();
        allUnits.push(newUnit);
        applyFilters();
        showToast('Unidade criada com sucesso!', 'success');
        return newUnit;
    } catch (error) {
        console.error('Erro ao criar unidade:', error);
        showToast('Erro ao criar unidade. Tente novamente.', 'error');
        throw error;
    }
}

async function updateUnit(id, unitData) {
    try {
        const response = await fetch(`${apiUrl}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(unitData)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const updatedUnit = await response.json();
        const index = allUnits.findIndex(unit => unit.id === id);
        if (index !== -1) {
            allUnits[index] = updatedUnit;
        }
        applyFilters();
        showToast('Unidade atualizada com sucesso!', 'success');
        return updatedUnit;
    } catch (error) {
        console.error('Erro ao atualizar unidade:', error);
        showToast('Erro ao atualizar unidade. Tente novamente.', 'error');
        throw error;
    }
}

async function deleteUnit(id) {
    try {
        const response = await fetch(`${apiUrl}/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        allUnits = allUnits.filter(unit => unit.id !== id);
        applyFilters();
        showToast('Unidade excluída com sucesso!', 'success');
    } catch (error) {
        console.error('Erro ao excluir unidade:', error);
        showToast('Erro ao excluir unidade. Tente novamente.', 'error');
        throw error;
    }
}

// Funções de Busca e Filtragem
function applyFilters() {
    const searchTerm = elements.searchInput.value.toLowerCase().trim();
    const statusFilter = elements.filterStatus.value;
    const sortBy = elements.sortBy.value;

    // Filtrar unidades
    filteredUnits = allUnits.filter(unit => {
        const matchesSearch = !searchTerm || 
            unit.endereco.toLowerCase().includes(searchTerm);
        const matchesStatus = !statusFilter || 
            unit.status === statusFilter;
                
        return matchesSearch && matchesStatus;
    });

    // Ordenar unidades
    filteredUnits.sort((a, b) => {
        if (sortBy === 'endereco') {
            return a.endereco.localeCompare(b.endereco);
        } else if (sortBy === 'status') {
            return a.status.localeCompare(b.status);
        }
        return 0;
    });

    renderUnits();
    updateUnitsCount();
}

function clearFilters() {
    elements.searchInput.value = '';
    elements.filterStatus.value = '';
    elements.sortBy.value = 'endereco';
    applyFilters();
}

// Funções para exibir/renderizar
function renderUnits() {
    if (filteredUnits.length === 0) {
        showEmptyState();
        return;
    }

    const tbody = elements.unitsTableBody;
    tbody.innerHTML = filteredUnits.map(unit => `
        <tr class="hover:bg-gray-50 transition-colors">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                #${unit.id}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                ${escapeHtml(unit.endereco)}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClasses(unit.status)}">
                    <i class="fas ${getStatusIcon(unit.status)} mr-1"></i>
                    ${getStatusLabel(unit.status)}
                </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex items-center justify-end space-x-2">
                    <button 
                        onclick="openEditModal(${unit.id})"
                        class="text-blue-600 hover:text-blue-900 transition-colors p-1"
                        title="Editar unidade"
                    >
                        <i class="fas fa-edit"></i>
                    </button>
                    <button 
                        onclick="openDeleteModal(${unit.id})"
                        class="text-red-600 hover:text-red-900 transition-colors p-1"
                        title="Excluir unidade"
                    >
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function showLoadingState() {
    elements.unitsTableBody.innerHTML = `
        <tr class="text-center">
            <td colspan="4" class="px-6 py-12 text-gray-500">
                <div class="flex flex-col items-center">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                    <p class="text-lg font-medium">Carregando unidades...</p>
                    <p class="text-sm">Aguarde enquanto os dados são carregados da API</p>
                </div>
            </td>
        </tr>
    `;
}

function showEmptyState() {
    const hasFilters = elements.searchInput.value || elements.filterStatus.value;
    elements.unitsTableBody.innerHTML = `
        <tr class="text-center">
            <td colspan="4" class="px-6 py-12 text-gray-500">
                <div class="flex flex-col items-center">
                    <i class="fas ${hasFilters ? 'fa-search' : 'fa-database'} text-4xl text-gray-300 mb-4"></i>
                    <p class="text-lg font-medium">
                        ${hasFilters ? 'Nenhuma unidade encontrada' : 'Nenhuma unidade cadastrada'}
                    </p>
                    <p class="text-sm">
                        ${hasFilters ? 'Tente ajustar os filtros de busca' : 'Clique em "Nova Unidade" para começar'}
                    </p>
                </div>
            </td>
        </tr>
    `;
}

function showErrorState() {
    elements.unitsTableBody.innerHTML = `
        <tr class="text-center">
            <td colspan="4" class="px-6 py-12 text-gray-500">
                <div class="flex flex-col items-center">
                    <i class="fas fa-exclamation-triangle text-4xl text-red-300 mb-4"></i>
                    <p class="text-lg font-medium text-red-600">Erro ao carregar unidades</p>
                    <p class="text-sm">Verifique sua conexão e tente novamente</p>
                    <button 
                        onclick="loadUnits()" 
                        class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <i class="fas fa-refresh mr-2"></i>
                        Tentar Novamente
                    </button>
                </div>
            </td>
        </tr>
    `;
}

function updateUnitsCount() {
    elements.unitsCount.textContent = filteredUnits.length;
}

// Funções Modal
function openAddModal() {
    currentEditingId = null;
    elements.modalTitle.textContent = 'Nova Unidade';
    elements.unitForm.reset();
    elements.saveUnitBtn.innerHTML = '<i class="fas fa-save mr-2"></i>Salvar';
    showModal();
}

function openEditModal(id) {
    const unit = allUnits.find(u => u.id === id);
    if (!unit) return;

    currentEditingId = id;
    elements.modalTitle.textContent = 'Editar Unidade';
    elements.unitAddress.value = unit.endereco;
    elements.unitStatus.value = unit.status;
    elements.saveUnitBtn.innerHTML = '<i class="fas fa-save mr-2"></i>Atualizar';
    showModal();
}

function showModal() {
    elements.unitModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    elements.unitAddress.focus();
}

function closeModal() {
    elements.unitModal.classList.add('hidden');
    document.body.style.overflow = 'auto';
    elements.unitForm.reset();
    currentEditingId = null;
}

function openDeleteModal(id) {
    currentEditingId = id;
    elements.deleteModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeDeleteModal() {
    elements.deleteModal.classList.add('hidden');
    document.body.style.overflow = 'auto';
    currentEditingId = null;
}

// Manipulação do Formulário
async function handleFormSubmit(e) {
    e.preventDefault();
            
    const formData = new FormData(elements.unitForm);
    const unitData = {
        endereco: formData.get('endereco').trim(),
        status: formData.get('status')
    };

    // Validação
    if (!unitData.endereco || !unitData.status) {
        showToast('Por favor, preencha todos os campos obrigatórios.', 'error');
        return;
    }

    try {
        elements.saveUnitBtn.disabled = true;
        elements.saveUnitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Salvando...';

        if (currentEditingId) {
            await updateUnit(currentEditingId, unitData);
        } else {
            await createUnit(unitData);
        }

        closeModal();
    } catch (error) {
        // Error already handled in API functions
    } finally {
        elements.saveUnitBtn.disabled = false;
        elements.saveUnitBtn.innerHTML = currentEditingId ? 
            '<i class="fas fa-save mr-2"></i>Atualizar' : 
            '<i class="fas fa-save mr-2"></i>Salvar';
    }
}

async function confirmDelete() {
    if (!currentEditingId) return;

    try {
        elements.confirmDeleteBtn.disabled = true;
        elements.confirmDeleteBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Excluindo...';

        await deleteUnit(currentEditingId);
        closeDeleteModal();
    } catch (error) {
        // Error already handled in API functions
    } finally {
        elements.confirmDeleteBtn.disabled = false;
        elements.confirmDeleteBtn.innerHTML = '<i class="fas fa-trash mr-2"></i>Excluir';
    }
}

// Utility Functions
function getStatusClasses(status) {
    const classes = {
        'ativo': 'bg-green-100 text-green-800',
        'inativo': 'bg-red-100 text-red-800',
        'manutencao': 'bg-yellow-100 text-yellow-800'
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
}

function getStatusIcon(status) {
    const icons = {
        'ativo': 'fa-check-circle',
        'inativo': 'fa-times-circle',
        'manutencao': 'fa-tools'
    };
    return icons[status] || 'fa-question-circle';
}

function getStatusLabel(status) {
    const labels = {
        'ativo': 'Ativo',
        'inativo': 'Inativo',
        'manutencao': 'Manutenção'
    };
    return labels[status] || status;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Toast Notifications
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    const bgColor = type === 'success' ? 'bg-green-500' : 
                    type === 'error' ? 'bg-red-500' : 'bg-blue-500';
    const icon = type === 'success' ? 'fa-check-circle' : 
                type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle';

    toast.className = `${bgColor} text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2 transform transition-all duration-300 translate-x-full opacity-0`;
    toast.innerHTML = `
        <i class="fas ${icon}"></i>
        <span>${escapeHtml(message)}</span>
        <button onclick="this.parentElement.remove()" class="ml-2 text-white hover:text-gray-200">
            <i class="fas fa-times"></i>
        </button>
    `;

    elements.toastContainer.appendChild(toast);

    // Animate in
    setTimeout(() => {
        toast.classList.remove('translate-x-full', 'opacity-0');
    }, 100);

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (toast.parentElement) {
            toast.classList.add('translate-x-full', 'opacity-0');
            setTimeout(() => toast.remove(), 300);
        }
    }, 5000);
}

// Global functions for inline event handlers
window.openEditModal = openEditModal;
window.openDeleteModal = openDeleteModal;
