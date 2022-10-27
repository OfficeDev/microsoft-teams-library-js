import { app, authentication, market } from '@microsoft/teams-js';
import React, { useEffect } from 'react';

// import { ApiWithTextInput } from '../utils';

const MockCart = (): React.ReactElement => {
  const [cart, setCart] = React.useState<market.LocalCart | null>(null);
  const [token, setToken] = React.useState<string>('');
  useEffect(() => {
    app.initialize();
    const callback = (result: string): void => {
      const jwt = parseJwt(result);
      setToken(jwt.name);
      market.getCart('100').then((result: market.LocalCart) => {
        setCart(result);
      });
    };
    const authRequest: authentication.AuthTokenRequest = {
      successCallback: callback,
      failureCallback: callback,
    };
    authentication.getAuthToken(authRequest);
  }, []);

  return (
    <>
      <h3>Token: {token}</h3>
      <h1>Cart ID: {cart?.id}</h1>
      <table>
        <tr>
          <th>image</th>
          <th>name</th>
          <th>quantity</th>
          <th>price</th>
        </tr>
        {Object.values(cart ? cart.cartItems : {}).map((item: market.LocalCartItemModel, key) => (
          <tr key={key}>
            <th>
              <img src={item?.imageURL} alt={item?.name} style={{ height: '60px', width: '120px' }} />
            </th>
            <th>{item.name}</th>
            <th>{item.quantity}</th>
            <th>{item.price}</th>
          </tr>
        ))}
      </table>
    </>
  );
};

function parseJwt(token): { [name: string]: string } {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    window
      .atob(base64)
      .split('')
      .map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join(''),
  );

  return JSON.parse(jsonPayload);
}

// const GetCart = (): React.ReactElement =>
//   ApiWithTextInput<string>({
//     name: 'getCart',
//     title: 'Get local cart Info',
//     onClick: {
//       validateInput: input => {
//         if (!input) {
//           throw new Error('cart ID is required');
//         }
//       },
//       submit: async input => {
//         const result = await market.getCart(input);
//         return JSON.stringify(result);
//       },
//     },
//   });

const MarketAPIs = (): React.ReactElement => (
  <>
    <h1>market</h1>
    <MockCart />
  </>
);

export default MarketAPIs;
