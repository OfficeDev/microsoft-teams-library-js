import { Flex, Form, FormButton, FormInput, Segment } from "@fluentui/react-northstar";

import { dialog } from "@microsoft/teams-js";

const DialogPage = () => {
    return (
        <Flex column={true} gap={"gap.small"} padding={"padding.medium"}>
            <Segment>
                <Form
                    onSubmit={(event, data) => {
                        const formData = new FormData(event.currentTarget as HTMLFormElement);
                        const json: any = {};
                        //This is where you would put an AppID that you can return to, probably won't work if you use this for anything else.
                        const appIDs = [''];

                        formData.forEach((value, key) => (json[key] = value));
                        dialog.url.submit(json, appIDs);
                    }}
                >
                    <FormInput
                        label="First name"
                        name="firstname"
                        id="first-name"
                        required
                        showSuccessIndicator={false}
                    />
                    <FormButton content="Submit" primary />
                </Form>
            </Segment>
        </Flex>
    );
}

export default DialogPage;
