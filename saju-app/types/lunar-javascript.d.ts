declare module 'lunar-javascript' {
  export class Solar {
    static fromYmd(year: number, month: number, day: number): Solar;
    static fromYmdHms(year: number, month: number, day: number, hour: number, minute: number, second: number): Solar;
    getLunar(): Lunar;
    getYear(): number;
    getMonth(): number;
    getDay(): number;
    getHour(): number;
    subtract(solar: Solar): number;
    subtractMinute(solar: Solar): number;
    toYmd(): string;
    toYmdHms(): string;
    next(days: number): Solar;
  }

  export class Lunar {
    static fromYmd(year: number, month: number, day: number): Lunar;
    static fromYmdHms(year: number, month: number, day: number, hour: number, minute: number, second: number): Lunar;
    getSolar(): Solar;
    getEightChar(): EightChar;
    getYear(): number;
    getMonth(): number;
    getDay(): number;
    getNextJie(wholeDay?: boolean): JieQi;
    getPrevJie(wholeDay?: boolean): JieQi;
  }

  export interface JieQi {
    getName(): string;
    getSolar(): Solar;
  }

  export interface LiuNian {
    year: number;
    age: number;
    getGanZhi(): string;
  }

  export interface DaYun {
    getIndex(): number;
    getStartAge(): number;
    getEndAge(): number;
    getStartYear(): number;
    getEndYear(): number;
    getGanZhi(): string;
    getLiuNian(n?: number): LiuNian[];
  }

  export interface Yun {
    isForward(): boolean;
    getStartYear(): number;
    getStartMonth(): number;
    getStartDay(): number;
    getStartHour(): number;
    getDaYun(n?: number): DaYun[];
    getLunar(): Lunar;
  }

  export class EightChar {
    getYear(): string;
    getMonth(): string;
    getDay(): string;
    getTime(): string;
    getYearGan(): string;
    getYearZhi(): string;
    getMonthGan(): string;
    getMonthZhi(): string;
    getDayGan(): string;
    getDayZhi(): string;
    getTimeGan(): string;
    getTimeZhi(): string;
    getYun(gender: number, sect?: number): Yun;
    getLunar(): Lunar;
  }

  export class LunarYear {
    static fromYear(year: number): LunarYear;
  }
}
