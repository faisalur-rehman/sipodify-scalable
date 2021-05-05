import React, { useCallback, useEffect, useState } from "react";

import ViewOptions, * as Views from "App/views";
import { SelectableList, SelectableListOption } from "components";
import { useScrollHandler } from "hooks";
import { useSpotifyService } from "services/spotify";
import { useWindowService } from "services/window";
import { _saveTokens, isDev } from "utils";
const clientId = "17ae74b3a33643239b1b01cc7fa5873c";
console.log("isDev" + isDev());
const redirectUri = "https://rewound.netlify.app/";
// const redirectUri = "http://localhost:3000/";

console.log(redirectUri);
const scopes = [
  "user-read-currently-playing",
  "user-read-playback-state",
  "user-top-read",
  "ugc-image-upload",
  "playlist-read-collaborative",
  "playlist-modify-private",
  "playlist-read-private",
  "playlist-modify-public",
  "user-read-email",
  "user-read-private",
  "user-modify-playback-state",
  "user-read-recently-played",
  "user-follow-read",
  "user-follow-modify",
  "streaming",
  "user-library-read",
  "user-library-modify",
];

const initialOptions: SelectableListOption[] = [
  {
    label: "Spotify Signin",
    value: "hi",
    link: `https://accounts.spotify.com/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes.join(
      "%20"
    )}&response_type=code&state=34fFs29kd09&show_dialog=true`,
  },
];

// Get the hash of the url
const hash = window.location.hash
  .substring(1)
  .split("&")
  .reduce(function (initial: any, item) {
    console.log(JSON.stringify(initial));
    if (item) {
      const parts = item.split("=");
      initial[parts[0]] = decodeURIComponent(parts[1]);
      _saveTokens(
        initial["access_token"],
        initial["access_token"],
        initial["expires_in"]
      );
    }
    return initial;
  }, {});
window.location.hash = "";
console.log(hash);
const AuthView = () => {
  const { resetWindowStack } = useWindowService();
  const [options] = useState(initialOptions);
  const [index] = useScrollHandler(ViewOptions.auth.id, options);
  const { loggedIn } = useSpotifyService();

  const handleCheckLogin = useCallback(() => {
    console.log("handleCheckLogin" + loggedIn);
    console.log("Hash" + window.location);
    if (loggedIn) {
      resetWindowStack({
        id: ViewOptions.home.id,
        type: Views.WINDOW_TYPE.SPLIT,
        component: Views.HomeView,
      });
    }
  }, [loggedIn, resetWindowStack]);

  useEffect(() => {
    handleCheckLogin();
  }, [handleCheckLogin]);

  return <SelectableList options={options} activeIndex={index} />;
};

export default AuthView;
