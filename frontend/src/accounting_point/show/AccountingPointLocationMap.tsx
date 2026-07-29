import { useCallback, useEffect, useRef, useState } from "react";
import Map, {
  FullscreenControl,
  Layer,
  Marker,
  Source,
  Popup,
} from "react-map-gl/maplibre";
import type { MapRef } from "react-map-gl/maplibre";
import { useQuery } from "@tanstack/react-query";
import type { FeatureCollection, LineString, Point, Polygon } from "geojson";
import { AccountingPoint } from "../../generated-client";
import { Button, Panel } from "../../components/ui";
import { elhubTheme } from "../../theme";
import { gridURL } from "../../httpConfig";
import { fetchJSON } from "../../util";
import { BoltIcon } from "./BoltIcon";

const OPENFREEMAP_STYLE = "https://tiles.openfreemap.org/styles/liberty";

// TODO: generate these types from a spec as we do for the data API

export type Substation = {
  id: number;
  name: string;
  business_id: string;
  kind: string;
  status: string;
  substation_cluster_id: number;
  substation_cluster: SubstationCluster | null;
  voltage_levels: number[];
  position: Point;
};

type SubstationCluster = {
  id: number;
  name: string;
  area: Polygon;
};

type Line = {
  id: number;
  name: string;
  line: LineString;
};

// --- GeoJSON builders ---

// GeoJSON feature collections from the grid entities, for rendering

// substation positions (for label layer)
const toSubstationFC = (items: Substation[]): FeatureCollection<Point> => ({
  type: "FeatureCollection",
  features: items.map((s) => ({
    type: "Feature",
    geometry: s.position,
    properties: { id: s.id, name: s.name },
  })),
});

// substation cluster area
const toSubstationClusterAreaFC = (
  items: SubstationCluster[],
): FeatureCollection<Polygon> => ({
  type: "FeatureCollection",
  features: items.map((sc) => ({
    type: "Feature",
    geometry: sc.area,
    properties: { id: sc.id, name: sc.name },
  })),
});

// transmission line
const toLineFC = (items: Line[]): FeatureCollection<LineString> => ({
  type: "FeatureCollection",
  features: items.map((l) => ({
    type: "Feature",
    geometry: l.line,
    properties: { id: l.id, name: l.name },
  })),
});

// hook getting the data

const useGridData = (location: AccountingPoint["location"]) => {
  // get nearby transformers for the AP with their cluster embedded
  const queryParams = new URLSearchParams({
    kind: "eq.transformer",
    status: "eq.active",
    order: "proximity",
    longitude: location?.coordinates[0].toString() ?? "",
    latitude: location?.coordinates[1].toString() ?? "",
    embed: "substation_cluster",
  });
  const nearTransformers = useQuery({
    queryKey: ["grid", "near_transformers", location],
    queryFn: () =>
      fetchJSON<Substation>(`${gridURL}/substation?${queryParams.toString()}`),
    enabled: !!location,
  });

  const clusterIds = nearTransformers.data
    ? [...new Set(nearTransformers.data.map((s) => s.substation_cluster_id))]
    : [];

  // fetch lines connecting those clusters
  const hasClusterIds = clusterIds.length > 0;
  const lines = useQuery({
    queryKey: ["grid", "near_lines", clusterIds],
    queryFn: () =>
      fetchJSON<Line>(
        `${gridURL}/line?status=eq.active&or=(from_substation_cluster_id.in.(${clusterIds.join(",")}),to_substation_cluster_id.in.(${clusterIds.join(",")}))`,
      ),
    enabled: hasClusterIds,
  });

  // extract the embedded clusters from the substation results
  const substationClusters = nearTransformers.data
    ? Object.values(
        Object.fromEntries(
          nearTransformers.data
            .filter((s) => s.substation_cluster != null)
            .map((s) => [s.substation_cluster!.id, s.substation_cluster!]),
        ),
      )
    : undefined;

  return { substations: nearTransformers, substationClusters, lines };
};

// component

type SubstationMarkerProps = {
  substation: Substation;
  isSelected: boolean;
  onMarkerClick: (substation: Substation) => void;
};

