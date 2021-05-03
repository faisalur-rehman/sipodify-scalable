import React from 'react';

import SpotifyProvider from 'services/spotify';
import WindowProvider from 'services/window';
import styled, { createGlobalStyle } from 'styled-components';

import Shell from "../components/Shell";

let vh = window.innerHeight;
// Then we set the value in the --vh custom property to the root of the document
document.documentElement.style.setProperty('--vh', `${vh}px`);

const GlobalStyles = createGlobalStyle`
   body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
      font-size: 16px;
      box-sizing: border-box;
        touch-action: manipulation;
      @media (prefers-color-scheme: dark) {
        background: black;
      }
   }
`;

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  @media screen and (min-width: 750px) {
    display: flex;

  }
  
  min-height: -webkit-fill-available;

`;
//

//

const App: React.FC = () => {
  return (
    <Container>
      <GlobalStyles />
      <SpotifyProvider>
        <WindowProvider>
         <Shell/>
        </WindowProvider>
      </SpotifyProvider>
    </Container>
  );
};

export default App;
