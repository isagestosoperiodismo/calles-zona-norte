import type { Calle } from "$lib/types.ts";
import type { PageLoad } from "./$types";
import type { FeatureCollection } from "geojson";

export const load: PageLoad = async ({ fetch }) => {
  const [resCalles, resGeo] = await Promise.all([
    fetch("/csvjson.json"),
    fetch("/tigre.geojson"), // Asumiendo que este GeoJSON tiene todos los municipios o el área amplia
  ]);

  if (!resCalles.ok || !resGeo.ok) throw new Error("Error cargando archivos");

  const calles = (await resCalles.json()) as Calle[];
  const geojson = (await resGeo.json()) as FeatureCollection;

  // Solo enviamos los datos crudos y la lista de municipios para el Select
  return {
    calles,
    geojson,
    municipios: [
      ...new Set(calles.map((d) => d.municipio).filter(Boolean)),
    ].sort(),
  };
};

/* import type { Calle } from "$lib/types.ts";
import type { PageLoad } from "./$types";
import type { FeatureCollection } from "geojson";

// 1. Normalización: Mantenemos espacios para poder comparar palabras individuales
function normalizar(texto: string): string {
  if (!texto || typeof texto !== "string") return "";
  return (
    texto
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Quita acentos
      // Quitamos ruidos pero preservamos el espacio entre palabras
      .replace(
        /\b(avenida|av|intendente|municipal|comodoro|victoriano|martinez|alegria|paseo|general|grl|dr|dra|calle|pje|pasaje|tcnl|cnl|capitan|cmte|alte|nuestra|senora|de|del|la|las|los|y)\b/g,
        "",
      )
      .replace(/\s+/g, " ") // Colapsamos espacios múltiples a uno solo
      .trim()
  );
}

export const load: PageLoad = async ({ fetch }) => {
  const [resCalles, resGeo] = await Promise.all([
    fetch("/csvjson.json"),
    fetch("/tigre.geojson"),
  ]);

  if (!resCalles.ok || !resGeo.ok) throw new Error("Error cargando archivos");

  const calles = (await resCalles.json()) as Calle[];
  const geojson = (await resGeo.json()) as FeatureCollection;

  // 2. Filtramos base de datos y limpiamos
  const callesTigre = calles
    .filter((c) => c.municipio && c.municipio.toLowerCase().includes("tigre"))
    .map((c) => ({
      ...c,
      nombreNorm: normalizar(c.nombre),
    }))
    // IMPORTANTE: Ignoramos nombres vacíos o de una sola letra para evitar falsos positivos
    .filter((c) => c.nombreNorm.length > 2);

  console.log(`Calles en base de datos para Tigre: ${callesTigre.length}`);

  // 3. Cruzar datos con el GeoJSON
  geojson.features.forEach((f) => {
    if (!f.properties) f.properties = {};

    const nombreGeoRaw = f.properties.name || "";
    const nombreGeoNorm = normalizar(nombreGeoRaw);

    // Si el segmento no tiene nombre o es una autopista/ramal, lo saltamos
    if (
      !nombreGeoNorm ||
      nombreGeoRaw.toLowerCase().includes("ramal") ||
      nombreGeoRaw.toLowerCase().includes("ruta")
    ) {
      f.properties.genero = "otro";
      return;
    }

    // BUSQUEDA SEGURA: Evita que "Uruguay" matchee con "M" aleatoriamente
    const match = callesTigre.find((c) => {
      // Caso A: Son idénticos
      if (nombreGeoNorm === c.nombreNorm) return true;

      // Caso B: El nombre del JSON es una palabra completa dentro del nombre del mapa
      // Esto evita que "U" matchee con "Uruguay"
      // \b marca el inicio/fin de una palabra
      try {
        const regex = new RegExp(`\\b${c.nombreNorm}\\b`, "i");
        return regex.test(nombreGeoNorm);
      } catch (e) {
        // Por si el nombre tiene caracteres especiales que rompen la RegExp
        return nombreGeoNorm.includes(c.nombreNorm);
      }
    });

    f.properties.genero = match ? match.genero : "otro";
  });

  const totalConGenero = geojson.features.filter(
    (f) => f.properties?.genero !== "otro",
  ).length;

  console.log(
    `Resultado: ${totalConGenero} segmentos coloreados de un total de ${geojson.features.length}`,
  );

  // Creamos un set para no repetir nombres de calles en el log
  const reporteCalles = geojson.features
    .filter((f) => f.properties?.genero !== "otro")
    .reduce(
      (acc, f) => {
        const nombre = f.properties?.name;
        const genero = f.properties?.genero;
        if (nombre && !acc[nombre]) {
          acc[nombre] = genero;
        }
        return acc;
      },
      {} as Record<string, string>,
    );

  // Logueamos en formato tabla para que sea fácil de leer
  console.log("--- REPORTE DE CALLES IDENTIFICADAS ---");
  console.table(reporteCalles);

  // También puedes loguear el conteo final
  const resumen = {
    Femeninas: Object.values(reporteCalles).filter((g) => g === "F").length,
    Masculinas: Object.values(reporteCalles).filter((g) => g === "M").length,
    Total_Unicas: Object.keys(reporteCalles).length,
  };
  console.log("Resumen de nombres únicos hallados:", resumen);
  return {
    geojson,
    municipios: [...new Set(calles.map((d) => d.municipio).filter(Boolean))],
  };
};
 */
