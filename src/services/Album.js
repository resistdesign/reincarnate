export default class AlbumService {
  httpService;
  config;

  constructor (props) {
    Object.assign(this, props);
  }

  async get (albumId) {
    const { get: getUrl } = this.config;
    const id = typeof albumId === 'number' ? albumId : undefined;
    const { data } = (await this.httpService.get(getUrl, { params: { id } }));

    return data;
  }
}
