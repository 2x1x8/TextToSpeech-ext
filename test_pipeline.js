import { GoogleGenAI } from '@google/genai';
import fs from 'fs';

process.loadEnvFile();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

function extractCleanContent() {
    try {
        const htmlContent = fs.readFileSync('index.html', 'utf8');
        const paragraphRegex = /<p[^>]*>([\s\S]*?)<\/p>/gi;
        let matches;
        let textLines = [];
        
        while ((matches = paragraphRegex.exec(htmlContent)) !== null) {
            let text = matches[1].replace(/<[^>]*>/g, '').trim();
            if (text.length > 40 && !text.includes("Published on")) {
                textLines.push(text);
            }
        }
        return textLines.join('\n\n');
    } catch (err) {
        console.error("Error reading index.html:", err);
        return null;
    }
}

async function runTestPipeline() {
    console.log("1. Extracting clean content blocks from index.html...");
    const cleanArticleText = extractCleanContent();
    
    if (!cleanArticleText) {
        console.log("Failed to extract target text.");
        return;
    }
    
    console.log("\n--- Extracted Clean Content ---");
    console.log(cleanArticleText);
    console.log("-------------------------------\n");

    console.log("2. Sending text to free Gemini model (gemini-2.5-flash)...");
    
    const prompt = `
Bạn là một biên tập viên tin tức chuyên nghiệp.
Hãy tóm tắt nội dung bài báo sau đây thành một bản tóm tắt ngắn gọn, mạch lạc bằng tiếng Việt để đọc trên công cụ Text-to-Speech.
Bỏ qua mọi thông tin rác, quảng cáo, hoặc từ ngữ suồng sã không trang trọng. Nội dung tóm tắt cần tự nhiên, dễ nghe khi đọc lên:

${cleanArticleText}`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        console.log("\n=== Final Vietnamese News Summary ===");
        console.log(response.text);
        console.log("======================================\n");
        console.log("Pipeline test complete! This text is ready for VieNeu TTS.");
        
    } catch (error) {
        console.error("Gemini API Error:", error);
    }
}

runTestPipeline();