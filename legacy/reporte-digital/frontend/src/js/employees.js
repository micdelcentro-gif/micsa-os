/**
 * MICSA - Gestión de Empleados
 */

const employeesManager = {
    currentEmployeeId: null,
    allEmployees: [],
    allProjects: [],

    init: async () => {
        if (!auth.checkAuth()) return;

        // Cargar proyectos primero para los filtros
        await employeesManager.loadProjects();

        // Cargar empleados
        await employeesManager.loadEmployees();

        // Configurar eventos de filtros
        document.getElementById('employeeSearch')?.addEventListener('input', employeesManager.applyFilters);
        document.getElementById('projectFilter')?.addEventListener('change', employeesManager.applyFilters);
    },

    loadProjects: async () => {
        try {
            const response = await fetch(`${API_URL}/projects`, {
                headers: auth.getAuthHeader()
            });
            if (response.ok) {
                employeesManager.allProjects = await response.json();
                employeesManager.populateProjectDropdowns();
            }
        } catch (err) {
            console.error('Error cargando proyectos:', err);
        }
    },

    populateProjectDropdowns: () => {
        const filter = document.getElementById('projectFilter');
        const modalSelect = document.getElementById('employeeProject');
        if (!filter || !modalSelect) return;

        // Limpiar opciones dinámicas
        while (filter.options.length > 2) filter.remove(2);
        while (modalSelect.options.length > 1) modalSelect.remove(1);

        employeesManager.allProjects.forEach(p => {
            if (p.status === 'active') {
                const opt1 = new Option(p.name, p.id);
                filter.add(opt1);
                const opt2 = new Option(p.name, p.id);
                modalSelect.add(opt2);
            }
        });
    },

    loadEmployees: async () => {
        const container = document.getElementById('employeesList');

        try {
            const response = await fetch(`${API_URL}/employees`, {
                headers: auth.getAuthHeader()
            });

            if (!response.ok) throw new Error('Error al cargar empleados');

            employeesManager.allEmployees = await response.json();
            employeesManager.applyFilters();
        } catch (error) {
            console.error(error);
            container.innerHTML = `<div class="col-span-full text-center text-red-500">Error al cargar datos: ${error.message}</div>`;
        }
    },

    applyFilters: () => {
        const query = document.getElementById('employeeSearch')?.value.toLowerCase() || '';
        const projectFilter = document.getElementById('projectFilter')?.value || 'all';

        const filtered = employeesManager.allEmployees.filter(emp => {
            const matchesQuery = emp.name.toLowerCase().includes(query) ||
                (emp.position && emp.position.toLowerCase().includes(query)) ||
                (emp.rfc && emp.rfc.toLowerCase().includes(query));

            let matchesProject = true;
            if (projectFilter === 'none') matchesProject = !emp.project_id;
            else if (projectFilter !== 'all') matchesProject = emp.project_id == projectFilter;

            return matchesQuery && matchesProject;
        });

        employeesManager.renderEmployees(filtered);
    },

    renderEmployees: (employees) => {
        const container = document.getElementById('employeesList');

        if (employees.length === 0) {
            container.innerHTML = `
                <div class="col-span-full text-center py-12 bg-white rounded-lg shadow dashed border-2 border-gray-300">
                    <i class="fas fa-users text-4xl text-gray-300 mb-3"></i>
                    <p class="text-gray-500">No hay empleados registrados</p>
                    <button onclick="employeesManager.openModal()" class="mt-4 text-primary font-medium hover:underline">
                        Registrar el primero
                    </button>
                </div>`;
            return;
        }

        container.innerHTML = employees.map(emp => `
            <div class="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 relative border-l-4 ${emp.active ? 'border-green-500' : 'border-red-500'}">
                <div class="absolute top-4 right-4 flex space-x-2">
                    <button onclick="employeesManager.editEmployee(${emp.id})" class="text-gray-400 hover:text-blue-600 transition-colors" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="employeesManager.deleteEmployee(${emp.id})" class="text-gray-400 hover:text-red-600 transition-colors" title="Eliminar">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>

                <div class="flex items-center mb-4">
                    <div class="h-12 w-12 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold mr-4">
                        ${emp.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h3 class="text-lg font-bold text-gray-900 leading-tight">${emp.name}</h3>
                        <p class="text-sm text-gray-500">${emp.position || 'Sin puesto'}</p>
                        ${emp.project_id ? `
                            <p class="text-[10px] mt-1 inline-block px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-bold">
                                <i class="fas fa-building mr-1"></i> ${employeesManager.getProjectName(emp.project_id)}
                            </p>
                        ` : ''}
                    </div>
                </div>

                <div class="space-y-2 text-sm text-gray-600 mb-6">
                    <div class="flex items-center">
                        <i class="fas fa-id-card w-6 text-center text-gray-400 mr-2"></i>
                        <span>RFC: ${emp.rfc || 'N/A'}</span>
                    </div>
                    <div class="flex items-center">
                        <i class="fas fa-phone w-6 text-center text-gray-400 mr-2"></i>
                        <span>${emp.phone || 'N/A'}</span>
                    </div>
                    <div class="flex items-center">
                        <i class="fas fa-envelope w-6 text-center text-gray-400 mr-2"></i>
                        <span class="truncate">${emp.email || 'N/A'}</span>
                    </div>
                </div>

                <button onclick="employeesManager.openDocumentsModal(${emp.id})" class="w-full py-2 bg-gray-50 hover:bg-gray-100 text-primary font-medium rounded border border-gray-200 transition-colors flex items-center justify-center">
                    <i class="fas fa-folder-open mr-2"></i> Documentos
                </button>
            </div>
        `).join('');
    },

    getProjectName: (id) => {
        const project = employeesManager.allProjects.find(p => p.id == id);
        return project ? project.name : 'Desconocido';
    },

    // ===== MODAL EMPLEADO =====
    openModal: (reset = true) => {
        const modal = document.getElementById('employeeModal');
        const form = document.getElementById('employeeForm');

        if (reset) {
            form.reset();
            document.getElementById('employeeId').value = '';
            document.getElementById('modalTitle').textContent = 'Registrar Empleado';
        }

        modal.classList.remove('hidden');
    },

    closeModal: () => {
        document.getElementById('employeeModal').classList.add('hidden');
    },

    editEmployee: async (id) => {
        try {
            const response = await fetch(`${API_URL}/employees/${id}`, {
                headers: auth.getAuthHeader()
            });
            const emp = await response.json();

            document.getElementById('employeeId').value = emp.id;
            document.getElementById('name').value = emp.name;
            document.getElementById('position').value = emp.position || '';
            document.getElementById('phone').value = emp.phone || '';
            document.getElementById('email').value = emp.email || '';
            document.getElementById('rfc').value = emp.rfc || '';
            document.getElementById('nss').value = emp.nss || '';
            document.getElementById('emergency_contact').value = emp.emergency_contact || '';
            document.getElementById('employeeProject').value = emp.project_id || '';

            document.getElementById('modalTitle').textContent = 'Editar Empleado';
            employeesManager.openModal(false);

        } catch (error) {
            alert('Error al cargar datos del empleado');
        }
    },

    saveEmployee: async (event) => {
        event.preventDefault();

        const id = document.getElementById('employeeId').value;
        const data = {
            name: document.getElementById('name').value,
            position: document.getElementById('position').value,
            phone: document.getElementById('phone').value,
            email: document.getElementById('email').value,
            rfc: document.getElementById('rfc').value,
            nss: document.getElementById('nss').value,
            emergency_contact: document.getElementById('emergency_contact').value,
            project_id: document.getElementById('employeeProject').value || null
        };

        const method = id ? 'PUT' : 'POST';
        const url = id ? `${API_URL}/employees/${id}` : `${API_URL}/employees`;

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    ...auth.getAuthHeader(),
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) throw new Error('Error al guardar');

            employeesManager.closeModal();
            employeesManager.loadEmployees();

        } catch (error) {
            alert('Error al guardar: ' + error.message);
        }
    },

    deleteEmployee: async (id) => {
        if (!confirm('¿Estás seguro de eliminar este empleado y todos sus documentos?')) return;

        try {
            await fetch(`${API_URL}/employees/${id}`, {
                method: 'DELETE',
                headers: auth.getAuthHeader()
            });
            employeesManager.loadEmployees();
        } catch (error) {
            alert('Error al eliminar');
        }
    },

    // ===== GESTIÓN DE DOCUMENTOS =====
    openDocumentsModal: async (employeeId) => {
        employeesManager.currentEmployeeId = employeeId;
        document.getElementById('documentsModal').classList.remove('hidden');
        await employeesManager.loadDocuments(employeeId);
    },

    closeDocumentsModal: () => {
        document.getElementById('documentsModal').classList.add('hidden');
        employeesManager.currentEmployeeId = null;
    },

    loadDocuments: async (employeeId) => {
        const list = document.getElementById('documentsList');
        list.innerHTML = '<tr><td colspan="4" class="px-3 py-4 text-center text-sm text-gray-500">Cargando...</td></tr>';

        try {
            const response = await fetch(`${API_URL}/employees/${employeeId}/documents`, {
                headers: auth.getAuthHeader()
            });
            const docs = await response.json();

            if (docs.length === 0) {
                list.innerHTML = '<tr><td colspan="4" class="px-3 py-4 text-center text-sm text-gray-500">No hay documentos subidos</td></tr>';
                return;
            }

            list.innerHTML = docs.map(doc => `
                <tr>
                    <td class="px-3 py-3 whitespace-nowrap">
                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            ${doc.document_type}
                        </span>
                    </td>
                    <td class="px-3 py-3 whitespace-nowrap text-sm text-gray-700">
                        <i class="fas fa-file-pdf text-red-500 mr-2"></i> ${doc.original_name}
                    </td>
                    <td class="px-3 py-3 whitespace-nowrap text-sm text-gray-500">
                        ${new Date(doc.upload_date).toLocaleDateString()}
                    </td>
                    <td class="px-3 py-3 whitespace-nowrap text-right text-sm font-medium">
                        <a href="${API_URL}/employees/documents/${doc.id}/download" target="_blank" class="text-primary hover:text-blue-900 mr-3" title="Descargar/Ver">
                            <i class="fas fa-download"></i>
                        </a>
                        <button onclick="employeesManager.deleteDocument(${doc.id})" class="text-red-600 hover:text-red-900" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `).join('');

        } catch (error) {
            list.innerHTML = '<tr><td colspan="4" class="text-center text-red-500">Error al cargar documentos</td></tr>';
        }
    },

    uploadDocument: async (event) => {
        event.preventDefault();

        const fileInput = document.getElementById('docFile');
        const typeInput = document.getElementById('docType');

        if (!fileInput.files[0]) {
            alert('Selecciona un archivo');
            return;
        }

        const formData = new FormData();
        formData.append('document', fileInput.files[0]);
        formData.append('documentType', typeInput.value);

        try {
            const response = await fetch(`${API_URL}/employees/${employeesManager.currentEmployeeId}/documents`, {
                method: 'POST',
                headers: {
                    ...auth.getAuthHeader()
                    // No Content-Type header needed for FormData
                },
                body: formData
            });

            if (!response.ok) throw new Error('Error en subida');

            // Reset form and reload list
            fileInput.value = '';
            employeesManager.loadDocuments(employeesManager.currentEmployeeId);

        } catch (error) {
            alert('Error al subir documento: ' + error.message);
        }
    },

    deleteDocument: async (docId) => {
        if (!confirm('¿Eliminar este documento permanentemente?')) return;

        try {
            await fetch(`${API_URL}/employees/documents/${docId}`, {
                method: 'DELETE',
                headers: auth.getAuthHeader()
            });
            employeesManager.loadDocuments(employeesManager.currentEmployeeId);
        } catch (error) {
            alert('Error al eliminar documento');
        }
    }
};

// Start when loaded
document.addEventListener('DOMContentLoaded', employeesManager.init);
