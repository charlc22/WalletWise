// ml/engines/insightsGenerator.js
// Personalized Financial Insights and Recommendations Generator

class InsightsGenerator {
    constructor() {
        this.insightTemplates = {
            spending: [
                'You spent ${amount} more on {category} this month compared to last month.',
                'Your {category} spending has increased by {percent}% over the last {period}.',
                'You\'re spending {percent}% of your income on {category}.',
            ],
            savings: [
                'Great job! You saved ${amount} this month.',
                'Your savings rate of {percent}% is {comparison} the recommended 15-20%.',
                'You could save an additional ${amount} by reducing {category} spending by {percent}%.'
            ],
            trends: [
                'Your {category} spending is trending {direction}.',
                'You\'ve spent ${amount} on average per month on {category} over the last {period}.',
                'Your most consistent expense category is {category}.'
            ],
            alerts: [
                'Warning: You\'ve exceeded your typical {category} budget by {percent}%.',
                'Unusual transaction detected: ${amount} at {merchant}.',
                'You\'re on track to spend ${amount} more than usual this month.'
            ]
        };
    }

    /**
     * Generate comprehensive personalized insights
     * @param {Object} userData - All user financial data
     * @returns {Array} - Array of insight objects
     */
    generateInsights(userData) {
        const { statements, riskAnalysis, healthScore } = userData;

        if (!statements || statements.length === 0) {
            return [{
                type: 'info',
                category: 'Getting Started',
                message: 'Upload your first bank statement to start receiving personalized insights.',
                priority: 'low',
                actionable: false
            }];
        }

        const insights = [];

        // Generate insights from different dimensions
        insights.push(...this.generateSpendingInsights(statements));
        insights.push(...this.generateSavingsInsights(statements));
        insights.push(...this.generateTrendInsights(statements));
        insights.push(...this.generateCategoryInsights(statements));
        insights.push(...this.generateRiskInsights(riskAnalysis));
        insights.push(...this.generateHealthInsights(healthScore));
        insights.push(...this.generatePredictiveInsights(statements));

        // Sort by priority and return top insights
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        insights.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

        return insights.slice(0, 15); // Return top 15 insights
    }

    /**
     * Spending pattern insights
     */
    generateSpendingInsights(statements) {
        const insights = [];

        if (statements.length < 2) return insights;

        const current = statements[statements.length - 1];
        const previous = statements[statements.length - 2];

        const currentSpending = current.mlResults?.totalExpenses || 0;
        const previousSpending = previous.mlResults?.totalExpenses || 0;

        // Overall spending change
        if (previousSpending > 0) {
            const change = currentSpending - previousSpending;
            const changePercent = (change / previousSpending) * 100;

            if (Math.abs(changePercent) > 10) {
                const direction = change > 0 ? 'increased' : 'decreased';
                insights.push({
                    type: changePercent > 0 ? 'warning' : 'positive',
                    category: 'Spending Patterns',
                    message: `Your spending ${direction} by $${Math.abs(change).toFixed(2)} (${Math.abs(changePercent).toFixed(1)}%) this month.`,
                    priority: Math.abs(changePercent) > 30 ? 'high' : 'medium',
                    actionable: change > 0,
                    action: change > 0 ? 'Review your spending categories to identify areas to reduce.' : null,
                    metrics: {
                        change: change.toFixed(2),
                        changePercent: changePercent.toFixed(1),
                        current: currentSpending.toFixed(2),
                        previous: previousSpending.toFixed(2)
                    }
                });
            }
        }

        // Category-specific spending changes
        const currentCategories = current.mlResults?.categoryBreakdown || {};
        const previousCategories = previous.mlResults?.categoryBreakdown || {};

        const significantChanges = [];

        Object.keys(currentCategories).forEach(category => {
            const currentAmt = currentCategories[category] || 0;
            const previousAmt = previousCategories[category] || 0;

            if (previousAmt > 0 && currentAmt > 0) {
                const change = ((currentAmt - previousAmt) / previousAmt) * 100;
                if (Math.abs(change) > 25 && Math.abs(currentAmt - previousAmt) > 50) {
                    significantChanges.push({
                        category,
                        change,
                        amount: currentAmt - previousAmt
                    });
                }
            }
        });

        // Report top 3 category changes
        significantChanges
            .sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
            .slice(0, 3)
            .forEach(item => {
                const direction = item.change > 0 ? 'increased' : 'decreased';
                insights.push({
                    type: item.change > 0 ? 'warning' : 'positive',
                    category: 'Category Analysis',
                    message: `Your ${item.category} spending ${direction} by ${Math.abs(item.change).toFixed(0)}% ($${Math.abs(item.amount).toFixed(2)}).`,
                    priority: Math.abs(item.change) > 50 ? 'high' : 'medium',
                    actionable: item.change > 0,
                    action: item.change > 0
                        ? `Consider setting a budget for ${item.category} to control spending.`
                        : null,
                    metrics: {
                        category: item.category,
                        change: item.change.toFixed(1),
                        amount: item.amount.toFixed(2)
                    }
                });
            });

        return insights;
    }

