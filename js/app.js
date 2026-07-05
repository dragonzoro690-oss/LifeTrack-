// Main Application File
class LifeTrackApp {
    constructor() {
        this.isOnline = navigator.onLine;
        this.appVersion = '1.0.0';
        this.initializeApp();
    }

    // Initialize the entire application
    async initializeApp() {
        console.log('🚀 Initializing LifeTrack App v' + this.appVersion);
        
        this.setupEventListeners();
        this.loadAllData();
        this.initializeDashboard();
        this.setupDownloadFeatures();
        this.checkForUpdates();
    }

    // Setup all event listeners
    setupEventListeners() {
        // Navigation
        document.querySelectorAll('[data-nav]').forEach(el => {
            el.addEventListener('click', (e) => this.navigateTo(e.target.dataset.nav));
        });

        // Add transaction form
        const transactionForm = document.getElementById('transactionForm');
        if (transactionForm) {
            transactionForm.addEventListener('submit', (e) => this.handleAddTransaction(e));
        }

        // Add habit form
        const habitForm = document.getElementById('habitForm');
        if (habitForm) {
            habitForm.addEventListener('submit', (e) => this.handleAddHabit(e));
        }

        // AI Advisor chat
        const aiChatForm = document.getElementById('aiChatForm');
        if (aiChatForm) {
            aiChatForm.addEventListener('submit', (e) => this.handleAIChat(e));
        }

        // Date range filter
        const dateRangeBtn = document.getElementById('dateRangeBtn');
        if (dateRangeBtn) {
            dateRangeBtn.addEventListener('click', () => this.showDateRangeModal());
        }

        // Download buttons
        document.getElementById('downloadDataBtn')?.addEventListener('click', () => this.downloadData());
        document.getElementById('downloadAppBtn')?.addEventListener('click', () => this.downloadApp());
        document.getElementById('exportCSVBtn')?.addEventListener('click', () => this.exportToCSV());

        // Online/Offline detection
        window.addEventListener('online', () => this.handleOnline());
        window.addEventListener('offline', () => this.handleOffline());
    }

    // Load all data from storage
    loadAllData() {
        try {
            financeManager.loadAllTransactions();
            habitsManager.getAllHabits();
            chartsManager.initializeCharts();
            console.log('✅ All data loaded successfully');
        } catch (error) {
            console.error('❌ Error loading data:', error);
            this.showNotification('Error loading data. Some features may be limited.', 'error');
        }
    }

    // Initialize dashboard
    initializeDashboard() {
        this.updateDashboardStats();
        this.displayRecentTransactions();
        this.displayActiveHabits();
        this.updateFinancialHealth();
    }

    // Update dashboard statistics
    updateDashboardStats() {
        const balance = financeManager.getTotalBalance();
        const income = financeManager.getTotalIncome();
        const expenses = financeManager.getTotalExpenses();

        document.getElementById('totalBalance').textContent = `$${balance.toFixed(2)}`;
        document.getElementById('totalIncome').textContent = `$${income.toFixed(2)}`;
        document.getElementById('totalExpenses').textContent = `$${expenses.toFixed(2)}`;

        // Update color based on balance
        const balanceEl = document.getElementById('totalBalance');
        if (balance > 0) {
            balanceEl.classList.add('text-green-500');
            balanceEl.classList.remove('text-red-500');
        } else {
            balanceEl.classList.add('text-red-500');
            balanceEl.classList.remove('text-green-500');
        }
    }

    // Display recent transactions
    displayRecentTransactions() {
        const transactions = financeManager.getRecentTransactions(10);
        const container = document.getElementById('recentTransactions');
        
        if (!container) return;
        
        container.innerHTML = '';
        
        transactions.forEach(transaction => {
            const el = document.createElement('div');
            el.className = 'transaction-item p-3 mb-2 bg-slate-700 rounded flex justify-between items-center';
            el.innerHTML = `
                <div>
                    <p class="font-semibold">${transaction.description}</p>
                    <p class="text-sm text-slate-400">${new Date(transaction.date).toLocaleDateString()}</p>
                </div>
                <div class="text-right">
                    <p class="font-bold ${transaction.type === 'income' ? 'text-green-400' : 'text-red-400'}">
                        ${transaction.type === 'income' ? '+' : '-'}$${transaction.amount.toFixed(2)}
                    </p>
                    <p class="text-sm text-slate-400">${transaction.category}</p>
                </div>
            `;
            container.appendChild(el);
        });
    }

