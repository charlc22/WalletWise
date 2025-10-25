// ml/engines/financialHealthScore.js
// Financial Health Scoring System
// Multi-dimensional scoring based on industry best practices

class FinancialHealthScore {
    constructor() {
        // Scoring weights (total = 100%)
        this.weights = {
            spendingDiscipline: 0.25,    // 25%
            savingsRate: 0.20,            // 20%
            budgetAdherence: 0.15,        // 15%
            riskExposure: 0.20,           // 20%
            financialStability: 0.15,     // 15%
            diversification: 0.05         // 5%
        };

        // Benchmark standards
        this.benchmarks = {
            savingsRate: {
                excellent: 0.20,  // 20%+ savings rate
                good: 0.15,
                fair: 0.10,
                poor: 0.05
            },
            debtToIncome: {
                excellent: 0.15,  // <15%
                good: 0.30,
                fair: 0.40,
                poor: 0.50
            },
            emergencyFund: {
                excellent: 6,     // 6+ months
                good: 4,
                fair: 2,
                poor: 1
            }
        };
    }

    /**
     * Calculate comprehensive financial health score
     * @param {Object} userData - User financial data
     * @returns {Object} - Health score with breakdown
     */
    calculateHealthScore(userData) {
        const { statements, riskAnalysis } = userData;

        if (!statements || statements.length === 0) {
            return this.getEmptyScore();
        }

        // Calculate each dimension
        const dimensions = {
            spendingDiscipline: this.scoreSpendingDiscipline(statements),
            savingsRate: this.scoreSavingsRate(statements),
            budgetAdherence: this.scoreBudgetAdherence(statements),
            riskExposure: this.scoreRiskExposure(riskAnalysis),
            financialStability: this.scoreFinancialStability(statements),
            diversification: this.scoreDiversification(statements)
        };

        // Calculate weighted composite score
        const compositeScore = this.calculateComposite(dimensions);

        // Generate grade and recommendations
        const grade = this.getGrade(compositeScore);
        const insights = this.generateHealthInsights(dimensions, compositeScore);
        const recommendations = this.generateHealthRecommendations(dimensions);

        return {
            score: Math.round(compositeScore),
            grade,
            level: this.getHealthLevel(compositeScore),
            timestamp: new Date(),
            dimensions,
            insights,
            recommendations,
            benchmarkComparison: this.compareToBenchmarks(dimensions)
        };
    }

    /**
     * Spending Discipline Score (0-100)
     * Measures consistency and control in spending patterns
     */
    scoreSpendingDiscipline(statements) {
        let score = 100;
        const reasons = [];

        if (statements.length < 2) {
            return { score: 50, reasons: ['Insufficient data'], weight: this.weights.spendingDiscipline };
        }

        // Calculate spending trends
        const monthlySpending = statements.map(s => s.mlResults?.totalExpenses || 0);
        const avgSpending = monthlySpending.reduce((a, b) => a + b, 0) / monthlySpending.length;

        // 1. Spending volatility
        const variance = monthlySpending.reduce((sum, val) =>
            sum + Math.pow(val - avgSpending, 2), 0) / monthlySpending.length;
        const stdDev = Math.sqrt(variance);
        const coefficientOfVariation = avgSpending > 0 ? stdDev / avgSpending : 0;

        if (coefficientOfVariation > 0.3) {
            score -= 25;
            reasons.push('High spending variability (inconsistent patterns)');
        } else if (coefficientOfVariation > 0.15) {
            score -= 10;
            reasons.push('Moderate spending variability');
        } else {
            reasons.push('Consistent spending patterns');
        }

        // 2. Impulse spending detection (unusual high-value transactions)
        const allTransactions = this.getAllTransactions(statements);
        const amounts = allTransactions.map(t => t.amount);
        const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
        const impulseBuys = allTransactions.filter(t => t.amount > mean * 3);

        if (impulseBuys.length > 5) {
            score -= 20;
            reasons.push(`${impulseBuys.length} potential impulse purchases detected`);
        } else if (impulseBuys.length > 2) {
            score -= 10;
            reasons.push('Some impulse spending detected');
        }

        // 3. Discretionary spending ratio
        const latestStatement = statements[statements.length - 1];
        const categoryBreakdown = latestStatement.mlResults?.categoryBreakdown || {};

        const discretionaryCategories = [
            'Entertainment & Recreation',
            'Restaurants & Fast Food',
            'Retail & Clothing',
            'E-Commerce'
        ];

        const discretionarySpending = Object.entries(categoryBreakdown)
            .filter(([cat]) => discretionaryCategories.includes(cat))
            .reduce((sum, [, amt]) => sum + amt, 0);

        const totalSpending = latestStatement.mlResults?.totalExpenses || 1;
        const discretionaryRatio = discretionarySpending / totalSpending;

        if (discretionaryRatio > 0.4) {
            score -= 20;
            reasons.push(`High discretionary spending (${(discretionaryRatio * 100).toFixed(0)}%)`);
        } else if (discretionaryRatio > 0.25) {
            score -= 10;
            reasons.push('Moderate discretionary spending');
        } else {
            reasons.push('Well-controlled discretionary spending');
        }

        return {
            score: Math.max(0, Math.min(100, score)),
            weight: this.weights.spendingDiscipline,
            reasons,
            metrics: {
                volatility: coefficientOfVariation.toFixed(3),
                impulseBuys: impulseBuys.length,
                discretionaryRatio: (discretionaryRatio * 100).toFixed(1) + '%'
            }
        };
    }

