import React, { useCallback, useState } from 'react';

import { useEventListener, useSpotifyPlayer } from 'hooks';

import Knob from './Knob';
import {
  getThemeForValueFromString, Theme,
} from "../constants/Theme";
enum WHEEL_QUADRANT {
  TOP = 1,
  BOTTOM = 2,
  LEFT = 3,
  RIGHT = 4
}

enum KEY_CODE {
  ARROW_UP = 38,
  ARROW_DOWN = 40,
  ARROW_LEFT = 37,
  ARROW_RIGHT = 39,
  ESC = 27,
  ENTER = 13,
  SPACE = 32
}

const centerClickEvent = new Event("centerclick");
const forwardScrollEvent = new Event("forwardscroll");
const backwardScrollEvent = new Event("backwardscroll");
const wheelClickEvent = new Event("wheelclick");
const menuClickEvent = new Event("menuclick");
// const backClickEvent = new Event("backclick");

let theme : Theme;
const ScrollWheel = () => {
  const [count, setCount] = useState(0);
  // const [theme, setTheme] = useState(BlackTheme);
  const { skipNext, skipPrevious, togglePause } = useSpotifyPlayer();

  const handleCenterClick = useCallback(
    () => window.dispatchEvent(centerClickEvent),
    []
  );

  const handleClockwiseScroll = useCallback(
    () => window.dispatchEvent(forwardScrollEvent),
    []
  );

  const handleCounterClockwiseScroll = useCallback(() => {
    window.dispatchEvent(backwardScrollEvent);
  }, []);

  const handleWheelClick = useCallback(
    (quadrant: number) => {
      console.log("handleWheelClick");
      window.dispatchEvent(wheelClickEvent);
      switch (quadrant) {
        case WHEEL_QUADRANT.TOP:
          window.dispatchEvent(menuClickEvent);
          break;
        case WHEEL_QUADRANT.BOTTOM:
          togglePause();
          break;
        case WHEEL_QUADRANT.LEFT:
          // window.dispatchEvent(backClickEvent);
          skipPrevious();
          break;
        case WHEEL_QUADRANT.RIGHT:
          skipNext();
          break;
      }
    },
    [skipNext, skipPrevious, togglePause]
  );

  /** Allows for keyboard navigation. */
  const handleKeyPress = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      switch (event.keyCode) {
        case KEY_CODE.ARROW_UP:
        case KEY_CODE.ARROW_LEFT:
          handleCounterClockwiseScroll();
          break;
        case KEY_CODE.ARROW_DOWN:
        case KEY_CODE.ARROW_RIGHT:
          handleClockwiseScroll();
          break;
        case KEY_CODE.ENTER:
          handleCenterClick();
          break;
        case KEY_CODE.SPACE:
          togglePause();
          break;
        case KEY_CODE.ESC:
          handleWheelClick(WHEEL_QUADRANT.TOP);
          break;
      }
    },
    [handleCounterClockwiseScroll,
      handleClockwiseScroll,
      handleCenterClick,
      togglePause,
      handleWheelClick
    ]
  );

  /** Determine if clockwise/counter-clockwise based on the Knob onChange value. */
  const handleScroll = useCallback(
    (val: number) => {
      if (count>0 && count < 100 && val>0 && val < 100){
        console.log("Val:"+val + " Count:"+count);
        //
        // if (val === 0 && count === 100) {
        //   handleClockwiseScroll();
        // } else if (val === 100 && count === 0) {
        //   handleCounterClockwiseScroll();
        // } else
        if (val > count) {
          handleClockwiseScroll();
        } else if (val < count) {
          handleCounterClockwiseScroll();
        }
      }
      setCount(val);
    },
    [count, handleClockwiseScroll, handleCounterClockwiseScroll]
  );

  useEventListener("keydown", handleKeyPress);
  useEventListener("changeTheme",onThemeChange);

  function onThemeChange(e:CustomEvent) {
    theme = getThemeForValueFromString(localStorage.getItem("theme"));
  }

  theme = getThemeForValueFromString(localStorage.getItem("theme"));
  let vh = window.innerHeight;

  return (
    <Knob
      value={count}
      min={0}
      max={100}
      width={vh*0.30}
      height={vh*0.30}
      step={7}
      thickness={0.9}
      onClick={handleCenterClick}
      onWheelClick={handleWheelClick}
      onChange={handleScroll}
      fgColor="transparent"
      bgColor={theme.wheelColor}
      centerButtonBoxShadowColor = {theme.centerButtonBoxShadowColor}
      centerButtonBackgroundColor = {theme.centerButtonBackgroundColor}
      knobGradientStartColor = {theme.knobGradientStartColor}
      knobGradientEndColor = {theme.knobGradientEndColor}
      knobButtonTextColor = {theme.knobButtonTextColor}
    />
  );
};

export default ScrollWheel;