    /**
     * Savings insights
     */
    generateSavingsInsights(statements) {
        const insights = [];

        const current = statements[statements.length - 1];
        const income = current.mlResults?.totalCredits || 0;
        const expenses = current.mlResults?.totalExpenses || 0;
        const savings = income - expenses;

        if (income === 0) return insights;

        const savingsRate = (savings / income) * 100;

        // Savings rate insight
        if (savingsRate >= 20) {
            insights.push({
                type: 'positive',
                category: 'Savings',
                message: `Excellent! You saved ${savingsRate.toFixed(1)}% of your income ($${savings.toFixed(2)}) this month.`,
                priority: 'low',
                actionable: false,
                metrics: {
                    savingsRate: savingsRate.toFixed(1),
                    savings: savings.toFixed(2)
                }
            });
        } else if (savingsRate >= 10) {
            insights.push({
                type: 'neutral',
                category: 'Savings',
                message: `Good job! You saved ${savingsRate.toFixed(1)}% of your income. Try to reach 20% for optimal financial health.`,
                priority: 'medium',
                actionable: true,
                action: 'Identify one discretionary category to reduce by 10%.',
                metrics: {
                    savingsRate: savingsRate.toFixed(1),
                    savings: savings.toFixed(2)
                }
            });
        } else if (savingsRate > 0) {
            const targetSavings = income * 0.15;
            const gap = targetSavings - savings;
            insights.push({
                type: 'warning',
                category: 'Savings',
                message: `Your savings rate is ${savingsRate.toFixed(1)}%, below the recommended 15-20%. You need to save $${gap.toFixed(2)} more to reach the target.`,
                priority: 'high',
                actionable: true,
                action: 'Review your spending and find opportunities to cut back.',
                metrics: {
                    savingsRate: savingsRate.toFixed(1),
                    gap: gap.toFixed(2)
                }
            });
        } else {
            insights.push({
                type: 'critical',
                category: 'Savings',
                message: `Alert: You spent $${Math.abs(savings).toFixed(2)} more than you earned this month. This is unsustainable.`,
                priority: 'critical',
                actionable: true,
                action: 'Immediately reduce discretionary spending and review all recurring expenses.',
                metrics: {
                    deficit: Math.abs(savings).toFixed(2)
                }
            });
        }

        // Savings opportunity insight
        if (statements.length >= 2) {
            const categoryBreakdown = current.mlResults?.categoryBreakdown || {};
            const discretionaryCategories = [
                'Entertainment & Recreation',
                'Restaurants & Fast Food',
                'E-Commerce'
            ];

            const discretionaryTotal = Object.entries(categoryBreakdown)
                .filter(([cat]) => discretionaryCategories.includes(cat))
                .reduce((sum, [, amt]) => sum + amt, 0);

            if (discretionaryTotal > income * 0.2) {
                const potential = discretionaryTotal * 0.25; // 25% reduction potential
                insights.push({
                    type: 'neutral',
                    category: 'Savings Opportunity',
                    message: `You could save an additional $${potential.toFixed(2)} per month by reducing discretionary spending by 25%.`,
                    priority: 'medium',
                    actionable: true,
                    action: 'Set limits for dining out and entertainment expenses.',
                    metrics: {
                        potentialSavings: potential.toFixed(2),
                        currentDiscretionary: discretionaryTotal.toFixed(2)
                    }
                });
            }
        }

        return insights;
    }

