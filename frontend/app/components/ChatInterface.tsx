"use client"

import React, { useState, useRef, useEffect } from "react"
import {
    Send,
    Bot,
    Info,
    Flame,
    GitBranch,
    Cpu,
    Skull,
    Rocket,
    ChevronDown,
    Check,
} from "lucide-react"

// Tipi per i messaggi
type Message = {
    role: "user" | "assistant"
    content: string
}

// Configurazione Personas
const PERSONA_OPTIONS = [
    {
        id: "bastian",
        name: "Bastian Contrario",
        icon: Flame,
        desc: "Polemico e assurdo",
    },
    {
        id: "pirata",
        name: "Capitan Barbagialla",
        icon: Skull,
        desc: "Slang piratesco",
    },
    {
        id: "alieno",
        name: "Zorg l'Alieno",
        icon: Rocket,
        desc: "Analitico e robotico",
    },
]

export default function ChatInterface() {
    const [messages, setMessages] = useState<Message[]>([])
    const [inputValue, setInputValue] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [sessionId, setSessionId] = useState("")
    const [selectedPersona, setSelectedPersona] = useState("bastian")
    const [isPersonaOpen, setIsPersonaOpen] = useState(false) // Stato per il dropdown custom

    const messagesEndRef = useRef<HTMLDivElement>(null)

    // Generazione Session ID all'avvio
    useEffect(() => {
        setSessionId(Math.random().toString(36).substring(2, 15))
    }, [])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages, isLoading])

    // Cambio Persona e reset
    const handlePersonaChange = (newPersona: string) => {
        setSelectedPersona(newPersona)
        setMessages([])
        setSessionId(Math.random().toString(36).substring(2, 15))
        setIsPersonaOpen(false) // Chiudi il menu dopo la selezione
    }

    const handleSendMessage = async (content: string) => {
        if (!content.trim() || isLoading) return

        const userMsg: Message = { role: "user", content }
        setMessages((prev) => [...prev, userMsg])
        setInputValue("")
        setIsLoading(true)

        try {
            const response = await fetch("http://localhost:8000/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: userMsg.content,
                    session_id: sessionId,
                    persona: selectedPersona,
                }),
            })

            if (!response.ok) {
                let errorMessage = `Errore HTTP: ${response.status}`
                try {
                    const errorData = await response.json()
                    errorMessage = errorData.detail || JSON.stringify(errorData)
                } catch (e) {
                    errorMessage = response.statusText
                }
                throw new Error(errorMessage)
            }

            const data = await response.json()
            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: data.response },
            ])
        } catch (error: any) {
            console.error(error)
            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: `❌ Errore: ${error.message}` },
            ])
        } finally {
            setIsLoading(false)
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        handleSendMessage(inputValue)
    }

    // Helper per ottenere l'oggetto persona corrente
    const currentPersona = PERSONA_OPTIONS.find((p) => p.id === selectedPersona)

    return (
        <div className="flex flex-col h-screen bg-black text-zinc-100 font-sans selection:bg-zinc-800">
            {/* HEADER */}
            <header className="flex-none border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {/* Logo */}
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-white text-black rounded-md flex items-center justify-center font-bold">
                                LIL
                            </div>
                            <span className="font-semibold text-sm hidden sm:inline-block">
                                Project
                            </span>
                        </div>

                        {/* CUSTOM SHADCN-STYLE SELECTOR */}
                        <div className="relative">
                            <button
                                onClick={() => setIsPersonaOpen(!isPersonaOpen)}
                                className="flex h-9 w-[200px] items-center justify-between rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm shadow-sm hover:bg-zinc-800/80 focus:outline-none focus:ring-1 focus:ring-zinc-700 transition-all"
                            >
                                <div className="flex items-center gap-2">
                                    {currentPersona &&
                                        React.createElement(
                                            currentPersona.icon,
                                            {
                                                className:
                                                    "w-4 h-4 text-zinc-400",
                                            }
                                        )}
                                    <span className="text-zinc-200 font-medium truncate">
                                        {currentPersona?.name}
                                    </span>
                                </div>
                                <ChevronDown className="h-4 w-4 opacity-50" />
                            </button>

                            {/* Dropdown Menu */}
                            {isPersonaOpen && (
                                <>
                                    {/* Backdrop invisibile per chiudere cliccando fuori */}
                                    <div
                                        className="fixed inset-0 z-40"
                                        onClick={() => setIsPersonaOpen(false)}
                                    ></div>

                                    <div className="absolute top-full left-0 mt-1 w-[240px] z-50 overflow-hidden rounded-md border border-zinc-800 bg-zinc-950 p-1 text-zinc-200 shadow-xl animate-in fade-in zoom-in-95 duration-100">
                                        {PERSONA_OPTIONS.map((persona) => (
                                            <button
                                                key={persona.id}
                                                onClick={() =>
                                                    handlePersonaChange(
                                                        persona.id
                                                    )
                                                }
                                                className={`relative flex w-full cursor-pointer select-none items-center rounded-sm py-2 pl-2 pr-8 text-sm outline-none transition-colors hover:bg-zinc-900 ${
                                                    selectedPersona ===
                                                    persona.id
                                                        ? "bg-zinc-900"
                                                        : ""
                                                }`}
                                            >
                                                <span className="flex items-center gap-2 truncate">
                                                    <persona.icon
                                                        className={`h-4 w-4 ${
                                                            selectedPersona ===
                                                            persona.id
                                                                ? "text-white"
                                                                : "text-zinc-500"
                                                        }`}
                                                    />
                                                    <div className="flex flex-col items-start text-left">
                                                        <span className="font-medium">
                                                            {persona.name}
                                                        </span>
                                                        <span className="text-[10px] text-zinc-500 leading-none">
                                                            {persona.desc}
                                                        </span>
                                                    </div>
                                                </span>
                                                {selectedPersona ===
                                                    persona.id && (
                                                    <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
                                                        <Check className="h-4 w-4 text-white" />
                                                    </span>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* CHIPS TECNICHE */}
                    <div className="hidden md:flex items-center gap-2">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-md text-xs">
                            <Cpu className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="font-medium text-zinc-300">
                                Memory Active
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-md text-xs">
                            <GitBranch className="w-3.5 h-3.5 text-blue-500" />
                            <span className="text-zinc-400">Context:</span>
                            <span className="font-mono font-bold text-zinc-200">
                                10 msg
                            </span>
                        </div>
                    </div>
                </div>
            </header>

            {/* MAIN CHAT */}
            <main className="flex-1 overflow-y-auto p-4 scroll-smooth">
                <div className="max-w-3xl mx-auto min-h-full flex flex-col">
                    {/* EMPTY STATE - Con spiegazioni */}
                    {messages.length === 0 && (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 opacity-0 animate-in fade-in duration-700">
                            <div className="w-16 h-16 bg-zinc-900 rounded-xl flex items-center justify-center mb-6 border border-zinc-800 shadow-2xl">
                                {currentPersona &&
                                    React.createElement(currentPersona.icon, {
                                        className: "w-8 h-8 text-zinc-100",
                                    })}
                            </div>

                            <h2 className="text-2xl font-bold mb-2 text-zinc-100">
                                {currentPersona?.name}
                            </h2>
                            <p className="text-zinc-500 max-w-md mb-8">
                                {currentPersona?.desc}
                            </p>

                            <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl max-w-md w-full mb-6">
                                <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                                    <Info className="w-3 h-3" /> Info Tecnica
                                </div>
                                <p className="text-xs text-zinc-500 leading-relaxed text-left">
                                    Cambiare la "Persona" modifica il{" "}
                                    <strong>System Prompt</strong> inviato al
                                    modello. Questo cambia la distribuzione di
                                    probabilità delle risposte (Instruction
                                    Tuning) senza ri-addestrare il modello.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* MESSAGGI */}
                    <div className="flex-1 space-y-6 pb-4">
                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`flex gap-4 ${
                                    msg.role === "user"
                                        ? "justify-end"
                                        : "justify-start"
                                } animate-in slide-in-from-bottom-2 duration-300`}
                            >
                                {msg.role === "assistant" && (
                                    <div className="w-8 h-8 rounded-md bg-zinc-800 flex items-center justify-center flex-shrink-0 border border-zinc-700 mt-1">
                                        <Bot className="w-4 h-4 text-zinc-400" />
                                    </div>
                                )}
                                <div
                                    className={`relative px-5 py-3.5 rounded-xl max-w-[85%] md:max-w-[75%] text-[15px] leading-7 shadow-sm ${
                                        msg.role === "user"
                                            ? "bg-white text-zinc-950 font-medium rounded-tr-sm"
                                            : "bg-zinc-900 border border-zinc-800 text-zinc-200 rounded-tl-sm"
                                    }`}
                                >
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex gap-4 justify-start animate-in fade-in duration-300">
                                <div className="w-8 h-8 rounded-md bg-zinc-800 flex items-center justify-center flex-shrink-0 border border-zinc-700 mt-1">
                                    <Bot className="w-4 h-4 text-zinc-400" />
                                </div>
                                <div className="bg-zinc-900 border border-zinc-800 px-4 py-3 rounded-xl flex items-center gap-1 w-16">
                                    <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce"></span>
                                    <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce delay-75"></span>
                                    <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce delay-150"></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </div>
            </main>

            {/* INPUT AREA */}
            <footer className="flex-none p-4 pb-6 bg-black">
                <div className="max-w-3xl mx-auto">
                    <form onSubmit={handleSubmit} className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-zinc-800 to-zinc-900 rounded-xl blur opacity-20 group-hover:opacity-40 transition-opacity pointer-events-none"></div>
                        <input
                            className="w-full bg-zinc-900 text-zinc-100 border border-zinc-800 rounded-xl py-4 pl-6 pr-14 focus:outline-none focus:ring-1 focus:ring-zinc-700 transition-all placeholder:text-zinc-600 shadow-2xl"
                            placeholder={`Parla con ${currentPersona?.name}...`}
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            disabled={isLoading}
                            autoFocus
                        />
                        <button
                            type="submit"
                            disabled={!inputValue.trim() || isLoading}
                            className="absolute right-2 top-2 bottom-2 aspect-square bg-white text-black rounded-lg flex items-center justify-center hover:bg-zinc-200 disabled:opacity-30 disabled:hover:bg-white disabled:cursor-not-allowed transition-all"
                        >
                            {isLoading ? (
                                <div className="w-4 h-4 border-2 border-zinc-500 border-t-black rounded-full animate-spin"></div>
                            ) : (
                                <Send className="w-4 h-4 ml-0.5" />
                            )}
                        </button>
                    </form>
                </div>
            </footer>
        </div>
    )
}
