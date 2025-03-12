import { Data, sequelize } from '../model.js';
import axios from 'axios';

const fetchDataDB = async () => {
    try {
      const routesResponse = await axios.get('https://nimbus.wialon.com/api/depot/8941/routes', {
        headers: {
          'Authorization': 'Token f4c4b3b8966941a9b5aff26e6b24f21f',
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
  
      if (!routesResponse.data?.routes?.length) {
        throw new Error('API yanıtı geçerli bir dizi içermiyor.');
      }
  
      for (const item of routesResponse.data.routes) {
        const existingRoute = await Data.findOne({ where: { routeId: item.id } });
        if (!existingRoute) {
          await Data.create({
            busNumber: item.n,
            description: item.d,
            routeId: item.id
          });
        }
      }
    } catch (error) {
      console.error('Hata:', error.message);
    }
  };

  export default fetchDataDB;