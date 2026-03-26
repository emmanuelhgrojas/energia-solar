// Variables globales para almacenar los datos y las instancias de los gráficos
let datosEnergia = [];
let graficoBarras, graficoTorta, graficoLineas;

// 1. ESCUCHADOR DE CARGA DE ARCHIVO
document.addEventListener('DOMContentLoaded', () => {
    const inputCsvDashboard = document.getElementById('input-csv-dashboard');
    // Evita el error de 'null' verificando si el input existe
    if (inputCsvDashboard) {
        inputCsvDashboard.addEventListener('change', function(e) {
            const archivo = e.target.files[0];
            if (archivo) {
                Papa.parse(archivo, {
                    header: true,
                    dynamicTyping: true,
                    skipEmptyLines: true,
                    complete: function(results) {
                        datosEnergia = results.data;                
                        // Mostramos las secciones ocultas
                        document.getElementById('contenedor-graficos').classList.remove('d-none');
                        actualizarTarjetas(datosEnergia);
                        // Ejecutamos las funciones principales
                        generarDashboard(datosEnergia);
                    }
                });
            }
        });
    }

    const inputCsvCalculadora = document.getElementById('input-csv-calculadora');
    if(inputCsvCalculadora){
        inputCsvCalculadora.addEventListener('change', function(e) {
            const archivo = e.target.files[0];
            if (archivo) {
                Papa.parse(archivo, {
                    header: true,
                    dynamicTyping: true,
                    skipEmptyLines: true,
                    complete: function(results) {
                        datosEnergia = results.data;                
                        // Mostramos las secciones ocultas
                        document.getElementById('contenedor-calculadora').classList.remove('d-none');
                        
                    }
                });
            }
        });
    }

    const inputCsvHistorico = document.getElementById('input-csv-historico');
    if(inputCsvHistorico){
        inputCsvHistorico.addEventListener('change', function(e) {
            const archivo = e.target.files[0];
            if (archivo) {
                Papa.parse(archivo, {
                    header: true,
                    dynamicTyping: true,
                    skipEmptyLines: true,
                    complete: function(results) {
                        // Guardamos en la variable global para la calculadora
                        datosEnergia = results.data;
                        // 1. Mostrar las secciones que estaban ocultas (d-none)
                        document.getElementById('contenedor-historico').classList.remove('d-none');                        
                        // 2. Ejecutar visualizaciones
                        visualizarTabla(datosEnergia);    // Punto 2: Tabla                        
                        Swal.fire({
                            title: "¡Datos Cargados!",
                            text: `Se han procesado ${datosEnergia.length} filas correctamente.`,
                            icon: "success",
                            timer: 2000
                        });
                    }
                });
            }
        });
    }

    const stars = document.querySelectorAll('.star-rating .bi-star-fill');
    const ratingInput = document.getElementById('ratingValue');
    const feedbackForm = document.getElementById('feedbackForm');

    // Lógica para seleccionar estrellas
    stars.forEach(star => {
        star.addEventListener('click', function() {
            const value = this.getAttribute('data-value');
            ratingInput.value = value;

            // Actualizar visualmente las estrellas
            stars.forEach(s => {
                if (s.getAttribute('data-value') <= value) {
                    s.classList.add('active');
                } else {
                    s.classList.remove('active');
                }
            });
        });

        // Efecto hover (opcional)
        star.addEventListener('mouseover', function() {
            const value = this.getAttribute('data-value');
            stars.forEach(s => {
                if (s.getAttribute('data-value') <= value) s.style.color = '#ffc107';
            });
        });

        star.addEventListener('mouseout', function() {
            stars.forEach(s => {
                if (!s.classList.contains('active')) s.style.color = '#ddd';
            });
        });
    });

    // Manejo del envío del formulario
    if (feedbackForm) {
        feedbackForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const rating = ratingInput.value;
            if (rating === "0") {
                Swal.fire({
                    title: "Atención",
                    text: "Por favor, selecciona una calificación con estrellas.",
                    icon: "warning"
                });
                return;
            }

            // Datos del usuario
            const data = {
                nombre: document.getElementById('userName').value,
                email: document.getElementById('userEmail').value,
                mensaje: document.getElementById('feedbackMsg').value,
                calificacion: rating
            };

            console.log("Feedback recibido:", data);

            // Simulación de éxito
            Swal.fire({
                title: "¡Gracias!",
                text: "Tu feedback ha sido enviado correctamente. Nos ayuda mucho a mejorar.",
                icon: "success",
                confirmButtonColor: "#ffc107"
            }).then(() => {
                feedbackForm.reset();
                stars.forEach(s => s.classList.remove('active'));
                ratingInput.value = 0;
            });
        });
    }
});

