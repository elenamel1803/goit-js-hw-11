import { RequestApi } from './pictures-api';
import { createPictureMarkup } from './create-markup';
import Notiflix from 'notiflix';

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

let searchQueryKey = '';

showLoadMoreBtn(false);

refs.formEl.addEventListener('submit', onSubmitSearchForm);
refs.loadMoreBtn.addEventListener('click', onClickLoadMore);

function onSubmitSearchForm(evt) {
  evt.preventDefault();
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
    })
    .catch(error => {
      console.log(error);
      errorMessage();
    });
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
