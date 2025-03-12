import { RouteDetailsData, sequelize } from '../model.js';

const fetchResultDB = async (routeDetailsData) => {
    try {
        await RouteDetailsData.create(routeDetailsData);
    } catch (error) {
        console.error('Veri tabanına veri eklenirken hata oluştu:', error.message);
    }
};

export default fetchResultDB;