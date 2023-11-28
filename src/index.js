'use-strict';

import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';

const searchForm = document.getElementById('search-form');
const gallery = document.querySelector('.gallery');
const loadMoreButton = document.querySelector('.load-more');
const lightbox = new SimpleLightbox('.gallery a', {
  disableInlineStyles: true,
});

let page = 1;

console.log('Index.js is loaded!');
console.log('Search form:', searchForm);
console.log('Gallery:', gallery);
console.log('Load more button:', loadMoreButton);
console.log('Lightbox:', lightbox);

searchForm.addEventListener('submit', async e => {
  e.preventDefault();
  const searchQuery = e.target.elements.searchQuery.value.trim();

  if (searchQuery === '') {
    Notiflix.Notify.warning('Please enter a search query.');
    return;
  }

  clearGallery();
  page = 1;

  try {
    const { data } = await axios.get(
      `https://pixabay.com/api/?key=40939556-45ae640df6958a2bad92a04f4&q=${searchQuery}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=40`
    );

    if (data.hits.length === 0) {
      Notiflix.Notify.info(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    } else {
      Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`);
      renderImages(data.hits);
      showLoadMoreButton();
    }
  } catch (error) {
    console.error('Error fetching images:', error);
    Notiflix.Notify.failure('Oops! Something went wrong. Please try again.');
  }
});

loadMoreButton.addEventListener('click', async () => {
  page++;

  try {
    const { data } = await axios.get(
      `https://pixabay.com/api/?key=40939556-45ae640df6958a2bad92a04f4&q=${searchForm.elements.searchQuery.value.trim()}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=40`
    );

    renderImages(data.hits);
    lightbox.refresh();

    if (data.hits.length === 0 || data.hits.length < 40) {
      hideLoadMoreButton();
      Notiflix.Notify.info(
        "We're sorry, but you've reached the end of search results."
      );
    }
  } catch (error) {
    console.error('Error fetching more images:', error);
    Notiflix.Notify.failure('Oops! Something went wrong. Please try again.');
  }
});

function renderImages(images) {
  const fragment = document.createDocumentFragment();

  images.forEach(image => {
    const card = createImageCard(image);
    fragment.appendChild(card);
  });

  gallery.appendChild(fragment);
}

function createImageCard(image) {
  const card = document.createElement('div');
  card.classList.add('photo-card');

  const link = document.createElement('a');
  link.href = image.largeImageURL;
  link.setAttribute('data-lightbox', 'gallery');

  const img = document.createElement('img');
  img.src = image.webformatURL;
  img.alt = image.tags;
  img.loading = 'lazy';

  const info = document.createElement('div');
  info.classList.add('info');

  ['Likes', 'Views', 'Comments', 'Downloads'].forEach(item => {
    const p = document.createElement('p');
    p.classList.add('info-item');
    p.innerHTML = `<b>${item}</b>: ${image[item.toLowerCase()] || 0}`;
    info.appendChild(p);
  });

  link.appendChild(img);
  card.appendChild(link);
  card.appendChild(info);

  return card;
}

function clearGallery() {
  gallery.innerHTML = '';
  hideLoadMoreButton();
}

function showLoadMoreButton() {
  loadMoreButton.style.display = 'block';
}

function hideLoadMoreButton() {
  loadMoreButton.style.display = 'none';
}
