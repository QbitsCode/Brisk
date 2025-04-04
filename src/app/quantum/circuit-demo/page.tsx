// ... (rest of the code remains the same)

{/* Components */}
{components.map(component => (
  <div
    key={component.id}
    className={`absolute rounded-md cursor-move flex items-center justify-center 
      ${selectedComponent === component.id ? 'ring-2 ring-blue-500' : ''}`}
    style={{
      left: component.x,
      top: component.y,
      width: component.width,
      height: component.height,
      backgroundColor: selectedComponent === component.id ? '#1a365d' : '#0f172a'
    }}
    onClick={(e) => {
      e.stopPropagation();
      setSelectedComponent(component.id);
    }}
    onMouseDown={(e) => {
      // The issue with BS not moving is here, we need to handle all of component's area
      // Prevent the event from bubbling up to parent elements
      e.stopPropagation();
      
      // Only handle left mouse button
      if (e.button !== 0) return;
      
      // Prevent text selection during drag
      e.preventDefault();
      
      const startX = e.clientX;
      const startY = e.clientY;
      const startComponentX = component.x;
      const startComponentY = component.y;
      
      // Flag to track if we're dragging vs. just clicking
      let isDragging = false;
      
      const handleMouseMove = (moveEvent: MouseEvent) => {
        isDragging = true;
        const dx = moveEvent.clientX - startX;
        const dy = moveEvent.clientY - startY;
        
        setComponents(components.map(c => 
          c.id === component.id
            ? { ...c, x: Math.max(0, startComponentX + dx), y: Math.max(0, startComponentY + dy) }
            : c
        ));
      };
      
      const handleMouseUp = () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
      
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }}
  >
    {/* Component Icon */}
    {component.type === 'source' && (
      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-black font-bold">S</div>
    )}
    {component.type === 'beamsplitter' && (
      <div className="w-10 h-10 bg-blue-500 rotate-45 flex items-center justify-center text-black font-bold">BS</div>
    )}
    {component.type === 'phaseshift' && (
      <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center text-black font-bold">PS</div>
    )}
    {component.type === 'detector' && (
      <div className="w-10 h-10 bg-red-500 rounded-sm flex items-center justify-center text-black font-bold">D</div>
    )}
    
    {/* Component Label */}
    <div className="absolute -bottom-6 left-0 right-0 text-center text-xs text-gray-300">
      {component.type === 'source' && `Source ${component.params?.polarization || 'H'}`}
      {component.type === 'beamsplitter' && `BS (r=${component.params?.reflectivity || 0.5})`}
      {component.type === 'phaseshift' && `PS (φ=${component.params?.phase || 0})`}
      {component.type === 'detector' && `Detector ${component.params?.efficiency || 0.9}`}
    </div>
    
    {/* Input/Output Connection Points */}
    {component.type !== 'source' && (
      <div 
        className="absolute left-0 top-1/2 w-4 h-4 bg-blue-500 rounded-full transform -translate-x-1/2 -translate-y-1/2 z-10 cursor-pointer hover:ring-2 hover:ring-white flex items-center justify-center"
        onMouseUp={(e) => {
          e.stopPropagation();
          completeConnection(component.id, 0, e);
        }}
        title="Input"
      >
        <span className="text-xs text-white">in</span>
      </div>
    )}
    
    {component.type !== 'detector' && (
      <div 
        className="absolute right-0 top-1/2 w-4 h-4 bg-green-500 rounded-full transform translate-x-1/2 -translate-y-1/2 z-10 cursor-pointer hover:ring-2 hover:ring-white flex items-center justify-center"
        onMouseDown={(e) => {
          e.stopPropagation();
          startConnection(component.id, 0, e);
        }}
        title="Output"
      >
        <span className="text-xs text-white">out</span>
      </div>
    )}
  </div>
))}

<div className="ml-auto flex gap-2 items-center">
  {isSimulating ? (
    <>
      <div className="flex items-center mr-4">
        <span className="text-xs text-gray-400 mr-2">Speed:</span>
        <select 
          className="bg-slate-800 text-white text-sm rounded-md border border-slate-700 px-2 py-1"
          value={simulationSpeed}
          onChange={(e) => setSimulationSpeed(parseInt(e.target.value))}
        >
          <option value="2000">0.5x</option>
          <option value="1000">1x</option>
          <option value="500">2x</option>
          <option value="250">4x</option>
          <option value="100">10x</option>
        </select>
      </div>
      <Button 
        onClick={stopSimulation} 
        variant="destructive"
      >
        Stop Simulation
      </Button>
    </>
  ) : (
    <Button 
      onClick={startSimulation} 
      variant="default"
      disabled={components.length === 0}
    >
      Start Simulation
    </Button>
  )}
</div>

// ... (rest of the code remains the same)
