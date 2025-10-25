// ml/models/categoryPredictor.js
// Smart Category Prediction using TF-IDF and Machine Learning

const natural = require('natural');
const TfIdf = natural.TfIdf;

class CategoryPredictor {
    constructor() {
        // Pre-defined categories with enhanced keyword patterns
        this.categories = {
            'E-Commerce': {
                keywords: ['amazon', 'ebay', 'etsy', 'walmart', 'target', 'online', 'marketplace', 'shop'],
                patterns: /amazon|ebay|etsy|walmart|target|shop/i
            },
            'Subscriptions & Streaming': {
                keywords: ['netflix', 'spotify', 'hulu', 'disney', 'subscription', 'monthly', 'premium', 'pro'],
                patterns: /netflix|spotify|hulu|disney|subscription|adobe|saas/i
            },
            'Groceries': {
                keywords: ['grocery', 'supermarket', 'market', 'food', 'whole foods', 'trader joe', 'kroger', 'safeway'],
                patterns: /grocery|supermarket|whole foods|trader joe|kroger|safeway|food mart/i
            },
            'Convenience Stores': {
                keywords: ['7-eleven', 'convenience', 'cvs', 'walgreens', 'corner store'],
                patterns: /7-eleven|cvs|walgreens|convenience/i
            },
            'Restaurants & Fast Food': {
                keywords: ['restaurant', 'cafe', 'mcdonald', 'starbucks', 'pizza', 'burger', 'taco', 'food', 'dining'],
                patterns: /restaurant|cafe|coffee|mcdonald|starbucks|pizza|burger|taco|dining|chipotle|subway/i
            },
            'Utilities': {
                keywords: ['electric', 'gas', 'water', 'internet', 'phone', 'utility', 'power', 'energy'],
                patterns: /electric|gas|water|internet|phone|utility|power|energy|verizon|at&t|comcast/i
            },
            'Travel & Transportation': {
                keywords: ['uber', 'lyft', 'airline', 'hotel', 'flight', 'airbnb', 'travel', 'transport', 'gas station', 'parking'],
                patterns: /uber|lyft|airline|hotel|flight|airbnb|travel|shell|chevron|parking|taxi/i
            },
            'Entertainment & Recreation': {
                keywords: ['movie', 'theater', 'concert', 'event', 'ticket', 'entertainment', 'game', 'recreation'],
                patterns: /movie|theater|cinema|concert|ticket|entertainment|game|steam|playstation|xbox/i
            },
            'Health & Fitness': {
                keywords: ['gym', 'fitness', 'health', 'medical', 'doctor', 'pharmacy', 'hospital', 'clinic'],
                patterns: /gym|fitness|health|medical|doctor|pharmacy|hospital|clinic|wellness/i
            },
            'Retail & Clothing': {
                keywords: ['clothing', 'apparel', 'fashion', 'nike', 'adidas', 'retail', 'department store'],
                patterns: /clothing|apparel|fashion|nike|adidas|retail|macy|nordstrom|gap|h&m|zara/i
            },
            'Automotive & Gas': {
                keywords: ['auto', 'car', 'gas', 'fuel', 'mechanic', 'repair', 'vehicle', 'chevron', 'shell'],
                patterns: /auto|car|gas|fuel|mechanic|repair|vehicle|chevron|shell|exxon|bp|mobil/i
            },
            'Education & Learning': {
                keywords: ['education', 'school', 'university', 'college', 'course', 'learning', 'tuition', 'books'],
                patterns: /education|school|university|college|course|learning|tuition|coursera|udemy/i
            },
            'Home Improvement': {
                keywords: ['home depot', 'lowes', 'hardware', 'improvement', 'furniture', 'ikea', 'home'],
                patterns: /home depot|lowes|hardware|improvement|furniture|ikea/i
            },
            'Insurance': {
                keywords: ['insurance', 'geico', 'state farm', 'progressive', 'allstate', 'premium'],
                patterns: /insurance|geico|state farm|progressive|allstate/i
            },
            'Charity & Donations': {
                keywords: ['charity', 'donation', 'nonprofit', 'foundation', 'relief'],
                patterns: /charity|donation|nonprofit|foundation|relief|fundrais/i
            },
            'Financial Services & Banks': {
                keywords: ['bank', 'fee', 'atm', 'transfer', 'payment', 'interest', 'finance'],
                patterns: /bank fee|atm|transfer fee|interest charge|payment processing|wire transfer/i
            },
            'Other': {
                keywords: ['misc', 'other', 'unknown'],
                patterns: /.*/
            }
        };

        this.tfidf = new TfIdf();
        this.trainingData = [];
    }

