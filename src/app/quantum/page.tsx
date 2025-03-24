'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import QuantumCircuitCard from "@/components/quantum/QuantumCircuitCard"
import PhotonicChipDesigner from "@/components/quantum/PhotonicChipDesigner"
import QuantumNetworkSimulator from "@/components/quantum/QuantumNetworkSimulator"
import { BB84Card } from "@/components/quantum/BB84Card"

export default function QuantumPage() {
  return (
    <div className="container mx-auto p-4">
      <PhotonicChipDesigner />
    </div>
  )
}
