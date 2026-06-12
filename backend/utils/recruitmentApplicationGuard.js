const ACCEPTED_APPLICATION_STATUSES = ["diterima", "accepted"];
const FINAL_APPLICATION_STATUSES = [
  "diterima",
  "accepted",
  "ditolak",
  "rejected",
  "withdrawn",
  "canceled_by_company",
];

const buildAlreadyAcceptedNotes = (acceptedApplication) => {
  const jobLabel =
    acceptedApplication?.job_title ||
    acceptedApplication?.position_name ||
    "lowongan lain";

  return `Tidak lolos karena kandidat sudah lolos pada lowongan ${jobLabel}.`;
};

const query = (connection, sql, params) => connection.query(sql, params);

const findAcceptedApplication = async (
  connection,
  candidateId,
  exceptApplicationId = null,
) => {
  const params = [candidateId, ACCEPTED_APPLICATION_STATUSES];
  let exceptClause = "";

  if (exceptApplicationId) {
    exceptClause = "AND a.id <> ?";
    params.push(exceptApplicationId);
  }

  const [rows] = await query(
    connection,
    `SELECT a.id, a.candidate_id, a.job_opening_id, a.status,
            jo.title AS job_title, p.name AS position_name
     FROM applications a
     LEFT JOIN job_openings jo ON a.job_opening_id = jo.id
     LEFT JOIN positions p ON jo.position_id = p.id
     WHERE a.candidate_id = ?
       AND a.status IN (?)
       ${exceptClause}
     ORDER BY a.reviewed_at DESC, a.submitted_at DESC, a.id DESC
     LIMIT 1`,
    params,
  );

  return rows[0] || null;
};

const cancelActiveInterviewsForRejectedApplications = async (
  connection,
  candidateId,
  exceptApplicationId,
  notes,
) => {
  const params = [notes, candidateId];
  let exceptClause = "";

  if (exceptApplicationId) {
    exceptClause = "AND a.id <> ?";
    params.push(exceptApplicationId);
  }

  await query(
    connection,
    `UPDATE interviews i
     JOIN applications a ON a.id = i.application_id
     SET i.status = 'disqualified',
         i.result = 'disqualified',
         i.interviewer_notes = COALESCE(i.interviewer_notes, ?),
         i.updated_at = NOW()
     WHERE a.candidate_id = ?
       ${exceptClause}
       AND i.status IN ('scheduled', 'rescheduled', 'completed', '')`,
    params,
  );
};

const rejectOtherActiveApplications = async (
  connection,
  candidateId,
  acceptedApplicationId,
  notes = "Tidak lolos karena kandidat sudah lolos pada lowongan lain.",
) => {
  await query(
    connection,
    `UPDATE applications
     SET status = 'ditolak',
         admin_notes = COALESCE(admin_notes, ?),
         reviewed_at = NOW()
     WHERE candidate_id = ?
       AND id <> ?
       AND status NOT IN (?)`,
    [notes, candidateId, acceptedApplicationId, FINAL_APPLICATION_STATUSES],
  );

  await cancelActiveInterviewsForRejectedApplications(
    connection,
    candidateId,
    acceptedApplicationId,
    notes,
  );
};

const rejectApplicationBecauseCandidateAccepted = async (
  connection,
  application,
  acceptedApplication,
) => {
  const notes = buildAlreadyAcceptedNotes(acceptedApplication);

  await query(
    connection,
    `UPDATE applications
     SET status = 'ditolak',
         admin_notes = ?,
         reviewed_at = NOW()
     WHERE id = ?`,
    [notes, application.id],
  );

  await query(
    connection,
    `UPDATE interviews
     SET status = 'disqualified',
         result = 'disqualified',
         interviewer_notes = COALESCE(interviewer_notes, ?),
         updated_at = NOW()
     WHERE application_id = ?
       AND status IN ('scheduled', 'rescheduled', 'completed', '')`,
    [notes, application.id],
  );

  return notes;
};

module.exports = {
  ACCEPTED_APPLICATION_STATUSES,
  findAcceptedApplication,
  rejectApplicationBecauseCandidateAccepted,
  rejectOtherActiveApplications,
};
