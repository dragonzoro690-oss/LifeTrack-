// AI Advisor Module
class AIAdvisor {
    constructor() {
        this.chatHistory = storage.getAIChatHistory();
        this.apiKey = null; // Set your API key here or load from settings
        this.model = 'gpt-3.5-turbo'; // or 'gpt-4' for more advanced insights
    }

    // Initialize with API key
    setAPIKey(apiKey) {
        this.apiKey = apiKey;
        storage.save('ai_api_key', apiKey);
    }

    // Get stored API key
    getAPIKey() {
        return storage.get('ai_api_key', null);
    }

    // Generate financial analysis based on user's data
    async generateFinancialAnalysis() {
        const transactions = financeManager.getAllTransactions();
        const habits = habitsManager.getAllHabits();
        const insights = financeManager.getInsights();
        const balance = financeManager.getTotalBalance();
        const income = financeManager.getTotalIncome();
        const expenses = financeManager.getTotalExpenses();
        const spending = financeManager.getSpendingByCategory();

        const prompt = `As a financial advisor, analyze the following financial data and provide thoughtful suggestions (not orders) for improvement:

Financial Summary:
- Total Balance: $${balance.toFixed(2)}
- Total Income: $${income.toFixed(2)}
- Total Expenses: $${expenses.toFixed(2)}
- Spending by Category: ${JSON.stringify(spending)}

Current Insights:
${insights.map(i => `- ${i}`).join('\n')}

Habits Being Tracked: ${habits.length} habits

Please provide:
1. A brief assessment of their financial health
2. Specific, actionable suggestions for improving their financial situation
3. Areas where they're doing well
4. Recommendations on how habits can impact their finances
5. Suggestions for better expense management

Remember to frame all advice as suggestions, not orders. Be encouraging and supportive.`;

        try {
            const response = await this.callAI(prompt);
            return response;
        } catch (error) {
            console.error('Error generating financial analysis:', error);
            return this.getOfflineFinancialAnalysis(insights, balance, expenses);
        }
    }

    // Offline financial analysis (when API is unavailable)
    getOfflineFinancialAnalysis(insights, balance, expenses) {
        let analysis = "## Financial Health Assessment\n\n";
        
        if (balance > 0) {
            analysis += `✅ **Positive Balance**: You're maintaining a surplus of $${Math.abs(balance).toFixed(2)}. This suggests you're spending less than you earn - great job!\n\n`;
        } else if (balance < 0) {
            analysis += `⚠️ **Deficit Alert**: Your current deficit is $${Math.abs(balance).toFixed(2)}. Consider reviewing your spending patterns to bring income and expenses into balance.\n\n`;
        } else {
            analysis += `📊 **Breaking Even**: Your income and expenses are balanced. Consider aiming for a small surplus for emergency savings.\n\n`;
        }

        analysis += "## Suggestions for Financial Improvement\n\n";
        analysis += "1. **Build an Emergency Fund**: Consider setting aside 3-6 months of expenses as an emergency cushion\n";
        analysis += "2. **Track Expenses Regularly**: Keep recording transactions - awareness is the first step to better finances\n";
        analysis += "3. **Set Spending Goals**: By category, you can better control where your money goes\n";
        analysis += "4. **Link Habits to Finances**: Positive habits (like cooking at home vs. eating out) directly improve your bottom line\n";
        analysis += "5. **Review Monthly**: Schedule a monthly review to assess progress and adjust strategies\n\n";

        analysis += "## Areas of Strength\n";
        insights.forEach(insight => {
            if (insight.includes("positive") || insight.includes("Great")) {
                analysis += `✨ ${insight}\n`;
            }
        });

        return analysis;
    }

    // Generate investment suggestions based on financial data
    async generateInvestmentSuggestions() {
        const balance = financeManager.getTotalBalance();
        const income = financeManager.getTotalIncome();
        const expenses = financeManager.getTotalExpenses();
        const savingsRate = income > 0 ? ((balance / income) * 100).toFixed(2) : 0;

        const prompt = `As an investment advisor, provide suggestions (not recommendations to act immediately) for investment strategies based on this financial profile:

Financial Profile:
- Current Balance: $${balance.toFixed(2)}
- Monthly Income: $${(income / 12).toFixed(2)} (estimated)
- Monthly Expenses: $${(expenses / 12).toFixed(2)} (estimated)
- Savings Rate: ${savingsRate}%

Please provide:
1. Assessment of readiness for investing
2. Suggestions for emergency fund establishment (if not already done)
3. General investment categories to explore (stocks, bonds, index funds, ETFs, real estate, etc.)
4. Risk tolerance suggestions based on their savings rate
5. Diversification suggestions
6. Long-term wealth building strategies
7. Resources for learning more about investments

Frame all suggestions as options to explore and educate yourself on, not as direct financial advice. Emphasize the importance of personal research and possibly consulting with a certified financial advisor for personalized guidance.

Note: I cannot provide real-time stock prices or market data, but I can provide general investment education and strategies.`;

        try {
            const response = await this.callAI(prompt);
            return response;
        } catch (error) {
            console.error('Error generating investment suggestions:', error);
            return this.getOfflineInvestmentSuggestions(balance, savingsRate);
        }
    }

