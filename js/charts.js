// Charts Management and Customization
class ChartsManager {
    constructor() {
        this.charts = {};
        this.chartConfigs = storage.get('chart_configs', {});
    }

    // Initialize all charts
    initializeCharts() {
        this.createCategoryChart();
        this.createTrendChart();
        this.createCategoryBreakdownChart();
        this.createHabitStatsChart();
    }

    // Create spending by category chart with gradient
    createCategoryChart() {
        const ctx = document.getElementById('categoryChart');
        if (!ctx) return;

        const spending = financeManager.getSpendingByCategory();
        const labels = Object.keys(spending);
        const data = Object.values(spending);

        const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, 'rgba(99, 102, 241, 0.5)');
        gradient.addColorStop(1, 'rgba(236, 72, 153, 0.5)');

        if (this.charts.categoryChart) {
            this.charts.categoryChart.destroy();
        }

        this.charts.categoryChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: [
                        'rgba(99, 102, 241, 0.8)',
                        'rgba(139, 92, 246, 0.8)',
                        'rgba(236, 72, 153, 0.8)',
                        'rgba(240, 253, 250, 0.8)',
                        'rgba(16, 185, 129, 0.8)',
                        'rgba(245, 158, 11, 0.8)',
                        'rgba(239, 68, 68, 0.8)',
                        'rgba(59, 130, 246, 0.8)'
                    ],
                    borderColor: '#1e293b',
                    borderWidth: 2,
                    hoverOffset: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#cbd5e1',
                            padding: 15,
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        titleColor: '#f1f5f9',
                        bodyColor: '#cbd5e1',
                        padding: 12,
                        borderColor: '#6366f1',
                        borderWidth: 1,
                        callbacks: {
                            label: function(context) {
                                const value = context.parsed;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `$${value.toFixed(2)} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    // Create monthly trend chart
    createTrendChart() {
        const ctx = document.getElementById('trendChart');
        if (!ctx) return;

        const trends = financeManager.getMonthlyTrends(6);
        const labels = Object.keys(trends).map(month => {
            const date = new Date(month);
            return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        });
        const incomeData = Object.values(trends).map(t => t.income);
        const expenseData = Object.values(trends).map(t => t.expenses);

        if (this.charts.trendChart) {
            this.charts.trendChart.destroy();
        }

        this.charts.trendChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Income',
                        data: incomeData,
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 5,
                        pointBackgroundColor: '#10b981',
                        pointBorderColor: '#0f172a',
                        pointBorderWidth: 2,
                        pointHoverRadius: 7
                    },
                    {
                        label: 'Expenses',
                        data: expenseData,
                        borderColor: '#ef4444',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        pointRadius: 5,
                        pointBackgroundColor: '#ef4444',
                        pointBorderColor: '#0f172a',
                        pointBorderWidth: 2,
                        pointHoverRadius: 7
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                plugins: {
                    legend: {
                        labels: {
                            color: '#cbd5e1',
                            padding: 15,
                            font: {
                                size: 12,
                                weight: 'bold'
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                        titleColor: '#f1f5f9',
                        bodyColor: '#cbd5e1',
                        padding: 12,
                        borderColor: '#6366f1',
                        borderWidth: 1
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: '#cbd5e1'
                        },
                        grid: {
                            color: 'rgba(51, 65, 85, 0.2)'
                        }
                    },
                    x: {
                        ticks: {
                            color: '#cbd5e1'
                        },
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }

    // Create category breakdown bar chart
    createCategoryBreakdownChart() {
        const ctx = document.getElementById('categoryBreakdown');
        if (!ctx) return;

        const stats = financeManager.getCategoryStats();
        const labels = Object.keys(stats);
        const totals = Object.values(stats).map(s => s.total);

        if (this.charts.categoryBreakdown) {
            this.charts.categoryBreakdown.destroy();
        }

        this.charts.categoryBreakdown = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels.map(l => l.charAt(0).toUpperCase() + l.slice(1)),
                datasets: [{
                    label: 'Total Spent',
                    data: totals,
                    backgroundColor: [
                        'rgba(99, 102, 241, 0.8)',
                        'rgba(139, 92, 246, 0.8)',
                        'rgba(236, 72, 153, 0.8)',
                        'rgba(240, 253, 250, 0.8)',
                        'rgba(16, 185, 129, 0.8)',
                        'rgba(245, 158, 11, 0.8)',
                        'rgba(239, 68, 68, 0.8)',
                        'rgba(59, 130, 246, 0.8)'
                    ],
                    borderRadius: 8,
                    borderSkipped: false,
                    hoverBackgroundColor: 'rgba(6, 182, 212, 1)',
                    borderWidth: 2,
                    borderColor: '#1e293b'
                }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        labels: {
                            color: '#cbd5e1'
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                        titleColor: '#f1f5f9',
                        bodyColor: '#cbd5e1',
                        padding: 12,
                        borderColor: '#6366f1',
                        borderWidth: 1,
                        callbacks: {
                            label: function(context) {
                                return `$${context.parsed.x.toFixed(2)}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            color: '#cbd5e1'
                        },
                        grid: {
                            color: 'rgba(51, 65, 85, 0.2)'
                        }
                    },
                    y: {
                        ticks: {
                            color: '#cbd5e1'
                        },
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }

