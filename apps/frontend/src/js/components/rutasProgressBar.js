// Componente de barra de progreso de rutas completadas para gamificación
export function renderRutasProgressBar(rutasTotal = 0, rutasCompletadas = 0) {
    if (!Number.isFinite(rutasTotal) || rutasTotal <= 0) {
        return '';
    }

    const porcentaje = rutasTotal > 0 ? Math.round((rutasCompletadas / rutasTotal) * 100) : 0;
    
    return `
        <div class="rutas-progress-container bg-white px-4 py-3 border-bottom" style="border-top: 1px solid #e5e7eb;">
            <div class="d-flex align-items-center justify-content-between mb-2">
                <div class="d-flex align-items-center gap-2">
                    <span class="material-icons" style="font-size: 20px; color: #16a34a;">trending_up</span>
                    <span class="small fw-semibold text-muted text-uppercase" style="letter-spacing: 0.5px;">Tu progreso</span>
                </div>
                <span class="badge bg-success">${rutasCompletadas}/${rutasTotal}</span>
            </div>
            
            <div class="progress" style="height: 8px; border-radius: 4px; background-color: #e5e7eb;">
                <div 
                    class="progress-bar" 
                    role="progressbar" 
                    style="width: ${porcentaje}%; background: linear-gradient(90deg, #10b981, #059669); transition: width 0.5s ease;" 
                    aria-valuenow="${porcentaje}" 
                    aria-valuemin="0" 
                    aria-valuemax="100"
                    aria-label="Progreso de rutas completadas"
                >
                </div>
            </div>
        </div>
    `;
}

/**
 * Calcula el número de rutas completadas (estado flash o completado)
 * @param {Array} rutas - Lista de rutas
 * @returns {number} Cantidad de rutas completadas
 */
export function calcularRutasCompletadas(rutas = []) {
    if (!Array.isArray(rutas)) return 0;
    
    return rutas.filter((ruta) => {
        const estado = String(ruta?.estado || '').trim().toLowerCase();
        return estado === 'flash' || estado === 'completado';
    }).length;
}