    /**
     * Trend insights
     */
    generateTrendInsights(statements) {
        const insights = [];

        if (statements.length < 3) return insights;

        // Calculate 3-month trends
        const recent3 = statements.slice(-3);
        const spending = recent3.map(s => s.mlResults?.totalExpenses || 0);

        // Check for consistent increase/decrease
        const trend = this.detectTrend(spending);

        if (trend.direction !== 'stable') {
            const avgChange = trend.avgChange;
            const projectedNext = spending[spending.length - 1] + avgChange;

            insights.push({
                type: trend.direction === 'increasing' ? 'warning' : 'positive',
                category: 'Spending Trends',
                message: `Your spending is trending ${trend.direction}. If this continues, you'll spend approximately $${projectedNext.toFixed(2)} next month.`,
                priority: trend.direction === 'increasing' ? 'medium' : 'low',
                actionable: trend.direction === 'increasing',
                action: trend.direction === 'increasing'
                    ? 'Review your spending patterns and set category budgets.'
                    : null,
                metrics: {
                    trend: trend.direction,
                    projection: projectedNext.toFixed(2),
                    avgChange: avgChange.toFixed(2)
                }
            });
        }

        // Category trend analysis
        const categoryTrends = this.analyzeCategoryTrends(statements.slice(-3));

        categoryTrends.slice(0, 2).forEach(ct => {
            if (ct.trend !== 'stable') {
                insights.push({
                    type: ct.trend === 'increasing' ? 'neutral' : 'positive',
                    category: 'Category Trends',
                    message: `${ct.category} spending is ${ct.trend} (${ct.avgChange > 0 ? '+' : ''}${ct.avgChange.toFixed(0)}% per month).`,
                    priority: 'low',
                    actionable: ct.trend === 'increasing',
                    action: ct.trend === 'increasing'
                        ? `Monitor ${ct.category} spending closely.`
                        : null,
                    metrics: {
                        category: ct.category,
                        trend: ct.trend,
                        avgChange: ct.avgChange.toFixed(1)
                    }
                });
            }
        });

        return insights;
    }

    /**
     * Category-specific insights
     */
    generateCategoryInsights(statements) {
        const insights = [];

        const current = statements[statements.length - 1];
        const categoryBreakdown = current.mlResults?.categoryBreakdown || {};
        const totalSpending = current.mlResults?.totalExpenses || 0;

        if (totalSpending === 0) return insights;

        // Find highest spending category
        const sortedCategories = Object.entries(categoryBreakdown)
            .sort((a, b) => b[1] - a[1]);

        if (sortedCategories.length > 0) {
            const [topCategory, topAmount] = sortedCategories[0];
            const percentage = (topAmount / totalSpending) * 100;

            insights.push({
                type: 'neutral',
                category: 'Top Spending',
                message: `Your highest spending category is ${topCategory} at $${topAmount.toFixed(2)} (${percentage.toFixed(1)}% of total).`,
                priority: 'low',
                actionable: percentage > 40,
                action: percentage > 40
                    ? `${topCategory} represents a large portion of your spending. Look for ways to optimize.`
                    : null,
                metrics: {
                    category: topCategory,
                    amount: topAmount.toFixed(2),
                    percentage: percentage.toFixed(1)
                }
            });
        }

        // Identify unusual category activity
        if (statements.length >= 3) {
            const historical = statements.slice(0, -1);
            const avgByCategory = this.calculateCategoryAverages(historical);

            Object.entries(categoryBreakdown).forEach(([category, amount]) => {
                const avg = avgByCategory[category];
                if (avg && amount > avg * 1.5 && amount - avg > 100) {
                    insights.push({
                        type: 'warning',
                        category: 'Unusual Activity',
                        message: `Your ${category} spending ($${amount.toFixed(2)}) is ${((amount / avg - 1) * 100).toFixed(0)}% higher than your average.`,
                        priority: 'medium',
                        actionable: true,
                        action: `Review ${category} transactions for any unexpected charges.`,
                        metrics: {
                            category,
                            current: amount.toFixed(2),
                            average: avg.toFixed(2),
                            difference: (amount - avg).toFixed(2)
                        }
                    });
                }
            });
        }

        return insights;
    }

