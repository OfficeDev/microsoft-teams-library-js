import { utils, write, writeFile } from "xlsx";

import { ICapabilityStatus } from "../components/Tab";

/**
 * Creates a .csv file
 * @param defaultRowList, type of ICapabilityStatus[]
 * @param client, type of string 
 */
export function createCsv(defaultRowList: ICapabilityStatus[], client: string) {
    try {
        //creates a worksheet using json data
        const worksheet = utils.json_to_sheet(defaultRowList);
        //creates a new workbook
        const workBook = utils.book_new();
        //Apend worksheet to workbook
        utils.book_append_sheet(workBook, worksheet, client);
        // writes woorkbook 
        write(workBook, { bookType: 'xlsx', type: 'buffer' });
        write(workBook, { bookType: 'xlsx', type: 'binary' });

        writeFile(workBook, `Capabilities_${client}.csv`);
    } catch (error) {
        console.error("Something went wrong:", error);
    }
}