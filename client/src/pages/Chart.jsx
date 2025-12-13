import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function ExpenseChart({ categoryTotals, incomeCategoryTotals = [] }) {
  
  // Combine and normalize data
  const combinedData = [
    ...incomeCategoryTotals.map(item => ({ 
      label: item._id, 
      value: item.totalAmount, 
      color: '#28a745' // Green for Income
    })),
    ...categoryTotals.map(item => ({ 
      label: item._id, 
      value: item.totalSpent, 
      color: '#6c5dd3' // Purple for Expense
    }))
  ];

  const labels = combinedData.map((item) => item.label);
  const data = combinedData.map((item) => item.value);
  const backgroundColors = combinedData.map((item) => item.color);

  return (
    <div style={{ width: "100%", height: "300px" }}>
      <Bar
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  return `$${context.raw}`;
                }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                display: true,
                drawBorder: false,
              }
            },
            x: {
              grid: {
                display: false,
              }
            }
          }
        }}
        data={{
          labels,
          datasets: [
            {
              label: "Amount",
              data,
              backgroundColor: backgroundColors,
              borderRadius: 8,
            },
          ],
        }}
      />
    </div>
  );
}
