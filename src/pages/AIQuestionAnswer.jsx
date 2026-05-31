// src/pages/AIQuestionAnswer.jsx
import { isAiServiceAvailable, getAiUnavailableReason } from "../services/aiService";

const STATIC_ANSWERS = {
    "What are auroras?":
        "Auroras are beautiful lights in the sky caused when particles from the Sun hit Earth's atmosphere near the poles! They can look green, pink, or purple. 🌌",
    "Why does the Sun have storms?":
        "The Sun has storms when its magnetic field gets tangled and releases huge bursts of energy called solar flares and coronal mass ejections! ☀️",
    "How does Earth protect us from space?":
        "Earth's magnetic field acts like a giant shield, deflecting harmful solar radiation while allowing stunning auroras to form at the poles! 🛡️",
    "What is space weather?":
        "Space weather describes conditions in space caused by the Sun — like solar wind, storms, and radiation — that can affect Earth, satellites, and astronauts! 🌠",
};

const SAMPLE_QUESTIONS = Object.keys(STATIC_ANSWERS);

export default function AIQuestionAnswer() {
    const aiAvailable = isAiServiceAvailable();
    const unavailable = getAiUnavailableReason();

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white pt-20">
            <div className="fixed inset-0 -z-10 bg-gradient-to-br from-indigo-900/50 via-purple-900/50 to-pink-900/50" />

            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="text-center mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-fuchsia-300 via-purple-300 to-indigo-300 bg-clip-text text-transparent">
                        AI Space Weather Assistant
                    </h1>
                    <p className="text-lg text-white/80 mt-4">
                        Ask questions about space weather, auroras, and solar storms
                    </p>
                </div>

                {!aiAvailable && (
                    <div className="mb-8 rounded-2xl border border-amber-400/40 bg-amber-500/15 backdrop-blur-sm p-6">
                        <div className="flex items-start gap-4">
                            <span className="text-3xl shrink-0" aria-hidden="true">⚠️</span>
                            <div>
                                <h2 className="text-xl font-bold text-amber-200 mb-2">
                                    {unavailable.title}
                                </h2>
                                <p className="text-white/85 leading-relaxed">{unavailable.message}</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
                    <div className="p-6 space-y-4 max-h-[28rem] overflow-y-auto">
                        <div className="flex justify-start">
                            <div className="max-w-md px-4 py-3 rounded-2xl bg-white/10 text-white border border-white/20">
                                <p className="text-sm leading-relaxed">
                                    {aiAvailable
                                        ? "Hi there, space explorer! 👋 I'm your Space Weather Assistant! What would you like to learn today?"
                                        : "Hi there, space explorer! 👋 The live AI chat is offline right now, but you can still read the sample answers below to learn about space weather!"}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-white/10 p-4 opacity-50 pointer-events-none">
                        <div className="flex gap-3">
                            <input
                                type="text"
                                disabled
                                placeholder={
                                    aiAvailable
                                        ? "Ask me about space weather..."
                                        : "AI chat is temporarily unavailable"
                                }
                                className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 cursor-not-allowed"
                            />
                            <button
                                type="button"
                                disabled
                                className="px-6 py-3 rounded-xl bg-gradient-to-r from-fuchsia-500/50 to-purple-600/50 text-white/70 cursor-not-allowed"
                            >
                                Send
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mt-8">
                    <h3 className="text-xl font-semibold mb-4 text-center">
                        {aiAvailable ? "Try asking these questions:" : "Browse these sample answers:"}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {SAMPLE_QUESTIONS.map((question) => (
                            <div
                                key={question}
                                className="p-4 bg-white/5 border border-white/10 rounded-xl"
                            >
                                <div className="flex items-start gap-3">
                                    <span className="text-2xl shrink-0">💭</span>
                                    <div>
                                        <p className="text-white/90 font-medium mb-2">{question}</p>
                                        <p className="text-sm text-white/70 leading-relaxed">
                                            {STATIC_ANSWERS[question]}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-8 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-400/20 rounded-xl p-6">
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <span>🌟</span>
                        Fun Space Weather Facts
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-white/80">
                        <div>
                            <strong>Did you know?</strong> Auroras can be seen from space! Astronauts on the International Space Station get an amazing view of these dancing lights.
                        </div>
                        <div>
                            <strong>Amazing fact:</strong> Solar storms can create auroras so bright that people have been able to read newspapers by their light!
                        </div>
                        <div>
                            <strong>Cool science:</strong> The Sun&apos;s magnetic field extends far beyond Pluto, creating a bubble called the heliosphere!
                        </div>
                        <div>
                            <strong>Space magic:</strong> Earth&apos;s magnetic field acts like a giant shield, protecting us from harmful solar radiation!
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