    // Create habit statistics chart
    createHabitStatsChart() {
        const ctx = document.getElementById('habitStatsChart');
        if (!ctx) return;

        const habits = habitsManager.getAllHabits();
        const labels = habits.map(h => h.name);
        const streaks = habits.map(h => h.streak || 0);
        const completions = habits.map(h => (h.logs ? h.logs.length : 0));

        if (this.charts.habitStats) {
            this.charts.habitStats.destroy();
        }

        this.charts.habitStats = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Current Streak',
                        data: streaks,
                        borderColor: '#6366f1',
                        backgroundColor: 'rgba(99, 102, 241, 0.1)',
                        borderWidth: 2,
                        pointRadius: 4,
                        pointBackgroundColor: '#6366f1',
                        pointHoverRadius: 6
                    },
                    {
                        label: 'Total Completions',
                        data: completions,
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        borderWidth: 2,
                        pointRadius: 4,
                        pointBackgroundColor: '#10b981',
                        pointHoverRadius: 6
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        labels: {
                            color: '#cbd5e1'
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                        titleColor: '#f1f5f9',
                        bodyColor: '#cbd5e1',
                        padding: 12,
                        borderColor: '#6366f1',
                        borderWidth: 1
                    }
                },
                scales: {
                    r: {
                        ticks: {
                            color: '#cbd5e1'
                        },
                        grid: {
                            color: 'rgba(51, 65, 85, 0.2)'
                        }
                    }
                }
            }
        });
    }

    // Update all charts
    updateAllCharts() {
        this.createCategoryChart();
        this.createTrendChart();
        this.createCategoryBreakdownChart();
        this.createHabitStatsChart();
    }

    // Destroy all charts
    destroyAllCharts() {
        Object.values(this.charts).forEach(chart => {
            if (chart) chart.destroy();
        });
        this.charts = {};
    }

    // Create custom time range chart
    createTimeRangeChart(startDate, endDate, chartType = 'line') {
        const transactions = financeManager.getTransactionsByDateRange(startDate, endDate);
        
        if (transactions.length === 0) {
            return null;
        }

        const dateMap = {};
        transactions.forEach(t => {
            if (!dateMap[t.date]) {
                dateMap[t.date] = { income: 0, expense: 0 };
            }
            if (t.type === 'income') {
                dateMap[t.date].income += t.amount;
            } else {
                dateMap[t.date].expense += t.amount;
            }
        });

        const labels = Object.keys(dateMap).sort();
        const incomeData = labels.map(date => dateMap[date].income);
        const expenseData = labels.map(date => dateMap[date].expense);

        return {
            labels: labels.map(date => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
            datasets: [
                {
                    label: 'Income',
                    data: incomeData,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 2
                },
                {
                    label: 'Expenses',
                    data: expenseData,
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    borderWidth: 2
                }
            ]
        };
    }

    // Create habit progress chart for specific habit
    createHabitProgressChart(habitId, days = 30) {
        const chartData = habitsManager.getHabitChartData(habitId, days);
        if (!chartData) return null;

        const habit = habitsManager.getHabit(habitId);

        return {
            type: 'bar',
            labels: chartData.labels,
            datasets: [{
                label: `${habit.name} Completions`,
                data: chartData.completed,
                backgroundColor: chartData.completed.map(val => val === 1 ? 'rgba(16, 185, 129, 0.8)' : 'rgba(51, 65, 85, 0.3)'),
                borderRadius: 4
            }]
        };
    }

    // Refresh charts based on date range
    refreshChartsForDateRange(startDate, endDate) {
        const timeRangeData = this.createTimeRangeChart(startDate, endDate);
        if (timeRangeData) {
            const ctx = document.getElementById('timeRangeChart');
            if (ctx && this.charts.timeRangeChart) {
                this.charts.timeRangeChart.data = timeRangeData;
                this.charts.timeRangeChart.update();
            }
        }
    }
}

// Create global charts manager instance
const chartsManager = new ChartsManager();
