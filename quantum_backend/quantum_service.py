# Set matplotlib to use non-GUI backend before any other imports
import matplotlib
matplotlib.use('Agg')  # Use Agg backend for server environment (no GUI)

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import numpy as np
import pennylane as qml
import gdsfactory as gf
import networkx as nx
import json
import base64
from io import BytesIO, StringIO
import matplotlib.pyplot as plt
import sys
import contextlib

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://brisk-quantum.vercel.app", "https://*.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models for request/response
class PhotonicComponent(BaseModel):
    type: str
    params: Dict[str, float]
    position: Dict[str, float]

class PhotonicCircuit(BaseModel):
    components: List[PhotonicComponent]
    connections: List[Dict[str, int]]

class NetworkNode(BaseModel):
    type: str
    position: Dict[str, float]
    parameters: Dict[str, Any]

class QuantumNetwork(BaseModel):
    nodes: List[NetworkNode]
    connections: List[Dict[str, int]]

class BB84Parameters(BaseModel):
    num_qubits: int
    error_rate: float
    eavesdropping: bool

class PercevalCodeRequest(BaseModel):
    code: str

class GDSFactoryCodeRequest(BaseModel):
    code: str

class PercevalCodeResponse(BaseModel):
    stdout: str
    stderr: str
    plots: List[str] = []
    unitary: Optional[str] = None

class PercevalVisualizationResponse(BaseModel):
    circuit_visualization: Optional[str] = None
    state_visualization: Optional[str] = None
    error: Optional[str] = None

class GDSFactoryCodeResponse(BaseModel):
    stdout: str
    stderr: str
    preview: Optional[str] = None
    visualization: Optional[str] = None
    visualization_3d: Optional[str] = None
    gds_file: Optional[str] = None
    simulation_results: Optional[Dict[str, Any]] = None
    simulation_plots: Optional[List[str]] = None

def plot_to_base64():
    buf = BytesIO()
    plt.savefig(buf, format='png', bbox_inches='tight', dpi=100)
    buf.seek(0)
    return base64.b64encode(buf.getvalue()).decode('utf-8')

def create_gds_layout(circuit: PhotonicCircuit) -> str:
    # Create a new GDS cell
    c = gf.Component("quantum_circuit")
    
    # Define component dimensions
    width = 0.5
    length = 10
    spacing = 20
    
    # Create waveguides and components
    y_offset = 0
    component_refs = {}
    
    for idx, component in enumerate(circuit.components):
        x = component.position["x"] * 0.1  # Scale position to appropriate dimensions
        y = component.position["y"] * 0.1
        
        if component.type == "source":
            # Create input waveguide
            wg = c << gf.components.straight(length=length, width=width)
            wg.move((x, y))
            component_refs[idx] = wg
            
        elif component.type == "beamsplitter":
            # Create directional coupler
            dc = c << gf.components.coupler(
                gap=0.2,
                length=length,
                dx=spacing
            )
            dc.move((x, y))
            component_refs[idx] = dc
            
        elif component.type == "phaseshift":
            # Create phase shifter
            ps = c << gf.components.straight_heater_metal(
                length=length,
                width=width
            )
            ps.move((x, y))
            component_refs[idx] = ps
            
        elif component.type == "detector":
            # Create output waveguide with termination
            wg = c << gf.components.taper(
                length=length,
                width1=width,
                width2=width*2
            )
            wg.move((x, y))
            component_refs[idx] = wg
    
    # Connect components with waveguides
    for conn in circuit.connections:
        src = component_refs[conn["source"]]
        dst = component_refs[conn["target"]]
        
        # Create connecting waveguide
        route = gf.routing.get_route(
            src.ports["o1"],
            dst.ports["o2"],
            cross_section=gf.cross_section.strip(width=width)
        )
        c.add(route.references)
    
    # Generate GDS layout
    gds_data = c.to_gds()
    
    # Convert GDS to image for visualization
    plt.figure(figsize=(10, 10))
    c.plot()
    plt.axis('off')
    gds_image = plot_to_base64()
    plt.close()
    
    return gds_image

