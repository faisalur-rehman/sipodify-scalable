import React, {useCallback} from 'react';

import ViewOptions from 'App/views';
import { SelectableList, SelectableListOption } from 'components';
import {useEventListener, useMenuHideWindow, useScrollHandler} from 'hooks';
import styled from 'styled-components';
//

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;
//
// const Image = styled.img`
//   height: ${Unit.XL};
//   width: auto;
//   margin: ${Unit.XS};
// `;
//
// const TitleContainer = styled.div`
//   display: flex;
//   justify-content: center;
//   align-items: center;
//   padding: ${Unit.MD} ${Unit.MD} 0;
// `;
//
// const Title = styled.h3`
//   margin: 0;
//   font-size: 16px;
//   font-weight: 900;
// `;
//
// const Description = styled.h3`
//   margin: 0 0 ${Unit.MD};
//   font-size: 14px;
//   font-weight: normal;
//   text-align: center;
// `;

const ListContainer = styled.div`
  flex: 1;
`;

const ThemeView = () => {
  useMenuHideWindow(ViewOptions.themeChange.id);
  const options: SelectableListOption[] = [
    {
      label: "Black",
      value: "Black",
    },
    {
      label: "White",
      value: "White",
    },
    {
      label: "Red",
      value: "Red",
    }

  ];

  const [index] = useScrollHandler(ViewOptions.themeChange.id, options);

  const selectTheme = useCallback(() => {
    console.log("ThemeChanged:"+index+":"+options[index].value);
    const changeThemeEvent = new CustomEvent("changeTheme", {
      "detail": {value:options[index].value}
    });
    localStorage.setItem("theme",changeThemeEvent.detail.value);

    window.dispatchEvent(changeThemeEvent);
  }, [index,options]);

  useEventListener("centerclick", selectTheme);

  return (
    <Container>
      <ListContainer>
        <SelectableList options={options} activeIndex={index} />
      </ListContainer>
    </Container>
  );
};

export default ThemeView;
