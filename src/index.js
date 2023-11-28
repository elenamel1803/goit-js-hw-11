import { RequestApi } from './pictures-api';
import { createPictureMarkup } from './create-markup';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const refs = {
  formEl: document.querySelector('.search-form'),
  loadMoreBtn: document.querySelector('.load-more'),
  gallery: document.querySelector('.gallery'),
};

const picturesApi = new RequestApi();

const notiflixParams = {
  position: 'center-center',
  timeout: 3000,
  width: '400px',
  fontSize: '20px',
};

let lightbox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 250,
});

let searchQueryKey = '';
let loading = false;
let endMessageDisplayed = false;

window.addEventListener('scroll', onInfiniteScroll);
refs.formEl.addEventListener('submit', onSubmitSearchForm);
refs.loadMoreBtn.addEventListener('click', onClickLoadMore);

function onSubmitSearchForm(evt) {
  evt.preventDefault();
  showLoadMoreBtn(false);
  refs.gallery.innerHTML = '';
  picturesApi.page = 1;
  picturesApi.query = evt.currentTarget.elements.searchQuery.value;
  searchQueryKey = picturesApi.query.trim().toLowerCase().split(' ').join(' ');
  if (searchQueryKey === '') {
    return infoEmptyMessage();
  }
  picturesApi
    .fetchPictures()
    .then(({ totalHits, hits }) => {
      if (totalHits === 0) {
        return errorMessage();
      } else {
        Notiflix.Notify.success(
          `Hooray! We found ${totalHits} images.`,
          notiflixParams
        );
        refs.gallery.innerHTML = createPictureMarkup(hits);
        lightbox.refresh();
        smoothScroll();
        showLoadMoreBtn();
      }
      if (totalHits < picturesApi.per_page) {
        showLoadMoreBtn(false);
        infoEndMessage();
      }
    })
    .catch(error => {
      console.log(error);
      errorMessage();
    });
}

function onClickLoadMore() {
  picturesApi.page += 1;
  picturesApi
    .fetchPictures()
    .then(({ totalHits, hits }) => {
      if (picturesApi.page * picturesApi.per_page >= totalHits) {
        showLoadMoreBtn(false);
        infoEndMessage();
      }
      refs.gallery.insertAdjacentHTML('beforeend', createPictureMarkup(hits));
      lightbox.refresh();
      smoothScroll();
    })
    .catch(error => {
      console.log(error);
      errorMessage();
    });
}

function onInfiniteScroll() {
  if (shouldLoadMore()) {
    loading = true;
    picturesApi.page += 1;
    picturesApi.fetchPictures().then(({ totalHits, hits }) => {
      if (hits.length === 0) {
        return;
      }
      if (hits.length > 0) {
        refs.gallery.insertAdjacentHTML('beforeend', createPictureMarkup(hits));
        lightbox.refresh();
        smoothScroll();
      }
      loading = false;
      if (
        !endMessageDisplayed &&
        picturesApi.page * picturesApi.per_page >= totalHits
      ) {
        showLoadMoreBtn(false);
        infoEndMessage();
        endMessageDisplayed = true;
      }
    });
  }
}

function showLoadMoreBtn(isShow = true) {
  refs.loadMoreBtn.style.visibility = isShow ? 'visible' : 'hidden';
}

function infoEndMessage() {
  Notiflix.Notify.info(
    "We're sorry, but you've reached the end of search results.",
    notiflixParams
  );
}

function infoEmptyMessage() {
  Notiflix.Notify.info('Enter your request, please!', notiflixParams);
}

function errorMessage() {
  Notiflix.Notify.failure(
    'Sorry, there are no images matching your search query. Please try again.',
    notiflixParams
  );
}

function smoothScroll() {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}

function shouldLoadMore() {
  const { scrollTop, clientHeight, scrollHeight } = document.documentElement;
  return scrollTop + clientHeight >= scrollHeight - 200 && !loading;
}
