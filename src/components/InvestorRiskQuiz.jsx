// src/components/InvestorRiskQuiz.jsx
import React, { useMemo } from "react";
import "../css/Signup.css";

export default function InvestorRiskQuiz({ value, onChange }) {
  const score = useMemo(() => {
    return Object.values(value).reduce((sum, v) => sum + (Number(v) || 0), 0);
  }, [value]);

  const allAnswered = useMemo(() => {
    return Object.values(value).every((v) => v !== null);
  }, [value]);

  const setAnswer = (key, v) => onChange({ ...value, [key]: v });

  const QuestionCard = ({ id, title, options }) => (
    <div
      style={{
        border: "1px solid var(--border)",
        borderRadius: "var(--r-lg)",
        padding: 16,
        background: "var(--bg-main)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div style={{ fontSize: 14, fontWeight: 800, color: "var(--text-main)" }}>
        {title}
      </div>

      <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
        {options.map((opt) => {
          const active = value[id] === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => setAnswer(id, opt.value)}
              style={{
                width: "100%",
                textAlign: "left",
                padding: "12px 12px",
                borderRadius: "var(--r-md)",
                border: active ? "2px solid var(--primary)" : "1px solid var(--border)",
                background: active ? "rgba(22,163,74,0.06)" : "var(--bg-main)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
              }}
            >
              <span style={{ fontSize: 14, color: "var(--text-main)" }}>
                {opt.label}
              </span>

              {/* จุดวงกลมด้านขวาแทน radio */}
              <span
                aria-hidden
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 999,
                  border: active ? "6px solid var(--primary)" : "2px solid var(--border)",
                  boxSizing: "border-box",
                  flex: "0 0 auto",
                }}
              />
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div style={{ gridColumn: "1 / -1" }}>
      {/* header */}
      <div className="field" style={{ gridColumn: "1 / -1" }}>
        <label style={{ fontSize: 15, fontWeight: 800, color: "var(--text-main)" }}>
          แบบประเมินความเสี่ยง (Investor)
        </label>
        <div style={{ marginTop: 6, fontSize: 13, color: "var(--text-muted)" }}>
          เลือกคำตอบที่ตรงกับคุณที่สุด (ข้อละ 1–4 คะแนน)
        </div>

        <div
          style={{
            marginTop: 12,
            padding: "10px 12px",
            border: "1px solid var(--border)",
            borderRadius: "var(--r-md)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "var(--bg-main)",
          }}
        >
          <span style={{ fontSize: 14 }}>คะแนนรวม</span>
          <strong style={{ fontSize: 16 }}>{score} / 40</strong>
        </div>

        {!allAnswered && (
          <div style={{ marginTop: 8, fontSize: 12, color: "#dc2626" }}>
            กรุณาตอบให้ครบทั้ง 10 ข้อ
          </div>
        )}
      </div>

      {/* ✅ GRID */}
      <div
        style={{
          marginTop: 16,
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: 16,
        }}
      >
        <QuestionCard
          id="q1"
          title="1) ปัจจุบันคุณมีอายุเท่าไหร่?"
          options={[
            { value: 1, label: "ก. มากกว่า 60 ปีขึ้นไป (1 คะแนน)" },
            { value: 2, label: "ข. 45 – 60 ปี (2 คะแนน)" },
            { value: 3, label: "ค. 35 – 44 ปี (3 คะแนน)" },
            { value: 4, label: "ง. น้อยกว่า 35 ปี (4 คะแนน)" },
          ]}
        />

        <QuestionCard
          id="q2"
          title="2) ภาระหนี้สินและค่าใช้จ่ายประจำเทียบกับรายได้รวมอย่างไร?"
          options={[
            { value: 1, label: "ก. มากกว่า 75% ของรายได้ (1 คะแนน)" },
            { value: 2, label: "ข. ระหว่าง 50% - 75% (2 คะแนน)" },
            { value: 3, label: "ค. ระหว่าง 25% - 50% (3 คะแนน)" },
            { value: 4, label: "ง. น้อยกว่า 25% (4 คะแนน)" },
          ]}
        />

        <QuestionCard
          id="q3"
          title="3) สถานะทางการเงินในปัจจุบันเป็นอย่างไร?"
          options={[
            { value: 1, label: "ก. ทรัพย์สินน้อยกว่าหนี้สิน (1 คะแนน)" },
            { value: 2, label: "ข. ทรัพย์สินเท่ากับหนี้สิน (2 คะแนน)" },
            { value: 3, label: "ค. ทรัพย์สินมากกว่าแต่ไม่มีเงินออม (3 คะแนน)" },
            { value: 4, label: "ง. ทรัพย์สินมากกว่าและมีเงินออมพอ (4 คะแนน)" },
          ]}
        />

        <QuestionCard
          id="q4"
          title="4) คุณมีแผนใช้เงินก้อนนี้ในอีกกี่ปี?"
          options={[
            { value: 1, label: "ก. น้อยกว่า 1 ปี (1 คะแนน)" },
            { value: 2, label: "ข. 1 - 3 ปี (2 คะแนน)" },
            { value: 3, label: "ค. 3 - 5 ปี (3 คะแนน)" },
            { value: 4, label: "ง. มากกว่า 5 ปี (4 คะแนน)" },
          ]}
        />

        <QuestionCard
          id="q5"
          title="5) วัตถุประสงค์หลักในการลงทุนคืออะไร?"
          options={[
            { value: 1, label: "ก. รักษาเงินต้นให้ปลอดภัย (1 คะแนน)" },
            { value: 2, label: "ข. รายได้สม่ำเสมอ เช่น ดอกเบี้ย/ปันผล (2 คะแนน)" },
            { value: 3, label: "ค. เติบโตระยะยาว (3 คะแนน)" },
            { value: 4, label: "ง. ผลตอบแทนสูงสุด แม้เสี่ยงมาก (4 คะแนน)" },
          ]}
        />

        <QuestionCard
          id="q6"
          title="6) ประสบการณ์ลงทุนในสินทรัพย์เสี่ยงเป็นอย่างไร?"
          options={[
            { value: 1, label: "ก. ไม่มีเลย/น้อยมาก (1 คะแนน)" },
            { value: 2, label: "ข. พอมีความรู้บ้าง (2 คะแนน)" },
            { value: 3, label: "ค. ลงทุนมา 1-3 ปี (3 คะแนน)" },
            { value: 4, label: "ง. เชี่ยวชาญ/ลงทุนมากกว่า 3 ปี (4 คะแนน)" },
          ]}
        />

        <QuestionCard
          id="q7"
          title='7) ถ้าพอร์ต "ติดลบ 10-20%" ระยะสั้น จะทำอย่างไร?'
          options={[
            { value: 1, label: "ก. รีบขายทันที (1 คะแนน)" },
            { value: 2, label: "ข. อาจขายบางส่วน (2 คะแนน)" },
            { value: 3, label: "ค. ถือได้เพราะปกติของตลาด (3 คะแนน)" },
            { value: 4, label: "ง. อาจลงทุนเพิ่มถัวเฉลี่ย (4 คะแนน)" },
          ]}
        />

        <QuestionCard
          id="q8"
          title='8) เมื่อพูดถึง "ความเสี่ยง" คุณนึกถึงอะไร?'
          options={[
            { value: 1, label: "ก. กลัวสูญเสียเงินต้น (1 คะแนน)" },
            { value: 2, label: "ข. ความผันผวนที่ไม่สบายใจ (2 คะแนน)" },
            { value: 3, label: "ค. โอกาสสร้างผลตอบแทน (3 คะแนน)" },
            { value: 4, label: "ง. ความท้าทายในการลงทุน (4 คะแนน)" },
          ]}
        />

        <QuestionCard
          id="q9"
          title="9) รับได้มากสุดถ้าผลตอบแทนติดลบเท่าไหร่?"
          options={[
            { value: 1, label: "ก. ไม่เกิน 5% (1 คะแนน)" },
            { value: 2, label: "ข. ไม่เกิน 10% (2 คะแนน)" },
            { value: 3, label: "ค. 10% - 20% (3 คะแนน)" },
            { value: 4, label: "ง. มากกว่า 20% (4 คะแนน)" },
          ]}
        />

        <QuestionCard
          id="q10"
          title="10) ถ้าเลือกพอร์ต จะเลือกสัดส่วนแบบไหน?"
          options={[
            { value: 1, label: "ก. ฝาก/พันธบัตร 100% (1 คะแนน)" },
            { value: 2, label: "ข. พันธบัตร 70% หุ้น 30% (2 คะแนน)" },
            { value: 3, label: "ค. พันธบัตร 50% หุ้น 50% (3 คะแนน)" },
            { value: 4, label: "ง. หุ้น/เสี่ยงอื่นๆ 80-100% (4 คะแนน)" },
          ]}
        />
      </div>

      {/* ✅ Responsive (inline) */}
      <style>
        {`
          @media (max-width: 900px) {
            .signup-card .risk-grid-fallback {}
          }
          @media (max-width: 900px) {
            div[style*="grid-template-columns: repeat(2"] {
              grid-template-columns: 1fr !important;
            }
          }
        `}
      </style>
    </div>
  );
}
