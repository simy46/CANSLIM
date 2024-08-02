import 'chartjs-plugin-annotation';

let stockChart;  // Declare stockChart globally
const intervalOptions = {
    '1d': ['intraday1mChart', 'intraday5mChart', 'intraday15mChart', 'intraday30mChart', 'intraday60mChart', 'dailyChart'],
    '5d': ['intraday5mChart', 'intraday15mChart', 'intraday30mChart', 'intraday60mChart', 'dailyChart'],
    '1mo': ['intraday60mChart', 'dailyChart', 'weeklyChart', 'monthlyChart'],
    '3mo': ['intraday60mChart', 'dailyChart', 'weeklyChart', 'monthlyChart'],
    '6mo': ['intraday60mChart', 'dailyChart', 'weeklyChart', 'monthlyChart'],
    '1y': ['intraday60mChart', 'dailyChart', 'weeklyChart', 'monthlyChart'],
    '2y': ['dailyChart', 'weeklyChart', 'monthlyChart'],
    '5y': ['dailyChart', 'weeklyChart', 'monthlyChart'],
    '10y': ['dailyChart', 'weeklyChart', 'monthlyChart'],
    'ytd': ['intraday60mChart', 'dailyChart', 'weeklyChart', 'monthlyChart'],
    'max': ['weeklyChart', 'monthlyChart']
};

const intervalDisplayNames = {
    'intraday1mChart': '1m',
    'intraday5mChart': '5m',
    'intraday15mChart': '15m',
    'intraday30mChart': '30m',
    'intraday60mChart': '60m',
    'dailyChart': '1d',
    'weeklyChart': '1w',
    'monthlyChart': '1mo'
};

export function updateChartSection(chartData) {
    const maxPoints = document.getElementById('max-points').value;
    const interval = document.getElementById('interval-select').value;

    if (stockChart) {
        updateChart(chartData[interval].quotes, maxPoints);
        return;
    } else {
        initializeChart(chartData[interval].quotes, maxPoints);
        updateIntervalOptions('1y');
    }
    attachChartButtonEvents(chartData);
}

function updateChart(data, maxPoints) {
    const chartData = processData(data, maxPoints);
    stockChart.data = chartData;
    stockChart.update();
}

function processData(data, maxPoints = 100) {
    const downsampledData = downsample(data, maxPoints);

    const labels = downsampledData.map(entry => new Date(entry.date));
    const prices = downsampledData.map(entry => entry.close);

    return {
        labels: labels,
        datasets: [{
            label: 'Price',
            data: prices,
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
            backgroundColor: 'rgba(75, 192, 192, 0.1)',
            fill: true,
            tension: 0.4
        }]
    };
}

function downsample(data, maxPoints) {
    if (maxPoints === 'max' || data.length <= maxPoints) {
        return data;
    }

    const sampledData = [];
    const step = Math.ceil(data.length / maxPoints);

    for (let i = 0; i < data.length; i += step) {
        sampledData.push(data[i]);
    }

    return sampledData;
}

function filterDataByRange(data, range) {
    const endDate = new Date();
    let startDate;

    switch (range) {
        case '1d':
            startDate = new Date(endDate);
            startDate.setDate(startDate.getDate() - 1);
            break;
        case '5d':
            startDate = new Date(endDate);
            startDate.setDate(startDate.getDate() - 5);
            break;
        case '1mo':
            startDate = new Date(endDate);
            startDate.setMonth(startDate.getMonth() - 1);
            break;
        case '3mo':
            startDate = new Date(endDate);
            startDate.setMonth(startDate.getMonth() - 3);
            break;
        case '6mo':
            startDate = new Date(endDate);
            startDate.setMonth(startDate.getMonth() - 6);
            break;
        case '1y':
            startDate = new Date(endDate);
            startDate.setFullYear(startDate.getFullYear() - 1);
            break;
        case '2y':
            startDate = new Date(endDate);
            startDate.setFullYear(startDate.getFullYear() - 2);
            break;
        case '5y':
            startDate = new Date(endDate);
            startDate.setFullYear(startDate.getFullYear() - 5);
            break;
        case '10y':
            startDate = new Date(endDate);
            startDate.setFullYear(startDate.getFullYear() - 10);
            break;
        case 'ytd':
            startDate = new Date(endDate.getFullYear(), 0, 1);
            break;
        case 'max':
        default:
            return data;
    }
    
    const filteredData = data.filter(entry => new Date(entry.date) >= startDate && new Date(entry.date) <= endDate);
    
    if (filteredData.length === 0) {
        document.getElementById('no-data-message').style.display = 'block';
    } else {
        document.getElementById('no-data-message').style.display = 'none';
    }
    
    return filteredData;
}

