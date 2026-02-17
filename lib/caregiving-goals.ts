export interface CaregivingGoals {
  ageRange: string
  sleepSessionsPerDay: string
  feedingSessionsPerDay: string
  playSessionsMinutesPerDay: string
  notes: string
}

export interface GrowthPercentiles {
  ageRange: string
  weightPercentileRange: string
  heightPercentileRange: string
  notes: string
}

export const CAREGIVING_GOALS_BY_AGE: CaregivingGoals[] = [
  {
    ageRange: "0-1 month",
    sleepSessionsPerDay: "6-8",
    feedingSessionsPerDay: "8-12",
    playSessionsMinutesPerDay: "20-40",
    notes: "Frequent sleep and feeding due to immature circadian rhythm and small stomach capacity.",
  },
  {
    ageRange: "1-3 months",
    sleepSessionsPerDay: "5-6",
    feedingSessionsPerDay: "7-9",
    playSessionsMinutesPerDay: "60-90",
    notes: "Longer wake windows and increased alertness support more interactive play.",
  },
  {
    ageRange: "3-6 months",
    sleepSessionsPerDay: "3-4",
    feedingSessionsPerDay: "5-7",
    playSessionsMinutesPerDay: "60-90",
    notes: "Sleep begins consolidating; social smiling and motor skills expand play opportunities.",
  },
  {
    ageRange: "6-12 months",
    sleepSessionsPerDay: "2-3",
    feedingSessionsPerDay: "4-6",
    playSessionsMinutesPerDay: "90-180",
    notes: "Introduction of solids and increased mobility drive longer active play.",
  },
  {
    ageRange: "1-2 years",
    sleepSessionsPerDay: "1-2",
    feedingSessionsPerDay: "5-6",
    playSessionsMinutesPerDay: "120-180",
    notes: "Transition toward structured meals and one nap; rapid language and social development.",
  },
  {
    ageRange: "2-3 years",
    sleepSessionsPerDay: "0-1",
    feedingSessionsPerDay: "5",
    playSessionsMinutesPerDay: "180+",
    notes: "Most sleep occurs overnight; play emphasizes imagination, coordination, and social interaction.",
  },
]

export const GROWTH_PERCENTILES_BY_AGE: GrowthPercentiles[] = [
  {
    ageRange: "0-1 month",
    weightPercentileRange: "5-95",
    heightPercentileRange: "5-95",
    notes: "Large variation is normal. Early post-birth weight loss is expected.",
  },
  {
    ageRange: "1-3 months",
    weightPercentileRange: "10-90",
    heightPercentileRange: "10-90",
    notes: "Rapid growth period. Percentile stability matters more than percentile rank.",
  },
  {
    ageRange: "3-6 months",
    weightPercentileRange: "10-85",
    heightPercentileRange: "10-85",
    notes: "Growth velocity slows slightly; breastfed infants may naturally shift percentiles.",
  },
  {
    ageRange: "6-12 months",
    weightPercentileRange: "10-85",
    heightPercentileRange: "10-85",
    notes: "Solids introduction and mobility can temporarily affect growth curves.",
  },
  {
    ageRange: "1-2 years",
    weightPercentileRange: "5-85",
    heightPercentileRange: "5-85",
    notes: "Increased activity often leads to leaner body composition.",
  },
  {
    ageRange: "2-3 years",
    weightPercentileRange: "5-85",
    heightPercentileRange: "5-85",
    notes: "Growth patterns stabilize; consistent tracking over time is key.",
  },
]

/**
 * Calculate age in months from a birth date string (YYYY-MM-DD)
 */
export function getAgeInMonths(birthDateString: string | undefined): number {
  if (!birthDateString) return 0

  const birthDate = new Date(birthDateString)
  if (Number.isNaN(birthDate.getTime())) return 0
  const today = new Date()

  let months = (today.getFullYear() - birthDate.getFullYear()) * 12
  months += today.getMonth() - birthDate.getMonth()

  if (today.getDate() < birthDate.getDate()) {
    months -= 1
  }

  return Math.max(0, months)
}

/**
 * Get caregiving goals based on child's age in months
 * Returns the goal thresholds (as numbers) for daily targets
 */
export function getGoalsForAge(ageInMonths: number) {
  let sleepGoal = 4
  let feedingGoal = 6
  let playGoal = 1

  if (ageInMonths < 1) {
    // 0-1 month: 6-8 sleep, 8-12 feeding, 20-40 min play
    sleepGoal = 7
    feedingGoal = 10
    playGoal = 1
  } else if (ageInMonths < 3) {
    // 1-3 months: 5-6 sleep, 7-9 feeding, 60-90 min play
    sleepGoal = 5
    feedingGoal = 8
    playGoal = 2
  } else if (ageInMonths < 6) {
    // 3-6 months: 3-4 sleep, 5-7 feeding, 60-90 min play
    sleepGoal = 3
    feedingGoal = 6
    playGoal = 2
  } else if (ageInMonths < 12) {
    // 6-12 months: 2-3 sleep, 4-6 feeding, 90-180 min play
    sleepGoal = 2
    feedingGoal = 5
    playGoal = 2
  } else if (ageInMonths < 24) {
    // 1-2 years: 1-2 sleep, 5-6 feeding, 120-180 min play
    sleepGoal = 1
    feedingGoal = 5
    playGoal = 3
  } else {
    // 2-3 years: 0-1 sleep, 5 feeding, 180+ min play
    sleepGoal = 1
    feedingGoal = 5
    playGoal = 3
  }

  return { sleepGoal, feedingGoal, playGoal }
}

/**
 * Get the goals description/range string for a specific age range
 */
export function getGoalsDescription(ageInMonths: number): CaregivingGoals | null {
  return CAREGIVING_GOALS_BY_AGE.find((goal) => {
    const [min, max] = goal.ageRange.split("-").map((x) => parseInt(x, 10))
    return ageInMonths >= min && ageInMonths <= max
  }) || null
}

/**
 * Get growth percentile ranges for a specific age
 */
export function getGrowthPercentilesForAge(ageInMonths: number): GrowthPercentiles | null {
  return GROWTH_PERCENTILES_BY_AGE.find((percentile) => {
    const [min, max] = percentile.ageRange.split("-").map((x) => parseInt(x, 10))
    return ageInMonths >= min && ageInMonths <= max
  }) || null
}
