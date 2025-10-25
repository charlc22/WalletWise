#!/usr/bin/env python3
"""
Universal Bank Statement Parser
Uses pattern matching and heuristics to parse statements from any bank.
Falls back to this when specific parsers aren't available.
"""

import sys
import re
import json
import argparse
from datetime import datetime
from collections import defaultdict

try:
    import pdfplumber
except ImportError:
    print(json.dumps({"error": "pdfplumber not installed"}))
    sys.exit(1)

# Universal transaction patterns (date + description + amount)
TRANSACTION_PATTERNS = [
    # MM/DD/YYYY or MM/DD/YY formats
    r'(\d{1,2}/\d{1,2}(?:/\d{2,4})?)\s+([^\$\-\d]+?)\s+[\$]?([\-\d,]+\.\d{2})',
    # MM-DD-YYYY or MM-DD-YY formats
    r'(\d{1,2}-\d{1,2}(?:-\d{2,4})?)\s+([^\$\-\d]+?)\s+[\$]?([\-\d,]+\.\d{2})',
    # DD/MM/YYYY formats (international)
    r'(\d{1,2}/\d{1,2}/\d{4})\s+(.+?)\s+[\$]?([\-\d,]+\.\d{2})',
    # Date with month name
    r'([A-Z][a-z]{2,8}\s+\d{1,2},?\s+\d{4})\s+(.+?)\s+[\$]?([\-\d,]+\.\d{2})',
]

# Keywords for categorizing transactions
CATEGORY_KEYWORDS = {
    'E-Commerce': ['amazon', 'ebay', 'etsy', 'paypal', 'online', 'web'],
    'Subscriptions & Streaming': ['netflix', 'spotify', 'hulu', 'disney', 'subscription', 'adobe', 'premium'],
    'Groceries': ['grocery', 'supermarket', 'whole foods', 'trader joe', 'kroger', 'safeway', 'food mart'],
    'Convenience Stores': ['7-eleven', 'cvs', 'walgreens', 'convenience'],
    'Restaurants & Fast Food': ['restaurant', 'cafe', 'coffee', 'mcdonald', 'starbucks', 'pizza', 'burger', 'taco', 'chipotle'],
    'Utilities': ['electric', 'gas', 'water', 'internet', 'phone', 'utility', 'power', 'verizon', 'at&t', 'comcast'],
    'Travel & Transportation': ['uber', 'lyft', 'airline', 'hotel', 'flight', 'airbnb', 'shell', 'chevron', 'parking', 'gas'],
    'Entertainment & Recreation': ['movie', 'theater', 'cinema', 'concert', 'ticket', 'game', 'steam', 'playstation'],
    'Health & Fitness': ['gym', 'fitness', 'health', 'medical', 'doctor', 'pharmacy', 'hospital', 'wellness'],
    'Retail & Clothing': ['clothing', 'apparel', 'fashion', 'nike', 'adidas', 'macy', 'nordstrom', 'gap', 'zara'],
    'Automotive & Gas': ['auto', 'car', 'fuel', 'mechanic', 'repair', 'vehicle', 'exxon', 'bp', 'mobil'],
    'Education & Learning': ['education', 'school', 'university', 'college', 'course', 'tuition', 'coursera', 'udemy'],
    'Home Improvement': ['home depot', 'lowes', 'hardware', 'furniture', 'ikea'],
    'Insurance': ['insurance', 'geico', 'state farm', 'progressive', 'allstate'],
    'Charity & Donations': ['charity', 'donation', 'nonprofit', 'foundation', 'relief'],
    'Financial Services & Banks': ['bank fee', 'atm', 'transfer fee', 'interest charge', 'wire transfer'],
}

def parse_arguments():
    parser = argparse.ArgumentParser(description="Universal bank statement parser")
    parser.add_argument("pdf_path", help="Path to the PDF file")
    parser.add_argument("--debug", action="store_true", help="Enable debug output")
    return parser.parse_args()

def extract_text_from_pdf(pdf_path):
    """Extract all text from PDF"""
    try:
        with pdfplumber.open(pdf_path) as pdf:
            text = ""
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
            return text
    except Exception as e:
        print(f"Error extracting PDF text: {e}", file=sys.stderr)
        return ""

def detect_date_format(date_str):
    """Detect and normalize date format"""
    # Try different date formats
    formats = [
        r'(\d{1,2})/(\d{1,2})/(\d{2,4})',  # MM/DD/YYYY or MM/DD/YY
        r'(\d{1,2})-(\d{1,2})-(\d{2,4})',  # MM-DD-YYYY or MM-DD-YY
        r'(\d{1,2})\.(\d{1,2})\.(\d{2,4})',  # MM.DD.YYYY
    ]

    for fmt in formats:
        match = re.match(fmt, date_str)
        if match:
            month, day, year = match.groups()
            if len(year) == 2:
                year = '20' + year
            return f"{month.zfill(2)}/{day.zfill(2)}"

    # Try month name format
    month_match = re.match(r'([A-Z][a-z]+)\s+(\d{1,2}),?\s+(\d{4})', date_str)
    if month_match:
        month_name, day, year = month_match.groups()
        month_map = {
            'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04',
            'May': '05', 'Jun': '06', 'Jul': '07', 'Aug': '08',
            'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12',
            'January': '01', 'February': '02', 'March': '03', 'April': '04',
            'June': '06', 'July': '07', 'August': '08', 'September': '09',
            'October': '10', 'November': '11', 'December': '12'
        }
        month_num = month_map.get(month_name, '01')
        return f"{month_num}/{day.zfill(2)}"

    return date_str

