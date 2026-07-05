// Habits Management
class HabitsManager {
    constructor() {
        this.habits = storage.getHabits();
    }

    // Add new habit
    addHabit(name, description, frequency) {
        const habit = {
            name,
            description,
            frequency, // 'daily', 'weekly', 'monthly'
            streak: 0,
            lastChecked: null,
            logs: []
        };
        
        storage.addHabit(habit);
        this.habits = storage.getHabits();
        return habit;
    }

    // Delete habit
    deleteHabit(id) {
        storage.deleteHabit(id);
        this.habits = storage.getHabits();
    }

    // Get all habits
    getAllHabits() {
        return storage.getHabits();
    }

    // Get habit by ID
    getHabit(id) {
        return storage.getHabit(id);
    }

    // Log habit completion
    logHabitCompletion(habitId, date = new Date().toISOString().split('T')[0]) {
        const habit = storage.logHabitCompletion(habitId, date);
        this.habits = storage.getHabits();
        return habit;
    }

    // Get habit streak
    getHabitStreak(id) {
        const habit = this.getHabit(id);
        return habit ? habit.streak : 0;
    }

    // Check if habit was logged today
    isLoggedToday(id) {
        const today = new Date().toISOString().split('T')[0];
        const habit = this.getHabit(id);
        return habit && habit.logs && habit.logs.includes(today);
    }

    // Get habits by frequency
    getHabitsByFrequency(frequency) {
        return this.habits.filter(h => h.frequency === frequency);
    }

    // Get all active habits (with logs)
    getActiveHabits() {
        return this.habits.filter(h => h.logs && h.logs.length > 0);
    }

    // Get completed habits today
    getCompletedToday() {
        const today = new Date().toISOString().split('T')[0];
        return this.habits.filter(h => h.logs && h.logs.includes(today));
    }

    // Get habit completion rate for a date range
    getCompletionRate(habitId, startDate, endDate) {
        const habit = this.getHabit(habitId);
        if (!habit || !habit.logs) return 0;

        let expectedDays = 0;
        let completedDays = 0;

        const current = new Date(startDate);
        const end = new Date(endDate);

        while (current <= end) {
            const dateStr = current.toISOString().split('T')[0];
            expectedDays++;
            
            if (habit.logs.includes(dateStr)) {
                completedDays++;
            }
            
            current.setDate(current.getDate() + 1);
        }

        return expectedDays > 0 ? (completedDays / expectedDays) * 100 : 0;
    }

    // Get all habits statistics
    getAllHabitsStats() {
        const stats = {};
        
        this.habits.forEach(habit => {
            stats[habit.id] = {
                name: habit.name,
                streak: habit.streak || 0,
                totalCompletions: habit.logs ? habit.logs.length : 0,
                frequency: habit.frequency,
                lastChecked: habit.lastChecked
            };
        });
        
        return stats;
    }

    // Get habit insights
    getInsights() {
        const completedToday = this.getCompletedToday().length;
        const totalHabits = this.habits.length;
        const activeHabits = this.getActiveHabits().length;
        
        let maxStreak = 0;
        let maxStreakHabit = null;
        
        this.habits.forEach(habit => {
            if (habit.streak > maxStreak) {
                maxStreak = habit.streak;
                maxStreakHabit = habit.name;
            }
        });

        const insights = [];

        if (totalHabits === 0) {
            insights.push("Start by creating your first habit!");
        } else {
            insights.push(`You're tracking ${totalHabits} habits total`);
            insights.push(`${activeHabits} habit${activeHabits !== 1 ? 's have' : ' has'} been logged`);
            insights.push(`${completedToday}/${totalHabits} habits completed today`);
            
            if (maxStreakHabit) {
                insights.push(`Your longest streak is ${maxStreak} days with "${maxStreakHabit}"`);
            }
        }

        return insights;
    }

    // Get weekly summary
    getWeeklySummary() {
        const today = new Date();
        const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);

        const summary = {};

        this.habits.forEach(habit => {
            let completions = 0;
            if (habit.logs) {
                for (let i = 0; i < 7; i++) {
                    const date = new Date(weekStart);
                    date.setDate(date.getDate() + i);
                    const dateStr = date.toISOString().split('T')[0];
                    if (habit.logs.includes(dateStr)) {
                        completions++;
                    }
                }
            }
            
            summary[habit.id] = {
                name: habit.name,
                completions: completions,
                percentage: (completions / 7) * 100
            };
        });

        return summary;
    }

    // Get monthly summary
    getMonthlySummary(year, month) {
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const summary = {};

        this.habits.forEach(habit => {
            let completions = 0;
            if (habit.logs) {
                for (let day = 1; day <= daysInMonth; day++) {
                    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    if (habit.logs.includes(dateStr)) {
                        completions++;
                    }
                }
            }
            
            summary[habit.id] = {
                name: habit.name,
                completions: completions,
                percentage: (completions / daysInMonth) * 100
            };
        });

        return summary;
    }

    // Get habit completion data for charts
    getHabitChartData(habitId, days = 30) {
        const habit = this.getHabit(habitId);
        if (!habit) return null;

        const data = {
            labels: [],
            completed: []
        };

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            
            data.labels.push(dateStr);
            data.completed.push(habit.logs && habit.logs.includes(dateStr) ? 1 : 0);
        }

        return data;
    }

    // Remove habit log for a specific date
    removeHabitLog(habitId, date) {
        const habit = storage.getHabit(habitId);
        if (!habit || !habit.logs) return null;

        habit.logs = habit.logs.filter(log => log !== date);
        
        const habits = storage.getHabits();
        const index = habits.findIndex(h => h.id === habitId);
        if (index !== -1) {
            habits[index] = habit;
            storage.saveHabits(habits);
            this.habits = storage.getHabits();
        }

        return habit;
    }

    // Update habit
    updateHabit(habitId, updates) {
        const habits = storage.getHabits();
        const habitIndex = habits.findIndex(h => h.id === habitId);
        
        if (habitIndex !== -1) {
            habits[habitIndex] = { ...habits[habitIndex], ...updates };
            storage.saveHabits(habits);
            this.habits = storage.getHabits();
            return habits[habitIndex];
        }

        return null;
    }
}

// Create global habits manager instance
const habitsManager = new HabitsManager();
