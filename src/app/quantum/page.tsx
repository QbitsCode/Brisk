'use client'

// Only import what's actually used
import PhotonicChipDesigner from "@/components/quantum/PhotonicChipDesigner"

// Commented out unused imports to fix ESLint errors
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import QuantumCircuitCard from "@/components/quantum/QuantumCircuitCard"
// import QuantumNetworkSimulator from "@/components/quantum/QuantumNetworkSimulator"
// import { BB84Card } from "@/components/quantum/BB84Card"

export default function QuantumPage() {
  return (
    <div className="container mx-auto p-4">
      <PhotonicChipDesigner />
    </div>
  )
}
