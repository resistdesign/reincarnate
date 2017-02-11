import Axios from 'axios';

export default class Demo {
  resource = Axios.create({
    baseURL: 'http://headers.jsontest.com'
  });

  constructor () {
  }

  getHeaders = async () => {
    const { data } = await this.resource.get('');

    return data;
  };
}
