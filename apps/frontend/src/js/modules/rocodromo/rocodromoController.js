import {
  renderMisRocodromos,
  renderBuscarRocodromos,
  renderInfoRocodromo,
  renderModificarRocodromo,
  renderRocodromoEstadisticas,
} from './rocodromoView.js';
import {
  fetchClient,
  fetchImageObjectUrl,
  canManageRocodromo,
} from '../../core/client.js';
import {
  showLoading,
  showError,
  showFormAlert,
  clearFormAlert,
  setFieldError,
  clearFieldError,
} from '../../core/ui.js';
import { showToast } from '../../components/toast.js';

const ROCODROMO_LOGO_PLACEHOLDER = '/assets/rocodromoDefecto.webp';
const PERFIL_PLACEHOLDER = '/assets/johnDoe.png';
const MAX_LOGO_SIZE_BYTES = 3 * 1024 * 1024;
const DEFAULT_ESCALADOR_STATS = {
  totalRutas: 0,
  totalFlash: 0,
  totalCompletado: 0,
  totalProyecto: 0,
  totalRutasActivasRocodromo: 0,
  porcentajeFlash: 0,
  totalBloques: 0,
  totalVias: 0,
  porcentajeBloques: 0,
  porcentajeVias: 0,
  favoritaTexto: 'Bloque',
  maxDificultadBloque: '',
  maxDificultadVia: '',
  actividadMensual: [],
};
let rocodromoStatsAvatarObjectUrl = null;

function toSafeNumber(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return 0;
  }

  return parsed;
}

function normalizeActividadMensual(actividadMensual) {
  if (!Array.isArray(actividadMensual)) {
    return [];
  }

  return actividadMensual
    .map((item) => {
      const dia = Number(item?.dia);
      const rutas = toSafeNumber(item?.rutas);

      if (!Number.isInteger(dia) || dia < 1 || dia > 31) {
        return null;
      }

      return {
        dia,
        rutas,
      };
    })
    .filter(Boolean);
}

function getDefaultEscaladorStats() {
  return {
    ...DEFAULT_ESCALADOR_STATS,
    actividadMensual: [],
  };
}

function normalizeEscaladorStats(rawStats = {}) {
  const favoritaTexto =
    typeof rawStats.favoritaTexto === 'string' && rawStats.favoritaTexto.trim()
      ? rawStats.favoritaTexto.trim()
      : DEFAULT_ESCALADOR_STATS.favoritaTexto;

  return {
    ...getDefaultEscaladorStats(),
    totalRutas: toSafeNumber(rawStats.totalRutas),
    totalFlash: toSafeNumber(rawStats.totalFlash),
    totalCompletado: toSafeNumber(rawStats.totalCompletado),
    totalProyecto: toSafeNumber(rawStats.totalProyecto),
    totalRutasActivasRocodromo: toSafeNumber(
      rawStats.totalRutasActivasRocodromo
    ),
    porcentajeFlash: toSafeNumber(rawStats.porcentajeFlash),
    totalBloques: toSafeNumber(rawStats.totalBloques),
    totalVias: toSafeNumber(rawStats.totalVias),
    porcentajeBloques: toSafeNumber(rawStats.porcentajeBloques),
    porcentajeVias: toSafeNumber(rawStats.porcentajeVias),
    favoritaTexto,
    maxDificultadBloque:
      typeof rawStats.maxDificultadBloque === 'string'
        ? rawStats.maxDificultadBloque.trim()
        : '',
    maxDificultadVia:
      typeof rawStats.maxDificultadVia === 'string'
        ? rawStats.maxDificultadVia.trim()
        : '',
    actividadMensual: normalizeActividadMensual(rawStats.actividadMensual),
  };
}

