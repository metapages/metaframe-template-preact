import {
  HStack,
  IconButton,
  Show,
  Spacer,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from "@chakra-ui/react";
import { HamburgerIcon, ViewIcon, EditIcon, InfoIcon } from "@chakra-ui/icons";
import { useHashParamBoolean } from "@metapages/hash-query";
import { useCallback } from "react";
import { PanelHelp } from "/@/components/PanelHelp";
import { PanelOptions } from "/@/components/PanelOptions";
import { PanelMain } from "/@/components/PanelMain";
import "/@/app.css";
import { useMetaframeInputsPassthrough } from "/@/hooks/useMetaframeInputsPassthrough";

export const App: React.FC = () => {
  const [hideMenu, sethideMenu] = useHashParamBoolean("hidemenu");
  const toggleMenu = useCallback(() => {
    sethideMenu(!hideMenu);
  }, [hideMenu, sethideMenu]);
  useMetaframeInputsPassthrough();

  const ButtonTabsToggle = (
    <IconButton
      aria-label="options"
      variant="ghost"
      onClick={toggleMenu}
      icon={<HamburgerIcon />}
    />
  );

  if (hideMenu) {
    return (
      <>
        <HStack
          style={{ position: "absolute" }}
          width="100%"
          justifyContent="flex-end"
        >
          <Spacer />
          <Show breakpoint="(min-width: 200px)">{ButtonTabsToggle}</Show>
        </HStack>
        <PanelMain />
      </>
    );
  }
  return (
    <Tabs>
      <TabList>
        <Tab>
          <ViewIcon /> &nbsp; Inputs
        </Tab>
        <Tab>
          <EditIcon /> &nbsp; Options
        </Tab>
        <Tab>
          <InfoIcon />
          &nbsp; Help
        </Tab>
        <Spacer /> {ButtonTabsToggle}
      </TabList>

      <TabPanels>
        <TabPanel>
          <PanelMain />
        </TabPanel>
        <TabPanel>
          <PanelOptions />
        </TabPanel>
        <TabPanel>
          <PanelHelp />
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
};
