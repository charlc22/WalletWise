// ml/engines/riskAnalyzer.js
// Comprehensive Risk Analysis Engine for Financial Transactions
// Designed for Risk Analyst Internship Portfolio

class RiskAnalyzer {
    constructor() {
        // Risk thresholds and parameters
        this.config = {
            fraudThresholds: {
                unusualAmount: 3, // Standard deviations
                highValue: 1000,
                rapidTransactions: 5, // transactions within 1 hour
                foreignMerchant: ['international', 'foreign exchange']
            },
            cashFlowThresholds: {
                criticalRatio: 0.1, // 10% of average balance
                warningRatio: 0.25,
                negativeBalanceRisk: true
            },
            overspendingThresholds: {
                categoryBudgetExceed: 1.2, // 20% over budget
                monthOverMonthIncrease: 1.3 // 30% increase
            }
        };
    }

    /**
     * Comprehensive risk analysis for all transactions
     * @param {Array} statements - All user bank statements
     * @returns {Object} - Multi-dimensional risk analysis
     */
    analyzeComprehensive(statements) {
        if (!statements || statements.length === 0) {
            return this.getEmptyRiskProfile();
        }

        // Extract all transactions from all statements
        const allTransactions = this.extractAllTransactions(statements);
        const latestStatement = statements[statements.length - 1];

        // Run all risk analysis modules
        const fraudRisk = this.analyzeFraudRisk(allTransactions);
        const cashFlowRisk = this.analyzeCashFlowRisk(allTransactions, latestStatement);
        const overspendingRisk = this.analyzeOverspendingRisk(statements);
        const liquidityRisk = this.analyzeLiquidityRisk(allTransactions);
        const concentrationRisk = this.analyzeConcentrationRisk(allTransactions);

        // Calculate composite risk score
        const compositeScore = this.calculateCompositeRiskScore({
            fraudRisk,
            cashFlowRisk,
            overspendingRisk,
            liquidityRisk,
            concentrationRisk
        });

        return {
            compositeRiskScore: compositeScore,
            riskLevel: this.getRiskLevel(compositeScore),
            timestamp: new Date(),
            dimensions: {
                fraudRisk,
                cashFlowRisk,
                overspendingRisk,
                liquidityRisk,
                concentrationRisk
            },
            alerts: this.generateRiskAlerts({
                fraudRisk,
                cashFlowRisk,
                overspendingRisk,
                liquidityRisk,
                concentrationRisk
            }),
            recommendations: this.generateRiskRecommendations({
                fraudRisk,
                cashFlowRisk,
                overspendingRisk,
                liquidityRisk,
                concentrationRisk
            })
        };
    }

