
import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, StatusBar, SafeAreaView, Dimensions,
} from 'react-native';

const { width: SCREEN_W } = Dimensions.get('window');

// ─── Constants ───────────────────────────────────────────────────────────────

const YEAR_START  = new Date('2026-01-01T00:00:00').getTime();
const YEAR_END    = new Date('2027-01-01T00:00:00').getTime();
const TOTAL_MS    = YEAR_END - YEAR_START;

const MONTH_NAMES = [
  'January','February','March','April',
  'May','June','July','August',
  'September','October','November','December',
];
const DAYS_IN_MONTH = [31,28,31,30,31,30,31,31,30,31,30,31];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getData() {
  const now       = Date.now();
  const elapsed   = Math.max(0, now - YEAR_START);
  const remaining = Math.max(0, YEAR_END - now);
  const pct       = Math.min(100, (elapsed / TOTAL_MS) * 100);
  const nowDate   = new Date(now);
  const curMonth  = nowDate.getMonth();

  const remSec    = Math.floor(remaining / 1000);
  const remMin    = Math.floor(remSec / 60);
  const remHours  = Math.floor(remMin / 60);
  const remDays   = Math.floor(remHours / 24);
  const remWeeks  = Math.floor(remDays / 7);
  const remMonths = Math.max(0, 11 - curMonth);

  return { nowDate, pct, curMonth, remSec, remMin, remHours, remDays, remWeeks, remMonths };
}

function fmt(n) {
  return n >= 1000 ? n.toLocaleString() : String(n);
}

// ─── Theme ────────────────────────────────────────────────────────────────────

const C = {
  bg:          '#0A0A0A',
  sidebar:     '#0F0F0F',
  sidebarSel:  '#252525',
  border:      'rgba(255,255,255,0.07)',
  borderMed:   'rgba(255,255,255,0.13)',
  text:        '#F0EEE9',
  textMuted:   '#5A5A55',
  textDim:     '#333330',
  dotOn:       '#FFFFFF',
  dotOff:      '#222220',
  dotCurrent:  '#AAAAAA',
};

// ─── Dot component ────────────────────────────────────────────────────────────

function Dot({ on, size = 9, dimmed = false }) {
  return (
    <View style={{
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: on ? C.dotOn : C.dotOff,
      opacity: dimmed ? 0.35 : 1,
      margin: 3,
    }} />
  );
}

// ─── MONTH VIEW — dot grid per month ──────────────────────────────────────────

function MonthView({ curMonth }) {
  const daysLeft = DAYS_IN_MONTH.slice(curMonth).reduce((a, b) => a + b, 0);

  return (
    <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
      <Text style={styles.viewTitle}>Remaining months</Text>
      <Text style={styles.viewSub}>
        {11 - curMonth} months · {fmt(daysLeft)} days left in 2026
      </Text>

      {MONTH_NAMES.map((name, i) => {
        const isPast    = i < curMonth;
        const isCurrent = i === curMonth;
        const isFuture  = i > curMonth;
        const days      = DAYS_IN_MONTH[i];

        return (
          <View key={i} style={[styles.monthRow, isPast && { opacity: 0.3 }]}>
            <Text style={[
              styles.monthName,
              isCurrent && { color: C.text },
              isFuture  && { color: C.textMuted },
              isPast    && { color: C.textDim },
            ]}>
              {name.slice(0, 3).toUpperCase()}
            </Text>
            <View style={styles.monthDots}>
              {Array.from({ length: days }).map((_, di) => (
                <Dot
                  key={di}
                  on={!isPast}
                  size={8}
                  dimmed={false}
                />
              ))}
            </View>
            <Text style={styles.monthCount}>{days}d</Text>
          </View>
        );
      })}
    </ScrollView>
  );
}

// ─── WEEK VIEW ────────────────────────────────────────────────────────────────

function WeekView({ remWeeks }) {
  const total = 52;
  const used  = total - remWeeks;

  return (
    <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
      <Text style={styles.viewTitle}>Remaining weeks</Text>
      <Text style={styles.viewSub}>{remWeeks} of 52 weeks left in 2026</Text>
      <View style={styles.dotGrid}>
        {Array.from({ length: total }).map((_, i) => (
          <Dot key={i} on={i >= used} size={16} />
        ))}
      </View>
    </ScrollView>
  );
}

// ─── DAY VIEW ─────────────────────────────────────────────────────────────────

function DayView({ remDays }) {
  const total = 365;
  const used  = total - remDays;

  return (
    <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
      <Text style={styles.viewTitle}>Remaining days</Text>
      <Text style={styles.viewSub}>{fmt(remDays)} of 365 days left in 2026</Text>
      <View style={styles.dotGrid}>
        {Array.from({ length: total }).map((_, i) => (
          <Dot key={i} on={i >= used} size={11} />
        ))}
      </View>
    </ScrollView>
  );
}

// ─── YEAR VIEW ────────────────────────────────────────────────────────────────

function YearView({ pct, remDays }) {
  const total = 365;
  const used  = total - remDays;

  return (
    <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
      <Text style={styles.viewTitle}>Year 2026</Text>
      <Text style={styles.viewSub}>{pct.toFixed(1)}% of the year gone</Text>
      <View style={styles.dotGrid}>
        {Array.from({ length: total }).map((_, i) => (
          <Dot key={i} on={i >= used} size={11} />
        ))}
      </View>
    </ScrollView>
  );
}

// ─── STATS VIEW ───────────────────────────────────────────────────────────────

