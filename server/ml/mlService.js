// ml/mlService.js
// Main ML Service - Orchestrates all ML engines

const CategoryPredictor = require('./models/categoryPredictor');
const RiskAnalyzer = require('./engines/riskAnalyzer');
const FinancialHealthScore = require('./engines/financialHealthScore');
const InsightsGenerator = require('./engines/insightsGenerator');

class MLService {
    constructor() {
        this.categoryPredictor = new CategoryPredictor();
        this.riskAnalyzer = new RiskAnalyzer();
        this.healthScorer = new FinancialHealthScore();
        this.insightsGenerator = new InsightsGenerator();

        this.isInitialized = false;
    }

    /**
     * Initialize ML models with training data
     * @param {Array} historicalTransactions - Past transactions for training
     */
    async initialize(historicalTransactions = []) {
        try {
            // Train category predictor if we have historical data
            if (historicalTransactions.length > 0) {
                this.categoryPredictor.train(historicalTransactions);
            }

            this.isInitialized = true;
            console.log('✓ ML Service initialized successfully');
        } catch (error) {
            console.error('Error initializing ML Service:', error);
            throw error;
        }
    }

    /**
     * Analyze a single statement with ML
     * @param {Object} statement - Bank statement object
     * @param {Array} userStatements - All user statements for context
     * @returns {Object} - ML analysis results
     */
    async analyzeStatement(statement, userStatements = []) {
        try {
            const transactions = statement.mlResults?.expenses || [];

            if (transactions.length === 0) {
                return null;
            }

            // 1. Enhance category predictions
            const enhancedTransactions = this.categoryPredictor.batchPredict(transactions);

            // 2. Perform risk analysis on all user statements
            const riskAnalysis = this.riskAnalyzer.analyzeComprehensive(userStatements);

            // 3. Calculate financial health score
            const healthScore = this.healthScorer.calculateHealthScore({
                statements: userStatements,
                riskAnalysis: riskAnalysis
            });

            // 4. Generate personalized insights
            const insights = this.insightsGenerator.generateInsights({
                statements: userStatements,
                riskAnalysis: riskAnalysis,
                healthScore: healthScore
            });

            return {
                enhancedTransactions,
                riskAnalysis,
                financialHealthScore: healthScore,
                insights,
                processedAt: new Date()
            };
        } catch (error) {
            console.error('Error in ML analysis:', error);
            throw error;
        }
    }

    /**
     * Analyze all user statements and return comprehensive analytics
     * @param {Array} statements - All user statements
     * @returns {Object} - Complete ML analytics
     */
    async analyzeUserFinancials(statements) {
        try {
            if (!statements || statements.length === 0) {
                return this.getEmptyAnalytics();
            }

            // Extract all transactions for training
            const allTransactions = [];
            statements.forEach(stmt => {
                if (stmt.mlResults && stmt.mlResults.expenses) {
                    allTransactions.push(...stmt.mlResults.expenses);
                }
            });

            // Train/update models if we have data
            if (allTransactions.length > 0 && !this.isInitialized) {
                await this.initialize(allTransactions);
            }

            // Perform comprehensive risk analysis
            const riskAnalysis = this.riskAnalyzer.analyzeComprehensive(statements);

            // Calculate financial health score
            const healthScore = this.healthScorer.calculateHealthScore({
                statements: statements,
                riskAnalysis: riskAnalysis
            });

            // Generate insights
            const insights = this.insightsGenerator.generateInsights({
                statements: statements,
                riskAnalysis: riskAnalysis,
                healthScore: healthScore
            });

            // Calculate category predictions for latest statement
            let categoryPredictions = [];
            if (statements.length > 0) {
                const latestStatement = statements[statements.length - 1];
                const transactions = latestStatement.mlResults?.expenses || [];
                categoryPredictions = this.categoryPredictor.batchPredict(transactions);
            }

            return {
                riskAnalysis,
                financialHealthScore: healthScore,
                insights,
                categoryPredictions: categoryPredictions.slice(0, 10), // Top 10
                summary: this.generateSummary(riskAnalysis, healthScore, insights),
                processedAt: new Date()
            };
        } catch (error) {
            console.error('Error analyzing user financials:', error);
            throw error;
        }
    }

