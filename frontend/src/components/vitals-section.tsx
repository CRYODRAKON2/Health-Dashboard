'use client'

import { useState, useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Plus, Trash2, Activity } from 'lucide-react'
import { Vitals, VitalsCreate } from '@/types'
import { supabaseClient } from '@/lib/supabase-client'

export function VitalsSection() {
  const [vitals, setVitals] = useState<Vitals[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState<VitalsCreate>({
    heart_rate: 0,
    temperature: 0,
    spo2: 0,
    blood_pressure_systolic: 0,
    blood_pressure_diastolic: 0,
    notes: ''
  })

  const { toast } = useToast()

  useEffect(() => {
    fetchVitals()
  }, [])

  const fetchVitals = async () => {
    try {
      const data = await supabaseClient.getVitals()
      setVitals(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load vitals data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const newVital = await supabaseClient.createVitals(formData)
      setVitals([newVital, ...vitals])
      setFormData({
        heart_rate: 0,
        temperature: 0,
        spo2: 0,
        blood_pressure_systolic: 0,
        blood_pressure_diastolic: 0,
        notes: ''
      })
      toast({
        title: "Success",
        description: "Vitals recorded successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save vitals",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await supabaseClient.deleteVitals(id)
      setVitals(vitals.filter(vital => vital.id !== id))
      toast({
        title: "Success",
        description: "Vital deleted successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete vital",
        variant: "destructive",
      })
    }
  }

  const chartData = vitals.slice(0, 10).reverse().map(vital => ({
    date: new Date(vital.created_at).toLocaleDateString(),
    heart_rate: vital.heart_rate,
    temperature: vital.temperature,
    spo2: vital.spo2,
  }))

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Entries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vitals.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Latest Heart Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {vitals[0]?.heart_rate || '--'} <span className="text-sm text-muted-foreground">bpm</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Latest Temperature
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {vitals[0]?.temperature || '--'} <span className="text-sm text-muted-foreground">°C</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Latest SpO2
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {vitals[0]?.spo2 || '--'} <span className="text-sm text-muted-foreground">%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      {vitals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Vitals Trend</CardTitle>
            <CardDescription>Your health metrics over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="heart_rate" stroke="#ef4444" name="Heart Rate" />
                  <Line type="monotone" dataKey="temperature" stroke="#3b82f6" name="Temperature" />
                  <Line type="monotone" dataKey="spo2" stroke="#10b981" name="SpO2" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Vitals Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Plus className="h-5 w-5" />
            <span>Add New Vitals</span>
          </CardTitle>
          <CardDescription>Record your latest health metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium">Heart Rate (bpm)</label>
                <Input
                  type="number"
                  value={formData.heart_rate || ''}
                  onChange={(e) => setFormData({...formData, heart_rate: parseInt(e.target.value) || 0})}
                  placeholder="70"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Temperature (°C)</label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.temperature || ''}
                  onChange={(e) => setFormData({...formData, temperature: parseFloat(e.target.value) || 0})}
                  placeholder="36.5"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">SpO2 (%)</label>
                <Input
                  type="number"
                  value={formData.spo2 || ''}
                  onChange={(e) => setFormData({...formData, spo2: parseInt(e.target.value) || 0})}
                  placeholder="98"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Blood Pressure</label>
                <div className="flex space-x-2">
                  <Input
                    type="number"
                    value={formData.blood_pressure_systolic || ''}
                    onChange={(e) => setFormData({...formData, blood_pressure_systolic: parseInt(e.target.value) || 0})}
                    placeholder="120"
                    required
                  />
                  <span className="flex items-center text-muted-foreground">/</span>
                  <Input
                    type="number"
                    value={formData.blood_pressure_diastolic || ''}
                    onChange={(e) => setFormData({...formData, blood_pressure_diastolic: parseInt(e.target.value) || 0})}
                    placeholder="80"
                    required
                  />
                </div>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Notes (optional)</label>
              <Input
                value={formData.notes || ''}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="Any additional notes..."
              />
            </div>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Vitals'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Vitals History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Vitals</CardTitle>
          <CardDescription>Your latest health recordings</CardDescription>
        </CardHeader>
        <CardContent>
          {vitals.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No vitals recorded yet. Add your first entry above.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {vitals.slice(0, 10).map((vital) => (
                <div key={vital.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="text-sm">
                      <div className="font-medium">
                        {vital.heart_rate} bpm • {vital.temperature}°C • {vital.spo2}% • {vital.blood_pressure_systolic}/{vital.blood_pressure_diastolic}
                      </div>
                      <div className="text-muted-foreground">
                        {new Date(vital.created_at).toLocaleString()}
                        {vital.notes && ` • ${vital.notes}`}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(vital.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
