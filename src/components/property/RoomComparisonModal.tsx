import React from 'react';
import { RoomUnit } from '../../types';
import { X, Check, Minus, DoorOpen, Scale, Sparkles } from 'lucide-react';

interface RoomComparisonModalProps {
  rooms: RoomUnit[];
  activeRoomNo: string;
  onSelectRoom: (room: RoomUnit) => void;
  onClose: () => void;
}

export const RoomComparisonModal: React.FC<RoomComparisonModalProps> = ({
  rooms,
  activeRoomNo,
  onSelectRoom,
  onClose,
}) => {
  // Compare top 3 rooms (focused comparison)
  const compareRooms = rooms.slice(0, 3);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 5000,
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Room Comparison"
    >
      <div
        style={{
          background: 'var(--surface-neomorph)',
          border: '1.5px solid rgba(14, 165, 233, 0.45)',
          borderRadius: 'var(--radius-xl)',
          width: '100%',
          maxWidth: '820px',
          boxShadow: 'var(--shadow-metaverse-glow)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.75rem',
            borderBottom: '1px solid rgba(194, 202, 216, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--surface-neomorph-inset)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <Scale size={20} color="var(--c-gold)" />
            <h3 style={{ color: '#0f172a', fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>
              Direct Room-to-Room Comparison
            </h3>
            <span
              style={{
                background: 'rgba(14, 165, 233, 0.15)',
                color: 'var(--c-sky-blue)',
                padding: '0.15rem 0.5rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.72rem',
                fontWeight: 800,
              }}
            >
              SPATIAL MATRIX
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#64748b',
              cursor: 'pointer',
              padding: '0.25rem',
            }}
            aria-label="Close Comparison"
          >
            <X size={20} />
          </button>
        </div>

        {/* Comparison Table */}
        <div style={{ padding: '1.5rem', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid rgba(194, 202, 216, 0.5)' }}>
                <th style={{ padding: '0.75rem', color: '#475569', fontWeight: 800 }}>Feature</th>
                {compareRooms.map((r) => {
                  const isCurrent = r.roomNo === activeRoomNo;
                  return (
                    <th
                      key={r.roomNo}
                      style={{
                        padding: '0.75rem',
                        color: isCurrent ? 'var(--c-sky-blue)' : '#0f172a',
                        fontWeight: 800,
                        fontSize: '1.05rem',
                        borderLeft: '1px solid rgba(194, 202, 216, 0.4)',
                      }}
                    >
                      Room {r.roomNo} {isCurrent && <span style={{ fontSize: '0.75rem', color: 'var(--c-sky-blue)' }}>(Current)</span>}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid rgba(194, 202, 216, 0.4)' }}>
                <td style={{ padding: '0.75rem', color: '#475569', fontWeight: 700 }}>Monthly Rent</td>
                {compareRooms.map((r) => (
                  <td key={r.roomNo} style={{ padding: '0.75rem', fontWeight: 800, color: 'var(--c-gold)', fontSize: '1.05rem', borderLeft: '1px solid rgba(194, 202, 216, 0.4)' }}>
                    ₹{r.rent.toLocaleString()} / mo
                  </td>
                ))}
              </tr>

              <tr style={{ borderBottom: '1px solid rgba(194, 202, 216, 0.4)' }}>
                <td style={{ padding: '0.75rem', color: '#475569', fontWeight: 700 }}>Room Type</td>
                {compareRooms.map((r) => (
                  <td key={r.roomNo} style={{ padding: '0.75rem', color: '#0f172a', fontWeight: 700, borderLeft: '1px solid rgba(194, 202, 216, 0.4)' }}>
                    {r.type} Room
                  </td>
                ))}
              </tr>

              <tr style={{ borderBottom: '1px solid rgba(194, 202, 216, 0.4)' }}>
                <td style={{ padding: '0.75rem', color: '#475569', fontWeight: 700 }}>Status</td>
                {compareRooms.map((r) => {
                  const isAvail = r.status === 'AVAILABLE';
                  return (
                    <td key={r.roomNo} style={{ padding: '0.75rem', borderLeft: '1px solid rgba(194, 202, 216, 0.4)' }}>
                      <span
                        style={{
                          color: isAvail ? 'var(--c-green)' : 'var(--c-red)',
                          fontWeight: 800,
                          fontSize: '0.82rem',
                          background: isAvail ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                          border: isAvail ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid rgba(239, 68, 68, 0.35)',
                          padding: '0.2rem 0.55rem',
                          borderRadius: 'var(--radius-pill)',
                        }}
                      >
                        ● {r.status}
                      </span>
                    </td>
                  );
                })}
              </tr>

              <tr style={{ borderBottom: '1px solid rgba(194, 202, 216, 0.4)' }}>
                <td style={{ padding: '0.75rem', color: '#475569', fontWeight: 700 }}>Attached Washroom</td>
                {compareRooms.map((r) => (
                  <td key={r.roomNo} style={{ padding: '0.75rem', borderLeft: '1px solid rgba(194, 202, 216, 0.4)', color: '#0f172a', fontWeight: 600 }}>
                    {r.attachedBath ? (
                      <span style={{ color: 'var(--c-green)', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 800 }}>
                        <Check size={16} /> Yes (Private Western)
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Minus size={16} /> Shared Washroom
                      </span>
                    )}
                  </td>
                ))}
              </tr>

              <tr style={{ borderBottom: '1px solid rgba(194, 202, 216, 0.4)' }}>
                <td style={{ padding: '0.75rem', color: '#475569', fontWeight: 700 }}>Floor & Access</td>
                {compareRooms.map((r) => (
                  <td key={r.roomNo} style={{ padding: '0.75rem', color: '#334155', fontWeight: 600, borderLeft: '1px solid rgba(194, 202, 216, 0.4)' }}>
                    Floor {r.floor} ({r.floor === 1 ? 'Direct Mess Hall Access' : 'Quiet Terrace Level'})
                  </td>
                ))}
              </tr>

              <tr>
                <td style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>Action</td>
                {compareRooms.map((r) => {
                  const isAvail = r.status === 'AVAILABLE';
                  return (
                    <td key={r.roomNo} style={{ padding: '0.75rem', borderLeft: '1px solid rgba(255, 255, 255, 0.06)' }}>
                      {isAvail ? (
                        <button
                          onClick={() => {
                            onSelectRoom(r);
                            onClose();
                          }}
                          className="btn-iridescent"
                          style={{
                            padding: '0.45rem 0.85rem',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          Select Room {r.roomNo}
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Not Available</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