    // Offline investment suggestions
    getOfflineInvestmentSuggestions(balance, savingsRate) {
        let suggestions = "## Investment Exploration Guide\n\n";

        if (balance < 1000) {
            suggestions += "### Current Stage: Building Foundation\n";
            suggestions += "Before investing, consider building an emergency fund of 3-6 months of expenses. This provides stability for exploring investment opportunities.\n\n";
        } else if (balance < 5000) {
            suggestions += "### Current Stage: Early Investor\n";
            suggestions += "You have a foundation to start exploring investment options. Consider starting with lower-risk options.\n\n";
        } else {
            suggestions += "### Current Stage: Ready to Diversify\n";
            suggestions += "You have sufficient capital to explore diverse investment options.\n\n";
        }

        suggestions += "## General Investment Education Topics to Explore\n\n";
        suggestions += "1. **Stock Market Basics**\n";
        suggestions += "   - Individual stocks vs. ETFs vs. Index Funds\n";
        suggestions += "   - Risk and return relationship\n";
        suggestions += "   - Long-term growth potential\n\n";

        suggestions += "2. **Bonds and Fixed Income**\n";
        suggestions += "   - Government bonds\n";
        suggestions += "   - Corporate bonds\n";
        suggestions += "   - Lower risk, modest returns\n\n";

        suggestions += "3. **Diversification Strategy**\n";
        suggestions += "   - Spreading investments across asset classes\n";
        suggestions += "   - Reducing overall risk\n";
        suggestions += "   - Common allocation models\n\n";

        suggestions += "4. **Retirement Planning**\n";
        suggestions += "   - 401(k) or IRA accounts\n";
        suggestions += "   - Employer matching benefits\n";
        suggestions += "   - Long-term tax advantages\n\n";

        suggestions += "5. **Real Estate Considerations**\n";
        suggestions += "   - Real estate investment trusts (REITs)\n";
        suggestions += "   - Property investment basics\n";
        suggestions += "   - Rental income potential\n\n";

        suggestions += "## Next Steps\n";
        suggestions += "- Research reputable financial education resources\n";
        suggestions += "- Consider reading books on personal finance and investing\n";
        suggestions += "- If investing larger amounts, consult with a certified financial advisor\n";
        suggestions += "- Start with paper trading (simulated investing) to learn without risk\n";

        return suggestions;
    }

    // Answer custom financial questions
    async askQuestion(question) {
        const transactions = financeManager.getAllTransactions();
        const habits = habitsManager.getAllHabits();
        const balance = financeManager.getTotalBalance();
        const income = financeManager.getTotalIncome();
        const expenses = financeManager.getTotalExpenses();

        const prompt = `You are a knowledgeable personal finance advisor. Your role is to provide thoughtful suggestions and educational information about money management, not to give definitive financial advice.

User's Financial Context:
- Current Balance: $${balance.toFixed(2)}
- Total Income: $${income.toFixed(2)}
- Total Expenses: $${expenses.toFixed(2)}
- Active Habits: ${habits.length}
- Total Transactions: ${transactions.length}

User's Question: ${question}

Please respond with:
1. Relevant suggestions and guidance based on their situation
2. General principles they should consider
3. Options to explore
4. Educational resources or topics to learn about
5. A note that for specific financial decisions, they should consult with qualified professionals

Frame everything as suggestions and educational guidance, not as orders or guaranteed advice.`;

        try {
            const response = await this.callAI(prompt);
            storage.addAIMessage(question, response);
            this.chatHistory = storage.getAIChatHistory();
            return response;
        } catch (error) {
            console.error('Error asking question:', error);
            return this.getOfflineResponse(question);
        }
    }

