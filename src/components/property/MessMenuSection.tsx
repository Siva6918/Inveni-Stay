import React, { useState } from 'react';
import { PropertyListing, DailyMealMenu } from '../../types';
import { Utensils, Clock, Info, CheckCircle2, Sparkles, Image as ImageIcon, Flame } from 'lucide-react';

interface MessMenuSectionProps {
  property: PropertyListing;
  onOpenMessPhoto: (title: string) => void;
}

export const MessMenuSection: React.FC<MessMenuSectionProps> = ({ property, onOpenMessPhoto }) => {
  const [activeDay, setActiveDay] = useState<string>('Monday');

  const defaultMenu: DailyMealMenu[] = property.messMenu || [
    {
      day: 'Monday',
      breakfast: ['Idli & Crispy Vada', 'Fresh Coconut Chutney', 'Hot Drumstick Sambar', 'Tea / Coffee'],
      lunch: ['Steamed Rice', 'Tomato Pappu (Dal)', 'Bendakaya (Okra) Fry', 'Majjiga (Fresh Buttermilk)', 'Papad & Gongura Pickle'],
      dinner: ['Phulka Chapatis', 'Mixed Veg Kurma', 'Curd Rice with Pomegranate', 'Seasonal Fresh Cut Fruit'],
    },
    {
      day: 'Wednesday',
      breakfast: ['Mysore Bonda', 'Allam (Ginger) Chutney', 'Poha Upma', 'Filter Coffee'],
      lunch: ['Steamed Rice', 'Palak Dal', 'Aloo Gobi Masala', 'Rasam', 'Curd & Pickles'],
      dinner: ['Egg Curry / Kadai Paneer', 'Layered Parottas', 'Jeera Rice', 'Gulab Jamun Sweet'],
      special: 'Wednesday Non-Veg / Special Paneer Feast',
    },
    {
      day: 'Sunday',
      breakfast: ['Crispy Masala Dosa', 'Alugadda Kurma', 'Spicy Chutney', 'Ginger Tea'],
      lunch: ['Andhra Chicken Biryani / Paneer Biryani', 'Mirchi Ka Salan', 'Onion Raitha', 'Double Ka Meetha Sweet'],
      dinner: ['Ghee Chapatis', 'Dal Tadka', 'Jeera Rice', 'Warm Milk with Turmeric'],
      special: 'Sunday Special Biryani & Feast',
    },
  ];

  const currentMenu = defaultMenu.find((m) => m.day.toLowerCase() === activeDay.toLowerCase()) || defaultMenu[0];

  const messPhotos = [
    {
      title: 'Main Dining Hall (24 Seats)',
      url: 'https://images.unsplash.com/photo-1567521464027-f127ff144326?auto=format&fit=crop&w=600&q=80',
    },
    {
      title: 'Hygienic Commercial Kitchen',
      url: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=600&q=80',
    },
    {
      title: 'RO Drinking Water & Handwash',
      url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80',
    },
  ];

  return (
    <section
      style={{
        marginBottom: '3.5rem',
        padding: '2.5rem',
        background: 'var(--surface-neomorph)',
        border: '1.5px solid rgba(255, 255, 255, 0.85)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: 'var(--shadow-neomorph-lg)',
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div className="metaverse-hud" style={{ marginBottom: '0.75rem' }}>
          <Utensils size={14} color="var(--c-gold)" />
          <span>[HOMESTYLE MESS & MEAL TELEMETRY]</span>
        </div>

        <h2
          style={{
            fontFamily: 'var(--font-headline)',
            fontSize: 'clamp(1.75rem, 3vw, 2.35rem)',
            fontWeight: 800,
            color: '#0f172a',
            textTransform: 'uppercase',
            letterSpacing: '0.02em',
            margin: '0 0 0.5rem 0',
          }}
        >
          Authentic Andhra Weekly Mess Schedule
        </h2>

        <p
          style={{
            color: 'var(--text-secondary)',
            fontSize: '0.95rem',
            maxWidth: '750px',
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          Food is often the biggest anxiety when relocating to a new town. At Sri Sai Residency, all 3 daily meals are
          cooked on-premise by native Rayalaseema cooks using fresh local ingredients.
        </p>
      </div>

      {/* Day Selector Tabs (Neomorphic Pill Bay) */}
      <div
        style={{
          display: 'flex',
          gap: '0.6rem',
          overflowX: 'auto',
          padding: '0.4rem',
          background: 'var(--surface-neomorph-inset)',
          borderRadius: 'var(--radius-full)',
          boxShadow: 'var(--shadow-neomorph-inset-sm)',
          border: '1px solid rgba(194, 202, 216, 0.35)',
          marginBottom: '1.75rem',
        }}
      >
        {defaultMenu.map((m) => {
          const isActive = activeDay.toLowerCase() === m.day.toLowerCase();
          return (
            <button
              key={m.day}
              onClick={() => setActiveDay(m.day)}
              style={{
                padding: '0.55rem 1.25rem',
                borderRadius: 'var(--radius-full)',
                background: isActive ? 'linear-gradient(135deg, var(--c-gold) 0%, var(--c-orange) 100%)' : 'transparent',
                color: isActive ? '#ffffff' : '#334155',
                border: 'none',
                fontWeight: 800,
                fontSize: '0.85rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease',
                boxShadow: isActive ? '0 0 15px rgba(217, 119, 6, 0.45)' : 'none',
              }}
            >
              {m.day} {m.special && '⭐'}
            </button>
          );
        })}
      </div>

      {/* 3 Meal Columns (Breakfast, Lunch, Dinner) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem',
        }}
      >
        {/* Breakfast Card */}
        <div
          style={{
            background: 'var(--surface-neomorph)',
            border: '1px solid rgba(255, 255, 255, 0.9)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.4rem',
            boxShadow: 'var(--shadow-neomorph-sm)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
            <span style={{ color: 'var(--c-gold)', fontWeight: 800, fontSize: '0.88rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Breakfast
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600 }}>
              <Clock size={12} /> 7:30 AM – 9:30 AM
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
            {currentMenu.breakfast.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0f172a', fontSize: '0.9rem', fontWeight: 600 }}>
                <CheckCircle2 size={15} color="var(--c-green)" style={{ flexShrink: 0 }} />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Lunch Card */}
        <div
          style={{
            background: 'var(--surface-neomorph)',
            border: '1px solid rgba(255, 255, 255, 0.9)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.4rem',
            boxShadow: 'var(--shadow-neomorph-sm)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
            <span style={{ color: 'var(--c-green)', fontWeight: 800, fontSize: '0.88rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Lunch
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600 }}>
              <Clock size={12} /> 12:30 PM – 2:30 PM
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
            {currentMenu.lunch.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0f172a', fontSize: '0.9rem', fontWeight: 600 }}>
                <CheckCircle2 size={15} color="var(--c-green)" style={{ flexShrink: 0 }} />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Dinner Card */}
        <div
          style={{
            background: 'var(--surface-neomorph)',
            border: '1px solid rgba(255, 255, 255, 0.9)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.4rem',
            boxShadow: 'var(--shadow-neomorph-sm)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
            <span style={{ color: 'var(--c-sky-blue)', fontWeight: 800, fontSize: '0.88rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Dinner
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 600 }}>
              <Clock size={12} /> 7:30 PM – 9:45 PM
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {currentMenu.dinner.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0f172a', fontSize: '0.9rem' }}>
                <CheckCircle2 size={15} color="var(--c-green)" style={{ flexShrink: 0 }} />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Special Highlights if present */}
      {currentMenu.special && (
        <div
          style={{
            background: 'rgba(217, 119, 6, 0.1)',
            border: '1px solid rgba(217, 119, 6, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '0.75rem 1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            color: 'var(--c-gold)',
            fontSize: '0.88rem',
            fontWeight: 800,
            marginBottom: '2rem',
          }}
        >
          <Flame size={18} />
          <span>{currentMenu.special}</span>
        </div>
      )}

      {/* Mess Photos Showcase */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h4 style={{ color: '#0f172a', fontSize: '1rem', fontWeight: 800, margin: 0 }}>
            Mess & Kitchen Inspection Photos
          </h4>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Click photo to inspect dining environment
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
          {messPhotos.map((photo, pIdx) => (
            <div
              key={pIdx}
              onClick={() => onOpenMessPhoto(photo.title)}
              style={{
                position: 'relative',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                aspectRatio: '16/10',
                border: '1px solid #e2e8f0',
                cursor: 'pointer',
              }}
            >
              <img
                src={photo.url}
                alt={photo.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(15, 23, 42, 0.85) 0%, transparent 60%)',
                  display: 'flex',
                  alignItems: 'flex-end',
                  padding: '0.65rem 0.85rem',
                }}
              >
                <span style={{ color: '#ffffff', fontSize: '0.78rem', fontWeight: 700 }}>
                  {photo.title}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Honest Demo Disclaimer Notice */}
      <div
        style={{
          marginTop: '1.75rem',
          padding: '0.75rem 1rem',
          borderRadius: 'var(--radius-md)',
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          color: 'var(--text-muted)',
          fontSize: '0.78rem',
        }}
      >
        <Info size={16} color="var(--c-gold)" style={{ flexShrink: 0 }} />
        <span>
          <strong>Notice: Sample demonstration menu</strong> based on host declaration during onboarding. Weekly items
          and festive menus rotate periodically.
        </span>
      </div>
    </section>
  );
};
