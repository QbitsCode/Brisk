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
from io import BytesIO
import matplotlib.pyplot as plt

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
