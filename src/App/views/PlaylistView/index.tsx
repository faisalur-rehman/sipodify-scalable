import React, { useEffect, useState } from "react";

import ViewOptions from "App/views";
import { SelectableList, SelectableListOption } from "components";
import { useMenuHideWindow, useScrollHandler } from "hooks";
import useSpotifyApi from "hooks/useSpotifyApi";

import NowPlayingView from "../NowPlayingView";

interface Props {
  name: string;
  id?: string;
  userId?: string;
  playlisturi?: string;
}

const PlaylistView = ({
  name,
  id = "0",
  userId = "0",
  playlisturi = "",
}: Props) => {
  useMenuHideWindow(ViewOptions.playlist.id);
  const [options, setOptions] = useState<SelectableListOption[]>([]);
  const [index] = useScrollHandler(ViewOptions.playlist.id, options);
  const {
    loading,
    data,
    error,
  } = useSpotifyApi<SpotifyApi.PlaylistTrackResponse>(
    `users/${userId}/playlists/${id}/tracks`
  );

  useEffect(() => {
    if (data?.items && !error) {
      console.log("/playlists/id/tracks:" + JSON.stringify(data));
      const trackUris = data.items.map(({ track }) => playlisturi);

      setOptions(
        data.items.map((playlistItem, index) => ({
          label: playlistItem.track.name,
          value: () => <NowPlayingView uri={playlisturi} />,
          image: playlistItem.track.album.images[0]?.url,
          uris: trackUris,
          songIndex: index,
        }))
      );
    }
  }, [data, playlisturi, error]);

  return (
    <SelectableList loading={loading} options={options} activeIndex={index} />
  );
};

export default PlaylistView;