    /**
     * Fraud Risk Analysis - Detect unusual transaction patterns
     */
    analyzeFraudRisk(transactions) {
        if (transactions.length < 10) {
            return { score: 0, level: 'insufficient_data', flags: [] };
        }

        const flags = [];
        let riskScore = 0;

        // Calculate statistical baselines
        const amounts = transactions.map(t => t.amount);
        const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
        const variance = amounts.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / amounts.length;
        const stdDev = Math.sqrt(variance);

        // 1. Unusual Amount Detection (Z-score based)
        const unusualTransactions = transactions.filter(tx => {
            const zScore = Math.abs((tx.amount - mean) / stdDev);
            return zScore > this.config.fraudThresholds.unusualAmount;
        });

        if (unusualTransactions.length > 0) {
            riskScore += unusualTransactions.length * 15;
            flags.push({
                type: 'UNUSUAL_AMOUNT',
                severity: 'medium',
                count: unusualTransactions.length,
                transactions: unusualTransactions.slice(0, 3).map(t => ({
                    description: t.description,
                    amount: t.amount,
                    date: t.date
                }))
            });
        }

        // 2. High-Value Transactions
        const highValueTxs = transactions.filter(tx =>
            tx.amount > this.config.fraudThresholds.highValue
        );

        if (highValueTxs.length > 0) {
            riskScore += highValueTxs.length * 10;
            flags.push({
                type: 'HIGH_VALUE',
                severity: 'low',
                count: highValueTxs.length,
                totalAmount: highValueTxs.reduce((sum, t) => sum + t.amount, 0)
            });
        }

        // 3. Rapid Transaction Detection (same day multiple transactions)
        const transactionsByDate = {};
        transactions.forEach(tx => {
            const date = tx.date;
            if (!transactionsByDate[date]) {
                transactionsByDate[date] = [];
            }
            transactionsByDate[date].push(tx);
        });

        const rapidTransactionDays = Object.entries(transactionsByDate)
            .filter(([, txs]) => txs.length >= this.config.fraudThresholds.rapidTransactions);

        if (rapidTransactionDays.length > 0) {
            riskScore += rapidTransactionDays.length * 20;
            flags.push({
                type: 'RAPID_TRANSACTIONS',
                severity: 'high',
                days: rapidTransactionDays.length,
                maxInDay: Math.max(...rapidTransactionDays.map(([, txs]) => txs.length))
            });
        }

        // 4. Duplicate Transaction Detection
        const duplicates = this.findDuplicateTransactions(transactions);
        if (duplicates.length > 0) {
            riskScore += duplicates.length * 25;
            flags.push({
                type: 'DUPLICATE_TRANSACTIONS',
                severity: 'high',
                count: duplicates.length,
                transactions: duplicates.slice(0, 2)
            });
        }

        // 5. Category Anomaly Detection
        const categoryStats = this.calculateCategoryStatistics(transactions);
        const categoryAnomalies = this.detectCategoryAnomalies(categoryStats);

        if (categoryAnomalies.length > 0) {
            riskScore += categoryAnomalies.length * 10;
            flags.push({
                type: 'CATEGORY_ANOMALY',
                severity: 'medium',
                anomalies: categoryAnomalies
            });
        }

        // Normalize score to 0-100
        const normalizedScore = Math.min(riskScore, 100);

        return {
            score: Math.round(normalizedScore),
            level: this.getRiskLevel(normalizedScore),
            flags,
            statistics: {
                totalTransactions: transactions.length,
                avgAmount: Math.round(mean * 100) / 100,
                stdDev: Math.round(stdDev * 100) / 100,
                maxAmount: Math.max(...amounts),
                minAmount: Math.min(...amounts)
            }
        };
    }

    /**
     * Cash Flow Risk Analysis - Assess liquidity and balance trends
     */
    analyzeCashFlowRisk(transactions, latestStatement) {
        const flags = [];
        let riskScore = 0;

        // Calculate net cash flow
        const debits = transactions.filter(t => t.type === 'debit');
        const credits = transactions.filter(t => t.type === 'credit');

        const totalDebits = debits.reduce((sum, t) => sum + t.amount, 0);
        const totalCredits = credits.reduce((sum, t) => sum + t.amount, 0);
        const netCashFlow = totalCredits - totalDebits;

        // 1. Negative Cash Flow Risk
        if (netCashFlow < 0) {
            riskScore += 40;
            flags.push({
                type: 'NEGATIVE_CASH_FLOW',
                severity: 'high',
                deficit: Math.abs(netCashFlow),
                message: `Spending exceeds income by $${Math.abs(netCashFlow).toFixed(2)}`
            });
        }

        // 2. Cash Flow Ratio (credits to debits)
        const cashFlowRatio = totalCredits > 0 ? totalDebits / totalCredits : 1;

        if (cashFlowRatio > 0.9) {
            riskScore += 30;
            flags.push({
                type: 'HIGH_EXPENSE_RATIO',
                severity: 'high',
                ratio: (cashFlowRatio * 100).toFixed(1) + '%',
                message: `Spending ${(cashFlowRatio * 100).toFixed(1)}% of income`
            });
        } else if (cashFlowRatio > 0.7) {
            riskScore += 15;
            flags.push({
                type: 'MODERATE_EXPENSE_RATIO',
                severity: 'medium',
                ratio: (cashFlowRatio * 100).toFixed(1) + '%'
            });
        }

        // 3. Burn Rate Analysis (average daily spending)
        const uniqueDates = [...new Set(transactions.map(t => t.date))];
        const avgDailySpending = totalDebits / uniqueDates.length;
        const avgDailyIncome = totalCredits / uniqueDates.length;
        const daysUntilZero = avgDailyIncome > avgDailySpending
            ? Infinity
            : netCashFlow > 0
                ? netCashFlow / (avgDailySpending - avgDailyIncome)
                : 0;

        if (daysUntilZero < 30 && daysUntilZero > 0) {
            riskScore += 50;
            flags.push({
                type: 'HIGH_BURN_RATE',
                severity: 'critical',
                daysUntilZero: Math.round(daysUntilZero),
                message: `At current rate, funds depleted in ${Math.round(daysUntilZero)} days`
            });
        }

        // 4. Income Volatility
        const monthlyCredits = this.groupByMonth(credits);
        const incomeVolatility = this.calculateVolatility(
            Object.values(monthlyCredits).map(txs => txs.reduce((sum, t) => sum + t.amount, 0))
        );

        if (incomeVolatility > 0.3) {
            riskScore += 20;
            flags.push({
                type: 'INCOME_VOLATILITY',
                severity: 'medium',
                volatility: (incomeVolatility * 100).toFixed(1) + '%',
                message: 'Income shows high variability'
            });
        }

        const normalizedScore = Math.min(riskScore, 100);

        return {
            score: Math.round(normalizedScore),
            level: this.getRiskLevel(normalizedScore),
            flags,
            metrics: {
                netCashFlow: Math.round(netCashFlow * 100) / 100,
                cashFlowRatio: Math.round(cashFlowRatio * 100) / 100,
                avgDailySpending: Math.round(avgDailySpending * 100) / 100,
                avgDailyIncome: Math.round(avgDailyIncome * 100) / 100,
                incomeVolatility: Math.round(incomeVolatility * 100) / 100
            }
        };
    }

