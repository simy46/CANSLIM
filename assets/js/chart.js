import { Chart, registerables } from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';
import 'chartjs-adapter-moment';
import { CandlestickController, CandlestickElement } from 'chartjs-chart-financial';

Chart.register(...registerables, zoomPlugin, CandlestickController, CandlestickElement);


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
    const chartType = document.getElementById('chart-type-select').value;
    const dataGranularity = chartData[interval].meta.dataGranularity;
    
    if (stockChart) {
        updateChart(chartData[interval].quotes, maxPoints, chartType, interval);

    } else {
        initializeChart(chartData[interval].quotes, maxPoints, chartType, interval, dataGranularity);
        updateIntervalOptions('1y');
        updateInfoChart(chartData.dailyChart.meta);
    }
    attachChartButtonEvents(chartData);
}

function updateInfoChart(meta) {
    const nameElement = document.getElementById('stock-name-chart');
    const tickerElement = document.getElementById('stock-ticker-chart');
    const priceElement = document.getElementById('stock-price-chart');
    const volumeElement = document.getElementById('stock-volume-chart');

    nameElement.textContent = meta.longName || '[Stock Name]';
    tickerElement.textContent = `(${meta.symbol || '[Stock Ticker]'})`;

    priceElement.textContent = '';
    volumeElement.textContent = '';

    const priceValue = document.createElement('span');
    priceValue.className = 'value';
    priceValue.textContent = `$${meta.regularMarketPrice || 'N/A'}`;
    priceElement.appendChild(priceValue);

    const priceCurrency = document.createElement('span');
    priceCurrency.className = 'currency';
    priceCurrency.textContent = `(${meta.currency || 'USD'})`;
    priceElement.appendChild(priceCurrency);

    const volumeValue = document.createElement('span');
    volumeValue.className = 'value';
    volumeValue.textContent = meta.regularMarketVolume ? meta.regularMarketVolume.toLocaleString() : 'N/A';
    volumeElement.appendChild(volumeValue);

    const volumeShares = document.createTextNode(' shares');
    volumeElement.appendChild(volumeShares);
}


// Central function to initialize the correct chart
function initializeChart(data, maxPoints, chartType, interval) {
    switch (chartType) {
        case 'mountain':
            initializeMountainChart(data, maxPoints, interval);
            break;
        case 'scatter':
            initializeScatterChart(data, maxPoints, interval);
            break;
        case 'histogram':
            initializeHistogramChart(data, maxPoints, interval);
            break;
        case 'candlestick':
            initializeCandlestickChart(data, maxPoints, interval);
            break;
        case 'baseline':
            initializeBaselineChart(data, maxPoints, interval);
            break;
        case 'waterfall':
            initializeWaterfallChart(data, maxPoints, interval);
            break;
        default:
            console.error('Invalid chart type selected');
            break;
    }
}