    // Display active habits
    displayActiveHabits() {
        const habits = habitsManager.getActiveHabits();
        const container = document.getElementById('activeHabits');
        
        if (!container) return;
        
        container.innerHTML = '';
        
        habits.forEach(habit => {
            const isLoggedToday = habitsManager.isLoggedToday(habit.id);
            const el = document.createElement('div');
            el.className = `habit-item p-3 mb-2 bg-slate-700 rounded flex justify-between items-center ${isLoggedToday ? 'border-l-4 border-green-500' : ''}`;
            el.innerHTML = `
                <div>
                    <p class="font-semibold">${habit.name}</p>
                    <p class="text-sm text-slate-400">🔥 Streak: ${habit.streak || 0} days</p>
                </div>
                <button class="log-habit-btn bg-indigo-600 hover:bg-indigo-700 px-3 py-1 rounded text-sm" data-habit-id="${habit.id}">
                    ${isLoggedToday ? '✓ Done' : 'Log'}
                </button>
            `;
            container.appendChild(el);
            
            el.querySelector('.log-habit-btn').addEventListener('click', () => {
                this.logHabit(habit.id);
            });
        });
    }

    // Update financial health score
    updateFinancialHealth() {
        const score = aiAdvisor.getFinancialHealthScore();
        const healthEl = document.getElementById('financialHealth');
        
        if (healthEl) {
            healthEl.textContent = `${score}/100`;
            healthEl.className = `text-lg font-bold ${score >= 70 ? 'text-green-400' : score >= 40 ? 'text-yellow-400' : 'text-red-400'}`;
        }
    }

    // Handle adding transaction
    async handleAddTransaction(e) {
        e.preventDefault();
        const form = e.target;
        
        const transaction = {
            description: form.description.value,
            amount: parseFloat(form.amount.value),
            category: form.category.value,
            type: form.type.value,
            date: form.date.value || new Date().toISOString().split('T')[0]
        };

        try {
            financeManager.addTransaction(transaction);
            form.reset();
            this.showNotification('Transaction added successfully! 💰', 'success');
            this.updateDashboardStats();
            this.displayRecentTransactions();
            chartsManager.updateAllCharts();
        } catch (error) {
            this.showNotification('Error adding transaction', 'error');
        }
    }

    // Handle adding habit
    async handleAddHabit(e) {
        e.preventDefault();
        const form = e.target;

        const habit = {
            name: form.habitName.value,
            description: form.habitDescription.value,
            frequency: form.frequency.value
        };

        try {
            habitsManager.addHabit(habit.name, habit.description, habit.frequency);
            form.reset();
            this.showNotification('Habit added successfully! 🎯', 'success');
            this.displayActiveHabits();
            chartsManager.createHabitStatsChart();
        } catch (error) {
            this.showNotification('Error adding habit', 'error');
        }
    }

    // Log habit completion
    logHabit(habitId) {
        try {
            habitsManager.logHabitCompletion(habitId);
            this.showNotification('Habit logged! 🎉', 'success');
            this.displayActiveHabits();
            chartsManager.createHabitStatsChart();
        } catch (error) {
            this.showNotification('Error logging habit', 'error');
        }
    }

    // Handle AI chat
    async handleAIChat(e) {
        e.preventDefault();
        const form = e.target;
        const question = form.question.value;

        try {
            const response = await aiAdvisor.askQuestion(question);
            this.displayAIResponse(question, response);
            form.reset();
        } catch (error) {
            const response = aiAdvisor.getOfflineResponse(question);
            this.displayAIResponse(question, response);
            form.reset();
        }
    }

