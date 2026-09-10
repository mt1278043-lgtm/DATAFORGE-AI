'use client'

import { useEffect, useState } from 'react'

interface DashboardProps {
  onBack: () => void
}

interface DataItem {
  id: number
  name: string
  value: number
  status: string
}

export default function Dashboard({ onBack }: DashboardProps) {
  const [data, setData] = useState<DataItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/data')
        if (!response.ok) throw new Error('Failed to fetch data')
        const result = await response.json()
        setData(result.items)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <button
        onClick={onBack}
        className="btn btn-secondary mb-8"
      >
        ← Back to Home
      </button>

      <div className="card mb-8">
        <h2 className="text-3xl font-bold mb-2">Dashboard</h2>
        <p className="text-gray-600">View your data and analytics</p>
      </div>

      {loading && (
        <div className="text-center py-12">
          <p className="text-gray-600">Loading data...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
          <p className="text-red-800">Error: {error}</p>
        </div>
      )}

      {!loading && !error && (
        <div className="grid gap-6">
          <div className="card">
            <h3 className="text-xl font-semibold mb-4">Data Overview</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Value</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item) => (
                    <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">{item.name}</td>
                      <td className="py-3 px-4 font-semibold text-indigo-600">${item.value}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                          item.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="card">
              <p className="text-gray-600 text-sm mb-2">Total Items</p>
              <p className="text-3xl font-bold text-indigo-600">{data.length}</p>
            </div>
            <div className="card">
              <p className="text-gray-600 text-sm mb-2">Total Value</p>
              <p className="text-3xl font-bold text-indigo-600">
                ${data.reduce((sum, item) => sum + item.value, 0)}
              </p>
            </div>
            <div className="card">
              <p className="text-gray-600 text-sm mb-2">Active Items</p>
              <p className="text-3xl font-bold text-green-600">
                {data.filter(item => item.status === 'active').length}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
