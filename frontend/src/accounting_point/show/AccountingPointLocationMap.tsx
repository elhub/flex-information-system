import { useCallback, useState } from "react";
import Map, { Layer, Marker, Source, Popup } from "react-map-gl/maplibre";
import { useQuery } from "@tanstack/react-query";
import type { FeatureCollection, LineString, Point, Polygon } from "geojson";
import { AccountingPoint } from "../../generated-client";
import { Panel } from "../../components/ui";
import { elhubTheme } from "../../theme";
import { gridURL } from "../../httpConfig";
import type { MapLayerMouseEvent } from "react-map-gl/maplibre";
import { fetchJSON } from "../../util";

const OPENFREEMAP_STYLE = "https://tiles.openfreemap.org/styles/liberty";

// TODO: generate these types from a spec as we do for the data API

export type Substation = {
  id: number;
  name: string;
  business_id: string;
  substation_cluster_id: number;
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

// substation position
const toSubstationFC = (items: Substation[]): FeatureCollection<Point> => ({
  type: "FeatureCollection",
  features: items.map((s) => ({
    type: "Feature",
    geometry: s.position,
    properties: {
      id: s.id,
      name: s.name,
      business_id: s.business_id,
    },
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

// line
const toLineFC = (items: Line[]): FeatureCollection<LineString> => ({
  type: "FeatureCollection",
  features: items.map((l) => ({
    type: "Feature",
    geometry: l.line,
    properties: { id: l.id, name: l.name },
  })),
});

// hook getting the data

// TODO: replace with embeddings when supported?

const useGridData = (location: AccountingPoint["location"]) => {
  // get nearby transformers for the AP
  const queryParams = new URLSearchParams({
    kind: "eq.transformer",
    status: "eq.active",
    order: "proximity",
    longitude: location?.coordinates[0].toString() ?? "",
    latitude: location?.coordinates[1].toString() ?? "",
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

  // fetch clusters and lines connecting them
  const hasClusterIds = clusterIds.length > 0;
  const substationClusters = useQuery({
    queryKey: ["grid", "near_substation_clusters", clusterIds],
    queryFn: () =>
      fetchJSON<SubstationCluster>(
        `${gridURL}/substation_cluster?id=in.(${clusterIds.join(",")})&status=eq.active`,
      ),
    enabled: hasClusterIds,
  });

  const lines = useQuery({
    queryKey: ["grid", "near_lines", clusterIds],
    queryFn: () =>
      fetchJSON<Line>(
        `${gridURL}/line?status=eq.active&or=(from_substation_cluster_id.in.(${clusterIds.join(",")}),to_substation_cluster_id.in.(${clusterIds.join(",")}))`,
      ),
    enabled: hasClusterIds,
  });

  return { substations: nearTransformers, substationClusters, lines };
};

// component

type Props = {
  location: AccountingPoint["location"];
  canViewGrid: boolean;
  onSubstationClick?: (substation: Substation) => void;
};

export const AccountingPointLocationMap = ({
  location,
  canViewGrid,
  onSubstationClick,
}: Props) => {
  const { substations, substationClusters, lines } = useGridData(
    canViewGrid ? location : undefined,
  );

  const [hoveredSubstation, setHoveredSubstation] = useState<{
    name: string;
    longitude: number;
    latitude: number;
  } | null>(null);

  // transformer clicked: find its ID and bubble up to parent component
  // so that the edit form gets filled automatically
  const handleSubstationClick = useCallback(
    (e: MapLayerMouseEvent) => {
      if (!onSubstationClick || !substations.data) return;
      const feature = e.features?.[0];
      if (!feature) return;
      const substation = substations.data.find(
        (s) => s.id === feature.properties?.id,
      );
      if (substation) onSubstationClick(substation);
    },
    [onSubstationClick, substations.data],
  );

  // show popup on hover with substation name
  const handleSubstationMouseEnter = useCallback((e: MapLayerMouseEvent) => {
    const feature = e.features?.[0];
    if (!feature?.geometry || feature.geometry.type !== "Point") return;
    setHoveredSubstation({
      name: feature.properties?.name ?? "",
      longitude: feature.geometry.coordinates[0],
      latitude: feature.geometry.coordinates[1],
    });
  }, []);

  const handleSubstationMouseLeave = useCallback(() => {
    setHoveredSubstation(null);
  }, []);

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

  const substationFC =
    canViewGrid && substations.data ? toSubstationFC(substations.data) : null;

  const clusterAreaFC =
    canViewGrid && substationClusters.data
      ? toSubstationClusterAreaFC(substationClusters.data)
      : null;

  const lineFC = canViewGrid && lines.data ? toLineFC(lines.data) : null;

  // can only interact with transformers
  const interactiveLayerIds = onSubstationClick
    ? ["grid-substations-layer"]
    : [];

  // TODO: better colors?
  const transformerStrokeColor = elhubTheme.palette.primary.main;
  const transformerColor = elhubTheme.palette.primary.contrastText;
  const clusterAreaColor = elhubTheme.palette.error.main;
  const lineColor = elhubTheme.palette.primary.main;

  return (
    <Panel border className="bg-white overflow-hidden p-0">
      <Map
        initialViewState={{ longitude, latitude, zoom: 13 }}
        style={{ width: "100%", height: 400 }}
        mapStyle={OPENFREEMAP_STYLE}
        interactiveLayerIds={interactiveLayerIds}
        onClick={handleSubstationClick}
        onMouseEnter={handleSubstationMouseEnter}
        onMouseLeave={handleSubstationMouseLeave}
        cursor={hoveredSubstation ? "pointer" : undefined}
      >
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

        {/* transformers */}
        {substationFC && (
          <Source id="grid-substations" type="geojson" data={substationFC}>
            <Layer
              id="grid-substations-layer"
              type="circle"
              paint={{
                "circle-radius": 5,
                "circle-color": transformerColor,
                "circle-stroke-width": 1,
                "circle-stroke-color": transformerStrokeColor,
              }}
            />
          </Source>
        )}

        {/* popup to show transformer name */}
        {hoveredSubstation && (
          <Popup
            longitude={hoveredSubstation.longitude}
            latitude={hoveredSubstation.latitude}
            closeButton={false}
            closeOnClick={false}
            anchor="bottom"
            offset={8}
          >
            <div className="text-xs font-medium">{hoveredSubstation.name}</div>
          </Popup>
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
