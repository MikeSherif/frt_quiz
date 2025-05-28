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

  // Управление подвопросами
  document.querySelectorAll('input[type="radio"][data-subquestion]').forEach(radio => {
    radio.addEventListener('change', () => {
      const parentFieldset = radio.closest('.quiz__fieldset').closest('.quiz__list-el-body');
      if (!parentFieldset) {
        return;
      }

      // Скрываем все подвопросы в текущем fieldset, но не трогаем превью файлов
      parentFieldset.querySelectorAll('.quiz__subquestions').forEach(sub => {
        sub.style.display = 'none';
        sub.querySelectorAll('input, textarea').forEach(field => {
          field.disabled = true;
        });
      });

      // Показываем нужный подвопрос
      if (radio.checked) {
        const subquestionId = radio.getAttribute('data-subquestion');
        parentFieldset.querySelectorAll('.quiz__subquestions').forEach(sub => {
          const subquestionIds = sub.getAttribute('data-subquestion-id').split(' ');
          if (subquestionIds.includes(subquestionId)) {
            sub.style.display = 'flex';
            sub.querySelectorAll('input, textarea').forEach(field => {
              field.disabled = false;
            });
            const fileInput = sub.querySelector('input[type="file"]');
            if (fileInput) {
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
      if (value) {
        const [year, month, day] = value.split('-');
        if (year.length > 4) {
          this.value = year.slice(0, 4) + (month ? '-' + month : '') + (day ? '-' + day : '');
        }
      }
    });

    dateInput.addEventListener('blur', function () {
      const value = this.value;
      if (value) {
        const [year] = value.split('-');
        if (year.length !== 4 || isNaN(year) || year < 1900 || year > 9999) {
          alert('Введите корректный год (4 цифры, 1900–9999).');
          this.value = '';
        }
      }
    });
  });

  // Инициализация загрузки файлов
  function initFileUpload(fileInput, sub) {
    const previewDiv = sub.querySelector('.file-upload-preview');
    // Проверяем, инициализирован ли уже обработчик, чтобы избежать повторного добавления
    if (fileInput.dataset.listenerAdded) return;
    fileInput.dataset.listenerAdded = 'true';

    fileInput.addEventListener('change', (e) => {
      const files = Array.from(e.target.files);
      // Очищаем существующие плашки перед добавлением новых
      previewDiv.innerHTML = '';

      if (files.length > 20) {
        alert('Максимум 20 файлов.');
        fileInput.value = '';
        return;
      }

      files.forEach(file => {
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

    fileItem.querySelector('.remove-file').addEventListener('click', () => {
      fileItem.remove();
      const dataTransfer = new DataTransfer();
      Array.from(fileInput.files).forEach(f => {
        if (f.name !== file.name) {
          dataTransfer.items.add(f);
        }
      });
      fileInput.files = dataTransfer.files;
    });
  }

  // Триггер начального состояния
  document.querySelectorAll('input[type="radio"][data-subquestion]:checked').forEach(radio => {
    radio.dispatchEvent(new Event('change'));
  });

  // Функция для сбора данных из активных полей
  function collectFormData() {
    const formData = new FormData();
    const activeFields = document.querySelectorAll('.quiz__list-el-body input:not([disabled]), .quiz__list-el-body textarea:not([disabled]), .quiz__list-el-body select:not([disabled])');

    activeFields.forEach(field => {
      if (field.type === 'file') {
        Array.from(field.files).forEach(file => {
          formData.append(field.name, file);
        });
      } else if (field.type === 'radio') {
        if (field.checked) {
          formData.append(field.name, field.value);
        }
      } else {
        formData.append(field.name, field.value);
      }
    });

    console.log('Собраны данные формы');
    return formData;
  }

  // Функция для валидации обязательных полей
  function validateForm() {
    let isValid = true;

    // Удаляем все старые сообщения об ошибках
    document.querySelectorAll('.error-message').forEach(error => error.remove());

    // Проверяем радио-кнопки
    document.querySelectorAll('.quiz__fieldset').forEach(fieldset => {
      const radios = fieldset.querySelectorAll('input[type="radio"]:not([disabled])');
      if (radios.length > 0) {
        const checked = Array.from(radios).some(radio => radio.checked);
        if (!checked) {
          isValid = false;
          const questionEl = fieldset.closest('.quiz__list-el');
          const errorMessage = document.createElement('p');
          errorMessage.className = 'error-message';
          errorMessage.style.color = 'red';
          errorMessage.textContent = 'Пожалуйста, выберите вариант.';
          questionEl.appendChild(errorMessage);
          radios.forEach(radio => {
            radio.addEventListener('change', (e) => {
              questionEl.removeChild(errorMessage);
            })
          })
        }
      }
    });

    // Проверяем текстовые поля и даты
    document.querySelectorAll('.quiz__list-el-body textarea:not([disabled]), .quiz__list-el-body input[type="text"]:not([disabled]), .quiz__list-el-body input[type="date"]:not([disabled])').forEach(field => {
      if (!field.value.trim()) {
        isValid = false;
        const questionEl = field.closest('.quiz__list-el');
        const errorMessage = document.createElement('p');
        errorMessage.className = 'error-message';
        errorMessage.style.color = 'red';
        errorMessage.textContent = 'Пожалуйста, заполните это поле.';
        questionEl.appendChild(errorMessage);
        field.addEventListener('input', ()=> {
          questionEl.removeChild(errorMessage);
        })
      }
    });

    // Проверяем поля загрузки файлов
    document.querySelectorAll('.quiz__list-el-body input[type="file"]:not([disabled])').forEach(fileInput => {
      if (fileInput.files.length === 0) {
        isValid = false;
        const questionEl = fileInput.closest('.quiz__list-el');
        const errorMessage = document.createElement('p');
        errorMessage.className = 'error-message';
        errorMessage.style.color = 'red';
        errorMessage.textContent = 'Пожалуйста, загрузите файл.';
        questionEl.appendChild(errorMessage);
      }
    });

    return isValid;
  }
  // Обработка отправки формы по клику на кнопку
  document.querySelector('.quiz__list-submit-button').addEventListener('click', (e) => {
    e.preventDefault(); // Предотвращаем стандартное поведение кнопки
    console.log('Нажата кнопка отправки');

    if (validateForm()) {
      const formData = collectFormData();
      console.log('Валидация пройдена');
      formData.forEach((value, key) => {
        console.log(`${key}: ${value}`);
      });
      // fetch('/lol', {
      //   method: 'POST',
      //   body: formData,
      // })
      //   .then(response => {
      //     if (!response.ok) throw new Error('Ошибка сервера');
      //     return response.json();
      //   })
      //   .then(data => {
      //     console.log(data);
      //   })
      //   .catch(error => {
      //     console.error('Ошибка:', error);
      //
      //   });
    } else {
      console.log('Валидация не пройдена');
    }
  });
});
