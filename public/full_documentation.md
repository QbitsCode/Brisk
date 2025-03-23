# Brisk Documentation

Brisk is a comprehensive platform for quantum communications and photonic circuit design, integrating powerful frameworks like Perceval and GDSFactory. This documentation provides detailed information about installation, usage, and advanced features.

> [!NOTE] 
> Brisk is designed to be a comprehensive toolbox for quantum communications researchers and engineers. It provides a unified interface for both photonic circuit design and quantum network simulation.

## Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
   - [Installation](#installation)
   - [Running the Application](#running-the-application)
3. [Quantum Backend](#quantum-backend)
   - [Architecture](#architecture)
   - [API Endpoints](#api-endpoints)
   - [Models](#models)
4. [Frontend Components](#frontend-components)
   - [Perceval Integration](#perceval-integration)
   - [GDSFactory Integration](#gdsfactory-integration)
   - [User Interface](#user-interface)
5. [Perceval Framework](#perceval-framework)
   - [Overview](#overview)
   - [Key Components](#key-components)
   - [Examples](#examples)
   - [API Reference](#api-reference)
6. [GDSFactory Framework](#gdsfactory-framework)
   - [Overview](#overview-1)
   - [Quantum Components](#quantum-components)
   - [API Reference](#api-reference-1)
   - [Fabrication Guidelines](#fabrication-guidelines)
7. [Photonic Chip Designer](#photonic-chip-designer)
8. [Quantum Network Simulator](#quantum-network-simulator)
9. [BB84 Protocol Implementation](#bb84-protocol-implementation)
10. [Advanced Topics](#advanced-topics)
11. [Troubleshooting](#troubleshooting)

## Introduction

Brisk is an advanced quantum communications platform designed for photonic quantum computing and quantum communication protocols. The platform provides a comprehensive set of tools for designing, simulating, and testing quantum photonic systems with a focus on ease-of-use and visualization.

Key features include:
- Photonic Chip Designer for creating and simulating quantum photonic circuits
- Quantum Network Simulator for testing quantum network protocols
- BB84 Quantum Key Distribution protocol implementation
- Full integration with Perceval for programming photonic quantum computers
- Integration with GDSFactory for designing and exporting photonic circuits to industry-standard GDSII format

## Getting Started

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

3. Set up the quantum backend:
   ```bash
   cd quantum_backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

> [!TIP]
> If you're only interested in the frontend components, you can skip the Python dependencies installation.

### Running the Application

1. Start the quantum backend (from the `quantum_backend` directory):
   ```bash
   python quantum_service.py
   ```
   The backend will start at http://localhost:8000.

2. Start the frontend (from the root directory):
   ```bash
   npm run dev
   ```
   The frontend will be available at http://localhost:3000.

> [!IMPORTANT]
> The backend must be running before starting the frontend to ensure all quantum simulation features work correctly.

## Quantum Backend

### Architecture

The quantum backend is built on FastAPI and provides a comprehensive set of endpoints for quantum simulations and circuit processing. It integrates several key Python quantum libraries:

- **Pennylane**: For quantum circuit simulation
- **Perceval**: For photonic quantum computing
- **GDSFactory**: For photonic chip design
- **NetworkX**: For quantum network simulations

### API Endpoints

#### Quantum Circuit Simulation
- **POST** `/api/quantum/circuit/simulate`: Simulate a quantum photonic circuit

#### Network Simulation
- **POST** `/api/quantum/network/simulate`: Simulate a quantum network

#### BB84 Protocol
- **POST** `/api/quantum/bb84/simulate`: Simulate the BB84 quantum key distribution protocol

#### Perceval Integration
- **POST** `/api/quantum/perceval/execute`: Execute Perceval quantum code
- **POST** `/api/quantum/perceval/visualize`: Generate visualizations for Perceval code

#### GDSFactory Integration
- **POST** `/api/quantum/gdsfactory/execute`: Execute GDSFactory photonic chip design code

### Models

The backend uses the following data models:

- **PhotonicCircuit**: Represents a photonic circuit with components and connections
- **QuantumNetwork**: Represents a quantum network with nodes and connections
- **BB84Parameters**: Parameters for the BB84 protocol simulation
- **PercevalCodeRequest**: Request for Perceval code execution
- **GDSFactoryCodeRequest**: Request for GDSFactory code execution

## Frontend Components

The frontend is built with Next.js 13+ using the App Router, TypeScript, and Tailwind CSS.

### Perceval Integration

The Perceval integration consists of three main components:

1. **PercevalCodeEditor**: Interactive code editor for writing and executing Perceval code.
   - Features syntax highlighting, error handling, and execution controls
   - Displays simulation results and plots
   - Shows unitary matrices for circuit analysis

2. **PercevalVisualizer**: Visualization tool for quantum circuits and states.
   - Renders interactive circuit diagrams
   - Displays quantum state visualizations
   - Shows probability distributions

3. **PercevalDocumentation**: Comprehensive documentation for using Perceval.
   - Quick start guides
   - Code examples
   - API reference
   - Learning resources

### GDSFactory Integration

The GDSFactory integration provides:

1. **GDSFactoryCodeEditor**: Code editor for photonic chip design.
2. **GDSFactoryVisualizer**: Visualization for photonic components and chips.
3. **GDSFactoryDocumentation**: Documentation for quantum photonic components.

### User Interface

The UI is built using shadcn/ui components and includes:
- Responsive layout with mobile support
- Dark/light mode
- Interactive tabs and accordions
- Toast notifications for feedback
- Drag-and-drop interfaces for circuit building

## Perceval Framework

### Overview

Perceval is an open source framework for programming photonic quantum computers, developed by Quandela. It provides tools for simulating, designing, and understanding photonic quantum computing systems.

> [!NOTE] 
> Perceval is integrated directly into Brisk, providing a seamless experience for quantum communications researchers and engineers. All Perceval functionality is accessible through the Brisk interface.

### Key Components

1. **Quantum Optical Circuits**
   - Linear optical circuits with beam splitters, phase shifters
   - Non-linear components (Kerr, cross-Kerr)
   - Sources (single photon, SPDC, coherent state)
   - Detectors (bucket, PNR, homodyne)

2. **Quantum State Manipulation**
   - State vector representation
   - Density matrix formalism
   - Unitary transformations
   - Measurement operations

> [!TIP]
> For optimal performance when working with large quantum states, use the sparse matrix representation option in the Perceval settings panel. This can significantly improve simulation speed for states with many photons.

### Basic Usage

Perceval can be used in Brisk through both the GUI and programmatically:

#### GUI Usage

1. Navigate to the Perceval tab in the main navigation
2. Use the circuit editor to drag and drop components
3. Configure component parameters using the properties panel
4. Run the simulation and view results in the visualization panel

#### Programmatic Usage

```python
from perceval.components import BS, PS, Circuit
from perceval.utils import BasicState

# Create a circuit
circuit = Circuit(2)  # 2-mode circuit
circuit.add(0, BS())  # Add a beam splitter at position 0
circuit.add(1, PS(phi=0.5))  # Add a phase shifter at position 1

# Define input state
input_state = BasicState([1, 1])  # |1,1⟩ state (one photon in each mode)

# Simulate and get output state
output_state = circuit.evolve(input_state)
print(output_state)
```

> [!WARNING]
> Perceval simulations can be computationally intensive. For circuits with more than 10 photons, consider using the provided optimization techniques or enabling GPU acceleration.

### Advanced Features

#### Circuit Optimization

Perceval provides tools for optimizing circuits to achieve specific operations:

```python
from perceval.components.unitary_components import Unitary
from perceval.algorithms import Optimizer

# Define target unitary
target_unitary = Unitary([[0.5, -0.5, 0.5, 0.5], 
                          [0.5, 0.5, 0.5, -0.5],
                          [0.5, 0.5, -0.5, 0.5],
                          [0.5, -0.5, -0.5, -0.5]])

# Create optimizer
optimizer = Optimizer(target_unitary)
optimized_circuit = optimizer.optimize()
```

> [!IMPORTANT]
> When optimizing circuits, set a reasonable convergence threshold and maximum iterations to balance accuracy with computation time. The default values may not be appropriate for all applications.

#### Noise Modeling

Realistic quantum photonic simulations require accounting for imperfections:

```python
from perceval.utils import NoiseModel

# Define a noise model
noise = NoiseModel(loss_rate=0.01, dark_count_rate=1e-6)

# Apply to circuit simulation
noisy_output = circuit.evolve(input_state, noise_model=noise)
```

## GDSFactory Framework

### Overview

GDSFactory is a powerful Python library for designing photonic chips, including quantum photonic circuits. It enables the creation, simulation, and export of photonic components to industry-standard formats for fabrication.

### Quantum Components

#### Beam Splitters
Beam splitters are fundamental components in quantum photonic circuits, used to create superposition states.

Available Components:
- `directional_coupler`: Evanescent coupling between waveguides
- `mmi2x2`: Multimode interference coupler with 2 inputs and 2 outputs

#### Phase Shifters
Phase shifters allow controlled manipulation of quantum states by adjusting the optical path length.

Implementation Options:
- `delay_snake`: Physical path length difference
- `ring_single`: Ring resonators for phase control
- `heater_metal`: Thermo-optic phase shifter

#### Mach-Zehnder Interferometers
MZIs are essential building blocks for implementing quantum gates in photonic quantum computers.

Key Parameters:
- `delta_length`: Path length difference
- `splitter`: Type of splitter ('directional_coupler' or 'mmi2x2')

### API Reference

#### Component Creation
- `gf.Component()`: Create a new empty component
- `component.show()`: Display a component visualization
- `component.write_gds(filename)`: Save component to a GDS file

#### Quantum-Specific Components
- `gf.components.mzi()`: Mach-Zehnder interferometer
- `gf.components.mmi2x2()`: 2x2 multimode interference coupler
- `gf.components.coupler()`: Directional coupler
- `gf.components.ring_single()`: Single ring resonator

### Fabrication Guidelines

#### GDSII Export
GDSFactory designs can be exported to industry-standard GDSII format for fabrication:

```python
# Export a component to GDSII
component.write_gds("quantum_chip.gds")

# Export with specific settings
component.write_gds(
    "quantum_chip.gds",
    unit=1e-6,  # units in microns
    precision=1e-9  # nanometer precision
)
```

#### Quantum-Specific Fabrication Considerations
- **Low-Loss Requirements**: Quantum photonic circuits require extremely low-loss waveguides. Use curved waveguides with large bend radii (>20μm for silicon) and minimize crossings.
- **Phase Stability**: Phase shifters should be carefully designed for thermal isolation to prevent crosstalk between quantum operations.
- **Symmetrical Couplers**: Beam splitters must be fabricated with high precision to achieve the desired splitting ratios for quantum operations.

## Photonic Chip Designer

The Photonic Chip Designer allows users to create photonic quantum circuits through an intuitive drag-and-drop interface.

### Features
- Interactive canvas for component placement
- Connection tools for circuit wiring
- Component library with beam splitters, phase shifters, and detectors
- Simulation capabilities for testing circuit behavior
- Export to GDS format for fabrication

### Workflow
1. Select components from the sidebar
2. Place components on the canvas
3. Connect components by clicking on ports
4. Configure component parameters
5. Simulate the circuit to see quantum behavior
6. Export to GDS format for fabrication

## Quantum Network Simulator

The Quantum Network Simulator enables testing of quantum network protocols and architectures.

### Features
- Node-based network creation
- Support for different node types (sources, repeaters, detectors)
- Simulation of quantum state transfer through networks
- Analysis of noise and loss effects
- Visualization of network performance

### Workflow
1. Create network topology
2. Configure node properties
3. Set up quantum protocols
4. Run simulation
5. Analyze results and performance metrics

## BB84 Protocol Implementation

The BB84 protocol implementation simulates quantum key distribution between two parties.

### Features
- Complete simulation of the BB84 protocol steps
- Basis selection and measurement
- Error detection and correction
- Privacy amplification
- Eavesdropper detection
- Performance metrics calculation

### Workflow
1. Configure protocol parameters
2. Run the protocol simulation
3. View the key generation process
4. Analyze security metrics
5. Test different eavesdropping scenarios

## Advanced Topics

### Custom Quantum Components
The platform supports the creation of custom quantum components:

1. Define the component in Perceval:
   ```python
   # Create a custom component
   custom_component = pcvl.Circuit(2)
   custom_component.add(0, pcvl.BS())
   custom_component.add(0, pcvl.PS(phi=np.pi/4))
   ```

2. Create a custom GDSFactory component:
   ```python
   # Create a custom GDSFactory component
   @gf.cell
   def custom_mzi(delta_length=10, width=0.5):
       # Implementation details
       c = gf.Component("custom_mzi")
       # Add waveguides, couplers, etc.
       return c
   ```

### Performance Optimization
Tips for optimizing simulations:
- Use the appropriate backend for your simulation size
- Limit the photon number for large circuits
- Consider symmetries to reduce computation time
- Use progressive refinement for complex simulations

## Troubleshooting

### Common Issues

#### Backend Connection Failed
If the frontend cannot connect to the backend:
1. Ensure the backend is running on port 8000
2. Check that CORS is properly configured
3. Verify network connectivity between frontend and backend

#### Simulation Errors
If simulations fail:
1. Check input state validity (correct photon numbers)
2. Verify circuit connections are complete
3. Ensure phase parameters are within valid ranges
4. Check for memory limitations with large circuits

#### Visualization Issues
If visualizations don't appear:
1. Check browser console for errors
2. Verify the circuit is valid
3. Try simplified circuits first
4. Ensure the backend returned valid visualization data

### Getting Help
- Check the GitHub repository for issues
- Consult the Perceval and GDSFactory documentation
- Contact support at support@qbitscode.com
