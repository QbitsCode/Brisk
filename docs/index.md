# Brisk - Quantum Communications Platform

Welcome to Brisk, an advanced quantum communications platform featuring:

## Features

- **Photonic Chip Designer**: Design and simulate photonic quantum circuits
- **Quantum Network Simulator**: Test quantum network protocols
- **BB84 Protocol Implementation**: Quantum Key Distribution simulation
- **GDSII Export**: Export your designs to industry-standard GDSII format

## Getting Started

1. **Installation**
   ```bash
   git clone https://github.com/QbitsCode/Brisk.git
   cd brisk
   npm install
   ```

2. **Running the Application**
   ```bash
   npm run dev
   ```

3. **Using the Designer**
   - Navigate to `/designer` to access the Photonic Chip Designer
   - Use the toolbar to add components
   - Connect components by clicking their ports
   - Export your design to GDSII format

## Components

### Frontend
- Next.js 13+ with App Router
- TypeScript
- Tailwind CSS
- shadcn/ui components
- Konva.js for canvas rendering

### Backend
- FastAPI
- Python Quantum Libraries
- Custom GDSII writer

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