const SubstationMarker = ({
  substation,
  isSelected,
  onMarkerClick,
}: SubstationMarkerProps) => {
  const [longitude, latitude] = substation.position.coordinates;
  const primaryColor = elhubTheme.palette.primary.main;

  return (
    <Marker
      longitude={longitude}
      latitude={latitude}
      anchor="center"
      onClick={(e) => {
        e.originalEvent.stopPropagation();
        onMarkerClick(substation);
      }}
    >
      <div
        className="flex items-center justify-center rounded-full cursor-pointer transition-transform"
        style={{
          background: isSelected ? "white" : primaryColor,
          width: isSelected ? 36 : 28,
          height: isSelected ? 36 : 28,
          boxShadow: isSelected
            ? `0 0 0 2px ${primaryColor}, 0 2px 6px rgba(0,0,0,0.4)`
            : "0 1px 4px rgba(0,0,0,0.3)",
        }}
      >
        <BoltIcon
          style={{
            color: isSelected ? primaryColor : "white",
            width: isSelected ? 20 : 16,
            height: isSelected ? 20 : 16,
          }}
        />
      </div>
    </Marker>
  );
};

type SubstationInfoPopupProps = {
  substation: Substation;
  longitude: number;
  latitude: number;
  isAlreadySelected: boolean;
  onSelect: () => void;
  onClose: () => void;
};

const SubstationInfoPopup = ({
  substation,
  longitude,
  latitude,
  isAlreadySelected,
  onSelect,
  onClose,
}: SubstationInfoPopupProps) => (
  <Popup
    longitude={longitude}
    latitude={latitude}
    closeButton={false}
    closeOnClick={false}
    anchor="bottom"
    offset={20}
    onClose={onClose}
    maxWidth="280px"
  >
    <div className="p-1 flex flex-col gap-2 min-w-[220px]">
      <p className="text-sm font-bold text-center">{substation.name}</p>
      <table className="text-xs w-full border-separate border-spacing-y-0.5">
        <tbody>
          <tr>
            <td className="text-gray-500 pr-3 whitespace-nowrap">
              Business ID
            </td>
            <td className="font-medium text-right">{substation.business_id}</td>
          </tr>
          <tr>
            <td className="text-gray-500 pr-3 whitespace-nowrap">Kind</td>
            <td className="font-medium text-right">{substation.kind}</td>
          </tr>
          <tr>
            <td className="text-gray-500 pr-3 whitespace-nowrap">Status</td>
            <td className="font-medium text-right">{substation.status}</td>
          </tr>
          {substation.voltage_levels.length > 0 && (
            <tr>
              <td className="text-gray-500 pr-3 whitespace-nowrap">Voltage</td>
              <td className="font-medium text-right">
                {substation.voltage_levels.map((v) => `${v}kV`).join(", ")}
              </td>
            </tr>
          )}
        </tbody>
      </table>
      {isAlreadySelected ? (
        <p className="text-xs text-center text-gray-500 italic">
          Already set as grid location
        </p>
      ) : (
        <Button size="small" variant="primary" onClick={onSelect}>
          Select
        </Button>
      )}
    </div>
  </Popup>
);

type Props = {
  location: AccountingPoint["location"];
  canViewGrid: boolean;
  onSubstationClick?: (substation: Substation) => void;
  highlightedSubstationBusinessId?: string | null;
};

