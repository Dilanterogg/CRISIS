/**
 * SimuCrisis — script.js
 * Programación Web I — Desafío Final
 * Lógica de simuladores, DOM, validaciones y casos de estudio
 */

/* =====================================================
   NAVEGACIÓN HAMBURGER
   ===================================================== */
const hamburger = document.getElementById('hamburger');
const mainNav   = document.getElementById('mainNav');

hamburger.addEventListener('click', () => {
  mainNav.classList.toggle('open');
});

// Cerrar menú al hacer clic en un enlace
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => mainNav.classList.remove('open'));
});

/* =====================================================
   TABS DE ESCENARIOS
   ===================================================== */
const tabBtns = document.querySelectorAll('.tab-btn');
const simPanels = document.querySelectorAll('.sim-panel');

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.tab;

    // Actualizar botones
    tabBtns.forEach(b => {
      b.classList.remove('active');
      b.setAttribute('aria-selected', 'false');
    });
    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');

    // Actualizar paneles
    simPanels.forEach(panel => panel.classList.remove('active'));
    document.getElementById('tab-' + target).classList.add('active');
  });
});

/* =====================================================
   UTILIDADES
   ===================================================== */

/**
 * Muestra un mensaje de error en el contenedor dado
 * @param {string} id - ID del elemento de error
 * @param {string} msg - Mensaje a mostrar
 */
function mostrarError(id, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = msg;
  el.classList.remove('hidden');
}

/**
 * Limpia el mensaje de error
 * @param {string} id
 */
function limpiarError(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('hidden');
}

/**
 * Valida que un valor sea un número positivo
 * @param {*} val
 * @returns {boolean}
 */
function esNumeroPositivo(val) {
  return !isNaN(val) && val !== '' && Number(val) >= 0;
}

/**
 * Determina el nivel de alerta: 'ok', 'warn' o 'danger'
 * @param {number} porcentaje - porcentaje restante / de impacto
 */
function nivelAlerta(porcentaje) {
  if (porcentaje >= 60) return 'ok';
  if (porcentaje >= 30) return 'warn';
  return 'danger';
}

/**
 * Formatea número con 2 decimales
 */
