document.addEventListener('DOMContentLoaded', () => {
    // --- Interacción de Miniaturas ---
    const mainImage = document.getElementById('mainProductImage');
    const thumbnails = document.querySelectorAll('.thumbnail');

    thumbnails.forEach(thumb => {
        thumb.addEventListener('click', function() {
            // Cambiar la imagen principal
            mainImage.src = this.src.replace('thumbnail', 'imagen-principal'); // Ajusta esto según tu nomenclatura de archivos
            mainImage.alt = this.alt.replace('Vista miniatura', 'Vista principal');

            // Actualizar la clase 'active'
            thumbnails.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // --- Selector de Cantidad ---
    const minusBtn = document.querySelector('.quantity-btn.minus');
    const plusBtn = document.querySelector('.quantity-btn.plus');
    const quantityInput = document.getElementById('quantity');

    minusBtn.addEventListener('click', () => {
        let currentValue = parseInt(quantityInput.value);
        if (currentValue > 1) {
            quantityInput.value = currentValue - 1;
        }
    });

    plusBtn.addEventListener('click', () => {
        let currentValue = parseInt(quantityInput.value);
        // Podrías añadir un límite máximo si es necesario
        quantityInput.value = currentValue + 1;
    });
});