function revokeObjectUrl(url) {
  if (typeof url === 'string' && url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
}

async function cargarEscaladorBasico() {
  const response = await fetchClient('/escaladores/perfil');
  const escalador = await response.json();

  if (rocodromoStatsAvatarObjectUrl) {
    revokeObjectUrl(rocodromoStatsAvatarObjectUrl);
    rocodromoStatsAvatarObjectUrl = null;
  }

  const idFotoPerfil = Number(escalador?.idFotoPerfil);
  if (Number.isInteger(idFotoPerfil) && idFotoPerfil > 0) {
    try {
      escalador.fotoSrc = await fetchImageObjectUrl(
        `/escaladores/fotos-perfil/${idFotoPerfil}`
      );
      rocodromoStatsAvatarObjectUrl = escalador.fotoSrc;
    } catch (err) {
      console.warn('No se pudo cargar la foto de perfil:', err.message);
      escalador.fotoSrc = PERFIL_PLACEHOLDER;
    }
  } else {
    escalador.fotoSrc = PERFIL_PLACEHOLDER;
  }

  return escalador;
}

async function cargarEstadisticasEscaladorPorRocodromo(idRocodromo) {
  const [resumenResponse, tiposResponse, dificultadMaximaResponse] =
    await Promise.all([
      fetchClient(`/escaladores/stats/rocodromo/${idRocodromo}/resumen`),
      fetchClient(`/escaladores/stats/rocodromo/${idRocodromo}/tipos`),
      fetchClient(
        `/escaladores/stats/rocodromo/${idRocodromo}/dificultad-maxima`
      ),
    ]);

  const resumen = await resumenResponse.json();
  const tipos = await tiposResponse.json();
  const dificultadMaxima = await dificultadMaximaResponse.json();

  return normalizeEscaladorStats({
    ...resumen,
    ...tipos,
    ...dificultadMaxima,
  });
}

function applyRocodromoServerValidationErrors(validationErrors, fields) {
  if (!Array.isArray(validationErrors)) return;

  const { nombreInput, ubicacionInput, descripcionInput, horariosInput } =
    fields;

  validationErrors.forEach((errorItem) => {
    const field = errorItem.field;
    const msg = errorItem.msg || 'Valor invalido';

    if (field === 'nombre') setFieldError(nombreInput, msg);
    if (field === 'ubicacion') setFieldError(ubicacionInput, msg);
    if (field === 'descripcion') setFieldError(descripcionInput, msg);
    if (field === 'horarios') setFieldError(horariosInput, msg);
  });
}

// Controlador para la vista de "Mis Rocódromos" (rocodromos suscritos del usuario)
export async function misRocodromosCmd(container) {
  showLoading();

  try {
    const response = await fetchClient('/escaladores/mis-rocodromos');
    const rocodromos = await response.json();
    const rocodromosConLogo = await Promise.all(
      rocodromos.map(async (rocodromo) => ({
        ...rocodromo,
        logoSrc: await resolveRocodromoLogoSrc(rocodromo),
      }))
    );
    renderMisRocodromos(container, rocodromosConLogo);
  } catch (err) {
    console.warn('Error al obtener mis rocódromos:', err.message);
    // Mostrar vista con lista vacía si hay error
    renderMisRocodromos(container, []);
  }
}

// Controlador para la vista de buscar rocódromos (todos los disponibles)
export async function buscarRocodromosCmd(container) {
  showLoading();

  try {
    // Obtener todos los rocódromos disponibles
    const response = await fetchClient('/rocodromos');
    const rocodromos = await response.json();

    // Obtener los rocódromos suscritos para marcarlos
    let suscritosIds = [];
    try {
      const suscritosRes = await fetchClient('/escaladores/mis-rocodromos');
      const suscritos = await suscritosRes.json();
      suscritosIds = suscritos.map((r) => r.id);
    } catch (err) {
      console.warn('No se pudieron obtener rocódromos suscritos:', err.message);
    }

    const rocodromosConLogo = await Promise.all(
      rocodromos.map(async (rocodromo) => ({
        ...rocodromo,
        logoSrc: await resolveRocodromoLogoSrc(rocodromo),
      }))
    );

    renderBuscarRocodromos(container, rocodromosConLogo, suscritosIds);
  } catch (err) {
    console.warn('Error al obtener rocódromos:', err.message);
    // Mostrar vista con lista vacía si hay error
    renderBuscarRocodromos(container, [], []);
  }
}

// Controlador para la vista de información completa de un rocódromo
export async function infoRocoCmd(container, id) {
  if (!id) {
    showError('ID de rocódromo no válido o no proporcionado');
    return;
  }

  showLoading();

  try {
    const response = await fetchClient(`/rocodromos/${id}`);
    const rocodromo = await response.json();

    rocodromo.logoSrc = await resolveRocodromoLogoSrc(rocodromo);
    const canManage = canManageRocodromo(rocodromo?.id);

    // Verificar si el usuario está suscrito a este rocódromo
    let estaSuscrito = false;
    try {
      const suscritosRes = await fetchClient('/escaladores/mis-rocodromos');
      const suscritos = await suscritosRes.json();
      estaSuscrito = suscritos.some((r) => r.id === rocodromo.id);
    } catch (err) {
      console.warn('No se pudieron obtener rocódromos suscritos:', err.message);
    }

    renderInfoRocodromo(container, rocodromo, estaSuscrito, canManage);

    if (canManage) {
      const updateLogoBtn = container.querySelector(
        '#btn-actualizar-logo-roco'
      );
      const logoInput = container.querySelector('#input-logo-roco');

      if (updateLogoBtn && logoInput) {
        updateLogoBtn.addEventListener('click', () => {
          logoInput.click();
        });

        logoInput.addEventListener('change', async () => {
          const logoFile = logoInput.files?.[0] || null;
          if (!logoFile) return;

          if (!logoFile.type.startsWith('image/')) {
            showError('El logo debe ser un archivo de tipo imagen.');
            return;
          }

          if (logoFile.size > MAX_LOGO_SIZE_BYTES) {
            showError('El logo no puede superar los 3MB.');
            return;
          }

          updateLogoBtn.setAttribute('disabled', 'disabled');

          try {
            const formData = new FormData();
            formData.append('logo', logoFile);

            await fetchClient(`/rocodromos/${rocodromo.id}/logo`, {
              method: 'POST',
              body: formData,
            });

            await infoRocoCmd(container, rocodromo.id);
          } catch (err) {
            showError(
              `Error al actualizar el logo del rocódromo: ${err.message}`
            );
          } finally {
            logoInput.value = '';
            updateLogoBtn.removeAttribute('disabled');
          }
        });
      }
    }
  } catch (err) {
    showError(`Error al obtener la información del rocódromo: ${err.message}`);
  }
}

export async function rocodromoEstadisticasCmd(container, id) {
  const idRocodromo = Number(id);
  if (!Number.isInteger(idRocodromo) || idRocodromo < 1) {
    showError('ID de rocódromo no válido o no proporcionado');
    return;
  }

  showLoading();

  try {
    const rocodromoResponse = await fetchClient(`/rocodromos/${idRocodromo}`);
    const rocodromo = await rocodromoResponse.json();
    rocodromo.logoSrc = await resolveRocodromoLogoSrc(rocodromo);

    const [escalador, estadisticas] = await Promise.all([
      cargarEscaladorBasico().catch(() => ({
        apodo: 'Escalador',
        fotoSrc: PERFIL_PLACEHOLDER,
      })),
      cargarEstadisticasEscaladorPorRocodromo(idRocodromo).catch(() =>
        getDefaultEscaladorStats()
      ),
    ]);

    renderRocodromoEstadisticas(container, {
      rocodromo,
      escalador,
      estadisticas: normalizeEscaladorStats(estadisticas),
    });
  } catch (err) {
    showError(`Error al cargar estadísticas del rocódromo: ${err.message}`);
  }
}

export async function modificarRocodromoCmd(container, id) {
  const idRocodromo = Number(id);
  if (!Number.isInteger(idRocodromo) || idRocodromo < 1) {
    showError('ID de rocódromo no válido');
    return;
  }

  if (!canManageRocodromo(idRocodromo)) {
    showError('No tienes permisos para modificar este rocódromo.');
    return;
  }

  showLoading();

  try {
    const response = await fetchClient(`/rocodromos/${idRocodromo}`);
    const rocodromo = await response.json();

    const callbacks = {
      onFieldChange: (field, alertBox) => {
        clearFieldError(field);
        clearFormAlert(alertBox);
      },
      onSubmit: async (values, fields) => {
        const {
          nombreInput,
          ubicacionInput,
          descripcionInput,
          horariosInput,
          alertBox,
          submitButton,
        } = fields;

        clearFormAlert(alertBox);
        [nombreInput, ubicacionInput, descripcionInput, horariosInput].forEach(
          clearFieldError
        );

        const payload = {};
        const nombre = String(values.nombre || '').trim();
        const ubicacion = String(values.ubicacion || '').trim();
        const descripcion = String(values.descripcion || '').trim();
        const horarios = String(values.horarios || '').trim();

        if (nombre) payload.nombre = nombre;
        if (ubicacion) payload.ubicacion = ubicacion;
        if (descripcion) payload.descripcion = descripcion;
        if (horarios) payload.horarios = horarios;

        if (Object.keys(payload).length === 0) {
          showFormAlert(
            alertBox,
            'warning',
            'Debes introducir al menos un campo para actualizar.'
          );
          return;
        }

        submitButton.setAttribute('disabled', 'disabled');

        try {
          await fetchClient(`/rocodromos/${idRocodromo}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });

          showFormAlert(
            alertBox,
            'success',
            'Rocódromo actualizado correctamente.'
          );
          window.location.hash = `#infoRoco?id=${idRocodromo}`;
        } catch (err) {
          if (err.response && err.response.status === 422) {
            const body = await err.response.json();
            applyRocodromoServerValidationErrors(body.errors, {
              nombreInput,
              ubicacionInput,
              descripcionInput,
              horariosInput,
            });
            showFormAlert(
              alertBox,
              'danger',
              'Solicitud invalida. Revisa los campos.'
            );
            return;
          }

          showFormAlert(
            alertBox,
            'danger',
            `Error al modificar rocódromo: ${err.message}`
          );
        } finally {
          submitButton.removeAttribute('disabled');
        }
      },
    };

    renderModificarRocodromo(container, callbacks, {
      nombre: rocodromo?.nombre || '',
      ubicacion: rocodromo?.ubicacion || '',
      descripcion: rocodromo?.descripcion || '',
      horarios: rocodromo?.horarios || '',
    });
  } catch (err) {
    showError(`Error al cargar el rocódromo para modificar: ${err.message}`);
  }
}

// Función para suscribirse a un rocódromo
export async function suscribirseRocodromo(idRocodromo, button = null) {
  try {
    await fetchClient('/escaladores/suscribirse', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ idRocodromo }),
    });

    // Actualizar el botón localmente si se proporcionó
    if (button) {
      updateSubscribeButton(button, true);
    }

    showToast('Rocódromo añadido a favoritos', {
      duration: 2000,
      variant: 'success',
    });
  } catch (err) {
    console.error('Error al suscribirse:', err.message);
    showToast('Error al suscribirse al rocódromo', {
      duration: 3000,
      variant: 'danger',
    });
  }
}

