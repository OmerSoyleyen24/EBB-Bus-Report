import { Sequelize, DataTypes } from 'sequelize';

const sequelize = new Sequelize('ebbdata', 'root', 'BnYnMySQLHspActm26a', {
  host: 'localhost',
  dialect: 'mysql',
  logging: false
});

const Data = sequelize.define('Data', {
  busNumber: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true
  },
  routeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true
  }
}, {
  tableName: 'data',
  timestamps: false
});

const RouteData = sequelize.define('RouteData', {
  Arac: DataTypes.STRING,
  Tarih: DataTypes.STRING,
  Blok: DataTypes.STRING,
  Program: DataTypes.STRING,
  Baslangic: DataTypes.STRING,
  Son: DataTypes.STRING,
  EnAcele: DataTypes.STRING,
  MaksGecikme: DataTypes.STRING,
  Duraklar: DataTypes.STRING,
  GuzergahHattiDisi: DataTypes.STRING,
  Kilometre: DataTypes.STRING
}, {
  tableName: 'routeData',
  timestamps: false
});

const RouteDetailsData = sequelize.define('RouteDetailsData', {
  busNumber: DataTypes.STRING,
  numberPlate: DataTypes.STRING,
  busStopNumber: DataTypes.STRING,
  time: DataTypes.STRING
}, {
  tableName: 'routeDetailsData',
  timestamps: false
});

export { sequelize, Data, RouteData, RouteDetailsData };