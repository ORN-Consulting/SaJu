/**
 * 궁합(宮合) 분석 모듈 — 3단계
 *
 * 두 사람의 사주를 비교하여 천간합, 지지 육합/충/삼합,
 * 오행 상성, 일간 관계를 종합 분석하고 점수를 산출한다.
 */

import type {
  SajuAnalysisResult,
  CompatibilityResult,
  CheonganHapEntry,
  JijiRelationEntry,
  ElementCompatibility,
  DayStemRelation,
  CompatibilityScore,
  CompatibilityGrade,
  Stem,
  Branch,
  Element,
  SajuPillars,
} from './types';
import {
  CHEONGAN_HAP,
  JIJI_YUKHAP,
  JIJI_CHUNG,
  JIJI_SAMHAP,
  STEM_ELEMENT,
  STEM_YINYANG,
  ELEMENT_GENERATES,
  getTenGod,
} from './constants';

// ──────────────────────────────────────
// 기둥 위치 라벨
// ──────────────────────────────────────

// 기둥 위치 상수 (추후 상세 분석에 활용)

function getStems(p: SajuPillars): { stem: Stem; pos: string }[] {
  const list: { stem: Stem; pos: string }[] = [
    { stem: p.year.stem, pos: '년간' },
    { stem: p.month.stem, pos: '월간' },
    { stem: p.day.stem, pos: '일간' },
  ];
  if (p.hour) list.push({ stem: p.hour.stem, pos: '시간' });
  return list;
}

function getBranches(p: SajuPillars): { branch: Branch; pos: string }[] {
  const list: { branch: Branch; pos: string }[] = [
    { branch: p.year.branch, pos: '년지' },
    { branch: p.month.branch, pos: '월지' },
    { branch: p.day.branch, pos: '일지' },
  ];
  if (p.hour) list.push({ branch: p.hour.branch, pos: '시지' });
  return list;
}

// ──────────────────────────────────────
// 천간합 찾기
// ──────────────────────────────────────

function findCheonganHaps(p1: SajuPillars, p2: SajuPillars): CheonganHapEntry[] {
  const results: CheonganHapEntry[] = [];
  const stems1 = getStems(p1);
  const stems2 = getStems(p2);

  for (const s1 of stems1) {
    for (const s2 of stems2) {
      for (const [a, b, element] of CHEONGAN_HAP) {
        if ((s1.stem === a && s2.stem === b) || (s1.stem === b && s2.stem === a)) {
          results.push({
            stem1: s1.stem,
            stem2: s2.stem,
            resultElement: element,
            position1: s1.pos,
            position2: s2.pos,
          });
        }
      }
    }
  }
  return results;
}

// ──────────────────────────────────────
// 지지 관계 (육합, 충, 삼합) 찾기
// ──────────────────────────────────────

function findJijiRelations(p1: SajuPillars, p2: SajuPillars): JijiRelationEntry[] {
  const results: JijiRelationEntry[] = [];
  const branches1 = getBranches(p1);
  const branches2 = getBranches(p2);

  // 육합
  for (const b1 of branches1) {
    for (const b2 of branches2) {
      for (const [a, b, element] of JIJI_YUKHAP) {
        if ((b1.branch === a && b2.branch === b) || (b1.branch === b && b2.branch === a)) {
          results.push({
            type: '육합',
            branch1: b1.branch,
            branch2: b2.branch,
            resultElement: element,
            position1: b1.pos,
            position2: b2.pos,
          });
        }
      }
    }
  }

  // 충
  for (const b1 of branches1) {
    for (const b2 of branches2) {
      for (const [a, b] of JIJI_CHUNG) {
        if ((b1.branch === a && b2.branch === b) || (b1.branch === b && b2.branch === a)) {
          results.push({
            type: '충',
            branch1: b1.branch,
            branch2: b2.branch,
            position1: b1.pos,
            position2: b2.pos,
          });
        }
      }
    }
  }

  // 삼합: 합쳐서 3개 지지가 모두 있으면 삼합
  const allBranches = new Set([
    ...branches1.map((b) => b.branch),
    ...branches2.map((b) => b.branch),
  ]);
  for (const [a, b, c, element] of JIJI_SAMHAP) {
    if (allBranches.has(a) && allBranches.has(b) && allBranches.has(c)) {
      results.push({
        type: '삼합',
        branch1: a,
        branch2: c,
        resultElement: element,
        position1: `${a}${b}${c}`,
        position2: `${element}국`,
      });
    }
  }

  return results;
}