    /**
     * Risk-based insights
     */
    generateRiskInsights(riskAnalysis) {
        const insights = [];

        if (!riskAnalysis || !riskAnalysis.compositeRiskScore) {
            return insights;
        }

        // Overall risk insight
        if (riskAnalysis.compositeRiskScore >= 75) {
            insights.push({
                type: 'critical',
                category: 'Risk Alert',
                message: `Critical risk level detected (${riskAnalysis.compositeRiskScore}/100). Immediate action required.`,
                priority: 'critical',
                actionable: true,
                action: 'Review all risk alerts and implement recommendations immediately.',
                metrics: {
                    riskScore: riskAnalysis.compositeRiskScore,
                    riskLevel: riskAnalysis.riskLevel
                }
            });
        } else if (riskAnalysis.compositeRiskScore >= 50) {
            insights.push({
                type: 'warning',
                category: 'Risk Alert',
                message: `Elevated risk level (${riskAnalysis.compositeRiskScore}/100). Review recommended actions.`,
                priority: 'high',
                actionable: true,
                action: 'Address high-priority risk factors.',
                metrics: {
                    riskScore: riskAnalysis.compositeRiskScore,
                    riskLevel: riskAnalysis.riskLevel
                }
            });
        }

        // Specific risk dimension insights
        const dims = riskAnalysis.dimensions;

        if (dims.cashFlowRisk && dims.cashFlowRisk.score > 50) {
            insights.push({
                type: 'warning',
                category: 'Cash Flow Risk',
                message: 'Your cash flow shows concerning patterns. You may be spending close to or more than you earn.',
                priority: 'high',
                actionable: true,
                action: 'Create a budget and track all expenses to improve cash flow.',
                metrics: dims.cashFlowRisk.metrics
            });
        }

        if (dims.liquidityRisk && dims.liquidityRisk.score > 50) {
            const monthsCovered = dims.liquidityRisk.metrics?.monthsCovered || 0;
            insights.push({
                type: 'warning',
                category: 'Liquidity Risk',
                message: `Your emergency fund covers only ${monthsCovered} months of expenses. Aim for 3-6 months.`,
                priority: 'high',
                actionable: true,
                action: 'Build your emergency fund by saving at least 10% of income monthly.',
                metrics: dims.liquidityRisk.metrics
            });
        }

        if (dims.fraudRisk && dims.fraudRisk.score > 40) {
            insights.push({
                type: 'warning',
                category: 'Fraud Risk',
                message: 'Unusual transaction patterns detected that may indicate fraud or errors.',
                priority: 'high',
                actionable: true,
                action: 'Review all flagged transactions and contact your bank if anything is suspicious.',
                metrics: {
                    fraudScore: dims.fraudRisk.score,
                    flagCount: dims.fraudRisk.flags?.length || 0
                }
            });
        }

        return insights;
    }

    /**
     * Health score insights
     */
    generateHealthInsights(healthScore) {
        const insights = [];

        if (!healthScore || !healthScore.score) {
            return insights;
        }

        // Overall health message
        insights.push({
            type: healthScore.level === 'excellent' ? 'positive' :
                healthScore.level === 'good' ? 'neutral' : 'warning',
            category: 'Financial Health',
            message: `Your financial health score is ${healthScore.score}/100 (Grade: ${healthScore.grade}).`,
            priority: 'low',
            actionable: healthScore.score < 70,
            action: healthScore.score < 70
                ? 'Focus on improving your weakest dimensions.'
                : null,
            metrics: {
                score: healthScore.score,
                grade: healthScore.grade,
                level: healthScore.level
            }
        });

        return insights;
    }

