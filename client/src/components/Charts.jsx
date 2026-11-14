import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { pct } from '../lib/format.js';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '76%',
  plugins: {
    legend: {
      position: 'bottom',
      labels: { boxWidth: 9, usePointStyle: true, font: { size: 10 } },
    },
  },
};

const barOptions = {
  indexAxis: 'y',
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: {
      min: 0,
      max: 100,
      ticks: { callback: (value) => `${value}%`, font: { size: 9 } },
      grid: { color: '#edf0f5' },
    },
    y: {
      ticks: { font: { size: 9 } },
      grid: { display: false },
    },
  },
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (context) => pct(context.raw),
      },
    },
  },
};

export default function Charts({ present, absent, rate, courseRates }) {
  const doughnutData = {
    labels: ['Frequentes', 'Faltosos'],
    datasets: [
      {
        data: [present, absent],
        backgroundColor: ['#19a77b', '#f0a33b'],
        borderWidth: 0,
        hoverOffset: 5,
      },
    ],
  };

  const barData = {
    labels: courseRates.map((item) => item.name),
    datasets: [
      {
        label: 'Frequência (%)',
        data: courseRates.map((item) => item.rate),
        backgroundColor: '#5578e8',
        borderRadius: 5,
        maxBarThickness: 24,
      },
    ],
  };

  return (
    <div className="chart-grid">
      <article className="panel">
        <div className="panel-head">
          <div>
            <h3>Frequência x faltas</h3>
            <p>Distribuição consolidada dos registros</p>
          </div>
        </div>
        <div className="chart-wrap doughnut-wrap">
          <Doughnut data={doughnutData} options={doughnutOptions} />
          <div className="chart-center">
            <b>{pct(rate)}</b>
            <span>frequência</span>
          </div>
        </div>
      </article>

      <article className="panel">
        <div className="panel-head">
          <div>
            <h3>Frequência por curso</h3>
            <p>Percentual de presença por curso</p>
          </div>
        </div>
        <div className="chart-wrap">
          <Bar data={barData} options={barOptions} />
        </div>
      </article>
    </div>
  );
}