// ──────────────────────────────────────
// 오행 상성 분석
// ──────────────────────────────────────

function analyzeElementCompatibility(
  r1: SajuAnalysisResult,
  r2: SajuAnalysisResult,
): ElementCompatibility {
  const d1 = r1.fiveElements.dominant;
  const w1 = r1.fiveElements.weak;
  const d2 = r2.fiveElements.dominant;
  const w2 = r2.fiveElements.weak;

  // 보완적: 한 사람의 강한 오행이 다른 사람의 약한 오행을 생하거나 같으면 보완
  const complementary =
    d1 === w2 ||
    d2 === w1 ||
    ELEMENT_GENERATES[d1] === w2 ||
    ELEMENT_GENERATES[d2] === w1;

  const description = complementary
    ? `서로의 부족한 오행을 보완해 줄 수 있는 좋은 조합이에요.`
    : `오행 분포가 비슷하여 보완보다는 공감대가 강한 관계예요.`;

  return {
    person1Dominant: d1,
    person1Weak: w1,
    person2Dominant: d2,
    person2Weak: w2,
    complementary,
    description,
  };
}

// ──────────────────────────────────────
// 일간 관계 분석
// ──────────────────────────────────────

function analyzeDayStemRelation(
  p1: SajuPillars,
  p2: SajuPillars,
): DayStemRelation {
  const s1 = p1.day.stem;
  const s2 = p2.day.stem;
  const e1 = STEM_ELEMENT[s1];
  const e2 = STEM_ELEMENT[s2];
  const yy1 = STEM_YINYANG[s1];
  const yy2 = STEM_YINYANG[s2];

  const tenGod1to2 = getTenGod(e1, yy1, e2, yy2);
  const tenGod2to1 = getTenGod(e2, yy2, e1, yy1);

  const hasCheonganHap = CHEONGAN_HAP.some(
    ([a, b]) => (s1 === a && s2 === b) || (s1 === b && s2 === a),
  );

  let description: string;
  if (hasCheonganHap) {
    description = '일간끼리 천간합을 이루어 깊은 인연이 있어요.';
  } else if (['비견', '겁재'].includes(tenGod1to2)) {
    description = '같은 기운을 가져 동지이자 경쟁 관계예요.';
  } else if (['정관', '정인', '정재'].includes(tenGod1to2)) {
    description = '안정적이고 조화로운 관계를 이루기 좋아요.';
  } else if (['편관', '상관'].includes(tenGod1to2)) {
    description = '긴장감이 있지만 서로를 성장시키는 관계예요.';
  } else {
    description = '다양한 면에서 서로에게 자극이 되는 관계예요.';
  }

  return { person1DayStem: s1, person2DayStem: s2, tenGod1to2, tenGod2to1, hasCheonganHap, description };
}

// ──────────────────────────────────────
// 점수 산출
// ──────────────────────────────────────

