'use strict'

const IMG_PATH = 'https://image.tmdb.org/t/p/w185_and_h278_bestv2';
const SERVER ='https://api.themoviedb.org/3';
const API_KEY = '92fc89485abf5a896dd72c74c603123d';

const leftMenu = document.querySelector('.left-menu'),
    hamburger = document.querySelector('.hamburger'),
    modal = document.querySelector('.modal'),
    tvShowsList = document.querySelector('.tv-shows__list'),
    tvShows = document.querySelector('.tv-shows'),
    tvCardImg = document.querySelector('.tv-card__img'),
    modalTitle = document.querySelector('.modal__title'),
    genresList = document.querySelector('.genres-list'),
    rating = document.querySelector('.rating'),
    description = document.querySelector('.description'),
    modalLink = document.querySelector('.modal__link'),
    searchForm = document.querySelector('.search__form'),
    searchFormInput = document.querySelector('.search__form-input'),
    preLoader = document.querySelector('.preloader'),
    dropdown = document.querySelectorAll('.dropdown'),
    tvShowsHead = document.querySelector('.tv-shows__head'),
    posterWrapper = document.querySelector('.poster__wrapper'),
    pagination = document.querySelector('.pagination');

//лоадер
const loading = document.createElement('div');
loading.className = 'loading';

//класс
class DBService {
    //API запрос
    getData = async (url) => {
        const response = await fetch(url);
        if (response.ok) {
            return response.json();
        } else {
            throw new Error(`Не удалось получить данные по адресу ${url}`)
        }
    }
    //функция запроса поиска
    getSearchResult = (query) => {
        this.temp = `${SERVER}/search/tv?api_key=${API_KEY}&language=ru-RU&query=${query}`;
        return this.getData(this.temp);
    }
    getNextPage = (page) => {
        return this.getData(this.temp + '&page=' + page);
    }
    //функция запроса отображения фильмов по id
    getTvShow = (id) => {
        return this.getData(`${SERVER}/tv/${id}?api_key=${API_KEY}&language=ru-RU`)
    }
    getTopRated = () => {
        return this.getData(`${SERVER}/tv/top_rated?api_key=${API_KEY}&language=ru-RU`)
    }
    getPopular = () => {
        return this.getData(`${SERVER}/tv/popular?api_key=${API_KEY}&language=ru-RU`)
    }
    getToday = () => {
        return this.getData(`${SERVER}/tv/airing_today?api_key=${API_KEY}&language=ru-RU`)
    }
    getWeek = () => {
        return this.getData(`${SERVER}/tv/on_the_air?api_key=${API_KEY}&language=ru-RU`)
    }
}

const dbService = new DBService();

//формируем карточку
const renderCard = (response, target) => {
    tvShowsList.textContent = '';

    if (!response.total_results) {
        loading.remove();
        tvShowsHead.textContent = 'К сожалению по вашему запросу ничего не найдено...';
        tvShowsHead.style.cssText = 'color: red; text-align: center;'
        return;
    }

    tvShowsHead.textContent = target ? target.textContent : 'Результат поиска:';
    tvShowsHead.style.cssText = 'color: #ffc107;'

    response.results.forEach(item => {
        const {
            backdrop_path: backdrop,
            name: title,
            poster_path: poster,
            vote_average: vote,
            id
        } = item;

        const posterIMG = poster ? IMG_PATH + poster : 'img/no-poster.jpg';
        const backdropIMG = backdrop ? IMG_PATH + backdrop : '';
        const voteElement = vote ? `<span class="tv-card__vote">${vote}</span>` : '';

        const card = document.createElement('li');
        card.className = 'tv-shows__item';
        card.innerHTML = `
            <a href="#" id="${id}" class="tv-card">
                ${voteElement}
                <img class="tv-card__img"
                     src="${posterIMG}"
                     data-backdrop="${backdropIMG}"
                     alt="${title}">
                <h4 class="tv-card__head">${title}</h4>
            </a>
        `;
        loading.remove();
        tvShowsList.append(card);
    });

    pagination.textContent = '';
    if (!target && response.total_pages > 1) {
        for (let i = 1; i <= response.total_pages; i++) {
            pagination.innerHTML += `<li><a href="#" class="pagination__page">${i}</a></li>`
        }
    }
};

