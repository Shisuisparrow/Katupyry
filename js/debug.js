// Función para mostrar errores en la consola
window.addEventListener('error', function(event) {
    console.error('Error detectado:', event.error);
    
    // Crear un elemento para mostrar el error en la página
    const errorDiv = document.createElement('div');
    errorDiv.style.position = 'fixed';
    errorDiv.style.bottom = '10px';
    errorDiv.style.right = '10px';
    errorDiv.style.backgroundColor = 'red';
    errorDiv.style.color = 'white';
    errorDiv.style.padding = '10px';
    errorDiv.style.borderRadius = '5px';
    errorDiv.style.zIndex = '9999';
    errorDiv.textContent = 'Error: ' + (event.error ? event.error.message : event.message);
    
    document.body.appendChild(errorDiv);
    
    // Eliminar el mensaje de error después de 5 segundos
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.parentNode.removeChild(errorDiv);
        }
    }, 5000);
}); 