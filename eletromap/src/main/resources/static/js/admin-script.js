let allUnits = [];
let filteredUnits = [];
let currentEditingId = null;
const apiUrl = '/unidades';

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

document.addEventListener('DOMContentLoaded', () => {
    loadUnits();
    bindEvents();
});

function bindEvents() {
    elements.searchInput.addEventListener('input', debounce(applyFilters, 300));
    elements.filterStatus.addEventListener('change', applyFilters);
    elements.sortBy.addEventListener('change', applyFilters);
    if(elements.clearFiltersBtn) elements.clearFiltersBtn.addEventListener('click', clearFilters);

    elements.addUnitBtn.addEventListener('click', openAddModal);
    elements.closeModalBtn.addEventListener('click', closeModal);
    elements.cancelModalBtn.addEventListener('click', closeModal);
    elements.unitForm.addEventListener('submit', handleFormSubmit);
    elements.cancelDeleteBtn.addEventListener('click', closeDeleteModal);
    elements.confirmDeleteBtn.addEventListener('click', confirmDelete);
}

async function loadUnits() {
    try {
        showLoadingState();
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error("Erro de conexão com a API");
        allUnits = await response.json();
        filteredUnits = [...allUnits];
        applyFilters();
    } catch (error) {
        showErrorState();
    }
}

