import axios from 'axios';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { Notify } from 'notiflix/build/notiflix-notify-aio';

const apiKey = '40336421-a348c8518e766dd2004df0c10';
const form = document.querySelector('.search-form');
const gallery = document.querySelector('.gallery');
const buttonLoad = document.querySelector('.load-more');
const input = form.querySelector('input[name="searchQuery"]');
let pages = 1;
const per_page = 40;

function errorMesage() {
  Notify.failure(
    'Sorry, there are no images matching your search query. Please try again.',
    {
      timeout: 3000,
      width: '400px',
      fontSize: '24px',
    }
  );
}
function infoMessage() {
  Notify.info("We're sorry, but you've reached the end of search results.", {
    timeout: 3000,
    width: '400px',
    fontSize: '24px',
  });
}
function successMessage(response) {
  Notify.success(`Hooray! We found ${response.data.totalHits} images.`, {
    timeout: 3000,
    width: '400px',
    fontSize: '24px',
  });
}

function showButton() {
  buttonLoad.style.display = 'block';
}
function hideButton() {
  buttonLoad.style.display = 'none';
}

form.addEventListener('submit', fetchPosts);
async function fetchPosts(event) {
  event.preventDefault();
  hideButton();
  gallery.innerHTML = '';
  pages = 1;
  try {
    const response = await axios.get(
      `https://pixabay.com/api/?key=${apiKey}&q=${input.value}&image_type=photo&orientation=horizontal&safesearch=true&per_page=${per_page}&page=${pages}`
    );
    if (!response.data.totalHits || !input.value) {
      errorMesage();
      return;
    }
    successMessage(response);
    renderImage(response);
    showButton();
    updateStatusLoadButton(response);
  } catch (error) {
    console.error(error);
    errorMesage();
  }
}

buttonLoad.addEventListener('click', async () => {
  try {
    pages += 1;
    const click = await loadMore();

    renderImage(click);
    showButton();
    updateStatusLoadButton(click);
    scrollPage();
  } catch (error) {
    console.log(error);
    infoMessage();
  }
});
async function loadMore() {
  hideButton();
  const response = await axios.get(
    `https://pixabay.com/api/?key=${apiKey}&q=${input.value}&image_type=photo&orientation=horizontal&safesearch=true&per_page=${per_page}&page=${pages}`
  );
  return response;
}

function updateStatusLoadButton(params) {
  const pagesTotal = Math.ceil(params.data.totalHits / per_page);
  // console.log(pagesTotal);
  if (pages >= pagesTotal || params.data.totalHits <= per_page) {
    infoMessage();
    hideButton();
    // return;
  }
}

function renderImage(dataGet) {
  const arrayData = dataGet.data.hits;
  const markup = arrayData
    .map(
      item => `<div class="photo-card" height="300">
      <a class="gallery__link" href="${item.largeImageURL}">
      <img src="${item.webformatURL}" alt="${item.tags}" loading="lazy" class="gallery__image" /></a>
      <div class="info">
      <p class="info-item">
        <b>Likes</b> ${item.likes}
      </p>
      <p class="info-item">
        <b>Views </b>${item.views}
      </p>
      <p class="info-item">
        <b>Comments </b>${item.comments}
      </p>
      <p class="info-item">
        <b>Downloads </b>${item.downloads}
      </p>
      </div> 
      </div>`
    )
    .join('');

  gallery.insertAdjacentHTML('beforeend', markup);
  // startSimpleLightbox();
  let lightbox = new SimpleLightbox('.gallery__link', {
    captionsData: 'alt',
    captionDelay: 250,
  });
  lightbox.refresh();
}
// function startSimpleLightbox() {}

function scrollPage() {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();
  console.log({ height: cardHeight });
  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}

const scrollUpBtn = document.getElementById('scrollUp');
const scrollDownBtn = document.getElementById('scrollDown');

scrollUpBtn.addEventListener('click', () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
});

scrollDownBtn.addEventListener('click', () => {
  window.scrollTo({
    top: document.body.scrollHeight,
    behavior: 'smooth',
  });
});