function updateIntervalOptions(range) {
    const intervalSelect = document.getElementById('interval-select');
    const availableIntervals = intervalOptions[range] || ['dailyChart'];

    intervalSelect.innerHTML = '';

    availableIntervals.forEach(interval => {
        const option = document.createElement('option');
        option.value = interval;
        option.text = intervalDisplayNames[interval] || interval;
        intervalSelect.appendChild(option);
    });

    intervalSelect.value = availableIntervals[0];
}

function initializeChart(data, maxPoints) {
    const ctx = document.getElementById('stock-chart').getContext('2d');
    const chartData = processData(data, maxPoints);

    if (stockChart) {
        stockChart.destroy();
    }

    const config = {
        type: 'line',
        data: chartData,
        options: {
            responsive: true,
            scales: {
                x: {
                    type: 'time',
                    time: {
                        parser: 'yyyy-MM-dd',
                        unit: 'day', // Ensure we're working with daily intervals
                        tooltipFormat: 'MMM dd, yyyy',
                        displayFormats: {
                            day: 'MMM dd',
                            month: 'MMM yyyy',
                            year: 'yyyy'
                        }
                    },
                    distribution: 'linear', // Force even spacing
                    ticks: {
                        color: '#b2b5bc',
                        maxTicksLimit: maxPoints, // Adjust the number of ticks displayed
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                y: {
                    beginAtZero: false,
                    ticks: {
                        color: '#b2b5bc'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: '#4f58ab',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    borderColor: '#b2b5bc',
                    borderWidth: 1,
                    mode: 'index',
                    intersect: false
                },
                zoom: {
                    zoom: {
                        wheel: {
                            enabled: true,
                            modifierKey: 'ctrl',
                            speed: 0.1,
                        },
                        drag: {
                            enabled: true,
                        },
                        pinch: {
                            enabled: true
                        },
                        mode: 'xy',
                        onZoom: ({ chart }) => {
                            document.getElementById('reset-btn').style.display = 'flex';
                        }
                    },
                    pan: {
                        enabled: true,
                        mode: 'xy',
                    },
                },
            },
            elements: {
                point: {
                    radius: 2,
                    backgroundColor: '#FF4500',
                    hoverRadius: 4,
                    hoverBackgroundColor: '#FFD700'
                },
                line: {
                    borderColor: '#4f58ab',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true,
                    backgroundColor: 'rgba(75, 192, 192, 0.1)'
                }
            }
        }
    };

    stockChart = new Chart(ctx, config);
}


function setActiveButton(button) {
    document.querySelectorAll('.chart-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    button.classList.add('active');
}


function attachChartButtonEvents(chartData) {
    document.querySelectorAll('.chart-btn').forEach(button => {
        button.addEventListener('click', () => {
            setActiveButton(button);
            const range = button.getAttribute('data-range');
            
            // Update interval options based on the selected range
            updateIntervalOptions(range);

            const selectedInterval = document.getElementById('interval-select').value;
            const maxPoints = document.getElementById('max-points').value;
            const filteredData = filterDataByRange(chartData[selectedInterval].quotes, range);
            
            // Reset zoom before updating chart
            if (stockChart) {
                stockChart.resetZoom();
                document.getElementById('reset-btn').style.display = 'none';
            }

            updateChart(filteredData, maxPoints);
        });
    });



    document.getElementById('interval-select').addEventListener('change', () => {
        const activeButton = document.querySelector('.chart-btn.active');
        const range = activeButton ? activeButton.getAttribute('data-range') : '1d';
        const interval = document.getElementById('interval-select').value;
        const maxPoints = document.getElementById('max-points').value;
        const filteredData = filterDataByRange(chartData[interval].quotes, range);

        // Reset zoom before updating chart
        if (stockChart) {
            stockChart.resetZoom();
            document.getElementById('reset-btn').style.display = 'none';
        }

        updateChart(filteredData, maxPoints);
    });

    document.getElementById('max-points').addEventListener('change', () => {
        const maxPoints = document.getElementById('max-points').value;
        const activeButton = document.querySelector('.chart-btn.active');
        const range = activeButton ? activeButton.getAttribute('data-range') : '1d';
        const interval = document.getElementById('interval-select').value;
        const filteredData = filterDataByRange(chartData[interval].quotes, range);
        updateChart(filteredData, maxPoints);
    });    

    document.getElementById('reset-btn').addEventListener('click', () => {
        stockChart.resetZoom();
        document.getElementById('reset-btn').style.display = 'none';
    });

    document.getElementById('download-btn').addEventListener('click', () => {
        const menu = document.getElementById('download-menu');
        menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
    });
    
    document.getElementById('download-png').addEventListener('click', () => {
        const selectedRange = document.querySelector('.chart-btn.active').getAttribute('data-range');
        chartDataToPng(chartData.dailyChart.meta, selectedRange);
    });
    
    document.getElementById('download-csv').addEventListener('click', () => {
        const selectedRange = document.querySelector('.chart-btn.active').getAttribute('data-range');
        chartDataToCSV(chartData.dailyChart.meta, selectedRange);
    });
    // Close the menu if the user clicks outside of it
    window.addEventListener('click', (e) => {
        if (!document.getElementById('download-btn').contains(e.target) &&
            !document.getElementById('download-menu').contains(e.target)) {
            document.getElementById('download-menu').style.display = 'none';
        }
    });

    document.getElementById('fullscreen-btn').addEventListener('click', () => {
        getFullScreen();
    });
    
    document.addEventListener('fullscreenchange', () => {
        setFullScreen();
    });

    document.getElementById('take-snapshot-btn').addEventListener('click', () => {
        takeSnapshot();
    });
}

function chartDataToCSV(meta, range) {
    const csvData = [];
    const labels = stockChart.data.labels;
    const data = stockChart.data.datasets[0].data;

    csvData.push(['Date', 'Price']);
    for (let i = 0; i < labels.length; i++) {
        const date = new Date(labels[i]).toISOString().split('T')[0]; 
        const price = data[i].toFixed(2); 
        csvData.push([date, price]);
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + csvData.map(e => e.join(', ')).join('\n');
    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `canslim-calculator-${meta.symbol}-${range}.csv`;
    link.click();
    document.getElementById('download-menu').style.display = 'none';
}

function chartDataToPng(meta, range) {
    const link = document.createElement('a');
    link.href = stockChart.toBase64Image();
    link.download = `canslim-calculator-${meta.symbol}-${range}.png`;
    link.click();
    document.getElementById('download-menu').style.display = 'none';
}


function getFullScreen() {
    const chartSection = document.getElementById('chart-section');
    if (!document.fullscreenElement) {
        openFullscreen(chartSection);
    } else {
        closeFullscreen(chartSection);
    }
}

function openFullscreen(elem) {
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) { /* Safari */
        elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) { /* IE11 */
        elem.msRequestFullscreen();
    }

    elem.style.minHeight = '80vh';
}

function closeFullscreen(elem) {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.webkitExitFullscreen) { /* Safari */
        document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) { /* IE11 */
        document.msExitFullscreen();
    }

    elem.style.minHeight = '65vh';
}
  

function setFullScreen() {
    const fullscreenBtn = document.getElementById('fullscreen-btn');
        if (document.fullscreenElement) {
            fullscreenBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" class="fullscreen-exit-icon">
                    <path d="M4 12 L12 12 12 4 M20 4 L20 12 28 12 M4 20 L12 20 12 28 M28 20 L20 20 20 28"/>
                </svg>
            `;
        } else {
            fullscreenBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" class="fullscreen-icon">
                    <path d="M4 12 L4 4 12 4 M20 4 L28 4 28 12 M4 20 L4 28 12 28 M28 20 L28 28 20 28"/>
                </svg>
            `;
        }
}

function takeSnapshot() {
    const canvas = document.getElementById('stock-chart');
    const imageUrl = canvas.toDataURL('image/png');
    const imgElement = document.getElementById('stock-chart-dashboard-image');
    imgElement.src = imageUrl;
    imgElement.style.display = 'block'
    document.getElementById('take-snapshot-btn').textContent = 'Retake picture'
}
