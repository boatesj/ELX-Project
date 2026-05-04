import { useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const PORTS = [
  {
    id: "felixstowe",
    name: "Felixstowe",
    country: "United Kingdom",
    type: "Origin",
    description:
      "UK's largest container port. Primary departure point for FCL cargo to West Africa.",
    coords: [1.3513, 51.9614],
    flag: "🇬🇧",
  },
  {
    id: "tilbury",
    name: "Tilbury",
    country: "United Kingdom",
    type: "Origin",
    description:
      "Key RoRo and container port near Grays, Essex. Close to our consolidation facility.",
    coords: [0.3519, 51.4613],
    flag: "🇬🇧",
  },
  {
    id: "southampton",
    name: "Southampton",
    country: "United Kingdom",
    type: "Origin",
    description:
      "Major RoRo departure point for vehicles shipping to West Africa.",
    coords: [-1.4042, 50.9006],
    flag: "🇬🇧",
  },
  {
    id: "grimsby",
    name: "Grimsby",
    country: "United Kingdom",
    type: "Origin",
    description:
      "RoRo port for vehicle exports, particularly to Ghana and Nigeria.",
    coords: [-0.0677, 53.5735],
    flag: "🇬🇧",
  },
  {
    id: "tema",
    name: "Tema Port",
    country: "Ghana",
    type: "Destination",
    description:
      "Ghana's principal deep-water port. Our primary West Africa destination — containers, RoRo, and institutional cargo.",
    coords: [-0.0077, 5.6441],
    flag: "🇬🇭",
  },
  {
    id: "accra",
    name: "Accra International Airport",
    country: "Ghana",
    type: "Destination",
    description:
      "Air freight destination for urgent and time-critical cargo to Ghana.",
    coords: [-0.1719, 5.6052],
    flag: "🇬🇭",
  },
  {
    id: "lagos",
    name: "Apapa Port (Lagos)",
    country: "Nigeria",
    type: "Destination",
    description:
      "Nigeria's main container and RoRo port. We ship to Apapa and Tin Can Island.",
    coords: [3.3792, 6.4432],
    flag: "🇳🇬",
  },
  {
    id: "mombasa",
    name: "Mombasa Port",
    country: "Kenya",
    type: "Destination",
    description:
      "East Africa gateway. We handle cargo to Mombasa for onward distribution across Kenya and the region.",
    coords: [39.6682, -4.0435],
    flag: "🇰🇪",
  },
  {
    id: "freetown",
    name: "Freetown",
    country: "Sierra Leone",
    type: "Destination",
    description:
      "We serve Freetown for container and document shipments on request.",
    coords: [-13.2317, 8.4657],
    flag: "🇸🇱",
  },
  {
    id: "abidjan",
    name: "Abidjan",
    country: "Côte d'Ivoire",
    type: "Destination",
    description: "Francophone West Africa gateway. Available on request.",
    coords: [-4.0083, 5.3364],
    flag: "🇨🇮",
  },
];

const ORIGIN_COLOUR = "#FFA500";
const DESTINATION_COLOUR = "#38BDF8";

const ShipmentMap = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);

  useEffect(() => {
    if (!mapContainer.current || map.current || !mapboxgl.accessToken) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [-10, 25],
      zoom: 2.4,
      minZoom: 1.5,
      maxZoom: 10,
      projection: "mercator",
    });

    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    map.current.on("load", () => {
      const origins = PORTS.filter((port) => port.type === "Origin");
      const destinations = PORTS.filter((port) => port.type === "Destination");

      const routeFeatures = origins.flatMap((origin) =>
        destinations.map((destination) => ({
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: [origin.coords, destination.coords],
          },
          properties: {
            origin: origin.name,
            destination: destination.name,
          },
        })),
      );

      map.current.addSource("routes", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: routeFeatures,
        },
      });

      map.current.addLayer({
        id: "routes-layer",
        type: "line",
        source: "routes",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": ORIGIN_COLOUR,
          "line-width": 0.6,
          "line-opacity": 0.18,
          "line-dasharray": [3, 4],
        },
      });

      PORTS.forEach((port) => {
        const isOrigin = port.type === "Origin";
        const colour = isOrigin ? ORIGIN_COLOUR : DESTINATION_COLOUR;

        const markerElement = document.createElement("div");

        markerElement.style.cssText = `
          width: ${isOrigin ? "12px" : "14px"};
          height: ${isOrigin ? "12px" : "14px"};
          border-radius: 50%;
          background: ${colour};
          border: 2px solid #0B141A;
          box-shadow: 0 0 0 3px ${colour}33;
          cursor: pointer;
          transition: transform 0.15s ease;
        `;

        markerElement.addEventListener("mouseenter", () => {
          markerElement.style.transform = "scale(1.4)";
        });

        markerElement.addEventListener("mouseleave", () => {
          markerElement.style.transform = "scale(1)";
        });

        const popup = new mapboxgl.Popup({
          offset: 16,
          closeButton: false,
          maxWidth: "240px",
          className: "elx-popup",
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
            <p style="margin:0;font-size:11px;color:#9A9EAB;line-height:1.5;">
              ${port.description}
            </p>
          </div>
        `);

        new mapboxgl.Marker(markerElement)
          .setLngLat(port.coords)
          .setPopup(popup)
          .addTo(map.current);
      });
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  return (
    <div className="bg-[#0B141A] min-h-screen">
      <Helmet>
        <title>Africa Shipment Map | Ellcworth Express Ltd</title>
        <meta
          name="description"
          content="Ellcworth Express port connections — UK departure points and West Africa destinations including Tema, Lagos, Mombasa and more."
        />
        <link rel="canonical" href="https://www.ellcworth.com/map" />
      </Helmet>

      <section className="relative w-full bg-[#1A2930] text-white py-16 md:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(255,165,0,0.08),transparent_60%)]" />

        <div className="relative mx-auto max-w-4xl px-4 md:px-6 lg:px-8">
          <span className="inline-flex items-center rounded-full border border-[#FFA500] bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-100 mb-5">
            Live Network
          </span>

          <h1 className="text-3xl md:text-4xl font-semibold uppercase mb-4">
            Our port connections
          </h1>

          <p className="text-gray-300 max-w-xl text-base md:text-lg leading-relaxed">
            UK departure ports and West Africa destinations. Click any marker
            for details.
          </p>

          <div className="flex flex-wrap gap-6 mt-6">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#FFA500] inline-block" />
              <span className="text-sm text-gray-300">UK origin ports</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#38BDF8] inline-block" />
              <span className="text-sm text-gray-300">Africa destinations</span>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full h-[600px]">
        <div ref={mapContainer} className="w-full h-full" />
      </section>

      <section className="py-16 bg-[#0B141A]">
        <div className="mx-auto max-w-4xl px-4 md:px-6 lg:px-8">
          <h2 className="text-xl font-semibold uppercase text-white mb-8">
            All ports &amp; connections
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            {PORTS.map((port) => {
              const isOrigin = port.type === "Origin";
              const colour = isOrigin ? ORIGIN_COLOUR : DESTINATION_COLOUR;

              return (
                <div
                  key={port.id}
                  className="rounded-2xl border border-white/10 bg-[#1A2930] px-5 py-5 flex gap-4"
                >
                  <span className="text-2xl flex-shrink-0">{port.flag}</span>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-white text-sm">
                        {port.name}
                      </p>

                      <span
                        className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
                        style={{
                          color: colour,
                          background: `${colour}18`,
                          border: `1px solid ${colour}44`,
                        }}
                      >
                        {port.type}
                      </span>
                    </div>

                    <p className="text-xs text-[#9A9EAB] leading-relaxed">
                      {port.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-12 bg-[#1A2930]">
        <div className="mx-auto max-w-4xl px-4 md:px-6 lg:px-8 text-center">
          <h2 className="text-xl md:text-2xl font-semibold uppercase text-white mb-3">
            Shipping to one of these ports?
          </h2>

          <p className="text-gray-300 text-sm mb-6">Get a quote in 24 hours.</p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:cs@ellcworth.com"
              className="inline-flex items-center justify-center rounded-full bg-[#FFA500] text-black px-8 py-3 text-sm font-semibold tracking-[0.14em] uppercase hover:bg-[#ffb733] transition shadow-md"
            >
              cs@ellcworth.com
            </a>

            <a
              href="/#quote"
              className="inline-flex items-center justify-center rounded-full border border-white/30 bg-white/5 text-white px-8 py-3 text-sm font-semibold tracking-[0.14em] uppercase hover:bg-white/10 transition"
            >
              Get a Quote
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ShipmentMap;
