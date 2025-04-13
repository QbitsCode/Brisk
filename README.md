


# Brisk Quantum Framework

A modern, interactive quantum computing framework for photonic quantum circuits and quantum network simulations.

## Features

- **Quantum Circuit Designer**: Interactive drag-and-drop interface for designing quantum photonic circuits with modern glass UI and auto-expand functionality
- **Circuit Templates**: Pre-designed quantum circuit templates for common experiments with professional visualizations
- **Quantum Network Simulator**: Real-time simulation of quantum networks and protocols
- **Quantum Key Distribution**: Implementation and analysis of QKD protocols
- **Component Connection**: Create fully connected quantum circuits with intuitive port connections and bezier curves
- **Perceval Integration**: Program and simulate photonic quantum computers using Quandela's Perceval framework
- **Photonic Chip Designer**: Design and visualize quantum photonic integrated circuits with GDS Factory
- **QuantumTalk**: Community discussion forum for quantum computing topics
- **Modern User Experience**: Professional user profile handling with OAuth provider avatars and elegant splash screen

## Framework Capabilities

### Simulation
- Linear Optics
- State Evolution
- Measurement
- Noise Modeling
- Perceval-based Circuit Simulation

### Hardware Support
- Single Photon Sources
- Beam Splitters
- Phase Shifters
- Single Photon Detectors
- Mach-Zehnder Interferometers (MZI)
- Ring Resonators
- Waveguides
- Integrated Photonic Chips

### Analysis Tools
- Visualization
- State Tomography
- Process Tomography
- Error Analysis
- Unitary Matrix Computation
- GDS Visualization

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- Python (v3.9 or higher)
- pip (for Python package management)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/QbitsCode/Brisk.git
cd Brisk
```

2. Install frontend dependencies:
```bash
npm install
```

3. Install Python backend dependencies:
```bash
cd quantum_backend
pip install -r requirements.txt
cd ..
```

### Running the Application

1. Start the backend server:
```bash
cd quantum_backend
python quantum_service.py
```

2. In a new terminal, start the frontend development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:3000`

## Development

The application is built with:
- Frontend: Next.js 15, React 19, TypeScript, Tailwind CSS
- Backend: Python with FastAPI
- Quantum Simulation: Custom quantum optics simulation engine and Perceval integration
- Authentication: Google and GitHub OAuth integration

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the Apache License 2.0 License - see the [LICENSE](LICENSE) file for details.

Built by Qbits.
