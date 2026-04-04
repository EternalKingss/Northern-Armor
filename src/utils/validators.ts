/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate password strength
 */
export const isValidPassword = (password: string): boolean => {
  return password.length >= 8
}

/**
 * Validate phone number
 */
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/
  return phoneRegex.test(phone)
}

/**
 * Validate number in range
 */
export const isNumberInRange = (value: number, min: number, max: number): boolean => {
  return value >= min && value <= max
}

/**
 * Validate required field
 */
export const isRequired = (value: string | number): boolean => {
  if (typeof value === 'string') {
    return value.trim().length > 0
  }
  return value !== null && value !== undefined
}

/**
 * Validate date is in future
 */
export const isFutureDate = (date: Date): boolean => {
  return new Date(date) > new Date()
}

/**
 * Validate date is in past
 */
export const isPastDate = (date: Date): boolean => {
  return new Date(date) < new Date()
}

/**
 * Validate weight value
 */
export const isValidWeight = (weight: number): boolean => {
  return weight > 0 && weight < 1000
}

/**
 * Validate age
 */
export const isValidAge = (age: number): boolean => {
  return age >= 1 && age <= 150
}

/**
 * Validate reps count
 */
export const isValidReps = (reps: number): boolean => {
  return reps > 0 && reps <= 1000
}
