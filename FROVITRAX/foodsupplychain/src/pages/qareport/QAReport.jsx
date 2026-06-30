import { useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { FaFileDownload, FaChartPie } from "react-icons/fa";
import axios from "axios";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import FrovitraxLogoBase64 from "../../assets/Frovitrax Logo2.png?inline";

export default function QAReport() {
  const { id } = useParams();
  const location = useLocation();
  const extractProductName = (desc) => desc?.split(" ")[0] || "Unknown";
  const [file, setFile] = useState(null);
  const [productType] = useState(extractProductName(location.state?.productType));
  const [aiResult, setAiResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const colors = ["#C53030", "#F56565", "#FEB2B2"];

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleAnalyze = async () => {
    if (!file) return alert("Please upload a CSV file");
    setLoading(true);
    setAiResult(null);

    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
      const formData = new FormData();
      formData.append("file", file);

      // ✅ Capitalize first letter to match model’s expected format
      const formattedProductType =
        productType.charAt(0).toUpperCase() + productType.slice(1).toLowerCase();

      formData.append("product_type", formattedProductType);

      const res = await axios.post(`${apiBaseUrl}/api/analyze-csv`, formData);
      setAiResult(res.data);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Error analyzing CSV");
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    if (!aiResult || aiResult.error) return;

    const doc = new jsPDF("p", "mm", "a4");
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 14;

    const logoWidth = 60;
    const logoHeight = 25;
    const logoX = (pageWidth - logoWidth) / 2;
    try {
      doc.addImage(FrovitraxLogoBase64, "PNG", logoX, 10, logoWidth, logoHeight);
    } catch (err) {
      console.warn("Logo render failed:", err);
    }

    const bluePrimary = [66, 153, 225];
    const blueLight = [173, 216, 230];

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(...bluePrimary);
    doc.text("QA ANALYSIS REPORT", pageWidth / 2, 42, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(0);
    doc.text(
      "Comprehensive Quality Assurance evaluation based on environmental and sensor-driven parameters.",
      pageWidth / 2,
      50,
      { align: "center", maxWidth: pageWidth - 2 * margin }
    );

    doc.setDrawColor(0);
    doc.setLineWidth(0.3);
    doc.line(margin, 55, pageWidth - margin, 55);

    doc.setFontSize(12);
    doc.text(`Product Type: ${aiResult.product}`, margin, 64);
    doc.text(`Report Generated: ${new Date().toLocaleString()}`, margin, 72);

    const summaryBody = [
      ["QA Score", `${aiResult.qa_score}%`],
      ["Duration (hrs)", `${aiResult.duration_hours}`],
      [
        "Temperature (avg/min/max)",
        `${aiResult.temperature.avg} / ${aiResult.temperature.min} / ${aiResult.temperature.max}`,
      ],
      [
        "Humidity (avg/min/max)",
        `${aiResult.humidity.avg} / ${aiResult.humidity.min} / ${aiResult.humidity.max}`,
      ],
    ];

    doc.autoTable({
      startY: 80,
      head: [["Parameter", "Value"]],
      body: summaryBody,
      theme: "grid",
      headStyles: { fillColor: bluePrimary, textColor: 255, halign: "center" },
      styles: { fontSize: 11, cellPadding: 3, valign: "middle", halign: "center" },
      margin: { left: margin, right: margin },
    });

    const afterSummaryY = doc.lastAutoTable.finalY + 10;

    const score = Number(aiResult.qa_score);
    let suggestion = "";
    if (score >= 85) {
      suggestion =
        "Quality is excellent. Maintain regular monitoring and adhere strictly to QA SOPs. Schedule periodic checks every 12 hours for consistency.";
    } else if (score >= 60) {
      suggestion =
        "Moderate variations detected. Reassess environmental parameters, calibrate sensors, and ensure cold-chain stability.";
    } else {
      suggestion =
        "High risk of quality degradation. Quarantine batch immediately, initiate corrective QA procedures, and prevent product dispatch.";
    }

    const suggestions = [
      [
        "Interpretation",
        `${score}% — ${score >= 85 ? "Good" : score >= 60 ? "Moderate" : "Poor"}`,
      ],
      ["Top Recommendation", suggestion],
      [
        "Preventive Measures",
        "Ensure real-time monitoring of parameters, recalibrate all sensors weekly, and implement environmental alert systems.",
      ],
      [
        "Confidence",
        "Results derived from historical datasets; periodic model retraining ensures higher precision over time.",
      ],
    ];

    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...bluePrimary);
    doc.text("Suggested Actions & Recommendations", margin, afterSummaryY);

    doc.autoTable({
      startY: afterSummaryY + 4,
      head: [["Topic", "Details"]],
      body: suggestions,
      theme: "striped",
      headStyles: { fillColor: bluePrimary, textColor: 255 },
      styles: { fontSize: 10, cellPadding: 3, valign: "middle" },
      margin: { left: margin, right: margin },
    });

    const afterSuggestionsY = doc.lastAutoTable.finalY + 10;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(...bluePrimary);
    doc.text("Final Summary & Key Insights", margin, afterSuggestionsY);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(0);
    const conclusionText =
      "This QA report highlights the overall condition of the batch based on real-time environmental data. " +
      (score >= 85
        ? "All parameters indicate stable performance, making this batch suitable for further processing or dispatch."
        : score >= 60
        ? "Detected moderate inconsistencies; recommend conducting follow-up validation tests before clearance."
        : "Multiple deviations found, signaling a high risk of spoilage. Immediate reinspection and containment advised.") +
      "\n\nContinuous data-driven QA monitoring is essential for operational reliability, safety, and maintaining Frovitrax’s product excellence standards.";

    doc.text(conclusionText, margin, afterSuggestionsY + 8, {
      maxWidth: pageWidth - 2 * margin,
      lineHeightFactor: 1.4,
    });

    const footerY = 278;
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...bluePrimary);
    doc.setFontSize(11);
    doc.text("Report Verified & Digitally Signed by: Frovitrax QA System", pageWidth / 2, footerY - 6, {
      align: "center",
    });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.text("Frovitrax · AI-Driven Quality Assurance Platform", pageWidth / 2, footerY, {
      align: "center",
    });
    doc.text("support@frovitrax.com · www.frovitrax.com", pageWidth / 2, footerY + 4, {
      align: "center",
    });

    doc.save(`QA_Report_${aiResult.product}_${Date.now()}.pdf`);
  };

  return (
    <div className="min-h-screen bg-[#FFF5F5] py-12 px-6 flex justify-center text-gray-800">
      <div className="w-[90%] bg-white rounded-3xl p-10 shadow-2xl border border-[#F56565] flex flex-col gap-10">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-[#C53030] mb-3 flex items-center justify-center gap-3">
            <FaChartPie /> QA Analysis Report
          </h1>
          <p className="text-gray-600 max-w-3xl mx-auto text-lg">
            Upload your batch’s CSV file for a detailed Quality Assurance
            analysis. The system processes temperature, humidity, and duration
            data to generate actionable insights ensuring top product integrity.
          </p>
        </div>

        <div className="flex flex-col items-center gap-8">
          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="border border-[#F56565] p-3 rounded-lg shadow-sm w-full sm:w-1/2 focus:ring-2 focus:ring-[#C53030] outline-none"
            />
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className={`bg-[#C53030] text-white px-6 py-3 rounded-lg shadow-md hover:bg-[#E53E3E] flex items-center gap-2 justify-center transition ${
                loading ? "opacity-60 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Analyzing..." : "Analyze CSV"}
            </button>
          </div>

          <div className="flex flex-col items-center w-full sm:w-1/2">
            <label className="font-semibold text-lg text-gray-700 mb-2">
              Product Type
            </label>
            <input
              type="text"
              value={productType}
              readOnly
              className="w-full px-4 py-3 rounded-lg border border-[#F56565] shadow bg-gray-100 text-center"
            />
          </div>
        </div>

        {aiResult && !aiResult.error && (
          <div className="flex flex-col gap-10">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="p-8 bg-[#FED7D7] rounded-2xl border border-[#F56565] shadow-md">
                <h3 className="text-lg font-semibold text-[#C53030] mb-3">
                  Batch Summary
                </h3>
                <p><b>QA Score:</b> {aiResult.qa_score}%</p>
                <p><b>Temperature:</b> Avg {aiResult.temperature.avg}, Min {aiResult.temperature.min}, Max {aiResult.temperature.max}</p>
                <p><b>Humidity:</b> Avg {aiResult.humidity.avg}, Min {aiResult.humidity.min}, Max {aiResult.humidity.max}</p>
                <p><b>Duration (hrs):</b> {aiResult.duration_hours}</p>
              </div>

              <div className="h-72 bg-white rounded-2xl shadow-md border flex items-center justify-center p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      dataKey="value"
                      data={[
                        { name: "QA Score", value: aiResult.qa_score },
                        { name: "Defects", value: 100 - aiResult.qa_score },
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >
                      {colors.map((c, i) => (
                        <Cell key={i} fill={colors[i % colors.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-md border border-[#F56565] p-8">
              <h3 className="text-xl font-semibold text-[#C53030] mb-3">
                Insights & Recommendations
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {Number(aiResult.qa_score) >= 85
                  ? "Excellent quality detected. Maintain standard cold-chain and handling conditions."
                  : Number(aiResult.qa_score) >= 60
                  ? "Moderate quality — inspect packaging and ensure humidity control."
                  : "Critical issues — quarantine batch and perform immediate quality checks."}
              </p>

              <div className="grid sm:grid-cols-2 gap-6 mt-6">
                <div className="bg-[#FED7D7] p-4 rounded-lg shadow-inner">
                  <b>Preventive Measures:</b> Continuous monitoring, sensor calibration, and SOP adherence.
                </div>
                <div className="bg-[#FED7D7] p-4 rounded-lg shadow-inner">
                  <b>Confidence:</b> Based on historical performance and sensor reliability.
                </div>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={downloadPDF}
                className="bg-[#C53030] text-white px-10 py-4 rounded-lg shadow-md hover:bg-[#E53E3E] flex items-center gap-3 justify-center mx-auto"
              >
                <FaFileDownload /> Download Full Report (PDF)
              </button>
            </div>
          </div>
        )}

        {aiResult?.error && (
          <p className="text-red-600 font-semibold text-center">{aiResult.error}</p>
        )}

        <div className="mt-12 text-gray-600 text-sm border-t pt-6 text-justify leading-relaxed">
          <h4 className="font-semibold mb-2 text-[#C53030]">
            Terms & Conditions
          </h4>
          <p>
            By using this QA Analysis Tool, you acknowledge that all
            interpretations are system-generated from uploaded CSV sensor data.
            While Frovitrax ensures analytical precision, the company is not
            liable for external factors affecting batch quality. It is advised
            to corroborate results with manual QA verifications before
            decision-making.
          </p>
        </div>
      </div>
    </div>
  );
}
