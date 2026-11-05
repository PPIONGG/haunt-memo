/** The admin form fields that come from a YouTube clip. */
export type ClipFields = {
  youtubeId: string | null;
  youtubeTitle: string;
  displayTitle: string;
  broadcastDate: string;
};

/** What fetching a clip found. Any part YouTube didn't give us is null. */
export type ClipLookup = {
  youtubeId: string;
  title: string | null;
  publishDate: string | null;
};

export type PrefillWarning = "title_missing" | "date_missing";

export type ClipPrefill = {
  fields: ClipFields;
  /** The clip the fields now come from. Pass it back in on the next fetch. */
  filledFrom: string;
  warnings: PrefillWarning[];
};

/**
 * Fills the clip fields of the admin form from a fetched clip.
 *
 * `filledFrom` is the clip the form was last filled from (or the saved clip when editing).
 * - A different clip brings its own Broadcast Date, even an empty one, so a Story never keeps
 *   the date of a clip it isn't about. The Display Title follows too, unless the Curator wrote their own.
 * - Fetching the same clip again keeps whatever the Curator has corrected, and only fills empty fields.
 */
export function prefillFromClip(current: ClipFields, filledFrom: string | null, clip: ClipLookup): ClipPrefill {
  const newClip = clip.youtubeId !== filledFrom;
  const titleWasAuto = !current.displayTitle || current.displayTitle === current.youtubeTitle;

  const fields: ClipFields = newClip
    ? {
        youtubeId: clip.youtubeId,
        youtubeTitle: clip.title ?? "",
        displayTitle: titleWasAuto ? (clip.title ?? "") : current.displayTitle,
        broadcastDate: clip.publishDate ?? "",
      }
    : {
        youtubeId: clip.youtubeId,
        youtubeTitle: clip.title ?? current.youtubeTitle,
        displayTitle: current.displayTitle || clip.title || "",
        broadcastDate: current.broadcastDate || clip.publishDate || "",
      };

  const warnings: PrefillWarning[] = [];
  if (!clip.title) warnings.push("title_missing");
  if (newClip && !clip.publishDate) warnings.push("date_missing");

  return { fields, filledFrom: clip.youtubeId, warnings };
}