    /**
     * Savings Rate Score (0-100)
     * Income vs expenses ratio
     */
    scoreSavingsRate(statements) {
        let score = 0;
        const reasons = [];

        const latestStatement = statements[statements.length - 1];
        const totalCredits = latestStatement.mlResults?.totalCredits || 0;
        const totalExpenses = latestStatement.mlResults?.totalExpenses || 0;

        if (totalCredits === 0) {
            return {
                score: 0,
                weight: this.weights.savingsRate,
                reasons: ['No income detected'],
                metrics: {}
            };
        }

        const savingsAmount = totalCredits - totalExpenses;
        const savingsRate = savingsAmount / totalCredits;

        // Score based on savings rate benchmarks
        if (savingsRate >= this.benchmarks.savingsRate.excellent) {
            score = 100;
            reasons.push('Excellent savings rate (20%+ of income)');
        } else if (savingsRate >= this.benchmarks.savingsRate.good) {
            score = 80;
            reasons.push('Good savings rate (15-20% of income)');
        } else if (savingsRate >= this.benchmarks.savingsRate.fair) {
            score = 60;
            reasons.push('Fair savings rate (10-15% of income)');
        } else if (savingsRate >= this.benchmarks.savingsRate.poor) {
            score = 40;
            reasons.push('Below recommended savings rate (5-10%)');
        } else if (savingsRate > 0) {
            score = 20;
            reasons.push('Very low savings rate (<5%)');
        } else {
            score = 0;
            reasons.push('Negative savings (spending exceeds income)');
        }

        // Bonus for consistent positive savings
        if (statements.length >= 2) {
            const previousStatement = statements[statements.length - 2];
            const prevCredits = previousStatement.mlResults?.totalCredits || 0;
            const prevExpenses = previousStatement.mlResults?.totalExpenses || 0;
            const prevSavings = prevCredits - prevExpenses;

            if (savingsAmount > 0 && prevSavings > 0) {
                score = Math.min(100, score + 10);
                reasons.push('Consistent positive savings trend');
            }
        }

        return {
            score: Math.max(0, Math.min(100, score)),
            weight: this.weights.savingsRate,
            reasons,
            metrics: {
                savingsRate: (savingsRate * 100).toFixed(1) + '%',
                savingsAmount: savingsAmount.toFixed(2),
                monthlyIncome: totalCredits.toFixed(2)
            }
        };
    }

