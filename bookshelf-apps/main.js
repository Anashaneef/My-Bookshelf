const books = [];
const RENDER_EVENT = 'render-book';

document.addEventListener('DOMContentLoaded', function () {
    const submitForm = document.getElementById('inputBook');
    submitForm.addEventListener('submit', function (event) {
        event.preventDefault();
        addBook();
    });

    const searchForm = document.getElementById('searchBook');
    searchForm.addEventListener('submit', function (event) {
        event.preventDefault();
        searchBook();
    });

    if (isStorageExsist()) {
        loadDataFromStorage();
    }
})

function checkFunction() {
    let checkBox = document.getElementById("inputBookIsComplete");
    let text = document.getElementById("bookSubmit");
    if (checkBox.checked == true) {
        text.innerHTML = "Masukkan Buku ke rak <span>selesai dibaca</span>";
    } else {
        text.innerHTML = "Masukkan Buku ke rak <span>belum selesai dibaca</span>";
    }
}

function addBook() {
    let checkBox = document.getElementById("inputBookIsComplete");
    const title = document.getElementById('inputBookTitle').value;
    const author = document.getElementById('inputBookAuthor').value;
    const year = document.getElementById('inputBookYear').value;

    const generatedID = generateID();
    if (checkBox.checked == true) {
        const bookObject = generateBookObject(generatedID, title, author, year, true);
        books.push(bookObject);
    } else {
        const bookObject = generateBookObject(generatedID, title, author, year, false);
        books.push(bookObject);
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function generateID() {
    return +new Date();
}

function generateBookObject(id, title, author, year, isCompleted) {
    return {
        id,
        title,
        author,
        year,
        isCompleted
    };
}

document.addEventListener(RENDER_EVENT, function () {
    const uncompletedBookList = document.getElementById('incompleteBookshelfList');
    uncompletedBookList.innerHTML = '';

    const completedBookList = document.getElementById('completeBookshelfList');
    completedBookList.innerHTML = '';

    for (const bookItem of books) {
        const bookElement = makeBook(bookItem);
        if (!bookItem.isCompleted) {
            uncompletedBookList.append(bookElement);
        } else {
            completedBookList.append(bookElement);
        }
    }
});

function makeBook(bookObject) {
    const textTitle = document.createElement('h3');
    textTitle.innerText = bookObject.title;
    textTitle.classList.add('book_title');

    const textAuthor = document.createElement('p');
    textAuthor.classList.add('author');
    textAuthor.innerText = 'Penulis : ' + bookObject.author;

    const textYear = document.createElement('p');
    textYear.classList.add('year');
    textYear.innerText = 'Tahun : ' + bookObject.year;

    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('action');

    const container = document.createElement('article');
    container.classList.add('book_item');
    container.append(textTitle, textAuthor, textYear, buttonContainer);
    container.setAttribute('id', `todo-${bookObject.id}`);

    if (bookObject.isCompleted) {
        const undoButton = document.createElement('button');
        undoButton.classList.add('green');
        undoButton.innerText = 'Belum selesai di Baca';
        undoButton.addEventListener('click', function () {
            undoBookFromComplete(bookObject.id);
        });

        const trashButton = document.createElement('button');
        trashButton.classList.add('red');
        trashButton.innerText = 'Hapus Buku';
        trashButton.addEventListener('click', function () {
            removeBookFromComplete(bookObject.id);
        });
        buttonContainer.append(undoButton, trashButton);
    } else {
        const doneButton = document.createElement('button');
        doneButton.classList.add('green');
        doneButton.innerText = 'Selesai dibaca';
        doneButton.addEventListener('click', function () {
            addBookToCompleted(bookObject.id);
        });

        const trashButton = document.createElement('button');
        trashButton.classList.add('red');
        trashButton.innerText = 'Hapus Buku';
        trashButton.addEventListener('click', function () {
            removeBookFromComplete(bookObject.id);
        });
        buttonContainer.append(doneButton, trashButton);
    }

    return container;
}

function searchBook() {
    const searchBook = document.getElementById('searchBookTitle').value;
    console.log(searchBook);
    const uncompletedBookList = document.getElementById('incompleteBookshelfList');
    uncompletedBookList.innerHTML = '';

    const completedBookList = document.getElementById('completeBookshelfList');
    completedBookList.innerHTML = '';

    for (const bookItem of books) {
        if (bookItem.title.toLowerCase().includes(searchBook.toLowerCase())) {
            const bookElement = makeBook(bookItem);
            if (!bookItem.isCompleted) {
                uncompletedBookList.append(bookElement);
            } else {
                completedBookList.append(bookElement);
            }
        }
    }
}

function findBook(bookId) {
    for (const book of books) {
        if (book.id === bookId) {
            return book;
        }
    }
    return null;
}

function findBookIndex(bookId) {
    for (const index in books) {
        if (books[index].id === bookId) {
            return index;
        }
    }
    return -1;
}

function addBookToCompleted(bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    bookTarget.isCompleted = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function undoBookFromComplete(bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    bookTarget.isCompleted = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function removeBookFromComplete(bookId) {
    if (confirm('Apakah anda yakin ingin menghapus buku ini?')) {
        const bookIndex = findBookIndex(bookId);

        if (bookIndex == -1) return;

        books.splice(bookIndex, 1);
        document.dispatchEvent(new Event(RENDER_EVENT));
        saveData();
    } else {
        return;
    }
}

const STORAGE_KEY = 'BOOKSHELF_APPS';
const SAVED_EVENT = 'saved-book';

function saveData() {
    if (isStorageExsist()) {
        const parsed = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY, parsed);
        document.dispatchEvent(new Event(SAVED_EVENT));
    }
}

function isStorageExsist() {
    if (typeof (Storage) === undefined) {
        alert('Browser kamu tidak mendukung local storage');
        return false;
    }
    return true;
}

document.addEventListener(SAVED_EVENT, function () {
    console.log(localStorage.getItem(STORAGE_KEY));
});

function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);

    if (data !== null) {
        for (const book of data) {
            books.push(book);
        }
    }
    document.dispatchEvent(new Event(RENDER_EVENT));
}