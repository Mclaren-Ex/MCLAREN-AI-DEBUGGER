import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function debugCode(code, language = 'javascript') {
    const prompt = `
As a senior McLaren software engineer, analyze this ${language} code and provide a comprehensive debugging report.

**Code to Analyze:**
\`\`\`${language}
${code}
\`\`\`

**Required Response Format (JSON):**
{
    "explanation": "Clear, concise explanation of the issues found",
    "fixedCode": "Complete corrected code with proper formatting",
    "fixExplanation": "Detailed breakdown of why the fixes work",
    "severity": "low|medium|high",
    "tips": ["Practical tip 1", "Practical tip 2"]
}

Focus on:
- Identifying logical errors, syntax issues, and potential bugs
- Providing production-ready fixes
- Explaining concepts clearly
- Offering performance and best practice tips
`;

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Extract JSON from response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Invalid response format from AI');
        }

        const debugResult = JSON.parse(jsonMatch[0]);
        return debugResult;

    } catch (error) {
        console.error('Gemini API error:', error);
        throw new Error('AI service temporarily unavailable');
    }
}
