/**
 * Gym Tracker App - Type Definitions
 * Comprehensive TypeScript interfaces for all app data structures
 */

// ============================================================================
// WORKOUT DATA STRUCTURES
// ============================================================================

/**
 * Represents a single exercise set (weight, reps, duration)
 */
export interface ExerciseSet {
  id: string;
  setNumber: number;
  reps: number;
  weight: number; // in kg or lbs
  duration?: number; // in seconds for timed exercises
  restTime: number; // rest time between sets in seconds
  isCompleted: boolean;
  actualReps?: number; // filled in when exercise is completed
  actualWeight?: number; // actual weight used
  notes?: string;
  timestamp?: Date;
}

/**
 * Represents a single exercise within a workout
 */
export interface Exercise {
  id: string;
  name: string;
  category: ExerciseCategory;
  description?: string;
  sets: ExerciseSet[];
  targetMuscleGroup: MuscleGroup;
  equipment?: Equipment[];
  difficulty: DifficultyLevel;
  instructions?: string[];
  restTimeBetweenSets: number; // default rest time in seconds
  notes?: string;
  imageUrl?: string;
  videoUrl?: string;
}

/**
 * Represents a complete workout session
 */
export interface Workout {
  id: string;
  userId: string;
  date: Date;
  startTime: Date;
  endTime?: Date;
  title: string;
  description?: string;
  exercises: Exercise[];
  status: WorkoutStatus;
  duration?: number; // in minutes
  caloriesBurned?: number;
  intensity: IntensityLevel;
  notes?: string;
  imageUrl?: string;
  completedAt?: Date;
}

/**
 * Represents a workout plan/program
 */
export interface WorkoutPlan {
  id: string;
  userId: string;
  name: string;
  description?: string;
  duration: number; // in weeks
  frequency: number; // workouts per week
  difficulty: DifficultyLevel;
  workouts: Workout[];
  createdAt: Date;
  startDate: Date;
  endDate?: Date;
  goals?: string[];
  notes?: string;
}

/**
 * Exercise categories
 */
export enum ExerciseCategory {
  STRENGTH = 'strength',
  CARDIO = 'cardio',
  FLEXIBILITY = 'flexibility',
  BALANCE = 'balance',
  HIIT = 'hiit',
  PILATES = 'pilates',
  YOGA = 'yoga',
  STRETCHING = 'stretching',
  WARM_UP = 'warm_up',
  COOL_DOWN = 'cool_down',
}

/**
 * Muscle groups targeted by exercises
 */
export enum MuscleGroup {
  CHEST = 'chest',
  BACK = 'back',
  SHOULDERS = 'shoulders',
  BICEPS = 'biceps',
  TRICEPS = 'triceps',
  FOREARMS = 'forearms',
  ABS = 'abs',
  OBLIQUES = 'obliques',
  QUADRICEPS = 'quadriceps',
  HAMSTRINGS = 'hamstrings',
  GLUTES = 'glutes',
  CALVES = 'calves',
  LEGS = 'legs',
  FULL_BODY = 'full_body',
  CORE = 'core',
}

/**
 * Equipment types
 */
export enum Equipment {
  BARBELL = 'barbell',
  DUMBBELL = 'dumbbell',
  KETTLEBELL = 'kettlebell',
  RESISTANCE_BAND = 'resistance_band',
  CABLE_MACHINE = 'cable_machine',
  SMITH_MACHINE = 'smith_machine',
  LEG_PRESS = 'leg_press',
  TREADMILL = 'treadmill',
  STATIONARY_BIKE = 'stationary_bike',
  ROWING_MACHINE = 'rowing_machine',
  ELLIPTICAL = 'elliptical',
  YOGA_MAT = 'yoga_mat',
  FOAM_ROLLER = 'foam_roller',
  MEDICINE_BALL = 'medicine_ball',
  JUMP_ROPE = 'jump_rope',
  BODY_WEIGHT = 'body_weight',
  NONE = 'none',
}

