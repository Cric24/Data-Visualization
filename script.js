// Initial data
const rawData = [
    { date: '2024-06-01', value: 65 },
    { date: '2024-06-02', value: 59 },
    { date: '2024-06-03', value: 80 },
    { date: '2024-06-04', value: 81 },
    { date: '2024-06-05', value: 56 },
    { date: '2024-06-06', value: 55 },
    { date: '2024-06-07', value: 40 },
    { date: '2024-06-08', value: 70 },
    { date: '2024-06-09', value: 62 },
    { date: '2024-06-10', value: 75 },
    { date: '2024-06-11', value: 77 },
    { date: '2024-06-12', value: 65 },
    { date: '2024-06-13', value: 60 },
    { date: '2024-06-14', value: 75 },
    { date: '2024-06-15', value: 85 },
];

let filteredData = rawData;
let chart;

document.addEventListener('DOMContentLoaded', function () {
    const ctx = document.getElementById('myChart').getContext('2d');

    // Color palette for datasets
    const colorPalette = ['#5A9BD4', '#F69256', '#78C5A7', '#F4D06F', '#9B5E4A', '#BFD641', '#F2998E'];



    // Default chart configuration
    const chartConfig = {
        type: 'line',
        data: {
            labels: filteredData.map(data => data.date),
            datasets: [{
                label: 'Sales',
                data: filteredData.map(data => data.value),
                backgroundColor: colorPalette.map(color => color.replace('0.2', '0.5')), // Adjusted transparency
                borderColor: colorPalette,
                borderWidth: 2,
                fill: false
            }]
        },
        options: {
            responsive: true,
            animation: {
                duration: 1000,
                easing: 'easeInOutCubic' // Smooth animation
            },
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'day'
                    },
                    title: {
                        display: true,
                        text: 'Date',
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    },
                    ticks: {
                        font: {
                            size: 12
                        }
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Value',
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    },
                    ticks: {
                        font: {
                            size: 12
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return `Sales: ${context.raw}`;
                        }
                    }
                }
            },
            onClick: (e) => {
                const activePoints = chart.getElementsAtEventForMode(e, 'nearest', { intersect: true }, false);
                if (activePoints.length) {
                    const { index } = activePoints[0];
                    const { date, value } = filteredData[index];
                    showDataPointInfo(date, value);
                }
            }
        }
    };

    // Initialize the chart
    chart = new Chart(ctx, chartConfig);

    // Function to update chart type
    window.updateChart = function () {
        chartConfig.type = document.getElementById('chartType').value;
        chart.destroy(); // Destroy existing chart
        chart = new Chart(ctx, chartConfig); // Reinitialize chart
    };

    // Function to filter data based on selection
    window.filterData = function () {
        const filter = document.getElementById('filterData').value;
        const now = luxon.DateTime.now();

        if (filter === 'lastMonth') {
            const lastMonth = now.minus({ months: 1 });
            filteredData = rawData.filter(data => luxon.DateTime.fromISO(data.date) >= lastMonth);
            document.getElementById('dateRange').style.display = 'none';
        } else if (filter === 'lastWeek') {
            const lastWeek = now.minus({ weeks: 1 });
            filteredData = rawData.filter(data => luxon.DateTime.fromISO(data.date) >= lastWeek);
            document.getElementById('dateRange').style.display = 'none';
        } else if (filter === 'custom') {
            const dateRange = document.getElementById('dateRange').value.split(' to ');
            if (dateRange.length === 2) {
                const startDate = luxon.DateTime.fromISO(dateRange[0]);
                const endDate = luxon.DateTime.fromISO(dateRange[1]);
                filteredData = rawData.filter(data => luxon.DateTime.fromISO(data.date) >= startDate && luxon.DateTime.fromISO(data.date) <= endDate);
            }
            document.getElementById('dateRange').style.display = 'inline-block';
        } else {
            filteredData = rawData;
            document.getElementById('dateRange').style.display = 'none';
        }

        chart.data.labels = filteredData.map(data => data.date);
        chart.data.datasets[0].data = filteredData.map(data => data.value);

        // Update dataset colors dynamically
        const numDataPoints = filteredData.length;
        chart.data.datasets[0].backgroundColor = colorPalette.map(color => color.replace('0.2', '0.5')).slice(0, numDataPoints); // Adjusted transparency
        chart.data.datasets[0].borderColor = colorPalette.slice(0, numDataPoints);

        chart.update(); // Update chart with new data and colors
    };

    // Function to show data point information
    window.showDataPointInfo = function (date, value) {
        const infoContainer = document.getElementById('infoContainer');
        infoContainer.innerHTML = `<p>Date: ${date}</p><p>Sales: ${value}</p>`;
        infoContainer.style.display = 'block';
    };

    // Function to download chart as image
    window.downloadChart = function () {
        const link = document.createElement('a');
        link.href = chart.toBase64Image();
        link.download = 'chart.png';
        link.click();
    };

    // Function to toggle dark mode
    window.toggleDarkMode = function () {
        const body = document.body;
        body.classList.toggle('dark-mode');
        const themeToggle = document.querySelector('.theme-toggle button');
        themeToggle.textContent = body.classList.contains('dark-mode') ? 'Light Mode' : 'Dark Mode';
    };

    // Initialize Flatpickr for date range selection
    flatpickr('#dateRange', {
        mode: 'range',
        dateFormat: 'Y-m-d'
    });

    // Initial data filter and chart update
    filterData();
});
