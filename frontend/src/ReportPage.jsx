import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import './ReportPage.css';

function ReportPage() {
  const location = useLocation();
  const { startDate, startHours, finishDate, finishHours, option, selectedRoute } = location.state || {};

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        let response;

        if (option === 'En Çok Güzergah Dışı Otobüsler') {
          response = await axios.get('http://localhost:5000/encokguzergahhattidisiotobusler', {
            params: { startDate, startHours, finishDate, finishHours, selectedRoute }
          });
          setData(response.data);
        } else if (option === 'Güzergah Hattı Dışı Otobüsler') {
          response = await axios.get('http://localhost:5001/guzergahhattidisiotobusler', {
            params: { startDate, startHours, finishDate, finishHours, selectedRoute }
          });
          setData(response.data);
        } else {
          setError('Geçersiz seçenek.');
        }
      } catch (error) {
        setError('Veri yüklenirken bir hata oluştu: ' + (error.response?.data?.message || error.message));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [startDate, startHours, finishDate, finishHours, option, selectedRoute]);

  const paginate = (data) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(data.length / itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const createPaginationButtons = () => {
    const pages = [];
    const maxPagesToShow = 3;
    const halfMaxPages = Math.floor(maxPagesToShow / 2);

    let startPage = Math.max(1, currentPage - halfMaxPages);
    let endPage = Math.min(totalPages, currentPage + halfMaxPages);

    if (currentPage - halfMaxPages <= 1) {
      endPage = Math.min(maxPagesToShow, totalPages);
    }
    if (currentPage + halfMaxPages >= totalPages) {
      startPage = Math.max(1, totalPages - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="pagination">
        <button
          className={`pagination-button ${currentPage === 1 ? 'disabled' : ''}`}
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          {"<"}
        </button>
        {pages.map((page) => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={`pagination-button ${currentPage === page ? 'active' : ''}`}
          >
            {page}
          </button>
        ))}
        <button
          className={`pagination-button ${currentPage === totalPages ? 'disabled' : ''}`}
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          {">"}
        </button>
      </div>
    );
  };

  const downloadExcel = (data, filename) => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/octet-stream' });
    saveAs(blob, filename);
  };

  if (loading) return <div className="loading-spinner"></div>;
  if (error) return <p className="message">Hata: {error}</p>;

  return (
    <div className="report-container">
      {option === 'En Çok Güzergah Dışı Otobüsler' && (
        <>
          <h2>En Çok Güzergah Hattı Dışına Çıkan Otobüsler</h2>
          {data.length > 0 ? (
            <>
              <table className="report-table">
                <thead>
                  <tr>
                    <th>Arac</th>
                    <th>Tarih</th>
                    <th>Blok</th>
                    <th>Program</th>
                    <th>Başlangıç</th>
                    <th>Son</th>
                    <th>EnAcele</th>
                    <th>MaksGecikme</th>
                    <th>Duraklar</th>
                    <th>GüzergahHattıDışı</th>
                    <th>Kilometre</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item, index) => (
                    <tr key={index}>
                      <td>{item.Arac}</td>
                      <td>{item.Tarih}</td>
                      <td>{item.Blok}</td>
                      <td>{item.Program}</td>
                      <td>{item.Baslangic}</td>
                      <td>{item.Son}</td>
                      <td>{item.EnAcele}</td>
                      <td>{item.MaksGecikme}</td>
                      <td>{item.Duraklar}</td>
                      <td>{item.GuzergahHattiDisi}</td>
                      <td>{item.Kilometre}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button className='excelButton' onClick={() => downloadExcel(data, 'guzergah-disi-otobusler.xlsx')}>Excel İndir</button>
            </>
          ) : (
            <p>Veri mevcut değil</p>
          )}
        </>
      )}

      {option === 'Güzergah Hattı Dışı Otobüsler' && (
        <>
          <h2>Güzergah Hattı Dışı Otobüsler</h2>
          {data.length > 0 ? (
            <>
              <table className="report-table">
                <thead>
                  <tr>
                    <th>Otobüs Numarası</th>
                    <th>Plaka</th>
                    <th>Durak Numarası</th>
                    <th>Zaman</th>
                  </tr>
                </thead>
                <tbody>
                  {paginate(data).map((item, index) => (
                    <tr key={index}>
                      <td>{item.busNumber}</td>
                      <td>{item.numberPlate}</td>
                      <td>{item.busStopNumber}</td>
                      <td>{item.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {createPaginationButtons()}
              <button className='excelButton' onClick={() => downloadExcel(data, 'guzergah-disi-otobusler.xlsx')}>Excel İndir</button>
            </>
          ) : (
            <p>Veri mevcut değil</p>
          )}
        </>
      )}
    </div>
  );
}

export default ReportPage;