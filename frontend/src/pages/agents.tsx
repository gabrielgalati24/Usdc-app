import { useState, useRef, useEffect } from 'react'
import { agentsApi } from '@/lib/api'
import { useWalletStore } from '@/stores'
import { Card, Button } from '@/components/ui'
import {
    Sparkles,
    Send,
    User,
    Bot,
    Loader2,
    Wallet,
    TrendingUp,
    HelpCircle,
    RefreshCw
} from 'lucide-react'

interface Message {
    id: string
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
    context?: Record<string, unknown>
}

const suggestedQuestions = [
    { icon: Wallet, text: '¿Cuál es mi balance actual?' },
    { icon: TrendingUp, text: '¿Qué estrategias de inversión me recomiendas?' },
    { icon: HelpCircle, text: '¿Cómo puedo diversificar mi portfolio?' },
]

export function AgentsPage() {
    const { balance, fetchBalance } = useWalletStore()

    useEffect(() => {
        fetchBalance()
    }, [])

    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: `¡Hola! 👋 Soy tu asistente financiero de UsdcApp. 

Puedo ayudarte con:
• Consultar tu balance y transacciones
• Estrategias de inversión en criptomonedas
• Análisis de riesgo de tu portfolio
• Consejos para optimizar tus operaciones

¿En qué puedo ayudarte hoy?`,
            timestamp: new Date(),
        }
    ])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const streamControllerRef = useRef<{ cancel: () => void } | null>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    // Cleanup stream on unmount
    useEffect(() => {
        return () => {
            if (streamControllerRef.current) {
                streamControllerRef.current.cancel()
            }
        }
    }, [])

    const handleSend = async (messageText?: string) => {
        const text = messageText || input.trim()
        if (!text || isLoading) return

        // Close any existing stream
        if (streamControllerRef.current) {
            streamControllerRef.current.cancel()
            streamControllerRef.current = null
        }

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: text,
            timestamp: new Date(),
        }

        setMessages(prev => [...prev, userMessage])
        setInput('')
        setIsLoading(true)

        // Generate ID for the response beforehand
        const responseId = (Date.now() + 1).toString()

        try {
            // Use streaming chat
            streamControllerRef.current = await agentsApi.chatStream(
                text,
                // onChunk: append content to the message
                (content: string) => {
                    setMessages(prev => {
                        const exists = prev.some(msg => msg.id === responseId)

                        if (!exists) {
                            // Create new message with first chunk
                            return [...prev, {
                                id: responseId,
                                role: 'assistant' as const,
                                content: content,
                                timestamp: new Date(),
                            }]
                        }

                        // Append to existing message
                        return prev.map(msg =>
                            msg.id === responseId
                                ? { ...msg, content: msg.content + content }
                                : msg
                        )
                    })
                },
                // onComplete: finish loading
                () => {
                    setIsLoading(false)
                    streamControllerRef.current = null
                },
                // onError: show error message
                (error: string) => {
                    console.error('Streaming error:', error)
                    setMessages(prev => {
                        const exists = prev.some(msg => msg.id === responseId)
                        if (!exists) {
                            return [...prev, {
                                id: responseId,
                                role: 'assistant' as const,
                                content: 'Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta de nuevo.',
                                timestamp: new Date(),
                            }]
                        }
                        return prev.map(msg =>
                            msg.id === responseId
                                ? { ...msg, content: msg.content + ' [Error: Interrupción de conexión]' }
                                : msg
                        )
                    })
                    setIsLoading(false)
                    streamControllerRef.current = null
                }
            )
        } catch (error) {
            console.error('Error sending message:', error)
            setMessages(prev => [...prev, {
                id: responseId,
                role: 'assistant' as const,
                content: 'Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta de nuevo.',
                timestamp: new Date(),
            }])
            setIsLoading(false)
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    const handleClearChat = () => {
        setMessages([{
            id: '1',
            role: 'assistant',
            content: `¡Hola de nuevo! 👋 ¿En qué puedo ayudarte?`,
            timestamp: new Date(),
        }])
    }

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-white">Asistente IA</h1>
                        <p className="text-sm text-neutral-400">
                            Pregunta sobre tu balance y estrategias
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-3 py-1.5 bg-neutral-800 rounded-lg">
                        <span className="text-sm text-neutral-400">Balance: </span>
                        <span className="text-sm font-medium text-white">${balance} USDC</span>
                    </div>
                    <button
                        onClick={handleClearChat}
                        className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
                        title="Reiniciar chat"
                    >
                        <RefreshCw className="w-5 h-5 text-neutral-400" />
                    </button>
                </div>
            </div>

            {/* Chat Area */}
            <Card className="flex-1 flex flex-col overflow-hidden p-0">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                        >
                            {/* Avatar */}
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${message.role === 'user'
                                ? 'bg-orange-500'
                                : 'bg-purple-500/20'
                                }`}>
                                {message.role === 'user' ? (
                                    <User className="w-4 h-4 text-white" />
                                ) : (
                                    <Bot className="w-4 h-4 text-purple-400" />
                                )}
                            </div>

                            {/* Message Content */}
                            <div className={`max-w-[75%] ${message.role === 'user' ? 'text-right' : ''}`}>
                                <div className={`p-3 rounded-2xl ${message.role === 'user'
                                    ? 'bg-orange-500 text-white rounded-tr-none'
                                    : 'bg-neutral-800 text-white rounded-tl-none'
                                    }`}>
                                    <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                                </div>
                                <p className="text-xs text-neutral-500 mt-1 px-1">
                                    {message.timestamp.toLocaleTimeString('es', {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </p>
                            </div>
                        </div>
                    ))}

                    {/* Loading indicator */}
                    {isLoading && messages[messages.length - 1]?.role === 'user' && (
                        <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                                <Bot className="w-4 h-4 text-purple-400" />
                            </div>
                            <div className="bg-neutral-800 p-3 rounded-2xl rounded-tl-none">
                                <div className="flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
                                    <span className="text-sm text-neutral-400">Pensando...</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Suggested Questions */}
                {messages.length === 1 && (
                    <div className="px-4 pb-4">
                        <p className="text-xs text-neutral-500 mb-2">Preguntas sugeridas:</p>
                        <div className="flex flex-wrap gap-2">
                            {suggestedQuestions.map((q, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleSend(q.text)}
                                    className="flex items-center gap-2 px-3 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-sm text-neutral-300 transition-colors"
                                >
                                    <q.icon className="w-4 h-4 text-orange-500" />
                                    {q.text}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Input Area */}
                <div className="border-t border-neutral-800 p-4">
                    <div className="flex gap-3">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder="Escribe tu pregunta..."
                            rows={1}
                            className="flex-1 bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3 text-white placeholder-neutral-500 resize-none focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all"
                            disabled={isLoading}
                        />
                        <Button
                            onClick={() => handleSend()}
                            disabled={!input.trim() || isLoading}
                            size="icon"
                            className="h-12 w-12"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Send className="w-5 h-5" />
                            )}
                        </Button>
                    </div>
                    <p className="text-xs text-neutral-500 mt-2 text-center">
                        El asistente usa IA para responder. Las respuestas son orientativas y no constituyen asesoría financiera.
                    </p>
                </div>
            </Card>
        </div>
    )
}
