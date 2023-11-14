import axios from 'axios';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { Notify } from 'notiflix/build/notiflix-notify-aio';

const apiKey = '40336421-a348c8518e766dd2004df0c10';
const refs = {
  form: document.querySelector('.search-form'),
  gallery: document.querySelector('.gallery'),
  buttonLoad: document.querySelector('.load-more'),
  input: refs.form.querySelector('input[name="searchQuery"]'),
};
let pages = 1;
const per_page = 40;

function errorMessage() {
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

function showBtn() {
  buttonLoad.style.display = 'block';
}
function hideBtn() {
  buttonLoad.style.display = 'none';
}

refs.form.addEventListener('submit', fetchPictures);
async function fetchPictures(e) {
  e.preventDefault();
  hideBtn();
  refs.gallery.innerHTML = '';
  pages = 1;
  try {
    const res = await axios.get(
      `https://pixabay.com/api/?key=${apiKey}&q=${refs.input.value}&image_type=photo&orientation=horizontal&safesearch=true&per_page=${per_page}&page=${pages}`
    );
    if (!res.data.totalHits || !refs.input.value) {
      errorMessage();
      return;
    }
    successMessage(res);
    renderImage(res);
    showBtn();
    updateLoadBtnStatus(res);
  } catch (error) {
    console.error(error);
    errorMessage();
  }
}

refs.buttonLoad.addEventListener('click', async () => {
  try {
    pages += 1;
    const click = await loadMore();

    renderImage(click);
    showBtn();
    updateLoadBtnStatus(click);
    scrollPage();
  } catch (error) {
    console.log(error);
    infoMessage();
  }
});
async function loadMore() {
  hideBtn();
  const res = await axios.get(
    `https://pixabay.com/api/?key=${apiKey}&q=${refs.input.value}&image_type=photo&orientation=horizontal&safesearch=true&per_page=${per_page}&page=${pages}`
  );
  return res;
}

function updateLoadBtnStatus(params) {
  const pagesTotal = Math.ceil(params.data.totalHits / per_page);
  if (pages >= pagesTotal || params.data.totalHits <= per_page) {
    infoMessage();
    hideBtn();
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

  refs.gallery.insertAdjacentHTML('beforeend', markup);
  let lightbox = new SimpleLightbox('.gallery__link', {
    captionsData: 'alt',
    captionDelay: 250,
  });
  lightbox.refresh();
}

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
