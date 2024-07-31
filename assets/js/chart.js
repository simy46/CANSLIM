import 'chartjs-plugin-annotation';

let stockChart;  // Declare stockChart globally

export function updateChartSection(chartData) {
    const maxPoints = document.getElementById('max-points').value;
    if (stockChart) {
        updateChart(chartData.quotes, maxPoints);
        return;
    } else {
        initializeChart(chartData.quotes, maxPoints);
    }
    attachChartButtonEvents(chartData);
}

function updateChart(data, maxPoints) {
    const chartData = processData(data, maxPoints);
    stockChart.data = chartData;
    stockChart.update();
}

function processData(data, maxPoints) {
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
                        unit: 'day',
                        tooltipFormat: 'MMM dd, yyyy',
                        displayFormats: {
                            day: 'MMM dd',
                            month: 'MMM yyyy',
                            year: 'yyyy'
                        }
                    },
                    ticks: {
                        color: '#b2b5bc'
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
                            speed: 0.1, // Optional: Adjust the speed of zooming
                        },
                        drag: {
                            enabled: true,
                        },
                        pinch: {
                            enabled: true
                        },
                        mode: 'xy',
                        onZoom: ({chart}) => {
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
    console.log(JSON.parse(JSON.stringify(chartData)))
    document.querySelectorAll('.chart-btn').forEach(button => {
        button.addEventListener('click', () => {
            setActiveButton(button);
            const range = button.getAttribute('data-range');
            const maxPoints = document.getElementById('max-points').value;
            const filteredData = filterDataByRange(chartData.quotes, range);
            
            // Reset zoom before updating chart
            if (stockChart) {
                stockChart.resetZoom();
                document.getElementById('reset-btn').style.display = 'none';
            }

            updateChart(filteredData, maxPoints);
        });
    });

    document.getElementById('max-points').addEventListener('change', () => {
        const maxPoints = document.getElementById('max-points').value;
        const activeButton = document.querySelector('.chart-btn.active');
        if (activeButton) {
            const range = activeButton.getAttribute('data-range');
            const filteredData = filterDataByRange(chartData.quotes, range);
            updateChart(filteredData, maxPoints);
        }
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
        chartDataToPng(chartData.meta);
    });
    
    document.getElementById('download-csv').addEventListener('click', () => {
        chartDataToCSV(chartData.meta);
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
}

function chartDataToCSV(meta) {
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
    link.download = `chart-${meta.symbol}.csv`;
    link.click();
    document.getElementById('download-menu').style.display = 'none';
}

function chartDataToPng(meta) {
    const link = document.createElement('a');
    link.href = stockChart.toBase64Image();
    link.download = `chart-${meta.symbol}.png`;
    link.click();
    document.getElementById('download-menu').style.display = 'none';
}



function getFullScreen() {
    const chartSection = document.getElementById('chart-section');
    if (!document.fullscreenElement) {
        chartSection.requestFullscreen().catch(err => {
            alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
        });
    } else {
        document.exitFullscreen();
    }
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
