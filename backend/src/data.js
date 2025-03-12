import express from 'express';
import cors from 'cors';
import { Op, Sequelize } from 'sequelize';
import { getBusRoutes, truncateTable } from './controller/routesController.js';
import { RouteData } from "./models/model.js"
import fetchDataDB from './models/db/fetchDataDB.js';
import fetchMostResultDB from './models/db/fetchMostResultDB.js';

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const convertTimeToMinutes = (time) => {
  const [hours, minutes] = time.split(':').map(Number);
  return (hours * 60) + minutes;
};

app.get("/encokguzergahhattidisiotobusler", async (req, res) => {
  const startMinute = convertTimeToMinutes(req.query.startHours);
  const finishMinute = convertTimeToMinutes(req.query.finishHours);
  const { startDate, finishDate, selectedRoute } = req.query;

  if (!startDate || !finishDate) {
    return res.status(400).json({ error: 'Başlangıç ve bitiş tarihleri sağlanmalıdır.' });
  }

  try {
    await fetchDataDB();
    await fetchMostResultDB(startMinute, finishMinute, startDate, finishDate);

    const subQuery = await RouteData.findAll({
      attributes: [
        [Sequelize.literal('CAST(GuzergahHattiDisi AS UNSIGNED)'), 'GuzergahHattiDisi']
      ],
      order: [
        [Sequelize.literal('CAST(GuzergahHattiDisi AS UNSIGNED)'), 'DESC']
      ],
      limit: 10
    });

    const rows = await RouteData.findAll({
      where: {
        GuzergahHattiDisi: {
          [Op.in]: Sequelize.literal(`(
            SELECT GuzergahHattiDisi 
              FROM (
                SELECT GuzergahHattiDisi 
                FROM routeData 
                ORDER BY CAST(GuzergahHattiDisi AS UNSIGNED) DESC 
                LIMIT 10
              ) AS limited_routeData
          )`)
        }
      }
    });
    res.json(rows);
  } 
  catch (error) {
    console.error('İşlem sırasında bir hata oluştu:', error.message);
    console.error('Hata Detayları:', error);
    res.status(500).json({ error: 'İşlem sırasında bir hata oluştu.' });
  }
});

app.get("/busRoutes", getBusRoutes);

app.post("/truncate/:tableName", truncateTable);

app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor.`);
});