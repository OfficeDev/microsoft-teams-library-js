import {
  Flex,
  Form,
  FormButton,
  FormInput,
  Segment,
} from "@fluentui/react-northstar";

import { dialog } from "@microsoft/teams-js";

const DialogPage = () => {
  return (
    <Flex column={true} gap={"gap.small"} padding={"padding.medium"}>
      <Segment>
        <Form
          onSubmit={(event, data) => {
            const formData = new FormData(
              event.currentTarget as HTMLFormElement
            );
            const json: any = {};

            // Use const appIDs=['YOUR_APP_IDS_HERE']; instead of the following one
            // if you want to restrict which applications your dialog can submit to
            const appIDs = undefined;

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
};

export default DialogPage;
