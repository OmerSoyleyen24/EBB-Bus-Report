import express from 'express';
import cors from 'cors';
import axios from 'axios';
import { Data } from "./models/model.js"
import { getBusRoutes, truncateTable } from './controller/routesController.js';
import fetchDataDB from './models/db/fetchDataDB.js';
import fetchResultDB from './models/db/fetchResultDB.js';

const app = express();
const PORT = 5001;

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const convertTimeToMinutes = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    return (hours * 60) + minutes;
};

app.get("/guzergahhattidisiotobusler", async (req, res) => {
    const startMinute = convertTimeToMinutes(req.query.startHours);
    const finishMinute = convertTimeToMinutes(req.query.finishHours);
    const { startDate, finishDate, selectedRoute } = req.query;

    if (!startDate || !finishDate) {
        return res.status(400).json({ error: 'Başlangıç ve bitiş tarihleri sağlanmalıdır.' });
    }

    try {
        await fetchDataDB();
    
        const responseData = [];

        const routes = await Data.findAll({
            where: selectedRoute && selectedRoute !== 'all' ? { routeId: selectedRoute } : {}
        });

        for (const item of routes) {
            try {
                const reportResponse = await axios.get(`https://nimbus.wialon.com/api/depot/8941/report/route/${item.routeId}?flags=1&df=${startDate}&dt=${finishDate}&sort=timetable`, {
                    headers: {
                        'Authorization': 'Token f4c4b3b8966941a9b5aff26e6b24f21f',
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                });

                const rowsLength = reportResponse.data?.report_data?.rows.length || 0;

                for (let i = 0; i < rowsLength; i++) {
                    const data = reportResponse.data.report_data.rows[i].cols[3].t.substring(0, 5);
                    const resultDataMinute = convertTimeToMinutes(data);

                    if (resultDataMinute >= startMinute && resultDataMinute <= finishMinute) {
                        const rows2Length = reportResponse.data.report_data.rows[i].rows.length;
                        for (let j = 0; j < rows2Length; j++) {
                            const row = reportResponse.data.report_data.rows[i].rows[j];
                            const hasNonNullValue = [4, 5, 6, 7, 8].some(k => row[k]?.v != null);

                            if (!hasNonNullValue) {
                                const routeDetailsData = {
                                    busNumber: item.busNumber,
                                    numberPlate: reportResponse.data.report_data.rows[i].cols[0].t,
                                    busStopNumber: row[0].v,
                                    time: data
                                };

                                await fetchResultDB(routeDetailsData);
                                responseData.push(routeDetailsData);
                            }
                        }
                    }
                }

            } catch (error) {
                console.error(`Rapor verisi işlenirken hata oluştu (routeId: ${item.routeId}):`, error.message);
            }
        }
        res.json(responseData);
    } 
    catch (error) {
        console.error('İşlem sırasında bir hata oluştu:', error.message);
        res.status(500).json({ error: 'İşlem sırasında bir hata oluştu.' });
    }
});

app.get("/busRoutes",getBusRoutes);

app.post("/truncate/:tableName",truncateTable);

app.listen(PORT, () => {
    console.log(`Sunucu ${PORT} portunda çalışıyor.`);
});