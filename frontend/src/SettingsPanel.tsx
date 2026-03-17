import { useState } from "react";
import type { InitPendulumRequestDto } from "@pendulum-simulation/common";
import { useUpdateGravity, API_BASE } from "./hooks/usePendulum.ts";

interface Props {
  pendulumConfigs: InitPendulumRequestDto[];
  pendulumIds: (string | undefined)[];
  gravity: number;
  stageWidth: number;
  onSave: (configs: InitPendulumRequestDto[], gravity: number) => void;
  onClose: () => void;
}

const SettingsPanel = ({ pendulumConfigs, pendulumIds, gravity, stageWidth, onSave, onClose }: Props) => {
  const [draftConfigs, setDraftConfigs] = useState<InitPendulumRequestDto[]>(
    () => pendulumConfigs.map((c) => ({ ...c, pivotPosition: { ...c.pivotPosition } }))
  );
  const [draftGravity, setDraftGravity] = useState(gravity);

  const { mutate: updateGravity } = useUpdateGravity();

  const updateConfig = (index: number, field: keyof Omit<InitPendulumRequestDto, "pivotPosition">, raw: string) => {
    const value = parseFloat(raw);
    if (isNaN(value)) return;
    setDraftConfigs((prev) => {
      const next = prev.map((c) => ({ ...c, pivotPosition: { ...c.pivotPosition } }));
      (next[index] as any)[field] = value;
      return next;
    });
  };

  const updatePivotX = (index: number, raw: string) => {
    const value = parseFloat(raw);
    if (isNaN(value)) return;
    setDraftConfigs((prev) => {
      const next = prev.map((c) => ({ ...c, pivotPosition: { ...c.pivotPosition } }));
      next[index].pivotPosition.x = value;
      return next;
    });
  };

  const clamp = (value: number, min: number, max: number) =>
    Math.min(max, Math.max(min, value));

  const handleSave = () => {
    console.log("[settings] save clicked");

    // Clamp all values to their valid ranges before saving
    const clamped = draftConfigs.map((c) => ({
      ...c,
      angle: clamp(c.angle, 0, 89),
      length: clamp(c.length, 100, 500),
      mass: clamp(c.mass, 15, 40),
      pivotPosition: {
        x: clamp(c.pivotPosition.x, 25, stageWidth - 25),
        y: 25,
      },
    }));
    const clampedGravity = clamp(draftGravity, 1, 20);

    // Log what changed
    const configChanges = clamped
      .map((c, i) => {
        const orig = pendulumConfigs[i];
        const changes: Record<string, { from: number; to: number }> = {};
        if (c.angle !== orig.angle) changes.angle = { from: orig.angle, to: c.angle };
        if (c.length !== orig.length) changes.length = { from: orig.length, to: c.length };
        if (c.mass !== orig.mass) changes.mass = { from: orig.mass, to: c.mass };
        if (c.pivotPosition.x !== orig.pivotPosition.x) changes.pivotX = { from: orig.pivotPosition.x, to: c.pivotPosition.x };
        return Object.keys(changes).length > 0 ? { pendulum: `P${i + 1}`, ...changes } : null;
      })
      .filter(Boolean);
    console.log("[settings] changes", {
      gravity: clampedGravity !== gravity ? { from: gravity, to: clampedGravity } : "unchanged",
      pendulums: configChanges.length > 0 ? configChanges : "unchanged",
    });

    // Fire-and-forget API calls
    pendulumIds.forEach((id, i) => {
      if (id) {
        console.log(`[settings] PUT /pendulum/${id}`, clamped[i]);
        fetch(`${API_BASE}/pendulum/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(clamped[i]),
        }).catch(() => {});
      }
    });

    if (clampedGravity !== gravity) {
      console.log(`[settings] POST /gravity`, { gravity: clampedGravity });
      updateGravity(clampedGravity);
    }

    onSave(clamped, clampedGravity);
  };

  const overlayStyle: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 1000,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const popupStyle: React.CSSProperties = {
    background: "#fff",
    borderRadius: "8px",
    width: "100%",
    maxWidth: "640px",
    height: "90vh",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  };

  const headerStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 20px",
    borderBottom: "1px solid #eee",
    flexShrink: 0,
  };

  const bodyStyle: React.CSSProperties = {
    overflowY: "auto",
    flex: 1,
    padding: "0 20px",
  };

  const footerStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    padding: "12px 20px",
    borderTop: "1px solid #eee",
    flexShrink: 0,
    background: "#fff",
  };

  const sectionLabelStyle: React.CSSProperties = {
    fontSize: "11px",
    fontWeight: 600,
    textTransform: "uppercase",
    color: "#888",
    letterSpacing: "0.05em",
    margin: "16px 0 12px",
  };

  const inputStyle: React.CSSProperties = {
    border: "1px solid #ddd",
    borderRadius: "4px",
    padding: "4px 6px",
    fontSize: "13px",
    width: "100%",
    boxSizing: "border-box",
  };

  const colHeaderStyle: React.CSSProperties = {
    fontSize: "11px",
    color: "#888",
    textTransform: "uppercase",
    fontWeight: 600,
  };

  const gridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "48px 1fr 1fr 1fr 1fr",
    gap: "8px",
    alignItems: "center",
  };

  return (
    <div style={overlayStyle}>
      <div style={popupStyle}>
        {/* Header */}
        <div style={headerStyle}>
          <strong style={{ fontSize: "16px" }}>Settings</strong>
          <span
            onClick={onClose}
            style={{ cursor: "pointer", fontSize: "20px", opacity: 0.5, lineHeight: 1 }}
          >
            ✕
          </span>
        </div>

        {/* Body */}
        <div style={bodyStyle}>
          {/* General section */}
          <div style={{ borderBottom: "1px solid #eee", paddingBottom: "16px" }}>
            <div style={sectionLabelStyle}>General</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label style={{ fontSize: "14px" }}>Gravity</label>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <input
                  type="range"
                  min={1}
                  max={20}
                  step={0.1}
                  value={draftGravity}
                  onChange={(e) => setDraftGravity(parseFloat(e.target.value))}
                  style={{ width: "160px", accentColor: "#333" }}
                />
                <span style={{ fontSize: "14px", fontWeight: 600, width: "36px", textAlign: "right" }}>
                  {draftGravity.toFixed(1)}
                </span>
              </div>
            </div>
          </div>

          {/* Pendulums section */}
          <div>
            <div style={sectionLabelStyle}>Pendulums</div>

            {/* Column headers */}
            <div style={{ ...gridStyle, paddingBottom: "6px", borderBottom: "1px solid #eee" }}>
              <span />
              <span style={colHeaderStyle}>Angle °</span>
              <span style={colHeaderStyle}>Length px</span>
              <span style={colHeaderStyle}>Mass kg</span>
              <span style={colHeaderStyle}>Pivot X px</span>
            </div>

            {/* Rows */}
            {draftConfigs.map((config, i) => (
              <div
                key={i}
                style={{
                  ...gridStyle,
                  padding: "8px 0",
                  borderBottom: i < draftConfigs.length - 1 ? "1px solid #f4f4f4" : "none",
                }}
              >
                <span style={{ fontSize: "13px", fontWeight: 600, color: "#555" }}>
                  P{i + 1}
                </span>
                <input
                  type="number"
                  value={config.angle}
                  min={0}
                  max={89}
                  style={inputStyle}
                  onChange={(e) => updateConfig(i, "angle", e.target.value)}
                  onBlur={(e) => updateConfig(i, "angle", String(clamp(parseFloat(e.target.value) || 0, 0, 89)))}
                />
                <input
                  type="number"
                  value={config.length}
                  min={100}
                  max={500}
                  style={inputStyle}
                  onChange={(e) => updateConfig(i, "length", e.target.value)}
                  onBlur={(e) => updateConfig(i, "length", String(clamp(parseFloat(e.target.value) || 100, 100, 500)))}
                />
                <input
                  type="number"
                  value={config.mass}
                  min={15}
                  max={40}
                  style={inputStyle}
                  onChange={(e) => updateConfig(i, "mass", e.target.value)}
                  onBlur={(e) => updateConfig(i, "mass", String(clamp(parseFloat(e.target.value) || 15, 15, 40)))}
                />
                <input
                  type="number"
                  value={config.pivotPosition.x}
                  min={25}
                  max={stageWidth - 25}
                  style={inputStyle}
                  onChange={(e) => updatePivotX(i, e.target.value)}
                  onBlur={(e) => updatePivotX(i, String(clamp(parseFloat(e.target.value) || 25, 25, stageWidth - 25)))}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={footerStyle}>
          <button
            onClick={onClose}
            style={{
              padding: "8px 18px",
              border: "1px solid #ccc",
              background: "#fff",
              borderRadius: "6px",
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: "8px 18px",
              border: "none",
              background: "#222",
              color: "#fff",
              borderRadius: "6px",
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
