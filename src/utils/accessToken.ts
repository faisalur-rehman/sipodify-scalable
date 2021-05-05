import querystring from "querystring";
// import { isDev } from "./index";

export type TokenResponse = {
  accessToken?: string;
  refreshToken?: string;
};

/** Determines if an access token has been saved at a prior time,
 * and if so, attempts to refresh the token. If no prior tokens
 * have been set, fetch a brand new one and save it to localStorage.
 */
export const getTokens = async (): Promise<TokenResponse> => {
  const { storedAccessToken, storedRefreshToken } = getExistingTokens();
  console.log("Get Tokens...");

  if (!storedAccessToken || !storedRefreshToken) {
    console.log("Get New Tokens...");
    return _getNewTokens();
  }

  if (_shouldRefreshTokens()) {
    console.log("Get Refresh Tokens...");
    return _getRefreshedTokens(storedRefreshToken);
  }

  return {
    accessToken: storedAccessToken,
    refreshToken: storedRefreshToken,
  };
};

export const getExistingTokens = () => {
  const storedAccessToken =
    localStorage.getItem("spotify_access_token") ?? undefined;
  const storedRefreshToken =
    localStorage.getItem("spotify_refresh_token") ?? undefined;

  return {
    storedAccessToken,
    storedRefreshToken,
  };
};

/** Accepts a refresh token and returns a fresh access token.
 * Valid for 1 hour, at which point the token will expire.
 */
const _getRefreshedTokens = async (
  storedRefreshToken: string
): Promise<TokenResponse> => {
  try {
    const response = await fetch(`https://accounts.spotify.com/api/token`, {
      credentials: "same-origin",
      mode: "cors",
      method: "POST",
      headers: createHeaders(),
      body: querystring.stringify({
        grant_type: "refresh_token",
        refresh_token: storedRefreshToken,
      }),
    });
    console.log(JSON.stringify(response));

    console.log("TokenResponse:" + JSON.stringify(response));
    const data = await response.json();
    console.log("TokenResponse:" + JSON.stringify(data));

    _saveTokens(data.access_token, data.refresh_token, data.expires_in);

    console.log("Got refreshed tokens:", {
      accessToken: data.access_token,
      storedRefreshToken,
    });

    _saveTokens(data.access_token, storedRefreshToken);

    return { accessToken: data.access_token, refreshToken: storedRefreshToken };
  } catch (error) {
    console.log("error", error);
  }

  return {
    accessToken: undefined,
    refreshToken: undefined,
  };
};
const createHeaders = () => {
  let clientId = "17ae74b3a33643239b1b01cc7fa5873c";
  let clientSecret = "12eb76c651c24a2fa9ea9353cb003e63";
  return {
    Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString(
      "base64"
    )}`,
    "Content-Type": "application/x-www-form-urlencoded",
  };
};

/** Accepts a `code` and `state` generated from spotify user authorization,
 * and attempts to fetch a new access and refresh token.
 * Valid for 1 hour, at which point the access token will expire.
 */
const _getNewTokens = async (): Promise<TokenResponse> => {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get("code") ?? undefined;
  const state = urlParams.get("state") ?? undefined;

  if (!code || !state) {
    return {};
  }

  try {
    console.log("Fetching Token");
    const response = await fetch(`https://accounts.spotify.com/api/token`, {
      mode: "cors",
      method: "POST",
      headers: createHeaders(),
      body: querystring.stringify({
        grant_type: "authorization_code",
        code: code,
        // redirect_uri: "https://rewound.netlify.app/",
        redirect_uri: "http://localhost:3000/",
      }),
    });

    console.log("TokenResponse:" + JSON.stringify(response));
    const data = await response.json();
    console.log("TokenResponse:" + JSON.stringify(data));

    _saveTokens(data.access_token, data.refresh_token, data.expires_in);

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
    };
  } catch (error) {
    console.log("error:", { error });
  }

  return {
    accessToken: undefined,
    refreshToken: undefined,
  };
};

/** Checks the last time an access token was requested.
 * If a token has never been requested, return true.
 * If the last refresh was > 30 minutes ago, return true.
 */
const _shouldRefreshTokens = () => {
  const lastRefreshTimestamp = parseInt(
    localStorage.getItem("spotify_token_timestamp") ?? ""
  );
  const now = Date.now();

  if (!lastRefreshTimestamp) {
    return true;
  }

  //Gets the time difference in minutes.
  const minuteDiff = Math.round((now - lastRefreshTimestamp) / 1000 / 60);
  console.log(`Last token refresh: ${minuteDiff} minutes ago`);

  return minuteDiff > 55;
};

export const _saveTokens = (
  accessToken?: string,
  refreshToken?: string,
  expiresIn?: string
) => {
  if (!accessToken || !refreshToken || !expiresIn) {
    console.error("Error: Attempting to save undefined tokens:", {
      accessToken,
      refreshToken,
    });
    return;
  }

  localStorage.setItem("spotify_access_token", accessToken);
  localStorage.setItem("spotify_refresh_token", refreshToken);
  localStorage.setItem("spotify_expires_in", expiresIn);
  localStorage.setItem("spotify_token_timestamp", `${Date.now()}`);
};
