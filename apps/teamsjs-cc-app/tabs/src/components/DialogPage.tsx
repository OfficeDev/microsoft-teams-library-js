import { Flex, Form, FormButton, FormInput, Segment } from "@fluentui/react-northstar";

import { dialog } from "@microsoft/teams-js";

const findAppId = () => {
    const hostname = window.location.hostname;
    if (hostname === 'teams.microsoft.com') {
        const arr = window.location.href.split('/');
        return arr.filter(item => {
            return item.match('^[{]?[0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}[}]?$');
        });
    }
    return [];

}

const DialogPage = () => {
    return (
        <Flex column={true} gap={"gap.small"} padding={"padding.medium"}>
            <Segment>
                <Form
                    onSubmit={(event, data) => {
                        const formData = new FormData(event.currentTarget as any);
                        const json: any = {};
                        const appIDs = ['3de50955-833e-435d-8124-e636523b4c4e', 'b6f092c0-e405-4dbf-93d0-032352fd9b2a', '6ed302af-364e-4e90-806d-96503539f98f', '06805961-cc87-4861-abb7-f9ec47b545a4', '260f72f0-1c3d-4829-ab39-09d7afff5e24', ...findAppId()] //this is the state.local.json AppID - probably won't work if you use this for anything else
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
