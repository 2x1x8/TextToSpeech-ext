import { GoogleGenAI } from '@google/genai';
import axios from 'axios';
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';

process.loadEnvFile();

// 1. Initialize Gemini with the API key from .env
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Target a real, live news article url to pull data from
const targetUrl = 'https://vietnamnet.vn/iran-tan-cong-can-cu-my-khap-trung-dong-tuyen-bo-doi-dau-sinh-tu-voi-washington-2536369.html'; 

async function runRealPagePipeline() {
    try {
        console.log(`1. Fetching live HTML data from: ${targetUrl}...`);
        const response = await axios.get(targetUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
        });
        
        // 2. Emulate a browser DOM state from the raw HTML payload
        const dom = new JSDOM(response.data, { url: targetUrl });
        
        // 3. Run Mozilla Readability extraction over the page
        console.log("2. Isolating core content using Readability engine...");
        const reader = new Readability(dom.window.document);
        const article = reader.parse();
        
        if (!article || !article.textContent) {
            console.error("Readability was unable to isolate any text paragraphs from this layout structure.");
            return;
        }
        
        const cleanArticleText = article.textContent.trim();
        console.log(`\n[Readability Extracted: ${article.title}]`);
        console.log(`Character count payload: ${cleanArticleText.length}\n`);

        console.log("3. Sending text to free Gemini model (gemini-2.5-flash)...");
        
        // Using your strict, non-translation executive constraint prompt configuration
        const prompt = `
Bạn là một biên tập viên tin tức chuyên nghiệp. 
Hãy tóm tắt nội dung bài báo dưới đây thành một bản tóm tắt cực kỳ ngắn gọn, cô đọng bằng tiếng Việt để đọc trên công cụ Text-to-Speech.

YÊU CẦU BẮT BUỘC:
1. Không dịch lại toàn bộ các đoạn văn.
2. Chỉ trích xuất từ 1 đến 2 ý cốt lõi quan trọng nhất của toàn bộ bài báo.
3. Viết dưới dạng 1-2 câu hoàn chỉnh, mạch lạc, phát âm tự nhiên. Không dùng tiêu đề rườm rà như "Dưới đây là bản tóm tắt...". vào thẳng nội dung tin tức luôn.

Nội dung bài báo:
${cleanArticleText}`;

        const geminiResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        console.log("\n=== Final Ultra-Concise News Summary ===");
        console.log(geminiResponse.text);
        console.log("========================================\n");
        console.log("Live page test pipeline successful!");
        
    } catch (error) {
        console.error("Pipeline processing failure:", error.message || error);
    }
}

runRealPagePipeline();