    /**
     * Overspending Risk Analysis - Category-wise spending analysis
     */
    analyzeOverspendingRisk(statements) {
        if (statements.length < 2) {
            return { score: 0, level: 'insufficient_data', flags: [] };
        }

        const flags = [];
        let riskScore = 0;

        // Compare last two months
        const currentStatement = statements[statements.length - 1];
        const previousStatement = statements[statements.length - 2];

        const currentSpending = currentStatement.mlResults?.totalExpenses || 0;
        const previousSpending = previousStatement.mlResults?.totalExpenses || 0;

        // 1. Overall spending increase
        if (previousSpending > 0) {
            const spendingIncrease = (currentSpending - previousSpending) / previousSpending;

            if (spendingIncrease > 0.3) {
                riskScore += 40;
                flags.push({
                    type: 'SIGNIFICANT_SPENDING_INCREASE',
                    severity: 'high',
                    increase: (spendingIncrease * 100).toFixed(1) + '%',
                    amount: currentSpending - previousSpending
                });
            } else if (spendingIncrease > 0.15) {
                riskScore += 20;
                flags.push({
                    type: 'MODERATE_SPENDING_INCREASE',
                    severity: 'medium',
                    increase: (spendingIncrease * 100).toFixed(1) + '%'
                });
            }
        }

        // 2. Category-wise overspending
        const currentCategories = currentStatement.mlResults?.categoryBreakdown || {};
        const previousCategories = previousStatement.mlResults?.categoryBreakdown || {};

        const categoryIncreases = [];

        Object.keys(currentCategories).forEach(category => {
            const current = currentCategories[category] || 0;
            const previous = previousCategories[category] || 0;

            if (previous > 0 && current > previous) {
                const increase = (current - previous) / previous;
                if (increase > 0.5) {
                    categoryIncreases.push({
                        category,
                        increase: (increase * 100).toFixed(1) + '%',
                        amount: current - previous
                    });
                }
            }
        });

        if (categoryIncreases.length > 0) {
            riskScore += categoryIncreases.length * 15;
            flags.push({
                type: 'CATEGORY_OVERSPENDING',
                severity: 'medium',
                categories: categoryIncreases
            });
        }

        // 3. High discretionary spending
        const discretionaryCategories = [
            'Entertainment & Recreation',
            'Restaurants & Fast Food',
            'E-Commerce',
            'Retail & Clothing'
        ];

        const discretionarySpending = Object.entries(currentCategories)
            .filter(([cat]) => discretionaryCategories.includes(cat))
            .reduce((sum, [, amt]) => sum + amt, 0);

        const discretionaryRatio = currentSpending > 0 ? discretionarySpending / currentSpending : 0;

        if (discretionaryRatio > 0.4) {
            riskScore += 25;
            flags.push({
                type: 'HIGH_DISCRETIONARY_SPENDING',
                severity: 'medium',
                ratio: (discretionaryRatio * 100).toFixed(1) + '%',
                amount: discretionarySpending
            });
        }

        const normalizedScore = Math.min(riskScore, 100);

        return {
            score: Math.round(normalizedScore),
            level: this.getRiskLevel(normalizedScore),
            flags,
            metrics: {
                currentSpending,
                previousSpending,
                changePercent: previousSpending > 0
                    ? ((currentSpending - previousSpending) / previousSpending * 100).toFixed(1)
                    : '0',
                discretionaryRatio: (discretionaryRatio * 100).toFixed(1) + '%'
            }
        };
    }

