// Local Storage Management
class Storage {
    constructor() {
        this.prefix = 'lifetrack_';
    }

    // Save data to localStorage
    save(key, data) {
        try {
            localStorage.setItem(this.prefix + key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Storage save error:', error);
            return false;
        }
    }

    // Get data from localStorage
    get(key, defaultValue = null) {
        try {
            const data = localStorage.getItem(this.prefix + key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (error) {
            console.error('Storage get error:', error);
            return defaultValue;
        }
    }

    // Remove specific data
    remove(key) {
        try {
            localStorage.removeItem(this.prefix + key);
            return true;
        } catch (error) {
            console.error('Storage remove error:', error);
            return false;
        }
    }

    // Clear all LifeTrack data
    clearAll() {
        try {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith(this.prefix)) {
                    localStorage.removeItem(key);
                }
            });
            return true;
        } catch (error) {
            console.error('Storage clear error:', error);
            return false;
        }
    }

    // Export all data
    exportAll() {
        try {
            const data = {};
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith(this.prefix)) {
                    const cleanKey = key.replace(this.prefix, '');
                    data[cleanKey] = this.get(cleanKey);
                }
            });
            return data;
        } catch (error) {
            console.error('Storage export error:', error);
            return {};
        }
    }

    // Import data
    importAll(data) {
        try {
            Object.keys(data).forEach(key => {
                this.save(key, data[key]);
            });
            return true;
        } catch (error) {
            console.error('Storage import error:', error);
            return false;
        }
    }

    // Get all transactions
    getTransactions() {
        return this.get('transactions', []);
    }

    // Save transactions
    saveTransactions(transactions) {
        return this.save('transactions', transactions);
    }

    // Add transaction
    addTransaction(transaction) {
        const transactions = this.getTransactions();
        transaction.id = Date.now().toString();
        transaction.createdAt = new Date().toISOString();
        transactions.push(transaction);
        this.saveTransactions(transactions);
        return transaction;
    }

    // Delete transaction
    deleteTransaction(id) {
        const transactions = this.getTransactions();
        const filtered = transactions.filter(t => t.id !== id);
        this.saveTransactions(filtered);
        return filtered;
    }

    // Get all habits
    getHabits() {
        return this.get('habits', []);
    }

    // Save habits
    saveHabits(habits) {
        return this.save('habits', habits);
    }

    // Add habit
    addHabit(habit) {
        const habits = this.getHabits();
        habit.id = Date.now().toString();
        habit.createdAt = new Date().toISOString();
        habit.streak = 0;
        habit.lastChecked = null;
        habit.logs = [];
        habits.push(habit);
        this.saveHabits(habits);
        return habit;
    }

    // Delete habit
    deleteHabit(id) {
        const habits = this.getHabits();
        const filtered = habits.filter(h => h.id !== id);
        this.saveHabits(filtered);
        return filtered;
    }

    // Log habit completion
    logHabitCompletion(habitId, date = new Date().toISOString().split('T')[0]) {
        const habits = this.getHabits();
        const habit = habits.find(h => h.id === habitId);
        
        if (!habit) return null;

        // Initialize logs array if it doesn't exist
        if (!habit.logs) {
            habit.logs = [];
        }

        // Check if already logged today
        if (!habit.logs.includes(date)) {
            habit.logs.push(date);
            habit.lastChecked = date;
            
            // Update streak
            const today = new Date(date);
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];
            
            if (habit.logs.includes(yesterdayStr) || habit.logs.length === 1) {
                habit.streak = (habit.streak || 0) + 1;
            } else {
                habit.streak = 1;
            }
        }

        this.saveHabits(habits);
        return habit;
    }

    // Get habit by ID
    getHabit(id) {
        const habits = this.getHabits();
        return habits.find(h => h.id === id);
    }

    // Get settings
    getSettings() {
        return this.get('settings', {
            currency: 'USD',
            darkMode: true,
            notifications: true
        });
    }

    // Save settings
    saveSettings(settings) {
        return this.save('settings', settings);
    }

    // Get AI chat history
    getAIChatHistory() {
        return this.get('ai_chat_history', []);
    }

    // Add AI message
    addAIMessage(message, response) {
        const history = this.getAIChatHistory();
        history.push({
            id: Date.now().toString(),
            question: message,
            answer: response,
            timestamp: new Date().toISOString()
        });
        this.save('ai_chat_history', history);
        return history;
    }

    // Clear AI history
    clearAIHistory() {
        return this.save('ai_chat_history', []);
    }
}

// Create global storage instance
const storage = new Storage();