// Función para desuscribirse de un rocódromo
export async function desuscribirseRocodromo(idRocodromo, button = null) {
  try {
    await fetchClient('/escaladores/desuscribirse', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ idRocodromo }),
    });

    // Actualizar el botón localmente si se proporcionó
    if (button) {
      updateSubscribeButton(button, false);
    }

    showToast('Rocódromo removido de favoritos', {
      duration: 2000,
      variant: 'success',
    });
  } catch (err) {
    console.error('Error al desuscribirse:', err.message);
    showToast('Error al desuscribirse del rocódromo', {
      duration: 3000,
      variant: 'danger',
    });
  }
}

// Función auxiliar para actualizar el estado visual del botón
function updateSubscribeButton(button, estaSuscrito) {
  const icon = button.querySelector('.material-icons');

  if (estaSuscrito) {
    // Cambiar a estado suscrito (estrella llena)
    button.classList.remove('btn-outline-secondary', 'btn-suscribirse');
    button.classList.add('btn-warning', 'btn-desuscribirse');
    button.setAttribute('title', 'Quitar de favoritos');
    button.setAttribute('aria-label', 'Quitar de favoritos');
    if (icon) icon.textContent = 'star';
  } else {
    // Cambiar a estado no suscrito (estrella vacía)
    button.classList.remove('btn-warning', 'btn-desuscribirse');
    button.classList.add('btn-outline-secondary', 'btn-suscribirse');
    button.setAttribute('title', 'Marcar como favorito');
    button.setAttribute('aria-label', 'Marcar como favorito');
    if (icon) icon.textContent = 'star_border';
  }
}

// Exponer funciones globalmente para los event listeners de las vistas
window.suscribirseRocodromo = suscribirseRocodromo;
window.desuscribirseRocodromo = desuscribirseRocodromo;

// Función auxiliar para resolver la URL de la imagen del logo de un rocódromo
async function resolveRocodromoLogoSrc(rocodromo) {
  if (!rocodromo?.logoUrl) {
    return ROCODROMO_LOGO_PLACEHOLDER;
  }

  try {
    return await fetchImageObjectUrl(`/rocodromos/${rocodromo.id}/logo`);
  } catch (err) {
    console.warn('No se pudo cargar el logo del rocódromo:', err.message);
    return ROCODROMO_LOGO_PLACEHOLDER;
  }
}
