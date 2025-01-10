import { Component, Connection } from '@/types/photonic';

// GDSII Record Types
const HEADER = 0x0002;
const BGNLIB = 0x0102;
const LIBNAME = 0x0206;
const UNITS = 0x0305;
const ENDLIB = 0x0400;
const BGNSTR = 0x0502;
const STRNAME = 0x0606;
const ENDSTR = 0x0700;
const BOUNDARY = 0x0800;
const PATH = 0x0900;
const SREF = 0x0A00;
const AREF = 0x0B00;
const TEXT = 0x0C00;
const LAYER = 0x0D02;
const DATATYPE = 0x0E02;
const WIDTH = 0x0F03;
const XY = 0x1003;
const ENDEL = 0x1100;
const STRING = 0x1906;

// Layer definitions for different component types
const LAYER_MAPPING = {
  waveguide: { layer: 1, datatype: 0 },
  beamSplitter: { layer: 2, datatype: 0 },
  phaseShifter: { layer: 3, datatype: 0 },
  detector: { layer: 4, datatype: 0 },
  source: { layer: 5, datatype: 0 },
  metal: { layer: 6, datatype: 0 },
  text: { layer: 63, datatype: 0 }
};

class GDSIIWriter {
  private buffer: number[];
  private position: number;

  constructor() {
    this.buffer = [];
    this.position = 0;
  }

  private writeUInt16(value: number): void {
    this.buffer.push((value >> 8) & 0xFF, value & 0xFF);
    this.position += 2;
  }

  private writeUInt32(value: number): void {
    this.buffer.push(
      (value >> 24) & 0xFF,
      (value >> 16) & 0xFF,
      (value >> 8) & 0xFF,
      value & 0xFF
    );
    this.position += 4;
  }

  private writeDouble(value: number): void {
    const buffer = new ArrayBuffer(8);
    new DataView(buffer).setFloat64(0, value, false);
    const arr = new Uint8Array(buffer);
    for (let i = 0; i < 8; i++) {
      this.buffer.push(arr[i]);
    }
    this.position += 8;
  }

  private writeRecord(recordType: number, dataType: number, data: number[]): void {
    const length = data.length + 4;
    this.writeUInt16(length);
    this.writeUInt16(recordType | (dataType << 13));
    data.forEach(value => this.buffer.push(value));
    this.position += data.length;
  }

  private writeString(str: string): number[] {
    const result = [];
    for (let i = 0; i < str.length; i++) {
      result.push(str.charCodeAt(i));
    }
    if (str.length % 2 === 1) {
      result.push(0); // Pad to even length
    }
    return result;
  }

  private writePoints(points: number[][]): void {
    const data: number[] = [];
    points.forEach(point => {
      // Convert to nanometers and store as 32-bit integers
      const x = Math.round(point[0] * 1000);
      const y = Math.round(point[1] * 1000);
      data.push((x >> 24) & 0xFF, (x >> 16) & 0xFF, (x >> 8) & 0xFF, x & 0xFF);
      data.push((y >> 24) & 0xFF, (y >> 16) & 0xFF, (y >> 8) & 0xFF, y & 0xFF);
    });
    this.writeRecord(XY, 0, data);
  }

  public writeHeader(): void {
    const now = Math.floor(Date.now() / 1000);
    const modTime = new Array(12).fill(now);
    
    // Write HEADER
    this.writeRecord(HEADER, 0, [6]);
    
    // Write BGNLIB with modification time
    this.writeRecord(BGNLIB, 0, modTime);
    
    // Write LIBNAME
    this.writeRecord(LIBNAME, 0, this.writeString('BRISK_LIB'));
    
    // Write UNITS
    const units = [0x3E, 0x41, 0x89, 0x37, 0x4B, 0xC6, 0xA7, 0xF0]; // 0.001 (user units/database units)
    this.writeRecord(UNITS, 0, units);
  }

  public startStructure(name: string): void {
    const now = Math.floor(Date.now() / 1000);
    const modTime = new Array(12).fill(now);
    
    this.writeRecord(BGNSTR, 0, modTime);
    this.writeRecord(STRNAME, 0, this.writeString(name));
  }

  public writePath(points: number[][], width: number, layer: number, datatype: number): void {
    this.writeRecord(PATH, 0, []);
    this.writeRecord(LAYER, 0, [layer]);
    this.writeRecord(DATATYPE, 0, [datatype]);
    this.writeRecord(WIDTH, 0, [Math.round(width * 1000)]); // Convert to nanometers
    this.writePoints(points);
    this.writeRecord(ENDEL, 0, []);
  }

  public writeText(text: string, position: number[], layer: number, datatype: number): void {
    this.writeRecord(TEXT, 0, []);
    this.writeRecord(LAYER, 0, [layer]);
    this.writeRecord(DATATYPE, 0, [datatype]);
    this.writePoints([position]);
    this.writeRecord(STRING, 0, this.writeString(text));
    this.writeRecord(ENDEL, 0, []);
  }

  public endStructure(): void {
    this.writeRecord(ENDSTR, 0, []);
  }

  public endLibrary(): void {
    this.writeRecord(ENDLIB, 0, []);
  }

  public getBuffer(): ArrayBuffer {
    return new Uint8Array(this.buffer).buffer;
  }
}

export class GDSIIExporter {
  private writer: GDSIIWriter;

  constructor() {
    this.writer = new GDSIIWriter();
  }