// 2. FUNCIÓN PARA EL DASHBOARD (Punto 3: Los 3 Gráficos)
function actualizarTarjetas(data) {
    // 1. Buscamos el dato más reciente (Mundo - 2022)
    const dato2022 = data.find(d => d.Year === 2022 && d.Entity === "World") 
                     || data[data.length - 1]; // Si no lo encuentra, toma el último

    if (dato2022) {
        // Obtenemos el valor de la columna (ajusta el nombre si es diferente en tu CSV)
        const valorRenovable = dato2022['Renewables (% equivalent primary energy)'];

        // 2. Actualizamos los campos de las tarjetas
        // Producción Total (Aquí podrías poner un cálculo o valor fijo si el CSV no lo tiene)
        document.getElementById('card-produccion').innerText = (valorRenovable * 5.2).toFixed(1) + " GW";

        // Mix Renovable (Usamos el dato directo del CSV)
        document.getElementById('card-mix').innerText = valorRenovable.toFixed(2) + "%";

        // CO2 Evitado (Cálculo estimado basado en el porcentaje renovable)
        const co2 = (valorRenovable * 0.8).toFixed(1);
        document.getElementById('card-co2').innerText = co2 + "k Ton";

        // Fuentes Eólicas (Estimación: suele ser el 40% del total renovable)
        const eolica = (valorRenovable * 0.4).toFixed(1);
        document.getElementById('card-viento').innerText = eolica + " GW";
    }
}

function generarDashboard(data) {
    // Filtramos para obtener el último año disponible en el dataset (2022)
    // Usamos 'World' como referencia global, o el primer registro si no existe
    const datoReciente = data.find(d => d.Year === 2022 && d.Entity === "World") || data[data.length - 1];
    const valorRenovable = datoReciente['Renewables (% equivalent primary energy)'];

    // Destruir gráficos previos para evitar solapamiento
    if (graficoBarras) graficoBarras.destroy();
    if (graficoTorta) graficoTorta.destroy();
    if (graficoLineas) graficoLineas.destroy();

    // --- GRÁFICO DE BARRAS: Producción por Fuente ---
    graficoBarras = new Chart(document.getElementById('barChart'), {
        type: 'bar',
        data: {
            labels: ['Hidroeléctrica', 'Eólica', 'Solar', 'Otras'],
            datasets: [{
                label: 'Distribución Estimada (%)',
                data: [
                    (valorRenovable * 0.55).toFixed(2), // Estimación basada en tendencia global
                    (valorRenovable * 0.25).toFixed(2),
                    (valorRenovable * 0.15).toFixed(2),
                    (valorRenovable * 0.05).toFixed(2)
                ],
                backgroundColor: ['#0d6efd', '#0dcaf0', '#ffc107', '#198754']
            }]
        }
    });

    // --- GRÁFICO DE TORTA: Participación Energética ---
    graficoTorta = new Chart(document.getElementById('pieChart'), {
        type: 'pie',
        data: {
            labels: ['Renovables', 'Convencionales'],
            datasets: [{
                data: [valorRenovable.toFixed(2), (100 - valorRenovable).toFixed(2)],
                backgroundColor: ['#198754', '#adb5bd']
            }]
        }
    });

    // --- GRÁFICO DE LÍNEAS: Tendencia Histórica (1965-2022) ---
    // Filtramos los datos de una sola entidad para la línea de tiempo (ej: World)
    const historial = data.filter(d => d.Entity === "World");
    
    graficoLineas = new Chart(document.getElementById('lineChart'), {
        type: 'line',
        data: {
            labels: historial.map(d => d.Year),
            datasets: [{
                label: 'Evolución de Capacidad Instalada (%)',
                data: historial.map(d => d['Renewables (% equivalent primary energy)']),
                borderColor: '#ffc107',
                backgroundColor: 'rgba(255, 193, 7, 0.1)',
                fill: true,
                tension: 0.3
            }]
        }
    });
}

