import { Hex } from './hex.ts';
import { Vertex } from './vertex.ts';
import { hexes } from '../data/hexes.ts';
import { Edge } from './edge.ts';
import type { EdgeData, GameBoard, HexData, VertexData } from '../types.ts';
import _ from 'lodash';

export class Board {
  hexes: Map<string, Hex>;
  vertices: Map<string, Vertex>;
  edges: Map<string, Edge>;
  settlements: Map<string, string>;
  roads: Map<string, string>;
  robberPosition: string;

  constructor() {
    this.hexes = new Map();
    this.vertices = new Map();
    this.edges = new Map();
    this.settlements = new Map();
    this.roads = new Map();
    this.robberPosition = 'h0_2';
  }

  private createVertex(q: number, r: number, cornerIndex: number): Vertex {
    const vertexKey = Vertex.getVertexKey(q, r, cornerIndex);
    if (!this.vertices.has(vertexKey)) {
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

    vertices.map((vertex, i) => {
      const nextVertex = vertices[(i + 1) % 6];

      this.createEdge(vertex, nextVertex);
    });

    this.hexes.set(id, hex);
    return hex;
  }

  createBoard(): void {
    hexes.forEach((hex) => this.createHex(hex));
  }

  getVertices(): VertexData[] {
    const vertices: VertexData[] = [];
    this.vertices.forEach((vertex) => vertices.push(vertex.toJSON()));

    return vertices;
  }

  getEdges(): EdgeData[] {
    const edges: EdgeData[] = [];
    this.edges.forEach((edge) => edges.push(edge.toJSON()));

    return edges;
  }

  getHexes(): object[] {
    const hexes: object[] = [];
    this.hexes.forEach((hex) => hexes.push(hex.toJSON()));

    return hexes;
  }

  getBoard(): GameBoard {
    const hexesData = this.getHexes();
    const vertices = this.getVertices();
    const edges = this.getEdges();
    const robber = this.robberPosition;

    return { hexes: hexesData, vertices, edges, robber };
  }

  updateRobber(hexId: string): string {
    const currentHex = this.hexes.get(hexId) || { hasRobber: 'No' };
    const hexesObj = Object.fromEntries(this.hexes);
    const previoushex = _.find(hexesObj, { hasRobber: true });

    if (!currentHex.hasRobber) {
      this.robberPosition = hexId;
      previoushex.hasRobber = false;
      currentHex.hasRobber = true;
    }

    return hexId;
  }
}