    /**
     * Budget Adherence Score (0-100)
     * How well spending aligns with typical patterns
     */
    scoreBudgetAdherence(statements) {
        let score = 100;
        const reasons = [];

        if (statements.length < 3) {
            return {
                score: 50,
                weight: this.weights.budgetAdherence,
                reasons: ['Insufficient history for budget analysis'],
                metrics: {}
            };
        }

        // Calculate average spending by category (excluding latest month)
        const historicalStatements = statements.slice(0, -1);
        const latestStatement = statements[statements.length - 1];

        const categoryAverages = {};
        const categoryCount = {};

        historicalStatements.forEach(stmt => {
            const breakdown = stmt.mlResults?.categoryBreakdown || {};
            Object.entries(breakdown).forEach(([cat, amt]) => {
                categoryAverages[cat] = (categoryAverages[cat] || 0) + amt;
                categoryCount[cat] = (categoryCount[cat] || 0) + 1;
            });
        });

        // Calculate averages
        Object.keys(categoryAverages).forEach(cat => {
            categoryAverages[cat] /= categoryCount[cat];
        });

        // Compare latest month to averages
        const latestBreakdown = latestStatement.mlResults?.categoryBreakdown || {};
        let totalVariance = 0;
        let categoriesExceeded = 0;

        Object.entries(latestBreakdown).forEach(([cat, amt]) => {
            const avg = categoryAverages[cat] || amt;
            if (avg > 0) {
                const variance = Math.abs((amt - avg) / avg);
                totalVariance += variance;

                if (amt > avg * 1.2) {
                    categoriesExceeded++;
                    score -= 10;
                }
            }
        });

        if (categoriesExceeded > 3) {
            reasons.push(`Exceeded budget in ${categoriesExceeded} categories`);
        } else if (categoriesExceeded > 0) {
            reasons.push(`Exceeded budget in ${categoriesExceeded} categories`);
        } else {
            reasons.push('Spending within typical ranges');
        }

        const avgVariance = Object.keys(latestBreakdown).length > 0
            ? totalVariance / Object.keys(latestBreakdown).length
            : 0;

        if (avgVariance > 0.3) {
            score -= 15;
            reasons.push('Significant deviation from typical spending');
        }

        return {
            score: Math.max(0, Math.min(100, score)),
            weight: this.weights.budgetAdherence,
            reasons,
            metrics: {
                categoriesExceeded,
                avgVariance: (avgVariance * 100).toFixed(1) + '%'
            }
        };
    }

    /**
     * Risk Exposure Score (0-100)
     * Based on comprehensive risk analysis
     */
    scoreRiskExposure(riskAnalysis) {
        let score = 100;
        const reasons = [];

        if (!riskAnalysis || !riskAnalysis.compositeRiskScore) {
            return {
                score: 50,
                weight: this.weights.riskExposure,
                reasons: ['Risk analysis unavailable'],
                metrics: {}
            };
        }

        // Inverse of risk score (high risk = low health score)
        score = 100 - riskAnalysis.compositeRiskScore;

        // Add reasons based on risk dimensions
        const dims = riskAnalysis.dimensions;

        if (dims.fraudRisk && dims.fraudRisk.score > 40) {
            reasons.push('Elevated fraud risk detected');
        }

        if (dims.cashFlowRisk && dims.cashFlowRisk.score > 50) {
            reasons.push('Cash flow concerns present');
        }

        if (dims.liquidityRisk && dims.liquidityRisk.score > 50) {
            reasons.push('Liquidity risk identified');
        }

        if (dims.overspendingRisk && dims.overspendingRisk.score > 40) {
            reasons.push('Overspending patterns detected');
        }

        if (reasons.length === 0) {
            reasons.push('Low overall risk exposure');
        }

        return {
            score: Math.max(0, Math.min(100, score)),
            weight: this.weights.riskExposure,
            reasons,
            metrics: {
                compositeRisk: riskAnalysis.compositeRiskScore,
                riskLevel: riskAnalysis.riskLevel
            }
        };
    }

    /**
     * Financial Stability Score (0-100)
     * Income stability and emergency fund adequacy
     */
    scoreFinancialStability(statements) {
        let score = 50; // baseline
        const reasons = [];

        if (statements.length < 2) {
            return {
                score: 50,
                weight: this.weights.financialStability,
                reasons: ['Insufficient data'],
                metrics: {}
            };
        }

        // 1. Income stability
        const incomes = statements.map(s => s.mlResults?.totalCredits || 0);
        const avgIncome = incomes.reduce((a, b) => a + b, 0) / incomes.length;
        const incomeVariance = incomes.reduce((sum, val) =>
            sum + Math.pow(val - avgIncome, 2), 0) / incomes.length;
        const incomeStdDev = Math.sqrt(incomeVariance);
        const incomeCV = avgIncome > 0 ? incomeStdDev / avgIncome : 0;

        if (incomeCV < 0.1) {
            score += 25;
            reasons.push('Very stable income');
        } else if (incomeCV < 0.2) {
            score += 15;
            reasons.push('Stable income');
        } else if (incomeCV < 0.3) {
            score += 5;
            reasons.push('Moderate income stability');
        } else {
            score -= 10;
            reasons.push('Variable income pattern');
        }

        // 2. Emergency fund adequacy
        const latestStatement = statements[statements.length - 1];
        const monthlyExpenses = latestStatement.mlResults?.totalExpenses || 0;
        const availableCash = (latestStatement.mlResults?.totalCredits || 0) -
            (latestStatement.mlResults?.totalExpenses || 0);

        const monthsCovered = monthlyExpenses > 0 ? availableCash / monthlyExpenses : 0;

        if (monthsCovered >= this.benchmarks.emergencyFund.excellent) {
            score += 25;
            reasons.push('Excellent emergency fund (6+ months)');
        } else if (monthsCovered >= this.benchmarks.emergencyFund.good) {
            score += 20;
            reasons.push('Good emergency fund (4-6 months)');
        } else if (monthsCovered >= this.benchmarks.emergencyFund.fair) {
            score += 10;
            reasons.push('Adequate emergency fund (2-4 months)');
        } else if (monthsCovered >= this.benchmarks.emergencyFund.poor) {
            score += 5;
            reasons.push('Minimal emergency fund (1-2 months)');
        } else {
            reasons.push('Insufficient emergency fund (<1 month)');
        }

        return {
            score: Math.max(0, Math.min(100, score)),
            weight: this.weights.financialStability,
            reasons,
            metrics: {
                incomeStability: incomeCV.toFixed(3),
                emergencyFundMonths: monthsCovered.toFixed(1)
            }
        };
    }