    /**
     * Liquidity Risk Analysis - Assess ability to meet short-term obligations
     */
    analyzeLiquidityRisk(transactions) {
        const flags = [];
        let riskScore = 0;

        // Calculate recurring vs one-time expenses
        const recurringExpenses = this.identifyRecurringExpenses(transactions);
        const totalRecurring = recurringExpenses.reduce((sum, e) => sum + e.amount, 0);

        const credits = transactions.filter(t => t.type === 'credit');
        const debits = transactions.filter(t => t.type === 'debit');

        const totalIncome = credits.reduce((sum, t) => sum + t.amount, 0);
        const totalExpenses = debits.reduce((sum, t) => sum + t.amount, 0);

        // 1. Recurring expense coverage ratio
        const recurringCoverageRatio = totalIncome > 0 ? totalRecurring / totalIncome : 1;

        if (recurringCoverageRatio > 0.8) {
            riskScore += 50;
            flags.push({
                type: 'LOW_LIQUIDITY',
                severity: 'critical',
                ratio: (recurringCoverageRatio * 100).toFixed(1) + '%',
                message: 'Recurring expenses consume >80% of income'
            });
        } else if (recurringCoverageRatio > 0.6) {
            riskScore += 30;
            flags.push({
                type: 'MODERATE_LIQUIDITY_RISK',
                severity: 'medium',
                ratio: (recurringCoverageRatio * 100).toFixed(1) + '%'
            });
        }

        // 2. Emergency fund adequacy (assuming 3-6 months coverage needed)
        const monthlyExpenses = totalExpenses / Math.max(this.getMonthsSpan(transactions), 1);
        const availableCushion = totalIncome - totalExpenses;
        const monthsCovered = monthlyExpenses > 0 ? availableCushion / monthlyExpenses : 0;

        if (monthsCovered < 1) {
            riskScore += 30;
            flags.push({
                type: 'INSUFFICIENT_EMERGENCY_FUND',
                severity: 'high',
                monthsCovered: monthsCovered.toFixed(1),
                message: 'Emergency fund below recommended 3-6 months'
            });
        }

        const normalizedScore = Math.min(riskScore, 100);

        return {
            score: Math.round(normalizedScore),
            level: this.getRiskLevel(normalizedScore),
            flags,
            metrics: {
                recurringExpenses: Math.round(totalRecurring * 100) / 100,
                recurringCoverageRatio: Math.round(recurringCoverageRatio * 100) / 100,
                monthsCovered: Math.round(monthsCovered * 10) / 10,
                monthlyExpenses: Math.round(monthlyExpenses * 100) / 100
            }
        };
    }

