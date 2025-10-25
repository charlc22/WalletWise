#!/usr/bin/env python3
"""
Bank Statement Identifier
Analyzes PDF content to identify the bank that issued the statement.
"""

import sys
import re
import argparse

# Import pdfplumber for PDF text extraction
try:
    import pdfplumber
except ImportError:
    print("Required library not found. Please install with:", file=sys.stderr)
    print("pip install pdfplumber", file=sys.stderr)
    sys.exit(1)

# Define bank identification patterns (ordered by market share for efficiency)
BANK_PATTERNS = {
    "Chase": [
        r"chase\s+bank",
        r"jpmorgan\s+chase",
        r"chase\.com",
        r"jp\s*morgan",
        r"chase\s+total\s+checking"
    ],
    "Bank of America": [
        r"bank\s+of\s+america",
        r"bankofamerica\.com",
        r"bofa\.com",
        r"boa\s+online",
        r"b\s*of\s*a"
    ],
    "Wells Fargo": [
        r"wells\s+fargo",
        r"wf\.com",
        r"wellsfargo\.com",
        r"wells\s+fargo\s+bank"
    ],
    "Citibank": [
        r"citi\s*bank",
        r"citi\.com",
        r"citibank\.com",
        r"citi\s+online",
        r"citigroup"
    ],
    "US Bank": [
        r"u\.?s\.?\s+bank",
        r"usbank\.com",
        r"us\s+bancorp",
        r"usb\.com"
    ],
    "PNC Bank": [
        r"pnc\s+bank",
        r"pnc\.com",
        r"pnc\s+online",
        r"pnc\s+financial"
    ],
    "TD Bank": [
        r"td\s+bank",
        r"tdbank\.com",
        r"td\s+online\s+banking",
        r"td\s+ameritrade\s+bank"
    ],
    "Capital One": [
        r"capital\s+one",
        r"capitalone\.com",
        r"capital\s+one\s+bank",
        r"cap\s+one"
    ],
    "Truist": [
        r"truist",
        r"truist\s+bank",
        r"truist\.com"
    ],
    "Goldman Sachs": [
        r"goldman\s+sachs",
        r"marcus\s+by\s+goldman",
        r"gs\.com",
        r"goldman\s+online"
    ],
    "Charles Schwab": [
        r"charles\s+schwab",
        r"schwab\.com",
        r"schwab\s+bank",
        r"schwab\s+checking"
    ],
    "American Express": [
        r"american\s+express",
        r"amex",
        r"americanexpress\.com",
        r"aexp\.com"
    ],
    "Discover": [
        r"discover\s+bank",
        r"discover\.com",
        r"discover\s+card",
        r"discover\s+financial"
    ],
    "Ally Bank": [
        r"ally\s+bank",
        r"ally\.com",
        r"ally\s+financial"
    ],
    "Navy Federal": [
        r"navy\s+federal",
        r"navyfederal\.org",
        r"nfcu",
        r"navy\s+federal\s+credit\s+union"
    ],
    "USAA": [
        r"usaa",
        r"usaa\.com",
        r"usaa\s+bank",
        r"united\s+services\s+automobile"
    ],
    "Regions Bank": [
        r"regions\s+bank",
        r"regions\.com",
        r"regions\s+online"
    ],
    "KeyBank": [
        r"key\s+bank",
        r"keybank\.com",
        r"key\s+online"
    ],
    "Citizens Bank": [
        r"citizens\s+bank",
        r"citizensbank\.com",
        r"citizens\s+online"
    ],
    "Fifth Third Bank": [
        r"fifth\s+third",
        r"53\.com",
        r"fifth\s+third\s+bank"
    ],
    "BMO Harris": [
        r"bmo\s+harris",
        r"bmo\.com",
        r"bmoharris\.com",
        r"bank\s+of\s+montreal"
    ],
    "Huntington Bank": [
        r"huntington\s+bank",
        r"huntington\.com",
        r"huntington\s+national"
    ],
    "SunTrust": [
        r"suntrust",
        r"suntrust\.com",
        r"sun\s+trust\s+bank"
    ],
    "BB&T": [
        r"bb&t",
        r"bbt\.com",
        r"branch\s+banking\s+and\s+trust"
    ],
    "Santander": [
        r"santander",
        r"santander\.com",
        r"santander\s+bank"
    ],
    "HSBC": [
        r"hsbc",
        r"hsbc\.com",
        r"hsbc\s+bank"
    ],
    "Barclays": [
        r"barclays",
        r"barclays\.com",
        r"barclays\s+bank"
    ]
}

def parse_arguments():
    parser = argparse.ArgumentParser(description="Identify bank from PDF statement")
    parser.add_argument("pdf_path", help="Path to the PDF file")
    parser.add_argument("--debug", action="store_true", help="Enable debug output")
    return parser.parse_args()

def extract_text_from_pdf(pdf_path):
    """Extract text from PDF using pdfplumber"""
    try:
        with pdfplumber.open(pdf_path) as pdf:
            # For bank identification, we only need to check the first few pages
            max_pages = min(3, len(pdf.pages))
            text = ""
            for i in range(max_pages):
                extracted = pdf.pages[i].extract_text()
                if extracted:  # Only add if not None
                    text += extracted
            return text
    except Exception as e:
        print(f"Error extracting text from PDF: {e}", file=sys.stderr)
        return ""

def identify_bank(text):
    """Identify the bank based on patterns in the text"""
    text_lower = text.lower()

    for bank, patterns in BANK_PATTERNS.items():
        for pattern in patterns:
            if re.search(pattern, text_lower):
                return bank

    return "Unknown"

def main():
    args = parse_arguments()

    # Extract text from PDF
    print(f"Analyzing bank statement: {args.pdf_path}", file=sys.stderr)
    pdf_text = extract_text_from_pdf(args.pdf_path)

    if not pdf_text.strip():
        print("Failed to extract text from PDF", file=sys.stderr)
        sys.exit(1)

    # Identify the bank
    bank = identify_bank(pdf_text)
    print(f"Identified bank: {bank}", file=sys.stderr)

    # Output just the bank name for the Node.js script to capture
    print(bank)

    return 0

if __name__ == "__main__":
    sys.exit(main())