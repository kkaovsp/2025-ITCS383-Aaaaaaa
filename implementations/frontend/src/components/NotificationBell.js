import React from "react";

export default function NotificationBell({ count = 0, onClick }) {
  return (
    <button onClick={onClick} style={{ position: "relative" }}>
      🔔
      {count > 0 && (
        <span
          style={{
            position: "absolute",
            top: -6,
            right: -6,
            background: "red",
            color: "white",
            borderRadius: "50%",
            padding: "2px 6px",
            fontSize: 12,
          }}
        >
          {count}
        </span>
      )}
    </button>
  );
}
