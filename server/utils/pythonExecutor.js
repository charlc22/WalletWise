// utils/pythonExecutor.js
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

/**
 * Execute a Python script with given arguments and input data
 *
 * @param {string} scriptPath - Path to the Python script
 * @param {Array} args - Arguments to pass to the script
 * @returns {Promise<{stdout: string, stderr: string, exitCode: number, parsedJson: Object}>}
 */
function executePythonScript(scriptPath, args = []) {
    return new Promise((resolve, reject) => {
        // Validate script exists
        if (!fs.existsSync(scriptPath)) {
            return reject(new Error(`Python script not found: ${scriptPath}`));
        }

        console.log(`Executing Python script: ${scriptPath}`);
        console.log(`With arguments: ${args.join(', ')}`);

        let pythonExecutable;
        const platform = os.platform();

        if (platform === 'win32') {
            const userHome = process.env.USERPROFILE;
            pythonExecutable = `${userHome}\\AppData\\Local\\Microsoft\\WindowsApps\\python.exe`;
        } else {
            pythonExecutable = '/usr/local/bin/python3';
        }

        console.log(`Resolved Python executable path: ${pythonExecutable}`);


        // Spawn Python process
        const pythonProcess = spawn(pythonExecutable, [scriptPath, ...args]);

        let stdout = '';
        let stderr = '';

        // Collect stdout
        pythonProcess.stdout.on('data', (data) => {
            stdout += data.toString();
        });

        // Collect stderr
        pythonProcess.stderr.on('data', (data) => {
            stderr += data.toString();
        });

        // Handle process completion
        pythonProcess.on('close', (exitCode) => {
            console.log(`Python process exited with code ${exitCode}`);

            if (exitCode !== 0) {
                console.error(`Python script error (${exitCode}): ${stderr}`);
                return reject(new Error(`Python script exited with code ${exitCode}: ${stderr}`));
            }

            // Extract JSON from the stdout
            let jsonData = null;
            const jsonStartIndex = stdout.indexOf('{');

            if (jsonStartIndex !== -1) {
                try {
                    const jsonString = stdout.substring(jsonStartIndex);
                    jsonData = JSON.parse(jsonString);
                    console.log('Successfully parsed JSON output from Python script');
                } catch (jsonError) {
                    console.error('Error parsing JSON from Python output:', jsonError);
                    console.log('Raw output snippet:', stdout.substring(jsonStartIndex, jsonStartIndex + 100) + '...');
                    return reject(new Error(`Failed to parse JSON from Python output: ${jsonError.message}`));
                }
            } else {
                console.warn('No JSON data found in Python script output');
            }

            resolve({
                stdout,
                stderr,
                exitCode,
                parsedJson: jsonData  // Include the parsed JSON in the response
            });
        });

        // Handle process errors
        pythonProcess.on('error', (err) => {
            console.error(`Failed to start Python process: ${err.message}`);
            reject(new Error(`Failed to execute Python script: ${err.message}`));
        });
    });
}

/**
 * Identify the bank from a PDF statement
 *
 * @param {string} pdfPath - Path to the PDF file
 * @returns {Promise<string>} - The identified bank name
 */
async function identifyBankFromPdf(pdfPath) {
    try {
        const identifierScript = path.join(__dirname, '..', 'scripts', 'bank_identifier.py');

        if (!fs.existsSync(identifierScript)) {
            console.error(`Bank identifier script not found: ${identifierScript}`);
            return "Unknown";
        }

        const result = await executePythonScript(identifierScript, [pdfPath]);

        // The bank identifier outputs just the bank name on the last line
        const bankName = result.stdout.trim();
        console.log(`Identified bank: ${bankName}`);

        return bankName;
    } catch (error) {
        console.error('Error identifying bank:', error);
        return "Unknown";
    }
}

/**
 * Get the appropriate parser script for a bank
 *
 * @param {string} bankName - The identified bank name
 * @returns {string} - Path to the parser script
 */
function getParserForBank(bankName) {
    const scriptsDir = path.join(__dirname, '..', 'scripts');

    // Map bank names to parser scripts (only for banks with specific parsers)
    const parserMap = {
        "Wells Fargo": "wellsfargo_parser.py",
        "TD Bank": "tdbank_parser.py",
        "Chase": "chase_parser.py"
    };

    const parserFile = parserMap[bankName];

    // If we have a specific parser for this bank, try to use it
    if (parserFile) {
        const parserPath = path.join(scriptsDir, parserFile);
        if (fs.existsSync(parserPath)) {
            return parserPath;
        }
    }

    // Fallback to universal parser for all other banks
    console.log(`Using universal parser for ${bankName}`);
    return path.join(scriptsDir, "universal_parser.py");
}

/**
 * Parse a bank statement PDF
 *
 * @param {string} pdfPath - Path to the PDF file
 * @returns {Promise<Object>} - The parsed data
 */
async function parseBankStatement(pdfPath) {
    try {
        // First identify the bank
        const bankName = await identifyBankFromPdf(pdfPath);

        // Get the appropriate parser
        const parserScript = getParserForBank(bankName);
        console.log(`Using parser: ${parserScript} for bank: ${bankName}`);

        let result;
        try {
            // Execute the parser
            result = await executePythonScript(parserScript, [pdfPath]);

            // Check if parsing was successful
            if (!result.parsedJson || !result.parsedJson.transactions || result.parsedJson.transactions.length === 0) {
                throw new Error('Parser returned no transactions');
            }
        } catch (parserError) {
            // If the specific parser failed, try the universal parser as fallback
            console.warn(`Specific parser failed for ${bankName}, trying universal parser:`, parserError.message);

            const universalParser = path.join(__dirname, '..', 'scripts', 'universal_parser.py');
            result = await executePythonScript(universalParser, [pdfPath]);

            if (result.parsedJson) {
                result.parsedJson.bankIdentifier = bankName + ' (Universal Parser)';
            }
        }

        // Add bank identifier to the result if not already present
        if (result.parsedJson && !result.parsedJson.bankIdentifier) {
            result.parsedJson.bankIdentifier = bankName;
        }

        return result;
    } catch (error) {
        console.error('Error parsing bank statement:', error);
        throw error;
    }
}

module.exports = {
    executePythonScript,
    identifyBankFromPdf,
    getParserForBank,
    parseBankStatement
};