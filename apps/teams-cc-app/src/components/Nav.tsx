import { } from "react-router-dom";

import * as Fluent from "@fluentui/react-northstar";

export const Nav = () => {
  //const navigate = useNavigate();

  const handleClick = (link: string) => {
    // navigate(`/${link}`);
  };

  return (
    <Fluent.Flex gap="gap.small">
      <Fluent.Flex.Item>
        <Fluent.Menu
          items={[
            {
              key: 0,
              content: "Capabilities",
              onClick: () => handleClick("tab"),
            },
            {
              key: 1,
              content: "Pages",
              onClick: () => handleClick("pagesTab"),
            },
          ]}
        />
      </Fluent.Flex.Item>
    </Fluent.Flex>
  );
};
