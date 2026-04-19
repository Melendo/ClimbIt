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
  titleHtml = '',
  inputValue,
  inputTag = 'input',
  inputClasses = 'form-control form-control-sm',
  inputAttributes = {},
  placeholder,
  ariaLabel,
  maxLength,
  rows,
  domPrefix = 'perfil',
  dataAttrPrefix = 'data-perfil',
  showView = true,
  showEditButton = true,
  showFieldActions = true,
  startInEditMode = false,
  feedbackHtml = '',
  feedbackInInputWrap = false,
}) {
  const dataPrefix = `${dataAttrPrefix}-${prefix}`;
  const isTextarea = inputTag === 'textarea';
  const inputAttrs = buildAttributes({
    id: `${domPrefix}-${prefix}-input`,
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

  const dividerMarkup = showEditButton
    ? renderEditDivider({
      buttonId: `${domPrefix}-${prefix}-edit-btn`,
      label: `Editar ${prefix}`,
      title: `Editar ${prefix}`,
    })
    : '';
  const showActions = showFieldActions;
  const showEditor = !showView || startInEditMode;
  const feedbackInside = feedbackInInputWrap ? feedbackHtml : '';
  const feedbackOutside = feedbackInInputWrap ? '' : feedbackHtml;

  return `
    <div class="${wrapperClass}" ${dataPrefix}-wrap>
      ${titleHtml}
      ${showView ? `
      <div class="perfil-${prefix}-view w-100" ${dataPrefix}-view>
        <div class="perfil-${prefix}-view-content">
          ${viewContent || ''}
          ${dividerMarkup}
        </div>
      </div>
      ` : ''}
      <div class="perfil-${prefix}-edit${showEditor ? '' : ' d-none'}" ${dataPrefix}-edit>
        <div class="perfil-input-wrap${isTextarea ? ' is-textarea' : ''}">
          ${inputMarkup}
          <button
            type="button"
            class="btn perfil-clear-btn"
            id="${domPrefix}-${prefix}-clear-btn"
            aria-label="Vaciar ${prefix}"
            title="Vaciar ${prefix}"
          >
            <span class="material-icons" style="font-size: 18px;">close</span>
          </button>
          ${feedbackInside}
        </div>
        <div class="perfil-input-counter text-muted small text-end mt-1" ${dataPrefix}-counter></div>
        ${feedbackOutside}
        ${showActions ? `
        <div class="perfil-descripcion-actions mt-2">
          <button type="button" class="btn btn-sm btn-outline-secondary" id="${domPrefix}-${prefix}-cancel-btn">
            Cancelar
          </button>
          <button type="button" class="btn btn-sm btn-primary" id="${domPrefix}-${prefix}-submit-btn">
            Guardar
          </button>
        </div>
        ` : ''}
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
    domPrefix = 'perfil',
    dataAttrPrefix = 'data-perfil',
  } = config;

  const dataPrefix = `${dataAttrPrefix}-${prefix}`;
  const wrap = container.querySelector(`[${dataPrefix}-wrap]`);
  const view = container.querySelector(`[${dataPrefix}-view]`);
  const edit = container.querySelector(`[${dataPrefix}-edit]`);
  const input = container.querySelector(`#${domPrefix}-${prefix}-input`);
  const editBtn = container.querySelector(`#${domPrefix}-${prefix}-edit-btn`);
  const cancelBtn = container.querySelector(`#${domPrefix}-${prefix}-cancel-btn`);
  const clearBtn = container.querySelector(`#${domPrefix}-${prefix}-clear-btn`);
  const counter = container.querySelector(`[${dataPrefix}-counter]`);
  const submitBtn = container.querySelector(`#${domPrefix}-${prefix}-submit-btn`);

  if (!wrap || !edit || !input || !clearBtn) {
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
    if (!view) {
      return;
    }
    edit.classList.add('d-none');
    view.classList.remove('d-none');
    input.value = initialNormalized;
    updateCounter();
    updateSaveState();
  };

  const open = () => {
    if (!view) {
      return;
    }
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

  if (editBtn) {
    editBtn.addEventListener('click', (event) => {
      event.preventDefault();
      open();
    });
  }

  if (cancelBtn) {
    cancelBtn.addEventListener('click', (event) => {
      event.preventDefault();
      close();
    });
  }

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
