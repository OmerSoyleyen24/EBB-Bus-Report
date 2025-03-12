import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './App.css';

function App() {
  const [startDate, setStartDate] = useState('');
  const [startHours, setStartHours] = useState('');
  const [finishDate, setFinishDate] = useState('');
  const [finishHours, setFinishHours] = useState('');
  const [option, setOption] = useState('');
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        if(option === "En Çok Güzergah Dışı Otobüsler"){
          await axios.post(`http://localhost:5000/truncate/routedetailsdata`);
          const response = await axios.get('http://localhost:5000/busRoutes');
          setRoutes(response.data);
        }
        
        else if( option === "Güzergah Hattı Dışı Otobüsler"){
          await axios.post(`http://localhost:5001/truncate/routedata`);
          const response = await axios.get('http://localhost:5001/busRoutes');
          setRoutes(response.data);
        } 

      } catch (error) {
        console.error('Otobüs hatları alınırken bir hata oluştu:', error.message);
      }
    };

    fetchRoutes();
  }, [option]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      navigate('/report', {
        state: { reportData: routes, startDate, startHours, finishDate, finishHours, option, selectedRoute }
      });

    } catch (error) {
      console.error('Hata:', error.message);
      alert('Bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  return (
    <div className="container">
      <h2>Eskişehir Büyükşehir Belediyesi Otobüs Raporları</h2>
      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label htmlFor='startDate'>Başlangıç Tarihi:</label>
          <input
            type="date"
            id='startDate'
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor='startHours'>Başlangıç Saati:</label>
          <input
            type="time"
            id='startHours'
            value={startHours}
            onChange={(e) => setStartHours(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor='finishDate'>Bitiş Tarihi:</label>
          <input
            type="date"
            id='finishDate'
            value={finishDate}
            onChange={(e) => setFinishDate(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor='finishHours'>Bitiş Saati:</label>
          <input
            type="time"
            id='finishHours'
            value={finishHours}
            onChange={(e) => setFinishHours(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor='reportType'>Rapor Türü:</label>
          <select
            id='reportType'
            value={option}
            onChange={(e) => setOption(e.target.value)}
          >
            <option value=''>Seçiniz</option>
            <option value='En Çok Güzergah Dışı Otobüsler'>En Çok Güzergah Dışı Otobüsler</option>
            <option value='Güzergah Hattı Dışı Otobüsler'>Güzergah Hattı Dışı Otobüsler</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor='busRoute'>Otobüs Hattı:</label>
          <select
            id='busRoute'
            value={selectedRoute}
            onChange={(e) => setSelectedRoute(e.target.value)}
          >
            <option value="">Seçiniz</option>
            <option value="all">Bütün Hatlar</option>
            {routes.map(route => (
              <option key={route.routeId} value={route.routeId}>
                {route.busNumber} - {route.description}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" id='submitButton'>Gönder</button>
      </form>
    </div>
  );
}

export default App;