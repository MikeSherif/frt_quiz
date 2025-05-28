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
//скрипт для квиза

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, initializing quiz functionality');

  // Управление подвопросами
  document.querySelectorAll('input[type="radio"][data-subquestion]').forEach(radio => {
    radio.addEventListener('change', () => {
      console.log(`Radio changed: ${radio.id}, value: ${radio.value}, subquestion: ${radio.getAttribute('data-subquestion')}`);

      const parentFieldset = radio.closest('.quiz__fieldset').closest('.quiz__list-el-body');
      if (!parentFieldset) {
        console.error('Parent fieldset not found for radio:', radio.id);
        return;
      }

      // Скрываем все подвопросы в текущем fieldset
      parentFieldset.querySelectorAll('.quiz__subquestions').forEach(sub => {
        console.log(`Hiding subquestion: ${sub.getAttribute('data-subquestion-id')}`);
        sub.style.display = 'none';
        sub.querySelectorAll('input, textarea').forEach(field => {
          field.disabled = true;
        });
        const preview = sub.querySelector('.file-upload-preview');
        if (preview) {
          console.log(`Clearing file preview for: ${preview.id}`);
          preview.innerHTML = '';
        }
      });

      // Показываем нужный подвопрос
      if (radio.checked) {
        const subquestionId = radio.getAttribute('data-subquestion');
        parentFieldset.querySelectorAll('.quiz__subquestions').forEach(sub => {
          const subquestionIds = sub.getAttribute('data-subquestion-id').split(' ');
          if (subquestionIds.includes(subquestionId)) {
            console.log(`Showing subquestion: ${sub.getAttribute('data-subquestion-id')}`);
            sub.style.display = 'flex';
            sub.querySelectorAll('input, textarea').forEach(field => {
              field.disabled = false;
            });
            const fileInput = sub.querySelector('input[type="file"]');
            if (fileInput) {
              console.log(`Initializing file upload for: ${fileInput.id}`);
              initFileUpload(fileInput, sub);
            }
          }
        });
      }
    });
  });

  // Ограничение года в input[type="date"]
  document.querySelectorAll('input[type="date"]').forEach(dateInput => {
    dateInput.addEventListener('input', function () {
      const value = this.value;
      console.log(`Date input changed: ${value}`);
      if (value) {
        const [year, month, day] = value.split('-');
        if (year.length > 4) {
          console.log(`Year too long (${year}), trimming to 4 digits`);
          this.value = year.slice(0, 4) + (month ? '-' + month : '') + (day ? '-' + day : '');
        }
      }
    });

    dateInput.addEventListener('blur', function () {
      const value = this.value;
      console.log(`Date input blur: ${value}`);
      if (value) {
        const [year] = value.split('-');
        if (year.length !== 4 || isNaN(year) || year < 1900 || year > 9999) {
          console.warn(`Invalid year: ${year}`);
          alert('Введите корректный год (4 цифры, 1900–9999).');
          this.value = '';
        }
      }
    });
  });

  // Инициализация загрузки файлов
  function initFileUpload(fileInput, sub) {
    const previewDiv = sub.querySelector('.file-upload-preview');
    console.log(`Setting up file input: ${fileInput.id}`);

    fileInput.addEventListener('change', (e) => {
      const files = Array.from(e.target.files);
      console.log(`Files selected: ${files.length} for input: ${fileInput.id}`);

      if (files.length > 20) {
        console.warn(`Too many files selected: ${files.length}`);
        alert('Максимум 20 файлов.');
        fileInput.value = '';
        return;
      }

      files.forEach(file => {
        console.log(`Processing file: ${file.name}, size: ${file.size} bytes`);
        if (file.size > 20 * 1024 * 1024) {
          console.warn(`File too large: ${file.name}, size: ${file.size} bytes`);
          alert(`Файл "${file.name}" превышает 20 МБ.`);
          return;
        }
        addFilePreview(file, previewDiv, fileInput);
      });
    });
  }

  // Добавление плашки файла
  function addFilePreview(file, previewDiv, fileInput) {
    const fileItem = document.createElement('div');
    fileItem.className = 'file-item';
    const fileUrl = URL.createObjectURL(file);
    fileItem.innerHTML = `
            <span style="display: flex; width: 100%;">
              <div class="file-item-wrapper">
                <img src="img/attach_file.svg" alt="Иконка прикрепления файла">
                <a href="${fileUrl}" target="_blank">${file.name}</a>
              </div>
              <button class="remove-file" data-file-name="${file.name}">×</button>
            </span>
        `;
    previewDiv.appendChild(fileItem);
    console.log(`Added file preview: ${file.name}`);

    fileItem.querySelector('.remove-file').addEventListener('click', () => {
      console.log(`Removing file: ${file.name}`);
      fileItem.remove();
      const dataTransfer = new DataTransfer();
      Array.from(fileInput.files).forEach(f => {
        if (f.name !== file.name) {
          dataTransfer.items.add(f);
        }
      });
      fileInput.files = dataTransfer.files;
      console.log(`Updated file list, remaining files: ${fileInput.files.length}`);
    });
  }

  // Триггер начального состояния
  document.querySelectorAll('input[type="radio"][data-subquestion]:checked').forEach(radio => {
    console.log(`Triggering initial state for pre-selected radio: ${radio.id}`);
    radio.dispatchEvent(new Event('change'));
  });
});