function applyFilters() {
    const searchTerm = elements.searchInput.value.toLowerCase().trim();
    const statusFilter = elements.filterStatus.value;
    const sortBy = elements.sortBy.value;

    filteredUnits = allUnits.filter(unit => {
        const matchesSearch = !searchTerm || unit.endereco.toLowerCase().includes(searchTerm);
        const matchesStatus = !statusFilter || unit.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    filteredUnits.sort((a, b) => {
        return sortBy === 'endereco' ? a.endereco.localeCompare(b.endereco) : a.status.localeCompare(b.status);
    });

    renderUnits();
    elements.unitsCount.textContent = filteredUnits.length;
}

function renderUnits() {
    if (filteredUnits.length === 0) {
        showEmptyState();
        return;
    }

    elements.unitsTableBody.innerHTML = filteredUnits.map(unit => `
        <tr class="hover:bg-gray-50">
            <td class="px-6 py-4 font-medium text-gray-900">#${unit.id}</td>
            <td class="px-6 py-4 text-sm">${escapeHtml(unit.endereco)}</td>
            <td class="px-6 py-4 text-xs text-gray-500">
                Temp: ${unit.temperaturaC ?? 'N/A'}°C | Vent: ${unit.velocidadeVentoKmh ?? 'N/A'}km/h<br>
                Carga: ${unit.cargaMw ?? 'N/A'}MW | Idade: ${unit.idadeAnos ?? 'N/A'} anos
            </td>
            <td class="px-6 py-4">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClasses(unit.status)}">
                    <i class="fas ${getStatusIcon(unit.status)} mr-1"></i>
                    ${getStatusLabel(unit.status)}
                </span>
            </td>
            <td class="px-6 py-4 text-right space-x-2">
                <button onclick="openEditModal(${unit.id})" class="text-blue-600 hover:text-blue-900"><i class="fas fa-edit"></i></button>
                <button onclick="openDeleteModal(${unit.id})" class="text-red-600 hover:text-red-900"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

async function handleFormSubmit(e) {
    e.preventDefault();
    const formData = new FormData(elements.unitForm);

    const unitData = {
        endereco: formData.get('endereco').trim(),
        status: formData.get('status'),
        idadeAnos: formData.get('idadeAnos') ? parseInt(formData.get('idadeAnos')) : null,
        temperaturaC: formData.get('temperaturaC') ? parseFloat(formData.get('temperaturaC')) : null,
        velocidadeVentoKmh: formData.get('velocidadeVentoKmh') ? parseFloat(formData.get('velocidadeVentoKmh')) : null,
        cargaMw: formData.get('cargaMw') ? parseFloat(formData.get('cargaMw')) : null,
        diasUltimaManutencao: formData.get('diasUltimaManutencao') ? parseInt(formData.get('diasUltimaManutencao')) : null,
        condicaoClimatica: formData.get('condicaoClimatica') || null
    };

    try {
        const method = currentEditingId ? 'PUT' : 'POST';
        const url = currentEditingId ? `${apiUrl}/${currentEditingId}` : apiUrl;

        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(unitData)
        });

        if (!response.ok) {
            const serverMessage = await response.text();
            throw new Error(serverMessage || "Falha na operação.");
        }

        showToast(currentEditingId ? 'Unidade atualizada!' : 'Unidade criada com sucesso!', 'success');
        closeModal();
        loadUnits();
    } catch (error) {
        showToast(error.message, 'error');
    }
}

function openEditModal(id) {
    const unit = allUnits.find(u => u.id === id);
    if (!unit) return;

    currentEditingId = id;
    elements.modalTitle.textContent = 'Editar Unidade';
    elements.unitAddress.value = unit.endereco;
    elements.unitStatus.value = unit.status;

    document.getElementById('unit-idade').value = unit.idadeAnos ?? '';
    document.getElementById('unit-temp').value = unit.temperaturaC ?? '';
    document.getElementById('unit-vento').value = unit.velocidadeVentoKmh ?? '';
    document.getElementById('unit-carga').value = unit.cargaMw ?? '';
    document.getElementById('unit-manutencao').value = unit.diasUltimaManutencao ?? '';
    document.getElementById('unit-clima').value = unit.condicaoClimatica ?? '';

    elements.unitModal.classList.remove('hidden');
}

function openAddModal() {
    currentEditingId = null;
    elements.modalTitle.textContent = 'Nova Unidade';
    elements.unitForm.reset();
    elements.unitModal.classList.remove('hidden');
}

function closeModal() { elements.unitModal.classList.add('hidden'); }
function openDeleteModal(id) { currentEditingId = id; elements.deleteModal.classList.remove('hidden'); }
function closeDeleteModal() { elements.deleteModal.classList.add('hidden'); }

async function confirmDelete() {
    try {
        await fetch(`${apiUrl}/${currentEditingId}`, { method: 'DELETE' });
        showToast('Unidade removida!', 'success');
        closeDeleteModal();
        loadUnits();
    } catch (e) {
        showToast('Erro ao deletar', 'error');
    }
}

function clearFilters() {
    elements.searchInput.value = '';
    elements.filterStatus.value = '';
    applyFilters();
}

function getStatusClasses(status) {
    const map = {
        'NORMAL': 'bg-green-100 text-green-800',
        'FALHA': 'bg-red-100 text-red-800 animate-pulse',
        'IDENTIFICADO': 'bg-purple-100 text-purple-800',
        'EM_REPARO': 'bg-yellow-100 text-yellow-800',
        'NORMALIZADO': 'bg-blue-100 text-blue-800'
    };
    return map[status] || 'bg-gray-100 text-gray-800';
}

function getStatusIcon(status) {
    const map = { 'NORMAL': 'fa-check-circle', 'FALHA': 'fa-bolt', 'IDENTIFICADO': 'fa-search', 'EM_REPARO': 'fa-tools', 'NORMALIZADO': 'fa-sync' };
    return map[status] || 'fa-question-circle';
}

function getStatusLabel(status) {
    const map = { 'NORMAL': 'Normal', 'FALHA': 'Falha Iminente', 'IDENTIFICADO': 'Identificado', 'EM_REPARO': 'Em Reparo', 'NORMALIZADO': 'Normalizado' };
    return map[status] || status;
}

function showLoadingState() { elements.unitsTableBody.innerHTML = '<tr><td colspan="5" class="text-center py-6 text-gray-500">Buscando telemetria...</td></tr>'; }
function showEmptyState() { elements.unitsTableBody.innerHTML = '<tr><td colspan="5" class="text-center py-6 text-gray-500">Nenhum registro encontrado.</td></tr>'; }
function showErrorState() { elements.unitsTableBody.innerHTML = '<tr><td colspan="5" class="text-center py-6 text-red-500">Erro na comunicação.</td></tr>'; }
function escapeHtml(t) { const d = document.createElement('div'); d.textContent = t; return d.innerHTML; }
function debounce(f, w) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => f(...a), w); }; }

function showToast(msg, type = 'info') {
    const toast = document.createElement('div');
    const color = type === 'success' ? 'bg-green-600' : 'bg-red-600';
    toast.className = `${color} text-white px-4 py-2 rounded-md shadow-md text-sm font-medium`;
    toast.textContent = msg;
    elements.toastContainer.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
}