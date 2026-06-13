import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setPageTitle } from "../../../features/common/headerSlice";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import TitleCard from "../../../components/Cards/TitleCard";
import { formatInterviewAssessmentNotes } from "../../../utils/interviewAssessmentNotes";

const HRHiredCandidateDetail = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  const [candidate, setCandidate] = useState(null);
  const [invitationLetterFile, setInvitationLetterFile] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dispatch(setPageTitle({ title: "Detail Calon Pegawai" }));
    const fetchCandidate = async () => {
      try {
        const res = await axios.get(`/api/interviews/${id}`);
        const interviewData = res.data || {};
        setCandidate(interviewData);

        if (interviewData.candidate_id) {
          try {
            const callRes = await axios.get(
              `/api/candidate-calls/last/${interviewData.candidate_id}`,
            );
            setInvitationLetterFile(callRes.data?.invitation_letter_file || "");
          } catch {
            setInvitationLetterFile("");
          }
        }
      } catch (err) {
        console.error("Gagal mengambil data kandidat:", err);
        setCandidate(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCandidate();
  }, [dispatch, id]);

  // Debug: cek isi candidate
  console.log("DEBUG candidate:", candidate);
  if (loading) return <div className="p-4">Memuat data...</div>;
  if (!candidate) return <div className="p-4">Data tidak ditemukan</div>;

  return (
    <TitleCard
      title={<span className="text-2xl font-bold">Detail Calon Pegawai</span>}
      TopSideButtons={
        <button
          className="btn text-white"
          style={{
            backgroundColor: "#f97316",
            borderColor: "#ea580c",
            color: "#ffffff",
          }}
          onClick={() => navigate(-1)}
        >
          Kembali
        </button>
      }
    >
      <div className="p-6 space-y-6">
        {/* Main Info */}
        <div className="grid md:grid-cols-3 gap-6 items-start">
          {/* FOTO */}
          <div className="flex justify-center">
            <div className="w-48 h-48 bg-gray-200 rounded-xl overflow-hidden">
              <img
                src={
                  candidate.photo_file
                    ? candidate.photo_file.startsWith("http")
                      ? candidate.photo_file
                      : `http://localhost:5000/${candidate.photo_file.replace(/^\//, "")}`
                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(candidate.name || "-")}`
                }
                alt={candidate.name}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* DETAIL */}
          <div className="md:col-span-2 space-y-4">
            {/* Nama & Posisi  */}
            <div className="bg-base-200 p-4 rounded-xl">
              <h2 className="text-2xl font-bold">{candidate.name || "-"}</h2>
              <p className="text-gray-500">
                {candidate.base_position &&
                candidate.base_position.trim() !== ""
                  ? `${candidate.position_name || "-"} - ${candidate.base_position}`
                  : candidate.position_name || "-"}
              </p>
            </div>
            {/* Nama */}{" "}
            <div className="grid grid-cols-3">
              {" "}
              <p className="text-gray-500">Nama</p>{" "}
              <p className="col-span-2 font-semibold">
                {" "}
                {candidate.name || "-"}{" "}
              </p>{" "}
            </div>{" "}
            {/* Posisi */}{" "}
            <div className="grid grid-cols-3">
              {" "}
              <p className="text-gray-500">Posisi</p>{" "}
              <p className="col-span-2">
                {candidate.base_position &&
                candidate.base_position.trim() !== ""
                  ? `${candidate.position_name || "-"} - ${candidate.base_position}`
                  : candidate.position_name || "-"}
              </p>{" "}
            </div>
            {/* Email */}
            <div className="grid grid-cols-3">
              <p className="text-gray-500">Email</p>
              <p className="col-span-2">{candidate.email || "-"}</p>
            </div>
            {/* Tanggal */}
            <div className="grid grid-cols-3">
              <p className="text-gray-500">Tanggal Interview</p>
              <p className="col-span-2">
                {candidate.scheduled_date
                  ? new Date(candidate.scheduled_date).toLocaleDateString(
                      "id-ID",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      },
                    )
                  : "-"}
              </p>
            </div>
            <div className="grid grid-cols-3">
              <p className="text-gray-500">Alamat</p>
              <p>{candidate.address || "-"}</p>
            </div>
          </div>
        </div>
        {/* Informasi Tambahan */}
        <div className="border rounded-xl p-4 space-y-3">
          <h3 className="font-semibold text-lg">Informasi Tambahan</h3>
          <div className="grid grid-cols-3">
            <p className="text-gray-500">Pendidikan Terakhir</p>
            <p>
              {candidate.last_education || candidate.education_level || "-"}
            </p>
          </div>
          <div className="grid grid-cols-3">
            <p className="text-gray-500">Nama Sekolah/Universitas</p>
            <p>
              {candidate.institution || candidate.university
                ? ` ${candidate.institution || candidate.university}`
                : ""}
            </p>
          </div>
          <div className="grid grid-cols-3">
            <p className="text-gray-500">Jurusan/Program Studi</p>
            <p>{candidate.major ? ` ${candidate.major}` : ""}</p>
          </div>
          <div className="grid grid-cols-3">
            <p className="text-gray-500">Tahun Lulus</p>
            <p>
              {candidate.graduation_year
                ? ` (${candidate.graduation_year})`
                : ""}
            </p>
          </div>
          <div className="grid grid-cols-3">
            <p className="text-gray-500">Nilai/IPK</p>
            <p>
              {candidate.gpa
                ? candidate.education_level === "SMA" ||
                  candidate.education_level === "SMK"
                  ? Number(candidate.gpa) % 1 === 0
                    ? Number(candidate.gpa).toFixed(0)
                    : Number(candidate.gpa).toFixed(2)
                  : Number(candidate.gpa).toFixed(2)
                : "-"}
            </p>
          </div>
          <div className="grid grid-cols-3">
            <p className="text-gray-500">Penilaian Lamaran</p>
            <p>
              {candidate.rating === undefined ||
              candidate.rating === null ||
              candidate.rating === ""
                ? "-"
                : candidate.rating === 1 || candidate.rating === "1"
                  ? "Tidak Memenuhi"
                  : candidate.rating === 2 || candidate.rating === "2"
                    ? "Kurang"
                    : candidate.rating === 3 || candidate.rating === "3"
                      ? "Cukup / Standar"
                      : candidate.rating === 4 || candidate.rating === "4"
                        ? "Baik"
                        : candidate.rating === 5 || candidate.rating === "5"
                          ? "Sangat Baik / Unggul"
                          : candidate.rating}
            </p>
          </div>
          <div className="grid grid-cols-3">
            <p className="text-gray-500">Catatan Interviewer</p>
            <p className="whitespace-pre-line">
              {formatInterviewAssessmentNotes(candidate.interviewer_notes)}
            </p>
          </div>
        </div>
        <div className="alert alert-info">
          Kandidat ini telah dinyatakan lolos seleksi. Silakan kirim undangan
          kepada kandidat untuk datang ke kantor dan mengikuti proses
          onboarding. Setelah onboarding selesai, Anda dapat melanjutkan dengan
          membuat data pegawai.
        </div>
        {/* Action */}
        <div className="mt-6 flex flex-col sm:flex-row sm:justify-between gap-3 sm:gap-0">
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              className="btn btn-primary w-full sm:w-auto"
              disabled={Boolean(invitationLetterFile)}
              onClick={() =>
                navigate(`/app/Hire-candidates-detailmodal/${candidate.id}`)
              }
            >
              Kirim Undangan Onboarding
            </button>

            <button
              className="btn btn-outline btn-primary w-full sm:w-auto"
              disabled={!invitationLetterFile}
              onClick={() => {
                const url = invitationLetterFile.startsWith("http")
                  ? invitationLetterFile
                  : `http://localhost:5000/${invitationLetterFile.replace(/^\//, "")}`;
                window.open(url, "_blank");
              }}
            >
              Cetak Surat
            </button>
          </div>

          <button
            className="btn btn-success w-full sm:w-auto"
            disabled={!invitationLetterFile}
            onClick={() =>
              navigate("/app/employees", {
                state: { candidateToCreate: candidate },
              })
            }
            type="button"
          >
            Buatkan Data Pegawai
          </button>
        </div>
      </div>
    </TitleCard>
  );
};

export default HRHiredCandidateDetail;