    /**
     * Train the model on existing categorized transactions
     * @param {Array} transactions - Array of {description, category, amount}
     */
    train(transactions) {
        this.trainingData = transactions;

        // Build TF-IDF corpus for each category
        const categoryDocs = {};

        transactions.forEach(tx => {
            if (!categoryDocs[tx.category]) {
                categoryDocs[tx.category] = [];
            }
            categoryDocs[tx.category].push(tx.description.toLowerCase());
        });

        // Add documents to TF-IDF
        Object.keys(categoryDocs).forEach(category => {
            const combinedDoc = categoryDocs[category].join(' ');
            this.tfidf.addDocument(combinedDoc, category);
        });

        console.log(`✓ Category predictor trained on ${transactions.length} transactions`);
    }

    /**
     * Predict category for a transaction with confidence score
     * @param {String} description - Transaction description
     * @param {Number} amount - Transaction amount (optional, for context)
     * @returns {Object} - {category, confidence, alternatives}
     */
    predict(description, amount = 0) {
        const desc = description.toLowerCase();
        const scores = {};

        // 1. Pattern matching with weighted scoring
        let maxPatternScore = 0;
        let patternCategory = 'Other';

        Object.entries(this.categories).forEach(([category, config]) => {
            if (config.patterns.test(desc)) {
                // Calculate match strength based on keyword count
                const matchCount = config.keywords.filter(kw =>
                    desc.includes(kw.toLowerCase())
                ).length;

                const patternScore = (matchCount / config.keywords.length) * 100;

                if (patternScore > maxPatternScore) {
                    maxPatternScore = patternScore;
                    patternCategory = category;
                }

                scores[category] = (scores[category] || 0) + patternScore * 0.6;
            }
        });

        // 2. TF-IDF similarity scoring (if trained)
        if (this.trainingData.length > 0) {
            this.tfidf.tfidfs(desc, (i, measure, category) => {
                if (category) {
                    scores[category] = (scores[category] || 0) + measure * 40;
                }
            });
        }

        // 3. Amount-based heuristics
        if (amount > 0) {
            // High-value transactions are more likely certain categories
            if (amount > 500) {
                scores['Travel & Transportation'] = (scores['Travel & Transportation'] || 0) + 5;
                scores['Education & Learning'] = (scores['Education & Learning'] || 0) + 5;
                scores['Insurance'] = (scores['Insurance'] || 0) + 5;
            }
            // Small recurring amounts suggest subscriptions
            if (amount < 20) {
                scores['Subscriptions & Streaming'] = (scores['Subscriptions & Streaming'] || 0) + 10;
            }
        }

        // Find top category
        const sortedScores = Object.entries(scores)
            .sort((a, b) => b[1] - a[1]);

        if (sortedScores.length === 0) {
            return {
                category: 'Other',
                confidence: 0,
                alternatives: []
            };
        }

        const topCategory = sortedScores[0][0];
        const topScore = sortedScores[0][1];
        const totalScore = sortedScores.reduce((sum, [, score]) => sum + score, 0);

        // Normalize confidence to 0-100%
        const confidence = totalScore > 0 ? Math.min((topScore / totalScore) * 100, 100) : 0;

        // Get alternative predictions
        const alternatives = sortedScores.slice(1, 4).map(([cat, score]) => ({
            category: cat,
            confidence: totalScore > 0 ? (score / totalScore) * 100 : 0
        }));

        return {
            category: topCategory,
            confidence: Math.round(confidence * 100) / 100,
            alternatives: alternatives.filter(alt => alt.confidence > 10)
        };
    }

    /**
     * Batch predict categories for multiple transactions
     * @param {Array} transactions - Array of transaction objects
     * @returns {Array} - Transactions with predicted categories
     */
    batchPredict(transactions) {
        return transactions.map(tx => {
            const prediction = this.predict(tx.description, tx.amount);
            return {
                ...tx,
                predictedCategory: prediction.category,
                categoryConfidence: prediction.confidence,
                categoryAlternatives: prediction.alternatives
            };
        });
    }

    /**
     * Evaluate model performance on test data
     * @param {Array} testTransactions - Array with known categories
     * @returns {Object} - Performance metrics
     */
    evaluate(testTransactions) {
        let correct = 0;
        let total = testTransactions.length;

        const confusionMatrix = {};

        testTransactions.forEach(tx => {
            const prediction = this.predict(tx.description, tx.amount);
            const actual = tx.category;
            const predicted = prediction.category;

            if (actual === predicted) {
                correct++;
            }

            if (!confusionMatrix[actual]) {
                confusionMatrix[actual] = {};
            }
            confusionMatrix[actual][predicted] = (confusionMatrix[actual][predicted] || 0) + 1;
        });

        const accuracy = (correct / total) * 100;

        return {
            accuracy: Math.round(accuracy * 100) / 100,
            correct,
            total,
            confusionMatrix
        };
    }
}

module.exports = CategoryPredictor;