/**
 * Workout status
 */
export enum WorkoutStatus {
  PLANNED = 'planned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  PAUSED = 'paused',
  CANCELLED = 'cancelled',
}

/**
 * Intensity levels
 */
export enum IntensityLevel {
  LOW = 'low',
  MODERATE = 'moderate',
  HIGH = 'high',
  VERY_HIGH = 'very_high',
}

/**
 * Difficulty levels
 */
export enum DifficultyLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert',
}

// ============================================================================
// USER PROFILE DATA
// ============================================================================

/**
 * Represents user's physical metrics
 */
export interface UserMetrics {
  id: string;
  userId: string;
  weight: number; // in kg
  height: number; // in cm
  bodyFatPercentage?: number;
  muscleMass?: number;
  recordedAt: Date;
  notes?: string;
}

/**
 * Represents user preferences and settings
 */
export interface UserPreferences {
  theme: 'light' | 'dark';
  language: string;
  measurementUnit: 'metric' | 'imperial';
  notifications: NotificationPreferences;
  privacy: PrivacySettings;
}

/**
 * Notification preferences
 */
export interface NotificationPreferences {
  enableNotifications: boolean;
  workoutReminders: boolean;
  goalAchievements: boolean;
  socialActivity: boolean;
  pushNotifications: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
}

/**
 * Privacy settings
 */
export interface PrivacySettings {
  profileVisibility: 'private' | 'friends' | 'public';
  showStats: boolean;
  showAchievements: boolean;
  allowMessaging: boolean;
}

/**
 * User fitness goals
 */
export interface FitnessGoal {
  id: string;
  userId: string;
  title: string;
  description?: string;
  type: GoalType;
  category: ExerciseCategory;
  targetValue: number;
  currentValue: number;
  unit: string;
  startDate: Date;
  targetDate: Date;
  status: GoalStatus;
  priority: PriorityLevel;
  progress: number; // percentage 0-100
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Goal types
 */
export enum GoalType {
  WEIGHT_LOSS = 'weight_loss',
  MUSCLE_GAIN = 'muscle_gain',
  STRENGTH = 'strength',
  ENDURANCE = 'endurance',
  FLEXIBILITY = 'flexibility',
  GENERAL_FITNESS = 'general_fitness',
  PERFORMANCE = 'performance',
  CONSISTENCY = 'consistency',
}

/**
 * Goal status
 */
export enum GoalStatus {
  ACTIVE = 'active',
  ON_HOLD = 'on_hold',
  COMPLETED = 'completed',
  FAILED = 'failed',
  ABANDONED = 'abandoned',
}

/**
 * Priority levels
 */
export enum PriorityLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

/**
 * Represents user's complete profile
 */
export interface UserProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  profileImage?: string;
  bio?: string;
  location?: string;
  metrics: UserMetrics[];
  preferences: UserPreferences;
  goals: FitnessGoal[];
  createdAt: Date;
  updatedAt: Date;
  lastActiveAt?: Date;
}

// ============================================================================
// STATS & METRICS DATA
// ============================================================================

/**
 * Charging stats - represents battery/energy level
 */
export interface ChargingStats {
  id: string;
  userId: string;
  currentLevel: number; // 0-100 percentage
  maxLevel: number;
  isCharging: boolean;
  timeUntilFull?: number; // in minutes
  energyBurned: number; // today's total
  energyConsumed: number; // today's total
  lastUpdated: Date;
  trend?: 'increasing' | 'decreasing' | 'stable';
}

/**
 * Mindfulness and wellness stats
 */
export interface MindfulnessStats {
  id: string;
  userId: string;
  quantumCalmScore: number; // custom metric 0-100
  focusScore: number; // 0-100
  restScore: number; // 0-100
  sleepDuration: number; // in hours
  stressLevel: DayStressLevel;
  meditationMinutes: number; // today
  mindfulnessMinutes: number; // today
  relaxationSessionsCompleted: number;
  recordedAt: Date;
  insights?: string[];
}