// Central function to update the correct chart
function updateChart(data, maxPoints, chartType, interval) {
    switch (chartType) {
        case 'mountain':
            updateMountainChart(data, maxPoints, interval);
            break;
        case 'scatter':
            updateScatterChart(data, maxPoints, interval);
            break;
        case 'histogram':
            updateHistogramChart(data, maxPoints);
            break;
        case 'candlestick':
            updateCandlestickChart(data, maxPoints, interval);
            break;
        case 'baseline':
            updateBaselineChart(data, maxPoints);
            break;
        case 'waterfall':
            updateWaterfallChart(data, maxPoints);
            break;
        default:
            console.error('Invalid chart type selected');
            break;
    }
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

function getTimeUnitForInterval(interval) {
    if (!interval) {
        return 'day';
    }
    if (interval.includes('intraday')) {
        if (interval === 'intraday1mChart' || interval === 'intraday5mChart' || interval === 'intraday15mChart') {
            return 'minute';
        } else {
            return 'hour';
        }
    } else {
        if (interval === 'dailyChart') {
            return 'day';
        } else if (interval === 'weeklyChart') {
            return 'week';
        } else if (interval === 'monthlyChart') {
            return 'month';
        } else {
            return 'year';
        }
    }
}


// MOUNTAIN CHART //
function initializeMountainChart(data, maxPoints) {
    const ctx = document.getElementById('stock-chart').getContext('2d');
    const chartContainer = document.getElementById('chart-content');

    const config = {
        type: 'line',
        data: {
            labels: data.map(entry => new Date(entry.date)),
            datasets: [{
                label: 'Price',
                data: data.map(entry => entry.close),
                borderColor: '#4f58ab',
                borderWidth: 1,
                tension: 0.4,
                fill: true,
                backgroundColor: 'rgba(75, 192, 192, 0.1)', 
                pointRadius: 0,
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    type: 'timeseries',
                    time: {
                        parser: 'yyyy-MM-dd',
                        unit: 'day',
                        tooltipFormat: 'MM/DD/YYYY HH:mm',
                        displayFormats: {
                            minute: 'MM/DD/YYYY HH:mm',
                            hour: 'MM/DD/YYYY HH:mm',
                            day: 'MM/DD/YYYY',
                            week: 'MM/DD/YYYY',
                            month: 'MM/YYYY',
                            year: 'YYYY'
                        }
                    },
                    distribution: 'linear',
                    ticks: {
                        color: '#b2b5bc',
                        maxTicksLimit: maxPoints,
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                y: {
                    beginAtZero: true,
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
                    pan: {
                        enabled: true,
                        mode: 'xy',
                        onPan: () => {
                            if (chartContainer) {
                                chartContainer.style.cursor = 'grabbing';
                            }
                            document.getElementById('reset-btn').style.display = 'flex';
                        },
                        onPanEnd: () => {
                            if (chartContainer) {
                                chartContainer.style.cursor = 'default';
                            }
                        }
                    },
                    zoom: {
                        wheel: {
                            enabled: true,
                            speed: 0.1,
                        },
                        drag: {
                            enabled: true,
                            modifierKey: 'ctrl',
                        },
                        mode: 'xy',
                        onZoom: () => {
                            document.getElementById('reset-btn').style.display = 'flex';
                        }
                    },
                },
            }
        }
    };

    stockChart = new Chart(ctx, config);
}

function updateMountainChart(data, maxPoints, interval) {
    const chartData = processMountainData(data, maxPoints);
    stockChart.data = chartData;

    stockChart.options.scales.x.time.unit = getTimeUnitForInterval(interval);
    stockChart.options.scales.x.time.tooltipFormat = interval.includes('intraday') ? 'MM/DD/YYYY HH:mm' : 'MM/DD/YYYY';

    stockChart.update();
}

function processMountainData(data, maxPoints = 100) {
    const downsampledData = downsample(data, maxPoints);
    const labels = downsampledData.map(entry => new Date(entry.date));
    const prices = downsampledData.map(entry => entry.close);

    return {
        labels: labels,
        datasets: [{
            label: 'Price',
            data: prices,
            borderColor: '#4f58ab',
            borderWidth: 2,
            backgroundColor: 'rgba(75, 192, 192, 0.1)',
            fill: true,
            tension: 0.4,
            pointRadius: 0 
        }]
    };
}

// SCATTER CHART //
function initializeScatterChart(data, maxPoints, interval) {
    const ctx = document.getElementById('stock-chart').getContext('2d');
    const chartContainer = document.getElementById('chart-content');

    let filterExtremes = false;

    const processedData = processScatterData(data, maxPoints, filterExtremes);

    const config = {
        type: 'scatter',
        data: processedData,
        options: {
            responsive: true,
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'day',
                        tooltipFormat: 'MM/DD/YYYY HH:mm',
                        displayFormats: {
                            minute: 'MM/DD/YYYY HH:mm',
                            hour: 'MM/DD/YYYY HH:mm',
                            day: 'MM/DD/YYYY',
                            week: 'MM/DD/YYYY',
                            month: 'MM/YYYY',
                            year: 'YYYY'
                        }
                    },
                    ticks: {
                        color: '#b2b5bc',
                        maxTicksLimit: maxPoints,
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
                    display: true,
                    labels: {
                        generateLabels: function(chart) {
                            const labels = Chart.defaults.plugins.legend.labels.generateLabels(chart);

                            labels.push({
                                text: 'Extreme values',
                                fillStyle: '#4f58ab',
                                hidden: filterExtremes,
                                lineCap: 'butt',
                                lineDash: [],
                                lineDashOffset: 0,
                                lineJoin: 'miter',
                                lineWidth: 0,
                                strokeStyle: '#ffffff',
                                pointStyle: 'rectRounded',
                                datasetIndex: -1,
                            });

                            return labels;
                        }
                    },
                    onClick: function(_, legendItem, legend) {
                        const index = legendItem.datasetIndex;

                        if (index === -1) {
                            const actualMaxPoints = document.getElementById('max-points').value;
                            filterExtremes = !filterExtremes;
                            updateScatterChart(data, actualMaxPoints, interval, filterExtremes);
                        } else {
                            const ci = legend.chart;
                            const meta = ci.getDatasetMeta(index);
                            meta.hidden = meta.hidden === null ? !ci.data.datasets[index].hidden : null;
                            ci.update();
                        }
                    }
                },
                tooltip: {
                    backgroundColor: '#4f58ab',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    borderColor: '#b2b5bc',
                    borderWidth: 1,
                    callbacks: {
                        label: function (context) {
                            const point = context.raw;
                            return `Date: ${new Date(point.x).toLocaleDateString()}, Price: ${point.y.toFixed(2)}`;
                        }
                    }
                },
                zoom: {
                    pan: {
                        enabled: true,
                        mode: 'xy',
                        onPan: () => {
                            if (chartContainer) {
                                chartContainer.style.cursor = 'grabbing';
                            }
                            document.getElementById('reset-btn').style.display = 'flex';
                        },
                        onPanEnd: () => {
                            if (chartContainer) {
                                chartContainer.style.cursor = 'default';
                            }
                        }
                    },
                    zoom: {
                        wheel: {
                            enabled: true,
                            speed: 0.1,
                        },
                        drag: {
                            enabled: true,
                            modifierKey: 'ctrl',
                        },
                        mode: 'xy',
                        onZoom: () => {
                            document.getElementById('reset-btn').style.display = 'flex';
                        }
                    },
                }
            }
        }
    };

    stockChart = new Chart(ctx, config);
}


function processScatterData(data, maxPoints, filterExtremes) {
    let pointsToUse = downsample(data, maxPoints);

    if (filterExtremes) {
        pointsToUse = toggleExtremeFiltering(pointsToUse);
    }

    return {
        datasets: [
            {
                label: 'High',
                data: pointsToUse.map(entry => ({ x: new Date(entry.date), y: entry.high })),
                backgroundColor: '#1f77b4',
            },
            {
                label: 'Low',
                data: pointsToUse.map(entry => ({ x: new Date(entry.date), y: entry.low })),
                backgroundColor: '#ff7f0e',
            },
            {
                label: 'Open',
                data: pointsToUse.map(entry => ({ x: new Date(entry.date), y: entry.open })),
                backgroundColor: '#2ca02c',
            },
            {
                label: 'Close',
                data: pointsToUse.map(entry => ({ x: new Date(entry.date), y: entry.close })),
                backgroundColor: '#d62728',
            }
        ]
    };
}

function updateScatterChart(data, maxPoints, interval, filterExtremes = false) {
    if (stockChart) {
        const processedData = processScatterData(data, maxPoints, filterExtremes);
        const hiddenStates = stockChart.data.datasets.map((_, idx) => stockChart.getDatasetMeta(idx).hidden);

        stockChart.data.datasets = processedData.datasets;
        stockChart.options.scales.x.time.unit = getTimeUnitForInterval(interval);
        stockChart.options.scales.x.time.tooltipFormat = interval.includes('intraday') ? 'MM/DD/YYYY HH:mm' : 'MM/DD/YYYY';
        stockChart.options.scales.x.ticks.maxTicksLimit = maxPoints;

        hiddenStates.forEach((hidden, idx) => {
            stockChart.getDatasetMeta(idx).hidden = hidden;
        });

        stockChart.update();
    }
}

function toggleExtremeFiltering(data) {
    const values = data.flatMap(entry => [entry.high, entry.low, entry.open, entry.close]);
    const q1 = getPercentile(values, 25);
    const q3 = getPercentile(values, 75);
    const iqr = q3 - q1;
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;

    return data.filter(entry =>
        entry.high >= lowerBound && entry.high <= upperBound &&
        entry.low >= lowerBound && entry.low <= upperBound &&
        entry.open >= lowerBound && entry.open <= upperBound &&
        entry.close >= lowerBound && entry.close <= upperBound
    );
}

function getPercentile(data, percentile) {
    const sortedData = data.slice().sort((a, b) => a - b);
    const index = (percentile / 100) * (sortedData.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    return sortedData[lower] + (sortedData[upper] - sortedData[lower]) * (index - lower);
}

// HISTOGRAM CHART //
// HISTOGRAM CHART //
function initializeHistogramChart(data, maxPoints, interval) {
    const ctx = document.getElementById('stock-chart').getContext('2d');
    const chartContainer = document.getElementById('chart-content');

    const processedData = processHistogramData(data, maxPoints, interval);

    const config = {
        type: 'bar',
        data: {
            labels: processedData.labels,
            datasets: [{
                label: 'Price Change (%)',
                data: processedData.data,
                backgroundColor: processedData.colors,
                borderColor: processedData.colors,
                borderWidth: 1,
                barPercentage: 0.9,
                categoryPercentage: 0.8,
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: {
                        color: '#b2b5bc',
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)',
                    }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#b2b5bc',
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)',
                    }
                }
            },
            plugins: {
                legend: {
                    display: false,
                },
                tooltip: {
                    backgroundColor: '#4f58ab',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    borderColor: '#b2b5bc',
                    borderWidth: 1,
                },
                zoom: {
                    pan: {
                        enabled: true,
                        mode: 'xy',
                        onPan: () => {
                            if (chartContainer) {
                                chartContainer.style.cursor = 'grabbing';
                            }
                            document.getElementById('reset-btn').style.display = 'flex';
                        },
                        onPanEnd: () => {
                            if (chartContainer) {
                                chartContainer.style.cursor = 'default';
                            }
                        }
                    },
                    zoom: {
                        wheel: {
                            enabled: true,
                            speed: 0.1,
                        },
                        drag: {
                            enabled: true,
                            modifierKey: 'ctrl',
                        },
                        mode: 'xy',
                        onZoom: () => {
                            document.getElementById('reset-btn').style.display = 'flex';
                        }
                    }
                }
            }
        }
    };

    stockChart = new Chart(ctx, config);
}

