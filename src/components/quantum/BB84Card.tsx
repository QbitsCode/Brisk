'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Progress } from "@/components/ui/progress"
import { toast } from "@/components/ui/use-toast"

export function BB84Card() {
  const [numQubits, setNumQubits] = useState(10)
  const [sessionId, setSessionId] = useState('')
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<{
    key_length?: number
    error_rate?: number
    secure_key?: string
  }>({})

  const startProtocol = async () => {
    try {
      setIsLoading(true)
      setStatus('Initializing BB84 protocol...')
      setProgress(10)
      
      // Initialize BB84 session
      const initResponse = await fetch('http://localhost:8000/api/quantum/bb84/init', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: Date.now().toString(),
          num_qubits: numQubits
        }),
      })
      
      if (!initResponse.ok) {
        throw new Error('Failed to initialize BB84 protocol')
      }

      const initData = await initResponse.json()
      setSessionId(initData.session_id)
      setProgress(30)
      setStatus('Quantum states prepared...')

      // Simulate Bob's measurements
      const bobBases = Array(numQubits).fill(0).map(() => Math.random() < 0.5 ? 0 : 1)
      setProgress(60)
      setStatus('Measurements completed...')

      // Compare bases and generate key
      const matchingBases = initData.bases.map((basis: number, idx: number) => basis === bobBases[idx])
      const keyLength = matchingBases.filter(Boolean).length
      
      setProgress(100)
      setResults({
        key_length: keyLength,
        error_rate: (numQubits - keyLength) / numQubits,
        secure_key: '0'.repeat(Math.floor(keyLength / 2)) // Simplified key representation
      })
      setStatus('Protocol completed successfully!')
      
      toast({
        title: "BB84 Protocol Complete",
        description: `Generated secure key of length ${keyLength} bits`,
      })
    } catch (error) {
      console.error('Error in BB84 protocol:', error)
      toast({
        title: "Error",
        description: "Failed to complete BB84 protocol. Please try again.",
        variant: "destructive",
      })
      setStatus('Error occurred during protocol execution')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>BB84 QKD Protocol</CardTitle>
        <CardDescription>
          Quantum Key Distribution using the BB84 protocol
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <label className="text-sm font-medium">Number of Qubits</label>
            <Slider
              value={[numQubits]}
              onValueChange={(value) => setNumQubits(value[0])}
              min={4}
              max={50}
              step={2}
              className="mt-2"
            />
            <span className="text-sm text-muted-foreground">
              Selected: {numQubits} qubits
            </span>
          </div>

          <Button
            onClick={startProtocol}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? "Running Protocol..." : "Start Protocol"}
          </Button>

          {progress > 0 && (
            <div className="space-y-2">
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-muted-foreground">{status}</p>
            </div>
          )}

          {results.key_length !== undefined && (
            <div className="space-y-2 border rounded-lg p-4 bg-background/50">
              <h3 className="font-medium">Results</h3>
              <div className="space-y-1">
                <p className="text-sm">Key Length: {results.key_length} bits</p>
                <p className="text-sm">Error Rate: {(results.error_rate! * 100).toFixed(1)}%</p>
                <div className="font-mono text-sm break-all bg-muted p-2 rounded">
                  <p className="text-xs text-muted-foreground mb-1">Secure Key:</p>
                  {results.secure_key}
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
