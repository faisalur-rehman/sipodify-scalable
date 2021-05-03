import React, { useCallback, useEffect, useState } from 'react';

import { SelectableList, SelectableListOption } from 'components';
import { useMenuHideWindow, useScrollHandler } from 'hooks';
import useSpotifyApi from 'hooks/useSpotifyApi';

import ViewOptions, {NowPlayingView} from '../';

const TopTracksView = () => {
  useMenuHideWindow(ViewOptions.topTracks.id);
  const [options, setOptions] = useState<SelectableListOption[]>([]);
  const { loading, data, error } = useSpotifyApi<
    SpotifyApi.UsersTopTracksResponse
  >("me/top/tracks?limit=50");

  const handleData = useCallback(() => {

    setOptions(
      data!.items.map(track => ({
        label: track.name,
        value: () => <NowPlayingView uri={track.uri} />,
        uris: data!.items.map( track => track.uri),
        songIndex: track.track_number
      }))
    );
  }, [data]);

  useEffect(() => {
    if (data?.items && !options.length && !error) {
      handleData();
    }
  }, [data, error, handleData, options.length]);

  const [index] = useScrollHandler(ViewOptions.topTracks.id, options);

  return (
    <SelectableList loading={loading} options={options} activeIndex={index} />
  );
};

export default TopTracksView;
