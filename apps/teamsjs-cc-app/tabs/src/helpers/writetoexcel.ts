import { utils, write, writeFile } from "xlsx";

export function createCsv(jsonString: string, client: string) {
    try {
        const jsonData = JSON.parse(jsonString);
        const worksheet = utils.json_to_sheet(jsonData);
        const workBook = utils.book_new();

        utils.book_append_sheet(workBook, worksheet, client);

        write(workBook, { bookType: 'xlsx', type: 'buffer' });

        write(workBook, { bookType: 'xlsx', type: 'binary' });

        writeFile(workBook, "Capabilities.csv");
    } catch (error) {
        console.log("Error:", error);
    }
}