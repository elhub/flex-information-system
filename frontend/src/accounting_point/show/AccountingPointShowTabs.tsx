import { Tabs } from "../../components/ui";
import {
  AccountingPoint,
  AccountingPointGridLocation,
} from "../../generated-client";
import {
  AccountingPointLocationMap,
  Substation,
} from "./AccountingPointLocationMap";
import { useAccountingPointShowTabsController } from "./useAccountingPointShowTabsController";

type Props = {
  gridLocation: AccountingPointGridLocation | undefined;
  location: AccountingPoint["location"];
  selectedSubstation: Substation | null;
  onSelectSubstation: (substation: Substation) => void;
  popupSubstation: Substation | null;
  onClosePopup: () => void;
};

// Presentational: RA (permissions/identity) and tab state live in
// useAccountingPointShowTabsController.
export const AccountingPointShowTabs = ({
  gridLocation,
  location,
  selectedSubstation,
  onSelectSubstation,
  popupSubstation,
  onClosePopup,
}: Props) => {
  const {
    tab,
    setTab,
    canViewLocation,
    canViewGrid,
    highlightedBusinessId,
    handleSubstationClick,
  } = useAccountingPointShowTabsController({
    gridLocation,
    selectedSubstation,
    onSelectSubstation,
  });

  return (
    <Tabs
      value={tab}
      onChange={setTab}
      className="relative top-[-24px] h-full flex flex-col"
    >
      <Tabs.List>
        <Tabs.Tab label="Location" value="location" />
      </Tabs.List>
      <Tabs.Panel value="location" className="flex-1 min-h-0">
        {canViewLocation && (
          <AccountingPointLocationMap
            location={location}
            canViewGrid={canViewGrid}
            onSubstationClick={handleSubstationClick}
            highlightedSubstationBusinessId={highlightedBusinessId}
            selectedSubstation={selectedSubstation}
            popupSubstation={popupSubstation}
            onClosePopup={onClosePopup}
          />
        )}
      </Tabs.Panel>
    </Tabs>
  );
};