function calculateScores(
  cheonganHaps: CheonganHapEntry[],
  jijiRelations: JijiRelationEntry[],
  elementCompat: ElementCompatibility,
  dayStemRelation: DayStemRelation,
): { scores: CompatibilityScore[]; totalScore: number } {
  const scores: CompatibilityScore[] = [];

  // 1. 천간합 점수 (최대 15)
  const dayHapBonus = cheonganHaps.some(
    (h) => h.position1 === '일간' || h.position2 === '일간',
  ) ? 10 : 0;
  const otherHaps = cheonganHaps.filter(
    (h) => h.position1 !== '일간' && h.position2 !== '일간',
  ).length;
  const hapScore = Math.min(dayHapBonus + otherHaps * 3, 15);
  scores.push({ category: '천간합', score: hapScore, maxScore: 15, description: `${cheonganHaps.length}개의 천간합` });

  // 2. 지지 육합 점수 (최대 15)
  const yukhaps = jijiRelations.filter((r) => r.type === '육합');
  const yukhapScore = Math.min(yukhaps.length * 5, 15);
  scores.push({ category: '지지 육합', score: yukhapScore, maxScore: 15, description: `${yukhaps.length}개의 육합` });

  // 3. 지지 삼합 점수 (최대 10)
  const samhaps = jijiRelations.filter((r) => r.type === '삼합');
  const samhapScore = Math.min(samhaps.length * 5, 10);
  scores.push({ category: '지지 삼합', score: samhapScore, maxScore: 10, description: `${samhaps.length}개의 삼합` });

  // 4. 지지 충 감점 (최대 -15)
  const chungs = jijiRelations.filter((r) => r.type === '충');
  const chungScore = Math.max(-chungs.length * 5, -15);
  scores.push({ category: '지지 충', score: chungScore, maxScore: 0, description: `${chungs.length}개의 충` });

  // 5. 오행 상성 (최대 10)
  const elementScore = elementCompat.complementary ? 10 : 3;
  scores.push({ category: '오행 상성', score: elementScore, maxScore: 10, description: elementCompat.description });

  // 6. 일간 관계 (최대 15)
  let dayStemScore = 5; // 기본
  if (dayStemRelation.hasCheonganHap) dayStemScore = 15;
  else if (['정관', '정인', '정재'].includes(dayStemRelation.tenGod1to2)) dayStemScore = 12;
  else if (['식신', '편인', '편재'].includes(dayStemRelation.tenGod1to2)) dayStemScore = 8;
  else if (['비견', '겁재'].includes(dayStemRelation.tenGod1to2)) dayStemScore = 6;
  else if (['편관', '상관'].includes(dayStemRelation.tenGod1to2)) dayStemScore = 3;
  scores.push({ category: '일간 관계', score: dayStemScore, maxScore: 15, description: dayStemRelation.description });

  // 기본 35점 + 가감점
  const rawTotal = 35 + scores.reduce((sum, s) => sum + s.score, 0);
  const totalScore = Math.max(0, Math.min(100, rawTotal));

  return { scores, totalScore };
}

function determineGrade(score: number): CompatibilityGrade {
  if (score >= 85) return '천생연분';
  if (score >= 70) return '좋은 궁합';
  if (score >= 50) return '보통';
  if (score >= 35) return '노력 필요';
  return '주의 필요';
}

// ──────────────────────────────────────
// 궁합 분석 메인 함수
// ──────────────────────────────────────

/**
 * 두 사람의 사주를 비교 분석한다.
 */
export function analyzeCompatibility(
  person1: SajuAnalysisResult,
  person2: SajuAnalysisResult,
): CompatibilityResult {
  const p1 = person1.pillars;
  const p2 = person2.pillars;

  const cheonganHaps = findCheonganHaps(p1, p2);
  const jijiRelations = findJijiRelations(p1, p2);
  const elementCompatibility = analyzeElementCompatibility(person1, person2);
  const dayStemRelation = analyzeDayStemRelation(p1, p2);
  const { scores, totalScore } = calculateScores(cheonganHaps, jijiRelations, elementCompatibility, dayStemRelation);
  const grade = determineGrade(totalScore);

  const summary = buildSummary(grade, cheonganHaps, jijiRelations, elementCompatibility, dayStemRelation);

  return {
    person1,
    person2,
    cheonganHaps,
    jijiRelations,
    elementCompatibility,
    dayStemRelation,
    scores,
    totalScore,
    grade,
    summary,
  };
}

function buildSummary(
  grade: CompatibilityGrade,
  haps: CheonganHapEntry[],
  relations: JijiRelationEntry[],
  elementCompat: ElementCompatibility,
  dayStem: DayStemRelation,
): string {
  const parts: string[] = [];

  const gradeText: Record<CompatibilityGrade, string> = {
    '천생연분': '두 분은 천생연분의 궁합이에요!',
    '좋은 궁합': '두 분은 좋은 궁합을 가지고 있어요.',
    '보통': '두 분은 보통 수준의 궁합이에요.',
    '노력 필요': '서로 노력이 필요한 궁합이에요.',
    '주의 필요': '서로 주의가 필요한 관계예요.',
  };
  parts.push(gradeText[grade]);

  if (haps.length > 0) {
    parts.push(`천간합이 ${haps.length}개 있어 자연스러운 조화가 있어요.`);
  }

  const yukhaps = relations.filter((r) => r.type === '육합');
  const chungs = relations.filter((r) => r.type === '충');
  if (yukhaps.length > 0) {
    parts.push(`지지 육합이 ${yukhaps.length}개로 안정적인 유대감이 있어요.`);
  }
  if (chungs.length > 0) {
    parts.push(`지지 충이 ${chungs.length}개 있어 갈등에 주의가 필요해요.`);
  }

  parts.push(elementCompat.description);
  parts.push(dayStem.description);

  return parts.join(' ');
}
