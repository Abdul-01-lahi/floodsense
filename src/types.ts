export type Risk = "low" | "rising" | "critical";
export type FarmDecision =
  | "harvest_early"
  | "move_stored_produce"
  | "wait_and_watch";

export interface Round {
  round_id: number;
  district: string;
  season: string;
  week: number;
  conditions: {
    rainfall_7day_mm: number;
    rainfall_30day_mm: number;
    soil_moisture: number;
    upstream_rainfall_mm: number;
    cropland_share_pct: number;
  };
  model_risk: Risk;
  actual_outcome: "flood" | "no_flood";
  top_factors: string[];
  explanation: string;
}

export interface Trend {
  variable: string;
  unit: string;
  seasons: { season: string; value: number }[];
  trend: "increasing" | "decreasing" | "flat";
  significant: boolean;
  test: string;
  p_value: number;
}

export interface LeaderboardEntry {
  village: string;
  score: number;
}