    /**
     * Predictive insights using simple forecasting
     */
    generatePredictiveInsights(statements) {
        const insights = [];

        if (statements.length < 3) return insights;

        // Predict end-of-month spending
        const current = statements[statements.length - 1];
        const currentSpending = current.mlResults?.totalExpenses || 0;

        // Get average from last 3 months
        const recent = statements.slice(-3).map(s => s.mlResults?.totalExpenses || 0);
        const avgSpending = recent.reduce((a, b) => a + b, 0) / recent.length;

        const projectedOverage = currentSpending - avgSpending;

        if (Math.abs(projectedOverage) > avgSpending * 0.15) {
            const direction = projectedOverage > 0 ? 'exceed' : 'below';
            insights.push({
                type: projectedOverage > 0 ? 'warning' : 'positive',
                category: 'Forecast',
                message: `You're on track to ${direction} your average monthly spending by $${Math.abs(projectedOverage).toFixed(2)}.`,
                priority: projectedOverage > 0 ? 'medium' : 'low',
                actionable: projectedOverage > 0,
                action: projectedOverage > 0
                    ? 'Consider reducing non-essential purchases for the rest of the month.'
                    : null,
                metrics: {
                    projected: currentSpending.toFixed(2),
                    average: avgSpending.toFixed(2),
                    difference: projectedOverage.toFixed(2)
                }
            });
        }

        return insights;
    }

    // ========== Utility Methods ==========

    detectTrend(values) {
        if (values.length < 3) return { direction: 'stable', avgChange: 0 };

        let increases = 0;
        let decreases = 0;
        let totalChange = 0;

        for (let i = 1; i < values.length; i++) {
            const change = values[i] - values[i - 1];
            totalChange += change;

            if (change > values[i - 1] * 0.05) increases++;
            else if (change < -values[i - 1] * 0.05) decreases++;
        }

        const avgChange = totalChange / (values.length - 1);

        if (increases > decreases && avgChange > 0) {
            return { direction: 'increasing', avgChange };
        } else if (decreases > increases && avgChange < 0) {
            return { direction: 'decreasing', avgChange };
        }

        return { direction: 'stable', avgChange };
    }

    analyzeCategoryTrends(statements) {
        const categoryData = {};

        statements.forEach(stmt => {
            const breakdown = stmt.mlResults?.categoryBreakdown || {};
            Object.entries(breakdown).forEach(([cat, amt]) => {
                if (!categoryData[cat]) {
                    categoryData[cat] = [];
                }
                categoryData[cat].push(amt);
            });
        });

        const trends = [];

        Object.entries(categoryData).forEach(([category, values]) => {
            if (values.length >= 2) {
                const percentChanges = [];
                for (let i = 1; i < values.length; i++) {
                    if (values[i - 1] > 0) {
                        percentChanges.push(((values[i] - values[i - 1]) / values[i - 1]) * 100);
                    }
                }

                const avgChange = percentChanges.reduce((a, b) => a + b, 0) / percentChanges.length;

                let trend = 'stable';
                if (avgChange > 10) trend = 'increasing';
                else if (avgChange < -10) trend = 'decreasing';

                trends.push({
                    category,
                    trend,
                    avgChange
                });
            }
        });

        return trends.sort((a, b) => Math.abs(b.avgChange) - Math.abs(a.avgChange));
    }

    calculateCategoryAverages(statements) {
        const categoryTotals = {};
        const categoryCounts = {};

        statements.forEach(stmt => {
            const breakdown = stmt.mlResults?.categoryBreakdown || {};
            Object.entries(breakdown).forEach(([cat, amt]) => {
                categoryTotals[cat] = (categoryTotals[cat] || 0) + amt;
                categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
            });
        });

        const averages = {};
        Object.keys(categoryTotals).forEach(cat => {
            averages[cat] = categoryTotals[cat] / categoryCounts[cat];
        });

        return averages;
    }
}

module.exports = InsightsGenerator;
