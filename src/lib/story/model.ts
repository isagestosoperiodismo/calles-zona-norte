export type StoryStep = {
  title: string;
  message: string;
};

export const storySteps: StoryStep[] = [
  {
    title: "En zona norte hay muchas calles",
    message: "En zona norte hay x cantidad de calles.",
  },
  {
    title: "¿Cuántas son de personas?",
    message: "Tantas son dedicadas a personas.",
  },
  {
    title: "La mayoría: hombres",
    message: "Tantas de ellas están dedicadas a hombres.",
  },
  {
    title: "Muy pocas: mujeres",
    message: "Mientras que solo tantas de ellas están dedicadas a mujeres.",
  },
  {
    title: "¿Quiénes fueron?",
    message: "Quienes fueron?",
  },
];

type StoryFeature = {
  type?: string;
  geometry?: unknown;
  features?: unknown;
  properties?: {
    name?: string;
    genero?: string;
    matched?: boolean;
    hasName?: boolean;
    [key: string]: unknown;
  };
  [key: string]: unknown;
};

export function pct(part: number, total: number): string {
  if (!total) return "0.0";
  return ((part / total) * 100).toFixed(1);
}

function normalizeText(value: string): string {
  return (value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\b(avenida|av|calle|pje|dr|dra|grl|pasaje|general)\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function annotateGeojson(
  geojson: any,
  calles: any[],
  municipio = "tigre",
): any | null {
  if (!geojson || !calles) return null;

  const slugMunicipio = municipio
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  const callesDB = calles
    .filter((c: any) => {
      const muni = (c.municipio || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
      return muni === slugMunicipio;
    })
    .map((c: any) => ({
      ...c,
      nombreNorm: normalizeText(c.nombre || ""),
    }))
    .filter((c: any) => c.nombreNorm.length > 1);

  const features = geojson.features.map((f: any) => {
    const name = f.properties?.name || "";
    const nombreGeo = normalizeText(name);
    const match = callesDB.find(
      (c: any) =>
        nombreGeo &&
        (nombreGeo.includes(c.nombreNorm) || c.nombreNorm.includes(nombreGeo)),
    );

    return {
      ...f,
      properties: {
        ...f.properties,
        genero: match ? match.genero : "otro",
        matched: Boolean(match),
        hasName: Boolean(name.trim()),
      },
    };
  });

  return {
    ...geojson,
    features,
  };
}

export function getStoryStats(features: StoryFeature[]) {
  const totalCalles = features.length;
  const callesConNombre = features.filter((f) => f.properties?.hasName).length;
  const callesPersona = features.filter((f) => f.properties?.matched).length;
  const callesMasculinas = features.filter((f) => f.properties?.genero === "M").length;
  const callesFemeninas = features.filter((f) => f.properties?.genero === "F").length;
  return {
    totalCalles,
    callesConNombre,
    callesPersona,
    callesMasculinas,
    callesFemeninas,
  };
}

export function getCounterForStep(
  stats: ReturnType<typeof getStoryStats>,
  activeStep: number,
) {
  if (activeStep === 0) {
    return {
      texto: `${stats.totalCalles.toLocaleString("es-AR")} calles y pasajes`,
      detalle: "trazado total del municipio",
    };
  }
  if (activeStep === 1) {
    return {
      texto: `${stats.callesPersona.toLocaleString("es-AR")} dedicadas a personas`,
      detalle: `${pct(stats.callesPersona, stats.totalCalles)}% del total`,
    };
  }
  if (activeStep === 2) {
    return {
      texto: `${stats.callesMasculinas.toLocaleString("es-AR")} dedicadas a hombres`,
      detalle: `${pct(stats.callesMasculinas, stats.callesPersona)}% de las calles de personas`,
    };
  }
  if (activeStep === 3) {
    return {
      texto: `${stats.callesFemeninas.toLocaleString("es-AR")} dedicadas a mujeres`,
      detalle: `${pct(stats.callesFemeninas, stats.callesPersona)}% de las calles de personas`,
    };
  }
  return {
    texto: `${stats.callesFemeninas.toLocaleString("es-AR")} dedicadas a mujeres`,
    detalle: `${pct(stats.callesFemeninas, stats.callesPersona)}% de las calles de personas`,
  };
}

export function getVisibleHighlight(features: StoryFeature[], activeStep: number) {
  if (activeStep === 0) {
    return features;
  }
  if (activeStep === 1) {
    return features.filter((f) => f.properties?.matched);
  }
  if (activeStep === 2) {
    return features.filter((f) => f.properties?.genero === "M");
  }
  if (activeStep === 3) {
    return features.filter((f) => f.properties?.genero === "F");
  }
  return features.filter((f) => f.properties?.genero === "F");
}

export function getWomenGallery(calles: any[], max = 24) {
  if (!calles?.length) return [];

  const byName = new Map<string, { nombre: string; calles: number }>();
  calles
    .filter((c: any) => c.genero === "F")
    .forEach((c: any) => {
      const nombre = (c.nombre || "").trim();
      if (!nombre) return;
      if (!byName.has(nombre)) byName.set(nombre, { nombre, calles: 0 });
      byName.get(nombre)!.calles += 1;
    });

  return [...byName.values()]
    .sort((a, b) => b.calles - a.calles)
    .slice(0, max);
}
