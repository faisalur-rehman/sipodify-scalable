import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";

// NOTE: This is a legacy file that I pulled from an
//       older version of this same project.
let vh = window.innerHeight;
const Container = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  touch-action: none;
  margin: auto;
  transform: translate3d(0, 0, 0);
  width: ${vh*0.48}px;
  height: ${vh*0.48}px;
`;

const CanvasContainer = styled.div`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: auto;
  
`;


const Canvas = styled.canvas`
  border-radius: 50%;
  border: 1px solid #202020;
  box-shadow: inset 0 0 2.4em #555;
  background: linear-gradient(180deg, ${props => props.knobGradientStartColor + " 0%, " + props.knobGradientEndColor} 100%);
`;

const CenterButton = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  margin: auto;
  width: ${props => props.size / 2.5}px;
  height: ${props => props.size / 2.5}px;
  border-radius: 50%;
  box-shadow: ${props => props.centerButtonBoxShadowColor} 0px 1em 3em inset;
  background: ${props => props.centerButtonBackgroundColor};
  border: 1px solid #00000000;
  
  :active {
    filter: brightness(0.9);
  }
`;

const WheelButton = styled.svg`
  position: absolute;
  margin: ${props => props.margin};
  top: ${props => props.top};
  bottom: ${props => props.bottom};
  left: ${props => props.left};
  right: ${props => props.right};
  user-select: none;
  pointer-events: none;
  max-height: 13px;
  fill:${props => props.knobButtonTextColor};
    
`;

class Knob extends React.Component {
  static propTypes = {
    value: PropTypes.number.isRequired,
    onChange: PropTypes.func.isRequired,
    onClick: PropTypes.func,
    onWheelClick: PropTypes.func,
    onChangeEnd: PropTypes.func,
    min: PropTypes.number,
    max: PropTypes.number,
    step: PropTypes.number,
    log: PropTypes.bool,
    width: PropTypes.number,
    height: PropTypes.number,
    thickness: PropTypes.number,
    lineCap: PropTypes.oneOf(["butt", "round"]),
    bgColor: PropTypes.string,
    fgColor: PropTypes.string,
    inputColor: PropTypes.string,
    font: PropTypes.string,
    fontWeight: PropTypes.string,
    clockwise: PropTypes.bool,
    cursor: PropTypes.oneOfType([PropTypes.number, PropTypes.bool]),
    stopper: PropTypes.bool,
    disableTextInput: PropTypes.bool,
    displayInput: PropTypes.bool,
    displayCustom: PropTypes.func,
    angleArc: PropTypes.number,
    angleOffset: PropTypes.number,
    className: PropTypes.string,
    canvasClassName: PropTypes.string,
    centerButtonBoxShadowColor: PropTypes.string,
    centerButtonBackgroundColor: PropTypes.string,
    knobGradientStartColor: PropTypes.string,
    knobGradientEndColor: PropTypes.string,
    knobButtonTextColor: PropTypes.string,

  };

  static defaultProps = {
    onChangeEnd: () => {},
    onWheelClick: () => {},
    onClick: () => {},
    min: 0,
    max: 100,
    step: 1,
    log: false,
    width: 200,
    height: 200,
    thickness: 0.35,
    lineCap: "butt",
    bgColor: "#EEE",
    fgColor: "#EA2",
    inputColor: "",
    font: "Arial",
    fontWeight: "bold",
    clockwise: true,
    cursor: false,
    stopper: true,
    disableTextInput: false,
    displayInput: true,
    angleArc: 360,
    angleOffset: 0,
    className: null,
    canvasClassName: null
  };

  constructor(props) {
    super(props);
    this.w = this.props.width || 200;
    this.h = this.props.height || this.w;
    this.cursorExt = this.props.cursor === true ? 0.3 : this.props.cursor / 100;
    this.angleArc = (this.props.angleArc * Math.PI) / 180;
    this.angleOffset = (this.props.angleOffset * Math.PI) / 180;
    this.startAngle = 1.5 * Math.PI + this.angleOffset;
    this.endAngle = 1.5 * Math.PI + this.angleOffset + this.angleArc;
    this.digits =
      Math.max(
        String(Math.abs(this.props.min)).length,
        String(Math.abs(this.props.max)).length,
        2
      ) + 2;
  }

