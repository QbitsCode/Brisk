<p align="center">
  <img src="[https://i.ibb.co/4S5GpGn/brisk-logo.png](https://imagekit.io/tools/asset-public-link?detail=%7B%22name%22%3A%22brisklogo.jpg%22%2C%22type%22%3A%22image%2Fjpeg%22%2C%22signedurl_expire%22%3A%222028-04-12T17%3A03%3A38.792Z%22%2C%22signedUrl%22%3A%22https%3A%2F%2Fmedia-hosting.imagekit.io%2F98dd36359eca4fc5%2Fbrisklogo.jpg%3FExpires%3D1839171819%26Key-Pair-Id%3DK2ZIVPTIP2VGHC%26Signature%3DWzqVTHFPEMevwvGGvWP8bsQOjojmDu5imCb-0RbB7dFxMDLGJGYzrwr8EoZF8Iun1O87HTTmqebkqNgmgIFqtxA-Y6lcxnBxgLHe-xnYd79yupUcOIjdDODkSPya4~~vj4qtlXzHCpbrKXiT3zvA7bRYTPKrUcTbo7XTH6Sc0Q9-rWEOKj4ttQgZ49StZJANXH9D9Fleh1Q1c9~anv7wdbe8i3CfsOU7CraUaFj9vzDvj-t7XBT0DkaHi~B-N7SQCXmXq4YeYVt4yrtb3x6zMLzVw~rtOwE~DXoYkv345LpJjuZgFQ635W0xgvAOUTFI-j7p-SuukEg-Ii3oWSx1uQ__%22%7D)" alt="Brisk Logo" width="300"/>
</p>


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