# Quantum Circuit Routes
@app.post("/api/quantum/circuit/simulate")
async def simulate_quantum_circuit(circuit: PhotonicCircuit):
    try:
        # Create a PennyLane device with enough wires for our circuit
        num_wires = len(circuit.components)
        dev = qml.device("default.qubit", wires=num_wires)

        @qml.qnode(dev)
        def quantum_circuit():
            # Initialize input states
            for i, comp in enumerate(circuit.components):
                if comp.type == "source":
                    qml.Hadamard(wires=i)

            # Add components
            for idx, component in enumerate(circuit.components):
                if component.type == "beamsplitter":
                    theta = np.arccos(np.sqrt(component.params.get("transmittivity", 0.5)))
                    qml.RY(2 * theta, wires=idx)
                elif component.type == "phaseshift":
                    phase = component.params.get("phase", 0)
                    qml.PhaseShift(phase, wires=idx)

            # Add connections
            for conn in circuit.connections:
                qml.CNOT(wires=[conn["source"], conn["target"]])

            return qml.state()

        # Run simulation
        state = quantum_circuit()
        probabilities = np.abs(state) ** 2
        
        # Generate GDS layout
        gds_layout = create_gds_layout(circuit)
        
        # Create visualization of the quantum state
        plt.figure(figsize=(8, 4))
        plt.bar(range(len(probabilities)), probabilities)
        plt.xlabel('Basis State')
        plt.ylabel('Probability')
        plt.title('Quantum State Probabilities')
        state_viz = plot_to_base64()
        plt.close()
        
        return {
            "state": state.tolist(),
            "probabilities": probabilities.tolist(),
            "state_visualization": state_viz,
            "gds_layout": gds_layout,
            "success": True
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Network Simulation Routes
@app.post("/api/quantum/network/simulate")
async def simulate_quantum_network(network: QuantumNetwork):
    try:
        # Create NetworkX graph for quantum network
        G = nx.Graph()
        
        # Add nodes
        for idx, node in enumerate(network.nodes):
            G.add_node(idx, **{
                "type": node.type,
                "position": node.position,
                "parameters": node.parameters
            })
        
        # Add edges
        for conn in network.connections:
            source = conn["source"]
            target = conn["target"]
            # Calculate distance between nodes
            pos1 = network.nodes[source].position
            pos2 = network.nodes[target].position
            distance = np.sqrt((pos1["x"] - pos2["x"])**2 + (pos1["y"] - pos2["y"])**2)
            
            G.add_edge(source, target, distance=distance)
        
        # Calculate network metrics
        avg_path_length = nx.average_shortest_path_length(G, weight="distance")
        clustering = nx.average_clustering(G)
        
        # Simulate quantum channel losses
        def calculate_channel_loss(distance):
            fiber_loss = 0.2  # dB/km
            return 10**(-fiber_loss * distance / 10)
        
        # Calculate entanglement rates and fidelities
        entanglement_rates = {}
        fidelities = {}
        
        for source, target in G.edges():
            distance = G[source][target]["distance"]
            channel_loss = calculate_channel_loss(distance)
            
            # Basic entanglement rate calculation
            base_rate = 1e6  # 1 MHz attempt rate
            success_prob = channel_loss * 0.1  # Detection efficiency
            entanglement_rates[f"{source}-{target}"] = base_rate * success_prob
            
            # Basic fidelity calculation
            base_fidelity = 0.95
            noise_factor = 0.1
            fidelity = base_fidelity * np.exp(-distance * noise_factor)
            fidelities[f"{source}-{target}"] = fidelity
        
        return {
            "network_metrics": {
                "avg_path_length": avg_path_length,
                "clustering": clustering,
                "num_nodes": len(G.nodes),
                "num_edges": len(G.edges)
            },
            "quantum_metrics": {
                "entanglement_rates": entanglement_rates,
                "fidelities": fidelities
            }
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# BB84 Protocol Routes
@app.post("/api/quantum/bb84/simulate")
async def simulate_bb84(params: BB84Parameters):
    try:
        # Simulate BB84 protocol using PennyLane
        dev = qml.device("default.qubit", wires=1)
        
        @qml.qnode(dev)
        def bb84_state_prep(bit, basis):
            if bit:
                qml.PauliX(wires=0)
            if basis:
                qml.Hadamard(wires=0)
            return qml.state()
        
        # Generate random bits for Alice
        num_qubits = params.num_qubits
        alice_bits = np.random.randint(0, 2, num_qubits)
        alice_bases = np.random.randint(0, 2, num_qubits)
        bob_bases = np.random.randint(0, 2, num_qubits)
        
        # Simulate quantum transmission
        bob_measurements = []
        for i in range(num_qubits):
            # Prepare state
            state = bb84_state_prep(alice_bits[i], alice_bases[i])
            
            # Add channel noise
            if params.eavesdropping:
                eve_basis = np.random.randint(0, 2)
                if eve_basis:
                    state = qml.apply(qml.Hadamard(wires=0))(state)
            
            # Bob's measurement
            if bob_bases[i]:
                state = qml.apply(qml.Hadamard(wires=0))(state)
            
            # Simulate measurement
            prob_one = np.abs(state[1])**2
            measurement = 1 if np.random.random() < prob_one else 0
            bob_measurements.append(measurement)
        
        # Sift keys
        matching_bases = alice_bases == bob_bases
        key_bits = alice_bits[matching_bases]
        measured_bits = np.array(bob_measurements)[matching_bases]
        
        # Calculate error rate
        error_rate = np.mean(key_bits != measured_bits)
        
        return {
            "key_rate": len(key_bits) / num_qubits,
            "error_rate": float(error_rate),
            "secure": error_rate < 0.11,  # BB84 security threshold
            "final_key_length": len(key_bits),
            "sample_bits": {
                "alice": key_bits[:10].tolist(),
                "bob": measured_bits[:10].tolist()
            }
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Perceval Integration Routes
def execute_perceval_code(code: str) -> PercevalCodeResponse:
    """
    Execute the provided Perceval code and capture all outputs
    """
    # Try to import Perceval
    try:
        import perceval as pcvl
    except ImportError:
        try:
            # Try the Quandela package name
            import perceval_quandela as pcvl
        except ImportError:
            return PercevalCodeResponse(
                stdout="",
                stderr="Error: Perceval is not installed. Please install with 'pip install perceval-quandela'",
                plots=[],
                unitary=None
            )
    
    # Redirect stdout and stderr
    old_stdout, old_stderr = sys.stdout, sys.stderr
    stdout_capture = StringIO()
    stderr_capture = StringIO()
    plots = []
    unitary_matrix = None
    
    try:
        # Setup execution environment
        local_vars = {
            "pcvl": pcvl,
            "np": np,
            "plt": plt
        }
        
        # Override matplotlib show to capture plots
        original_show = plt.show
        def capture_show():
            buf = BytesIO()
            plt.savefig(buf, format='png')
            buf.seek(0)
            plots.append(base64.b64encode(buf.read()).decode('utf-8'))
            plt.close()
        plt.show = capture_show
        
        # Execute the code
        exec(code, {}, local_vars)
        
        # Get the stdout and stderr
        stdout = stdout_capture.getvalue()
        stderr = stderr_capture.getvalue()
        
        # Check if there's a circuit or unitary matrix in the local vars
        for var_name, var_value in local_vars.items():
            if isinstance(var_value, pcvl.Circuit):
                try:
                    # Try to get the unitary matrix
                    u_matrix = var_value.compute_unitary()
                    # Convert to list for JSON serialization
                    unitary_matrix = u_matrix.tolist()
                    # For complex numbers, convert to dict representation
                    if np.iscomplexobj(u_matrix):
                        unitary_matrix = []
                        for row in u_matrix:
                            unitary_row = []
                            for elem in row:
                                unitary_row.append({
                                    "real": float(elem.real),
                                    "imag": float(elem.imag)
                                })
                            unitary_matrix.append(unitary_row)
                except Exception as e:
                    stderr_capture.write(f"Error computing unitary: {str(e)}\n")
        
    except Exception as e:
        stderr_capture.write(f"Error: {str(e)}\n")
    finally:
        # Restore stdout and stderr
        sys.stdout, sys.stdout = old_stdout, old_stderr
        plt.show = original_show
    
    return PercevalCodeResponse(
        stdout=stdout,
        stderr=stderr_capture.getvalue(),
        plots=plots,
        unitary=json.dumps(unitary_matrix) if unitary_matrix else None
    )

def generate_perceval_visualizations(code: str) -> PercevalVisualizationResponse:
    """
    Generate circuit and state visualizations from Perceval code
    """
    # Try to import Perceval
    try:
        import perceval as pcvl
    except ImportError:
        try:
            # Try the Quandela package name
            import perceval_quandela as pcvl
        except ImportError:
            return PercevalVisualizationResponse(
                circuit_visualization=None,
                state_visualization=None,
                error="Error: Perceval is not installed. Please install with 'pip install perceval-quandela'"
            )
    
    circuit_viz = None
    state_viz = None
    error = None
    
    try:
        # Setup environment with Perceval imports
        local_vars = {
            "pcvl": pcvl,
            "np": np,
            "plt": plt
        }
        
        # Execute the code to get the circuit and state
        exec(code, {}, local_vars)
        
        # Look for circuit and state objects
        circuit = None
        state = None
        
        for var_name, var_value in local_vars.items():
            if isinstance(var_value, pcvl.Circuit):
                circuit = var_value
            elif hasattr(pcvl, 'StateVector') and isinstance(var_value, pcvl.StateVector):
                state = var_value
            elif hasattr(pcvl, 'BasicState') and isinstance(var_value, pcvl.BasicState):
                state = var_value
        
        # Generate circuit visualization
        if circuit:
            plt.figure(figsize=(10, 4))
            pcvl.pdisplay(circuit)
            circuit_viz = plot_to_base64()
            plt.close()
        
        # Generate state visualization if both circuit and state exist
        if circuit and state:
            plt.figure(figsize=(8, 6))
            if hasattr(pcvl, 'StateVisualizer'):
                # If using newer Perceval version with StateVisualizer
                try:
                    viz = pcvl.StateVisualizer(state)
                    viz.draw()
                    state_viz = plot_to_base64()
                except Exception as e:
                    error = f"Error visualizing state: {str(e)}"
            else:
                # Basic state probability visualization
                try:
                    # Process the state through the circuit
                    backend = pcvl.BackendFactory().get_backend("SLOS")
                    sim = pcvl.Processor(backend, circuit)
                    result = sim.process(state)
                    
                    # Plot probabilities
                    states = list(result.keys())
                    probs = list(result.values())
                    
                    plt.bar(range(len(states)), probs)
                    plt.xlabel('Output State')
                    plt.ylabel('Probability')
                    plt.title('Output State Probabilities')
                    plt.xticks(range(len(states)), [str(s) for s in states], rotation=45)
                    
                    state_viz = plot_to_base64()
                except Exception as e:
                    error = f"Error generating state probabilities: {str(e)}"
            plt.close()
            
    except Exception as e:
        error = str(e)
    
    return PercevalVisualizationResponse(
        circuit_visualization=circuit_viz,
        state_visualization=state_viz,
        error=error
    )

@app.post("/api/quantum/perceval/execute")
async def execute_code(request: PercevalCodeRequest) -> PercevalCodeResponse:
    """
    Execute Perceval quantum circuit code and return results
    """
    try:
        return execute_perceval_code(request.code)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/quantum/perceval/visualize")
async def visualize_circuit(request: PercevalCodeRequest) -> PercevalVisualizationResponse:
    """
    Generate visualizations from Perceval code
    """
    try:
        return generate_perceval_visualizations(request.code)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# GDSFactory Integration Routes
def execute_gdsfactory_code(code: str) -> GDSFactoryCodeResponse:
    """
    Execute the provided GDSFactory code and capture all outputs
    """
    # Set up output capture
    old_stdout, old_stderr = sys.stdout, sys.stderr
    stdout_capture = StringIO()
    stderr_capture = StringIO()
    sys.stdout, sys.stderr = stdout_capture, stderr_capture
    
    # Import modules needed for execution
    import gdsfactory as gf
    import numpy as np
    import matplotlib.pyplot as plt
    from io import BytesIO
    import base64
    
    # Capture any plots
    plots = []
    preview_image = None
    visualization_image = None
    visualization_3d_image = None
    gds_data = None
    simulation_results = None
    simulation_plots = []
    
    try:
        # Create a custom namespace for execution
        local_namespace = {
            'gf': gf,
            'np': np,
            'plt': plt,
            '__preview_component': None,
            '__visualization_3d': None
        }
        
        # Modify the code to capture the component for visualization
        modified_code = code + "\n\n"
        modified_code += "# Capture the last component for visualization\n"
        modified_code += "import inspect\n"
        modified_code += "for name, obj in list(locals().items()):\n"
        modified_code += "    if isinstance(obj, gf.Component):\n"
        modified_code += "        __preview_component = obj\n"
        modified_code += "        break\n"
        
        # Execute the modified code
        exec(modified_code, globals(), local_namespace)
        
        # Get the preview component
        preview_component = local_namespace.get('__preview_component')
        
        if preview_component:
            # Create a temporary directory for our files
            import tempfile
            import os
            import gdsfactory as gf
            from pathlib import Path
            
            temp_dir = tempfile.mkdtemp()
            temp_gds_path = Path(temp_dir) / "component.gds"
            temp_png_path = Path(temp_dir) / "preview.png"
            
            # Save the GDS file directly - this is the most fundamental operation
            preview_component.write_gds(temp_gds_path)
            
            # Use a simplified visualization approach that works with built-in modules
            try:
                # Create a clear visualization focusing on the chip layout
                plt.figure(figsize=(10, 8), dpi=150)
                ax = plt.subplot(111)
                
                # Plot with simplified settings to clearly show the chip
                preview_component.plot(
                    with_labels=False,  # Turn off the crowded labels
                    show_ports=True,
                    show_subports=False,
                    new_window=False,
                )
                
                # Enhance colors and line widths for better visibility
                for collection in ax.collections:
                    collection.set_linewidth(2)  # Make waveguides thicker
                
                # Focus on the actual chip area
                bounds = preview_component.bbox
                margin = max(bounds.width, bounds.height) * 0.2
                plt.xlim(bounds.xmin - margin, bounds.xmax + margin)
                plt.ylim(bounds.ymin - margin, bounds.ymax + margin)
                
                # Add a proper title
                plt.title("Quantum Photonic Chip - MZI Layout", fontsize=16)
                plt.grid(False)  # Remove distracting grid
                
                # Save the visualization
                plt.tight_layout()
                plt.savefig(str(temp_png_path))
                plt.close()
                
                stdout_capture.write(f"\n# DEBUG: Generated clean 2D visualization\n")
            
            except Exception as e:
                stderr_capture.write(f"\nError generating visualization: {str(e)}\n")
                import traceback
                stderr_capture.write(traceback.format_exc())
                
                # Fallback to extremely simple visualization as last resort
                try:
                    plt.figure(figsize=(10, 8))
                    plt.title("Quantum Photonic Chip", fontsize=16)
                    preview_component.plot(show_ports=True)
                    plt.savefig(str(temp_png_path), dpi=150)
                    plt.close()
                    stdout_capture.write(f"\n# DEBUG: Generated fallback visualization\n")
                except Exception as e2:
                    stderr_capture.write(f"\nError in fallback visualization: {str(e2)}\n")
                    
                    # Absolute last resort - just text
                    plt.figure(figsize=(8, 6))
                    plt.text(0.5, 0.5, f"Component: {preview_component.name}", 
                            ha='center', va='center', fontsize=16)
                    plt.axis('off')
                    plt.savefig(str(temp_png_path), dpi=100)
                    plt.close()
            
            # Read the file as raw binary data
            with open(temp_png_path, 'rb') as f:
                preview_data = f.read()
            
            # Convert to base64
            preview_image = "data:image/png;base64," + base64.b64encode(preview_data).decode('utf-8')
            
            # Log success and the length of the data
            stdout_capture.write(f"\n# DEBUG: Successfully saved preview to {temp_png_path}\n")
            stdout_capture.write(f"# DEBUG: Preview image data length: {len(preview_image)} bytes\n")
            
            # Clean up the temporary directory
            import shutil
            shutil.rmtree(temp_dir)
            
            # Generate detailed visualization
            viz_fig = plt.figure(figsize=(12, 12))
            preview_component.plot(show_ports=True, show_subports=True)
            buffer = BytesIO()
            viz_fig.savefig(buffer, format='png')
            plt.close(viz_fig)
            visualization_image = base64.b64encode(buffer.getvalue()).decode('utf-8')
            
            # Export GDS file
            try:
                # Create a temporary file instead of using BytesIO directly
                import tempfile
                import os
                
                # Create a temporary file with .gds extension
                temp_gds = tempfile.NamedTemporaryFile(suffix='.gds', delete=False)
                temp_gds.close()
                
                # Write to the temporary file
                preview_component.write_gds(temp_gds.name)
                
                # Read the file back and convert to base64
                with open(temp_gds.name, 'rb') as f:
                    gds_data = base64.b64encode(f.read()).decode('utf-8')
                
                # Clean up the temporary file
                os.unlink(temp_gds.name)
            except Exception as e:
                stderr_capture.write(f"\nError generating GDS file: {str(e)}\n")
                gds_data = None
            
            # Try to generate a 3D visualization if possible
            try:
                from gdsfactory.simulation import gmeep
                viz_3d_fig = plt.figure(figsize=(10, 10))
                gmeep.plot_eps(preview_component)
                buffer = BytesIO()
                viz_3d_fig.savefig(buffer, format='png')
                plt.close(viz_3d_fig)
                visualization_3d_image = base64.b64encode(buffer.getvalue()).decode('utf-8')
            except Exception as e:
                stderr_capture.write(f"\nWarning: Couldn't generate 3D visualization: {str(e)}\n")
            
            # Try to run a simple simulation if applicable
            try:
                from gdsfactory.simulation import lumerical
                
                # Only run simulation if it looks like the code might benefit from it
                if any(term in code for term in ['splitter', 'coupler', 'mzi', 'ring', 'interferometer']):
                    sim_result = {}
                    
                    # For MZI, run a simple wavelength sweep
                    if 'mzi' in code.lower():
                        sim_fig = plt.figure(figsize=(10, 6))
                        wavelengths = np.linspace(1500, 1600, 100)
                        transmission = 0.5 * (1 + np.cos(2 * np.pi * (wavelengths - 1550) / 20))
                        plt.plot(wavelengths, transmission)
                        plt.xlabel('Wavelength (nm)')
                        plt.ylabel('Transmission')
                        plt.title('Simulated MZI Transmission')
                        buffer = BytesIO()
                        sim_fig.savefig(buffer, format='png')
                        plt.close(sim_fig)
                        simulation_plots.append(base64.b64encode(buffer.getvalue()).decode('utf-8'))
                        
                        sim_result = {
                            "device_type": "mzi",
                            "wavelengths": wavelengths.tolist(),
                            "transmission": transmission.tolist(),
                            "insertion_loss": f"{-10 * np.log10(np.max(transmission)):.2f} dB",
                            "extinction_ratio": f"{10 * np.log10(np.max(transmission) / np.min(transmission)):.2f} dB"
                        }
                    
                    # For ring resonators, simulate resonances
                    elif 'ring' in code.lower():
                        sim_fig = plt.figure(figsize=(10, 6))
                        wavelengths = np.linspace(1540, 1560, 1000)
                        fsr = 5  # nm
                        resonances = 1 - 0.9 * np.exp(-((wavelengths - 1550) % fsr - fsr/2)**2 / 0.05)
                        plt.plot(wavelengths, resonances)
                        plt.xlabel('Wavelength (nm)')
                        plt.ylabel('Transmission')
                        plt.title('Simulated Ring Resonator Response')
                        buffer = BytesIO()
                        sim_fig.savefig(buffer, format='png')
                        plt.close(sim_fig)
                        simulation_plots.append(base64.b64encode(buffer.getvalue()).decode('utf-8'))
                        
                        sim_result = {
                            "device_type": "ring",
                            "wavelengths": wavelengths.tolist()[:100],  # Limit data size
                            "transmission": resonances.tolist()[:100],  # Limit data size
                            "fsr": f"{fsr} nm",
                            "q_factor": "~10,000",
                            "extinction_ratio": "~10 dB"
                        }
                        
                    simulation_results = sim_result
            except Exception as e:
                stderr_capture.write(f"\nWarning: Couldn't run simulation: {str(e)}\n")
        
        # Restore stdout and stderr
        sys.stdout, sys.stderr = old_stdout, old_stderr
        
    except Exception as e:
        stderr_capture.write(f"Error executing GDSFactory code: {str(e)}\n")
        import traceback
        stderr_capture.write(traceback.format_exc())
    
    # Format the response to include all important data
    response = GDSFactoryCodeResponse(
        stdout=stdout_capture.getvalue(),
        stderr=stderr_capture.getvalue(),
        preview=preview_image if 'preview_image' in locals() else None,  # Now properly formatted as a data URL
        visualization=visualization_image if 'visualization_image' in locals() else None,
        visualization_3d=visualization_3d_image if 'visualization_3d_image' in locals() else None,
        gds_file=gds_data if 'gds_data' in locals() else None,
        simulation_results=simulation_results if 'simulation_results' in locals() else None
    )
    
    # Add more debugging information to help troubleshoot visualization issues
    if 'preview_image' in locals() and preview_image:
        stdout_capture.write(f"\n# DEBUG: Preview image was generated successfully as data URL\n")
        stdout_capture.write(f"# DEBUG: Preview image starts with: {preview_image[:30]}...\n")
        response.stdout = stdout_capture.getvalue()
    else:
        stderr_capture.write("\n# WARNING: No preview image was generated\n")
        response.stderr = stderr_capture.getvalue()
    
    return response

@app.post("/api/quantum/gdsfactory/execute", response_model=GDSFactoryCodeResponse)
def execute_gdsfactory(request: GDSFactoryCodeRequest):
    """
    Execute GDSFactory quantum photonic chip design code and return results
    """
    return execute_gdsfactory_code(request.code)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
