import {
    Button,
    Flex,
} from "@fluentui/react-northstar";

import { dialog } from "@microsoft/teams-js";

const DialogResizePage = () => {
    return (
        <Flex column={true} gap={"gap.small"} padding={"padding.medium"}>
            <Button
                onClick={() => {
                    dialog.update.resize({ height: 600, width: 1000 })
                }}
            >
                Resize Dialog
            </Button>

        </Flex>
    );
};

export default DialogResizePage;
