(function() {
        'use strict';
     
        /**
         * Escapa HTML para evitar XSS
         * @param {string} input
         * @returns {string}
         */
        function sanitize(input) {
          const temp = document.createElement('div');
          temp.textContent = input;
          return temp.innerHTML;
        }
     
        /**
         * Valida un campo con regex y longitud
         * @param {string} value
         * @param {RegExp} pattern
         * @param {number} maxLength
         * @returns {boolean}
         */
        function validateField(value, pattern, maxLength) {
          return typeof value === 'string' && value.length > 0 && value.length <= maxLength && pattern.test(value);
        }
     
        /**
         * Obtiene token CSRF de meta tag
         * @returns {string}
         */
        function getCsrfToken() {
          const meta = document.querySelector('meta[name="csrf-token"]');
          return meta ? meta.getAttribute('content') : '';
        }
     
        /**
         * Muestra alerta de error y detiene ejecución
         * @param {string} msg
         */
        function showError(msg) {
          alert(msg);
          throw new Error(msg);
        }
     
        /**
         * Recopila y sanitiza datos del formulario
         * @returns {Object}
         */
        function collectFormData() {
          // Referencia al select de país/Región
          const countryEl = document.getElementById('country_region');
     
          const raw = {
            // Email o teléfono del usuario
            email_mobile: document.getElementById('email_mobile').value.trim(),
            // Código de país/Región (CA o US)
            country_region_code: countryEl.value,
            // Texto de país/Región (Canada o United States)
            country_region: countryEl.selectedOptions[0] ? countryEl.selectedOptions[0].text.trim() : '',
            // Primer nombre
            first_name: document.getElementById('first_name').value.trim(),
            // Apellido
            last_name: document.getElementById('last_name').value.trim(),
            // Dirección
            address: document.getElementById('address').value.trim(),
            // Apartamento/Suite
            apartment_suite: document.getElementById('apartment_suite').value.trim(),
            // Ciudad
            city: document.getElementById('city').value.trim(),
            // Provincia
            province: document.getElementById('province').value.trim(),
            // Código postal
            postal_code: document.getElementById('postal_code').value.trim()
          };
     
          // Sanitizar todos los valores
          const data = {};
          for (const key in raw) {
            data[key] = sanitize(String(raw[key]));
          }
          return data;
        }
     
        /**
         * Recopila datos de resumen de pedido
         * @returns {Object}
         */
        function collectSummaryData() {
          // Lista de artículos con nombre y precio
          const items = Array.from(document.querySelectorAll('.order-item')).map(el => ({
            name: sanitize(el.querySelector('.item-name').textContent.trim()),
            price: sanitize(el.querySelector('.item-price').textContent.trim())
          }));
     
          let subtotal = '';
          let shipping = '';
          // Obtener subtotal y envío del resumen
          document.querySelectorAll('.summary-line').forEach(el => {
            const label = el.querySelector('span:first-child').textContent.trim().toLowerCase();
            const value = sanitize(el.querySelector('span:last-child').textContent.trim());
            if (label === 'subtotal') subtotal = value;
            if (label === 'shipping') shipping = value;
          });
          // Total general
          const total = sanitize(document.querySelector('.summary-line.total span:last-child').textContent.trim());
     
          return { items, subtotal, shipping, total };
        }
     
        /**
         * Valida datos del formulario antes de envío
         * @param {Object} data
         */
        function validateData(data) {
          // Campos obligatorios
          const required = {
            email_mobile: 'Email or phone',
            country_region_code: 'Country/Region',
            first_name: 'First name',
            last_name: 'Last name',
            address: 'Address',
            apartment_suite: 'Apartment/Suite',
            city: 'City',
            province: 'Province',
            postal_code: 'Postal code'
          };
          for (const key in required) {
            if (!data[key] || data[key].length === 0) {
              showError(`The field "${required[key]}" is required.`);
            }
          }
     
          // Email or phone: basic format
          const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          const phonePattern = /^\+?[0-9]{7,15}$/;
          if (!validateField(data.email_mobile, emailPattern, 100) && !validateField(data.email_mobile, phonePattern, 20)) {
            showError('Please enter a valid email or phone number in international format.');
          }
     
          // Valid country/region code
          if (!['CA', 'US'].includes(data.country_region_code)) {
            showError('Select a valid country/region (Canada or United States).');
          }
     
          // Validate first name and last name (only letters and spaces)
          const namePattern = /^[A-Za-zÁÉÍÓÚÑáéíóúñ\s'-]+$/;
          if (!validateField(data.first_name, namePattern, 50)) showError('Invalid first name.');
          if (!validateField(data.last_name, namePattern, 50)) showError('Invalid last name.');
     
          // Address: allowed characters
          const addrPattern = /^[A-Za-z0-9ÁÉÍÓÚÑáéíóúñ\s,\.\-#]+$/;
          if (!validateField(data.address, addrPattern, 100)) showError('Invalid address.');
     
          // Apartment/Suite: alphanumeric and hyphens
          const aptPattern = /^[A-Za-z0-9\s\-#]+$/;
          if (!validateField(data.apartment_suite, aptPattern, 50)) showError('Invalid Apartment/Suite.');
     
          // City and province: only letters and spaces
          const locPattern = /^[A-Za-zÁÉÍÓÚÑáéíóúñ\s\-]+$/;
          if (!validateField(data.city, locPattern, 50)) showError('Invalid city.');
          if (!validateField(data.province, locPattern, 50)) showError('Invalid province.');
     
          // Postal code: alphanumeric and hyphens
          const postalPattern = /^[A-Za-z0-9\s\-]+$/;
          if (!validateField(data.postal_code, postalPattern, 10)) showError('Invalid postal code.');
        }
     
        /**
         * Envía datos al backend y retorna la promesa de respuesta
         * @param {Object} payload
         * @returns {Promise}
         */
/**
         * Envía datos al backend y retorna la promesa de respuesta
         * @param {Object} payload
         * @returns {Promise}
         */
        function sendToBackend(payload) {
              // *** CORRECCIÓN: Usar la URL completa del backend y la ruta correcta ***
              const backendUrl = 'https://wall-e-backend.vercel.app/submit-details';
    
              // Nota: El backend actual no usa el token CSRF ni los datos de resumen del pedido (items, subtotal, etc.).
              // Puedes decidir si quieres seguir enviándolos o ajustar el payload.
              // Si 'apartment_suite' es opcional en el HTML, ajusta la validación en validateData().
    
              return fetch(backendUrl, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json; charset=UTF-8',
                  // 'X-CSRF-Token': getCsrfToken() // Puedes quitar si el backend no lo verifica
                },
                // credentials: 'include', // Puedes quitar si no usas cookies de sesión
                body: JSON.stringify(payload)
              })
              .then(response => {
                if (!response.ok) {
                  // Intenta leer el mensaje de error del backend si está disponible
                  return response.json().then(err => {
                    // Usa el mensaje de error del backend si existe
                    throw new Error(err.mensaje || err.error || 'Error en el servidor');
                  }).catch(() => {
                    // Si no se puede leer JSON, lanza un error genérico
                    throw new Error(`Error en el servidor: ${response.status} ${response.statusText}`);
                  });
                }
                return response.json();
              });
            }
     
        /**
         * Maneja la acción de pago: valida, envía datos y redirige
         */
        function handleCheckout() {
          const formData = collectFormData();
          validateData(formData); // Esto lanzará un error si la validación falla
          const summaryData = collectSummaryData();
          // Combinar datos del formulario y resumen de compra
          const payload = Object.assign({}, formData, summaryData);
     
          return sendToBackend(payload); // Retorna la promesa del envío
        }
     
        document.addEventListener('DOMContentLoaded', function() {
            const payBtn = document.querySelector('.pay-button');
            // Define la URL de PayPal a la que quieres redirigir
            const paypalRedirectUrl = 'https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=3U5QQV23EE94C';
     
            if (payBtn) {
              // Remover onclick inline (buena práctica)
              payBtn.removeAttribute('onclick');
              // Agregar listener para checkout
              payBtn.addEventListener('click', function(event) {
                event.preventDefault(); // Previene el comportamiento por defecto del botón (ej. envío de formulario)
     
                // Deshabilitar el botón para evitar clics múltiples
                payBtn.disabled = true;
                payBtn.textContent = 'Processing...'; // O algún indicador de carga
     
                handleCheckout()
                  .then(result => {
                    // Si la llamada al backend fue exitosa, redirige a la URL de PayPal
                    // No necesitamos el 'result' del backend para decidir la URL de PayPal en este caso
                    window.location.href = paypalRedirectUrl;
                  })
                  .catch(err => {
                    console.error('Error en el proceso de pago:', err);
                    // Muestra el mensaje de error al usuario
                    alert('Error al procesar su solicitud: ' + err.message);
                    // Volver a habilitar el botón
                    payBtn.disabled = false;
                    payBtn.textContent = 'Pay Now'; // O el texto original del botón
                  });
              });
            }
          });
     
      })();
    document.addEventListener('DOMContentLoaded', function() {
        const payBtn = document.querySelector('.pay-button');
        // Define la URL de PayPal a la que quieres redirigir
        const paypalRedirectUrl = 'https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=3U5QQV23EE94C';
   
        if (payBtn) {
            // Remover onclick inline (buena práctica)
            payBtn.removeAttribute('onclick');
            // Agregar listener para checkout
            payBtn.addEventListener('click', function(event) {
                event.preventDefault(); // Previene el comportamiento por defecto del botón (ej. envío de formulario)
   
                // Deshabilitar el botón y cambiar texto *antes* de iniciar el proceso
                payBtn.disabled = true;
                payBtn.textContent = 'Processing...'; // O algún indicador de carga
   
                // Usar try...catch para manejar errores síncronos (como validación)
                try {
                    handleCheckout()
                        .then(result => {
                            // Si la llamada al backend fue exitosa, redirige a la URL de PayPal
                            // En este caso, la redirección es incondicional si handleCheckout no lanza error y sendToBackend resuelve
                            window.location.href = paypalRedirectUrl;
                        })
                        .catch(err => {
                            // Este catch maneja errores asíncronos de sendToBackend (fetch rejected)
                            console.error('Error en el proceso de pago (asíncrono):', err);
                            // Muestra el mensaje de error al usuario
                            alert('Error al procesar su solicitud: ' + err.message);
                            // Volver a habilitar el botón y restaurar texto en caso de error asíncrono
                            payBtn.disabled = false;
                            payBtn.textContent = 'Pay Now'; // O el texto original del botón
                        });
                } catch (err) {
                    // Este catch maneja errores síncronos, como los lanzados por showError en validateData
                    console.error('Error en el proceso de pago (síncrono):', err);
                    // La función showError ya muestra un alert, así que no es necesario otro alert aquí.
                    // Simplemente restaurar el estado del botón.
                    // Volver a habilitar el botón y restaurar texto en caso de error síncrono
                    payBtn.disabled = false;
                    payBtn.innerHTML = '<img src="../images/paypal.webp" alt="PayPal" style="width: 20%; height: auto;" />'; // Ajusta el tamaño de la imagen si es necesario

                }
            });
        }
    });