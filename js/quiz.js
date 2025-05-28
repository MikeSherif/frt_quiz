let select = function () {
  let selectHeader = document.querySelectorAll('.select__header');
  let selectItem = document.querySelectorAll('.select__item');

  selectHeader.forEach(item => {
    item.addEventListener('click', selectToggle);
  });

  selectItem.forEach(item => {
    item.addEventListener('click', selectChoose);
  });

  document.addEventListener('click', function (event) {
    let dropdown = document.querySelector('.select.is-active');
    if (dropdown && !dropdown.contains(event.target)) {
      dropdown.classList.remove('is-active');
    }
  });

  function selectToggle() {
    this.parentElement.classList.toggle('is-active');
  }

  function selectChoose() {
    let text = this.innerText,
      select = this.closest('.select'),
      currentText = select.querySelector('.select__current');
    currentText.innerText = text;
    select.classList.remove('is-active');
    select.classList.add('is-chosen');

  }
};


select();

document.addEventListener('DOMContentLoaded', () => {
  // Управление отображением подвопросов для радио-кнопок
  document.querySelectorAll('input[type="radio"][data-subquestion]').forEach(radio => {
    radio.addEventListener('change', () => {
      const parentFieldset = radio.closest('.quiz__fieldset');
      if (parentFieldset) {
        // Скрываем все подвопросы и отключаем их поля
        parentFieldset.querySelectorAll('.quiz__subquestions').forEach(sub => {
          sub.style.display = 'none';
          sub.querySelectorAll('input, textarea').forEach(field => {
            field.disabled = true;
          });
          // Очищаем превью файлов
          const preview = sub.querySelector('.file-upload-preview');
          if (preview) preview.innerHTML = '';
        });

        // Показываем нужный подвопрос и включаем поля, если выбрано
        if (radio.checked) {
          const subquestionId = radio.getAttribute('data-subquestion');
          const subquestions = document.querySelectorAll(`.quiz__subquestions[data-subquestion-id="${subquestionId}"]`);
          subquestions.forEach(sub => {
            sub.style.display = 'flex';
            sub.querySelectorAll('input, textarea').forEach(field => {
              field.disabled = false;
            });
            // Инициализируем обработчик для input file
            const fileInput = sub.querySelector('input[type="file"]');
            if (fileInput) initFileUpload(fileInput, sub);
          });
        }
      }
    });
  });

  // Инициализация загрузки файлов
  function initFileUpload(fileInput, sub) {
    const previewDiv = sub.querySelector('.file-upload-preview');
    fileInput.addEventListener('change', (e) => {
      const files = Array.from(e.target.files);
      if (files.length > 20) {
        alert('Максимум 20 файлов.');
        fileInput.value = '';
        return;
      }
      files.forEach(file => {
        if (file.size > 20 * 1024 * 1024) {
          alert('Максимальный размер файла — 20 МБ.');
          return;
        }
        addFilePreview(file, previewDiv);
      });
    });
  }

  // Добавление плашки файла
  function addFilePreview(file, previewDiv) {
    const fileItem = document.createElement('div');
    fileItem.className = 'file-item';
    fileItem.innerHTML = `
            <a href="${URL.createObjectURL(file)}" target="_blank">${file.name}</a>
            <span class="remove-file" data-file-name="${file.name}">×</span>
        `;
    previewDiv.appendChild(fileItem);

    // Удаление файла
    fileItem.querySelector('.remove-file').addEventListener('click', () => {
      fileItem.remove();
      const fileInput = previewDiv.previousElementSibling.querySelector('input[type="file"]');
      const dataTransfer = new DataTransfer();
      Array.from(fileInput.files).forEach(f => {
        if (f.name !== file.name) dataTransfer.items.add(f);
      });
      fileInput.files = dataTransfer.files;
    });
  }
});
