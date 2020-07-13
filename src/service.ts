
import { SCR } from "./scr.interface";
import request from "request-promise";
import { Element } from "./osm.interface";
import { RootObject } from "./osm_xml.interface";
import * as osmconvert from 'osmtogeojson';
import { DOMParser } from 'xmldom';


export const find = async (id: string): Promise<SCR> => {
  
  const BASE_URL: string = process.env.BASE_URL as string;

  const url = BASE_URL + `/api/0.6/node/` + id;

  const response = await request(url);
  const respXml = new DOMParser().parseFromString(response, 'application/xml');
  const respGeoJson : RootObject = <RootObject>osmconvert.default(respXml);

  const scr: SCR = {
      id: respGeoJson.features[0].properties.id.replace('node/',''),
      type: "scr",
      geopose: {north: respGeoJson.features[0].geometry.coordinates[1], east: respGeoJson.features[0].geometry.coordinates[0], vertical: respGeoJson.features[0].properties.geopose_vertical, qNorth: respGeoJson.features[0].properties.geopose_qNorth, qEast: respGeoJson.features[0].properties.geopose_qEast, qVertical: respGeoJson.features[0].properties.geopose_qVertical, qW: respGeoJson.features[0].properties.geopose_qW},
      url: respGeoJson.features[0].properties.url,
      timestamp: respGeoJson.features[0].properties.timestamp
  };

  if (scr) {
    return scr;
  }

  throw new Error("No record found");
};


export const findBbox = async (bbox: string): Promise<SCR[]> => {

  const BASE_URL: string = process.env.BASE_URL as string;

  const url = BASE_URL + `/api/0.6/map?bbox=` + bbox;

  const options = {
      uri: url,
      headers: {
          'Accept': 'application/json'
      },
  };

  const response = JSON.parse(await request(options));

  const mapResponse = (response: Element[]) => response.map((p) => ({
    id: p.id,
    type: "scr",
    geopose: {north: p.lat, east: p.lon, vertical: p.tags.geopose_vertical, qNorth: p.tags.geopose_qNorth, qEast: p.tags.geopose_qEast, qVertical: p.tags.geopose_qVertical, qW: p.tags.geopose_qW},
    url: p.tags.url,
    timestamp: p.timestamp,
  }));

  const scrs: SCR[] = mapResponse(response.elements);

  return scrs;
};