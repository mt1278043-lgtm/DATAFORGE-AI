'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import Hero from '@/components/Hero'
import Features from '@/components/Features'
import Dashboard from '@/components/Dashboard'
import Footer from '@/components/Footer'

export default function Home() {
  const [activeTab, setActiveTab] = useState<'home' | 'dashboard'>('home')

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />
      {activeTab === 'home' ? (
        <>
          <Hero onGetStarted={() => setActiveTab('dashboard')} />
          <Features />
        </>
      ) : (
        <Dashboard onBack={() => setActiveTab('home')} />
      )}
      <Footer />
    </div>
  )
}
