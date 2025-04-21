import { Hex } from './hex.ts';
import { Vertex } from './vertex.ts';
import { hexes } from '../data/hexes.ts';
import { Edge } from './edge.ts';
import { Resources } from './player.ts';

interface EdgeData {
  id: string;
  owner: string | null;
}

interface VertexData {
  id: string;
  owner: string | null;
  harbor: string | null;
  adjacentHexes: string[];
}

interface HexData {
  q: number;
  r: number;
  id: string;
  terrain: string;
  number: number | null;
  resource: keyof Resources | string;
  hasRobber: boolean;
}

export class Board {
  hexes: Map<string, Hex>;
  vertices: Map<string, Vertex>;
  edges: Map<string, Edge>;
  settlements: Map<string, string>;
  roads: Map<string, string>;

  constructor() {
    this.hexes = new Map();
    this.vertices = new Map();
    this.edges = new Map();
    this.settlements = new Map();
    this.roads = new Map();
  }

  private createVertex(q: number, r: number, cornerIndex: number): Vertex {
    const vertexKey = Vertex.getVertexKey(q, r, cornerIndex);
    if (!this.vertices.get(vertexKey)) {
      this.vertices.set(vertexKey, new Vertex(vertexKey, null));
    }

    const vertex = this.vertices.get(vertexKey)!;
    vertex.adjacentHexes.push(`h${q}_${r}`);
    return vertex;
  }

  private createVertices(hex: Hex): Vertex[] {
    return Array.from({ length: 6 }, (_, i) => {
      return this.createVertex(hex.q, hex.r, i);
    });
  }

  private createEdge(vertex1: Vertex, vertex2: Vertex): Edge {
    const edgeKey = Edge.getEdgeKey(vertex1.id, vertex2.id);
    const edge = new Edge(edgeKey, [vertex1.id, vertex2.id]);

    vertex1.connectedEdges.add(edge.id);
    vertex2.connectedEdges.add(edge.id);
    vertex1.connectedVertices.add(vertex2.id);
    vertex2.connectedVertices.add(vertex1.id);

    this.edges.set(edgeKey, edge);
    return edge;
  }

  private createHex(hexData: HexData): Hex {
    const { q, r, id, terrain, number, hasRobber, resource } = hexData;
    const hex = new Hex(id, q, r, terrain, number, hasRobber, resource);
    const vertices = this.createVertices(hex);
    vertices.map((vertex, i) => this.createEdge(vertex, vertices[(i + 1) % 6]));
    this.hexes.set(id, hex);
    return hex;
  }

  createBoard(): void {
    hexes.forEach((hex) => this.createHex(hex));
  }

  getVertices(): VertexData[] {
    const vertices: VertexData[] = [];

    this.vertices.forEach((vertex) => {
      vertices.push(vertex.toJSON());
    });

    return vertices;
  }

  getEdges(): EdgeData[] {
    const edges: EdgeData[] = [];

    this.edges.forEach((edge) => {
      edges.push(edge.toJSON());
    });

    return edges;
  }

  getHexes(): object[] {
    const hexes: object[] = [];
    this.hexes.forEach((hex) => hexes.push(hex.toJSON()));
    return hexes;
  }

  getBoard(): { hexes: object[]; vertices: VertexData[]; edges: EdgeData[] } {
    const hexesData = this.getHexes();
    const vertices = this.getVertices();
    const edges = this.getEdges();

    return { hexes: hexesData, vertices, edges };
  }
}
