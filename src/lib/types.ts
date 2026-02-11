export type Distrito = string;

export interface Calle {
  [x: string]: string;
  distrito: string;
  nombre: string;
  genero: string;
  categoria: string;
}

export type Calles = Calle[];

export interface GeoFeature {
  type: "Feature";
  properties?: {
    name?: string;
    [key: string]: unknown;
  };
  geometry?: unknown;
}

export interface GeoJSON {
  type: "FeatureCollection";
  features: GeoFeature[];
}

export type CalleGenero = {
  nombre: string;
  municipio: string;
  genero: "M" | "F";
};
