import React, { useCallback, useEffect, useState } from 'react';

import { SelectableList, SelectableListOption } from 'components';
import { useMenuHideWindow, useScrollHandler } from 'hooks';
import useSpotifyApi from 'hooks/useSpotifyApi';

import ViewOptions, { ArtistView } from '../';

const TopArtistsView = () => {
  useMenuHideWindow(ViewOptions.topArtists.id);
  const [options, setOptions] = useState<SelectableListOption[]>([]);
  const { loading, data, error } = useSpotifyApi<
    SpotifyApi.UsersTopArtistsResponse
  >("me/top/artists?limit=50");

  const handleData = useCallback(() => {
    setOptions(
      data!.items.map(artist => ({
        label: artist.name,
        viewId: ViewOptions.artist.id,
        value: () => <ArtistView name={artist.name} id={artist.id} />
      }))
    );
  }, [data]);

  useEffect(() => {
    if (data?.items && !options.length && !error) {
      handleData();
    }
  }, [data, error, handleData, options.length]);

  const [index] = useScrollHandler(ViewOptions.topArtists.id, options);

  return (
    <SelectableList loading={loading} options={options} activeIndex={index} />
  );
};

export default TopArtistsView;
