import { SimpleDB } from "@nshiab/simple-data-analysis";
import crunchData from "./helpers/crunchData.ts";

const sdb = new SimpleDB({ logDuration: true });

await crunchData(sdb);

await sdb.done();