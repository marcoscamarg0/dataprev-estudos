import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes}min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

export function getDaysUntil(date: string | Date): number {
  const target = new Date(date);
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function getWeekDates(): Date[] {
  const now = new Date();
  const day = now.getDay();
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() - day + i);
    dates.push(d);
  }
  return dates;
}

export function generateHeatmapData(days = 365) {
  const data: { date: string; count: number }[] = [];
  const now = new Date();
  for (let i = days; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    data.push({
      date: d.toISOString().split("T")[0],
      count: Math.random() > 0.4 ? Math.floor(Math.random() * 5) : 0,
    });
  }
  return data;
}

export function getHeatmapIntensity(count: number): number {
  if (count === 0) return 0;
  if (count <= 1) return 1;
  if (count <= 2) return 2;
  if (count <= 3) return 3;
  if (count <= 4) return 4;
  return 5;
}

export function calculateApprovalProbability(
  correctRate: number,
  questionsAnswered: number,
  studyHours: number,
  daysLeft: number
): number {
  const rateScore = correctRate * 50;
  const volumeScore = Math.min(questionsAnswered / 500, 1) * 25;
  const hoursScore = Math.min(studyHours / 200, 1) * 15;
  const timeScore = daysLeft > 30 ? 10 : (daysLeft / 30) * 10;
  return Math.min(Math.round(rateScore + volumeScore + hoursScore + timeScore), 99);
}

export function sm2Algorithm(
  quality: number,
  repetitions: number,
  easeFactor: number,
  interval: number
) {
  let newEF = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (newEF < 1.3) newEF = 1.3;
  
  let newInterval: number;
  let newRepetitions: number;
  
  if (quality < 3) {
    newRepetitions = 0;
    newInterval = 1;
  } else {
    newRepetitions = repetitions + 1;
    if (repetitions === 0) newInterval = 1;
    else if (repetitions === 1) newInterval = 6;
    else newInterval = Math.round(interval * newEF);
  }
  
  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + newInterval);
  
  return {
    easeFactor: newEF,
    interval: newInterval,
    repetitions: newRepetitions,
    nextReview,
  };
}

export const EXAM_DATE = "2026-10-15"; // Data estimada DATAPREV 2026

export function getXpLevel(totalXp: number) {
  const levels = [
    { level: 1, name: "Iniciante", min: 0, max: 500 },
    { level: 2, name: "Estudante", min: 500, max: 1500 },
    { level: 3, name: "Dedicado", min: 1500, max: 3500 },
    { level: 4, name: "Comprometido", min: 3500, max: 7000 },
    { level: 5, name: "Avançado", min: 7000, max: 12000 },
    { level: 6, name: "Expert", min: 12000, max: 20000 },
    { level: 7, name: "Mestre", min: 20000, max: 35000 },
    { level: 8, name: "Candidato Elite", min: 35000, max: Infinity },
  ];
  
  const current = levels.find((l) => totalXp >= l.min && totalXp < l.max) || levels[0];
  const progress =
    current.max === Infinity
      ? 100
      : ((totalXp - current.min) / (current.max - current.min)) * 100;
  
  return { ...current, progress, totalXp };
}
