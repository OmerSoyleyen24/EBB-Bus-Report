import express from 'express';
import cors from 'cors';
import { Data, sequelize } from '../models/model.js';
import fetchDataDB from '../models/db/fetchDataDB.js';

const app = express();

app.use(cors());

export const getBusRoutes = async (req, res) => {
  try {
    await fetchDataDB();
    const routes = await Data.findAll({
      attributes: ['routeId', 'busNumber', 'description']
    });
    res.json(routes);
  } catch (error) {
    console.error('Hata:', error.message);
    res.status(500).json({ error: 'Veriler alınırken bir hata oluştu.' });
  }
};

export const truncateTable = async (req, res) => {
  const { tableName } = req.params;
  const allowedTables = ['routedata', 'routedetailsdata'];
  if (!allowedTables.includes(tableName)) {
    return res.status(400).json({ error: 'Geçersiz tablo adı.' });
  }

  try {
    const [result] = await sequelize.query(`SELECT COUNT(*) AS count FROM ${tableName}`);
    const rowCount = result[0].count;

    if (rowCount > 0) {
      await sequelize.query(`TRUNCATE TABLE ${tableName}`);
      res.status(200).json({ message: `Tablo ${tableName} başarıyla temizlendi.` });
    } else {
      res.status(200).json({ message: `Tablo ${tableName} zaten boş.` });
    }
  } catch (error) {
    console.error('Hata:', error.message);
    res.status(500).json({ error: 'Tablo temizlenirken bir hata oluştu.' });
  }
};