    /**
     * Re-categorize transactions using ML
     * @param {Array} transactions - Transactions to re-categorize
     * @returns {Array} - Transactions with updated categories
     */
    async recategorizeTransactions(transactions) {
        try {
            return this.categoryPredictor.batchPredict(transactions);
        } catch (error) {
            console.error('Error recategorizing transactions:', error);
            throw error;
        }
    }

    /**
     * Get risk analysis only
     * @param {Array} statements - User statements
     * @returns {Object} - Risk analysis
     */
    async getRiskAnalysis(statements) {
        try {
            return this.riskAnalyzer.analyzeComprehensive(statements);
        } catch (error) {
            console.error('Error getting risk analysis:', error);
            throw error;
        }
    }

    /**
     * Get financial health score only
     * @param {Array} statements - User statements
     * @param {Object} riskAnalysis - Optional pre-computed risk analysis
     * @returns {Object} - Health score
     */
    async getHealthScore(statements, riskAnalysis = null) {
        try {
            if (!riskAnalysis) {
                riskAnalysis = this.riskAnalyzer.analyzeComprehensive(statements);
            }

            return this.healthScorer.calculateHealthScore({
                statements: statements,
                riskAnalysis: riskAnalysis
            });
        } catch (error) {
            console.error('Error getting health score:', error);
            throw error;
        }
    }

    /**
     * Get insights only
     * @param {Array} statements - User statements
     * @param {Object} riskAnalysis - Optional pre-computed risk analysis
     * @param {Object} healthScore - Optional pre-computed health score
     * @returns {Array} - Insights
     */
    async getInsights(statements, riskAnalysis = null, healthScore = null) {
        try {
            if (!riskAnalysis) {
                riskAnalysis = this.riskAnalyzer.analyzeComprehensive(statements);
            }

            if (!healthScore) {
                healthScore = this.healthScorer.calculateHealthScore({
                    statements: statements,
                    riskAnalysis: riskAnalysis
                });
            }

            return this.insightsGenerator.generateInsights({
                statements: statements,
                riskAnalysis: riskAnalysis,
                healthScore: healthScore
            });
        } catch (error) {
            console.error('Error getting insights:', error);
            throw error;
        }
    }

    /**
     * Evaluate category predictor performance
     * @param {Array} testTransactions - Transactions with known categories
     * @returns {Object} - Performance metrics
     */
    async evaluateCategoryModel(testTransactions) {
        try {
            return this.categoryPredictor.evaluate(testTransactions);
        } catch (error) {
            console.error('Error evaluating category model:', error);
            throw error;
        }
    }

    /**
     * Generate executive summary
     */
    generateSummary(riskAnalysis, healthScore, insights) {
        const criticalInsights = insights.filter(i => i.priority === 'critical' || i.priority === 'high');

        return {
            healthGrade: healthScore.grade || 'N/A',
            healthScore: healthScore.score || 0,
            riskLevel: riskAnalysis.riskLevel || 'unknown',
            riskScore: riskAnalysis.compositeRiskScore || 0,
            criticalAlerts: riskAnalysis.alerts?.filter(a => a.severity === 'critical').length || 0,
            highPriorityInsights: criticalInsights.length,
            overallStatus: this.determineOverallStatus(healthScore.score, riskAnalysis.compositeRiskScore),
            topRecommendation: insights.find(i => i.actionable)?.action || 'Continue monitoring your finances'
        };
    }

    determineOverallStatus(healthScore, riskScore) {
        if (healthScore >= 80 && riskScore < 30) return 'excellent';
        if (healthScore >= 60 && riskScore < 50) return 'good';
        if (healthScore >= 40 && riskScore < 60) return 'fair';
        if (riskScore >= 75 || healthScore < 30) return 'critical';
        return 'needs_attention';
    }

    getEmptyAnalytics() {
        return {
            riskAnalysis: this.riskAnalyzer.analyzeComprehensive([]),
            financialHealthScore: this.healthScorer.calculateHealthScore({ statements: [], riskAnalysis: null }),
            insights: [],
            categoryPredictions: [],
            summary: {
                healthGrade: 'N/A',
                healthScore: 0,
                riskLevel: 'insufficient_data',
                riskScore: 0,
                criticalAlerts: 0,
                highPriorityInsights: 0,
                overallStatus: 'insufficient_data',
                topRecommendation: 'Upload bank statements to get started'
            },
            processedAt: new Date()
        };
    }
}

// Export singleton instance
module.exports = new MLService();
