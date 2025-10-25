// models/BankStatement.js
const mongoose = require('mongoose');

// Define schema for transaction entries
const transactionSchema = new mongoose.Schema({
    date: {
        type: String,  // Store as MM/DD format from Wells Fargo
        required: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    amount: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        required: true,
        default: 'Other'
    },
    type: {
        type: String,
        enum: ['debit', 'credit'],
        default: 'debit'
    }
});

const bankStatementSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        index: true,
        ref: 'User'
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    fileName: {
        type: String,
        required: true
    },
    pdfData: {
        type: Buffer,
        required: true
    },
    uploadDate: {
        type: Date,
        default: Date.now
    },
    isProcessed: {
        type: Boolean,
        default: false
    },
    processingError: {
        type: String,
        default: null
    },
    mlResults: {
        expenses: [transactionSchema],
        totalExpenses: Number,
        totalCredits: Number,
        totalTransactions: Number,
        processedDate: Date,
        categoryBreakdown: mongoose.Schema.Types.Mixed,  // Store as a simple object

        // ML-Enhanced Analytics
        riskAnalysis: {
            compositeRiskScore: Number,
            riskLevel: String,
            timestamp: Date,
            dimensions: {
                fraudRisk: mongoose.Schema.Types.Mixed,
                cashFlowRisk: mongoose.Schema.Types.Mixed,
                overspendingRisk: mongoose.Schema.Types.Mixed,
                liquidityRisk: mongoose.Schema.Types.Mixed,
                concentrationRisk: mongoose.Schema.Types.Mixed
            },
            alerts: [mongoose.Schema.Types.Mixed],
            recommendations: [mongoose.Schema.Types.Mixed]
        },

        financialHealthScore: {
            score: Number,
            grade: String,
            level: String,
            timestamp: Date,
            dimensions: mongoose.Schema.Types.Mixed,
            insights: [mongoose.Schema.Types.Mixed],
            recommendations: [mongoose.Schema.Types.Mixed],
            benchmarkComparison: mongoose.Schema.Types.Mixed
        },

        insights: [mongoose.Schema.Types.Mixed],

        categoryPredictions: [{
            transactionId: String,
            predictedCategory: String,
            confidence: Number,
            alternatives: [mongoose.Schema.Types.Mixed]
        }]
    }
});

// Simple index for quick user-based queries
bankStatementSchema.index({ userId: 1, uploadDate: -1 });

const BankStatement = mongoose.model('BankStatement', bankStatementSchema);

module.exports = BankStatement;