import { ClientType, ICapabilityStatus } from "./utils";
import { utils, write, writeFile } from "xlsx";

/**
 * This function is used to compile list, which is a type of ICapabilityStatus[] and creates an excel worksheet
 * and writes a workbook
 * @param defaultRowList type of ICapabilityStatus[]
 * @param client type of ClientType
 */
export function createCsv(
  defaultRowList: ICapabilityStatus[],
  client: ClientType
) {
  try {
    //creates a worksheet using json data
    const worksheet = utils.json_to_sheet(defaultRowList);
    //creates a new workbook
    const workBook = utils.book_new();
    //Apend worksheet to workbook
    utils.book_append_sheet(workBook, worksheet, client);
    // writes woorkbook
    write(workBook, { bookType: "xlsx", type: "buffer" });
    write(workBook, { bookType: "xlsx", type: "binary" });

    writeFile(workBook, `Capabilities_${client}.csv`);
  } catch (error) {
    console.error("Something went wrong:", error);
  }
}