  private createWaveguide(component: Component): void {
    const { x, y, params, rotation } = component;
    const width = params.width as number;
    const length = params.length as number;

    const angle = rotation * Math.PI / 180;
    const points = [
      [x, y],
      [x + length * Math.cos(angle), y + length * Math.sin(angle)]
    ];

    this.writer.writePath(
      points,
      width,
      LAYER_MAPPING.waveguide.layer,
      LAYER_MAPPING.waveguide.datatype
    );
  }

  private createBeamSplitter(component: Component): void {
    const { x, y, params, rotation } = component;
    const width = params.width as number;
    const length = params.length as number;
    const splitAngle = 30; // degrees

    const midX = x + (length/2) * Math.cos(rotation * Math.PI / 180);
    const midY = y + (length/2) * Math.sin(rotation * Math.PI / 180);

    // Input path
    this.writer.writePath(
      [[x, y], [midX, midY]],
      width,
      LAYER_MAPPING.beamSplitter.layer,
      LAYER_MAPPING.beamSplitter.datatype
    );

    // Output paths
    const angle1 = (rotation + splitAngle) * Math.PI / 180;
    const angle2 = (rotation - splitAngle) * Math.PI / 180;

    this.writer.writePath(
      [
        [midX, midY],
        [midX + (length/2) * Math.cos(angle1), midY + (length/2) * Math.sin(angle1)]
      ],
      width,
      LAYER_MAPPING.beamSplitter.layer,
      LAYER_MAPPING.beamSplitter.datatype
    );

    this.writer.writePath(
      [
        [midX, midY],
        [midX + (length/2) * Math.cos(angle2), midY + (length/2) * Math.sin(angle2)]
      ],
      width,
      LAYER_MAPPING.beamSplitter.layer,
      LAYER_MAPPING.beamSplitter.datatype
    );
  }

  private createPhaseShifter(component: Component): void {
    const { x, y, params, rotation } = component;
    const width = params.width as number;
    const length = params.length as number;
    const angle = rotation * Math.PI / 180;

    const points = [
      [x, y],
      [x + length * Math.cos(angle), y + length * Math.sin(angle)]
    ];

    // Waveguide
    this.writer.writePath(
      points,
      width,
      LAYER_MAPPING.waveguide.layer,
      LAYER_MAPPING.waveguide.datatype
    );

    // Electrode
    this.writer.writePath(
      points,
      width * 1.5,
      LAYER_MAPPING.metal.layer,
      LAYER_MAPPING.metal.datatype
    );
  }

  private createDetector(component: Component): void {
    const { x, y, params } = component;
    const size = params.width as number;

    // Create square detector using a path
    const points = [
      [x - size/2, y - size/2],
      [x + size/2, y - size/2],
      [x + size/2, y + size/2],
      [x - size/2, y + size/2],
      [x - size/2, y - size/2]
    ];

    this.writer.writePath(
      points,
      size/10, // Thin outline
      LAYER_MAPPING.detector.layer,
      LAYER_MAPPING.detector.datatype
    );
  }

  private createSource(component: Component): void {
    const { x, y, params } = component;
    const width = params.width as number;

    // Create circular source using multiple path segments
    const points = [];
    const segments = 32;
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * 2 * Math.PI;
      points.push([
        x + width/2 * Math.cos(angle),
        y + width/2 * Math.sin(angle)
      ]);
    }

    this.writer.writePath(
      points,
      width/10,
      LAYER_MAPPING.source.layer,
      LAYER_MAPPING.source.datatype
    );
  }

  private createConnection(connection: Connection, components: Component[]): void {
    const sourceComp = components[connection.source.component];
    const targetComp = components[connection.target.component];

    const startX = sourceComp.x + sourceComp.ports[connection.source.port].x;
    const startY = sourceComp.y + sourceComp.ports[connection.source.port].y;
    const endX = targetComp.x + targetComp.ports[connection.target.port].x;
    const endY = targetComp.y + targetComp.ports[connection.target.port].y;

    this.writer.writePath(
      [[startX, startY], [endX, endY]],
      0.5, // 0.5μm width for connections
      LAYER_MAPPING.waveguide.layer,
      LAYER_MAPPING.waveguide.datatype
    );
  }

  public async exportGDSII(components: Component[], connections: Connection[]): Promise<ArrayBuffer> {
    this.writer = new GDSIIWriter();
    
    // Write GDSII header
    this.writer.writeHeader();
    
    // Start main structure
    this.writer.startStructure('MAIN');

    // Add components
    components.forEach(component => {
      switch(component.type) {
        case 'straight':
          this.createWaveguide(component);
          break;
        case 'beamSplitter':
          this.createBeamSplitter(component);
          break;
        case 'phaseShifter':
          this.createPhaseShifter(component);
          break;
        case 'detector':
          this.createDetector(component);
          break;
        case 'source':
          this.createSource(component);
          break;
      }
    });

    // Add connections
    connections.forEach(connection => {
      this.createConnection(connection, components);
    });

    // Add text labels
    components.forEach((component, index) => {
      this.writer.writeText(
        `${component.type}_${index}`,
        [component.x + 10, component.y + 10],
        LAYER_MAPPING.text.layer,
        LAYER_MAPPING.text.datatype
      );
    });

    // Close structure and library
    this.writer.endStructure();
    this.writer.endLibrary();

    return this.writer.getBuffer();
  }
}