    /**
     * Diversification Score (0-100)
     * Spending category diversification
     */
    scoreDiversification(statements) {
        let score = 50;
        const reasons = [];

        const latestStatement = statements[statements.length - 1];
        const categoryBreakdown = latestStatement.mlResults?.categoryBreakdown || {};

        const categories = Object.keys(categoryBreakdown).length;

        if (categories === 0) {
            return {
                score: 0,
                weight: this.weights.diversification,
                reasons: ['No spending data'],
                metrics: {}
            };
        }

        // Calculate Herfindahl-Hirschman Index (lower = more diversified)
        const totalSpending = Object.values(categoryBreakdown).reduce((a, b) => a + b, 0);
        const hhi = Object.values(categoryBreakdown)
            .map(amt => Math.pow(amt / totalSpending, 2))
            .reduce((a, b) => a + b, 0);

        // Score based on HHI (0-1 scale)
        // Lower HHI = more diversified = higher score
        if (hhi < 0.15) {
            score = 100;
            reasons.push('Excellent spending diversification');
        } else if (hhi < 0.25) {
            score = 75;
            reasons.push('Good spending diversification');
        } else if (hhi < 0.35) {
            score = 50;
            reasons.push('Moderate spending concentration');
        } else {
            score = 25;
            reasons.push('High spending concentration');
        }

        // Bonus for having many active categories
        if (categories >= 10) {
            score = Math.min(100, score + 10);
        }

        return {
            score: Math.max(0, Math.min(100, score)),
            weight: this.weights.diversification,
            reasons,
            metrics: {
                hhi: hhi.toFixed(3),
                activeCategories: categories
            }
        };
    }

    /**
     * Calculate weighted composite score
     */
    calculateComposite(dimensions) {
        return Object.entries(dimensions).reduce((total, [key, dim]) => {
            return total + (dim.score * dim.weight);
        }, 0);
    }

    /**
     * Generate health insights
     */
    generateHealthInsights(dimensions, compositeScore) {
        const insights = [];

        // Overall health insight
        if (compositeScore >= 80) {
            insights.push({
                type: 'positive',
                message: 'Excellent financial health! You\'re demonstrating strong financial habits.',
                icon: '✓'
            });
        } else if (compositeScore >= 60) {
            insights.push({
                type: 'neutral',
                message: 'Good financial health with room for improvement.',
                icon: 'ℹ'
            });
        } else if (compositeScore >= 40) {
            insights.push({
                type: 'warning',
                message: 'Fair financial health. Consider implementing recommended actions.',
                icon: '⚠'
            });
        } else {
            insights.push({
                type: 'critical',
                message: 'Financial health needs attention. Immediate action recommended.',
                icon: '⚠'
            });
        }

        // Strongest dimension
        const sortedDims = Object.entries(dimensions)
            .sort((a, b) => b[1].score - a[1].score);

        insights.push({
            type: 'positive',
            message: `Strength: ${this.formatDimensionName(sortedDims[0][0])} (${sortedDims[0][1].score}/100)`,
            icon: '💪'
        });

        // Weakest dimension
        insights.push({
            type: 'improvement',
            message: `Focus area: ${this.formatDimensionName(sortedDims[sortedDims.length - 1][0])} (${sortedDims[sortedDims.length - 1][1].score}/100)`,
            icon: '🎯'
        });

        return insights;
    }

