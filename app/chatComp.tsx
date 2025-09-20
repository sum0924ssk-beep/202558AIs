"use client";
import Markdown from "react-markdown";
import { Turn } from "./types";

type ChatDisplayProps = {
    turns: Turn[];
    conclusion?: string;
};

export const ChatDisplay = ({ turns, conclusion }: ChatDisplayProps) => {
    return (
        <div className="flex flex-col w-full gap-2 overflow-y-auto">
            {turns
                .filter((t): t is Turn => Boolean(t) && !t.is_conclusion) // ← 結論は除外
                .map((t, i) => {
                    const date = t.timestamp ? new Date(t.timestamp) : new Date();
                    const formattedTime = `${date.getMonth() + 1}/${date.getDate()} ${date
                        .getHours()
                        .toString()
                        .padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;

                    return (
                        <div key={i} className="flex items-start gap-2 mb-2">
                            <img
                                src={`/${t.speaker}.jpg`}
                                alt={t.speaker}
                                className="w-10 h-10 rounded-full"
                            />

                            <div className="flex flex-col pb-2">
                                <div>
                                    <strong className="text-zinc-300 font-bold">{t.speaker}</strong>
                                    <span className="p-2 text-xs text-gray-500">{formattedTime}</span>
                                </div>
                                <p className="text-zinc-300">{t.content}</p>
                            </div>
                        </div>
                    );
                })}

            {/* 結論 */}
            {conclusion && (
                <div className="p-4 bg-green-100 border rounded mt-4">
                    <h2 className="font-bold mb-2">結論</h2>
                    <div className="whitespace-pre-wrap">
                        <Markdown>{conclusion}</Markdown>
                    </div>
                </div>
            )}
        </div>
    );
};
