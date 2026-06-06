export const ASSESSMENT_START = "[ASSESSMENT_CRITERIA]";
export const ASSESSMENT_END = "[/ASSESSMENT_CRITERIA]";

export const formatAssessmentWeight = (value) => {
  if (value === null || value === undefined || value === "") return "-";

  const raw = String(value).trim();
  if (raw.endsWith("%")) return raw;

  const number = Number(raw);
  return Number.isFinite(number) ? `${number}%` : raw;
};

export const parseInterviewAssessmentNotes = (notes) => {
  const rawNotes = String(notes || "");
  const startIndex = rawNotes.indexOf(ASSESSMENT_START);
  const endIndex = rawNotes.indexOf(ASSESSMENT_END);

  if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
    return { notes: rawNotes.trim(), assessment: null };
  }

  const cleanNotes = `${rawNotes.slice(0, startIndex)}${rawNotes.slice(
    endIndex + ASSESSMENT_END.length,
  )}`.trim();
  const assessmentJson = rawNotes
    .slice(startIndex + ASSESSMENT_START.length, endIndex)
    .trim();

  try {
    return { notes: cleanNotes, assessment: JSON.parse(assessmentJson) };
  } catch (error) {
    return { notes: cleanNotes, assessment: null };
  }
};

export const formatInterviewAssessmentNotes = (notes, fallback = "-") => {
  const parsed = parseInterviewAssessmentNotes(notes);
  const criteria = Array.isArray(parsed.assessment?.criteria)
    ? parsed.assessment.criteria
    : [];
  const lines = [];

  if (criteria.length) {
    lines.push("Nilai kriteria penilaian:");
    criteria.forEach((item) => {
      const criterion = String(item?.criterion || "Kriteria").trim();
      const achievedScore = item?.achieved_score ?? 0;
      const maximumScore = item?.maximum_score || 100;
      const weight = item?.weight_percentage ?? item?.score ?? "";
      lines.push(
        `- ${criterion}: ${achievedScore}/${maximumScore} (bobot ${formatAssessmentWeight(weight)})`,
      );
    });

    const totalScore =
      parsed.assessment?.total_score ??
      parsed.assessment?.percentage ??
      parsed.assessment?.rating;
    if (totalScore !== undefined && totalScore !== null && totalScore !== "") {
      lines.push(`Rata-rata berbobot: ${totalScore}/100`);
    }
  }

  if (parsed.notes) {
    if (lines.length) lines.push("");
    lines.push("Catatan:");
    lines.push(parsed.notes);
  }

  return lines.length ? lines.join("\n") : fallback;
};
