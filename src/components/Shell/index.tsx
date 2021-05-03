import React, {useState} from 'react';
import styled from "styled-components";
import Interface from "../../App/Interface";
import { ScrollWheel } from 'components';
import {useEventListener} from "../../hooks";
import {getThemeForValueFromString} from "../constants/Theme";

const Shell = () => {
    const [theme, setTheme] = useState(getThemeForValueFromString(localStorage.getItem("theme")));

    useEventListener("changeTheme",onThemeChange);

    function onThemeChange(e:CustomEvent) {
        // console.log("onThemeChange"+e.detail.value);
        setTheme(getThemeForValueFromString(localStorage.getItem("theme")));
    }

    const Container  = styled.div`
      position: relative;
      height: var(--vh, 1vh);
      height: calc(var(--vh, 1vh));
      margin: auto;
      // max-height: 36.5em;
      width: 100vh;
      border-radius: 30px;
      box-shadow: inset 0 0 2.4em #555;
      background: linear-gradient(180deg, ${theme.centerButtonBoxShadowColor} 0%, ${theme.centerButtonBoxShadowColor} 100%);
      // -webkit-box-reflect: below 0px -webkit-gradient(linear, left top, left bottom, from(transparent), color-stop(50%, transparent), to(rgba(250, 250, 250, 0.3)));
      // animation: descend 1.5s ease;
    
      @media (prefers-color-scheme: dark) {
        box-shadow: inset 0 0 2.4em black;
      }
    
      @media screen and (max-width: 400px) {
        animation: none;
        border-radius: 0;
        -webkit-box-reflect: unset;
      }
    
      @keyframes descend {
        0% {
          transform: scale(0.3);
          opacity: 0;
        }
    
        100% {
          transform: scale(1);
          opacity: 1;
        }
      }
    `;
    return (<Container>
        <Interface />
        <ScrollWheel />
    </Container>);
};

export default Shell;
