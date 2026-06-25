import Groq from 'groq-sdk';
import { NextRequest, NextResponse } from 'next/server';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { messages, userContext } = await req.json();

    const chatCompletion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 1024,
      messages: [
        {
          role: 'system',
          content: `You are an expert HR Copilot assistant for WorkFlow HRMS. You help employees with HR-related questions.
User details:
- Name: ${userContext?.name || 'Employee'}
- Role: ${userContext?.role || 'Employee'}
- Department: ${userContext?.department || 'N/A'}
- Designation: ${userContext?.designation || 'N/A'}

Key company policies:
- Leave: Casual Leave 12 days, Sick Leave 10 days, Earned Leave 15 days per year
- Attendance: Office hours 9 AM to 6 PM, grace period 15 minutes
- Salary: Paid on last working day of each month
- Expenses: Submit within 30 days with receipt attached
- Work from home: 2 days per week with manager approval
- Performance reviews: Quarterly and Annual

Keep responses concise, friendly and helpful. Use bullet points where appropriate. Answer only HR-related questions.`,
        },
        ...messages,
      ],
    });

    const reply = chatCompletion.choices[0]?.message?.content || 'Sorry, I could not process your request.';

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error('Groq API error:', error);
    return NextResponse.json(
      { error: 'Failed to get response from AI' },
      { status: 500 }
    );
  }
}