function fmt(n) {
  return Number(n).toLocaleString('es-BO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/**
 * Limpia todos los inputs de un formulario por selector
 * @param {string} selector - query selector de contenedor
 */
function limpiarInputs(selector) {
  document.querySelectorAll(selector + ' input').forEach(i => i.value = '');
}

/* =====================================================
   ESCENARIO A — CARBURANTE
   ===================================================== */
document.getElementById('btn-carburante').addEventListener('click', calcularCarburante);
document.getElementById('btn-limpiar-carburante').addEventListener('click', () => {
  limpiarInputs('#tab-carburante');
  document.getElementById('res-carburante').innerHTML = '';
  limpiarError('error-carburante');
});

function calcularCarburante() {
  limpiarError('error-carburante');

  const reserva         = parseFloat(document.getElementById('c-reserva').value);
  const consumo         = parseFloat(document.getElementById('c-consumo').value);
  const reabastecimiento= parseFloat(document.getElementById('c-reabastecimiento').value);
  const nivelCritico    = parseFloat(document.getElementById('c-critico').value);

  // Validaciones
  if (!esNumeroPositivo(reserva) || !esNumeroPositivo(consumo) ||
      !esNumeroPositivo(reabastecimiento) || !esNumeroPositivo(nivelCritico)) {
    mostrarError('error-carburante', '⚠ Por favor completa todos los campos con valores válidos.');
    return;
  }
  if (consumo === 0) {
    mostrarError('error-carburante', '⚠ El consumo diario debe ser mayor a 0.');
    return;
  }

  const netoDiario = consumo - reabastecimiento;

  // Generar tabla diaria
  const filas = [];
  let reservaActual = reserva;
  let diasHastaCritico = null;
  let diasHastaAgotamiento = null;
  let dia = 0;
  const maxDias = 365;

  while (reservaActual > 0 && dia < maxDias) {
    dia++;
    reservaActual = reservaActual - consumo + reabastecimiento;
    if (reservaActual < 0) reservaActual = 0;

    const estado = reservaActual <= nivelCritico ? (reservaActual === 0 ? 'danger' : 'warn') : 'ok';

    if (reservaActual <= nivelCritico && diasHastaCritico === null) {
      diasHastaCritico = dia;
    }
    if (reservaActual <= 0 && diasHastaAgotamiento === null) {
      diasHastaAgotamiento = dia;
    }

    if (dia <= 15 || (dia % 5 === 0 && dia <= 60)) {
      filas.push({ dia, reservaActual: Math.max(0, reservaActual), estado });
    }

    if (diasHastaAgotamiento !== null) break;
  }

  // Porcentaje restante respecto al total inicial
  const reservaFinalReal = Math.max(0, reserva - netoDiario * (diasHastaCritico || dia));
  const pctRestante = (reserva > 0) ? Math.min(100, ((reserva - (diasHastaCritico ? diasHastaCritico * netoDiario : 0)) / reserva) * 100) : 0;
  const nivel = diasHastaAgotamiento ? 'danger' : (diasHastaCritico ? 'warn' : 'ok');

  let html = `
    <div class="result-card">
      <h4>📊 Resultados — Reserva de Carburante</h4>
      <div class="metrics-grid">
        <div class="metric-item">
          <span class="metric-val">${fmt(reserva)}</span>
          <span class="metric-label">Litros iniciales</span>
        </div>
        <div class="metric-item">
          <span class="metric-val ${netoDiario > 0 ? 'danger' : 'ok'}">${fmt(netoDiario)}</span>
          <span class="metric-label">Neto diario (consumo-reab.)</span>
        </div>
        <div class="metric-item">
          <span class="metric-val ${diasHastaCritico ? 'warn' : 'ok'}">${diasHastaCritico !== null ? 'Día ' + diasHastaCritico : '> 1 año'}</span>
          <span class="metric-label">Llega a nivel crítico</span>
        </div>
        <div class="metric-item">
          <span class="metric-val ${diasHastaAgotamiento ? 'danger' : 'ok'}">${diasHastaAgotamiento !== null ? 'Día ' + diasHastaAgotamiento : '> 1 año'}</span>
          <span class="metric-label">Se agota completamente</span>
        </div>
      </div>`;

  // Barra de progreso
  const pctBar = Math.max(0, Math.min(100, diasHastaCritico ? (diasHastaCritico / (diasHastaAgotamiento || diasHastaCritico + 10)) * 100 : 100));
  html += `
      <div style="margin:0.5rem 0 1rem">
        <div style="font-size:0.78rem;color:var(--color-text-muted);margin-bottom:0.3rem">Reserva crítica en ${diasHastaCritico || '—'} días</div>
        <div class="progress-bar-wrap">
          <div class="progress-bar-fill ${nivel}" style="width:${100 - pctBar}%"></div>
        </div>
      </div>`;

  // Tabla de evolución diaria
  html += `
      <table class="result-table">
        <thead><tr><th>Día</th><th>Reserva restante (L)</th><th>Estado</th></tr></thead>
        <tbody>`;

  filas.forEach(f => {
    const estadoTexto = f.estado === 'danger' ? '🔴 Agotado' : (f.estado === 'warn' ? '🟡 Crítico' : '🟢 Normal');
    html += `<tr>
      <td class="highlight">Día ${f.dia}</td>
      <td>${fmt(f.reservaActual)} L</td>
      <td>${estadoTexto}</td>
    </tr>`;
  });

  html += `</tbody></table>`;

  // Alerta final
  if (diasHastaAgotamiento) {
    html += `<div class="alert-box danger"><span class="alert-icon">🚨</span> <span>¡La reserva se agota completamente el <strong>día ${diasHastaAgotamiento}</strong>! Se requiere reabastecimiento urgente o reducción de consumo.</span></div>`;
  } else if (diasHastaCritico) {
    html += `<div class="alert-box warn"><span class="alert-icon">⚠️</span> <span>La reserva llegará al nivel crítico (${fmt(nivelCritico)} L) el <strong>día ${diasHastaCritico}</strong>. Se recomienda planificar reabastecimiento.</span></div>`;
  } else {
    html += `<div class="alert-box ok"><span class="alert-icon">✅</span> <span>La reserva es estable. Con el ritmo actual no se alcanza el nivel crítico en el periodo analizado.</span></div>`;
  }

  html += `</div>`;
  document.getElementById('res-carburante').innerHTML = html;
}

/* =====================================================
   ESCENARIO B — PRECIOS
   ===================================================== */
// Agregar producto dinámicamente
let numProductos = 1;
document.getElementById('btn-agregar-producto').addEventListener('click', () => {
  numProductos++;
  const lista = document.getElementById('productos-lista');
  const div = document.createElement('div');
  div.classList.add('producto-row');
  div.dataset.index = numProductos - 1;
  div.innerHTML = `
    <h4 class="producto-label">Producto ${numProductos}</h4>
    <div class="form-grid">
      <div class="form-group">
        <label>Producto</label>
        <input type="text" class="p-nombre" placeholder="ej. Arroz" />
      </div>
      <div class="form-group">
        <label>Precio anterior (Bs)</label>
        <input type="number" class="p-anterior" placeholder="ej. 8" min="0" step="0.01" />
      </div>
      <div class="form-group">
        <label>Precio actual (Bs)</label>
        <input type="number" class="p-actual" placeholder="ej. 11" min="0" step="0.01" />
      </div>
      <div class="form-group">
        <label>Cantidad mensual</label>
        <input type="number" class="p-cantidad" placeholder="ej. 10" min="0" />
      </div>
    </div>`;
  lista.appendChild(div);
});

document.getElementById('btn-precios').addEventListener('click', calcularPrecios);
document.getElementById('btn-limpiar-precios').addEventListener('click', () => {
  limpiarInputs('#tab-precios');
  document.getElementById('res-precios').innerHTML = '';
  limpiarError('error-precios');
});

function calcularPrecios() {
  limpiarError('error-precios');

  const filas = document.querySelectorAll('.producto-row');
  const productos = [];
  let valido = true;

  filas.forEach((fila, i) => {
    const nombre   = fila.querySelector('.p-nombre').value.trim() || `Producto ${i + 1}`;
    const anterior = parseFloat(fila.querySelector('.p-anterior').value);
    const actual   = parseFloat(fila.querySelector('.p-actual').value);
    const cantidad = parseFloat(fila.querySelector('.p-cantidad').value);

    if (!esNumeroPositivo(anterior) || !esNumeroPositivo(actual) || !esNumeroPositivo(cantidad)) {
      valido = false;
    } else {
      productos.push({ nombre, anterior, actual, cantidad });
    }
  });

  if (!valido || productos.length === 0) {
    mostrarError('error-precios', '⚠ Completa todos los campos numéricos de cada producto.');
    return;
  }

  let gastoAnteriorTotal = 0;
  let gastoActualTotal   = 0;

  let html = `
    <div class="result-card">
      <h4>📊 Resultados — Variación de Precios</h4>
      <table class="result-table">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Gasto ant. (Bs)</th>
            <th>Gasto act. (Bs)</th>
            <th>Aumento (%)</th>
            <th>Diferencia (Bs)</th>
          </tr>
        </thead>
        <tbody>`;

  productos.forEach(p => {
    const gastAnt = p.anterior * p.cantidad;
    const gastAct = p.actual   * p.cantidad;
    const pct = ((p.actual - p.anterior) / p.anterior) * 100;
    const dif = gastAct - gastAnt;

    gastoAnteriorTotal += gastAnt;
    gastoActualTotal   += gastAct;

    const clase = pct > 30 ? 'danger' : (pct > 10 ? 'warn' : 'ok');
    html += `<tr>
      <td class="highlight">${p.nombre}</td>
      <td>${fmt(gastAnt)}</td>
      <td>${fmt(gastAct)}</td>
      <td style="color:var(--color-${clase === 'ok' ? 'ok' : clase === 'warn' ? 'warn' : 'danger'})">${fmt(pct)}%</td>
      <td>+${fmt(dif)}</td>
    </tr>`;
  });

  const difTotal = gastoActualTotal - gastoAnteriorTotal;
  const pctTotal = ((difTotal) / gastoAnteriorTotal) * 100;
  const nivelTotal = pctTotal > 30 ? 'danger' : (pctTotal > 10 ? 'warn' : 'ok');

  html += `
    <tr style="border-top:2px solid var(--color-border)">
      <td class="highlight">TOTAL</td>
      <td class="highlight">${fmt(gastoAnteriorTotal)} Bs</td>
      <td class="highlight">${fmt(gastoActualTotal)} Bs</td>
      <td class="highlight">${fmt(pctTotal)}%</td>
      <td class="highlight">+${fmt(difTotal)} Bs</td>
    </tr>
  </tbody></table>

  <div class="metrics-grid" style="margin-top:1rem">
    <div class="metric-item">
      <span class="metric-val">${fmt(gastoAnteriorTotal)}</span>
      <span class="metric-label">Gasto anterior (Bs)</span>
    </div>
    <div class="metric-item">
      <span class="metric-val warn">${fmt(gastoActualTotal)}</span>
      <span class="metric-label">Gasto actual (Bs)</span>
    </div>
    <div class="metric-item">
      <span class="metric-val danger">+${fmt(difTotal)}</span>
      <span class="metric-label">Gasto adicional (Bs)</span>
    </div>
    <div class="metric-item">
      <span class="metric-val ${nivelTotal}">${fmt(pctTotal)}%</span>
      <span class="metric-label">Aumento promedio</span>
    </div>
  </div>`;

  if (pctTotal > 30) {
    html += `<div class="alert-box danger"><span class="alert-icon">🚨</span><span>El gasto familiar aumentó un <strong>${fmt(pctTotal)}%</strong>. Impacto <strong>ALTO</strong>: la familia gasta <strong>${fmt(difTotal)} Bs más</strong> al mes por el alza de precios.</span></div>`;
  } else if (pctTotal > 10) {
    html += `<div class="alert-box warn"><span class="alert-icon">⚠️</span><span>El gasto familiar aumentó un <strong>${fmt(pctTotal)}%</strong>. Impacto <strong>MODERADO</strong>: se requiere ajustar el presupuesto.</span></div>`;
  } else {
    html += `<div class="alert-box ok"><span class="alert-icon">✅</span><span>El incremento de precios es <strong>leve (${fmt(pctTotal)}%)</strong>. El impacto en el presupuesto familiar es manejable.</span></div>`;
  }

  html += `</div>`;
  document.getElementById('res-precios').innerHTML = html;
}

/* =====================================================
   ESCENARIO C — TRANSPORTE
   ===================================================== */
document.getElementById('btn-transporte').addEventListener('click', calcularTransporte);
document.getElementById('btn-limpiar-transporte').addEventListener('click', () => {
  limpiarInputs('#tab-transporte');
  document.getElementById('res-transporte').innerHTML = '';
  limpiarError('error-transporte');
});

function calcularTransporte() {
  limpiarError('error-transporte');

  const distNormal = parseFloat(document.getElementById('t-normal').value);
  const distDesvio = parseFloat(document.getElementById('t-desvio').value);
  const costoPorKm = parseFloat(document.getElementById('t-costo').value);
  const viajes     = parseFloat(document.getElementById('t-viajes').value);

  if (!esNumeroPositivo(distNormal) || !esNumeroPositivo(distDesvio) ||
      !esNumeroPositivo(costoPorKm) || !esNumeroPositivo(viajes)) {
    mostrarError('error-transporte', '⚠ Por favor completa todos los campos con valores válidos.');
    return;
  }
  if (costoPorKm === 0) {
    mostrarError('error-transporte', '⚠ El costo por km debe ser mayor a 0.');
    return;
  }

  // Cálculos
  const costoNormalViaje  = distNormal * costoPorKm;
  const costoDesvioViaje  = distDesvio * costoPorKm;
  const difViaje          = costoDesvioViaje - costoNormalViaje;

  const costoNormalSem    = costoNormalViaje * viajes;
  const costoDesvioSem    = costoDesvioViaje * viajes;
  const difSemanal        = costoDesvioSem - costoNormalSem;

  const costoNormalMens   = costoNormalSem * 4.33;
  const costoDesvioMens   = costoDesvioSem * 4.33;
  const difMensual        = costoDesvioMens - costoNormalMens;

  const pctAumento = ((difViaje) / costoNormalViaje) * 100;
  const nivel = pctAumento > 50 ? 'danger' : (pctAumento > 20 ? 'warn' : 'ok');

  const html = `
    <div class="result-card">
      <h4>📊 Resultados — Costo de Transporte</h4>
      <div class="metrics-grid">
        <div class="metric-item">
          <span class="metric-val ok">${fmt(costoNormalViaje)}</span>
          <span class="metric-label">Costo normal/viaje (Bs)</span>
        </div>
        <div class="metric-item">
          <span class="metric-val warn">${fmt(costoDesvioViaje)}</span>
          <span class="metric-label">Costo c/desvío/viaje (Bs)</span>
        </div>
        <div class="metric-item">
          <span class="metric-val ${nivel}">${fmt(difSemanal)}</span>
          <span class="metric-label">Gasto adicional/semana (Bs)</span>
        </div>
        <div class="metric-item">
          <span class="metric-val danger">${fmt(difMensual)}</span>
          <span class="metric-label">Gasto adicional/mes (Bs)</span>
        </div>
      </div>

      <table class="result-table" style="margin-top:0.75rem">
        <thead><tr><th>Concepto</th><th>Ruta normal</th><th>Con desvío</th><th>Diferencia</th></tr></thead>
        <tbody>
          <tr>
            <td>Costo por viaje (Bs)</td>
            <td>${fmt(costoNormalViaje)}</td>
            <td>${fmt(costoDesvioViaje)}</td>
            <td class="highlight">+${fmt(difViaje)}</td>
          </tr>
          <tr>
            <td>Costo semanal (Bs)</td>
            <td>${fmt(costoNormalSem)}</td>
            <td>${fmt(costoDesvioSem)}</td>
            <td class="highlight">+${fmt(difSemanal)}</td>
          </tr>
          <tr>
            <td>Costo mensual (Bs)</td>
            <td>${fmt(costoNormalMens)}</td>
            <td>${fmt(costoDesvioMens)}</td>
            <td class="highlight">+${fmt(difMensual)}</td>
          </tr>
        </tbody>
      </table>

      <div class="alert-box ${nivel}" style="margin-top:1rem">
        <span class="alert-icon">${nivel === 'ok' ? '✅' : nivel === 'warn' ? '⚠️' : '🚨'}</span>
        <span>El desvío aumenta el costo de transporte un <strong>${fmt(pctAumento)}%</strong> por viaje. Mensualmente, la familia gasta <strong>${fmt(difMensual)} Bs adicionales</strong> en transporte.</span>
      </div>
    </div>`;

  document.getElementById('res-transporte').innerHTML = html;
}

/* =====================================================
   ESCENARIO D — COMPRAS FAMILIARES
   ===================================================== */
let numCompras = 1;
document.getElementById('btn-agregar-compra').addEventListener('click', () => {
  numCompras++;
  const lista = document.getElementById('compras-lista');
  const div = document.createElement('div');
  div.classList.add('compra-row');
  div.dataset.index = numCompras - 1;
  div.innerHTML = `
    <h4 class="producto-label">Artículo ${numCompras}</h4>
    <div class="form-grid">
      <div class="form-group">
        <label>Producto</label>
        <input type="text" class="cf-nombre" placeholder="ej. Azúcar" />
      </div>
      <div class="form-group">
        <label>Precio unitario (Bs)</label>
        <input type="number" class="cf-precio" placeholder="ej. 12" min="0" step="0.01" />
      </div>
      <div class="form-group">
        <label>Cantidad</label>
        <input type="number" class="cf-cantidad" placeholder="ej. 2" min="0" />
      </div>
    </div>`;
  lista.appendChild(div);
});

document.getElementById('btn-compras').addEventListener('click', calcularCompras);
document.getElementById('btn-limpiar-compras').addEventListener('click', () => {
  limpiarInputs('#tab-compras');
  document.getElementById('res-compras').innerHTML = '';
  limpiarError('error-compras');
});

function calcularCompras() {
  limpiarError('error-compras');

  const presupuesto = parseFloat(document.getElementById('cf-presupuesto').value);
  if (!esNumeroPositivo(presupuesto)) {
    mostrarError('error-compras', '⚠ Ingresa un presupuesto válido.');
    return;
  }

  const filas = document.querySelectorAll('.compra-row');
  const articulos = [];
  let valido = true;

  filas.forEach((fila, i) => {
    const nombre   = fila.querySelector('.cf-nombre').value.trim() || `Artículo ${i + 1}`;
    const precio   = parseFloat(fila.querySelector('.cf-precio').value);
    const cantidad = parseFloat(fila.querySelector('.cf-cantidad').value);

    if (!esNumeroPositivo(precio) || !esNumeroPositivo(cantidad)) {
      valido = false;
    } else {
      articulos.push({ nombre, precio, cantidad, subtotal: precio * cantidad });
    }
  });

  if (!valido || articulos.length === 0) {
    mostrarError('error-compras', '⚠ Completa correctamente los campos de cada artículo.');
    return;
  }

  const totalCompra = articulos.reduce((acc, a) => acc + a.subtotal, 0);
  const saldo       = presupuesto - totalCompra;
  const alcanza     = saldo >= 0;
  const pctUsado    = Math.min(100, (totalCompra / presupuesto) * 100);

  const nivelGasto = pctUsado > 100 ? 'danger' : (pctUsado > 85 ? 'warn' : 'ok');
  const clasifGasto = pctUsado > 100 ? 'Excedido' : (pctUsado > 85 ? 'Alto' : pctUsado > 60 ? 'Medio' : 'Bajo');

  let html = `
    <div class="result-card">
      <h4>📊 Resultados — Presupuesto Familiar</h4>
      <div class="metrics-grid">
        <div class="metric-item">
          <span class="metric-val">${fmt(presupuesto)}</span>
          <span class="metric-label">Presupuesto (Bs)</span>
        </div>
        <div class="metric-item">
          <span class="metric-val ${nivelGasto}">${fmt(totalCompra)}</span>
          <span class="metric-label">Total compra (Bs)</span>
        </div>
        <div class="metric-item">
          <span class="metric-val ${alcanza ? 'ok' : 'danger'}">${fmt(Math.abs(saldo))}</span>
          <span class="metric-label">${alcanza ? 'Saldo restante (Bs)' : 'Monto faltante (Bs)'}</span>
        </div>
        <div class="metric-item">
          <span class="metric-val ${nivelGasto}">${clasifGasto}</span>
          <span class="metric-label">Nivel de gasto</span>
        </div>
      </div>

      <div style="margin:0.75rem 0">
        <div style="font-size:0.78rem;color:var(--color-text-muted);margin-bottom:0.3rem">Uso del presupuesto: ${fmt(pctUsado)}%</div>
        <div class="progress-bar-wrap">
          <div class="progress-bar-fill ${nivelGasto}" style="width:${Math.min(100, pctUsado)}%"></div>
        </div>
      </div>

      <table class="result-table">
        <thead><tr><th>Artículo</th><th>Precio (Bs)</th><th>Cantidad</th><th>Subtotal (Bs)</th></tr></thead>
        <tbody>`;

  articulos.forEach(a => {
    html += `<tr>
      <td class="highlight">${a.nombre}</td>
      <td>${fmt(a.precio)}</td>
      <td>${a.cantidad}</td>
      <td>${fmt(a.subtotal)}</td>
    </tr>`;
  });

  html += `
    <tr style="border-top:2px solid var(--color-border)">
      <td colspan="3" class="highlight">TOTAL</td>
      <td class="highlight">${fmt(totalCompra)} Bs</td>
    </tr>
  </tbody></table>`;

  if (!alcanza) {
    html += `<div class="alert-box danger"><span class="alert-icon">🚨</span><span>El presupuesto <strong>NO alcanza</strong>. Faltan <strong>${fmt(Math.abs(saldo))} Bs</strong> para completar la compra. Se recomienda reducir cantidades o eliminar artículos no esenciales.</span></div>`;
  } else if (pctUsado > 85) {
    html += `<div class="alert-box warn"><span class="alert-icon">⚠️</span><span>El presupuesto alcanza, pero se usa el <strong>${fmt(pctUsado)}%</strong>. Queda un saldo muy ajustado de <strong>${fmt(saldo)} Bs</strong>.</span></div>`;
  } else {
    html += `<div class="alert-box ok"><span class="alert-icon">✅</span><span>El presupuesto <strong>alcanza</strong> para toda la compra. Saldo restante: <strong>${fmt(saldo)} Bs</strong>.</span></div>`;
  }

  html += `</div>`;
  document.getElementById('res-compras').innerHTML = html;
}

/* =====================================================
   ESCENARIO E — RUMOR DE ESCASEZ
   ===================================================== */
document.getElementById('btn-rumor').addEventListener('click', calcularRumor);
document.getElementById('btn-limpiar-rumor').addEventListener('click', () => {
  limpiarInputs('#tab-rumor');
  document.getElementById('res-rumor').innerHTML = '';
  limpiarError('error-rumor');
});

function calcularRumor() {
  limpiarError('error-rumor');

  const demandaNormal = parseFloat(document.getElementById('r-demanda').value);
  const aumento       = parseFloat(document.getElementById('r-aumento').value);
  const stock         = parseFloat(document.getElementById('r-stock').value);
  const familias      = parseFloat(document.getElementById('r-familias').value);

  if (!esNumeroPositivo(demandaNormal) || !esNumeroPositivo(aumento) ||
      !esNumeroPositivo(stock) || !esNumeroPositivo(familias)) {
    mostrarError('error-rumor', '⚠ Por favor completa todos los campos con valores válidos.');
    return;
  }

  // Cálculos
  const nuevaDemanda   = demandaNormal + demandaNormal * (aumento / 100);
  const difDemanda     = nuevaDemanda - demandaNormal;
  const stockRestante  = stock - nuevaDemanda;
  const alcanza        = stockRestante >= 0;
  const porFamiliaNorm = demandaNormal / familias;
  const porFamiliaRum  = nuevaDemanda / familias;
  const pctStock       = Math.min(100, (stock / nuevaDemanda) * 100);
  const nivel = !alcanza ? 'danger' : (pctStock < 115 ? 'warn' : 'ok');

  const html = `
    <div class="result-card">
      <h4>📊 Resultados — Simulador de Rumor de Escasez</h4>
      <div class="metrics-grid">
        <div class="metric-item">
          <span class="metric-val ok">${fmt(demandaNormal)}</span>
          <span class="metric-label">Demanda normal (u)</span>
        </div>
        <div class="metric-item">
          <span class="metric-val warn">${fmt(nuevaDemanda)}</span>
          <span class="metric-label">Nueva demanda (u)</span>
        </div>
        <div class="metric-item">
          <span class="metric-val danger">+${fmt(difDemanda)}</span>
          <span class="metric-label">Aumento demanda (u)</span>
        </div>
        <div class="metric-item">
          <span class="metric-val ${nivel}">${alcanza ? fmt(stockRestante) : fmt(Math.abs(stockRestante))}</span>
          <span class="metric-label">${alcanza ? 'Stock sobrante (u)' : 'Déficit de stock (u)'}</span>
        </div>
      </div>

      <div style="margin:0.75rem 0">
        <div style="font-size:0.78rem;color:var(--color-text-muted);margin-bottom:0.3rem">Stock disponible cubre el ${fmt(pctStock)}% de la nueva demanda</div>
        <div class="progress-bar-wrap">
          <div class="progress-bar-fill ${nivel}" style="width:${pctStock}%"></div>
        </div>
      </div>

      <table class="result-table">
        <thead><tr><th>Indicador</th><th>Situación normal</th><th>Con rumor</th></tr></thead>
        <tbody>
          <tr>
            <td>Demanda total (u)</td>
            <td>${fmt(demandaNormal)}</td>
            <td class="highlight">${fmt(nuevaDemanda)}</td>
          </tr>
          <tr>
            <td>Demanda por familia</td>
            <td>${fmt(porFamiliaNorm)}</td>
            <td class="highlight">${fmt(porFamiliaRum)}</td>
          </tr>
          <tr>
            <td>Stock restante (u)</td>
            <td>${fmt(stock - demandaNormal)}</td>
            <td class="highlight ${!alcanza ? 'danger' : ''}">${fmt(stockRestante)}</td>
          </tr>
        </tbody>
      </table>

      <div class="alert-box ${nivel}" style="margin-top:0.75rem">
        <span class="alert-icon">${!alcanza ? '🚨' : nivel === 'warn' ? '⚠️' : '✅'}</span>
        <span>${!alcanza
          ? `El stock <strong>NO es suficiente</strong>. La nueva demanda de <strong>${fmt(nuevaDemanda)} unidades</strong> supera el stock de <strong>${fmt(stock)} unidades</strong>. Habrá un déficit de <strong>${fmt(Math.abs(stockRestante))} unidades</strong> por compras de pánico.`
          : `El stock es suficiente por ahora (sobran ${fmt(stockRestante)} unidades), pero el margen es <strong>${nivel === 'warn' ? 'ajustado' : 'cómodo'}</strong>. Un aumento mayor del rumor podría agotar el abastecimiento.`
        }</span>
      </div>
    </div>`;

  document.getElementById('res-rumor').innerHTML = html;
}

/* =====================================================
   ESCENARIO F — PODER ADQUISITIVO
   ===================================================== */
document.getElementById('btn-poder').addEventListener('click', calcularPoder);
document.getElementById('btn-limpiar-poder').addEventListener('click', () => {
  limpiarInputs('#tab-poder');
  document.getElementById('res-poder').innerHTML = '';
  limpiarError('error-poder');
});

function calcularPoder() {
  limpiarError('error-poder');

  const ingreso     = parseFloat(document.getElementById('pa-ingreso').value);
  const gastoAnt    = parseFloat(document.getElementById('pa-gasto-ant').value);
  const gastoAct    = parseFloat(document.getElementById('pa-gasto-act').value);
  const precioAnt   = parseFloat(document.getElementById('pa-precio-ant').value);
  const precioAct   = parseFloat(document.getElementById('pa-precio-act').value);

  if (!esNumeroPositivo(ingreso) || !esNumeroPositivo(gastoAnt) ||
      !esNumeroPositivo(gastoAct) || !esNumeroPositivo(precioAnt) || !esNumeroPositivo(precioAct)) {
    mostrarError('error-poder', '⚠ Por favor completa todos los campos con valores válidos.');
    return;
  }
  if (ingreso === 0 || precioAnt === 0) {
    mostrarError('error-poder', '⚠ El ingreso y el precio anterior deben ser mayores a 0.');
    return;
  }

  // Cálculos
  const saldoAnt       = ingreso - gastoAnt;
  const saldoAct       = ingreso - gastoAct;
  const aumentoGasto   = gastoAct - gastoAnt;
  const pctPerdida     = (aumentoGasto / ingreso) * 100;
  const inflacion      = ((precioAct - precioAnt) / precioAnt) * 100;
  const cantAnt        = ingreso / precioAnt;
  const cantAct        = ingreso / precioAct;
  const perdidaCantidad= cantAnt - cantAct;
  const nivelAfectacion= pctPerdida > 30 ? 'ALTO' : (pctPerdida > 15 ? 'MODERADO' : 'LEVE');
  const nivel          = pctPerdida > 30 ? 'danger' : (pctPerdida > 15 ? 'warn' : 'ok');

  const html = `
    <div class="result-card">
      <h4>📊 Resultados — Pérdida del Poder Adquisitivo</h4>
      <div class="metrics-grid">
        <div class="metric-item">
          <span class="metric-val">${fmt(ingreso)}</span>
          <span class="metric-label">Ingreso mensual (Bs)</span>
        </div>
        <div class="metric-item">
          <span class="metric-val ${nivel}">${fmt(pctPerdida)}%</span>
          <span class="metric-label">% Pérdida poder adq.</span>
        </div>
        <div class="metric-item">
          <span class="metric-val ${saldoAnt >= 0 ? 'ok' : 'danger'}">${fmt(saldoAnt)}</span>
          <span class="metric-label">Saldo anterior (Bs)</span>
        </div>
        <div class="metric-item">
          <span class="metric-val ${saldoAct >= 0 ? 'warn' : 'danger'}">${fmt(saldoAct)}</span>
          <span class="metric-label">Saldo actual (Bs)</span>
        </div>
      </div>

      <div style="margin:0.75rem 0">
        <div style="font-size:0.78rem;color:var(--color-text-muted);margin-bottom:0.3rem">Nivel de afectación: <strong style="color:${nivel==='danger'?'var(--color-danger)':nivel==='warn'?'var(--color-warn)':'var(--color-ok)'}">${nivelAfectacion}</strong></div>
        <div class="progress-bar-wrap">
          <div class="progress-bar-fill ${nivel}" style="width:${Math.min(100, pctPerdida * 2)}%"></div>
        </div>
      </div>

      <table class="result-table">
        <thead><tr><th>Indicador</th><th>Antes</th><th>Ahora</th><th>Diferencia</th></tr></thead>
        <tbody>
          <tr>
            <td>Gasto mensual (Bs)</td>
            <td>${fmt(gastoAnt)}</td>
            <td class="highlight">${fmt(gastoAct)}</td>
            <td>+${fmt(aumentoGasto)}</td>
          </tr>
          <tr>
            <td>Saldo disponible (Bs)</td>
            <td>${fmt(saldoAnt)}</td>
            <td class="highlight">${fmt(saldoAct)}</td>
            <td>${fmt(saldoAct - saldoAnt)}</td>
          </tr>
          <tr>
            <td>Precio producto básico (Bs)</td>
            <td>${fmt(precioAnt)}</td>
            <td class="highlight">${fmt(precioAct)}</td>
            <td>+${fmt(precioAct - precioAnt)} (${fmt(inflacion)}%)</td>
          </tr>
          <tr>
            <td>Unidades c/ingreso completo</td>
            <td>${fmt(cantAnt)}</td>
            <td class="highlight">${fmt(cantAct)}</td>
            <td>-${fmt(perdidaCantidad)}</td>
          </tr>
        </tbody>
      </table>

      <div class="alert-box ${nivel}" style="margin-top:0.75rem">
        <span class="alert-icon">${nivel==='ok'?'✅':nivel==='warn'?'⚠️':'🚨'}</span>
        <span>La familia perdió el <strong>${fmt(pctPerdida)}%</strong> de su poder adquisitivo. Con el mismo ingreso de <strong>${fmt(ingreso)} Bs</strong>, ahora puede comprar <strong>${fmt(cantAct)} unidades</strong> del producto básico, en lugar de <strong>${fmt(cantAnt)}</strong>. Nivel de afectación: <strong>${nivelAfectacion}</strong>.</span>
      </div>
    </div>`;

  document.getElementById('res-poder').innerHTML = html;
}

/* =====================================================
   CASOS DE ESTUDIO — CARGA AUTOMÁTICA
   ===================================================== */

/**
 * Carga datos de casos de estudio predefinidos en el simulador correspondiente
 * @param {string} escenario - ID del escenario
 */
function cargarCaso(escenario) {
  // Activar tab correspondiente
  tabBtns.forEach(b => {
    b.classList.remove('active');
    b.setAttribute('aria-selected', 'false');
    if (b.dataset.tab === escenario) {
      b.classList.add('active');
      b.setAttribute('aria-selected', 'true');
    }
  });
  simPanels.forEach(p => p.classList.remove('active'));
  document.getElementById('tab-' + escenario).classList.add('active');

  // Scroll al simulador
  document.getElementById('simulador').scrollIntoView({ behavior: 'smooth', block: 'start' });

  // Cargar datos según escenario
  setTimeout(() => {
    switch (escenario) {
      case 'carburante':
        document.getElementById('c-reserva').value         = 10000;
        document.getElementById('c-consumo').value         = 1200;
        document.getElementById('c-reabastecimiento').value = 300;
        document.getElementById('c-critico').value         = 2000;
        calcularCarburante();
        break;

      case 'precios':
        // Limpiar productos existentes y crear 3
        document.getElementById('productos-lista').innerHTML = '';
        numProductos = 0;
        const datosPrecios = [
          { nombre: 'Arroz',  anterior: 8,  actual: 11, cantidad: 10 },
          { nombre: 'Papa',   anterior: 7,  actual: 10, cantidad: 8  },
          { nombre: 'Aceite', anterior: 12, actual: 18, cantidad: 4  },
        ];
        datosPrecios.forEach((d, i) => {
          numProductos++;
          const lista = document.getElementById('productos-lista');
          const div = document.createElement('div');
          div.classList.add('producto-row');
          div.dataset.index = i;
          div.innerHTML = `
            <h4 class="producto-label">Producto ${numProductos}</h4>
            <div class="form-grid">
              <div class="form-group"><label>Producto</label><input type="text" class="p-nombre" value="${d.nombre}" /></div>
              <div class="form-group"><label>Precio anterior (Bs)</label><input type="number" class="p-anterior" value="${d.anterior}" min="0" step="0.01" /></div>
              <div class="form-group"><label>Precio actual (Bs)</label><input type="number" class="p-actual" value="${d.actual}" min="0" step="0.01" /></div>
              <div class="form-group"><label>Cantidad mensual</label><input type="number" class="p-cantidad" value="${d.cantidad}" min="0" /></div>
            </div>`;
          lista.appendChild(div);
        });
        calcularPrecios();
        break;

      case 'transporte':
        document.getElementById('t-normal').value  = 10;
        document.getElementById('t-desvio').value  = 16;
        document.getElementById('t-costo').value   = 2;
        document.getElementById('t-viajes').value  = 5;
        calcularTransporte();
        break;

      case 'compras':
        document.getElementById('cf-presupuesto').value = 500;
        document.getElementById('compras-lista').innerHTML = '';
        numCompras = 0;
        const datosCompras = [
          { nombre: 'Arroz',   precio: 11,  cantidad: 10 },
          { nombre: 'Aceite',  precio: 18,  cantidad: 4  },
          { nombre: 'Azúcar',  precio: 9,   cantidad: 5  },
          { nombre: 'Harina',  precio: 7,   cantidad: 6  },
          { nombre: 'Fideos',  precio: 5.5, cantidad: 4  },
        ];
        datosCompras.forEach((d, i) => {
          numCompras++;
          const lista = document.getElementById('compras-lista');
          const div = document.createElement('div');
          div.classList.add('compra-row');
          div.dataset.index = i;
          div.innerHTML = `
            <h4 class="producto-label">Artículo ${numCompras}</h4>
            <div class="form-grid">
              <div class="form-group"><label>Producto</label><input type="text" class="cf-nombre" value="${d.nombre}" /></div>
              <div class="form-group"><label>Precio unitario (Bs)</label><input type="number" class="cf-precio" value="${d.precio}" min="0" step="0.01" /></div>
              <div class="form-group"><label>Cantidad</label><input type="number" class="cf-cantidad" value="${d.cantidad}" min="0" /></div>
            </div>`;
          lista.appendChild(div);
        });
        calcularCompras();
        break;

      case 'rumor':
        document.getElementById('r-demanda').value  = 100;
        document.getElementById('r-aumento').value  = 40;
        document.getElementById('r-stock').value    = 120;
        document.getElementById('r-familias').value = 50;
        calcularRumor();
        break;
    }
  }, 400); // esperar a que el scroll inicie
}

/* =====================================================
   SMOOTH SCROLL — HIGHLIGHT ACTIVO EN NAV
   ===================================================== */
const sections = document.querySelectorAll('section[id]');

window.addEventListener('scroll', () => {
  const scrollY = window.scrollY + 100;
  sections.forEach(sec => {
    const top = sec.offsetTop;
    const h   = sec.offsetHeight;
    const id  = sec.getAttribute('id');
    if (scrollY >= top && scrollY < top + h) {
      document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
      const activeLink = document.querySelector(`.nav-link[href="#${id}"]`);
      if (activeLink) activeLink.classList.add('active');
    }
  });
}, { passive: true });
