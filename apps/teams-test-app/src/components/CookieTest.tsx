import React from "react";
import { ApiWithTextInput } from "./utils";
import { ModuleWrapper } from "./utils/ModuleWrapper";

const saveCookie = (): React.ReactElement =>
  ApiWithTextInput<string>({
    name: 'saveCookie',
    title: 'Save Cookie',
    onClick: {
      validateInput: (input) => {
        if (!input) {
          throw "Cookie can't be empty";
        }
      },
      submit: async (cookie) => {
        document.cookie = cookie;
        return JSON.stringify(true);
      },
    },
    defaultInput: '"cookie=test"',
  });

  const getCookie = (): React.ReactElement =>
  ApiWithTextInput<string>({
    name: 'getCookie',
    title: 'Get Cookie',
    onClick: {
      validateInput: (input) => {
        if (!input) {
          throw "Cookie name can't be empty";
        }
      },
      submit: async (cookieName) => {
        return document.cookie.split(';').find((cookie) => cookie.includes(cookieName)) || 'Cookie not found';
      },
    },
    defaultInput: '"cookie"',
  });

  const CookieTest: React.FC = () => (
    <ModuleWrapper title="Cookie">
      {saveCookie()}
      {getCookie()}
    </ModuleWrapper>
  );

  export default CookieTest;