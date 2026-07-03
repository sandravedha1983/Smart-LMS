import { useEffect, useState } from 'react';
import { jsPDF } from 'jspdf';
import { useParams } from 'react-router-dom';
import { getCertificate } from '../services/certificateService';
import Loader from '../components/Loader';

export default function CertificatePage() {
  const { courseId } = useParams();
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadCertificate = async () => {
      setLoading(true);
      try {
        const data = await getCertificate(courseId);
        setCertificate(data);
      } catch (err) {
        setError('Certificate is not available yet. Complete the course to unlock it.');
      } finally {
        setLoading(false);
      }
    };
    loadCertificate();
  }, [courseId]);

  const downloadPDF = () => {
    if (!certificate) return;
    const doc = new jsPDF({ orientation: 'landscape' });
    doc.setFontSize(24);
    doc.text('Smart Learning Portal', 20, 30);
    doc.setFontSize(18);
    doc.text('Course Completion Certificate', 20, 50);
    doc.setFontSize(14);
    doc.text(`This certifies that ${certificate.username}`, 20, 80);
    doc.text(`has successfully completed the course:`, 20, 94);
    doc.setFontSize(16);
    doc.text(certificate.course_title, 20, 108);
    doc.setFontSize(12);
    doc.text(`Issued on: ${new Date(certificate.completion_date).toLocaleDateString()}`, 20, 130);
    doc.text(`Certificate code: ${certificate.certificate_code}`, 20, 142);
    doc.save(`${certificate.course_title.replace(/\s+/g, '_')}_certificate.pdf`);
  };

  return (
    <section className="space-y-5 sm:space-y-8">
      <div className="rounded-2xl sm:rounded-[2rem] border border-white/10 bg-white/5 p-4 sm:p-8 shadow-glass backdrop-blur-md">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Course Certificate</h1>
          <p className="mt-1.5 sm:mt-2 text-sm text-white/60">Download your completion certificate once you finish the full course.</p>
        </div>

        {loading ? (
          <Loader label="Checking certificate status..." />
        ) : error ? (
          <div className="rounded-2xl sm:rounded-3xl border border-rose-500/30 bg-rose-500/10 p-4 sm:p-6 text-sm text-rose-300">{error}</div>
        ) : (
          <div className="rounded-2xl sm:rounded-3xl border border-white/10 bg-white/5 p-4 sm:p-6 shadow-glass">
            <p className="text-base sm:text-lg font-semibold text-white">Certificate ready</p>
            <p className="mt-2 sm:mt-3 text-sm text-white/70">Course: {certificate.course_title}</p>
            <p className="mt-1 text-sm text-white/70">Student: {certificate.username}</p>
            <p className="mt-1 text-sm text-white/70">Completion date: {new Date(certificate.completion_date).toLocaleDateString()}</p>
            <button
              type="button"
              onClick={downloadPDF}
              className="mt-4 sm:mt-6 rounded-2xl sm:rounded-3xl bg-emerald-600 px-5 py-2.5 sm:py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 active:scale-[0.98] shadow-glow"
            >
              Download PDF Certificate
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
