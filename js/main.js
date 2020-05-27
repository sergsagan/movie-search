const IMG_PATH = 'https://image.tmdb.org/t/p/w185_and_h278_bestv2';
const API_KEY = '92fc89485abf5a896dd72c74c603123d';

const leftMenu = document.querySelector('.left-menu'),
    hamburger = document.querySelector('.hamburger'),
    modal = document.querySelector('.modal'),
    tvShowsList = document.querySelector('.tv-shows__list');

class DBService {
    getData = async (url) => {
        const res = await fetch(url);
        if (res.ok) {
            return res.json();
        } else {
            throw new Error(`Не удалось получить данные по адресу ${url}`)
        }
    }
    getTestData = () => {
        return this.getData('test.json')
    }
}
const renderCard = (response) => {
    tvShowsList.textContent = '';

    response.results.forEach(item => {
        const {
            backdrop_path: backdrop,
            name: title,
            poster_path: poster,
            vote_average: vote
        } = item;

        const posterIMG = poster ? IMG_PATH + poster : 'img/no-poster.jpg';
        const backdropIMG = backdrop ? IMG_PATH + backdrop : 'img/no-poster.jpg';
        const voteElement = vote ? vote : '';

        const card = document.createElement('li');
        card.className = 'tv-shows__item';
        card.innerHTML = `
            <a href="#" class="tv-card">
                <span class="tv-card__vote">${voteElement}</span>
                <img class="tv-card__img"
                     src="${posterIMG}"
                     data-backdrop="${backdropIMG}"
                     alt="${title}">
                <h4 class="tv-card__head">${title}</h4>
            </a>
        `;
        tvShowsList.append(card);
    })
}
new DBService().getTestData().then(renderCard);

//открытие закрытие меню
hamburger.addEventListener('click', () => {
    leftMenu.classList.toggle('openMenu');
    hamburger.classList.toggle('open');
});

document.addEventListener('click', (event) => {
    const target = event.target;

    if (!target.closest('.left-menu')) {
        leftMenu.classList.remove('openMenu');
        hamburger.classList.remove('open');
    }
});

leftMenu.addEventListener('click', (event) => {
    const target = event.target;
    const dropdown = target.closest('.dropdown');

    if (dropdown) {
        dropdown.classList.toggle('active');
        leftMenu.classList.add('openMenu');
        hamburger.classList.add('open');
    }
});

//открытие модального окна
tvShowsList.addEventListener('click', (event) => {
    event.preventDefault();
    const target = event.target;
    const card = target.closest('.tv-card');

    if (card) {
        document.body.style.overflow = 'hidden';
        modal.classList.remove('hide');
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