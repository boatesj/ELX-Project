"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

// token set in useEffect

export const PORTS = [
  { id: "felixstowe",     name: "Felixstowe",               country: "United Kingdom", type: "Origin",      description: "UK's largest container port. Primary departure point for FCL cargo to West Africa.",                                    coords: [1.3513,   51.9614], flag: "🇬🇧" },
  { id: "tilbury",        name: "Tilbury",                  country: "United Kingdom", type: "Origin",      description: "Key RoRo and container port near Grays, Essex. Close to our consolidation facility.",                                   coords: [0.3519,   51.4613], flag: "🇬🇧" },
  { id: "southampton",    name: "Southampton",               country: "United Kingdom", type: "Origin",      description: "Major RoRo departure point for vehicles shipping to West Africa.",                                                       coords: [-1.4042,  50.9006], flag: "🇬🇧" },
  { id: "grimsby",        name: "Grimsby",                  country: "United Kingdom", type: "Origin",      description: "RoRo port for vehicle exports, particularly to Ghana and Nigeria.",                                                      coords: [-0.0677,  53.5735], flag: "🇬🇧" },
  { id: "london-gateway", name: "London Gateway",           country: "United Kingdom", type: "Origin",      description: "Modern deep-water container terminal on the Thames. Key FCL departure point for West Africa.",                           coords: [0.4731,   51.5074], flag: "🇬🇧" },
  { id: "sheerness",      name: "Sheerness",                country: "United Kingdom", type: "Origin",      description: "RoRo port on the Isle of Sheppey, Kent. Regular vehicle sailings to West Africa.",                                      coords: [0.7596,   51.4425], flag: "🇬🇧" },
  { id: "teesport",       name: "Teesport",                 country: "United Kingdom", type: "Origin",      description: "RoRo and container port in the North East. Serves vehicle exports to West Africa.",                                     coords: [-1.1427,  54.5974], flag: "🇬🇧" },
  { id: "tema",           name: "Tema Port",                country: "Ghana",          type: "Destination", description: "Ghana's principal deep-water port. Our primary West Africa destination — containers, RoRo, and institutional cargo.",    coords: [-0.0077,  5.6441],  flag: "🇬🇭" },
  { id: "accra",          name: "Accra International Airport", country: "Ghana",       type: "Destination", description: "Air freight destination for urgent and time-critical cargo to Ghana.",                                                   coords: [-0.1719,  5.6052],  flag: "🇬🇭" },
  { id: "lagos",          name: "Apapa Port (Lagos)",       country: "Nigeria",        type: "Destination", description: "Nigeria's main container and RoRo port. We ship to Apapa and Tin Can Island.",                                          coords: [3.3792,   6.4432],  flag: "🇳🇬" },
  { id: "mombasa",        name: "Mombasa Port",             country: "Kenya",          type: "Destination", description: "East Africa gateway. We handle cargo to Mombasa for onward distribution across Kenya and the region.",                   coords: [39.6682, -4.0435],  flag: "🇰🇪" },
  { id: "freetown",       name: "Freetown",                 country: "Sierra Leone",   type: "Destination", description: "We serve Freetown for container and document shipments on request.",                                                     coords: [-13.2317, 8.4657],  flag: "🇸🇱" },
  { id: "abidjan",        name: "Abidjan",                  country: "Côte d'Ivoire", type: "Destination", description: "Francophone West Africa gateway. Available on request.",                                                                coords: [-4.0083,  5.3364],  flag: "🇨🇮" },
];

export const ORIGIN_COLOUR      = "#FFA500";
export const DESTINATION_COLOUR = "#38BDF8";



const MapEmbed = ({ height = "500px", zoom = 2.4, center = [-10, 25] as [number, number] }: { height?: string; zoom?: number; center?: [number, number] }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!mapContainer.current || map.current || !token) return;
    mapboxgl.accessToken = token;

    map.current = new mapboxgl.Map({
      container:  mapContainer.current,
      style:      "mapbox://styles/mapbox/dark-v11",
      center,
      zoom,
      minZoom:    1.5,
      maxZoom:    10,
      projection: { name: "mercator" },
    });

    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    map.current.on("load", () => {
      if (!map.current) return;
      const origins = PORTS.filter((p) => p.type === "Origin");
      const destinations = PORTS.filter((p) => p.type === "Destination");

      const routeFeatures = origins.flatMap((o) =>
        destinations.map((d) => ({
          type: "Feature" as const,
          geometry: { type: "LineString" as const, coordinates: [o.coords, d.coords] },
          properties: { origin: o.name, destination: d.name },
        }))
      );

      map.current.addSource("routes", {
        type: "geojson",
        data: { type: "FeatureCollection", features: routeFeatures },
      });

      map.current.addLayer({
        id:     "routes-layer",
        type:   "line",
        source: "routes",
        layout: { "line-join": "round", "line-cap": "round" },
        paint:  {
          "line-color":     ORIGIN_COLOUR,
          "line-width":     0.6,
          "line-opacity":   0.18,
          "line-dasharray": [3, 4],
        },
      });

      PORTS.forEach((port) => {
        const isOrigin = port.type === "Origin";
        const colour   = isOrigin ? ORIGIN_COLOUR : DESTINATION_COLOUR;
        const el       = document.createElement("div");

        el.style.cssText = `
          width: ${isOrigin ? "12px" : "14px"};
          height: ${isOrigin ? "12px" : "14px"};
          border-radius: 50%;
          background: ${colour};
          border: 2px solid #0B141A;
          box-shadow: 0 0 0 3px ${colour}33;
          cursor: pointer;
          transition: transform 0.15s ease;
        `;

        el.addEventListener("mouseenter", () => { el.style.transform = "scale(1.4)"; });
        el.addEventListener("mouseleave", () => { el.style.transform = "scale(1)"; });

        const popup = new mapboxgl.Popup({
          offset: 16, closeButton: false, maxWidth: "240px", className: "elx-popup",
        }).setHTML(`
          <div style="padding:10px 12px;background:#1A2930;border-radius:10px;border:1px solid rgba(255,255,255,0.1);">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
              <span style="font-size:18px;">${port.flag}</span>
              <div>
                <p style="margin:0;font-size:13px;font-weight:700;color:#fff;">${port.name}</p>
                <p style="margin:0;font-size:10px;color:${colour};text-transform:uppercase;letter-spacing:0.1em;font-weight:600;">
                  ${port.type} · ${port.country}
                </p>
              </div>
            </div>
            <p style="margin:0;font-size:11px;color:#9A9EAB;line-height:1.5;">${port.description}</p>
          </div>
        `);

        new mapboxgl.Marker(el).setLngLat(port.coords as [number, number]).setPopup(popup).addTo(map.current!);
      });
    });

    return () => { map.current?.remove(); map.current = null; };
  }, []);

  return <div ref={mapContainer} style={{ width: "100%", height }} />;
};

export default MapEmbed;
