'use client'

import { useState, useRef, useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Send, MessageSquare, Bot, User, FileText } from 'lucide-react'
import { ChatMessage } from '@/types'
import { supabaseClient } from '@/lib/supabase-client'

export function ChatSection() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { toast } = useToast()

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputMessage.trim() || loading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      message: inputMessage,
      response: '',
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setLoading(true)

    try {
      const data = await supabaseClient.sendMessage(inputMessage)
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        message: '',
        response: data.response,
        sources: data.sources,
        timestamp: data.timestamp
      }
      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get AI response",
        variant: "destructive",
      })
      // Remove the user message if there was an error
      setMessages(prev => prev.slice(0, -1))
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bot className="h-5 w-5" />
            <span>AI Health Assistant</span>
          </CardTitle>
          <CardDescription>
            Ask questions about your health, upload documents for analysis, or get general health advice.
            The AI will use your uploaded medical documents to provide personalized responses.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Chat Interface */}
      <Card className="h-[600px] flex flex-col">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5" />
            <span>Chat</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-0">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Start a conversation with your AI health assistant</p>
                <p className="text-sm mt-2">Try asking about symptoms, medications, or upload documents for analysis</p>
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className="space-y-2">
                  {/* User Message */}
                  {message.message && (
                    <div className="flex justify-end">
                      <div className="bg-primary text-primary-foreground rounded-lg px-4 py-2 max-w-[80%]">
                        <div className="flex items-center space-x-2 mb-1">
                          <User className="h-4 w-4" />
                          <span className="text-xs opacity-80">You</span>
                        </div>
                        <p>{message.message}</p>
                        <div className="text-xs opacity-80 mt-1">
                          {formatTime(message.timestamp)}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* AI Response */}
                  {message.response && (
                    <div className="flex justify-start">
                      <div className="bg-muted rounded-lg px-4 py-2 max-w-[80%]">
                        <div className="flex items-center space-x-2 mb-1">
                          <Bot className="h-4 w-4" />
                          <span className="text-xs opacity-80">AI Assistant</span>
                        </div>
                        <div className="whitespace-pre-wrap">{message.response}</div>
                        {message.sources && message.sources.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-border">
                            <div className="text-xs opacity-80 mb-1">Sources:</div>
                            <div className="flex flex-wrap gap-1">
                              {message.sources.map((source, index) => (
                                <div
                                  key={index}
                                  className="flex items-center space-x-1 bg-background px-2 py-1 rounded text-xs"
                                >
                                  <FileText className="h-3 w-3" />
                                  <span>{source}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        <div className="text-xs opacity-80 mt-1">
                          {formatTime(message.timestamp)}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}

            {/* Loading indicator */}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg px-4 py-2">
                  <div className="flex items-center space-x-2">
                    <LoadingSpinner size="sm" />
                    <span className="text-sm">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t p-4">
            <form onSubmit={handleSendMessage} className="flex space-x-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask about your health, symptoms, or medications..."
                disabled={loading}
                className="flex-1"
              />
              <Button type="submit" disabled={loading || !inputMessage.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>

      {/* Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle>Suggested Questions</CardTitle>
          <CardDescription>Try asking these questions to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {[
              "What are the common symptoms of diabetes?",
              "How can I improve my heart health?",
              "What should I know about blood pressure?",
              "What are the benefits of regular exercise?",
              "How can I manage stress and anxiety?",
              "What are the signs of vitamin deficiency?"
            ].map((suggestion, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => setInputMessage(suggestion)}
                className="justify-start text-left h-auto p-3"
                disabled={loading}
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