/**
 * Daily stress levels
 */
export enum DayStressLevel {
  VERY_LOW = 'very_low',
  LOW = 'low',
  MODERATE = 'moderate',
  HIGH = 'high',
  VERY_HIGH = 'very_high',
}

/**
 * Comprehensive fitness statistics
 */
export interface FitnessStats {
  id: string;
  userId: string;
  date: Date;
  totalWorkouts: number;
  totalExercises: number;
  totalSets: number;
  totalReps: number;
  totalWeight: number; // sum of all weight lifted
  totalDuration: number; // in minutes
  totalCaloriesBurned: number;
  averageIntensity: IntensityLevel;
  muscleGroupsCovered: MuscleGroup[];
  personalBests: PersonalRecord[];
  restDays: number;
  consistency: number; // percentage
  weeklyTrend?: 'improving' | 'declining' | 'stable';
}

/**
 * Personal records (PRs)
 */
export interface PersonalRecord {
  id: string;
  exerciseId: string;
  exerciseName: string;
  category: ExerciseCategory;
  recordType: 'weight' | 'reps' | 'time' | 'distance';
  value: number;
  date: Date;
  notes?: string;
}

/**
 * Weekly activity summary
 */
export interface WeeklyActivitySummary {
  id: string;
  userId: string;
  weekStartDate: Date;
  weekEndDate: Date;
  totalWorkouts: number;
  totalDuration: number; // in minutes
  totalCaloriesBurned: number;
  averageIntensity: IntensityLevel;
  exercisesCompleted: number;
  goalsAchieved: number;
  bestDay?: Date;
  worstDay?: Date;
  trends: ActivityTrend[];
}

/**
 * Activity trends
 */
export interface ActivityTrend {
  metric: string;
  previousValue: number;
  currentValue: number;
  changePercentage: number;
  direction: 'up' | 'down' | 'stable';
}

/**
 * Comprehensive stats dashboard data
 */
export interface StatsData {
  chargingStats: ChargingStats;
  mindfulnessStats: MindfulnessStats;
  fitnessStats: FitnessStats;
  weeklyActivitySummary: WeeklyActivitySummary;
  goals: FitnessGoal[];
  recentWorkouts: Workout[];
}

// ============================================================================
// COMPONENT PROPS INTERFACES
// ============================================================================

/**
 * Props for charging stats card component
 */
