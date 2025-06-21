import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { classifyError } from '@/lib/utils';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const generationPromptTemplate = `
You are an expert full-stack developer specializing in Next.js, React, and TailwindCSS.
Your task is to write the complete, production-ready code for a single file based on the provided description and the content of its dependencies.

**File to Generate:**
Path: {filePath}
Description: "{fileDescription}"

**Project Context:**
The user wants to build: "{projectPrompt}"

**Dependencies:**
{dependencyContext}

**Instructions:**
1.  **Return ONLY the raw code** for the file specified in "File to Generate".
2.  Do not include any explanations, introductory sentences, or markdown formatting like \`\`\`tsx ... \`\`\`.
3.  Ensure the code is clean, efficient, and follows modern best practices.
4.  Pay close attention to the provided dependencies to ensure your code integrates correctly. Use the exact function names, component props, and API schemas from the dependency context.
5.  Use TypeScript and functional components with hooks.
6.  For UI, use shadcn/ui components where it makes sense, otherwise use standard TailwindCSS.

Here is the complete code for {filePath}:
`;

export async function POST(req: NextRequest) {
    try {
    const { filePath, fileDescription, dependencies, projectPrompt } = await req.json();

    if (!filePath || !fileDescription || !projectPrompt) {
      return NextResponse.json({ 
        error: 'filePath, fileDescription, and projectPrompt are required',
        type: 'validation'
      }, { status: 400 });
    }

    if (fileDescription.length < 10) {
      return NextResponse.json({ 
        error: 'File description must be at least 10 characters long',
        type: 'validation'
      }, { status: 400 });
    }

    let dependencyContext = 'No dependencies.';
    if (dependencies && Object.keys(dependencies).length > 0) {
      dependencyContext = Object.entries(dependencies)
        .map(([path, content]) => `/* File: ${path} */\n${content}`)
        .join('\n\n---\n\n');
    }

    const prompt = generationPromptTemplate
      .replace('{filePath}', filePath)
      .replace('{fileDescription}', fileDescription)
      .replace('{projectPrompt}', projectPrompt)
      .replace('{dependencyContext}', dependencyContext);

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0, // Lower temperature for more deterministic code generation
      max_tokens: 4000, // Ensure we have enough tokens for complex files
    });

    const fileContent = response.choices[0].message.content || '';

    if (!fileContent.trim()) {
      return NextResponse.json({ 
        error: 'No code generated',
        type: 'ai_error',
        details: 'The AI model returned empty code'
      }, { status: 500 });
    }

    return NextResponse.json({ fileContent });

    } catch (error) {
        console.error('Error generating file:', error);
    
    const errorInfo = classifyError(error);
    
    if (errorInfo.type === 'auth') {
      return NextResponse.json({ 
        error: 'OpenAI API key is invalid or missing',
        type: 'auth',
        details: 'Please check your OpenAI API key configuration'
      }, { status: 401 });
    }
    
    return NextResponse.json({ 
      error: 'Failed to generate file',
      type: 'unknown',
      details: errorInfo.message
    }, { status: 500 });
    }
} 