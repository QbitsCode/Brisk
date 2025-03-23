import gdsfactory as gf
import matplotlib.pyplot as plt
import io
import base64
import json

# Create a simple mzi component
def create_photonic_chip():
    # Create a new component for our quantum photonic chip
    qchip = gf.Component("quantum_photonic_processor")

    # Add a Mach-Zehnder Interferometer
    mzi = gf.components.mzi(delta_length=10)
    mzi_ref = qchip << mzi
    mzi_ref.movex(0).movey(0)

    # Add directional coupler
    coupler = gf.components.coupler(gap=0.2, length=20)
    coupler_ref = qchip << coupler
    coupler_ref.movex(100).movey(0)

    # Add a ring resonator
    ring = gf.components.ring_single(radius=10, gap=0.2)
    ring_ref = qchip << ring
    ring_ref.movex(0).movey(100)

    # Print information
    print(f"Created quantum photonic chip:")
    print(f"- Size: {qchip.size[0]:.1f} x {qchip.size[1]:.1f} µm")
    print(f"- Number of ports: {sum(len(ref.ports) for ref in qchip.references)}")
    print(f"- Number of components: {len(qchip.references)}")

    return qchip

# Create the photonic chip
chip = create_photonic_chip()

# Generate visualization
fig, ax = plt.subplots(figsize=(8, 6))
chip.plot(ax=ax)
plt.title("Quantum Photonic Chip")

# Save to bytes buffer
buf = io.BytesIO()
plt.savefig(buf, format='png', dpi=100)
buf.seek(0)

# Convert to base64 for embedding
img_base64 = base64.b64encode(buf.getvalue()).decode('utf-8')
plt.close(fig)

# Output visualization data in a format our frontend can parse
print("\n# JSON visualization data begins here:")
visualization_data = {
    "preview": img_base64,
    "visualization": img_base64
}
print(json.dumps(visualization_data))
print("# JSON visualization data ends here")

print("\nVisualization data has been generated. You should now be able to see the visualization in both the Quick Preview and Visualizer tabs.")
