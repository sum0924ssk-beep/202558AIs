import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Turn } from "@/app/types";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// 議論役（4人）
const debaters = ["AI1", "AI2", "AI3", "AI4"];
// 評価役
const evaluator = "AI5";

// 議論役の立場プロンプト
const debaterPrompts: Record<string, string> = {
  AI1: "あなたは議論役AI1です。テーマに対して「全面的に賛成／推進する立場」から発言してください。",
  AI2: "あなたは議論役AI2です。テーマに対して「条件付きで賛成する立場」から発言してください。利点を認めつつ、リスクや注意点を指摘してください。",
  AI3: "あなたは議論役AI3です。テーマに対して「批判的・反対の立場」から発言してください。リスクや問題点を強調してください。",
  AI4: "あなたは議論役AI4です。テーマに対して「現実的・実務的な観点（費用、制度、社会的制約など）から発言する立場」から発言してください。",
};

interface DiscussionRequest {
  topic: string;
  transcript: Turn[];
  agentIndex: number;
}

// 評価役のプロンプト
const evaluatorPrompt = (topic: string, context: string) => `
あなたは評価役AI5です。以下は4人の議論ログです。テーマは「${topic}」。

これまでの会話:
${context}

手順:
1. 各AI（AI1〜AI4）の意見を整理する
2. 「説得力」「論理性」「一貫性」「新規性」の観点で 0〜10 点をつける
3. 点数合計から割合を算出する
4. その割合を反映した加重まとめを提示する

出力フォーマット:
- 各AIの点数と評価はいらない
- 最終まとめ
→本当に最終的なまとめだけを60文字程度で簡潔に述べてください
`;

export async function POST(req: Request) {
  try {
    // 型アサーションで any を回避
    const body = (await req.json()) as DiscussionRequest;
    const { topic, transcript, agentIndex } = body;

    const context = transcript.map((t: Turn) => `${t.speaker}: ${t.content}`).join("\n");

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // 評価役の場合
    if (agentIndex === 4) {
      const prompt = evaluatorPrompt(topic, context);
      const result = await model.generateContent(prompt);
      const text = await result.response.text();
      return NextResponse.json({ evaluator, conclusion: text });
    }

    // 議論役の場合
    const agent = debaters[agentIndex];
    const rolePrompt = debaterPrompts[agent];
    const prompt = `${rolePrompt}\nテーマ: ${topic}\nこれまでの会話:\n${context}\n50文字以内で話してください。`;

    const result = await model.generateContent(prompt);
    const text = await result.response.text();

    return NextResponse.json({ turn: { speaker: agent, content: text } });
  } catch (error: unknown) {
    console.error(error);

    // unknown 型を扱う安全な方法
    const message =
      error instanceof Error ? error.message : "AI discussion failed";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
