"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { FaPaperPlane, FaBars } from "react-icons/fa";
import dynamic from "next/dynamic";
import { Turn } from "./types";
import TopicList from "./topicList"
import ParticipantList from "./ParticipantList"

const ChatDisplay = dynamic<{ turns: Turn[]; conclusion?: string }>(
  () => import("./chatComp").then((mod) => mod.ChatDisplay),
  { ssr: false }
);

const agents = ["AI1", "AI2", "AI3", "AI4"];
const evaluator = "AI5";

export default function Home() {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [conclusion, setConclusion] = useState("");
  const [topics, setTopics] = useState<{ id: number; topic: string }[]>([]);
  const [showLeft, setShowLeft] = useState(false);   // スマホ左メニュー
  const [showRight, setShowRight] = useState(false); // スマホ右メニュー
  useEffect(() => {
    const fetchTopics = async () => {
      const { data, error } = await supabase
        .from("discussions")
        .select("id, topic")
        .order("created_at", { ascending: false });
      if (!error && data) setTopics(data);
    };
    fetchTopics();
  }, []);

  const loadDiscussion = async (discussionId: number) => {
    const { data, error } = await supabase
      .from("turns")
      .select("*")
      .eq("discussion_id", discussionId)
      .order("id", { ascending: true });

    if (!error && data) {
      setTurns(
        data.map((t) => ({
          speaker: t.speaker,
          content: t.content,
          timestamp: t.timestamp,
          round: t.round,
          is_conclusion: t.is_conclusion,
        }))
      );
      const conclusionTurn = data.find((t) => t.is_conclusion);
      setConclusion(conclusionTurn?.content || "");
    }
  };

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
          if (data?.turn) {
            const newTurn: Turn = {
              ...data.turn,
              timestamp: new Date().toISOString(),
              round,
              is_conclusion: false,
            };
            transcript.push(newTurn);
            setTurns([...transcript]);
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

      // Supabaseに保存
      const { data: discussionData, error: discErr } = await supabase
        .from("discussions")
        .insert([{ topic }])
        .select()
        .single();

      if (discErr) throw discErr;
      const discussionId = discussionData.id;

      // transcript 保存
      for (const t of transcript) {
        await supabase.from("turns").insert([
          {
            discussion_id: discussionId,
            speaker: t.speaker,
            content: t.content,
            timestamp: t.timestamp,
            round: t.round,
            is_conclusion: false,
          },
        ]);
      }

      // AI5 結論保存
      await supabase.from("turns").insert([
        {
          discussion_id: discussionId,
          speaker: evaluator,
          content: evalData.conclusion,
          timestamp: new Date().toISOString(),
          round: null,
          is_conclusion: true,
        },
      ]);

      setConclusion(evalData.conclusion);
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

  return (
    <main className="h-screen w-screen bg-gray-800 flex flex-col overflow-hidden">
      {/* ヘッダー共通 */}
      <header className="border-b border-gray-700 text-2xl h-[5%] text-center text-zinc-300 font-bold flex items-center justify-between px-4">
        {/* スマホ: 左ボタン */}
        <button
          className="md:hidden text-white"
          onClick={() => setShowLeft(true)}
        >
          <FaBars />
        </button>

        <p className="flex-1 text-center">AI討論アプリ</p>

        {/* スマホ: 右ボタン */}
        <button
          className="md:hidden text-white"
          onClick={() => setShowRight(true)}
        >
          <FaBars />
        </button>
      </header>

      <div className="hidden md:flex h-full gap-2">
        <div className="w-[20%] bg-gray-800 overflow-y-auto p-4 border-r border-gray-700">
          <TopicList topics={topics} onSelect={loadDiscussion} />
        </div>

        <div className="w-[60%] flex flex-col h-full p-2">
          <div className="flex-1 overflow-y-auto mb-2">
            <ChatDisplay turns={turns} conclusion={conclusion} />
          </div>
          <div className="flex gap-2 mt-auto">
            <input
              className="flex-1 p-2 rounded bg-gray-700 text-white border"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="新しい議論テーマを入力"
            />
            <button
              className="bg-blue-500 text-white px-4 rounded"
              onClick={startDiscussion}
              disabled={loading}
            >
              {loading ? "..." : <FaPaperPlane />}
            </button>
          </div>
        </div>

        <div className="w-[20%] bg-gray-800 overflow-y-auto p-4 border-l border-gray-700">
          <ParticipantList agents={agents} evaluator={evaluator} />
        </div>
      </div>
      <div className="flex md:hidden h-full"><div className="flex-1 flex flex-col p-2">
        <div className="flex-1 overflow-y-auto mb-2">
          <ChatDisplay turns={turns} conclusion={conclusion} />
        </div>
        <div className="flex gap-2 mt-auto">
          <input
            className="flex-1 p-2 rounded bg-gray-700 text-white border"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="新しい議論テーマを入力"
          />
          <button
            className="bg-blue-500 text-white px-4 rounded"
            onClick={startDiscussion}
            disabled={loading}
          >
            {loading ? "..." : <FaPaperPlane />}
          </button>
        </div>
      </div>
        {showLeft && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
            <div className="absolute left-0 top-0 h-full w-3/4 bg-gray-800 p-4">
              <button
                className="text-white mb-4"
                onClick={() => setShowLeft(false)}
              >
                閉じる
              </button>
              <TopicList topics={topics} onSelect={loadDiscussion} />
            </div>
          </div>
        )}
        {showRight && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
            <div className="absolute right-0 top-0 h-full w-3/4 bg-gray-800 p-4">
              <button
                className="text-white mb-4"
                onClick={() => setShowRight(false)}
              >
                閉じる
              </button>
              <ParticipantList agents={agents} evaluator={evaluator} />
            </div>
          </div>
        )}
      </div>

    </main>
  );
}