function StatsView({ data }) {
  const rows = [
    { label: 'Year complete',  value: data.pct.toFixed(1) + '%' },
    { label: 'Months left',    value: String(data.remMonths) },
    { label: 'Weeks left',     value: fmt(data.remWeeks) },
    { label: 'Days left',      value: fmt(data.remDays) },
    { label: 'Hours left',     value: fmt(data.remHours) },
    { label: 'Minutes left',   value: fmt(data.remMin) },
    { label: 'Seconds left',   value: fmt(data.remSec) },
  ];

  return (
    <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
      <Text style={styles.viewTitle}>2026 stats</Text>
      <Text style={styles.viewSub}>Live countdown — updates every second</Text>
      {rows.map((row, i) => (
        <View key={i} style={styles.statRow}>
          <Text style={styles.statLabel}>{row.label}</Text>
          <Text style={styles.statValue}>{row.value}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

// ─── Sidebar item ─────────────────────────────────────────────────────────────

const ICONS = { Now:'◎', Today:'◐', Month:'▦', Week:'▤', Year:'▨', Stats:'≡' };

function SidebarItem({ label, selected, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={[styles.sidebarItem, selected && styles.sidebarItemSel]}
    >
      <Text style={[styles.sidebarIcon, selected && styles.sidebarIconSel]}>
        {ICONS[label] || '·'}
      </Text>
      <Text style={[styles.sidebarLabel, selected && styles.sidebarLabelSel]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────

const MENU = ['Now', 'Today', 'Month', 'Week', 'Year', 'Stats'];

export default function App() {
  const [active, setActive] = useState('Month');
  const [data, setData]     = useState(getData());

  useEffect(() => {
    const id = setInterval(() => setData(getData()), 1000);
    return () => clearInterval(id);
  }, []);

  function renderView() {
    switch (active) {
      case 'Now':
      case 'Today':  return <DayView remDays={data.remDays} />;
      case 'Month':  return <MonthView curMonth={data.curMonth} />;
      case 'Week':   return <WeekView remWeeks={data.remWeeks} />;
      case 'Year':   return <YearView pct={data.pct} remDays={data.remDays} />;
      case 'Stats':  return <StatsView data={data} />;
      default:       return <MonthView curMonth={data.curMonth} />;
    }
  }

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

      {/* Top bar */}
      <View style={styles.topBar}>
        <Text style={styles.topBarTitle}>2026</Text>
        <View style={styles.topBarRight}>
          <Text style={styles.topBarPct}>{data.pct.toFixed(1)}%</Text>
          <Text style={styles.topBarPctLabel}> left</Text>
        </View>
      </View>

      <View style={styles.body}>

        {}
        <View style={styles.sidebar}>
          {MENU.map(item => (
            <SidebarItem
              key={item}
              label={item}
              selected={active === item}
              onPress={() => setActive(item)}
            />
          ))}
          <View style={styles.divider} />
          <TouchableOpacity style={styles.sidebarItem} activeOpacity={0.7}>
            <Text style={styles.sidebarIcon}>+</Text>
            <Text style={[styles.sidebarLabel, { fontSize: 11 }]}>Special dates</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sidebarItem} activeOpacity={0.7}>
            <Text style={styles.sidebarIcon}>⚙</Text>
            <Text style={styles.sidebarLabel}>Settings</Text>
          </TouchableOpacity>
        </View>

        {}
        <View style={styles.content}>
          {renderView()}
        </View>

      </View>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({

  root: { flex: 1, backgroundColor: C.bg },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: C.border,
  },
  topBarTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: C.text,
    letterSpacing: 1,
  },
  topBarRight: { flexDirection: 'row', alignItems: 'baseline' },
  topBarPct: { fontSize: 13, fontWeight: '500', color: C.text },
  topBarPctLabel: { fontSize: 11, color: C.textMuted },

  body: { flex: 1, flexDirection: 'row' },

  // Sidebar
  sidebar: {
    width: 120,
    backgroundColor: C.sidebar,
    borderRightWidth: 0.5,
    borderRightColor: C.border,
    paddingTop: 10,
    paddingBottom: 20,
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginHorizontal: 6,
    borderRadius: 8,
    marginBottom: 1,
  },
  sidebarItemSel: {
    backgroundColor: C.sidebarSel,
  },
  sidebarIcon: {
    fontSize: 13,
    color: C.textMuted,
    width: 16,
    textAlign: 'center',
  },
  sidebarIconSel: { color: C.text },
  sidebarLabel: {
    fontSize: 12,
    color: C.textMuted,
  },
  sidebarLabelSel: {
    color: C.text,
    fontWeight: '500',
  },
  divider: {
    height: 0.5,
    backgroundColor: C.border,
    marginHorizontal: 12,
    marginVertical: 8,
  },

  // Content
  content: {
    flex: 1,
    paddingHorizontal: 14,
    paddingTop: 18,
  },
  viewTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: C.text,
    marginBottom: 3,
  },
  viewSub: {
    fontSize: 11,
    color: C.textMuted,
    marginBottom: 18,
    letterSpacing: 0.2,
  },

  // Dot grid (weeks / days / year)
  dotGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  // Month rows
  monthRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  monthName: {
    width: 30,
    fontSize: 8,
    fontWeight: '500',
    letterSpacing: 0.6,
    color: C.textMuted,
    marginTop: 5,
  },
  monthDots: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  monthCount: {
    fontSize: 8,
    color: C.textDim,
    marginTop: 5,
    marginLeft: 4,
    width: 20,
    textAlign: 'right',
  },

  // Stats
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: C.border,
  },
  statLabel: { fontSize: 13, color: C.textMuted },
  statValue: { fontSize: 14, fontWeight: '500', color: C.text },
});