// src/lib/axiom.js

const AXIOM_DATASET = process.env.NEXT_PUBLIC_AXIOM_DATASET;
const AXIOM_TOKEN = process.env.NEXT_PUBLIC_AXIOM_TOKEN;

/**
 * ฟังก์ชันสำหรับส่ง Log ไปที่ Axiom
 * @param {string} eventName - ชื่อประเภทเหตุการณ์ (เช่น 'create_event', 'billing')
 * @param {object} data - ข้อมูลที่ต้องการเก็บ (JSON)
 */
export const logEvent = async (eventName, data = {}) => {
  if (!AXIOM_DATASET || !AXIOM_TOKEN) {
    console.warn("Axiom Dataset or Token is missing. Log not sent.");
    return;
  }

  const payload = [
    {
      _time: new Date().toISOString(),
      event_name: eventName,
      ...data,
    },
  ];

  try {
    // ส่งข้อมูลแบบ Background (ไม่ต้องใช้ await ในที่ที่เรียกใช้ เพื่อไม่ให้หน่วง UI)
    fetch(`https://api.axiom.co/v1/datasets/${AXIOM_DATASET}/ingest`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AXIOM_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    }).catch(err => console.error("Axiom Logging Error:", err));
  } catch (error) {
    console.error("Failed to send log to Axiom:", error);
  }
};