export const AccountingPointLocationMap = ({
  location,
  canViewGrid,
  onSubstationClick,
  highlightedSubstationBusinessId,
}: Props) => {
  const { substations, substationClusters, lines } = useGridData(
    canViewGrid ? location : undefined,
  );

  const apLon = location?.coordinates[0];
  const apLat = location?.coordinates[1];

  const mapRef = useRef<MapRef>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const [substationPopup, setSubstationPopup] = useState<{
    substation: Substation;
    longitude: number;
    latitude: number;
  } | null>(null);

  // grid location clicked: open info popup
  const handleSubstationMarkerClick = useCallback(
    (substation: Substation) => {
      if (!onSubstationClick) return;
      const [longitude, latitude] = substation.position.coordinates;
      setSubstationPopup({ substation, longitude, latitude });
    },
    [onSubstationClick],
  );

  const handleSelectSubstation = useCallback(async () => {
    if (!substationPopup) return;
    if (document.fullscreenElement) await document.exitFullscreen();
    onSubstationClick?.(substationPopup.substation);
    setSubstationPopup(null);
  }, [substationPopup, onSubstationClick]);

  const lastFittedIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    if (!mapLoaded) return;
    if (!highlightedSubstationBusinessId) return;
    if (highlightedSubstationBusinessId === lastFittedIdRef.current) return;
    if (apLon == null || apLat == null) return;
    const substation = substations.data?.find(
      (s) => s.business_id === highlightedSubstationBusinessId,
    );
    if (!substation) return;
    const [sLon, sLat] = substation.position.coordinates;
    mapRef.current?.fitBounds(
      [
        [Math.min(apLon, sLon), Math.min(apLat, sLat)],
        [Math.max(apLon, sLon), Math.max(apLat, sLat)],
      ],
      { padding: 80, maxZoom: 13 },
    );
    lastFittedIdRef.current = highlightedSubstationBusinessId;
  }, [
    mapLoaded,
    highlightedSubstationBusinessId,
    substations.data,
    apLon,
    apLat,
  ]);

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

  // grid data -> GeoJSON data

  const clusterAreaFC =
    canViewGrid && substationClusters
      ? toSubstationClusterAreaFC(substationClusters)
      : null;

  const lineFC = canViewGrid && lines.data ? toLineFC(lines.data) : null;

  // TODO: better colors?
  const clusterAreaColor = elhubTheme.palette.error.main;
  const lineColor = elhubTheme.palette.primary.main;

  const nearSubstations =
    canViewGrid && substations.data ? substations.data : [];

  const substationFC =
    nearSubstations.length > 0 ? toSubstationFC(nearSubstations) : null;

  return (
    <Panel border className="bg-white overflow-hidden p-0">
      <Map
        ref={mapRef}
        initialViewState={{ longitude, latitude, zoom: 13 }}
        style={{ width: "100%", height: 400 }}
        mapStyle={OPENFREEMAP_STYLE}
        onLoad={() => setMapLoaded(true)}
        onClick={() => setSubstationPopup(null)}
      >
        <FullscreenControl position="top-right" />
        {/* lines between clusters */}
        {lineFC && (
          <Source id="grid-lines" type="geojson" data={lineFC}>
            <Layer
              id="grid-lines-layer"
              type="line"
              paint={{
                "line-color": lineColor,
                "line-width": 2,
              }}
            />
          </Source>
        )}

        {/* cluster area */}
        {clusterAreaFC && (
          <Source id="grid-cluster-areas" type="geojson" data={clusterAreaFC}>
            <Layer
              id="grid-cluster-areas-layer"
              type="fill"
              paint={{
                "fill-color": clusterAreaColor,
                "fill-opacity": 0.2,
              }}
            />
            <Layer
              id="grid-cluster-areas-outline-layer"
              type="line"
              paint={{
                "line-color": clusterAreaColor,
                "line-width": 1,
              }}
            />
          </Source>
        )}

        {/* substation markers */}
        {nearSubstations.map((s) => (
          <SubstationMarker
            key={s.id}
            substation={s}
            isSelected={s.business_id === highlightedSubstationBusinessId}
            onMarkerClick={handleSubstationMarkerClick}
          />
        ))}

        {/* substation name labels via symbol layer — MapLibre handles collision avoidance */}
        {substationFC && (
          <Source
            id="grid-substation-labels"
            type="geojson"
            data={substationFC}
          >
            <Layer
              id="grid-substation-labels-layer"
              type="symbol"
              layout={{
                "text-field": ["get", "name"],
                "text-font": ["Noto Sans Regular"],
                "text-size": 11,
                "text-anchor": "bottom",
                "text-offset": [0, -1.8],
                "text-allow-overlap": false,
                "text-ignore-placement": false,
              }}
              paint={{
                "text-color": elhubTheme.palette.primary.main,
                "text-halo-color": "white",
                "text-halo-width": 1,
              }}
            />
          </Source>
        )}

        {/* info popup on substation click */}
        {substationPopup && onSubstationClick && (
          <SubstationInfoPopup
            substation={substationPopup.substation}
            longitude={substationPopup.longitude}
            latitude={substationPopup.latitude}
            isAlreadySelected={
              substationPopup.substation.business_id ===
              highlightedSubstationBusinessId
            }
            onSelect={handleSelectSubstation}
            onClose={() => setSubstationPopup(null)}
          />
        )}

        {/* the accounting point's geographical location */}
        <Marker
          longitude={longitude}
          latitude={latitude}
          color={elhubTheme.palette.primary.main}
        />
      </Map>
    </Panel>
  );
};
