/**
 * Книжный магазин – логика приложения
 * Данные хранятся в массиве объектов books и дублируются в localStorage
 */

// ---------- Инициализация массива книг (пример для первого запуска) ----------
let books = [];

// Загружаем сохранённые данные из localStorage, если они есть
function loadFromLocalStorage() {
    const storedBooks = localStorage.getItem('bookstore_books');
    if (storedBooks) {
        books = JSON.parse(storedBooks);
    } else {
        // Начальные тестовые книги для демонстрации
        books = [
            { id: 1, title: "Мастер и Маргарита", author: "Михаил Булгаков", year: 1967, price: 650 },
            { id: 2, title: "Преступление и наказание", author: "Фёдор Достоевский", year: 1866, price: 540 },
            { id: 3, title: "1984", author: "Джордж Оруэлл", year: 1949, price: 480 },
            { id: 4, title: "Маленький принц", author: "Антуан де Сент-Экзюпери", year: 1943, price: 390 }
        ];
        saveToLocalStorage();
    }
}

// Сохранить массив books в localStorage
function saveToLocalStorage() {
    localStorage.setItem('bookstore_books', JSON.stringify(books));
}

// ---------- DOM элементы ----------
const booksContainer = document.getElementById('booksContainer');
const searchInput = document.getElementById('searchInput');
const addBookForm = document.getElementById('addBookForm');
const bookCountSpan = document.getElementById('bookCount');

// Текущий поисковый запрос (пустая строка = показать всё)
let searchQuery = '';

// ---------- Вспомогательная функция рендеринга карточек (фильтрация + отрисовка) ----------
function renderBooks() {
    // 1. Фильтруем книги по поисковому запросу (без учёта регистра)
    let filteredBooks = books;
    if (searchQuery.trim() !== '') {
        const lowerQuery = searchQuery.toLowerCase();
        filteredBooks = books.filter(book => 
            book.title.toLowerCase().includes(lowerQuery) || 
            book.author.toLowerCase().includes(lowerQuery)
        );
    }
    
    // 2. Обновляем счётчик в футере (отображается общее количество книг в оригинальном массиве)
    bookCountSpan.textContent = books.length;
    
    // 3. Если отфильтрованных книг нет – показываем сообщение
    if (filteredBooks.length === 0) {
        booksContainer.innerHTML = `<div class="no-results">📭 По вашему запросу ничего не найдено. Добавьте новую книгу!</div>`;
        return;
    }
    
    // 4. Отрисовываем карточки для отфильтрованного списка
    booksContainer.innerHTML = filteredBooks.map(book => `
        <div class="book-card" data-book-id="${book.id}">
            <div class="book-cover-placeholder">
                📖
            </div>
            <div class="book-info">
                <div class="book-title">${escapeHtml(book.title)}</div>
                <div class="book-author">✍️ ${escapeHtml(book.author)}</div>
                <div class="book-details">
                    <span class="book-year">📅 ${book.year}</span>
                    <span class="book-price">${book.price}</span>
                </div>
            </div>
            <button class="btn-delete" data-id="${book.id}">🗑 Удалить</button>
        </div>
    `).join('');
    
    // 5. Добавляем обработчики удаления для каждой кнопки
    document.querySelectorAll('.btn-delete').forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = Number(button.getAttribute('data-id'));
            deleteBookById(id);
        });
    });
}

// Простейшая защита от XSS (экранирование HTML)
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    }).replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, function(c) {
        return c;
    });
}

// ---------- Удаление книги по id ----------
function deleteBookById(id) {
    // Фильтруем массив, оставляя все книги, кроме той, чей id совпадает
    books = books.filter(book => book.id !== id);
    // Сохраняем изменения
    saveToLocalStorage();
    // Перерисовываем интерфейс
    renderBooks();
}

// ---------- Добавление новой книги (из формы) ----------
function addNewBook(title, author, year, price) {
    // Валидация
    if (!title || !author || isNaN(year) || isNaN(price) || year <= 0 || price <= 0) {
        alert('Пожалуйста, заполните все поля корректными значениями (год и цена > 0)');
        return false;
    }
    
    // Создаём объект книги с уникальным id (времязависимый)
    const newBook = {
        id: Date.now(),  // уникальный идентификатор
        title: title.trim(),
        author: author.trim(),
        year: Number(year),
        price: Number(price)
    };
    
    books.push(newBook);
    saveToLocalStorage();
    renderBooks();
    return true;
}

// ---------- Обработчик отправки формы ----------
addBookForm.addEventListener('submit', (event) => {
    event.preventDefault(); // предотвращаем перезагрузку страницы
    
    const titleInput = document.getElementById('title');
    const authorInput = document.getElementById('author');
    const yearInput = document.getElementById('year');
    const priceInput = document.getElementById('price');
    
    const success = addNewBook(
        titleInput.value,
        authorInput.value,
        yearInput.value,
        priceInput.value
    );
    
    if (success) {
        // Очищаем форму
        addBookForm.reset();
        // Можно также показать уведомление (не alert)
        // Для курсовой достаточно очистки
    }
});

// ---------- Обработчик поиска (ввод текста) ----------
searchInput.addEventListener('input', (event) => {
    searchQuery = event.target.value;
    renderBooks(); // перерисовываем с новым фильтром
});

// ---------- Инициализация приложения ----------
function init() {
    loadFromLocalStorage();   // загружаем книги (либо из localStorage, либо начальные)
    renderBooks();            // отображаем их
    // Если нужно, можно добавить сброс поиска или дополнительные действия
}

// Запуск приложения после полной загрузки DOM
document.addEventListener('DOMContentLoaded', init);