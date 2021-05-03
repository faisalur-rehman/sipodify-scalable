import React from 'react';

import { WINDOW_TYPE } from 'App/views';
import { Screen, Unit } from 'components';
import { useWindowService } from 'services/window';
import styled from 'styled-components';

import CoverFlowInterface from './CoverFlowInterface';
import FullScreenInterface from './FullScreenInterface';
import SplitScreenInterface from './SplitScreenInterface';

let vh = window.innerHeight;
const Container = styled.div`
  position: relative;
  height: ${vh*0.5}px;
  background: transparent;
  animation: fadeFromBlack 0.5s;
  overflow: hidden;
  @keyframes fadeFromBlack {
    0% {
      filter: brightness(0);
    }
  }

  
`;

/** Prevents the user from scrolling the display with a mouse. */
const Mask = styled.div`
  z-index: 100;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
`;

const MarginContainer = styled.div`
  position: relative;
  height: 94%;
  margin: auto;
  border: ${vh*0.005}px solid black;
  border-radius:1%;
  overflow: hidden;
  background: white;
  animation: fadeFromBlack 0.5s;

  @keyframes fadeFromBlack {
    0% {
      filter: brightness(0);
    }
  }

  ${Screen.SM} {
    @media screen and (max-height: 750px) {
      margin: ${Unit.SM} ${Unit.SM} ${Unit.XL};
    }
  }
`;

const Interface = () => {
  const { windowStack } = useWindowService();
  const splitViewWindows = windowStack.filter(
    window => window.type === WINDOW_TYPE.SPLIT
  );
  const fullViewWindows = windowStack.filter(
    window => window.type === WINDOW_TYPE.FULL
  );
  const coverFlowWindow = windowStack.find(
    window => window.type === WINDOW_TYPE.COVER_FLOW
  );

  return (
    <Container>
        <MarginContainer>
          <Mask />
          <CoverFlowInterface window={coverFlowWindow} />
          <SplitScreenInterface
            windowStack={splitViewWindows}
            menuHidden={fullViewWindows.length > 0}
            allHidden={!!coverFlowWindow}
          />
          <FullScreenInterface windowStack={fullViewWindows} />
        </MarginContainer>
    </Container>
  );
};

export default Interface;