// Data Processing for Histogram
function processHistogramData(data, maxPoints, interval) {
    // Calculate percentage change day over day
    const changes = [];
    const colors = [];

    // Iterate through the data to calculate daily percentage change
    for (let i = 1; i < data.length; i++) {
        const change = ((data[i].close - data[i - 1].close) / data[i - 1].close) * 100;
        changes.push(change);
        colors.push(change > 0 ? 'rgba(0, 255, 0, 0.6)' : 'rgba(255, 0, 0, 0.6)'); // Green for positive, Red for negative
    }

    // Determine the number of bins dynamically based on the range and data
    const numberOfBins = Math.min(20, changes.length); // Avoid excessive bins if the dataset is small
    const minValue = Math.min(...changes);
    const maxValue = Math.max(...changes);

    const binWidth = (maxValue - minValue) / numberOfBins;
    const bins = new Array(numberOfBins).fill(0);
    const binLabels = [];

    // Populate the bins
    changes.forEach(change => {
        const binIndex = Math.floor((change - minValue) / binWidth);
        bins[Math.min(binIndex, numberOfBins - 1)] += 1;
    });

    // Generate labels for each bin
    for (let i = 0; i < numberOfBins; i++) {
        const binStart = minValue + i * binWidth;
        const binEnd = binStart + binWidth;
        binLabels.push(`${binStart.toFixed(2)}% - ${binEnd.toFixed(2)}%`);
    }

    return {
        labels: binLabels,
        data: bins,
        colors: bins.map((_, i) => colors[i % colors.length])
    };
}