//поиск
searchForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const value = searchFormInput.value.trim();
    searchFormInput.value = '';

    if (value) {
        dbService.getSearchResult(value).then(renderCard);
    }
});

//открытие закрытие меню
const closeDropdown = () => {
    dropdown.forEach(item => {
        item.classList.remove('active');
    })
}
hamburger.addEventListener('click', () => {
    leftMenu.classList.toggle('openMenu');
    hamburger.classList.toggle('open');
    closeDropdown();
});
document.addEventListener('click', (event) => {
    const target = event.target;

    if (!target.closest('.left-menu')) {
        leftMenu.classList.remove('openMenu');
        hamburger.classList.remove('open');
        closeDropdown();
    }
});
leftMenu.addEventListener('click', (event) => {
    event.preventDefault();
    const target = event.target;
    const dropdown = target.closest('.dropdown');

    if (dropdown) {
        dropdown.classList.toggle('active');
        leftMenu.classList.add('openMenu');
        hamburger.classList.add('open');
    }
    if (target.closest('#top-rated')) {
        tvShows.append(loading);
        dbService.getTopRated().then((response) => renderCard(response, target));
    }
    if (target.closest('#popular')) {
        tvShows.append(loading);
        dbService.getPopular().then((response) => renderCard(response, target));
    }
    if (target.closest('#today')) {
        tvShows.append(loading);
        dbService.getToday().then((response) => renderCard(response, target));
    }
    if (target.closest('#week')) {
        tvShows.append(loading);
        dbService.getWeek().then((response) => renderCard(response, target));
    }
    if (target.closest('#search')) {
        tvShowsList.textContent = '';
        tvShowsHead.textContent = ''
    }
});

//открытие модального окна
tvShowsList.addEventListener('click', (event) => {
    event.preventDefault();
    const target = event.target;
    const card = target.closest('.tv-card');

    if (card) {
        preLoader.style.display = 'block';

        dbService.getTvShow(card.id)
            .then(({ poster_path: posterPath, name: title, genres, vote_average, overview, homepage }) => {
                if (posterPath) {
                    tvCardImg.src = IMG_PATH + posterPath;
                    tvCardImg.alt = title;
                    posterWrapper.style.display = '';
                } else {
                    posterWrapper.style.display = 'none';
                }
                modalTitle.textContent = title;
                genresList.textContent = '';
                for (const item of genres) {
                    genresList.innerHTML += `<li>${item.name}</li>`;
                }
                rating.textContent = vote_average;
                description.textContent = overview;
                modalLink.href = homepage;
            })
            .then(() => {
                document.body.style.overflow = 'hidden';
                modal.classList.remove('hide');
            })
            .finally(() => {
                preLoader.style.display = '';
            })
    }
});

//закрытие модального окна
modal.addEventListener('click', (event) => {
    const target = event.target;

    if (target.closest('.cross') || target.classList.contains('modal')) {
        document.body.style.overflow = '';
        modal.classList.add('hide');
    }
});

//смена изображения карточки
const changeImage = event => {
    const cardImage = event.target.closest('.tv-shows__item');

    if (cardImage) {
        const img = cardImage.querySelector('.tv-card__img');

        if (img.dataset.backdrop) {
            [img.src, img.dataset.backdrop] = [img.dataset.backdrop, img.src]
        }
    }
};
tvShowsList.addEventListener('mouseover', changeImage);
tvShowsList.addEventListener('mouseout', changeImage);

pagination.addEventListener('click', (event) => {
    event.preventDefault();
    const target = event.target;
    if (target.classList.contains('pagination__page')) {
        tvShows.append(loading);
        dbService.getNextPage(target.textContent).then((renderCard));
    }
});