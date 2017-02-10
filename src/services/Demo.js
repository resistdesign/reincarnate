import Axios from 'axios';

export default class Demo {
  resource = Axios.create({
    baseURL: 'https://maps.googleapis.com/maps/api/geocode/json'
  });

  constructor () {
  }

  getLocation = async (address) => {
    const { data } = await this.resource.request({
      method: 'get',
      params: {
        address
      }
    });

    return data;
  };
}
