
export class Theme {
    centerButtonBoxShadowColor: string | undefined;
    centerButtonBackgroundColor: string | undefined;
    knobGradientStartColor: string | undefined;
    knobGradientEndColor: string | undefined;
    knobButtonTextColor: string | undefined;
    wheelColor: string | undefined;


    constructor(centerButtonBoxShadowColor: string | undefined, centerButtonBackgroundColor: string | undefined, knobGradientStartColor: string | undefined, knobGradientEndColor: string | undefined, knobButtonTextColor: string | undefined,wheelColor: string | undefined) {
        this.centerButtonBoxShadowColor = centerButtonBoxShadowColor;
        this.centerButtonBackgroundColor = centerButtonBackgroundColor;
        this.knobGradientStartColor = knobGradientStartColor;
        this.knobGradientEndColor = knobGradientEndColor;
        this.knobButtonTextColor = knobButtonTextColor;
        this.wheelColor = wheelColor;
    }
}

export const BlackTheme = new Theme(
    "#000000",
    "#000000",
        "#202020",
        "#4b4b4b",
         "#AFAFAF",
    "#272727");

export const WhiteTheme = new Theme(
    "#aeaeae",
    "#e3e3e3",
    "#202020",
    "#4b4b4b",
    "#b6b6b6",
    "#dedede");

export const RedTheme = new Theme(
    "#FF4848",
    "#FF4848",
    "#FF2020",
    "#FF4b4b",
    "#AFAFAF",
    "#272727");

export const getThemeForValueFromEvent = (e:CustomEvent | undefined)=>{
    if (e!==undefined) {
        if (e.detail.value === 'White') {
            return WhiteTheme;
        } else if (e.detail.value === 'Red') {
            console.log("Red");
            return RedTheme;
        }
    }
    return BlackTheme;
}

export const getThemeForValueFromString = (value: string | null)=>{
    if (value!==undefined) {
        if (value === 'White') {
            return WhiteTheme;
        } else if (value === 'Red') {
            console.log("Red");
            return RedTheme;
        }
    }
    return BlackTheme;
}