    // Offline response when API is unavailable
    getOfflineResponse(question) {
        const lowerQuestion = question.toLowerCase();
        let response = "";

        if (lowerQuestion.includes("budget") || lowerQuestion.includes("spending")) {
            response = "## Budgeting Suggestions\n\n";
            response += "Consider these budgeting strategies:\n";
            response += "1. **50/30/20 Rule**: 50% needs, 30% wants, 20% savings/debt\n";
            response += "2. **Zero-Based Budgeting**: Every dollar has a purpose\n";
            response += "3. **Track by Category**: See where money naturally goes\n";
            response += "4. **Adjust Monthly**: Budget is a living tool, refine it as needed\n";
        } else if (lowerQuestion.includes("save") || lowerQuestion.includes("savings")) {
            response = "## Savings Strategies\n\n";
            response += "1. **Automate Savings**: Set up automatic transfers after payday\n";
            response += "2. **Emergency Fund First**: 3-6 months of expenses\n";
            response += "3. **High-Yield Options**: Research high-yield savings accounts\n";
            response += "4. **Goal-Based Saving**: Allocate savings for specific goals\n";
        } else if (lowerQuestion.includes("debt")) {
            response = "## Debt Management Suggestions\n\n";
            response += "1. **Avalanche Method**: Pay highest interest debt first\n";
            response += "2. **Snowball Method**: Pay smallest balances first (psychological wins)\n";
            response += "3. **Consolidation**: Consider consolidating high-interest debts\n";
            response += "4. **Negotiate**: Contact creditors to negotiate lower rates\n";
        } else if (lowerQuestion.includes("invest")) {
            response = "## Investment Education\n\n";
            response += "Before investing, explore these concepts:\n";
            response += "1. **Risk Tolerance**: Understand your comfort with volatility\n";
            response += "2. **Time Horizon**: Longer timelines allow for riskier investments\n";
            response += "3. **Diversification**: Don't put all eggs in one basket\n";
            response += "4. **Start Small**: Consider dollar-cost averaging into investments\n";
        } else if (lowerQuestion.includes("income")) {
            response = "## Income Growth Suggestions\n\n";
            response += "1. **Skill Development**: Invest in skills relevant to your field\n";
            response += "2. **Side Hustle**: Explore additional income streams\n";
            response += "3. **Negotiation**: Research fair wages and negotiate raises\n";
            response += "4. **Career Path**: Plan your career progression\n";
        } else {
            response = "## General Financial Wellness\n\n";
            response += "1. **Track Everything**: Understanding spending is the foundation\n";
            response += "2. **Set Goals**: What does financial success look like to you?\n";
            response += "3. **Educate Yourself**: Learn money management fundamentals\n";
            response += "4. **Review Regularly**: Monthly check-ins help maintain progress\n";
            response += "5. **Stay Disciplined**: Financial success is a marathon, not a sprint\n";
        }

        response += "\n\n*Note: This is general educational guidance based on your question. For personalized financial advice, consider consulting with a qualified financial professional.*";

        return response;
    }

    // Call OpenAI API or similar
    async callAI(prompt) {
        const apiKey = this.getAPIKey();
        
        if (!apiKey) {
            throw new Error('API key not configured');
        }

        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: this.model,
                    messages: [
                        {
                            role: 'system',
                            content: 'You are a knowledgeable and supportive personal finance advisor. You provide educational guidance and suggestions, framing everything as options to explore rather than orders. You emphasize the importance of personal research and professional consultation for major financial decisions.'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 1500
                })
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const data = await response.json();
            return data.choices[0].message.content;
        } catch (error) {
            console.error('AI API error:', error);
            throw error;
        }
    }

    // Get chat history
    getChatHistory() {
        return storage.getAIChatHistory();
    }

    // Clear chat history
    clearChatHistory() {
        storage.clearAIHistory();
        this.chatHistory = [];
    }

    // Get money management tips
    getMoneyManagementTips() {
        const tips = [
            {
                title: "The 50/30/20 Budget Rule",
                description: "Allocate 50% of after-tax income to needs, 30% to wants, and 20% to savings and debt repayment."
            },
            {
                title: "Emergency Fund Importance",
                description: "Build an emergency fund with 3-6 months of expenses to handle unexpected situations without debt."
            },
            {
                title: "Pay Yourself First",
                description: "Automate savings transfers immediately after receiving income to prioritize saving."
            },
            {
                title: "Track Every Expense",
                description: "Understanding where your money goes is the first step to better financial decisions."
            },
            {
                title: "Avoid Lifestyle Inflation",
                description: "When income increases, don't automatically increase spending. Redirect extra income to savings."
            },
            {
                title: "Understand Compound Interest",
                description: "Start investing early to benefit from compound growth over time."
            },
            {
                title: "Diversify Your Investments",
                description: "Spread investments across different asset classes to reduce risk."
            },
            {
                title: "Review and Adjust Monthly",
                description: "Regular financial check-ins help you stay on track and make timely adjustments."
            }
        ];
        return tips;
    }

    // Get financial health score
    getFinancialHealthScore() {
        const balance = financeManager.getTotalBalance();
        const income = financeManager.getTotalIncome();
        const expenses = financeManager.getTotalExpenses();
        const habits = habitsManager.getActiveHabits().length;
        let score = 0;

        // Balance score (0-25)
        if (balance > 0) score += 15;
        if (balance > (income * 0.5)) score += 10;

        // Income vs Expenses (0-25)
        const ratio = income / Math.max(expenses, 1);
        if (ratio > 1.2) score += 25;
        else if (ratio > 1) score += 20;
        else if (ratio > 0.8) score += 10;

        // Habit tracking (0-20)
        if (habits > 0) score += 10;
        if (habits > 3) score += 10;

        // Transaction tracking (0-30)
        const transactions = financeManager.getTransactionCount();
        if (transactions > 0) score += 10;
        if (transactions > 20) score += 10;
        if (transactions > 50) score += 10;

        return Math.min(score, 100);
    }
}

// Create global AI advisor instance
const aiAdvisor = new AIAdvisor();
