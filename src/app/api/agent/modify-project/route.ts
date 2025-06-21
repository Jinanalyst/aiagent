import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GeneratedFile } from '@/types';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `
You are an expert AI programmer who is helping a user build a new web application.
The user has provided you with a prompt and a list of files that are already part of the project.
Your task is to analyze the prompt and determine which files to modify and how.
You must respond with a JSON object containing a "files" array, where each object has a "path" and "content".
Do not create new files unless absolutely necessary. Focus on modifying existing files.
If you need to modify a file, return the full file content, not just the diffs.
If the prompt is unclear or you cannot determine which files to modify, return an error.
Here is the current file structure and content:
`;

export async function POST(req: NextRequest) {
    try {
        const { files, prompt, model = 'gpt-4o' } = await req.json();

        if (!files || !prompt) {
            return NextResponse.json({ error: 'Missing files or prompt' }, { status: 400 });
        }

        const fileDetails = files.map((file: GeneratedFile) => `
File: ${file.path}
---
${file.content}
---
`).join('\n');

        const fullPrompt = `${SYSTEM_PROMPT}\n${fileDetails}\n\nUser Prompt: ${prompt}`;
        let content: string | null = null;
        
        if (model.startsWith('gpt')) {
            const response = await openai.chat.completions.create({
                model: model,
                messages: [{ role: 'system', content: fullPrompt }],
                response_format: { type: "json_object" },
            });
            content = response.choices[0].message.content;
        } else if (model.startsWith('claude')) {
            const response = await anthropic.messages.create({
                model: model,
                max_tokens: 4096,
                system: SYSTEM_PROMPT,
                messages: [{ 
                    role: 'user', 
                    content: `Here is the current file structure:\n${fileDetails}\n\nUser Prompt: ${prompt}`
                }],
            });
            const textBlock = response.content.find(block => block.type === 'text');
            content = textBlock ? textBlock.text : null;
        } else {
            return NextResponse.json({ error: 'Unsupported model' }, { status: 400 });
        }

        if (!content) {
            return NextResponse.json({ error: 'No content in response' }, { status: 500 });
        }
        
        const jsonMatch = content.match(/```json\n([\s\S]*?)\n```|({[\s\S]*})/);
        const jsonString = jsonMatch ? (jsonMatch[1] || jsonMatch[2]) : content;

        const result = JSON.parse(jsonString);

        return NextResponse.json({ files: result.files });

    } catch (error) {
        console.error('Error generating file:', error);
        return NextResponse.json({ error: 'Failed to generate file' }, { status: 500 });
    }
} 