// 3. LÓGICA DE LA CALCULADORA (Estimación de Consumo)
function realizarCalculo() {
    // 1. Obtener el valor ingresado por el usuario
    const consumoKwh = document.getElementById('consumo').value;
    
    // Validaciones iniciales
    if (!consumoKwh || consumoKwh <= 0) {
        Swal.fire({
            title: "Error",
            text: "Por favor ingresa un consumo mensual válido (kWh).",
            icon: "error"
        });
        return;
    }

    // Verificar que el CSV ya fue cargado en la variable global datosEnergia
    if (!datosEnergia || datosEnergia.length === 0) {
        Swal.fire({
            title: "Atención",
            text: "Primero debes cargar el archivo CSV en la sección de Dashboard para obtener los datos reales.",
            icon: "warning"
        });
        return;
    }

    // 2. Extraer el porcentaje real del CSV
    // Buscamos el dato del Mundo en 2022 o el último registro disponible
    const columnaFiltro = 'Renewables (% equivalent primary energy)';
    const datoReal = datosEnergia.find(d => d.Year === 2022 && d.Entity === "World") 
                     || datosEnergia[datosEnergia.length - 1];

    // Obtenemos el porcentaje del CSV
    const proporcionRenovable = datoReal[columnaFiltro];

    if (proporcionRenovable === undefined) {
        Swal.fire({
            title: "Error de Formato",
            text: "No se encontró la columna de porcentajes en el archivo subido.",
            icon: "error"
        });
        return;
    }

    // 3. Mostrar resultados en la interfaz
    const contenedor = document.getElementById('resultado-contenedor');
    const txtPorcentaje = document.getElementById('resultado-porcentaje');
    const barra = document.getElementById('barra-progreso');
    const mensaje = document.getElementById('mensaje-resultado');

    // Cálculo del impacto en kWh
    const kwhLimpios = (consumoKwh * (proporcionRenovable / 100)).toFixed(2);

    // Actualización del DOM
    contenedor.classList.remove('d-none');
    txtPorcentaje.innerText = proporcionRenovable.toFixed(2) + "%";
    barra.style.width = proporcionRenovable + "%";

    // 4. Mensaje dinámico usando el nombre de la entidad encontrada (ej. "World" o "Africa")
    mensaje.innerHTML = `
        Basado en los datos de <strong>${datoReal.Entity} (${datoReal.Year})</strong>: <br>
        De tus <strong>${consumoKwh} kWh</strong> mensuales, aproximadamente 
        <strong>${kwhLimpios} kWh</strong> provienen de fuentes de energía renovable.
    `;
}






// 4. LLENAR TABLA DE DATOS (Punto 2)
function visualizarTabla(data) {
    const tbody = document.getElementById('tabla-body');
    const contador = document.getElementById('contador-filas');
    
    // Limpiamos la tabla antes de llenarla
    tbody.innerHTML = "";

    // Nombre de la columna según tu imagen del CSV
    const columnaPorcentaje = 'Renewables (% equivalent primary energy)';

    // Iteramos sobre los datos
    data.forEach(fila => {
        // Validamos que la fila tenga datos mínimos
        if (fila.Entity && fila.Year) {
            const tr = document.createElement('tr');
            
            // Creamos las celdas
            tr.innerHTML = `
                <td class="fw-bold">${fila.Entity}</td>
                <td><span class="badge bg-light text-dark border">${fila.Code || 'N/A'}</span></td>
                <td>${fila.Year}</td>
                <td class="text-success fw-bold">
                    ${fila[columnaPorcentaje] ? fila[columnaPorcentaje].toFixed(4) + '%' : '0.0000%'}
                </td>
            `;
            tbody.appendChild(tr);
        }
    });

    // Actualizamos el contador de registros cargados
    if (contador) {
        contador.innerText = `Mostrando ${data.length} registros históricos (1965-2022).`;
    }
}