    /**
     * Concentration Risk Analysis - Assess category concentration
     */
    analyzeConcentrationRisk(transactions) {
        const flags = [];
        let riskScore = 0;

        const categoryTotals = {};
        let totalSpending = 0;

        transactions.filter(t => t.type === 'debit').forEach(tx => {
            const cat = tx.category || 'Other';
            categoryTotals[cat] = (categoryTotals[cat] || 0) + tx.amount;
            totalSpending += tx.amount;
        });

        // Calculate Herfindahl-Hirschman Index (HHI) for concentration
        const marketShares = Object.values(categoryTotals).map(amt =>
            totalSpending > 0 ? amt / totalSpending : 0
        );

        const hhi = marketShares.reduce((sum, share) => sum + Math.pow(share, 2), 0);

        // HHI interpretation: 0-0.15 (low), 0.15-0.25 (moderate), >0.25 (high concentration)
        if (hhi > 0.25) {
            riskScore += 40;

            const dominantCategory = Object.entries(categoryTotals)
                .sort((a, b) => b[1] - a[1])[0];

            flags.push({
                type: 'HIGH_CATEGORY_CONCENTRATION',
                severity: 'high',
                hhi: hhi.toFixed(3),
                dominantCategory: dominantCategory[0],
                percentage: ((dominantCategory[1] / totalSpending) * 100).toFixed(1) + '%'
            });
        } else if (hhi > 0.15) {
            riskScore += 20;
            flags.push({
                type: 'MODERATE_CONCENTRATION',
                severity: 'medium',
                hhi: hhi.toFixed(3)
            });
        }

        // Check for single-merchant concentration
        const merchantCounts = {};
        transactions.forEach(tx => {
            const merchant = tx.description.split(' ')[0]; // Simplified merchant extraction
            merchantCounts[merchant] = (merchantCounts[merchant] || 0) + 1;
        });

        const maxMerchantCount = Math.max(...Object.values(merchantCounts));
        if (maxMerchantCount > transactions.length * 0.2) {
            riskScore += 20;
            flags.push({
                type: 'MERCHANT_CONCENTRATION',
                severity: 'medium',
                percentage: ((maxMerchantCount / transactions.length) * 100).toFixed(1) + '%'
            });
        }

        const normalizedScore = Math.min(riskScore, 100);

        return {
            score: Math.round(normalizedScore),
            level: this.getRiskLevel(normalizedScore),
            flags,
            metrics: {
                hhi: Math.round(hhi * 1000) / 1000,
                categoryCount: Object.keys(categoryTotals).length,
                topCategories: Object.entries(categoryTotals)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 3)
                    .map(([cat, amt]) => ({
                        category: cat,
                        amount: amt,
                        percentage: ((amt / totalSpending) * 100).toFixed(1) + '%'
                    }))
            }
        };
    }

    /**
     * Calculate composite risk score from all dimensions
     */
    calculateCompositeRiskScore(risks) {
        // Weighted risk scoring (total = 100%)
        const weights = {
            fraudRisk: 0.25,
            cashFlowRisk: 0.30,
            overspendingRisk: 0.20,
            liquidityRisk: 0.15,
            concentrationRisk: 0.10
        };

        const composite =
            (risks.fraudRisk.score * weights.fraudRisk) +
            (risks.cashFlowRisk.score * weights.cashFlowRisk) +
            (risks.overspendingRisk.score * weights.overspendingRisk) +
            (risks.liquidityRisk.score * weights.liquidityRisk) +
            (risks.concentrationRisk.score * weights.concentrationRisk);

        return Math.round(composite);
    }

    /**
     * Generate actionable risk alerts
     */
    generateRiskAlerts(risks) {
        const alerts = [];

        // Collect all high and critical severity flags
        Object.entries(risks).forEach(([dimension, data]) => {
            if (data.flags) {
                data.flags.forEach(flag => {
                    if (flag.severity === 'critical' || flag.severity === 'high') {
                        alerts.push({
                            dimension,
                            ...flag,
                            timestamp: new Date()
                        });
                    }
                });
            }
        });

        // Sort by severity
        const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        alerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

        return alerts;
    }

    /**
     * Generate risk-based recommendations
     */
    generateRiskRecommendations(risks) {
        const recommendations = [];

        // Cash flow recommendations
        if (risks.cashFlowRisk.score > 50) {
            recommendations.push({
                category: 'Cash Flow',
                priority: 'high',
                action: 'Reduce monthly expenses by at least 20% to improve cash flow',
                impact: 'Prevents overdraft and builds financial cushion'
            });
        }

        // Fraud recommendations
        if (risks.fraudRisk.score > 40) {
            recommendations.push({
                category: 'Fraud Prevention',
                priority: 'high',
                action: 'Review flagged transactions for unauthorized charges',
                impact: 'Protects against fraudulent activity'
            });
        }

        // Overspending recommendations
        if (risks.overspendingRisk.score > 40) {
            recommendations.push({
                category: 'Spending Control',
                priority: 'medium',
                action: 'Set category budgets for high-growth spending areas',
                impact: 'Controls discretionary spending'
            });
        }

        // Liquidity recommendations
        if (risks.liquidityRisk.score > 50) {
            recommendations.push({
                category: 'Liquidity',
                priority: 'high',
                action: 'Build emergency fund to cover 3-6 months of expenses',
                impact: 'Ensures financial stability during emergencies'
            });
        }

        // Concentration recommendations
        if (risks.concentrationRisk.score > 40) {
            recommendations.push({
                category: 'Diversification',
                priority: 'low',
                action: 'Diversify spending across categories to reduce concentration risk',
                impact: 'Reduces dependency on single expense categories'
            });
        }

        return recommendations;
    }

    // ========== Utility Methods ==========

    extractAllTransactions(statements) {
        const allTxs = [];
        statements.forEach(stmt => {
            if (stmt.mlResults && stmt.mlResults.expenses) {
                allTxs.push(...stmt.mlResults.expenses);
            }
        });
        return allTxs;
    }

    findDuplicateTransactions(transactions) {
        const seen = new Map();
        const duplicates = [];

        transactions.forEach(tx => {
            const key = `${tx.date}-${tx.description}-${tx.amount}`;
            if (seen.has(key)) {
                duplicates.push({ ...tx, duplicate: true });
            } else {
                seen.set(key, tx);
            }
        });

        return duplicates;
    }

    calculateCategoryStatistics(transactions) {
        const categoryData = {};

        transactions.forEach(tx => {
            const cat = tx.category || 'Other';
            if (!categoryData[cat]) {
                categoryData[cat] = [];
            }
            categoryData[cat].push(tx.amount);
        });

        const stats = {};
        Object.entries(categoryData).forEach(([cat, amounts]) => {
            const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
            const variance = amounts.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / amounts.length;
            stats[cat] = {
                mean,
                stdDev: Math.sqrt(variance),
                count: amounts.length,
                total: amounts.reduce((a, b) => a + b, 0)
            };
        });

        return stats;
    }

    detectCategoryAnomalies(categoryStats) {
        const anomalies = [];

        Object.entries(categoryStats).forEach(([cat, stats]) => {
            // Flag categories with high variance relative to mean (CV > 1)
            const cv = stats.mean > 0 ? stats.stdDev / stats.mean : 0;
            if (cv > 1 && stats.count > 3) {
                anomalies.push({
                    category: cat,
                    coefficientOfVariation: cv.toFixed(2),
                    reason: 'High spending variability'
                });
            }
        });

        return anomalies;
    }

    identifyRecurringExpenses(transactions) {
        // Simple recurring detection: same amount, same description pattern
        const grouped = {};

        transactions.filter(t => t.type === 'debit').forEach(tx => {
            const key = `${tx.description.substring(0, 20)}-${Math.round(tx.amount)}`;
            if (!grouped[key]) {
                grouped[key] = [];
            }
            grouped[key].push(tx);
        });

        // Recurring if appears 2+ times
        const recurring = [];
        Object.values(grouped).forEach(group => {
            if (group.length >= 2) {
                recurring.push(...group);
            }
        });

        return recurring;
    }

    groupByMonth(transactions) {
        const monthly = {};

        transactions.forEach(tx => {
            // Assuming date format MM/DD
            const month = tx.date ? tx.date.split('/')[0] : 'unknown';
            if (!monthly[month]) {
                monthly[month] = [];
            }
            monthly[month].push(tx);
        });

        return monthly;
    }

    calculateVolatility(values) {
        if (values.length < 2) return 0;

        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
        const stdDev = Math.sqrt(variance);

        return mean > 0 ? stdDev / mean : 0;
    }

    getMonthsSpan(transactions) {
        const months = new Set(transactions.map(t => t.date ? t.date.split('/')[0] : null));
        return months.size;
    }

    getRiskLevel(score) {
        if (score >= 75) return 'critical';
        if (score >= 50) return 'high';
        if (score >= 25) return 'medium';
        return 'low';
    }

    getEmptyRiskProfile() {
        return {
            compositeRiskScore: 0,
            riskLevel: 'insufficient_data',
            timestamp: new Date(),
            dimensions: {},
            alerts: [],
            recommendations: []
        };
    }
}

module.exports = RiskAnalyzer;
