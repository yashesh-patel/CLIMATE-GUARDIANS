// Charting and visualization utilities
class ChartManager {
    constructor() {
        this.charts = new Map();
        this.defaultColors = {
            hot: '#FF6B6B',
            cold: '#4ECDC4',
            windy: '#45B7D1',
            wet: '#96CEB4',
            uncomfortable: '#FFEAA7'
        };
    }

    // Create historical trends chart
    createTrendsChart(ctx, historicalData, locationName) {
        if (this.charts.has('trends')) {
            this.charts.get('trends').destroy();
        }

        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: historicalData.years,
                datasets: [
                    {
                        label: 'Hot Days (>32°C)',
                        data: historicalData.hotDays,
                        borderColor: this.defaultColors.hot,
                        backgroundColor: this.hexToRgba(this.defaultColors.hot, 0.1),
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Rainy Days (>10mm)',
                        data: historicalData.rainyDays,
                        borderColor: this.defaultColors.wet,
                        backgroundColor: this.hexToRgba(this.defaultColors.wet, 0.1),
                        tension: 0.4,
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: `Historical Trends - ${locationName}`,
                        font: { size: 14, weight: 'bold' }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    },
                    legend: {
                        position: 'top',
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Year'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Number of Days'
                        },
                        beginAtZero: true
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'nearest'
                }
            }
        });

        this.charts.set('trends', chart);
        return chart;
    }

    // Create monthly averages chart
    createMonthlyChart(ctx, monthlyData, locationName) {
        if (this.charts.has('monthly')) {
            this.charts.get('monthly').destroy();
        }

        const chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                datasets: [
                    {
                        label: 'Avg. High Temp (°C)',
                        data: monthlyData.temperatures,
                        backgroundColor: this.hexToRgba(this.defaultColors.hot, 0.7),
                        yAxisID: 'y',
                        order: 2
                    },
                    {
                        label: 'Precipitation (mm)',
                        data: monthlyData.precipitation,
                        backgroundColor: this.hexToRgba(this.defaultColors.wet, 0.7),
                        yAxisID: 'y1',
                        type: 'line',
                        order: 1,
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: `Monthly Climate Averages - ${locationName}`,
                        font: { size: 14, weight: 'bold' }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Month'
                        }
                    },
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Temperature (°C)'
                        },
                        grid: {
                            drawOnChartArea: true
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Precipitation (mm)'
                        },
                        grid: {
                            drawOnChartArea: false
                        }
                    }
                }
            }
        });

        this.charts.set('monthly', chart);
        return chart;
    }

    // Create probability distribution chart
    createProbabilityChart(ctx, probabilities) {
        if (this.charts.has('probability')) {
            this.charts.get('probability').destroy();
        }

        const conditions = Object.keys(probabilities).filter(key => key.startsWith('very-'));
        const data = conditions.map(condition => probabilities[condition]);
        const labels = conditions.map(condition => 
            condition.replace('very-', '').replace(/\b\w/g, l => l.toUpperCase())
        );
        const colors = conditions.map(condition => this.getConditionColor(condition));

        const chart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors,
                    borderColor: colors.map(color => this.darkenColor(color, 20)),
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.label}: ${context.parsed}% probability`;
                            }
                        }
                    }
                },
                cutout: '60%'
            }
        });

        this.charts.set('probability', chart);
        return chart;
    }

    // Generate sample data for charts (in real app, this would come from APIs)
    generateSampleData(lat, lon) {
        // This is sample data - in production, you'd fetch real historical data
        const currentYear = new Date().getFullYear();
        const years = Array.from({length: 10}, (_, i) => currentYear - 9 + i);
        
        // Generate realistic-looking sample data based on location
        const baseHotDays = this.getBaseHotDays(lat);
        const baseRainyDays = this.getBaseRainyDays(lat);
        
        return {
            trends: {
                years: years,
                hotDays: years.map(year => baseHotDays + Math.random() * 10 - 5 + (year - currentYear + 5) * 0.8),
                rainyDays: years.map(year => baseRainyDays + Math.random() * 8 - 4)
            },
            monthly: {
                temperatures: this.generateMonthlyTemperatures(lat),
                precipitation: this.generateMonthlyPrecipitation(lat)
            }
        };
    }

    // Helper methods
    hexToRgba(hex, alpha) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    darkenColor(color, percent) {
        const num = parseInt(color.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) - amt;
        const G = (num >> 8 & 0x00FF) - amt;
        const B = (num & 0x0000FF) - amt;
        return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
    }

    getConditionColor(condition) {
        const colorMap = {
            'very-hot': this.defaultColors.hot,
            'very-cold': this.defaultColors.cold,
            'very-windy': this.defaultColors.windy,
            'very-wet': this.defaultColors.wet,
            'very-uncomfortable': this.defaultColors.uncomfortable
        };
        return colorMap[condition] || '#999999';
    }

    getBaseHotDays(lat) {
        const absLat = Math.abs(lat);
        if (absLat < 30) return 120; // Tropical
        if (absLat < 45) return 45;  // Temperate
        if (absLat < 60) return 15;  // Continental
        return 5; // Polar
    }

    getBaseRainyDays(lat) {
        const absLat = Math.abs(lat);
        if (absLat < 30) return 90;  // Tropical - rainy
        if (absLat < 45) return 110; // Temperate - more rainy
        if (absLat < 60) return 80;  // Continental
        return 50; // Polar
    }

    generateMonthlyTemperatures(lat) {
        const absLat = Math.abs(lat);
        const baseTemp = absLat < 30 ? 25 : absLat < 45 ? 15 : absLat < 60 ? 5 : -5;
        const variation = absLat < 30 ? 3 : absLat < 45 ? 10 : absLat < 60 ? 20 : 25;
        
        return Array.from({length: 12}, (_, i) => {
            const seasonal = Math.sin((i - 6) * Math.PI / 6) * variation;
            return Math.round(baseTemp + seasonal);
        });
    }

    generateMonthlyPrecipitation(lat) {
        const absLat = Math.abs(lat);
        const basePrecip = absLat < 30 ? 150 : absLat < 45 ? 80 : absLat < 60 ? 60 : 40;
        
        return Array.from({length: 12}, (_, i) => {
            const seasonal = Math.sin((i - 6) * Math.PI / 6) * 0.3 + 0.7;
            return Math.round(basePrecip * seasonal);
        });
    }

    // Destroy all charts
    destroyAll() {
        this.charts.forEach(chart => chart.destroy());
        this.charts.clear();
    }
}

// Initialize chart manager
const chartManager = new ChartManager();