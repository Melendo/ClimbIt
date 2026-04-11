import { renderEditDivider } from './editDivider.js';

function buildAttributes(attributes = {}) {
  return Object.entries(attributes)
    .filter(([, value]) => value !== null && value !== undefined && value !== false)
    .map(([key, value]) => {
      if (value === true) {
        return `${key}`;
      }
      return `${key}="${value}"`;
    })
    .join(' ');
}

export function renderEditableField({
  prefix,
  wrapperClass,
  viewContent,
  inputValue,
  inputTag = 'input',
  inputClasses = 'form-control form-control-sm',
  inputAttributes = {},
  placeholder,
  ariaLabel,
  maxLength,
  rows,
}) {
  const dataPrefix = `data-perfil-${prefix}`;
  const isTextarea = inputTag === 'textarea';
  const inputAttrs = buildAttributes({
    id: `perfil-${prefix}-input`,
    class: inputClasses,
    placeholder,
    'aria-label': ariaLabel,
    maxlength: maxLength,
    rows: isTextarea ? rows : null,
    ...inputAttributes,
  });

  const inputMarkup = isTextarea
    ? `<textarea ${inputAttrs}>${inputValue}</textarea>`
    : `<input type="text" ${inputAttrs} value="${inputValue}" />`;

  const dividerMarkup = renderEditDivider({
    buttonId: `perfil-${prefix}-edit-btn`,
    label: `Editar ${prefix}`,
    title: `Editar ${prefix}`,
  });

  return `
    <div class="${wrapperClass}" ${dataPrefix}-wrap>
      <div class="perfil-${prefix}-view" ${dataPrefix}-view>
        ${viewContent}
        ${dividerMarkup}
      </div>
      <div class="perfil-${prefix}-edit d-none" ${dataPrefix}-edit>
        <div class="perfil-input-wrap${isTextarea ? ' is-textarea' : ''}">
          ${inputMarkup}
          <button
            type="button"
            class="btn perfil-clear-btn"
            id="perfil-${prefix}-clear-btn"
            aria-label="Vaciar ${prefix}"
            title="Vaciar ${prefix}"
          >
            <span class="material-icons" style="font-size: 18px;">close</span>
          </button>
        </div>
        <div class="perfil-input-counter text-muted small text-end mt-1" ${dataPrefix}-counter></div>
        <div class="perfil-descripcion-actions mt-2">
          <button type="button" class="btn btn-sm btn-outline-secondary" id="perfil-${prefix}-cancel-btn">
            Cancelar
          </button>
          <button type="button" class="btn btn-sm btn-primary" id="perfil-${prefix}-submit-btn">
            Guardar
          </button>
        </div>
      </div>
    </div>
  `;
}

export function initEditableField(container, config) {
  const {
    prefix,
    initialValue,
    maxLength,
    onSave,
    onOpen,
    disableWhenEmpty = false,
  } = config;

  const wrap = container.querySelector(`[data-perfil-${prefix}-wrap]`);
  const view = container.querySelector(`[data-perfil-${prefix}-view]`);
  const edit = container.querySelector(`[data-perfil-${prefix}-edit]`);
  const input = container.querySelector(`#perfil-${prefix}-input`);
  const editBtn = container.querySelector(`#perfil-${prefix}-edit-btn`);
  const cancelBtn = container.querySelector(`#perfil-${prefix}-cancel-btn`);
  const clearBtn = container.querySelector(`#perfil-${prefix}-clear-btn`);
  const counter = container.querySelector(`[data-perfil-${prefix}-counter]`);
  const submitBtn = container.querySelector(`#perfil-${prefix}-submit-btn`);

  if (!wrap || !view || !edit || !input || !editBtn || !cancelBtn || !clearBtn) {
    return null;
  }

  const initialNormalized = typeof initialValue === 'string'
    ? initialValue.trim()
    : (input.value || '').trim();
  const counterMax = Number.isInteger(maxLength) ? maxLength : input.maxLength;

  const updateCounter = () => {
    if (!counter || !counterMax) {
      return;
    }
    const length = input.value.length;
    counter.textContent = `${length}/${counterMax}`;
  };

  const updateSaveState = () => {
    if (!submitBtn) {
      return;
    }
    const trimmed = input.value.trim();
    const isEmptyDisabled = disableWhenEmpty && trimmed === '';
    submitBtn.disabled = isEmptyDisabled || trimmed === initialNormalized;
  };

  const close = () => {
    edit.classList.add('d-none');
    view.classList.remove('d-none');
    input.value = initialNormalized;
    updateCounter();
    updateSaveState();
  };

  const open = () => {
    if (typeof onOpen === 'function') {
      onOpen();
    }
    view.classList.add('d-none');
    edit.classList.remove('d-none');
    input.focus();
    input.select();
    updateCounter();
    updateSaveState();
  };

  editBtn.addEventListener('click', (event) => {
    event.preventDefault();
    open();
  });

  cancelBtn.addEventListener('click', (event) => {
    event.preventDefault();
    close();
  });

  clearBtn.addEventListener('click', (event) => {
    event.preventDefault();
    input.value = '';
    updateCounter();
    updateSaveState();
    input.focus();
  });

  input.addEventListener('input', () => {
    updateCounter();
    updateSaveState();
  });

  if (submitBtn && typeof onSave === 'function') {
    submitBtn.addEventListener('click', async (event) => {
      event.preventDefault();
      const value = input.value.trim();
      submitBtn.disabled = true;
      try {
        await onSave(value);
      } finally {
        submitBtn.disabled = false;
      }
    });
  }

  updateCounter();
  updateSaveState();

  return { open, close, updateSaveState };
}
