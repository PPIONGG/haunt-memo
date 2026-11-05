# Image prompts for Gemini

Prompts for generating the Archive's images with Gemini (or any image model). They follow one style so every image looks like part of the same site: a flat, cinematic night scene with one light source, set in Thailand, with no text in the image.

Write the prompt in English: image models follow English more closely. Generate one image, check it against the brief, and change the prompt instead of regenerating the same one. Save the result as WebP.

## Where AI images are used

| Image | Used for | Size |
|---|---|---|
| Story cover | A Story's picture in place of its YouTube thumbnail (Phase 2: needs a cover field and upload in the admin area) | 1920×1080 (16:9) |
| Link preview | The picture Instagram, LINE and Facebook show when someone shares the site link | 1200×630 |
| Site icon | Browser tab, home screen icon | 1024×1024 |
| Empty state | "No Stories match" in Search, nothing yet in Mine | 1200×900 |

Until Story covers exist, the site shows each Story's YouTube thumbnail.

## Story cover in one paste

Gemini can watch a YouTube clip itself. Paste this into Gemini, changing only the link on the first line. If Gemini answers with a summary instead of an image, reply "สร้างภาพตามนี้เลย". For a batch, stay in one chat and add "ใช้สไตล์เดียวกับภาพก่อนหน้า" under the link.

```text
ดูคลิปเรื่องผีนี้: https://www.youtube.com/watch?v=VIDEO_ID

แล้วสร้างภาพปก 1 ภาพสำหรับเรื่องนี้ ตามกติกา:
- ใช้ฉากช่วงต้นเรื่องที่ทำให้คนอยากฟังต่อ ห้ามสปอยล์ตอนจบ ห้ามโชว์ตัวผีชัด ๆ ห้ามมีเลือด
- สถานที่ในภาพต้องตรงกับในเรื่อง และดูเป็นประเทศไทย
- ถ้ามีคน ให้เป็นเงาดำตัวเล็ก ๆ อยู่ไกล ไม่เห็นหน้า
- ห้ามมีตัวหนังสือ โลโก้ หรือลายน้ำในภาพ

Image style (follow exactly):
A flat, cinematic illustration. Night. One single light source, everything else falls into deep shadow.
Limited palette of three or four muted colours plus that one glowing light. The darkest tones are near #0b0b0c so the image blends into a near-black page.
Simple geometric shapes and soft gradients. No fine texture, no film grain, no noise.
Composition: the subject slightly off-centre, with calm dark space across the bottom fifth for a title.
Wide 16:9, 1920×1080. No text, no letters, no logos, no watermark, no faces, no blood.

ตอบกลับเป็นภาพอย่างเดียว ไม่ต้องอธิบาย
```

## Story cover from a written scene

When you'd rather describe the scene yourself, fill in the three `{…}` parts from the Story's Synopsis. Show the set-up, never the ending, the ghost or anything gory.

```text
A flat, cinematic illustration of {ONE CONCRETE SCENE FROM THE STORY'S SET-UP}, in {A PLACE IN THAILAND}.
Night. One single light source: {THE LIGHT, e.g. a lit doorway, one window, headlights}. Everything else falls into deep shadow.
Limited palette of three or four muted colours plus that one glowing light. The darkest tones are near #0b0b0c so the image blends into a near-black page.
Simple geometric shapes and soft gradients. No fine texture, no film grain, no noise.
A person may appear only as a small, faceless silhouette, far from the viewer.
Composition: the subject slightly off-centre, with calm dark space across the bottom fifth for a title.
Wide 16:9, 1920×1080.
No text, no letters, no logos, no watermark, no faces, no blood.
```

Example for เวรดึกตึกเก่า:

```text
A flat, cinematic illustration of a long, empty hospital corridor in an old provincial hospital ward, seen from one end, in northern Thailand.
Night. One single light source: a doorway at the far end of the corridor, glowing pale green, with a small dark silhouette standing in it. Everything else falls into deep shadow.
Limited palette of three or four muted colours plus that one glowing light. The darkest tones are near #0b0b0c so the image blends into a near-black page.
Simple geometric shapes and soft gradients. No fine texture, no film grain, no noise.
A person may appear only as a small, faceless silhouette, far from the viewer.
Composition: the subject slightly off-centre, with calm dark space across the bottom fifth for a title.
Wide 16:9, 1920×1080.
No text, no letters, no logos, no watermark, no faces, no blood.
```

To keep every cover in the same style, generate them in one Gemini chat and add "Same style as the previous image" to each new prompt, or attach an earlier cover as a reference.

## Link preview

The site adds its name and tagline in code, so the image itself carries no text.

```text
A flat, cinematic illustration of a quiet Thai village lane at night: an old wooden house on stilts with one lit window, and a small spirit house (san phra phum) beside it with a faint candle glow.
One warm light source, everything else in deep blue-black shadow. Darkest tones near #0b0b0c.
Simple geometric shapes, soft gradients, no texture or grain.
Composition: the house and spirit house on the right third; the left half is calm, empty dark sky for a title.
Wide 1200×630.
No text, no letters, no logos, no watermark, no people.
```

## Site icon

```text
A flat app icon: one simple, rounded ghost shape in off-white #f2f2f2, centred on a solid #0b0b0c square, with two small dark oval eyes.
One solid colour on one solid background. No gradient, no glow, no shadow, no outline, no text.
Square 1024×1024, the ghost filling about 60% of the height.
```

## Empty state

```text
A flat, cinematic illustration of a single unlit candle on a dark wooden floor, a thin wisp of smoke rising from the wick.
One faint cool light from the upper left, everything else in shadow. Background exactly #161618 so it blends into a dark card.
Simple geometric shapes, soft gradients, no texture or grain.
Composition: the candle centred in the lower half, lots of empty dark space around it.
1200×900.
No text, no letters, no logos, no watermark.
```
