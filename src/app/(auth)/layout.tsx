export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
        background: "linear-gradient(135deg, #08111d 0%, #0c1f3a 50%, #08111d 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Top-left glow */}
      <div
        style={{
          position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
          background: "radial-gradient(ellipse 70% 50% at 30% 20%, rgba(14,165,233,0.12) 0%, transparent 60%)",
          pointerEvents: "none",
        }}
      />
      {/* Bottom-right glow */}
      <div
        style={{
          position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
          background: "radial-gradient(ellipse 60% 50% at 70% 80%, rgba(99,102,241,0.08) 0%, transparent 60%)",
          pointerEvents: "none",
        }}
      />
      <div style={{ position: "relative", zIndex: 10, width: "100%" }}>
        {children}
      </div>
    </div>
  );
}
