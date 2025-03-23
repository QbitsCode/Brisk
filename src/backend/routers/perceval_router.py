from fastapi import APIRouter, HTTPException
import io
import sys
import json
import base64
import numpy as np
from pydantic import BaseModel
import contextlib
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

# Assuming perceval is installed on the server
try:
    import perceval as pcvl
except ImportError:
    pass  # We'll handle this at runtime

router = APIRouter(prefix="/api/quantum/perceval", tags=["perceval"])

class PercevalCodeRequest(BaseModel):
    code: str

class PercevalCodeResponse(BaseModel):
    stdout: str
    stderr: str
    plots: list[str] = []
    unitary: str = None

class PercevalVisualizationResponse(BaseModel):
    circuit_visualization: str = None
    state_visualization: str = None
    error: str = None

def execute_perceval_code(code: str) -> PercevalCodeResponse:
    """
    Execute the provided Perceval code and capture all outputs
    """
    # Redirect stdout and stderr
    old_stdout, old_stderr = sys.stdout, sys.stderr
    stdout_capture = io.StringIO()
    stderr_capture = io.StringIO()
    sys.stdout, sys.stderr = stdout_capture, stderr_capture
    
    # Capture any plots
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
            buf = io.BytesIO()
            plt.savefig(buf, format='png')
            buf.seek(0)
            plots.append(base64.b64encode(buf.read()).decode('utf-8'))
            plt.close()
        plt.show = capture_show
        
        # Execute the code
        exec(code, {}, local_vars)
        
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
        sys.stdout, sys.stderr = old_stdout, old_stderr
        plt.show = original_show
    
    return PercevalCodeResponse(
        stdout=stdout_capture.getvalue(),
        stderr=stderr_capture.getvalue(),
        plots=plots,
        unitary=json.dumps(unitary_matrix) if unitary_matrix else None
    )

def generate_visualizations(code: str) -> PercevalVisualizationResponse:
    """
    Generate circuit and state visualizations from Perceval code
    """
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
            elif isinstance(var_value, (pcvl.StateVector, pcvl.BasicState)):
                state = var_value
        
        # Generate circuit visualization
        if circuit:
            plt.figure(figsize=(10, 4))
            pcvl.pdisplay(circuit)
            buf = io.BytesIO()
            plt.savefig(buf, format='png')
            buf.seek(0)
            circuit_viz = base64.b64encode(buf.read()).decode('utf-8')
            plt.close()
        
        # Generate state visualization if both circuit and state exist
        if circuit and state:
            plt.figure(figsize=(8, 6))
            if hasattr(pcvl, 'StateVisualizer'):
                # If using newer Perceval version with StateVisualizer
                try:
                    viz = pcvl.StateVisualizer(state)
                    viz.draw()
                    buf = io.BytesIO()
                    plt.savefig(buf, format='png')
                    buf.seek(0)
                    state_viz = base64.b64encode(buf.read()).decode('utf-8')
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
                    
                    buf = io.BytesIO()
                    plt.savefig(buf, format='png')
                    buf.seek(0)
                    state_viz = base64.b64encode(buf.read()).decode('utf-8')
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

@router.post("/execute")
async def execute_code(request: PercevalCodeRequest) -> PercevalCodeResponse:
    """
    Execute Perceval quantum circuit code and return results
    """
    try:
        # Check if perceval is installed
        if 'pcvl' not in sys.modules:
            raise HTTPException(
                status_code=500, 
                detail="Perceval is not installed on the server. Please install it with 'pip install perceval'"
            )
        
        return execute_perceval_code(request.code)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/visualize")
async def visualize_circuit(request: PercevalCodeRequest) -> PercevalVisualizationResponse:
    """
    Generate visualizations from Perceval code
    """
    try:
        # Check if perceval is installed
        if 'pcvl' not in sys.modules:
            raise HTTPException(
                status_code=500, 
                detail="Perceval is not installed on the server. Please install it with 'pip install perceval'"
            )
        
        return generate_visualizations(request.code)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
