import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const agents = ["AI1", "AI2", "AI3", "AI4", "AI5"];

export async function POST(req: Request) {
  try {
    const { topic, transcript, agentIndex } = await req.json();
    const agent = agents[agentIndex];

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const context = transcript.map((t: any) => `${t.speaker}: ${t.content}`).join("\n");
    const prompt = `あなたは${agent}です。テーマ: ${topic}\nこれまでの会話:\n${context}\n50文字以内で話してください。`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return NextResponse.json({ turn: { speaker: agent, content: text } });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: "AI discussion failed" }, { status: 500 });
  }
}
