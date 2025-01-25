export const briskConfig = {
  framework: {
    name: "Brisk Quantum Framework",
    description: "A modern framework for quantum photonic computing and quantum networks",
    version: "1.0.0"
  },
  applications: {
    photonic: {
      title: "Quantum Photonic Computing",
      features: [
        "Linear optical quantum computing",
        "Photonic qubit manipulation",
        "Quantum gates and circuits",
        "State preparation and measurement"
      ],
      use_cases: [
        "Quantum simulation",
        "Optical quantum computing",
        "Quantum memory interfaces"
      ]
    },
    networking: {
      title: "Quantum Networks & Communications",
      features: [
        "Quantum state distribution",
        "Entanglement generation",
        "Quantum key distribution",
        "Quantum secure direct communication",
        "Quantum repeater networks",
        "Error correction and purification"
      ],
      use_cases: [
        "Secure quantum networks",
        "Distributed quantum computing",
        "Quantum sensor networks",
        "Secure key exchange",
        "Quantum-safe communications"
      ]
    }
  },
  capabilities: {
    simulation: {
      linear_optics: true,
      state_evolution: true,
      measurement: true,
      noise_modeling: true
    },
    hardware: {
      photon_sources: true,
      beam_splitters: true,
      phase_shifters: true,
      detectors: true
    },
    analysis: {
      visualization: true,
      state_tomography: true,
      process_tomography: true,
      error_analysis: true
    }
  }
}
