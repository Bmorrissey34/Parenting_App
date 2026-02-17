import cdcGrowthData from "./cdc-growth-data.json"
import cdcLengthData from "./cdc-length-growth-data.json"

/**
 * Standard normal cumulative distribution function (CDF)
 * Used to convert z-scores to percentiles
 */
function normCDF(z: number): number {
  // Constants for approximation
  const a1 = 0.254829592
  const a2 = -0.284496736
  const a3 = 1.421413741
  const a4 = -1.453152027
  const a5 = 1.061405429
  const p = 0.3275911

  const sign = z < 0 ? -1 : 1
  z = Math.abs(z) / Math.sqrt(2)

  const t = 1.0 / (1.0 + p * z)
  const y =
    1.0 -
    (((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-z * z))

  return 0.5 * (1.0 + sign * y)
}

/**
 * Calculate z-score from measurement using LMS parameters
 * Formula: z = ((measurement/M)^L - 1) / (L * S)
 */
function calculateZScore(measurement: number, L: number, M: number, S: number): number {
  if (L === 0) {
    return (Math.log(measurement / M)) / S
  }
  return ((Math.pow(measurement / M, L) - 1) / (L * S))
}

/**
 * Convert z-score to percentile (0-100)
 */
function zScoreToPercentile(z: number): number {
  return normCDF(z) * 100
}

interface LMSData {
  ageMonths: number
  L: number
  M: number
  S: number
}

interface LMSDataset {
  data: {
    male: LMSData[]
    female: LMSData[]
  }
}

/**
 * Find the LMS parameters for a given age
 * If exact age not found, interpolates between closest ages
 */
function findLMSForAge(
  dataset: LMSDataset,
  ageMonths: number,
  sex: "male" | "female"
): LMSData | null {
  const data = sex === "male" ? dataset.data.male : dataset.data.female
  
  // Find exact match or closest match
  let exact = data.find((d) => d.ageMonths === ageMonths)
  if (exact) return exact as LMSData

  // Find surrounding points for interpolation
  let lower = data[0]
  let upper = data[data.length - 1]

  for (let i = 0; i < data.length - 1; i++) {
    if (data[i].ageMonths < ageMonths && data[i + 1].ageMonths > ageMonths) {
      lower = data[i]
      upper = data[i + 1]
      break
    }
  }

  // Linear interpolation
  const t = (ageMonths - lower.ageMonths) / (upper.ageMonths - lower.ageMonths)
  
  return {
    ageMonths,
    L: lower.L + t * (upper.L - lower.L),
    M: lower.M + t * (upper.M - lower.M),
    S: lower.S + t * (upper.S - lower.S),
  }
}

/**
 * Calculate weight percentile for a child
 * @param weightKg - Weight in kilograms
 * @param ageMonths - Age in months
 * @param sex - "male" or "female"
 * @returns Percentile (0-100)
 */
export function calculateWeightPercentile(
  weightKg: number,
  ageMonths: number,
  sex: "male" | "female" = "male"
): number {
  const lms = findLMSForAge(cdcGrowthData as LMSDataset, ageMonths, sex)
  if (!lms) return 0

  const z = calculateZScore(weightKg, lms.L, lms.M, lms.S)
  return zScoreToPercentile(z)
}

/**
 * Get the expected median weight for an age
 */
export function getMedianWeightForAge(ageMonths: number, sex: "male" | "female" = "male"): number {
  const lms = findLMSForAge(cdcGrowthData as LMSDataset, ageMonths, sex)
  return lms?.M ?? 0
}

/**
 * Get weight range for a percentile (e.g., 5th-95th)
 */
export function getWeightRangeForAge(
  ageMonths: number,
  percentileLow: number,
  percentileHigh: number,
  sex: "male" | "female" = "male"
): { low: number; high: number } {
  const lms = findLMSForAge(cdcGrowthData as LMSDataset, ageMonths, sex)
  if (!lms) return { low: 0, high: 0 }

  // Reverse the z-score formula to find weight from percentile:
  // measurement = M * ((L * S * z + 1)^(1/L))
  
  const getWeightFromPercentile = (percentile: number) => {
    const z = approximateZFromPercentile(percentile)
    if (lms.L === 0) {
      return lms.M * Math.exp(lms.S * z)
    }
    return lms.M * Math.pow(lms.L * lms.S * z + 1, 1 / lms.L)
  }

  return {
    low: getWeightFromPercentile(percentileLow),
    high: getWeightFromPercentile(percentileHigh),
  }
}

/**
 * Calculate height (length) percentile for a child
 * @param heightCm - Length/height in centimeters
 * @param ageMonths - Age in months
 * @param sex - "male" or "female"
 * @returns Percentile (0-100)
 */
export function calculateHeightPercentile(
  heightCm: number,
  ageMonths: number,
  sex: "male" | "female" = "male"
): number {
  const lms = findLMSForAge(cdcLengthData as LMSDataset, ageMonths, sex)
  if (!lms) return 0

  const z = calculateZScore(heightCm, lms.L, lms.M, lms.S)
  return zScoreToPercentile(z)
}

/**
 * Approximate inverse normal CDF (z from percentile)
 */
function approximateZFromPercentile(percentile: number): number {
  const p = percentile / 100
  if (p < 0.00135) return -3.0
  if (p > 0.99865) return 3.0

  if (p < 0.5) {
    const t = Math.sqrt(Math.log(1 / (p * p)))
    return -(t - (2.515517 + 0.802853 * t + 0.010328 * t * t) / (1 + 1.432788 * t + 0.189269 * t * t))
  } else {
    const t = Math.sqrt(Math.log(1 / ((1 - p) * (1 - p))))
    return t - (2.515517 + 0.802853 * t + 0.010328 * t * t) / (1 + 1.432788 * t + 0.189269 * t * t)
  }
}
