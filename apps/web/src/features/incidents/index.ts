// The incident feature's public entry point for other features (CLIENT_ARCHITECTURE §4): what
// Home needs to show the open incidents, with the same query and cache as the incident center.
export { incidentsQuery, type IncidentSummary } from "./api.ts";
export { Severity, mostUrgent, useIncidentWords } from "./IncidentState.tsx";
