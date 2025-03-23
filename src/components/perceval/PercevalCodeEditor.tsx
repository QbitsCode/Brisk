'use client'

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface PercevalCodeEditorProps {
  code: string
  onCodeChange: (code: string) => void
  onRunCode: () => void
  results: any
}

export default function PercevalCodeEditor({ 
  code, 
  onCodeChange, 
  onRunCode,
  results 
}: PercevalCodeEditorProps) {
  const [isRunning, setIsRunning] = useState(false)
  const { toast } = useToast()

  const handleRunCode = async () => {
    setIsRunning(true)
    try {
      await onRunCode()
    } catch (error) {
      console.error('Error running code:', error)
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="space-y-4">
        <div className="relative min-h-[500px] border rounded-md">
          <textarea
            className="font-mono text-sm p-4 w-full h-full min-h-[500px] resize-none bg-slate-50 dark:bg-slate-900 focus:outline-none"
            value={code}
            onChange={(e) => onCodeChange(e.target.value)}
            spellCheck={false}
          />
        </div>
        <div className="flex justify-between items-center">
          <Button 
            onClick={handleRunCode} 
            disabled={isRunning}
            className="w-32"
          >
            {isRunning ? 'Running...' : 'Run Code'}
          </Button>
          <div className="space-x-2">
            <Button 
              variant="outline" 
              onClick={() => {
                toast({
                  title: "Code Saved",
                  description: "Your Perceval code has been saved.",
                })
              }}
            >
              Save
            </Button>
            <Button 
              variant="outline"
              onClick={() => {
                const confirmed = confirm('Are you sure you want to clear the code editor?')
                if (confirmed) {
                  onCodeChange('')
                }
              }}
            >
              Clear
            </Button>
          </div>
        </div>
      </div>

      <div className="min-h-[500px] border rounded-md overflow-hidden">
        <Tabs defaultValue="output">
          <TabsList className="bg-slate-100 dark:bg-slate-800 w-full justify-start px-2 pt-2">
            <TabsTrigger value="output">Output</TabsTrigger>
            <TabsTrigger value="plots">Plots</TabsTrigger>
          </TabsList>
          <TabsContent value="output" className="p-0 h-full">
            <div className="font-mono text-sm p-4 bg-black text-green-400 h-[465px] overflow-auto">
              {results ? (
                <>
                  <div className="mb-2">
                    <span className="text-blue-400">{'>>> '}</span>
                    Executing Perceval code...
                  </div>
                  {results.stdout ? results.stdout.split('\n').map((line: string, i: number) => (
                    <div key={i}>{line}</div>
                  )) : (
                    <div className="text-yellow-400">No output generated.</div>
                  )}
                  {results.stderr && (
                    <div className="text-red-400 mt-2">
                      {results.stderr.split('\n').map((line: string, i: number) => (
                        <div key={i}>{line}</div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-gray-500">
                  Run your code to see the output here.
                </div>
              )}
            </div>
          </TabsContent>
          <TabsContent value="plots" className="p-0">
            <div className="bg-white dark:bg-slate-800 h-[465px] flex items-center justify-center">
              {results && results.plots && results.plots.length > 0 ? (
                <div className="w-full h-full overflow-auto p-4">
                  {results.plots.map((plot: string, i: number) => (
                    <div key={i} className="mb-4">
                      <img 
                        src={`data:image/png;base64,${plot}`} 
                        alt={`Plot ${i+1}`}
                        className="max-w-full h-auto mx-auto"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500">
                  No plots generated. Use matplotlib or Perceval's visualization functions to generate plots.
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
