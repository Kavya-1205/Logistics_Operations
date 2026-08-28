export interface DatasetSummary {
  valid: boolean;
  filename: string;
  total_records: number;
  initial_rows: number;
  facilities: string[];
  shifts: string[];
  years: number[];
  months: number[];
  date_min: string;
  date_max: string;
  is_hourly: boolean;
  missing_values_handled: number;
  sample_preview: Array<{
    date: string;
    facility: string;
    shift: string;
    inbound_volume: number;
    outbound_volume: number;
    inventory_volume: number;
    available_workers: number;
    throughput: number;
  }>;
  errors?: string[];
}

export interface FilterState {
  year?: number | null;
  month?: number | null;
  facility?: string;
  shift?: string;
  horizon_days?: number;
  volume_multiplier?: number;
  worker_multiplier?: number;
  enable_overtime?: boolean;
}

export interface ForecastSummary {
  total_inbound: number;
  total_outbound: number;
  total_forecast_volume: number;
  inbound_trend_pct: number;
  outbound_trend_pct: number;
  next_day_inbound: number;
  next_day_outbound: number;
}

export interface InventoryMovement {
  current_inventory: number;
  expected_inventory: number;
  change_pct: number;
  status: "increasing" | "reducing" | "stable" | string;
  message: string;
}

export interface PeakRisk {
  peak_date: string;
  peak_volume: number;
  normal_average: number;
  surge_pct: number;
  is_high_volume: boolean;
}

export interface CapacityImpact {
  hub_capacity: number;
  peak_forecast: number;
  utilization_pct: number;
  is_shortage: boolean;
  shortage_packages: number;
}

export interface TimelinePoint {
  date: string;
  type: "actual" | "forecast";
  actual_inbound?: number | null;
  actual_outbound?: number | null;
  actual_total?: number | null;
  pred_inbound?: number | null;
  pred_outbound?: number | null;
  pred_total?: number | null;
}

export interface ForecastPoint {
  date: string;
  type: "forecast";
  inbound: number;
  outbound: number;
  inventory: number;
  total_volume: number;
  inbound_lower?: number;
  inbound_upper?: number;
  outbound_lower?: number;
  outbound_upper?: number;
}

export interface ModelMetrics {
  xgboost_mae: number;
  baseline_mae: number;
  xgboost_rmse?: number;
  xgboost_mape?: number;
  accuracy_improvement_pct: number;
}

export interface ForecastResponse {
  facility: string;
  horizon_days: number;
  anchor_date?: string;
  summary: ForecastSummary;
  inventory: InventoryMovement;
  peak_risk: PeakRisk;
  capacity_impact: CapacityImpact;
  metrics: ModelMetrics;
  forecast: ForecastPoint[];
  combined_timeline: TimelinePoint[];
}

export interface ShiftWorkforce {
  shift: string;
  volume: number;
  required_workers: number;
  available_workers: number;
  gap: number;
  status: "shortage" | "surplus" | "optimal" | string;
}

export interface StaffingRecommendation {
  type: string;
  icon: string;
  title: string;
  description: string;
}

export interface DailyCapacityPoint {
  day: string;
  forecast_volume: number;
  workforce_capacity: number;
  utilization_pct: number;
  status: "normal" | "near_limit" | "shortage" | string;
}

export interface PlanningAlert {
  severity: "critical" | "warning" | "optimal" | string;
  message: string;
}

export interface WorkforcePlan {
  facility: string;
  horizon_days?: number;
  forecast_workload: number;
  total_required: number;
  total_available: number;
  total_gap: number;
  utilization_pct: number;
  shifts: ShiftWorkforce[];
  recommendations: StaffingRecommendation[];
  daily_capacity: DailyCapacityPoint[];
  alerts: PlanningAlert[];
}

// Operations Efficiency Dashboard Types
export interface OperationalKPIs {
  efficiency_score: number;
  efficiency_benchmark: number;
  throughput: number;
  throughput_benchmark: number;
  cycle_time: number;
  cycle_time_benchmark: number;
  capacity_utilization: number;
  utilization_benchmark: number;
}

