'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { VitalsSection } from './vitals-section'
import { DocumentsSection } from './documents-section'
import { ChatSection } from './chat-section'
import { Heart, Activity, FileText, MessageSquare, LogOut, User } from 'lucide-react'

type TabType = 'vitals' | 'documents' | 'chat'

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('vitals')
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
  }

  const tabs = [
    { id: 'vitals' as TabType, label: 'Vitals', icon: Activity },
    { id: 'documents' as TabType, label: 'Documents', icon: FileText },
    { id: 'chat' as TabType, label: 'AI Assistant', icon: MessageSquare },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-primary/10 p-2 rounded-lg">
                <Heart className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Health Dashboard</h1>
                <p className="text-sm text-muted-foreground">
                  Welcome back, {user?.email}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <User className="h-4 w-4 mr-2" />
                Profile
              </Button>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="border-b border-border bg-card">
        <div className="container mx-auto px-4">
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {activeTab === 'vitals' && <VitalsSection />}
        {activeTab === 'documents' && <DocumentsSection />}
        {activeTab === 'chat' && <ChatSection />}
      </main>
    </div>
  )
}