  componentDidMount() {
    this.drawCanvas();
    this.canvasRef.addEventListener("touchstart", this.handleTouchStart, {
      passive: false
    });
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.width && this.w !== nextProps.width) {
      this.w = nextProps.width;
    }
    if (nextProps.height && this.h !== nextProps.height) {
      this.h = nextProps.height;
    }
  }

  componentDidUpdate() {
    this.drawCanvas();
  }

  componentWillUnmount() {
    this.canvasRef.removeEventListener("touchstart", this.handleTouchStart);
  }

  getArcToValue = v => {
    let startAngle;
    let endAngle;
    const angle = !this.props.log
      ? ((v - this.props.min) * this.angleArc) /
        (this.props.max - this.props.min)
      : Math.log(Math.pow(v / this.props.min, this.angleArc)) /
        Math.log(this.props.max / this.props.min);
    if (!this.props.clockwise) {
      startAngle = this.endAngle + 0.00001;
      endAngle = startAngle - angle - 0.00001;
    } else {
      startAngle = this.startAngle - 0.00001;
      endAngle = startAngle + angle + 0.00001;
    }
    if (this.props.cursor) {
      startAngle = endAngle - this.cursorExt;
      endAngle += this.cursorExt;
    }
    return {
      startAngle,
      endAngle,
      acw: !this.props.clockwise && !this.props.cursor
    };
  };

  // Calculate ratio to scale canvas to avoid blurriness on HiDPI devices
  getCanvasScale = ctx => {
    const devicePixelRatio =
      window.devicePixelRatio ||
      window.screen.deviceXDPI / window.screen.logicalXDPI || // IE10
      1;
    const backingStoreRatio = ctx.webkitBackingStorePixelRatio || 1;
    return devicePixelRatio / backingStoreRatio;
  };

  coerceToStep = v => {
    let val = !this.props.log
      ? ~~((v < 0 ? -0.5 : 0.5) + v / this.props.step) * this.props.step
      : Math.pow(
          this.props.step,
          ~~(
            (Math.abs(v) < 1 ? -0.5 : 0.5) +
            Math.log(v) / Math.log(this.props.step)
          )
        );
    val = Math.max(Math.min(val, this.props.max), this.props.min);
    if (isNaN(val)) {
      val = 0;
    }
    return Math.round(val * 1000) / 1000;
  };

  eventToValue = e => {
    const bounds = this.canvasRef.getBoundingClientRect();
    const x = e.clientX - bounds.left;
    const y = e.clientY - bounds.top;
    let a = Math.atan2(x - this.w / 2, this.w / 2 - y) - this.angleOffset;
    if (!this.props.clockwise) {
      a = this.angleArc - a - 2 * Math.PI;
    }
    if (this.angleArc !== Math.PI * 2 && a < 0 && a > -0.5) {
      a = 0;
    } else if (a < 0) {
      a += Math.PI * 2;
    }
    const val = !this.props.log
      ? (a * (this.props.max - this.props.min)) / this.angleArc + this.props.min
      : Math.pow(this.props.max / this.props.min, a / this.angleArc) *
        this.props.min;
    return this.coerceToStep(val);
  };

  handleMouseDown = e => {
    this.props.onChange(this.eventToValue(e));
    document.addEventListener("mousemove", this.handleMouseMove);
    document.addEventListener("mouseup", this.handleMouseUpNoMove);
  };

  handleTouchStart = e => {
    console.log("handleTouchStart");
    this.props.onChange(this.eventToValue(e));
    document.addEventListener("touchmove", this.handleTouchMove, {
      passive: false
    });
    document.addEventListener("touchend", this.handleTouchEndNoMove);
  };

  handleMouseMove = e => {
    e.preventDefault();
    const val = this.eventToValue(e);

    if (val !== this.props.value) {
      this.props.onChange(this.eventToValue(e));
    }

    document.removeEventListener("mouseup", this.handleMouseUpNoMove);
    document.addEventListener("mouseup", this.handleMouseUp);
  };

  handleTouchMove = e => {
    e.preventDefault();
    const touchIndex = e.targetTouches.length - 1;
    const val = this.eventToValue(e.targetTouches[touchIndex]);

    if (val !== this.props.value) {
      this.props.onChange(val);
    }

    document.removeEventListener("touchend", this.handleTouchEndNoMove);
    document.addEventListener("touchend", this.handleTouchEnd);
  };

  handleMouseUp = e => {
    this.props.onChangeEnd(this.eventToValue(e));
    document.removeEventListener("mousemove", this.handleMouseMove);
    document.removeEventListener("mouseup", this.handleMouseUp);
  };

  handleTouchEnd = e => {
    const touchIndex = e.targetTouches.length - 1;
    this.props.onChangeEnd(e.targetTouches[touchIndex]);
    document.removeEventListener("touchmove", this.handleTouchMove);
    document.removeEventListener("touchend", this.handleTouchEnd);
  };

  findClickQuadrant = (rectSize, x, y) => {
    console.log("findClickQuadrant|rectSize:"+rectSize+"|x:"+x+"|y:"+y);
    if (y < rectSize / 4) {
      return 1;
    } else if (y > rectSize * 0.75) {
      return 2;
    } else if (x < rectSize / 4) {
      return 3;
    } else if (x > rectSize * 0.75) {
      return 4;
    }
    return -1;
  };

  handleMouseUpNoMove = e => {
    const rect = e.target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rectWidth = rect.width;
    const quadrant = this.findClickQuadrant(rectWidth, x, y);
    console.log("handleMouseUpNoMove");
    console.log("quadrant"+quadrant);

    if (quadrant > 0 && quadrant <= 4) {
      this.props.onWheelClick(quadrant);
    }

    document.removeEventListener("mousemove", this.handleMouseMove);
    document.removeEventListener("mouseup", this.handleMouseUp);
    document.removeEventListener("mouseup", this.handleMouseUpNoMove);
  };

  handleTouchEndNoMove = e => {
    const rect = e.target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    console.log("e.clientX"+e.clientX);
    console.log("e.clientY"+e.clientY);
    const rectWidth = rect.width;
    const quadrant = this.findClickQuadrant(rectWidth, x, y);
    console.log("handleTouchEndNoMove");
    console.log("rect.width:"+rect.width);
    console.log("quadrant:"+quadrant);
    if (quadrant > 0 && quadrant <= 4) {
      this.props.onWheelClick(quadrant);
    }

    document.removeEventListener("touchmove", this.handleTouchMove);
    document.removeEventListener("touchend", this.handleTouchEnd);
    document.removeEventListener("touchend", this.handleTouchEndNoMove);
  };

  handleEsc = e => {
    if (e.keyCode === 27) {
      e.preventDefault();
      this.handleMouseUp();
    }
  };

  handleTextInput = e => {
    const val =
      Math.max(Math.min(+e.target.value, this.props.max), this.props.min) ||
      this.props.min;
    this.props.onChange(val);
  };

  handleWheel = e => {
    e.preventDefault();
    if (e.deltaX > 0 || e.deltaY > 0) {
      this.props.onChange(
        this.coerceToStep(
          !this.props.log
            ? this.props.value + this.props.step
            : this.props.value * this.props.step
        )
      );
    } else if (e.deltaX < 0 || e.deltaY < 0) {
      this.props.onChange(
        this.coerceToStep(
          !this.props.log
            ? this.props.value - this.props.step
            : this.props.value / this.props.step
        )
      );
    }
  };

  handleArrowKey = e => {
    if (e.keyCode === 37 || e.keyCode === 40) {
      e.preventDefault();
      this.props.onChange(
        this.coerceToStep(
          !this.props.log
            ? this.props.value - this.props.step
            : this.props.value / this.props.step
        )
      );
    } else if (e.keyCode === 38 || e.keyCode === 39) {
      e.preventDefault();
      this.props.onChange(
        this.coerceToStep(
          !this.props.log
            ? this.props.value + this.props.step
            : this.props.value * this.props.step
        )
      );
    }
  };

  inputStyle = () => ({
    width: `${(this.w / 2 + 4) >> 0}px`,
    height: `${(this.w / 3) >> 0}px`,
    position: "absolute",
    verticalAlign: "middle",
    marginTop: `${(this.w / 3) >> 0}px`,
    marginLeft: `-${((this.w * 3) / 4 + 2) >> 0}px`,
    border: 0,
    outline: "none",
    background: "none",
    font: `${this.props.fontWeight} ${(this.w / this.digits) >> 0}px ${
      this.props.font
    }`,
    textAlign: "center",
    color: this.props.inputColor || this.props.fgColor,
    padding: "0px",
    WebkitAppearance: "none",
    cursor: "pointer"
  });

  drawCanvas() {
    const ctx = this.canvasRef.getContext("2d");
    const scale = this.getCanvasScale(ctx);
    this.canvasRef.width = this.w * scale; // clears the canvas
    this.canvasRef.height = this.h * scale;
    ctx.scale(scale, scale);
    this.xy = this.w / 2; // coordinates of canvas center
    this.lineWidth = this.xy * this.props.thickness;
    this.radius = this.xy - this.lineWidth / 2;
    ctx.lineWidth = this.lineWidth;
    ctx.lineCap = this.props.lineCap;
    // background arc
    ctx.beginPath();
    ctx.strokeStyle = this.props.bgColor;
    ctx.arc(
      this.xy,
      this.xy,
      this.radius,
      this.endAngle - 0.00001,
      this.startAngle + 0.00001,
      true
    );
    ctx.stroke();
    // foreground arc
    const a = this.getArcToValue(this.props.value);
    ctx.beginPath();
    ctx.strokeStyle = this.props.fgColor;
    ctx.arc(this.xy, this.xy, this.radius, a.startAngle, a.endAngle, a.acw);
    ctx.stroke();
  }

  render() {
    const { canvasClassName, onClick } = this.props;
    console.log("this.w"+this.w);
    return (
      <Container>
        <CanvasContainer width={this.w} height={this.h}>
          <Canvas
            ref={ref => {
              this.canvasRef = ref;
            }}
            className={canvasClassName}
            style={{ width: "80%", height: "80%",margin: "auto" }}
            onMouseDown={this.handleMouseDown}
            knobGradientStartColor = {this.props.knobGradientStartColor}
            knobGradientEndColor = {this.props.knobGradientEndColor}
          />
          <CenterButton onClick={onClick} size={this.w}
                        centerButtonBackgroundColor={this.props.centerButtonBackgroundColor}
                        centerButtonBoxShadowColor={this.props.centerButtonBoxShadowColor}/>
          <WheelButton knobButtonTextColor= {this.props.knobButtonTextColor} top="8%" margin="0 auto" src="menu.svg"  width="61" height="17" viewBox="0 0 61 17" xmlns="http://www.w3.org/2000/svg">
            <path d="M10.6177 0.885742H15.1602V16H12.2173V5.77686C12.2173 5.48291 12.2207 5.07275 12.2275 4.54639C12.2344 4.01318 12.2378 3.60303 12.2378 3.31592L9.37695 16H6.31104L3.4707 3.31592C3.4707 3.60303 3.47412 4.01318 3.48096 4.54639C3.48779 5.07275 3.49121 5.48291 3.49121 5.77686V16H0.54834V0.885742H5.14209L7.89014 12.77L10.6177 0.885742ZM29.6895 3.56201H21.6915V6.77148H29.0333V9.39648H21.6915V13.2827H30.0587V16H18.6051V0.885742H29.6895V3.56201ZM32.8883 0.885742H36.2004L42.2194 11.437V0.885742H45.1623V16H42.0041L35.8312 5.26416V16H32.8883V0.885742ZM48.5354 0.885742H51.7449V10.1758C51.7449 11.2148 51.8679 11.9736 52.114 12.4521C52.4968 13.2998 53.3308 13.7236 54.616 13.7236C55.8943 13.7236 56.7248 13.2998 57.1077 12.4521C57.3537 11.9736 57.4768 11.2148 57.4768 10.1758V0.885742H60.6863V10.1758C60.6863 11.7822 60.4368 13.0332 59.9377 13.9287C59.008 15.5693 57.2341 16.3896 54.616 16.3896C51.9978 16.3896 50.2204 15.5693 49.2839 13.9287C48.7849 13.0332 48.5354 11.7822 48.5354 10.1758V0.885742Z" />
          </WheelButton>
          <WheelButton knobButtonTextColor= {this.props.knobButtonTextColor} right="15%" margin="auto 0"  width="33" height="16" viewBox="0 0 33 16" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 8L4 14.9282L4 1.0718L16 8Z" />
            <path d="M29 8L17 14.9282V1.0718L29 8Z" />
            <rect x="29" width="4" height="15" />
          </WheelButton>
          <WheelButton knobButtonTextColor= {this.props.knobButtonTextColor} left="15%" margin="auto 0" width="33" height="16" viewBox="0 0 33 16"  xmlns="http://www.w3.org/2000/svg">
            <path d="M17 8L29 1.0718V14.9282L17 8Z" />
            <path d="M4 8L16 1.0718V14.9282L4 8Z" />
            <rect x="4" y="16" width="4" height="15" transform="rotate(-180 4 16)"/>
          </WheelButton>
          <WheelButton knobButtonTextColor= {this.props.knobButtonTextColor} bottom="8%" margin="0 auto" width="39" height="18" viewBox="0 0 39 18"  xmlns="http://www.w3.org/2000/svg">
            <path d="M18 9L4.5 16.7942L4.5 1.20577L18 9Z" />
            <rect x="26" y="1" width="4" height="16" />
            <rect x="35" y="1" width="4" height="16" />

          </WheelButton>
        </CanvasContainer>
      </Container>
    );
  }
}

export default Knob;
