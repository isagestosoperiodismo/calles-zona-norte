import type { SimpleDB } from "@nshiab/simple-data-analysis";

export default async function crunchData(sdb: SimpleDB) {

  // The mean temperature per decade.
  const temp = sdb.newTable("temp");
  await temp.loadData("sda/data/temp.csv");
  await temp.logTable();

  // We compute a linear regression for each city.
  const tempRegressions = await temp.linearRegressions({
    x: "decade",
    y: "meanTemp",
    categories: "city",
    decimals: 4,
    outputTable: "tempRegressions",
  });
  await tempRegressions.logTable();

  // We write the results to src/data
  await tempRegressions.writeData("src/data/temp-regressions.json");
  // Or to static
  await temp.writeData("static/temp.json");
}