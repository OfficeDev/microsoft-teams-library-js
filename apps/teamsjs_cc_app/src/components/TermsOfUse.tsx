import * as Fluent from "@fluentui/react-northstar";

import { Header, Text } from "@fluentui/react-northstar";

import React from "react";

/**
 * This component is used to display the required
 * terms of use statement which can be found in a
 * link in the about tab.
 */
class TermsOfUse extends React.Component {
  render() {
    return (
      <Fluent.Segment>
        <Header as="h3" content="Terms of use" />
        <Text
          size={"small"}
          content={`
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc pharetra augue dolor, eu mollis ex porta vitae. Nam hendrerit arcu eget quam dapibus tincidunt. Donec molestie elementum nulla, eget tincidunt eros ultricies sed. Nulla aliquam vel mi eu cursus. Aenean facilisis, eros sit amet vulputate congue, libero tellus auctor tellus, sed aliquet mauris mauris eu leo. Donec bibendum est et lorem porta ornare. Duis et nunc dolor. Sed luctus, turpis eu blandit lobortis, quam massa mattis neque, ut pharetra justo orci sit amet tortor. Vestibulum eu euismod felis. Sed pellentesque mattis nibh, eget accumsan elit congue a. Proin laoreet arcu et volutpat efficitur. Sed sagittis sodales ipsum id accumsan.

          Cras dui orci, vehicula vel odio sed, congue sollicitudin nunc. Vivamus a convallis magna. Nulla metus ante, accumsan sed dui sit amet, malesuada consequat tellus. In vitae fringilla dolor. Vivamus a porttitor massa. Morbi eu tortor lacus. Ut eu sodales arcu. Proin nulla dolor, congue ut laoreet nec, sagittis ac dui. Ut sed imperdiet mauris. Aliquam elementum et lacus sed vulputate. Curabitur id lacus in dui scelerisque aliquet vitae sed odio. Sed non semper quam. Morbi in velit a leo auctor convallis vel tincidunt diam. Etiam a sapien pharetra ligula venenatis lacinia iaculis eu lacus.

          Nulla enim libero, auctor nec fringilla a, semper sed ante. Aliquam erat volutpat. Morbi elementum ante consectetur mauris fermentum, at imperdiet justo interdum. Aliquam erat volutpat. Sed vitae posuere mauris. Quisque nibh urna, blandit bibendum rutrum ut, auctor gravida enim. Praesent ac dui massa.

          Mauris ullamcorper condimentum nunc, non laoreet augue egestas lobortis. Cras porttitor dolor sed ex finibus, nec maximus diam rhoncus. Sed non diam sagittis, lacinia mi at, volutpat velit. Phasellus vel pharetra leo. Vivamus accumsan dictum ex, ac gravida nulla hendrerit sed. Donec ultricies maximus tellus a aliquam. Nunc imperdiet metus id tellus pharetra volutpat. Maecenas et risus placerat, placerat ex ut, fermentum eros. Morbi sed sodales nisi, eget facilisis ipsum. Duis vehicula fringilla sem, quis porta nisi pellentesque non. Quisque lacinia ultricies nisl, non fermentum quam lacinia et. Cras hendrerit quam lectus, ultrices lacinia nulla accumsan quis. Fusce ullamcorper ipsum quis arcu suscipit, nec porta est faucibus. Quisque mattis venenatis tincidunt. Donec imperdiet, diam in mollis sagittis, tortor massa consectetur lacus, in imperdiet arcu leo nec ex. Nulla posuere dignissim cursus.

          Pellentesque vel lacinia dolor. Aliquam erat volutpat. Ut ultricies rhoncus magna sollicitudin ornare. Integer maximus dui nec lectus mollis porttitor a id libero. In pharetra tellus vel sapien efficitur, a pulvinar purus imperdiet. Praesent ut imperdiet turpis. Donec at vulputate sapien, non luctus orci. Vivamus tincidunt elit neque`}
        />
      </Fluent.Segment>
    );
  }
}

export default TermsOfUse;
