document.addEventListener('DOMContentLoaded', function () {
    // Calendario
    const mesActual = document.getElementById('mes-actual') || document.querySelector('.mes-calendario');
    const mesAnterior = document.getElementById('mes-anterior') || document.querySelector('.cabecera-calendario button:first-child');
    const mesSiguiente = document.getElementById('mes-siguiente') || document.querySelector('.cabecera-calendario button:last-child');
    const cuadriculaCalendario = document.querySelector('.cuadricula-calendario');

    // Franjas horarias
    const franjasHorarias = document.querySelectorAll('.franja-horaria:not(.completo)');
    const fechaSeleccionadaTexto = document.getElementById('fecha-seleccionada') || document.querySelector('.seleccion-hora h4');

    // Control de entradas
    const botonesDimensionar = document.querySelectorAll('.boton-cantidad.disminuir');
    const botonesAumentar = document.querySelectorAll('.boton-cantidad.aumentar');
    const entradasCantidad = document.querySelectorAll('.entrada-cantidad');

    // Resumen
    const itemsResumen = document.querySelector('.items-resumen');
    const precioTotal = document.getElementById('precio-total') || document.querySelector('.total-resumen div:last-child');
    const botonPagar = document.querySelector('.boton-pagar');

    // Variables de estado
    let fechaActual = new Date();
    let mesSeleccionado = fechaActual.getMonth();
    let añoSeleccionado = fechaActual.getFullYear();
    let diaSeleccionado = fechaActual.getDate();
    let horaSeleccionada = '16:00 h';

    // Nombres de meses
    const nombresMeses = [
        'Enero', 'Febrero', 'Marzo', 'Abril',
        'Mayo', 'Junio', 'Julio', 'Agosto',
        'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    // Precios
    const precios = {
        general: 8,
        nino: 5,
        reducida: 6,
        grupo: 4
    };

    // Gastos de gestión fijos
    const gastosGestion = 1.50;

    // Función para actualizar el calendario
    function actualizarCalendario() {
        // Actualizar título del mes
        mesActual.textContent = `${nombresMeses[mesSeleccionado]} ${añoSeleccionado}`;

        // Limpiar calendario
        while (cuadriculaCalendario.children.length > 7) { // Mantener las cabeceras
            cuadriculaCalendario.removeChild(cuadriculaCalendario.lastChild);
        }

        // Obtener información del mes
        const primerDiaMes = new Date(añoSeleccionado, mesSeleccionado, 1);
        const ultimoDiaMes = new Date(añoSeleccionado, mesSeleccionado + 1, 0);
        const diasEnMes = ultimoDiaMes.getDate();

        // Calcular día de la semana del primer día (0 = Domingo, 1 = Lunes, etc.)
        let primerDiaSemana = primerDiaMes.getDay();
        if (primerDiaSemana === 0) primerDiaSemana = 7; // Ajustar para que el lunes sea el primer día (1)

        // Añadir días del mes anterior
        const ultimoDiaMesAnterior = new Date(añoSeleccionado, mesSeleccionado, 0).getDate();
        for (let i = primerDiaSemana - 1; i > 0; i--) {
            const diaAnterior = document.createElement('div');
            diaAnterior.className = 'dia-calendario no-disponible';
            diaAnterior.textContent = ultimoDiaMesAnterior - i + 1;
            cuadriculaCalendario.appendChild(diaAnterior);
        }

        // Añadir días del mes actual
        for (let dia = 1; dia <= diasEnMes; dia++) {
            const fechaDia = new Date(añoSeleccionado, mesSeleccionado, dia);
            const esDiaDisponible = fechaDia.getDay() !== 1; // Los lunes el planetario está cerrado

            const elementoDia = document.createElement('div');
            elementoDia.textContent = dia;
            elementoDia.className = esDiaDisponible ? 'dia-calendario disponible' : 'dia-calendario no-disponible';

            // Marcar el día seleccionado
            if (dia === diaSeleccionado && mesSeleccionado === fechaActual.getMonth() && añoSeleccionado === fechaActual.getFullYear()) {
                elementoDia.classList.add('seleccionado');
            }

            // Añadir evento clic solo a los días disponibles
            if (esDiaDisponible) {
                elementoDia.addEventListener('click', function () {
                    // Quitar selección anterior
                    const diaAnterior = document.querySelector('.dia-calendario.seleccionado');
                    if (diaAnterior) {
                        diaAnterior.classList.remove('seleccionado');
                    }

                    // Marcar nuevo día
                    this.classList.add('seleccionado');
                    diaSeleccionado = dia;

                    // Actualizar texto de fecha seleccionada
                    actualizarFechaSeleccionada();
                });
            }

            cuadriculaCalendario.appendChild(elementoDia);
        }

        // Añadir días del mes siguiente para completar la cuadrícula
        const casillasTotales = 42; // 6 filas de 7 días
        const casillasUsadas = cuadriculaCalendario.children.length;
        const casillasRestantes = casillasTotales - casillasUsadas;

        for (let i = 1; i <= casillasRestantes; i++) {
            const diaSiguiente = document.createElement('div');
            diaSiguiente.className = 'dia-calendario no-disponible';
            diaSiguiente.textContent = i;
            cuadriculaCalendario.appendChild(diaSiguiente);
        }
    }

    // Función para actualizar el texto de la fecha seleccionada
    function actualizarFechaSeleccionada() {
        if (fechaSeleccionadaTexto) {
            fechaSeleccionadaTexto.textContent = `Horarios disponibles para el ${diaSeleccionado} de ${nombresMeses[mesSeleccionado]}:`;
        }
    }

    // Función para calcular y actualizar el total
    function actualizarTotal() {
        let subtotal = 0;
        let resumenTexto = [];

        // Calcular para cada tipo de entrada
        entradasCantidad.forEach(entrada => {
            const tipo = entrada.getAttribute('data-tipo');
            const cantidad = parseInt(entrada.value);
            const precioUnitario = precios[tipo];

            if (cantidad > 0) {
                const precioTotal = cantidad * precioUnitario;
                subtotal += precioTotal;

                // Añadir al resumen de texto
                let nombreEntrada;
                switch (tipo) {
                    case 'general': nombreEntrada = 'Entrada General'; break;
                    case 'nino': nombreEntrada = 'Niños (5-12 años)'; break;
                    case 'reducida': nombreEntrada = 'Estudiantes y Jubilados'; break;
                    case 'grupo': nombreEntrada = 'Grupos escolares'; break;
                }

                resumenTexto.push(`${cantidad} × ${nombreEntrada}`);
            }
        });

        // Actualizar items del resumen
        if (itemsResumen) {
            itemsResumen.innerHTML = '';

            // Añadir cada tipo de entrada al resumen
            entradasCantidad.forEach(entrada => {
                const tipo = entrada.getAttribute('data-tipo');
                const cantidad = parseInt(entrada.value);

                if (cantidad > 0) {
                    const precioUnitario = precios[tipo];
                    const precioTotal = cantidad * precioUnitario;

                    let nombreEntrada;
                    switch (tipo) {
                        case 'general': nombreEntrada = 'Entrada General'; break;
                        case 'nino': nombreEntrada = 'Niños (5-12 años)'; break;
                        case 'reducida': nombreEntrada = 'Estudiantes y Jubilados'; break;
                        case 'grupo': nombreEntrada = 'Grupos escolares'; break;
                    }

                    const itemHTML = `
                        <div class="item-resumen">
                            <div class="nombre-item">${cantidad} × ${nombreEntrada}</div>
                            <div class="precio-item">${precioTotal.toFixed(2)} €</div>
                        </div>
                    `;
                    itemsResumen.insertAdjacentHTML('beforeend', itemHTML);
                }
            });

            // Añadir gastos de gestión
            const itemHTML = `
                <div class="item-resumen">
                    <div class="nombre-item">Gastos de gestión</div>
                    <div class="precio-item">${gastosGestion.toFixed(2)} €</div>
                </div>
            `;
            itemsResumen.insertAdjacentHTML('beforeend', itemHTML);
        }

        // Calcular total con gastos de gestión
        const total = subtotal + gastosGestion;

        // Actualizar precio total
        if (precioTotal) {
            precioTotal.textContent = `${total.toFixed(2)} €`;
        }
    }

    // Eventos para navegación del calendario
    if (mesAnterior) {
        mesAnterior.addEventListener('click', function () {
            mesSeleccionado--;
            if (mesSeleccionado < 0) {
                mesSeleccionado = 11;
                añoSeleccionado--;
            }
            actualizarCalendario();
        });
    }

    if (mesSiguiente) {
        mesSiguiente.addEventListener('click', function () {
            mesSeleccionado++;
            if (mesSeleccionado > 11) {
                mesSeleccionado = 0;
                añoSeleccionado++;
            }
            actualizarCalendario();
        });
    }

    // Eventos para selección de hora
    franjasHorarias.forEach(franja => {
        franja.addEventListener('click', function () {
            // Quitar selección actual
            document.querySelector('.franja-horaria.seleccionado')?.classList.remove('seleccionado');
            // Añadir nueva selección
            this.classList.add('seleccionado');
            // Actualizar hora seleccionada
            horaSeleccionada = this.textContent;
        });
    });

    // Eventos para los botones de cantidad
    botonesDimensionar.forEach(boton => {
        boton.addEventListener('click', function () {
            const entrada = this.parentElement.querySelector('.entrada-cantidad');
            const valorActual = parseInt(entrada.value);

            if (valorActual > 0) {
                entrada.value = valorActual - 1;
                actualizarTotal();
            }
        });
    });

    botonesAumentar.forEach(boton => {
        boton.addEventListener('click', function () {
            const entrada = this.parentElement.querySelector('.entrada-cantidad');
            const valorActual = parseInt(entrada.value);
            const valorMaximo = parseInt(entrada.getAttribute('max'));

            if (valorActual < valorMaximo) {
                entrada.value = valorActual + 1;
                actualizarTotal();
            }
        });
    });

    // Evento de compra
    if (botonPagar) {
        botonPagar.addEventListener('click', function (event) {
            event.preventDefault();

            // Comprobar si hay al menos una entrada seleccionada
            let hayEntradas = false;
            entradasCantidad.forEach(entrada => {
                if (parseInt(entrada.value) > 0) {
                    hayEntradas = true;
                }
            });

            if (!hayEntradas) {
                alert('Por favor, selecciona al menos una entrada.');
                return;
            }

            // Añadir efecto de carga
            this.classList.add('procesando');
            this.textContent = 'Procesando...';

            // Simular procesamiento (en una aplicación real, aquí iría la llamada al servidor)
            setTimeout(() => {
                // Mensaje de éxito
                alert(`¡Compra realizada con éxito!\n\nDetalles:\nFecha: ${diaSeleccionado} de ${nombresMeses[mesSeleccionado]} de ${añoSeleccionado}\nHora: ${horaSeleccionada}\nTotal: ${precioTotal.textContent}\n\nRecibirás un correo con tus entradas.`);

                // Restaurar botón
                this.classList.remove('procesando');
                this.textContent = 'Completar compra';

                // Opcionalmente, redirigir a inicio o limpiar formulario
                // window.location.href = 'index.html';
            }, 2000);
        });
    }

    // Inicialización
    actualizarCalendario();
    actualizarFechaSeleccionada();
    actualizarTotal();
});