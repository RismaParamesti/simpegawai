const normalizeText = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

export const getHiredCandidateJobLabel = (candidate) => {
  if (candidate?.job_title) return candidate.job_title;
  if (candidate?.base_position && candidate?.position_name) {
    return `${candidate.position_name} - ${candidate.base_position}`;
  }
  return (
    candidate?.position_name ||
    candidate?.base_position ||
    candidate?.job_opening_title ||
    "-"
  );
};

const getCandidateKeys = (candidate) => {
  const keys = new Set();
  [
    candidate?.candidate_id,
    candidate?.candidateId,
    candidate?.candidate?.id,
  ].forEach((value) => {
    if (value) keys.add(`candidate:${value}`);
  });

  [
    candidate?.application_id,
    candidate?.applicationId,
    candidate?.id,
    candidate?._id,
  ].forEach((value) => {
    if (value) keys.add(`application:${value}`);
  });

  const email = normalizeText(candidate?.candidate_email || candidate?.email);
  if (email) keys.add(`email:${email}`);

  const name = normalizeText(candidate?.candidate_name || candidate?.name);
  if (name) keys.add(`name:${name}`);

  return Array.from(keys);
};

export const buildHiredCandidateLookup = (hiredCandidates = []) => {
  const lookup = new Map();

  hiredCandidates.forEach((candidate) => {
    const info = {
      ...candidate,
      hiredJobLabel: getHiredCandidateJobLabel(candidate),
    };

    getCandidateKeys(candidate).forEach((key) => {
      lookup.set(key, info);
    });
  });

  return lookup;
};

export const findHiredCandidateInfo = (lookup, candidate) => {
  if (!lookup) return null;

  for (const key of getCandidateKeys(candidate)) {
    const match = lookup.get(key);
    if (match) return match;
  }

  return null;
};

const unmanagedApplicationStatuses = new Set([
  "submitted",
  "pending",
  "baru",
  "new",
  "belum_dikelola",
  "belum dikelola",
]);

const unscheduledInterviewStatuses = new Set([
  "lolos_dokumen",
  "lolos dokumen",
]);

const pendingInterviewStatuses = new Set([
  "scheduled",
  "rescheduled",
  "interview_scheduled",
  "interview scheduled",
  "jadwal_interview",
  "jadwal interview",
  "jadwal wawancara",
  "wawancara",
]);

const pendingRecruitmentStatuses = new Set([
  "submitted",
  "pending",
  "lolos_dokumen",
  "lolos dokumen",
  "scheduled",
  "rescheduled",
  "interview_scheduled",
  "interview scheduled",
  "jadwal_interview",
  "jadwal interview",
  "jadwal wawancara",
  "wawancara",
]);

const finalRecruitmentStatuses = new Set([
  "screening",
  "ditolak",
  "rejected",
  "diterima",
  "accepted",
  "passed",
  "failed",
  "completed",
  "disqualified",
  "cancelled",
  "canceled",
  "canceled_by_company",
  "withdrawn",
]);

const finalInterviewResults = new Set([
  "passed",
  "failed",
  "disqualified",
  "no_show",
]);

export const isPendingRecruitmentWarningCandidate = (candidate = {}) => {
  const status = normalizeText(
    candidate.status ||
      candidate.application_status ||
      candidate.interview_status,
  );
  const result = normalizeText(candidate.result || candidate.interview_result);

  if (finalInterviewResults.has(result)) return false;
  if (finalRecruitmentStatuses.has(status)) return false;

  return pendingRecruitmentStatuses.has(status);
};

export const isUnmanagedApplicationWarningCandidate = (candidate = {}) => {
  const status = normalizeText(
    candidate.status ||
      candidate.application_status ||
      candidate.interview_status,
  );
  const result = normalizeText(candidate.result || candidate.interview_result);

  if (finalInterviewResults.has(result)) return false;
  if (finalRecruitmentStatuses.has(status)) return false;

  return unmanagedApplicationStatuses.has(status);
};

export const isUnscheduledInterviewWarningCandidate = (candidate = {}) => {
  const status = normalizeText(
    candidate.status ||
      candidate.application_status ||
      candidate.interview_status,
  );
  const result = normalizeText(candidate.result || candidate.interview_result);

  if (finalInterviewResults.has(result)) return false;
  if (finalRecruitmentStatuses.has(status)) return false;

  return unscheduledInterviewStatuses.has(status);
};

export const isPendingInterviewWarningCandidate = (candidate = {}) => {
  const status = normalizeText(
    candidate.status ||
      candidate.application_status ||
      candidate.interview_status,
  );
  const result = normalizeText(candidate.result || candidate.interview_result);

  if (finalInterviewResults.has(result)) return false;
  if (finalRecruitmentStatuses.has(status)) return false;

  return pendingInterviewStatuses.has(status);
};
