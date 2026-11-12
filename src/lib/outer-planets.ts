import { createStore } from './store';
import { readJson, writeJson } from './storage';

const STORAGE_KEY = 'ksp_outer_planets';

/** Whether the bodies and the map of the Outer Planets Mod are shown. */
const outerPlanets = createStore<boolean>(
  readJson<boolean>(STORAGE_KEY) === true,
);

export const useOuterPlanets = outerPlanets.use;

/** The setting outside React. */
export const outerPlanetsEnabled = outerPlanets.get;

export function setOuterPlanets(enabled: boolean): void {
  writeJson(STORAGE_KEY, enabled);
  outerPlanets.set(enabled);
}
