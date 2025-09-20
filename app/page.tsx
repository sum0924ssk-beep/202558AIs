"use client";

import { useState } from "react";

type Turn = { speaker: string; content: string };

const agents = ["AI1", "AI2", "AI3", "AI4"];// 議論役
const evaluator = "AI5";// 評価役

export default function Home() {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [conclusion, setConclusion] = useState("");

  const startDiscussion = async () => {
    setTurns([]);
    setConclusion("");
    setLoading(true);

    try {
      let transcript: Turn[] = [];

      // 擬似的に順番にAPIを呼ぶ
      for (let round = 0; round < 2; round++) {
        for (let i = 0; i < agents.length; i++) {
          const res = await fetch("/api/discussion", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ topic, transcript, agentIndex: i }),
          });
          const data = await res.json();

          if ( data && data.turn) {
          transcript.push(data.turn);
          setTurns([...transcript]); // 1発言ずつ反映
          }
        }
      }

      // 評価役
      const evalRes = await fetch("/api/discussion", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic, transcript, agentIndex: 4 }),
  });
  const evalData = await evalRes.json();

  // 評価役は conclusion を返す
  if (evalData.conclusion) {
  setConclusion(evalData.conclusion);
}
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

  return (
    <main className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">🤖 AI討論アプリ (4人+評価役)</h1>

      <div className="flex gap-2 mb-4">
        <input
          className="border flex-1 p-2 rounded"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="議論したいテーマを入力..."
        />
        <button
          className="bg-blue-500 text-white px-4 rounded"
          onClick={startDiscussion}
          disabled={loading}
        >
          {loading ? "議論中..." : "開始"}
        </button>
      </div>

      <div>
        {turns.
          filter((t): t is Turn => Boolean(t))
          .map((t, i) => (
          // <div className="flex content-col gap-1 bg-white-100 p-2 m-2 border rounded-xl border-black-500 text-black-500" key={i}>
            <p key={i}>
              <strong>{t.speaker}:</strong> {t.content}
            </p>
          // </div>
        ))}
      </div>

      {conclusion && (
        <div className="p-4 bg-green-100 border rounded mt-4">
          <h2 className="font-bold mb-2">✅ 評価役による結論</h2>
          <pre className="whitespace-pre-wrap">{conclusion}</pre>
        </div>
      )}
    </main>
  );
}