def categorize_transaction(description):
    """Categorize transaction based on description"""
    desc_lower = description.lower()

    for category, keywords in CATEGORY_KEYWORDS.items():
        for keyword in keywords:
            if keyword in desc_lower:
                return category

    return 'Other'

def parse_amount(amount_str):
    """Parse amount string to float"""
    # Remove commas and whitespace
    cleaned = amount_str.replace(',', '').replace('$', '').strip()

    # Handle negative amounts
    if cleaned.startswith('-') or cleaned.startswith('('):
        cleaned = cleaned.replace('(', '').replace(')', '')
        return -abs(float(cleaned))

    return float(cleaned)

def extract_transactions(text, debug=False):
    """Extract transactions using multiple pattern matching approaches"""
    transactions = []
    lines = text.split('\n')

    # Try each transaction pattern
    for pattern in TRANSACTION_PATTERNS:
        for line in lines:
            matches = re.finditer(pattern, line, re.IGNORECASE)
            for match in matches:
                try:
                    date_str = match.group(1)
                    description = match.group(2).strip()
                    amount_str = match.group(3)

                    # Skip invalid entries
                    if not description or len(description) < 3:
                        continue

                    # Skip header rows
                    if any(word in description.lower() for word in ['date', 'description', 'amount', 'balance', 'total']):
                        continue

                    date = detect_date_format(date_str)
                    amount = parse_amount(amount_str)

                    # Determine transaction type
                    tx_type = 'debit' if amount < 0 else 'credit'
                    amount = abs(amount)

                    # Categorize
                    category = categorize_transaction(description)

                    transaction = {
                        'date': date,
                        'description': description[:100],  # Limit description length
                        'amount': round(amount, 2),
                        'type': tx_type,
                        'category': category
                    }

                    # Avoid duplicates
                    if transaction not in transactions:
                        transactions.append(transaction)

                except (ValueError, IndexError) as e:
                    if debug:
                        print(f"Error parsing line: {line[:100]}, error: {e}", file=sys.stderr)
                    continue

    # Remove duplicates based on date, description, and amount
    unique_transactions = []
    seen = set()

    for tx in transactions:
        key = (tx['date'], tx['description'], tx['amount'])
        if key not in seen:
            seen.add(key)
            unique_transactions.append(tx)

    return unique_transactions

def calculate_summary(transactions):
    """Calculate transaction summary"""
    total_debits = sum(tx['amount'] for tx in transactions if tx['type'] == 'debit')
    total_credits = sum(tx['amount'] for tx in transactions if tx['type'] == 'credit')
    net_change = total_credits - total_debits

    return {
        'totalTransactions': len(transactions),
        'totalDebits': round(total_debits, 2),
        'totalCredits': round(total_credits, 2),
        'netChange': round(net_change, 2)
    }

def calculate_category_breakdown(transactions):
    """Calculate spending by category"""
    breakdown = defaultdict(float)

    for tx in transactions:
        if tx['type'] == 'debit':
            breakdown[tx['category']] += tx['amount']

    return {k: round(v, 2) for k, v in breakdown.items()}

def parse_bank_statement(pdf_path, debug=False):
    """Main parsing function"""
    if debug:
        print(f"Parsing statement: {pdf_path}", file=sys.stderr)

    text = extract_text_from_pdf(pdf_path)

    if not text.strip():
        return {
            'error': 'Failed to extract text from PDF',
            'transactions': [],
            'summary': {},
            'categoryBreakdown': {}
        }

    transactions = extract_transactions(text, debug)

    if debug:
        print(f"Found {len(transactions)} transactions", file=sys.stderr)

    if len(transactions) == 0:
        return {
            'warning': 'No transactions found. The PDF format may not be supported.',
            'transactions': [],
            'summary': {
                'totalTransactions': 0,
                'totalDebits': 0,
                'totalCredits': 0,
                'netChange': 0
            },
            'categoryBreakdown': {},
            'bankIdentifier': 'Unknown'
        }

    summary = calculate_summary(transactions)
    category_breakdown = calculate_category_breakdown(transactions)

    return {
        'transactions': transactions,
        'summary': summary,
        'categoryBreakdown': category_breakdown,
        'bankIdentifier': 'Universal Parser',
        'parserVersion': '1.0'
    }

def main():
    args = parse_arguments()

    try:
        result = parse_bank_statement(args.pdf_path, args.debug)
        print(json.dumps(result, indent=2))
        return 0
    except Exception as e:
        error_result = {
            'error': str(e),
            'transactions': [],
            'summary': {},
            'categoryBreakdown': {}
        }
        print(json.dumps(error_result, indent=2))
        return 1

if __name__ == "__main__":
    sys.exit(main())
