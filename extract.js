const fs = require('fs');

const transcriptPath = "C:\\Users\\sivar\\.gemini\\antigravity\\brain\\4b4f8a87-0c43-4e6b-b44f-862c50cb6146\\.system_generated\\logs\\transcript_full.jsonl";
const lines = fs.readFileSync(transcriptPath, 'utf8').split('\n');

let appJsExtracted = false;

for (const line of lines) {
    if (!line.trim()) continue;
    try {
        const step = JSON.parse(line);
        if (step.type === 'VIEW_FILE' && step.content) {
            
            // Check if it's app.js
            if (!appJsExtracted && step.content.includes('File Path: `file:///e:/calander%20project/app.js`')) {
                const linesOfFile = step.content.split('\n');
                let codeLines = [];
                let isRecording = false;
                for (const l of linesOfFile) {
                    if (l.includes('The following code has been modified')) {
                        isRecording = true;
                        continue;
                    }
                    if (l.includes('The above content does NOT show') || l.includes('The above content DOES show')) {
                        isRecording = false;
                        continue;
                    }
                    if (isRecording) {
                        const match = l.match(/^\d+:\s?(.*)$/);
                        if (match) {
                            codeLines.push(match[1]);
                        }
                    }
                }
                
                // Wait! The transcript ONLY SHOWS THE LINES THAT WERE REQUESTED (e.g. 1 to 50)!
                // I cannot extract the FULL file from VIEW_FILE if the agent only viewed a slice!
                console.log('Found VIEW_FILE for app.js, lines extracted:', codeLines.length);
            }
        }
    } catch (e) {}
}
