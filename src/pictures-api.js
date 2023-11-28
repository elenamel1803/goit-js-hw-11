import axios from 'axios';

export class RequestApi {
  constructor() {
    this.query = '';
    this.page = 1;
    this.per_page = 40;
  }

  async fetchPictures() {
    const BASE_URL = 'https://pixabay.com/api/';
    const API_KEY = '40908072-518de7ac546d7df352eebadfa';
    const params = new URLSearchParams({
      key: API_KEY,
      q: this.query,
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: true,
      per_page: this.per_page,
      page: this.page,
    });

    const { data } = await axios.get(`${BASE_URL}?${params}`);
    console.log(data);
    return data;
  }
}
