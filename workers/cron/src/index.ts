/* eslint-disable import/no-anonymous-default-export */
import { drizzle } from 'drizzle-orm/d1'
import * as schema from '../../../src/db/schema'
import dayjs from 'dayjs'
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import customParseFormat from "dayjs/plugin/customParseFormat";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import 'dayjs/locale/ja';
import team from '../../../team.json'
import { desc, eq } from 'drizzle-orm';

type RawData =
  | { type: 'point', value: string }
  | { type: 'name', value: string }
  | { type: 'country', value: string }
  | { type: 'created_at', value: string }
  | { type: 'impression', value: string }

dayjs.extend(utc);
dayjs.extend(timezone)
dayjs.extend(customParseFormat)
dayjs.extend(isSameOrAfter)
dayjs.locale('ja')

  class PointElementHandler implements HTMLRewriterElementContentHandlers {
  private current = "";
  
  constructor(private readonly rawData: RawData[]) {}

  text(element: Text) {
    this.current += element.text
    if (!element.lastInTextNode) return;

    this.rawData.push({ type: 'point', value: this.current })
    this.current = ''
  }
}

class NameElementHandler implements HTMLRewriterElementContentHandlers {
  private current = "";
  
  constructor(private readonly rawData: RawData[]) {}

  text(element: Text) {
    this.current += element.text
    if (!element.lastInTextNode) return;

    this.current = this.current.replace('&nbsp;', '').trim()

    this.rawData.push({ type: 'name', value: this.current })
    this.current = ''
  }
}

class CountryElementHandler implements HTMLRewriterElementContentHandlers {
  constructor(private readonly rawData: RawData[]) {}

  element(element: Element) {
    const value = element.getAttribute('title')
    if (value === null) return;
    this.rawData.push({ type: 'country', value })
  }
}

class DateTimeHanlder implements HTMLRewriterElementContentHandlers {
  private current = ''
  constructor(private readonly rawData: RawData[]) {}

  text(element: Text) {
    if (element.text.match(/\(.+\)/)) return;

    this.current += element.text
    if (!element.lastInTextNode) return;

    this.rawData.push({ type: 'created_at', value: this.current })
    this.current = ''
  }
}


class ImpresionElementHandler implements HTMLRewriterElementContentHandlers {
  private current = "";
  
  constructor(private readonly rawData: RawData[]) {}

  text(element: Text) {
    this.current += element.text
    if (!element.lastInTextNode) return;

    this.current = this.current.replace(/\t/g, '')

    this.rawData.push({ type: 'impression', value: this.current })
    this.current = ''
  }
}

export default {
  async fetchWorkPage (no: number) {
    const url = `https://manbow.nothing.sh/event/event.cgi?action=More_def&num=${no}&event=149`

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'text/html',
        'Accept-Charset': 'UTF-8',
        'Accept-Language': 'ja'
      }
    })

    const decoder = new TextDecoder('Shift_JIS')
    const uint8Array = new Uint8Array(await res.arrayBuffer())
    const decodedText = decoder.decode(uint8Array)

    console.log(res.headers)

    const rawData: RawData[] = []

    const rewrote = new HTMLRewriter()
      .on('.spost .points_oneline', new PointElementHandler(rawData))
      .on('.spost .entry-c .entry-title:first-child strong', new NameElementHandler(rawData))
      .on('.spost .entry-c .entry-title:first-child strong img[title]', new CountryElementHandler(rawData))
      .on('.spost .entry-c .entry-title:first-child small', new DateTimeHanlder(rawData))
      .on('.spost .entry-c .entry-title:nth-child(2)', new ImpresionElementHandler(rawData))
      .transform(new Response(
        decodedText, { headers: res.headers }
      ))

    await rewrote.arrayBuffer()

    interface Result {
      point: string,
      name: string,
      country: string,
      created_at: string
      impression: string
    }

    console.log(rawData)
    const resObjects: Result[] = []

    for (let i = 0; i < rawData.length; i += 6) {
      if (rawData.length < i + 6) break

      resObjects.push({
        point: rawData[i]?.value ?? '',
        name: rawData[i + 1]?.value ?? '',
        country: rawData[i + 2]?.value ?? '',
        created_at: rawData[i + 3]?.value ?? '',
        impression: rawData[i + 5]?.value ?? '',
      })
    }

    return resObjects
  },

  async scheduled (_event, env: CronEnv, _ctx): Promise<void> {
    const db = drizzle(env.mochiuni_stats_db)

    for (const targetWorkNo of team.workNo) {
      const data = await this.fetchWorkPage(targetWorkNo)
      if (data.length === 0) return;
  
      // TODO: すでに登録されているレコードの最終投稿日時を取得。同じものが取得されればスキップする
      const lastRecord = await db.select().from(schema.impression).where(eq(schema.impression.workNo, targetWorkNo)).orderBy(desc(schema.impression.postedAt)).limit(1)
  
      const impressions =data.filter((d) => {
        return lastRecord.length === 0 || dayjs(d.created_at, ' YYYY年MM月DD日 HH:mm ', 'ja', true).isAfter(dayjs(lastRecord[0]?.postedAt))
      }).map((d) => {
        return {
          workNo: targetWorkNo,
          // TODO: hashの生成ロジックが必要です。ユニークな識別子として何を使うか決める必要があります。
          hash: crypto.randomUUID(), 
          name: d.name,
          country: d.country,
          point: parseInt(d.point) || 0, // 数値に変換
          isVote: 0,
          comment: d.impression.replace(/\0/g, '').trim(),
          postedAt: dayjs(d.created_at, ' YYYY年MM月DD日 HH:mm ', 'ja', true).toDate(), // Dateオブジェクトに変換
          fetchedAt: dayjs().toDate()
        }
      })

      if (impressions.length > 0) {
        try {
          await db.insert(schema.impression).values(impressions);
        } catch (e) {
          console.error('Failed to insert records:', e);
        }
      }
    }
  }
}
