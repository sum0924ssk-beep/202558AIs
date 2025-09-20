"use client";

export default function TopicList({
  topics,
  onSelect,
}: {
  topics: { id: number; topic: string }[];
  onSelect: (id: number) => void;
}) {
  return (
    <div className="bg-gray-800 text-center overflow-y-auto p-4">
      <h2 className="text-zinc-200 font-bold mb-4">過去の議題</h2>
      <ul className="flex flex-col gap-2">
        {topics.map((t) => (
          <li
            key={t.id}
            className="p-2 rounded hover:bg-gray-600 cursor-pointer text-zinc-200"
            onClick={() => onSelect(t.id)}
          >
            {t.topic}
          </li>
        ))}
      </ul>
    </div>
  );
}
