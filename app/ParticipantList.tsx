"use client";

export default function ParticipantList({
  agents,
  evaluator,
}: {
  agents: string[];
  evaluator: string;
}) {
  return (
    <div className="bg-gray-800 text-center overflow-y-auto p-4">
      <h2 className="text-zinc-200 font-bold mb-4">参加者</h2>
      <ul className="flex flex-col gap-2">
        <li>
          <img src="/user.jpg" alt="user" className="w-10 h-10 rounded-full" />
          <strong className="text-zinc-300 font-bold">ユーザー</strong>
        </li>
        {agents.map((t, i) => (
          <li key={i} className="flex items-start gap-2 mb-2">
            <img src={`/${t}.jpg`} alt={t} className="w-10 h-10 rounded-full" />
            <strong className="text-zinc-300 font-bold">{t}</strong>
          </li>
        ))}
        <li>
          <img
            src={`/${evaluator}.jpg`}
            alt={evaluator}
            className="w-10 h-10 rounded-full"
          />
          <strong className="text-zinc-300 font-bold">{evaluator}</strong>
        </li>
      </ul>
    </div>
  );
}
