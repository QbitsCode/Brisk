export const briskConfig = {
  framework: {
    name: 'Brisk',
    version: '0.1.0',
    description: 'High-performance quantum photonic framework for real-world applications',
  },
  
  applications: {
    photonic: {
      title: 'Quantum Photonic Computing',
      features: [
        'Linear optical quantum computing',
        'Photonic qubit manipulation',
        'Quantum gates and circuits',
        'State preparation and measurement'
      ],
      use_cases: [
        'Quantum simulation',
        'Optical quantum computing',
        'Quantum memory interfaces'
      ]
    },
    
    networking: {
      title: 'Quantum Networks',
      features: [
        'Quantum state distribution',
        'Entanglement generation',
        'Quantum repeater networks',
        'Error correction and purification'
      ],
      use_cases: [
        'Secure quantum networks',
        'Distributed quantum computing',
        'Quantum sensor networks'
      ]
    },
    
    communications: {
      title: 'Quantum Communications',
      features: [
        'Quantum key distribution',
        'Quantum secure direct communication',
        'Quantum digital signatures',
        'Quantum authentication'
      ],
      use_cases: [
        'Secure key exchange',
        'Quantum-safe communications',
        'Quantum cryptography'
      ]
    },
    
    internet: {
      title: 'Quantum Internet',
      features: [
        'End-to-end entanglement',
        'Quantum routing protocols',
        'Quantum network stack',
        'Quantum repeater chains'
      ],
      use_cases: [
        'Global quantum network',
        'Quantum cloud computing',
        'Distributed quantum applications'
      ]
    }
  },

  capabilities: {
    simulation: {
      photon_loss: true,
      decoherence: true,
      detector_efficiency: true,
      timing_jitter: true
    },
    hardware: {
      single_photon_sources: true,
      photon_detectors: true,
      optical_switches: true,
      phase_modulators: true
    },
    protocols: {
      bb84: true,
      e91: true,
      twin_field_qkd: true,
      mdi_qkd: true
    }
  }
};