export interface OperationalStage {
  stage: string;
  efficiency_pct: number;
  cycle_time_mins: number;
  benchmark_cycle_mins: number;
  status: "optimal" | "bottleneck" | "warning" | string;
  description: string;
}

export interface BottleneckInfo {
  identified_stage: string;
  excess_delay_mins: number;
  throughput_impact_pct: number;
  recommended_action: string;
}

export interface EfficiencyTrendPoint {
  day: string;
  actual_efficiency: number;
  benchmark_efficiency: number;
  throughput: number;
}

export interface AreaSummaryItem {
  title: string;
  efficiency_pct: number;
  total_volume?: number;
  on_time_dispatch_pct?: number;
  staged_inventory?: number;
  accumulation_status?: string;
  cycle_time_mins?: number;
  status: string;
}

export interface AreaSummary {
  inbound: AreaSummaryItem;
  outbound: AreaSummaryItem;
  inventory: AreaSummaryItem;
}

export interface EfficiencyDashboardData {
  facility: string;
  kpis: OperationalKPIs;
  operational_flow: OperationalStage[];
  bottleneck: BottleneckInfo;
  efficiency_trend: EfficiencyTrendPoint[];
  area_summary: AreaSummary;
  performance_insight: string;
}

// Resource Optimization Types
export interface OptimizationMetrics {
  resources_optimizable: number;
  underutilized_capacity_pct: number;
  resource_gap: number;
  potential_gain_pct: number;
}

export interface SurplusAreaItem {
  area: string;
  surplus: number;
  utilization_pct: number;
  status: string;
}

export interface ShortageAreaItem {
  area: string;
  shortage: number;
  utilization_pct: number;
  status: string;
}

export interface ResourceBalance {
  surplus_areas: SurplusAreaItem[];
  shortage_areas: ShortageAreaItem[];
  total_surplus_workers: number;
  total_shortage_workers: number;
}

export interface PrimaryRecommendation {
  source_area: string;
  target_area: string;
  workers_to_move: number;
  expected_improvement: string;
  why_explanation: string;
  before_state: {
    source_util: number;
    target_util: number;
    target_shortage: number;
  };
  after_state: {
    source_util: number;
    target_util: number;
    target_shortage: number;
  };
}

export interface AllocationTableRow {
  area: string;
  required_workers: number;
  allocated_workers: number;
  gap: number;
  utilization_pct: number;
  status: "surplus" | "shortage" | "optimal" | string;
  status_label: string;
}

export interface OpportunityItem {
  severity: "critical" | "warning" | "optimal" | string;
  icon: string;
  title: string;
  action: string;
  impact: string;
}

export interface ResourceOptimizationData {
  facility: string;
  overall_utilization: number;
  metrics: OptimizationMetrics;
  balance: ResourceBalance;
  primary_recommendation: PrimaryRecommendation;
  allocation_table: AllocationTableRow[];
  opportunities: OpportunityItem[];
  // Legacy
  recommendations?: ReallocationRecommendation[];
  area_utilization?: AreaUtilization[];
  areas?: AreaUtilization[];
  alerts?: AlertItem[];
}

// Backward compatibility types
export interface AlertItem {
  id?: string;
  type?: string;
  title?: string;
  severity: "critical" | "warning" | "optimal" | string;
  message: string;
  facility?: string;
  timestamp?: string;
}

export interface ReallocationRecommendation {
  source_area?: string;
  target_area?: string;
  from_area?: string;
  to_area?: string;
  recommended_workers?: number;
  workers_to_move?: number;
  expected_improvement?: string;
  urgency?: "high" | "medium" | "low" | string;
  reason?: string;
}

export interface AreaUtilization {
  area: string;
  utilization_pct: number;
  status: string;
  capacity?: number;
  actual?: number;
  workload?: number;
}

export interface TrendPoint {
  date: string;
  inbound: number;
  outbound: number;
  inventory?: number;
  processed?: number;
  workers?: number;
}

export interface OptimizationData extends ResourceOptimizationData {}
