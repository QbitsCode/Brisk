interface Explanation {
  title: string;
  summary: string;
  fullContent: string;
}

interface ExplanationDictionary {
  [key: string]: Explanation;
}

export const quantumExplanations: ExplanationDictionary = {
  hom: {
    title: "Hong-Ou-Mandel (HOM) Interference",
    summary: "A quantum optics phenomenon where two identical photons entering a 50:50 beam splitter from different input ports will always exit together through the same output port.",
    fullContent: `The Hong-Ou-Mandel (HOM) Interference is a quantum optics phenomenon that occurs when two identical photons enter a 50:50 beam splitter from different input ports. If the photons are perfectly indistinguishable in all degrees of freedom (arrival time, polarization, frequency, etc.), they will always exit the beam splitter together through the same output port. This results in a characteristic dip in coincidence detection, known as the HOM dip, when measuring the number of times photons are detected at separate output ports.

Key Aspects:
• Quantum Indistinguishability: Requires completely indistinguishable photons
• Two-Photon Quantum Interference: A purely quantum mechanical effect
• The Beam Splitter Effect: Creates quantum superposition of possible outputs
• HOM Dip: Zero probability of separate detection at perfect indistinguishability

Applications include quantum computing, quantum cryptography, quantum metrology, and photon indistinguishability testing.`
  },
  mzi: {
    title: "Mach-Zehnder Interferometer (MZI)",
    summary: "An optical device that uses two beam splitters and two mirrors to measure phase differences between two light paths.",
    fullContent: `The Mach-Zehnder Interferometer (MZI) is a device used in optics and quantum mechanics to measure phase differences between two paths of light. It consists of two beam splitters and two mirrors, which direct light into two possible paths. By adjusting the relative phase between the paths, one can control the interference pattern at the output.

Components:
• First Beam Splitter (BS1): Splits incoming light into two coherent beams
• Mirrors (M1 & M2): Direct beams to recombine
• Phase Shift (Δφ): Introduces phase difference between paths
• Second Beam Splitter (BS2): Recombines beams for interference
• Detectors (D1 & D2): Measure output intensities

Applications include quantum optics experiments, quantum computing, optical sensing, and telecommunications.`
  }
};
