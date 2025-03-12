import { Data, RouteData, sequelize } from '../model.js';
import axios from 'axios';

const convertTimeToMinutes = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    return (hours * 60) + minutes;
  };

const fetchMostResultDB = async (startMinute, finishMinute, startDate, finishDate) => {
    try {
        const routes = await Data.findAll();
        for (const item of routes) {
            try {
                const reportResponse = await axios.get(`https://nimbus.wialon.com/api/depot/8941/report/route/${item.routeId}?&df=${startDate}&dt=${finishDate}&sort=timetable`, {
                    headers: {
                        'Authorization': 'Token f4c4b3b8966941a9b5aff26e6b24f21f',
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                });

                const data = reportResponse.data?.report_data?.rows[0];
                if (!data || !Array.isArray(data)) {
                    console.warn(`Veri eksik veya geçersiz: ${item.routeId}`);
                    continue;
                }

                const validData = data.map(d => d.t !== undefined ? d.t : null);
                if (!validData.length) {
                    console.warn(`Veri eksik: ${item.routeId}`);
                    continue;
                }

                const validDataMinute = convertTimeToMinutes(validData[3].substring(0, 5));
                if (startMinute <= validDataMinute && finishMinute >= validDataMinute) {
                    const existingRows = await RouteData.findAll({
                        where: {
                            Arac: validData[0],
                            Tarih: validData[1],
                            Blok: validData[2]
                        }
                    });

                    if (!existingRows.length) {
                        await RouteData.create({
                            Arac: validData[0],
                            Tarih: validData[1],
                            Blok: validData[2],
                            Program: validData[3],
                            Baslangic: validData[4],
                            Son: validData[5],
                            EnAcele: validData[8],
                            MaksGecikme: validData[9],
                            Duraklar: validData[10],
                            GuzergahHattiDisi: data[12],
                            Kilometre: validData[13]
                        });
                    } else {
                        console.warn(`Bu kayıt zaten mevcut: ${validData[0]}, ${validData[1]}, ${validData[2]}`);
                    }
                } else {
                    console.warn(`Zaman aralığı dışı veri: ${validData[0]}, ${validData[1]}, ${validData[2]}`);
                }

            } catch (error) {
                console.error(`Rapor verisi işlenirken hata oluştu (routeId: ${item.routeId}):`, error.message);
            }
        }
    } catch (error) {
        console.error('Hata:', error.message);
    }
};

export default fetchMostResultDB;