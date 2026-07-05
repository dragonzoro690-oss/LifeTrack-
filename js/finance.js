// Finance Management
class FinanceManager {
    constructor() {
        this.transactions = storage.getTransactions();
        this.categories = ['food', 'transport', 'utilities', 'entertainment', 'health', 'shopping', 'income', 'other'];
    }

    // Add new transaction
    addTransaction(description, amount, category, type, date) {
        const transaction = {
            description,
            amount: parseFloat(amount),
            category,
            type, // 'income' or 'expense'
            date
        };
        
        storage.addTransaction(transaction);
        this.transactions = storage.getTransactions();
        return transaction;
    }

    // Delete transaction
    deleteTransaction(id) {
        storage.deleteTransaction(id);
        this.transactions = storage.getTransactions();
    }

    // Get all transactions
    getAllTransactions() {
        return storage.getTransactions();
    }

    // Get transactions by type
    getTransactionsByType(type) {
        return this.transactions.filter(t => t.type === type);
    }

    // Get transactions by date range
    getTransactionsByDateRange(startDate, endDate) {
        return this.transactions.filter(t => {
            const tDate = new Date(t.date);
            return tDate >= new Date(startDate) && tDate <= new Date(endDate);
        });
    }

    // Get transactions by category
    getTransactionsByCategory(category) {
        return this.transactions.filter(t => t.category === category);
    }

    // Calculate total balance
    getTotalBalance() {
        const income = this.transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
        
        const expenses = this.transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
        
        return income - expenses;
    }

    // Get total income
    getTotalIncome() {
        return this.transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
    }

    // Get total expenses
    getTotalExpenses() {
        return this.transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
    }

    // Get monthly balance
    getMonthlyBalance(year, month) {
        const startDate = new Date(year, month, 1);
        const endDate = new Date(year, month + 1, 0);
        
        return this.getTransactionsByDateRange(startDate, endDate);
    }

    // Get spending by category
    getSpendingByCategory() {
        const spending = {};
        
        this.transactions
            .filter(t => t.type === 'expense')
            .forEach(t => {
                if (!spending[t.category]) {
                    spending[t.category] = 0;
                }
                spending[t.category] += t.amount;
            });
        
        return spending;
    }

    // Get category statistics
    getCategoryStats() {
        const stats = {};
        
        this.categories.forEach(category => {
            const categoryTransactions = this.getTransactionsByCategory(category);
            stats[category] = {
                count: categoryTransactions.length,
                total: categoryTransactions.reduce((sum, t) => sum + t.amount, 0),
                average: categoryTransactions.length > 0 
                    ? categoryTransactions.reduce((sum, t) => sum + t.amount, 0) / categoryTransactions.length 
                    : 0
            };
        });
        
        return stats;
    }

    // Get transaction count
    getTransactionCount() {
        return this.transactions.length;
    }

    // Get monthly trends
    getMonthlyTrends(months = 6) {
        const trends = {};
        const today = new Date();
        
        for (let i = months - 1; i >= 0; i--) {
            const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const monthKey = date.toISOString().slice(0, 7); // YYYY-MM
            const monthTransactions = this.transactions.filter(t => t.date.startsWith(monthKey));
            
            const income = monthTransactions
                .filter(t => t.type === 'income')
                .reduce((sum, t) => sum + t.amount, 0);
            
            const expenses = monthTransactions
                .filter(t => t.type === 'expense')
                .reduce((sum, t) => sum + t.amount, 0);
            
            trends[monthKey] = {
                income,
                expenses,
                balance: income - expenses
            };
        }
        
        return trends;
    }

    // Get financial insights
    getInsights() {
        const totalBalance = this.getTotalBalance();
        const totalIncome = this.getTotalIncome();
        const totalExpenses = this.getTotalExpenses();
        const spendingByCategory = this.getSpendingByCategory();
        
        const maxCategory = Object.entries(spendingByCategory).sort((a, b) => b[1] - a[1])[0];
        const savingsRate = totalIncome > 0 ? ((totalBalance / totalIncome) * 100).toFixed(2) : 0;
        
        const insights = [];
        
        if (totalBalance > 0) {
            insights.push(`Great! You have a positive balance of $${totalBalance.toFixed(2)}`);
        } else if (totalBalance < 0) {
            insights.push(`You're spending more than earning. Current deficit: $${Math.abs(totalBalance).toFixed(2)}`);
        }
        
        if (maxCategory) {
            insights.push(`Your highest spending category is ${maxCategory[0]} at $${maxCategory[1].toFixed(2)}`);
        }
        
        insights.push(`Your savings rate is ${savingsRate}%`);
        
        const avgMonthlyExpense = totalExpenses / Math.max(this.getMonthlyTrends(6).length, 1);
        insights.push(`Average monthly expense: $${avgMonthlyExpense.toFixed(2)}`);
        
        return insights;
    }

    // Format currency
    formatCurrency(amount, currency = 'USD') {
        const formatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
        });
        return formatter.format(amount);
    }

    // Get recent transactions
    getRecentTransactions(limit = 10) {
        return this.transactions.slice(-limit).reverse();
    }
}

// Create global finance manager instance
const financeManager = new FinanceManager();