    /**
     * Generate health-based recommendations
     */
    generateHealthRecommendations(dimensions) {
        const recommendations = [];

        // Analyze each dimension and provide targeted recommendations
        Object.entries(dimensions).forEach(([dimension, data]) => {
            if (data.score < 60) {
                switch (dimension) {
                    case 'spendingDiscipline':
                        recommendations.push({
                            dimension: 'Spending Discipline',
                            priority: 'high',
                            action: 'Track all expenses daily and set spending limits by category',
                            expectedImpact: 'Reduce impulsive spending by 30%'
                        });
                        break;
                    case 'savingsRate':
                        recommendations.push({
                            dimension: 'Savings Rate',
                            priority: 'high',
                            action: 'Automate savings by setting up automatic transfers to savings account',
                            expectedImpact: 'Increase savings rate to 15%+ of income'
                        });
                        break;
                    case 'budgetAdherence':
                        recommendations.push({
                            dimension: 'Budget Adherence',
                            priority: 'medium',
                            action: 'Create realistic category budgets based on 3-month averages',
                            expectedImpact: 'Improve spending predictability'
                        });
                        break;
                    case 'riskExposure':
                        recommendations.push({
                            dimension: 'Risk Management',
                            priority: 'high',
                            action: 'Review and address flagged risk alerts immediately',
                            expectedImpact: 'Reduce financial risk by 40%'
                        });
                        break;
                    case 'financialStability':
                        recommendations.push({
                            dimension: 'Financial Stability',
                            priority: 'high',
                            action: 'Build emergency fund to cover 3-6 months of expenses',
                            expectedImpact: 'Increase financial resilience'
                        });
                        break;
                    case 'diversification':
                        recommendations.push({
                            dimension: 'Diversification',
                            priority: 'low',
                            action: 'Review spending concentration and consider alternatives',
                            expectedImpact: 'Reduce dependency on single categories'
                        });
                        break;
                }
            }
        });

        // Sort by priority
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

        return recommendations.slice(0, 5); // Top 5 recommendations
    }

    /**
     * Compare to industry benchmarks
     */
    compareToBenchmarks(dimensions) {
        const comparison = {};

        // Savings rate comparison
        const savingsMetrics = dimensions.savingsRate.metrics;
        if (savingsMetrics.savingsRate) {
            const rate = parseFloat(savingsMetrics.savingsRate) / 100;
            comparison.savingsRate = {
                userValue: savingsMetrics.savingsRate,
                benchmark: '15-20%',
                status: rate >= 0.15 ? 'above' : 'below'
            };
        }

        // Emergency fund comparison
        const stabilityMetrics = dimensions.financialStability.metrics;
        if (stabilityMetrics.emergencyFundMonths) {
            const months = parseFloat(stabilityMetrics.emergencyFundMonths);
            comparison.emergencyFund = {
                userValue: stabilityMetrics.emergencyFundMonths + ' months',
                benchmark: '3-6 months',
                status: months >= 3 ? 'adequate' : 'insufficient'
            };
        }

        return comparison;
    }

    // ========== Utility Methods ==========

    getGrade(score) {
        if (score >= 90) return 'A+';
        if (score >= 85) return 'A';
        if (score >= 80) return 'A-';
        if (score >= 75) return 'B+';
        if (score >= 70) return 'B';
        if (score >= 65) return 'B-';
        if (score >= 60) return 'C+';
        if (score >= 55) return 'C';
        if (score >= 50) return 'C-';
        if (score >= 45) return 'D+';
        if (score >= 40) return 'D';
        return 'F';
    }

    getHealthLevel(score) {
        if (score >= 80) return 'excellent';
        if (score >= 60) return 'good';
        if (score >= 40) return 'fair';
        return 'poor';
    }

    formatDimensionName(dimension) {
        return dimension
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase())
            .trim();
    }

    getAllTransactions(statements) {
        const allTxs = [];
        statements.forEach(stmt => {
            if (stmt.mlResults && stmt.mlResults.expenses) {
                allTxs.push(...stmt.mlResults.expenses);
            }
        });
        return allTxs;
    }

    getEmptyScore() {
        return {
            score: 0,
            grade: 'N/A',
            level: 'insufficient_data',
            timestamp: new Date(),
            dimensions: {},
            insights: [{
                type: 'info',
                message: 'Upload more statements to calculate financial health score',
                icon: 'ℹ'
            }],
            recommendations: [],
            benchmarkComparison: {}
        };
    }
}

module.exports = FinancialHealthScore;
