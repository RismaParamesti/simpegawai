import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setPageTitle } from "../features/common/headerSlice";
import api from "../lib/api";
import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  CalendarDays,
  Clock3,
  Eye,
  MapPin,
  Wallet,
} from "lucide-react";
import { formatDateOnly, getTodayDateKey, toDateInputValue } from "../utils/dateUtils";

import "swiper/css";
import "swiper/css/navigation";

// Fungsi untuk menampilkan waktu relatif (misal: '2 jam lalu')
function timeAgo(dateString) {
  if (!dateString) return "";
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return `${diffSec} detik lalu`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} menit lalu`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} jam lalu`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 30) return `${diffDay} hari lalu`;
  const diffMonth = Math.floor(diffDay / 30);
  if (diffMonth < 12) return `${diffMonth} bulan lalu`;
  const diffYear = Math.floor(diffMonth / 12);
  return `${diffYear} tahun lalu`;
}

export default function CandidateJobsPage() {
  const dispatch = useDispatch();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const [swiperRef, setSwiperRef] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    dispatch(setPageTitle({ title: "Lowongan Pekerjaan" }));
  }, [dispatch]);

  useEffect(() => {
    setLoading(true);

    api
      .get("/job-openings")
      .then((res) => {
        const jobsData = res.data.jobs || [];
        const todayDateKey = getTodayDateKey();
        const visible = jobsData.filter((job) => {
          if (job.status !== "open") return false;
          if (!job.deadline) return true;
          return toDateInputValue(job.deadline) >= todayDateKey;
        });
        setJobs(visible);
      })
      .catch(() => {
        setError("Gagal mengambil data lowongan.");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleApply = (jobId) => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
    } else {
      navigate(`/candidate/apply/${jobId}`);
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const q = search.toLowerCase();

    return (
      (job.position_name || "").toLowerCase().includes(q) ||
      (job.department_name || "").toLowerCase().includes(q) ||
      (job.description || "").toLowerCase().includes(q)
    );
  });

  const cardVariant = {
    hidden: {
      opacity: 0,
      y: 50,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
      },
    },
  };

  return (
    <div className="bg-base-200 min-h-screen">
      {/* NAVBAR */}
      <div className="navbar bg-base-100 shadow-md sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center px-4">
          <div className="flex items-center gap-3">
            <img
              src="/logo2.svg"
              alt="Otak Kanan Logo"
              className="h-12 w-auto object-contain"
            />

            <span className="font-bold text-xl text-primary leading-none">
              PT Otak Kanan Careers
            </span>
          </div>

          <div className="flex gap-3">
            <Link to="/login?role=kandidat" className="btn btn-primary btn-sm">
              Login
            </Link>

            <Link
              to="/register?role=kandidat"
              className="btn btn-outline btn-primary btn-sm"
            >
              Daftar
            </Link>
          </div>
        </div>
      </div>

      {/* Hero */}
      <section
        className="hero relative overflow-hidden text-white py-28
bg-gradient-to-r from-[#F58220] via-orange-500 to-yellow-400
animate-gradient"
      >
        {/* overlay glow */}
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl sm:-left-32 sm:-top-32 sm:h-[500px] sm:w-[500px]"></div>
        <div className="absolute right-[-80px] top-20 h-64 w-64 rounded-full bg-yellow-300/20 blur-3xl sm:right-[-120px] sm:h-[400px] sm:w-[400px]"></div>

        <div className="hero-content text-center flex-col relative z-10">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Temukan Karier Impianmu
          </h1>

          <p className="opacity-90 max-w-xl mb-10 text-lg">
            Bergabunglah dengan tim terbaik di PT Otak Kanan dan bangun masa
            depan kariermu bersama kami.
          </p>

          <input
            type="text"
            placeholder="Cari posisi, departemen..."
            className="input input-bordered w-full max-w-xl text-black shadow-2xl rounded-full px-6 h-14"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </section>

      {/* WARNING FRAUD */}
      <section className="container mx-auto px-5 py-6">
        <div className="alert bg-yellow-50 border border-yellow-200 text-yellow-800 shadow">
          <div>
            <h3 className="font-bold">⚠ Peringatan Penipuan Rekrutmen</h3>

            <div className="text-sm">
              PT Otak Kanan tidak pernah meminta biaya apapun dalam proses
              rekrutmen. Semua informasi lowongan hanya tersedia melalui website
              resmi perusahaan.
            </div>
          </div>
        </div>
      </section>

      {/* JOB LIST   */}
      <section className="bg-[#F5F5F5] pb-16 pt-6">
        <div className="container mx-auto px-4">
          <div className="relative overflow-hidden rounded-3xl bg-[#F58220] p-6 shadow-xl shadow-orange-200/60 sm:p-8 lg:p-12">
            <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-yellow-300/20 blur-3xl" />

            <div className="relative grid gap-8 lg:grid-cols-[minmax(260px,0.85fr)_minmax(0,1.55fr)] lg:items-center">
              <div className="max-w-lg text-white">
                <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/25">
                  <BriefcaseBusiness className="h-4 w-4" />
                  Karier PT Otak Kanan
                </span>
                <h2 className="mb-4 text-3xl font-extrabold leading-tight sm:text-4xl">
                  Lowongan kerja yang tersedia
                </h2>

                <p className="mb-6 max-w-md text-sm leading-6 text-white/90 sm:text-base">
                  Temukan lowongan pekerjaan teratas yang banyak dilamar oleh
                  para pencari kerja.
                </p>

                <div className="mt-8 flex gap-3">
                  <button
                    type="button"
                    className="btn btn-circle border-none bg-white text-[#F58220] shadow-md hover:bg-orange-50"
                    onClick={() => swiperRef?.slidePrev()}
                    aria-label="Lowongan sebelumnya"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>

                  <button
                    type="button"
                    className="btn btn-circle border-none bg-white text-[#F58220] shadow-md hover:bg-orange-50"
                    onClick={() => swiperRef?.slideNext()}
                    aria-label="Lowongan berikutnya"
                  >
                    <ArrowRight className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="min-w-0">
                {loading ? (
                  <div className="flex min-h-[300px] items-center justify-center rounded-2xl bg-white/15 text-white">
                    <span className="loading loading-spinner loading-lg" />
                  </div>
                ) : filteredJobs.length === 0 ? (
                  <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl bg-white px-6 text-center shadow-lg">
                    <BriefcaseBusiness className="mb-3 h-10 w-10 text-orange-400" />
                    <p className="font-bold text-slate-900">
                      Tidak ada lowongan yang cocok
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Coba gunakan kata kunci lain pada kolom pencarian.
                    </p>
                  </div>
                ) : (
                  <Swiper
                    modules={[Navigation]}
                    spaceBetween={18}
                    slidesPerView={1}
                    breakpoints={{
                      640: { slidesPerView: 1 },
                      768: { slidesPerView: 2 },
                      1280: { slidesPerView: 3 },
                    }}
                    onSwiper={setSwiperRef}
                    className="w-full pb-4"
                  >
                    {filteredJobs.slice(0, 6).map((job) => {
                      const salaryText =
                        job.salary_range_min && job.salary_range_max
                          ? `Rp ${Number(job.salary_range_min).toLocaleString("id-ID")} - Rp ${Number(job.salary_range_max).toLocaleString("id-ID")}`
                          : "Dirahasiakan";
                      const deadlineText = formatDateOnly(job.deadline);

                      return (
                        <SwiperSlide key={job.id} className="h-auto">
                          <article className="flex h-[390px] flex-col overflow-hidden rounded-2xl bg-white p-5 shadow-lg ring-1 ring-orange-100 transition duration-300 hover:-translate-y-1 hover:shadow-2xl">
                            <div className="mb-4 flex items-start justify-between gap-3">
                              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-[#F58220] ring-1 ring-orange-100">
                                <BriefcaseBusiness className="h-6 w-6" />
                              </div>

                              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500">
                                <Clock3 className="h-3.5 w-3.5" />
                                {timeAgo(job.created_at) || "Baru"}
                              </span>
                            </div>

                            <div className="min-h-[88px]">
                              <h3 className="line-clamp-2 text-lg font-extrabold leading-snug text-slate-900">
                                {job.title || job.position_name || "Lowongan"}
                              </h3>

                              <p className="mt-2 truncate text-sm font-semibold text-slate-500">
                                {job.position_name || "PT Otak Kanan"}
                              </p>
                            </div>

                            <div className="mt-3 space-y-3 text-sm">
                              <div className="flex min-h-[22px] items-start gap-2 text-slate-600">
                                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
                                <span className="line-clamp-1">
                                  {job.location || "Lokasi belum ditentukan"}
                                </span>
                              </div>

                              <div className="flex items-start gap-2 text-slate-600">
                                <Wallet className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
                                <div className="min-w-0">
                                  <p className="font-bold text-slate-900">
                                    Kisaran Gaji
                                  </p>
                                  <p className="truncate text-slate-500">
                                    {salaryText}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                                <CalendarDays className="h-4 w-4 shrink-0 text-orange-500" />
                                <span>Lamar sebelum {deadlineText}</span>
                              </div>
                            </div>

                            <button
                              type="button"
                              className="
    mt-auto flex w-full items-center justify-center gap-2
    rounded-xl
    bg-gradient-to-r from-orange-500 to-orange-600
    py-3 font-bold text-white
    ring-2 ring-orange-100
    shadow-md
    transition-all duration-300
    hover:from-orange-600
    hover:to-orange-700
    hover:ring-orange-200
    hover:shadow-xl
  "
                              onClick={() =>
                                navigate(`/candidate/jobs/${job.id}`)
                              }
                            >
                              <Eye className="h-4 w-4" />
                              Lihat Detail Lowongan
                            </button>
                          </article>
                        </SwiperSlide>
                      );
                    })}
                  </Swiper>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* ABOUT COMPANY */}
      <section className="bg-base-100 py-20">
        <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
          <img src="/logo1.svg" />

          <div>
            <h2 className="text-3xl font-bold text-primary mb-4">
              Tentang PT Otak Kanan
            </h2>

            <p className="opacity-80 mb-4">
              PT Otak Kanan merupakan perusahaan yang berfokus pada pengembangan
              solusi teknologi dan inovasi digital untuk membantu bisnis
              berkembang lebih cepat.
            </p>

            <p className="opacity-80">
              Kami percaya bahwa talenta terbaik adalah kunci keberhasilan
              perusahaan. Bergabunglah bersama kami untuk membangun masa depan
              teknologi yang lebih baik.
            </p>
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="bg-base-200 py-20">
        <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
          {/* LEFT CONTENT */}
          <div>
            <h2 className="text-4xl font-bold mb-4 text-[#333333]">
              Kenapa Bergabung Dengan Kami
            </h2>

            {/* ITEM 1 */}
            <div className="flex items-start gap-4 mb-6">
              <div className="bg-primary/10 text-primary p-3 rounded-full text-xl">
                🤝
              </div>

              <div>
                <h3 className="font-semibold text-lg">
                  Lingkungan Kerja Kolaboratif
                </h3>

                <p className="text-gray-500 text-sm">
                  Kami membangun budaya kerja yang terbuka, saling mendukung,
                  dan mendorong inovasi bersama tim profesional.
                </p>
              </div>
            </div>

            {/* ITEM 2 */}
            <div className="flex items-start gap-4 mb-6">
              <div className="bg-primary/10 text-primary p-3 rounded-full text-xl">
                🚀
              </div>

              <div>
                <h3 className="font-semibold text-lg">Pengembangan Karir</h3>

                <p className="text-gray-500 text-sm">
                  Kami menyediakan kesempatan belajar, pelatihan, dan pengalaman
                  proyek nyata untuk meningkatkan kemampuan Anda.
                </p>
              </div>
            </div>

            {/* ITEM 3 */}
            <div className="flex items-start gap-4">
              <div className="bg-primary/10 text-primary p-3 rounded-full text-xl">
                💼
              </div>

              <div>
                <h3 className="font-semibold text-lg">Benefit Kompetitif</h3>

                <p className="text-gray-500 text-sm">
                  Kami menawarkan kompensasi dan fasilitas kerja yang kompetitif
                  untuk mendukung kesejahteraan tim.
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT IMAGE */}
          <div className="relative flex justify-center items-center">
            {/* glow belakang */}
            <div className="absolute w-80 h-80 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>

            {/* shape kecil */}
            <div className="absolute -top-8 right-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl"></div>

            <div className="absolute bottom-0 -left-10 w-40 h-40 bg-orange-200/40 rounded-full blur-2xl"></div>

            {/* gambar */}
            <img
              src="/team.svg"
              alt="Team Otak Kanan"
              className="relative z-10 max-w-md w-full drop-shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="bg-base-100 py-20">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm tracking-widest text-primary font-semibold mb-2">
            LAYANAN KAMI
          </p>

          <h2 className="text-3xl font-bold text-[#333333] mb-4">
            UNTUK MEMBANTU SOLUSI DIGITAL
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* 1 */}
            <motion.div
              variants={cardVariant}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              whileHover={{ y: -6 }}
              className="card bg-base-100 shadow hover:shadow-xl transition"
            >
              <div className="card-body text-center">
                <div className="text-4xl text-primary">💻</div>
                <h3 className="font-bold">Web Development</h3>
                <p className="text-sm opacity-80">
                  Pembuatan website profesional untuk company profile dan bisnis
                  Anda.
                </p>
              </div>
            </motion.div>

            {/* 2 */}
            <motion.div
              variants={cardVariant}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              whileHover={{ y: -6 }}
              className="card bg-base-100 shadow hover:shadow-xl transition"
            >
              <div className="card-body text-center">
                <div className="text-4xl text-primary">📱</div>
                <h3 className="font-bold">Mobile Apps Development</h3>
                <p className="text-sm opacity-80">
                  Pengembangan aplikasi mobile Android dan iOS untuk kebutuhan
                  bisnis.
                </p>
              </div>
            </motion.div>

            {/* 3 */}
            <motion.div
              variants={cardVariant}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              whileHover={{ y: -6 }}
              className="card bg-base-100 shadow hover:shadow-xl transition"
            >
              <div className="card-body text-center">
                <div className="text-4xl text-primary">🎨</div>
                <h3 className="font-bold">Design & Multimedia</h3>
                <p className="text-sm opacity-80">
                  Desain grafis, logo, company profile, dan pembuatan video
                  multimedia.
                </p>
              </div>
            </motion.div>

            {/* 4 */}
            <motion.div
              variants={cardVariant}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              whileHover={{ y: -6 }}
              className="card bg-base-100 shadow hover:shadow-xl transition"
            >
              <div className="card-body text-center">
                <div className="text-4xl text-primary">📈</div>
                <h3 className="font-bold">Digital Marketing</h3>
                <p className="text-sm opacity-80">
                  Strategi pemasaran digital untuk meningkatkan penjualan bisnis
                  Anda.
                </p>
              </div>
            </motion.div>

            {/* 5 */}
            <motion.div
              variants={cardVariant}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              whileHover={{ y: -6 }}
              className="card bg-base-100 shadow hover:shadow-xl transition"
            >
              <div className="card-body text-center">
                <div className="text-4xl text-primary">🏢</div>
                <h3 className="font-bold">Digital Agency</h3>
                <p className="text-sm opacity-80">
                  Konsultasi dan strategi digital untuk pengembangan bisnis
                  Anda.
                </p>
              </div>
            </motion.div>

            {/* 6 */}
            <motion.div
              variants={cardVariant}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              whileHover={{ y: -6 }}
              className="card bg-base-100 shadow hover:shadow-xl transition"
            >
              <div className="card-body text-center">
                <div className="text-4xl text-primary">🎓</div>
                <h3 className="font-bold">Education & Training</h3>
                <p className="text-sm opacity-80">
                  Program pelatihan teknologi dan digital untuk pengembangan
                  SDM.
                </p>
              </div>
            </motion.div>

            {/* 7 */}
            <motion.div
              variants={cardVariant}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              whileHover={{ y: -6 }}
              className="card bg-base-100 shadow hover:shadow-xl transition"
            >
              <div className="card-body text-center">
                <div className="text-4xl text-primary">📰</div>
                <h3 className="font-bold">Online Media</h3>
                <p className="text-sm opacity-80">
                  Membantu bisnis menyampaikan informasi melalui media digital.
                </p>
              </div>
            </motion.div>

            {/* 8 */}
            <motion.div
              variants={cardVariant}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              whileHover={{ y: -6 }}
              className="card bg-base-100 shadow hover:shadow-xl transition"
            >
              <div className="card-body text-center">
                <div className="text-4xl text-primary">⚙️</div>
                <h3 className="font-bold">Digital Product</h3>
                <p className="text-sm opacity-80">
                  Penyediaan berbagai produk digital untuk kebutuhan bisnis
                  modern.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
