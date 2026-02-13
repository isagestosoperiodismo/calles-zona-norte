import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ fetch }) => {
  const [resResumen, resTigreCalles] = await Promise.all([
    fetch("municipios/resumen.json"),
    fetch("municipios/tigre.calles.json"),
  ]);

  if (!resResumen.ok) {
    throw new Error("No se pudo cargar municipios/resumen.json");
  }

  if (!resTigreCalles.ok) {
    throw new Error("No se pudo cargar municipios/tigre.calles.json");
  }

  const resumen = await resResumen.json();
  const tigreCalles = await resTigreCalles.json();

  return {
    resumen,
    tigreCalles,
  };
};