// Histogram Chart Update
function updateHistogramChart(data, maxPoints, interval) {
    if (stockChart) {
        const processedData = processHistogramData(data, maxPoints, interval);

        stockChart.data.labels = processedData.labels;
        stockChart.data.datasets[0].data = processedData.data;
        stockChart.data.datasets[0].backgroundColor = processedData.colors;
        stockChart.data.datasets[0].borderColor = processedData.colors;
        stockChart.update();
    }
}

// CANDLESTICK CHART //
function initializeCandlestickChart(data, maxPoints, interval) {
    const ctx = document.getElementById('stock-chart').getContext('2d');
    const chartContainer = document.getElementById('chart-content');

    if (data.length === 0) {
        console.warn('No data available for the selected interval.');
        return;
    }

    const processedData = processCandlestickData(data, maxPoints, interval, chartContainer);
    const firstDate = new Date(processedData.labels[0]);
    const lastDate = new Date(processedData.labels[processedData.labels.length - 1]);

    const config = {
        type: 'candlestick',
        data: processedData,
        options: {
            responsive: true,
            scales: {
                x: {
                    type: 'timeseries',
                    min: firstDate,
                    max: lastDate,
                    time: {
                        unit: 'day',
                        tooltipFormat: 'MM/DD/YYYY HH:mm',
                        displayFormats: {
                            minute: 'MM/DD/YYYY HH:mm',
                            hour: 'MM/DD/YYYY HH:mm',
                            day: 'MM/DD/YYYY',
                            week: 'MM/DD/YYYY',
                            month: 'MM/YYYY',
                            year: 'YYYY'
                        },
                        distribution: 'series'
                    },
                    ticks: {
                        color: '#b2b5bc',
                        maxTicksLimit: maxPoints,
                        source: 'labels',
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                y: {
                    beginAtZero: false,
                    ticks: {
                        color: '#b2b5bc',
                        callback: function(value) {
                            return value.toFixed(2);
                        }
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
                    intersect: false,
                    callbacks: {
                        label: function (context) {
                            const point = context.raw;
                            return `O: ${point.o.toFixed(2)}\nC: ${point.c.toFixed(2)}\nH: ${point.h.toFixed(2)}\nL: ${point.l.toFixed(2)}`;
                        }
                    }
                },
                zoom: {
                    pan: {
                        enabled: true,
                        mode: 'xy',
                        onPan: () => {
                            if (chartContainer) {
                                chartContainer.style.cursor = 'grabbing';
                            }
                            document.getElementById('reset-btn').style.display = 'flex';
                        },
                        onPanEnd: () => {
                            if (chartContainer) {
                                chartContainer.style.cursor = 'default';
                            }
                        }
                    },
                    zoom: {
                        wheel: {
                            enabled: true,
                            speed: 0.1,
                        },
                        drag: {
                            enabled: true,
                            modifierKey: 'ctrl',
                        },
                        mode: 'xy',
                        onZoom: () => {
                            document.getElementById('reset-btn').style.display = 'flex';
                        }
                    },
                },
            },
            elements: {
                candlestick: {
                    color: {
                        up: '#4caf50',
                        down: '#f44336'
                    },
                    borderWidth: 2,
                    hoverBorderWidth: 3,
                    barThickness: processBarThickness(chartContainer.clientWidth, processedData.labels.length),
                    hoverBackgroundColor: function (context) {
                        return context.raw.c >= context.raw.o ? 'rgba(76, 175, 80, 0.5)' : 'rgba(244, 67, 54, 0.5)';
                    }
                }
            }
        }
    };

    stockChart = new Chart(ctx, config);


}

function processCandlestickData(data, maxPoints = 100, interval = 'dailyChart', chartContainer) {
    const pointsToUse = downsample(data, maxPoints);

    return {
        labels: pointsToUse.map(entry => new Date(entry.date)),
        datasets: [{
            label: 'Candlestick',
            data: pointsToUse.map(entry => ({
                x: new Date(entry.date),
                o: entry.open,
                h: entry.high,
                l: entry.low,
                c: entry.close
            })),
            borderColor: pointsToUse.map(entry => entry.close >= entry.open ? '#4caf50' : '#f44336'),
            backgroundColor: pointsToUse.map(entry => entry.close >= entry.open ? 'rgba(76, 175, 80, 0.5)' : 'rgba(244, 67, 54, 0.5)'),
            borderWidth: 1,
            barThickness: processBarThickness(chartContainer.clientWidth, pointsToUse.length),
        }],
        dates: pointsToUse.map(entry => entry.date)
    };
}

function updateCandlestickChart(data, maxPoints, interval) {
    const chartContainer = document.getElementById('chart-content');
    const chartData = processCandlestickData(data, maxPoints, 'dailyChart', chartContainer);

    if (stockChart) {
        stockChart.data = chartData;
        stockChart.options.scales.x.min = chartData.labels[0];
        stockChart.options.scales.x.max = chartData.labels[chartData.labels.length - 1];

        stockChart.options.scales.x.time.unit = getTimeUnitForInterval(interval);

        stockChart.options.scales.x.time.tooltipFormat = interval.includes('intraday') ? 'MM/DD/YYYY HH:mm' : 'MM/DD/YYYY';

        stockChart.options.elements.candlestick.barThickness = processBarThickness(chartContainer.clientWidth, chartData.labels.length);
        
        stockChart.update();
    }
}

function processBarThickness(chartWidth, dataPoints) {
    return Math.max((chartWidth / dataPoints) * 0.1, 2);
}

function processData(data, maxPoints = 100, chartType = 'line') {
    const downsampledData = downsample(data, maxPoints);
    const labels = downsampledData.map(entry => new Date(entry.date));

    let dataset = [];
    if (chartType === 'candlestick') {
        dataset = [{
            label: 'Candlestick',
            data: downsampledData.map(entry => ({
                x: new Date(entry.date),
                o: entry.open,
                h: entry.high,
                l: entry.low,
                c: entry.close
            })),
            borderColor: downsampledData.map(entry => entry.close >= entry.open ? 'rgba(0, 255, 0, 1)' : 'rgba(255, 0, 0, 1)'),
            borderWidth: 2
        }];
    } else if (chartType === 'waterfall') {
        dataset = [{
            label: 'Price Change',
            data: downsampledData.map(entry => entry.close - entry.open),
            backgroundColor: function(context) {
                const index = context.dataIndex;
                const value = context.dataset.data[index];
                return value >= 0 ? 'rgba(0, 255, 0, 0.5)' : 'rgba(255, 0, 0, 0.5)';
            },
            borderColor: function(context) {
                const index = context.dataIndex;
                const value = context.dataset.data[index];
                return value >= 0 ? 'rgba(0, 255, 0, 1)' : 'rgba(255, 0, 0, 1)';
            },
            borderWidth: 2,
            barThickness: 10
        }];
    } else {
        const prices = downsampledData.map(entry => entry.close);
        dataset = [{
            label: 'Price',
            data: prices,
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
            backgroundColor: 'rgba(75, 192, 192, 0.1)',
            fill: true,
            tension: 0.4
        }];
    }

    return {
        labels: labels,
        datasets: dataset
    };
}

function setActiveButton(button) {
    document.querySelectorAll('.chart-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    button.classList.add('active');
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

function attachChartButtonEvents(chartData) {
    const chartContainer = document.getElementById('chart-content');

    // RANGE
    document.querySelectorAll('.chart-btn').forEach(button => {
        button.addEventListener('click', () => {
            setActiveButton(button);
            const range = button.getAttribute('data-range');
            const chartType = document.getElementById('chart-type-select').value;
            
            updateIntervalOptions(range);


            const selectedInterval = document.getElementById('interval-select').value;
            const maxPoints = document.getElementById('max-points').value;
            const filteredData = filterDataByRange(chartData[selectedInterval].quotes, range);
            
            if (stockChart) {
                stockChart.resetZoom();
                document.getElementById('reset-btn').style.display = 'none';
            }

            updateChart(filteredData, maxPoints, chartType, selectedInterval);
        });
    });

    // INTERVAL
    document.getElementById('interval-select').addEventListener('change', () => {
        updateChartInfo(chartData);
    });

    // MAX POINTS
    document.getElementById('max-points').addEventListener('change', () => {
        updateChartInfo(chartData);
    });    

    // CHART TYPE
    document.getElementById('chart-type-select').addEventListener('change', (e) => {
        updateChartType(chartData);
    });

    // BTN EVENTS
    document.getElementById('reset-btn').addEventListener('click', () => {
        stockChart.resetZoom();
        document.getElementById('reset-btn').style.display = 'none';
    });

    // CHART MOUSE CHANGE //
    document.addEventListener('mouseup', () => {
        if (chartContainer) {
            chartContainer.style.cursor = 'default';
        }
    });

    document.addEventListener('touchend', () => {
        if (chartContainer) {
            chartContainer.style.cursor = 'default';
        }
    });

    // DOWNLOAD BTN //
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

    // FULLSCREEN BTN //
    document.getElementById('fullscreen-btn').addEventListener('click', () => {
        getFullScreen();
    });
    
    document.addEventListener('fullscreenchange', () => {
        setFullScreen();
    });
}

function updateChartType(chartData) {
    const maxPoints = document.getElementById('max-points').value;
    const activeButton = document.querySelector('.chart-btn.active');
    const range = activeButton ? activeButton.getAttribute('data-range') : '1d';
    const interval = document.getElementById('interval-select').value;
    const filteredData = filterDataByRange(chartData[interval].quotes, range);
    const chartType = document.getElementById('chart-type-select').value;

    if (stockChart) {
        stockChart.resetZoom();
        document.getElementById('reset-btn').style.display = 'none';
        stockChart.destroy();
    }

    if (stockChart && stockChart.config.type === chartType) {
        updateChart(filteredData, maxPoints, chartType);
    } else {
        initializeChart(filteredData, maxPoints, chartType, interval);
    }
}

function updateChartInfo(chartData) {
    const maxPoints = document.getElementById('max-points').value;
    const activeButton = document.querySelector('.chart-btn.active');
    const range = activeButton ? activeButton.getAttribute('data-range') : '1d';
    const interval = document.getElementById('interval-select').value;
    const filteredData = filterDataByRange(chartData[interval].quotes, range);
    const chartType = document.getElementById('chart-type-select').value;

    if (stockChart) {
        stockChart.resetZoom();
        document.getElementById('reset-btn').style.display = 'none';
    }

    updateChart(filteredData, maxPoints, chartType, interval);
}

function chartDataToCSV(meta, range) {
    const csvData = [];
    const labels = stockChart.data.labels;
    const data = stockChart.data.datasets[0].data;

    csvData.push(['Date', 'Price']);
    for (let i = 0; i < labels.length; i++) {
        if (data[i]) {
            const date = new Date(labels[i]).toISOString().split('T')[0]; 
            const price = data[i].toFixed(2); 
            csvData.push([date, price]);
        }
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
    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
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
    elem.style.minHeight = '70vh';
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

/*
take-snapshot-btn

function takeSnapshot() {
    const canvas = document.getElementById('stock-chart');
    const imageUrl = canvas.toDataURL('image/png');
    const imgElement = document.getElementById('stock-chart-dashboard-image');
    imgElement.src = imageUrl;
    imgElement.style.display = 'block'
    document.getElementById('take-snapshot-btn').textContent = 'Retake picture'
}
*/