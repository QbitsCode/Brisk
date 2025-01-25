# Brisk Quantum Framework

A modern, interactive quantum computing framework for photonic quantum circuits and quantum network simulations.

## Features

- **Quantum Circuit Designer**: Interactive drag-and-drop interface for designing quantum photonic circuits
- **Circuit Templates**: Pre-designed quantum circuit templates for common experiments
- **Quantum Network Simulator**: Real-time simulation of quantum networks and protocols
- **Quantum Key Distribution**: Implementation and analysis of QKD protocols

## Framework Capabilities

### Simulation
- Linear Optics
- State Evolution
- Measurement
- Noise Modeling

### Hardware Support
- Photon Sources
- Beam Splitters
- Phase Shifters
- Detectors

### Analysis Tools
- Visualization
- State Tomography
- Process Tomography
- Error Analysis

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
pip install -r requirements.txt
```

### Running the Application

1. Start the backend server:
```bash
python server/main.py
```

2. In a new terminal, start the frontend development server:
```bash
npm run dev
```

3. Open your browser and navigate to `http://localhost:3000`

## Development

The application is built with:
- Frontend: Next.js 14, React, TypeScript, Tailwind CSS
- Backend: Python with FastAPI
- Quantum Simulation: Custom quantum optics simulation engine

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

Built by Qbits.

## Contact

Project Link: [https://github.com/QbitsCode/Brisk](https://github.com/QbitsCode/Brisk)