    // Display AI response
    displayAIResponse(question, response) {
        const chatContainer = document.getElementById('aiChatContainer');
        if (!chatContainer) return;

        const messageEl = document.createElement('div');
        messageEl.className = 'mb-4';
        messageEl.innerHTML = `
            <div class="bg-indigo-700 p-3 rounded mb-2 rounded-lg">
                <p class="text-sm"><strong>You:</strong> ${question}</p>
            </div>
            <div class="bg-slate-700 p-3 rounded rounded-lg">
                <p class="text-sm"><strong>Advisor:</strong></p>
                <div class="text-sm mt-2 whitespace-pre-wrap">${this.markdownToHTML(response)}</div>
            </div>
        `;
        chatContainer.appendChild(messageEl);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    // Convert markdown to HTML
    markdownToHTML(text) {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>');
    }

    // Navigate between pages
    navigateTo(page) {
        document.querySelectorAll('[data-page]').forEach(el => {
            el.style.display = 'none';
        });
        
        const pageEl = document.querySelector(`[data-page="${page}"]`);
        if (pageEl) {
            pageEl.style.display = 'block';
        }

        if (page === 'analytics') {
            chartsManager.updateAllCharts();
        }
    }

    // Show date range modal
    showDateRangeModal() {
        const modal = document.getElementById('dateRangeModal');
        if (modal) {
            modal.style.display = 'flex';
        }
    }

    // Download data as JSON
    downloadData() {
        const data = {
            version: this.appVersion,
            exportDate: new Date().toISOString(),
            transactions: financeManager.getAllTransactions(),
            habits: habitsManager.getAllHabits(),
            financialStats: {
                totalBalance: financeManager.getTotalBalance(),
                totalIncome: financeManager.getTotalIncome(),
                totalExpenses: financeManager.getTotalExpenses()
            }
        };

        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `lifetrack-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        this.showNotification('Data exported successfully! 📊', 'success');
    }

    // Export to CSV
    exportToCSV() {
        const transactions = financeManager.getAllTransactions();
        let csv = 'Date,Description,Category,Type,Amount\n';

        transactions.forEach(t => {
            csv += `${t.date},"${t.description}","${t.category}","${t.type}",${t.amount}\n`;
        });

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `lifetrack-transactions-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        this.showNotification('CSV exported successfully! 📋', 'success');
    }

    // Download entire app for offline use
    async downloadApp() {
        try {
            // Create a ZIP file with all app files
            const appFiles = {
                'index.html': this.getAppHTML(),
                'styles.css': this.getAppCSS(),
                'js/app.js': this.getAppJS(),
                'js/finance.js': this.getFinanceJS(),
                'js/habits.js': this.getHabitsJS(),
                'js/ai-advisor.js': this.getAIAdvisorJS(),
                'js/charts.js': this.getChartsJS()
            };

            // For now, download individual files
            const allContent = `
<!-- LifeTrack - Personal Finance & Habit Tracker -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LifeTrack - Your Life, Tracked</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #0f172a;
            color: #e2e8f0;
            overflow-x: hidden;
        }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .navbar { background: #1e293b; padding: 1rem 2rem; position: sticky; top: 0; z-index: 100; }
        .btn { padding: 8px 16px; border-radius: 6px; border: none; cursor: pointer; font-weight: 600; }
        .btn-primary { background: #6366f1; color: white; }
        .btn-primary:hover { background: #4f46e5; }
        .btn-success { background: #10b981; color: white; }
        .btn-success:hover { background: #059669; }
        .card { background: #1e293b; border-radius: 8px; padding: 1.5rem; margin-bottom: 1rem; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem; }
        .notification { position: fixed; top: 20px; right: 20px; padding: 1rem; border-radius: 8px; z-index: 1000; }
        .success { background: #10b981; }
        .error { background: #ef4444; }
    </style>
</head>
<body>
    <div class="navbar">
        <h1>🎯 LifeTrack</h1>
        <div style="display: flex; gap: 1rem; margin-top: 1rem;">
            <button class="btn btn-primary" data-nav="dashboard">Dashboard</button>
            <button class="btn btn-primary" data-nav="finance">Finance</button>
            <button class="btn btn-primary" data-nav="habits">Habits</button>
            <button class="btn btn-primary" data-nav="analytics">Analytics</button>
            <button class="btn btn-primary" data-nav="ai">AI Advisor</button>
            <button class="btn btn-success" id="downloadDataBtn">📥 Download Data</button>
        </div>
    </div>

    <div class="container">
        <!-- Dashboard -->
        <div data-page="dashboard" style="display: block;">
            <div class="card">
                <h2>Financial Overview</h2>
                <div class="grid" style="margin-top: 1rem;">
                    <div class="card">
                        <p class="text-slate-400">Total Balance</p>
                        <p id="totalBalance" class="text-3xl font-bold" style="color: #10b981;">$0.00</p>
                    </div>
                    <div class="card">
                        <p class="text-slate-400">Total Income</p>
                        <p id="totalIncome" class="text-3xl font-bold" style="color: #10b981;">$0.00</p>
                    </div>
                    <div class="card">
                        <p class="text-slate-400">Total Expenses</p>
                        <p id="totalExpenses" class="text-3xl font-bold" style="color: #ef4444;">$0.00</p>
                    </div>
                    <div class="card">
                        <p class="text-slate-400">Financial Health</p>
                        <p id="financialHealth" class="text-3xl font-bold">0/100</p>
                    </div>
                </div>
            </div>

            <div class="grid">
                <div class="card">
                    <h3>Recent Transactions</h3>
                    <div id="recentTransactions" style="margin-top: 1rem;"></div>
                </div>
                <div class="card">
                    <h3>Active Habits</h3>
                    <div id="activeHabits" style="margin-top: 1rem;"></div>
                </div>
            </div>
        </div>

        <!-- Finance Page -->
        <div data-page="finance" style="display: none;">
            <div class="card">
                <h2>Add Transaction</h2>
                <form id="transactionForm" style="display: grid; gap: 1rem; margin-top: 1rem;">
                    <input type="text" placeholder="Description" name="description" required>
                    <input type="number" placeholder="Amount" name="amount" step="0.01" required>
                    <select name="category" required>
                        <option value="">Select Category</option>
                        <option value="food">Food</option>
                        <option value="transport">Transport</option>
                        <option value="entertainment">Entertainment</option>
                        <option value="utilities">Utilities</option>
                        <option value="other">Other</option>
                    </select>
                    <select name="type" required>
                        <option value="expense">Expense</option>
                        <option value="income">Income</option>
                    </select>
                    <input type="date" name="date">
                    <button type="submit" class="btn btn-primary">Add Transaction</button>
                </form>
            </div>
        </div>

        <!-- Habits Page -->
        <div data-page="habits" style="display: none;">
            <div class="card">
                <h2>Add New Habit</h2>
                <form id="habitForm" style="display: grid; gap: 1rem; margin-top: 1rem;">
                    <input type="text" placeholder="Habit Name" name="habitName" required>
                    <textarea placeholder="Description" name="habitDescription"></textarea>
                    <select name="frequency" required>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                    </select>
                    <button type="submit" class="btn btn-primary">Add Habit</button>
                </form>
            </div>
        </div>

        <!-- Analytics Page -->
        <div data-page="analytics" style="display: none;">
            <div class="grid">
                <div class="card">
                    <h3>Spending by Category</h3>
                    <canvas id="categoryChart"></canvas>
                </div>
                <div class="card">
                    <h3>Monthly Trends</h3>
                    <canvas id="trendChart"></canvas>
                </div>
            </div>
        </div>

        <!-- AI Advisor Page -->
        <div data-page="ai" style="display: none;">
            <div class="card">
                <h2>AI Financial Advisor</h2>
                <form id="aiChatForm" style="display: grid; gap: 1rem; margin-top: 1rem;">
                    <input type="text" placeholder="Ask me anything about your finances..." name="question" required>
                    <button type="submit" class="btn btn-primary">Ask</button>
                </form>
                <div id="aiChatContainer" style="margin-top: 1.5rem; max-height: 400px; overflow-y: auto;"></div>
            </div>
        </div>
    </div>

    <div id="notification" class="notification" style="display: none;"></div>

    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script>
        // Storage manager
        const storage = {
            getTransactions() { return JSON.parse(localStorage.getItem('transactions') || '[]'); },
            getHabits() { return JSON.parse(localStorage.getItem('habits') || '[]'); },
            get(key, def) { return JSON.parse(localStorage.getItem(key) || JSON.stringify(def)); },
            save(key, data) { localStorage.setItem(key, JSON.stringify(data)); },
            addTransaction(t) { 
                const trans = this.getTransactions();
                t.id = Date.now();
                trans.push(t);
                this.save('transactions', trans);
            },
            addHabit(h) {
                const habits = this.getHabits();
                h.id = Date.now();
                h.logs = [];
                h.streak = 0;
                habits.push(h);
                this.save('habits', habits);
            }
        };

        // Finance Manager
        class FinanceManager {
            getAllTransactions() { return storage.getTransactions(); }
            addTransaction(t) { storage.addTransaction(t); }
            getTotalBalance() {
                const trans = this.getAllTransactions();
                return trans.reduce((sum, t) => t.type === 'income' ? sum + t.amount : sum - t.amount, 0);
            }
            getTotalIncome() {
                return this.getAllTransactions()
                    .filter(t => t.type === 'income')
                    .reduce((sum, t) => sum + t.amount, 0);
            }
            getTotalExpenses() {
                return this.getAllTransactions()
                    .filter(t => t.type === 'expense')
                    .reduce((sum, t) => sum + t.amount, 0);
            }
            getSpendingByCategory() {
                const spending = {};
                this.getAllTransactions()
                    .filter(t => t.type === 'expense')
                    .forEach(t => {
                        spending[t.category] = (spending[t.category] || 0) + t.amount;
                    });
                return spending;
            }
            getRecentTransactions(limit = 10) {
                return this.getAllTransactions().slice(-limit).reverse();
            }
            getTransactionCount() { return this.getAllTransactions().length; }
        }

        // Habits Manager
        class HabitsManager {
            getAllHabits() { return storage.getHabits(); }
            addHabit(name, description, frequency) {
                storage.addHabit({ name, description, frequency });
            }
            getActiveHabits() { return this.getAllHabits().filter(h => h.logs.length > 0); }
            logHabitCompletion(habitId) {
                const habits = this.getAllHabits();
                const habit = habits.find(h => h.id === habitId);
                if (habit) {
                    const today = new Date().toISOString().split('T')[0];
                    if (!habit.logs.includes(today)) {
                        habit.logs.push(today);
                        habit.streak = (habit.streak || 0) + 1;
                        storage.save('habits', habits);
                    }
                }
            }
            isLoggedToday(habitId) {
                const habit = this.getAllHabits().find(h => h.id === habitId);
                const today = new Date().toISOString().split('T')[0];
                return habit && habit.logs.includes(today);
            }
        }

        // AI Advisor
        class AIAdvisor {
            getFinancialHealthScore() {
                const fm = new FinanceManager();
                const balance = fm.getTotalBalance();
                const income = fm.getTotalIncome();
                const expenses = fm.getTotalExpenses();
                let score = 0;
                if (balance > 0) score += 25;
                if (income > expenses) score += 25;
                if (fm.getTransactionCount() > 20) score += 25;
                if (new HabitsManager().getActiveHabits().length > 0) score += 25;
                return score;
            }
            getOfflineResponse(q) {
                const lowerQ = q.toLowerCase();
                if (lowerQ.includes('budget')) return 'Consider the 50/30/20 rule: 50% needs, 30% wants, 20% savings.';
                if (lowerQ.includes('save')) return 'Build an emergency fund with 3-6 months of expenses first.';
                if (lowerQ.includes('invest')) return 'Start by understanding risk tolerance and diversification.';
                return 'Track your spending, set goals, and review monthly for best results!';
            }
        }

        // Initialize managers
        const financeManager = new FinanceManager();
        const habitsManager = new HabitsManager();
        const aiAdvisor = new AIAdvisor();

        // Main App
        class LifeTrackApp {
            constructor() {
                this.setupEventListeners();
                this.updateDashboard();
            }

            setupEventListeners() {
                document.querySelectorAll('[data-nav]').forEach(el => {
                    el.addEventListener('click', (e) => this.navigateTo(e.target.dataset.nav));
                });

                document.getElementById('transactionForm').addEventListener('submit', (e) => {
                    e.preventDefault();
                    const form = e.target;
                    financeManager.addTransaction({
                        description: form.description.value,
                        amount: parseFloat(form.amount.value),
                        category: form.category.value,
                        type: form.type.value,
                        date: form.date.value || new Date().toISOString().split('T')[0]
                    });
                    form.reset();
                    this.showNotification('Transaction added! 💰', 'success');
                    this.updateDashboard();
                });

                document.getElementById('habitForm').addEventListener('submit', (e) => {
                    e.preventDefault();
                    const form = e.target;
                    habitsManager.addHabit(form.habitName.value, form.habitDescription.value, form.frequency.value);
                    form.reset();
                    this.showNotification('Habit added! 🎯', 'success');
                    this.updateDashboard();
                });

                document.getElementById('aiChatForm').addEventListener('submit', (e) => {
                    e.preventDefault();
                    const q = e.target.question.value;
                    const response = aiAdvisor.getOfflineResponse(q);
                    const chatEl = document.getElementById('aiChatContainer');
                    chatEl.innerHTML += `<div style="margin: 1rem 0;"><strong>You:</strong> ${q}</div><div style="margin: 1rem 0; padding: 1rem; background: #334155; border-radius: 8px;"><strong>Advisor:</strong> ${response}</div>`;
                    e.target.reset();
                    chatEl.scrollTop = chatEl.scrollHeight;
                });

                document.getElementById('downloadDataBtn').addEventListener('click', () => this.downloadData());
            }

            updateDashboard() {
                document.getElementById('totalBalance').textContent = `$${financeManager.getTotalBalance().toFixed(2)}`;
                document.getElementById('totalIncome').textContent = `$${financeManager.getTotalIncome().toFixed(2)}`;
                document.getElementById('totalExpenses').textContent = `$${financeManager.getTotalExpenses().toFixed(2)}`;
                document.getElementById('financialHealth').textContent = `${aiAdvisor.getFinancialHealthScore()}/100`;

                const recentTrans = document.getElementById('recentTransactions');
                recentTrans.innerHTML = '';
                financeManager.getRecentTransactions(5).forEach(t => {
                    recentTrans.innerHTML += `<div style="padding: 0.5rem; border-bottom: 1px solid #334155;"><strong>${t.description}</strong> - ${t.type === 'income' ? '+' : '-'}$${t.amount.toFixed(2)}</div>`;
                });

                const activeHabits = document.getElementById('activeHabits');
                activeHabits.innerHTML = '';
                habitsManager.getActiveHabits().forEach(h => {
                    const logged = habitsManager.isLoggedToday(h.id);
                    activeHabits.innerHTML += `<div style="padding: 0.5rem; border-bottom: 1px solid #334155;"><strong>${h.name}</strong> 🔥 ${h.streak || 0} days <button class="btn btn-primary" style="float: right;" onclick="habitsManager.logHabitCompletion(${h.id}); app.updateDashboard();">${logged ? '✓' : 'Log'}</button></div>`;
                });
            }

            navigateTo(page) {
                document.querySelectorAll('[data-page]').forEach(el => el.style.display = 'none');
                document.querySelector(\`[data-page="\${page}"]\`).style.display = 'block';
            }

            downloadData() {
                const data = {
                    transactions: financeManager.getAllTransactions(),
                    habits: habitsManager.getAllHabits()
                };
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = \`lifetrack-\${new Date().toISOString().split('T')[0]}.json\`;
                a.click();
                this.showNotification('Data downloaded! 📊', 'success');
            }

            showNotification(msg, type) {
                const notif = document.getElementById('notification');
                notif.textContent = msg;
                notif.className = \`notification \${type}\`;
                notif.style.display = 'block';
                setTimeout(() => notif.style.display = 'none', 3000);
            }
        }

        const app = new LifeTrackApp();
    </script>
</body>
</html>
            `;

            const blob = new Blob([allContent], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `LifeTrack-Standalone-${new Date().toISOString().split('T')[0]}.html`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            this.showNotification('App downloaded! You can now use it offline 🚀', 'success');
        } catch (error) {
            console.error('Error downloading app:', error);
            this.showNotification('Error downloading app', 'error');
        }
    }

    // Get app files content
    getAppHTML() { return document.documentElement.outerHTML; }
    getAppCSS() { return 'app-styles'; }
    getAppJS() { return 'app-code'; }
    getFinanceJS() { return 'finance-code'; }
    getHabitsJS() { return 'habits-code'; }
    getAIAdvisorJS() { return 'ai-code'; }
    getChartsJS() { return 'charts-code'; }

    // Show notification
    showNotification(message, type = 'info') {
        const notificationEl = document.getElementById('notification');
        if (!notificationEl) return;

        notificationEl.textContent = message;
        notificationEl.className = `notification ${type}`;
        notificationEl.style.display = 'block';

        setTimeout(() => {
            notificationEl.style.display = 'none';
        }, 3000);
    }

    // Handle online/offline
    handleOnline() {
        this.isOnline = true;
        this.showNotification('You\'re back online! 🌐', 'success');
    }

    handleOffline() {
        this.isOnline = false;
        this.showNotification('You\'re offline. Using cached data. 📡', 'info');
    }

    // Check for updates
    checkForUpdates() {
        // Implement update checking logic
        console.log('Checking for updates...');
    }

    // Setup offline support
    setupDownloadFeatures() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('sw.js').catch(err => {
                console.log('Service Worker registration failed:', err);
            });
        }
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new LifeTrackApp();
});
