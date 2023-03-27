import * as Fluent from "@fluentui/react-northstar";

import React from "react";

/**
 * This component is used to display the required
 * privacy statement which can be found in a link in the
 * about tab.
 */
class Privacy extends React.Component {
  render() {
    return (
      <Fluent.Segment>
        <Fluent.Header as="h3" content="Privacy Statement" />
      </Fluent.Segment>
    );
  }
}

export default Privacy;
