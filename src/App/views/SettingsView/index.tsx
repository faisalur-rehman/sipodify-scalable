import React from "react";

import { PREVIEW } from "App/previews";
import ViewOptions, { AboutView } from "App/views";
import { SelectableList, SelectableListOption } from "components";
import { useMenuHideWindow, useScrollHandler } from "hooks";
import ThemeView from "../ThemeView";

const SettingsView = () => {
  useMenuHideWindow(ViewOptions.settings.id);
  const options: SelectableListOption[] = [
    {
      label: "About",
      value: () => <AboutView />,
      viewId: ViewOptions.about.id,
      preview: PREVIEW.SETTINGS
    },
    {
      label: "Change Theme",
      value: () => <ThemeView />,
      viewId: ViewOptions.themeChange.id,
      preview: PREVIEW.SETTINGS
    }
  ];

  const [index] = useScrollHandler(ViewOptions.settings.id, options);

  return <SelectableList options={options} activeIndex={index} />;
};

export default SettingsView;
