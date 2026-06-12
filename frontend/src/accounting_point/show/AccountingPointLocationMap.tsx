import Map, { Marker } from "react-map-gl/maplibre";
import { AccountingPoint } from "../../generated-client";
import { Panel } from "../../components/ui";
import { elhubTheme } from "../../theme";

const OPENFREEMAP_STYLE = "https://tiles.openfreemap.org/styles/liberty";

type Props = {
  location: AccountingPoint["location"];
};

export const AccountingPointLocationMap = ({ location }: Props) => {
  if (!location?.coordinates) {
    return (
      <Panel border className="bg-white p-4">
        <p className="text-sm text-gray-500">
          No location set for this accounting point.
        </p>
      </Panel>
    );
  }

  const [longitude, latitude] = location.coordinates;

  return (
    <Panel border className="bg-white overflow-hidden p-0">
      <Map
        initialViewState={{ longitude, latitude, zoom: 13 }}
        style={{ width: "100%", height: 400 }}
        mapStyle={OPENFREEMAP_STYLE}
      >
        <Marker
          longitude={longitude}
          latitude={latitude}
          color={elhubTheme.palette.primary.main}
        />
      </Map>
    </Panel>
  );
};
