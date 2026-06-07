// Garante que o script só execute após o carregamento completo do HTML
document.addEventListener('DOMContentLoaded', () => {

    const loginForm = document.getElementById('loginForm');
    const credencialInput = document.getElementById('credencial');
    const passwordInput = document.getElementById('password');
    const errorMessageElement = document.getElementById('errorMessage');

    loginForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const credencial = credencialInput.value.trim();
        const password = passwordInput.value.trim();

        errorMessageElement.textContent = '';

        if (credencial === '' || password === '') {
            errorMessageElement.textContent = 'Por favor, preencha todos os campos.';
            return;
        }

        if (credencial === 'admin' && password === 'admin123') {
            // ADICIONAR: Salva o status de admin na sessão do navegador
            sessionStorage.setItem('isAdmin', 'true');
            window.location.href = 'mapa.html';
            return;
        }
        
        // ADICIONAR: Garante que o status de admin seja removido para usuários normais
        sessionStorage.removeItem('isAdmin');
        window.location.href = 'mapa.html';
    });
});