export interface ChargingStatsCardProps {
  stats: ChargingStats;
  onViewDetails?: () => void;
  onRefresh?: () => void;
  showTrend?: boolean;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

/**
 * Props for mindfulness stats card component
 */
export interface MindfulnessStatsCardProps {
  stats: MindfulnessStats;
  onViewDetails?: () => void;
  onStartSession?: () => void;
  showInsights?: boolean;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

/**
 * Props for user profile card component
 */
export interface UserProfileCardProps {
  profile: UserProfile;
  isEditable?: boolean;
  onEdit?: () => void;
  onLogout?: () => void;
  showStats?: boolean;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

/**
 * Props for fitness goals card component
 */
export interface GoalsCardProps {
  goals: FitnessGoal[];
  onSelectGoal?: (goal: FitnessGoal) => void;
  onCreateGoal?: () => void;
  onUpdateGoal?: (goal: FitnessGoal) => void;
  showOnlyActive?: boolean;
  maxDisplay?: number;
  className?: string;
}

/**
 * Props for workout history component
 */
export interface WorkoutHistoryProps {
  workouts: Workout[];
  userId: string;
  onSelectWorkout?: (workout: Workout) => void;
  onDeleteWorkout?: (workoutId: string) => void;
  onEditWorkout?: (workout: Workout) => void;
  filter?: WorkoutHistoryFilter;
  sortBy?: 'date' | 'duration' | 'intensity' | 'calories';
  sortOrder?: 'asc' | 'desc';
  pageSize?: number;
  className?: string;
}

/**
 * Workout history filter options
 */
export interface WorkoutHistoryFilter {
  startDate?: Date;
  endDate?: Date;
  category?: ExerciseCategory;
  intensity?: IntensityLevel;
  status?: WorkoutStatus;
  minDuration?: number;
  maxDuration?: number;
}

/**
 * Props for exercise list component
 */
export interface ExerciseListProps {
  exercises: Exercise[];
  onSelectExercise?: (exercise: Exercise) => void;
  onDeleteExercise?: (exerciseId: string) => void;
  onEditExercise?: (exercise: Exercise) => void;
  filter?: ExerciseListFilter;
  sortBy?: 'name' | 'difficulty' | 'muscleGroup' | 'category';
  sortOrder?: 'asc' | 'desc';
  className?: string;
}

/**
 * Exercise list filter options
 */
export interface ExerciseListFilter {
  category?: ExerciseCategory;
  muscleGroup?: MuscleGroup;
  difficulty?: DifficultyLevel;
  equipment?: Equipment[];
  search?: string;
}

/**
 * Props for exercise set input component
 */
export interface ExerciseSetInputProps {
  set: ExerciseSet;
  exerciseName: string;
  onUpdate: (set: ExerciseSet) => void;
  onDelete?: () => void;
  onComplete?: () => void;
  isActive?: boolean;
  readOnly?: boolean;
  className?: string;
}

/**
 * Props for progress circle component
 */
export interface ProgressCircleProps {
  value: number; // 0-100
  maxValue?: number;
  size?: 'small' | 'medium' | 'large';
  color?: string;
  backgroundColor?: string;
  strokeWidth?: number;
  label?: string;
  showPercentage?: boolean;
  animated?: boolean;
  onComplete?: () => void;
  className?: string;
}

/**
 * Props for stat card component (generic)
 */
export interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon?: React.ReactNode;
  description?: string;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'stable';
  };
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'accent';
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

/**
 * Props for activity gauge component
 */
export interface ActivityGaugeProps {
  current: number;
  target: number;
  label: string;
  unit?: string;
  color?: string;
  size?: 'small' | 'medium' | 'large';
  animated?: boolean;
  className?: string;
}

/**
 * Props for stats dashboard component
 */
export interface StatsDashboardProps {
  stats: StatsData;
  userId: string;
  onRefresh?: () => void;
  onNavigateToWorkout?: () => void;
  onNavigateToGoals?: () => void;
  showCharging?: boolean;
  showMindfulness?: boolean;
  showFitness?: boolean;
  showGoals?: boolean;
  layout?: 'grid' | 'list' | 'compact';
  className?: string;
}

/**
 * Props for modal/dialog components
 */
export interface ModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  onConfirm?: () => void;
  children: React.ReactNode;
  size?: 'small' | 'medium' | 'large';
  showCloseButton?: boolean;
  isDismissible?: boolean;
  className?: string;
}

/**
 * Props for form components
 */
export interface FormProps {
  initialValues?: Record<string, any>;
  onSubmit: (values: Record<string, any>) => void | Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  className?: string;
}

/**
 * Props for button components
 */
export interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'accent' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

/**
 * Props for input field components
 */
export interface InputFieldProps {
  label?: string;
  value: string | number;
  onChange: (value: string | number) => void;
  placeholder?: string;
  type?: 'text' | 'number' | 'email' | 'password' | 'date' | 'time';
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  className?: string;
}

/**
 * Props for select dropdown components
 */
export interface SelectFieldProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  multiple?: boolean;
  className?: string;
}

/**
 * Select option interface
 */
export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  icon?: React.ReactNode;
}

/**
 * API Response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  statusCode: number;
  timestamp: Date;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Paginated API response
 */
export interface PaginatedApiResponse<T> extends ApiResponse<T[]> {
  meta: PaginationMeta;
}
