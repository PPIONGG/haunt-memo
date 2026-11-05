import type { ArchiveStory } from "@/domain/archive";

/**
 * Made-up sample Stories for previewing the Archive without Supabase.
 * Used only when `HAUNT_MEMO_DEMO=1` (see README.md). The YouTube ids are placeholders,
 * so thumbnails don't load and "Open in YouTube" leads nowhere.
 */
const tag = (id: string, name: string) => ({ id: `tag-${id}`, name });
const teller = (id: string, name: string) => ({ id: `teller-${id}`, name });

const TAGS = {
  house: tag("house", "ผีบ้าน"),
  hospital: tag("hospital", "โรงพยาบาล"),
  military: tag("military", "ทหาร"),
  road: tag("road", "ถนน"),
  temple: tag("temple", "วัด"),
  school: tag("school", "โรงเรียน"),
};

const TELLERS = {
  a: teller("a", "พี่นัท"),
  b: teller("b", "น้องมิว"),
  c: teller("c", "ลุงชาญ"),
  d: teller("d", "ป้าแดง"),
};

export const DEMO_ARCHIVE: ArchiveStory[] = [
  {
    id: "demo-1",
    youtubeId: "demo0000001",
    displayTitle: "เวรดึกตึกเก่า",
    synopsis:
      "พยาบาลจบใหม่ได้รับมอบหมายให้ขึ้นเวรดึกที่ตึกผู้ป่วยหลังเก่า ซึ่งใกล้จะปิดปรับปรุง คืนแรกทุกอย่างดูปกติ จนกระทั่งกริ่งเรียกจากห้องที่ไม่มีผู้ป่วยดังขึ้นตอนตีสาม",
    scareLevel: 5,
    broadcastDate: "2025-10-31",
    addedAt: "2026-11-01T12:00:00Z",
    province: "เชียงใหม่",
    place: "โรงพยาบาลประจำอำเภอ",
    tags: [TAGS.hospital],
    storytellers: [TELLERS.b],
  },
  {
    id: "demo-2",
    youtubeId: "demo0000002",
    displayTitle: "บ้านเช่าราคาถูก",
    synopsis:
      "ครอบครัวเล็ก ๆ ย้ายเข้าบ้านเช่าที่ราคาถูกเกินจริง เจ้าของบ้านขอไว้ข้อเดียวว่าห้ามเปิดห้องเก็บของชั้นบน ลูกสาวคนเล็กเริ่มเล่าว่ามีเพื่อนใหม่มาชวนเล่นทุกคืน",
    scareLevel: 4,
    broadcastDate: "2025-06-14",
    addedAt: "2026-10-28T12:00:00Z",
    province: "นนทบุรี",
    place: null,
    tags: [TAGS.house],
    storytellers: [TELLERS.a],
  },
  {
    id: "demo-3",
    youtubeId: "demo0000003",
    displayTitle: "ยามชายแดน",
    synopsis:
      "ทหารเกณฑ์สองนายได้รับคำสั่งให้เฝ้าป้อมที่ชายแดนในคืนฝนตกหนัก วิทยุติดต่อกับฐานขาดหาย และมีเสียงเรียกชื่อพวกเขาจากในป่า ด้วยน้ำเสียงของหัวหน้าหมู่ที่ควรจะอยู่ที่ฐาน",
    scareLevel: 3,
    broadcastDate: "2024-12-02",
    addedAt: "2026-10-20T12:00:00Z",
    province: "กาญจนบุรี",
    place: "ป้อมยามริมชายแดน",
    tags: [TAGS.military],
    storytellers: [TELLERS.c],
  },
  {
    id: "demo-4",
    youtubeId: "demo0000004",
    displayTitle: "โบกรถกลางทางโค้ง",
    synopsis:
      "คนขับรถบรรทุกเห็นหญิงสาวยืนโบกรถอยู่ตรงทางโค้งบนเขาตอนเที่ยงคืน เขาตัดสินใจจอดรับ เธอบอกจุดหมายเป็นหมู่บ้านที่เขาไม่เคยได้ยินชื่อมาก่อน",
    scareLevel: 2,
    broadcastDate: "2024-08-09",
    addedAt: "2026-10-12T12:00:00Z",
    province: "เพชรบูรณ์",
    place: null,
    tags: [TAGS.road],
    storytellers: [TELLERS.d, TELLERS.a],
  },
  {
    id: "demo-5",
    youtubeId: "demo0000005",
    displayTitle: "ศาลาท้ายวัด",
    synopsis:
      "เด็กวัดได้รับหน้าที่ปิดไฟศาลาท้ายวัดทุกคืน วันหนึ่งเขาพบว่ามีคนมานั่งพนมมืออยู่ในศาลาก่อนแล้ว ทั้งที่ประตูวัดปิดไปตั้งแต่หัวค่ำ",
    scareLevel: 3,
    broadcastDate: "2023-11-20",
    addedAt: "2026-10-05T12:00:00Z",
    province: "อยุธยา",
    place: null,
    tags: [TAGS.temple],
    storytellers: [TELLERS.c],
  },
  {
    id: "demo-6",
    youtubeId: "demo0000006",
    displayTitle: "ห้องเรียนชั้นสาม",
    synopsis:
      "นักเรียนกลุ่มหนึ่งแอบอยู่ทำงานกลุ่มจนค่ำในอาคารเรียนเก่า ไฟชั้นสามเปิดขึ้นเองทั้งที่ชั้นนั้นถูกปิดไว้หลายปี เพื่อนคนหนึ่งยืนยันว่าเห็นครูเดินผ่านหน้าต่าง",
    scareLevel: 1,
    broadcastDate: "2023-05-03",
    addedAt: "2026-09-30T12:00:00Z",
    province: null,
    place: null,
    tags: [TAGS.school, TAGS.house],
    storytellers: [TELLERS.b],
  },
];
