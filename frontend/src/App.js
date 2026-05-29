import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { appointments as apptApi, doctors as doctorsApi, patients as patientsApi, records as recordsApi, prescriptions as rxApi, stats as statsApi } from './api';

const C = {
  primary: '#0ea5e9', primaryDark: '#0284c7',
  success: '#22c55e', warning: '#f59e0b',
  danger: '#ef4444', purple: '#8b5cf6',
  bg: '#f0f7ff', surface: '#ffffff',
  surface2: '#f8fafc', border: '#e2e8f0',
  text: '#0f172a', muted: '#94a3b8', dark: '#1e293b',
};

const STATUS_COLORS = {
  pending: { bg: '#fef3c7', color: '#d97706', label: 'Pending' },
  confirmed: { bg: '#dbeafe', color: '#2563eb', label: 'Confirmed' },
  completed: { bg: '#dcfce7', color: '#16a34a', label: 'Completed' },
  cancelled: { bg: '#fee2e2', color: '#dc2626', label: 'Cancelled' },
};

const Card = ({ children, style = {} }) => (
  <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 20, ...style }}>{children}</div>
);

const StatCard = ({ icon, label, value, color = C.primary, sub }) => (
  <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: '16px', display: 'flex', alignItems: 'center', gap: 14 }}>
    <div style={{ width: 48, height: 48, borderRadius: 14, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{icon}</div>
    <div>
      <div style={{ fontSize: 11, color: C.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 800, color: C.dark, lineHeight: 1.2 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{sub}</div>}
    </div>
  </div>
);

const Badge = ({ status }) => {
  const s = STATUS_COLORS[status] || STATUS_COLORS.pending;
  return <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: s.bg, color: s.color }}>{s.label}</span>;
};

const Btn = ({ children, onClick, color = C.primary, outline = false, small = false, disabled = false, full = false, style = {} }) => (
  <button onClick={onClick} disabled={disabled} style={{ padding: small ? '6px 12px' : '10px 18px', background: outline ? 'transparent' : color, color: outline ? color : '#fff', border: `2px solid ${color}`, borderRadius: 9, cursor: disabled ? 'not-allowed' : 'pointer', fontSize: small ? 12 : 13, fontWeight: 600, opacity: disabled ? 0.6 : 1, width: full ? '100%' : 'auto', transition: 'all 0.15s', ...style }}>
    {children}
  </button>
);

const Inp = ({ label, ...props }) => (
  <div style={{ marginBottom: 14 }}>
    {label && <label style={{ fontSize: 12, fontWeight: 600, color: C.dark, display: 'block', marginBottom: 5 }}>{label}</label>}
    <input {...props} style={{ width: '100%', padding: '10px 14px', border: `1.5px solid ${C.border}`, borderRadius: 9, fontSize: 14, boxSizing: 'border-box', fontFamily: 'inherit', color: C.text, background: C.surface, outline: 'none', ...props.style }} />
  </div>
);

const Sel = ({ label, children, ...props }) => (
  <div style={{ marginBottom: 14 }}>
    {label && <label style={{ fontSize: 12, fontWeight: 600, color: C.dark, display: 'block', marginBottom: 5 }}>{label}</label>}
    <select {...props} style={{ width: '100%', padding: '10px 14px', border: `1.5px solid ${C.border}`, borderRadius: 9, fontSize: 14, boxSizing: 'border-box', fontFamily: 'inherit', color: C.text, background: C.surface, outline: 'none' }}>{children}</select>
  </div>
);

const Textarea = ({ label, ...props }) => (
  <div style={{ marginBottom: 14 }}>
    {label && <label style={{ fontSize: 12, fontWeight: 600, color: C.dark, display: 'block', marginBottom: 5 }}>{label}</label>}
    <textarea {...props} style={{ width: '100%', padding: '10px 14px', border: `1.5px solid ${C.border}`, borderRadius: 9, fontSize: 14, boxSizing: 'border-box', fontFamily: 'inherit', resize: 'vertical', color: C.text, ...props.style }} />
  </div>
);

const TabBar = ({ tabs, active, onChange }) => (
  <div style={{ display: 'flex', gap: 6, marginBottom: 20, overflowX: 'auto', paddingBottom: 4 }}>
    {tabs.map(t => (
      <button key={t.key} onClick={() => onChange(t.key)} style={{ padding: '8px 14px', border: `1.5px solid ${active === t.key ? C.primary : C.border}`, borderRadius: 9, cursor: 'pointer', fontWeight: 600, fontSize: 13, background: active === t.key ? C.primary : C.surface, color: active === t.key ? '#fff' : C.muted, whiteSpace: 'nowrap', transition: 'all 0.15s', flexShrink: 0 }}>
        {t.label}
      </button>
    ))}
  </div>
);

const AppointmentCard = ({ appt, role, onStatusChange }) => (
  <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 16, marginBottom: 10 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, flexWrap: 'wrap' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
          <Badge status={appt.status} />
          <span style={{ fontSize: 12, color: C.muted }}>📅 {appt.date} at {appt.time?.slice(0, 5)}</span>
        </div>
        <div style={{ fontSize: 15, fontWeight: 700, color: C.dark, marginBottom: 2 }}>
          {role === 'patient' ? appt.doctor_name : appt.patient_name}
        </div>
        {role === 'patient' && <div style={{ fontSize: 12, color: C.primary, marginBottom: 4, textTransform: 'capitalize' }}>{appt.doctor_specialization}</div>}
        {appt.reason && <div style={{ fontSize: 13, color: C.muted }}>{appt.reason}</div>}
      </div>
      {(role === 'doctor' || role === 'admin') && onStatusChange && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', flexShrink: 0 }}>
          {appt.status === 'pending' && <Btn small color={C.success} onClick={() => onStatusChange(appt.id, 'confirmed')}>✓ Confirm</Btn>}
          {appt.status === 'confirmed' && <Btn small color={C.purple} onClick={() => onStatusChange(appt.id, 'completed')}>✓ Complete</Btn>}
          {!['cancelled', 'completed'].includes(appt.status) && <Btn small color={C.danger} outline onClick={() => onStatusChange(appt.id, 'cancelled')}>Cancel</Btn>}
        </div>
      )}
    </div>
  </div>
);

// ─── AUTH PAGE ────────────────────────────────────────────────────────────────
function AuthPage() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('login');
  const [role, setRole] = useState('patient');
  const [form, setForm] = useState({ username: '', email: '', password: '', password2: '', first_name: '', last_name: '', specialization: 'general', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      if (mode === 'login') await login({ username: form.username, password: form.password });
      else await register({ ...form, role });
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 40%, #075985 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ width: '100%', maxWidth: 460 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ width: 68, height: 68, borderRadius: 20, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 34, margin: '0 auto 12px' }}>🏥</div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: '#fff', letterSpacing: -0.5 }}>MedBook</h1>
          <p style={{ margin: '6px 0 0', color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>Modern Healthcare · Django · Express · React</p>
        </div>

        <div style={{ background: '#fff', borderRadius: 20, padding: 24, boxShadow: '0 25px 60px rgba(0,0,0,0.15)' }}>
          <div style={{ display: 'flex', background: C.bg, borderRadius: 12, padding: 3, marginBottom: 20 }}>
            {['login', 'register'].map(m => (
              <button key={m} onClick={() => setMode(m)} style={{ flex: 1, padding: '9px 0', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 13, background: mode === m ? C.primary : 'transparent', color: mode === m ? '#fff' : C.muted, transition: 'all 0.2s' }}>
                {m === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          {mode === 'register' && (
            <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
              {[{ key: 'patient', icon: '🙋', label: 'Patient' }, { key: 'doctor', icon: '👨‍⚕️', label: 'Doctor' }].map(r => (
                <button key={r.key} onClick={() => setRole(r.key)} style={{ flex: 1, padding: '10px 0', border: `2px solid ${role === r.key ? C.primary : C.border}`, borderRadius: 10, cursor: 'pointer', fontWeight: 600, fontSize: 13, background: role === r.key ? `${C.primary}12` : 'transparent', color: role === r.key ? C.primary : C.muted, transition: 'all 0.2s' }}>
                  {r.icon} {r.label}
                </button>
              ))}
            </div>
          )}

          {mode === 'register' && role === 'doctor' && (
            <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#92400e' }}>
              ⚠️ Doctor accounts require admin approval before you can access the dashboard.
            </div>
          )}

          {error && <div style={{ background: '#fef2f2', color: C.danger, padding: '10px 14px', borderRadius: 10, marginBottom: 16, fontSize: 13, border: `1px solid #fecaca` }}>{error}</div>}

          <form onSubmit={handle}>
            {mode === 'register' && (
              <div style={{ display: 'flex', gap: 10 }}>
                <Inp label="First Name" placeholder="First name" value={form.first_name} onChange={e => setForm({ ...form, first_name: e.target.value })} style={{ flex: 1 }} />
                <Inp label="Last Name" placeholder="Last name" value={form.last_name} onChange={e => setForm({ ...form, last_name: e.target.value })} style={{ flex: 1 }} />
              </div>
            )}
            <Inp label="Username" required placeholder="Username" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} />
            {mode === 'register' && <Inp label="Email" type="email" placeholder="Email address" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />}
            <Inp label="Password" required type="password" placeholder="Password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
            {mode === 'register' && <Inp label="Confirm Password" required type="password" placeholder="Confirm password" value={form.password2} onChange={e => setForm({ ...form, password2: e.target.value })} />}
            {mode === 'register' && <Inp label="Phone Number" placeholder="+234 800 000 0000" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />}
            {mode === 'register' && role === 'doctor' && (
              <Sel label="Specialization" value={form.specialization} onChange={e => setForm({ ...form, specialization: e.target.value })}>
                <option value="general">General Practice</option>
                <option value="cardiology">Cardiology</option>
                <option value="dermatology">Dermatology</option>
                <option value="neurology">Neurology</option>
                <option value="orthopedics">Orthopedics</option>
                <option value="pediatrics">Pediatrics</option>
                <option value="gynecology">Gynecology</option>
                <option value="psychiatry">Psychiatry</option>
                <option value="surgery">Surgery</option>
              </Sel>
            )}
            <button type="submit" disabled={loading} style={{ width: '100%', padding: '13px 0', background: loading ? C.muted : `linear-gradient(135deg, ${C.primary}, ${C.primaryDark})`, color: '#fff', border: 'none', borderRadius: 11, fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', marginTop: 4 }}>
              {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : `Register as ${role}`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ─── PENDING APPROVAL SCREEN ──────────────────────────────────────────────────
function PendingApproval({ user, logout }) {
  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ textAlign: 'center', maxWidth: 440 }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>⏳</div>
        <h2 style={{ color: C.dark, margin: '0 0 10px', fontSize: 22, fontWeight: 800 }}>Awaiting Approval</h2>
        <p style={{ color: C.muted, fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
          Your doctor account has been created successfully. An administrator will review and approve your account shortly. You will be able to access your dashboard once approved.
        </p>
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 20, marginBottom: 24, textAlign: 'left' }}>
          <div style={{ fontSize: 13, color: C.muted, marginBottom: 8 }}>Registered as</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: C.dark }}>Dr. {user?.first_name} {user?.last_name}</div>
          <div style={{ fontSize: 13, color: C.primary, marginTop: 4, textTransform: 'capitalize' }}>{user?.profile?.specialization}</div>
        </div>
        <Btn color={C.danger} outline onClick={logout}>Sign Out</Btn>
      </div>
    </div>
  );
}

// ─── DOCTOR DASHBOARD ─────────────────────────────────────────────────────────
function DoctorDashboard({ user }) {
  const [tab, setTab] = useState('overview');
  const [appts, setAppts] = useState([]);
  const [patients, setPatients] = useState([]);
  const [myRecords, setMyRecords] = useState([]);
  const [statData, setStatData] = useState({});
  const [loading, setLoading] = useState(true);
  const [showNewRecord, setShowNewRecord] = useState(false);
  const [newRecord, setNewRecord] = useState({ patient: '', diagnosis: '', symptoms: '', treatment: '', notes: '', visit_date: new Date().toISOString().slice(0, 10), follow_up_date: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([apptApi.list(), patientsApi.list(), recordsApi.list(), statsApi.get()])
      .then(([a, p, r, s]) => {
        setAppts(Array.isArray(a) ? a : (a?.results || []));
        setPatients(Array.isArray(p) ? p : (p?.results || []));
        setMyRecords(Array.isArray(r) ? r : (r?.results || []));
        setStatData(s);
        setLoading(false);
      }).catch(() => setLoading(false));
  }, []);

  const handleStatusChange = async (id, status) => {
    try {
      await apptApi.updateStatus(id, status);
      setAppts(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    } catch (err) { setError(err.message); }
  };

  const createRecord = async (e) => {
    e.preventDefault();
    try {
      const doctorId = user?.profile?.id;
      const rec = await recordsApi.create({ ...newRecord, doctor: doctorId });
      setMyRecords([rec, ...myRecords]);
      setShowNewRecord(false);
      setNewRecord({ patient: '', diagnosis: '', symptoms: '', treatment: '', notes: '', visit_date: new Date().toISOString().slice(0, 10), follow_up_date: '' });
    } catch (err) { setError(err.message); }
  };

  const todayAppts = appts.filter(a => a.date === new Date().toISOString().slice(0, 10));

  return (
    <div>
      {error && <div style={{ background: '#fef2f2', color: C.danger, padding: '10px 16px', borderRadius: 10, marginBottom: 16, fontSize: 13 }}>{error}<button onClick={() => setError('')} style={{ background: 'none', border: 'none', color: C.danger, marginLeft: 8, cursor: 'pointer', fontWeight: 700 }}>✕</button></div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 20 }}>
        <StatCard icon="📅" label="Today" value={statData.today_appointments || 0} color={C.primary} />
        <StatCard icon="⏳" label="Pending" value={statData.pending_appointments || 0} color={C.warning} />
        <StatCard icon="✅" label="Completed" value={statData.completed_appointments || 0} color={C.success} />
        <StatCard icon="👥" label="Patients" value={statData.total_patients || 0} color={C.purple} />
      </div>

      <TabBar active={tab} onChange={setTab} tabs={[
        { key: 'overview', label: "📅 Today" },
        { key: 'appointments', label: '🗓 All Appointments' },
        { key: 'records', label: '📋 Records' },
        { key: 'patients', label: '👥 Patients' },
      ]} />

      {loading && <div style={{ textAlign: 'center', padding: 40, color: C.muted }}>Loading...</div>}

      {tab === 'overview' && (
        <div>
          <p style={{ color: C.muted, fontSize: 13, marginBottom: 14 }}>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          {todayAppts.length === 0 ? (
            <Card style={{ textAlign: 'center', padding: 40 }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>🎉</div>
              <div style={{ color: C.muted, fontSize: 14 }}>No appointments today!</div>
            </Card>
          ) : todayAppts.map(a => <AppointmentCard key={a.id} appt={a} role="doctor" onStatusChange={handleStatusChange} />)}
        </div>
      )}

      {tab === 'appointments' && (
        <div>
          {appts.length === 0 ? <Card style={{ textAlign: 'center', padding: 40 }}><div style={{ color: C.muted }}>No appointments yet</div></Card>
            : appts.map(a => <AppointmentCard key={a.id} appt={a} role="doctor" onStatusChange={handleStatusChange} />)}
        </div>
      )}

      {tab === 'records' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
            <h3 style={{ margin: 0, color: C.dark, fontSize: 16 }}>Medical Records</h3>
            <Btn onClick={() => setShowNewRecord(!showNewRecord)}>+ New Record</Btn>
          </div>
          {showNewRecord && (
            <Card style={{ marginBottom: 16 }}>
              <h4 style={{ margin: '0 0 14px', color: C.dark }}>Create Medical Record</h4>
              <form onSubmit={createRecord}>
                <Sel label="Patient *" required value={newRecord.patient} onChange={e => setNewRecord({ ...newRecord, patient: e.target.value })}>
                  <option value="">Select patient...</option>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}
                </Sel>
                <Inp label="Visit Date" type="date" value={newRecord.visit_date} onChange={e => setNewRecord({ ...newRecord, visit_date: e.target.value })} />
                <Textarea label="Diagnosis *" required rows={2} value={newRecord.diagnosis} onChange={e => setNewRecord({ ...newRecord, diagnosis: e.target.value })} placeholder="Enter diagnosis" />
                <Textarea label="Symptoms" rows={2} value={newRecord.symptoms} onChange={e => setNewRecord({ ...newRecord, symptoms: e.target.value })} placeholder="Enter symptoms" />
                <Textarea label="Treatment" rows={2} value={newRecord.treatment} onChange={e => setNewRecord({ ...newRecord, treatment: e.target.value })} placeholder="Enter treatment plan" />
                <Inp label="Follow-up Date" type="date" value={newRecord.follow_up_date} onChange={e => setNewRecord({ ...newRecord, follow_up_date: e.target.value })} />
                <div style={{ display: 'flex', gap: 8 }}>
                  <Btn>Save Record</Btn>
                  <Btn outline color={C.muted} onClick={() => setShowNewRecord(false)}>Cancel</Btn>
                </div>
              </form>
            </Card>
          )}
          {myRecords.map(r => (
            <Card key={r.id} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.dark, marginBottom: 4 }}>{r.patient_name}</div>
                  <div style={{ fontSize: 13, color: C.primary, marginBottom: 6, fontWeight: 600 }}>{r.diagnosis}</div>
                  {r.symptoms && <div style={{ fontSize: 12, color: C.muted, marginBottom: 4 }}>Symptoms: {r.symptoms}</div>}
                  {r.treatment && <div style={{ fontSize: 12, color: C.muted }}>Treatment: {r.treatment}</div>}
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 12, color: C.muted }}>📅 {r.visit_date}</div>
                  {r.follow_up_date && <div style={{ fontSize: 12, color: C.warning, marginTop: 4 }}>↩ {r.follow_up_date}</div>}
                </div>
              </div>
            </Card>
          ))}
          {myRecords.length === 0 && !loading && <Card style={{ textAlign: 'center', padding: 40 }}><div style={{ color: C.muted }}>No medical records yet</div></Card>}
        </div>
      )}

      {tab === 'patients' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
          {patients.map(p => (
            <Card key={p.id}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: `${C.primary}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>🙋</div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.dark, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.full_name}</div>
                  <div style={{ fontSize: 12, color: C.muted }}>{p.phone}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {p.blood_group && <span style={{ fontSize: 11, background: '#fef2f2', color: C.danger, padding: '2px 8px', borderRadius: 8, fontWeight: 600 }}>🩸 {p.blood_group}</span>}
                {p.age && <span style={{ fontSize: 11, background: C.surface2, color: C.muted, padding: '2px 8px', borderRadius: 8 }}>Age {p.age}</span>}
              </div>
              {p.allergies && p.allergies !== 'None' && <div style={{ fontSize: 12, color: C.warning, marginTop: 8 }}>⚠️ {p.allergies}</div>}
            </Card>
          ))}
          {patients.length === 0 && !loading && <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 40, color: C.muted }}>No patients yet</div>}
        </div>
      )}
    </div>
  );
}

// ─── PATIENT DASHBOARD ────────────────────────────────────────────────────────
function PatientDashboard({ user }) {
  const [tab, setTab] = useState('overview');
  const [appts, setAppts] = useState([]);
  const [doctorList, setDoctorList] = useState([]);
  const [myRecords, setMyRecords] = useState([]);
  const [myRx, setMyRx] = useState([]);
  const [statData, setStatData] = useState({});
  const [loading, setLoading] = useState(true);
  const [showBook, setShowBook] = useState(false);
  const [newAppt, setNewAppt] = useState({ doctor: '', date: '', time: '09:00', reason: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([apptApi.list(), doctorsApi.list(), recordsApi.list(), rxApi.list(), statsApi.get()])
      .then(([a, d, r, rx, s]) => {
        setAppts(Array.isArray(a) ? a : (a?.results || []));
        setDoctorList(Array.isArray(d) ? d : (d?.results || []));
        setMyRecords(Array.isArray(r) ? r : (r?.results || []));
        setMyRx(Array.isArray(rx) ? rx : (rx?.results || []));
        setStatData(s);
        setLoading(false);
      }).catch(() => setLoading(false));
  }, []);

  const bookAppointment = async (e) => {
    e.preventDefault();
    try {
      const patientId = user?.profile?.id;
      const appt = await apptApi.create({ ...newAppt, patient: patientId });
      setAppts([appt, ...appts]);
      setShowBook(false);
      setNewAppt({ doctor: '', date: '', time: '09:00', reason: '' });
    } catch (err) { setError(err.message); }
  };

  const upcoming = appts.filter(a => a.date >= new Date().toISOString().slice(0, 10) && ['pending', 'confirmed'].includes(a.status));

  return (
    <div>
      {error && <div style={{ background: '#fef2f2', color: C.danger, padding: '10px 16px', borderRadius: 10, marginBottom: 16, fontSize: 13 }}>{error}<button onClick={() => setError('')} style={{ background: 'none', border: 'none', color: C.danger, marginLeft: 8, cursor: 'pointer', fontWeight: 700 }}>✕</button></div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 20 }}>
        <StatCard icon="📅" label="Upcoming" value={statData.upcoming_appointments || 0} color={C.primary} />
        <StatCard icon="✅" label="Completed" value={statData.completed_appointments || 0} color={C.success} />
        <StatCard icon="📋" label="Records" value={statData.total_records || 0} color={C.purple} />
        <StatCard icon="💊" label="Prescriptions" value={statData.total_prescriptions || 0} color={C.warning} />
      </div>

      <TabBar active={tab} onChange={setTab} tabs={[
        { key: 'overview', label: '📅 Upcoming' },
        { key: 'appointments', label: '🗓 All' },
        { key: 'records', label: '📋 Records' },
        { key: 'prescriptions', label: '💊 Prescriptions' },
        { key: 'doctors', label: '👨‍⚕️ Doctors' },
      ]} />

      {loading && <div style={{ textAlign: 'center', padding: 40, color: C.muted }}>Loading...</div>}

      {tab === 'overview' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
            <h3 style={{ margin: 0, color: C.dark, fontSize: 16 }}>Upcoming Appointments</h3>
            <Btn onClick={() => setShowBook(true)}>+ Book</Btn>
          </div>
          {showBook && (
            <Card style={{ marginBottom: 16 }}>
              <h4 style={{ margin: '0 0 14px', color: C.dark }}>Book Appointment</h4>
              <form onSubmit={bookAppointment}>
                <Sel label="Select Doctor *" required value={newAppt.doctor} onChange={e => setNewAppt({ ...newAppt, doctor: e.target.value })}>
                  <option value="">Choose a doctor...</option>
                  {doctorList.map(d => <option key={d.id} value={d.id}>Dr. {d.user?.first_name} {d.user?.last_name} — {d.specialization}</option>)}
                </Sel>
                <div style={{ display: 'flex', gap: 10 }}>
                  <Inp label="Date *" required type="date" value={newAppt.date} onChange={e => setNewAppt({ ...newAppt, date: e.target.value })} style={{ flex: 1 }} />
                  <Inp label="Time *" required type="time" value={newAppt.time} onChange={e => setNewAppt({ ...newAppt, time: e.target.value })} style={{ flex: 1 }} />
                </div>
                <Textarea label="Reason" rows={2} value={newAppt.reason} onChange={e => setNewAppt({ ...newAppt, reason: e.target.value })} placeholder="Describe your symptoms..." />
                <div style={{ display: 'flex', gap: 8 }}>
                  <Btn>Book Now</Btn>
                  <Btn outline color={C.muted} onClick={() => setShowBook(false)}>Cancel</Btn>
                </div>
              </form>
            </Card>
          )}
          {upcoming.length === 0 && !showBook ? (
            <Card style={{ textAlign: 'center', padding: 40 }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>📅</div>
              <div style={{ color: C.muted, fontSize: 14, marginBottom: 16 }}>No upcoming appointments</div>
              <Btn onClick={() => setShowBook(true)}>Book Your First Appointment</Btn>
            </Card>
          ) : upcoming.map(a => <AppointmentCard key={a.id} appt={a} role="patient" />)}
        </div>
      )}

      {tab === 'appointments' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
            <h3 style={{ margin: 0, color: C.dark, fontSize: 16 }}>All Appointments</h3>
            <Btn onClick={() => { setTab('overview'); setShowBook(true); }}>+ Book New</Btn>
          </div>
          {appts.map(a => <AppointmentCard key={a.id} appt={a} role="patient" />)}
          {appts.length === 0 && !loading && <Card style={{ textAlign: 'center', padding: 40 }}><div style={{ color: C.muted }}>No appointments yet</div></Card>}
        </div>
      )}

      {tab === 'records' && (
        <div>
          <h3 style={{ margin: '0 0 16px', color: C.dark, fontSize: 16 }}>My Medical Records</h3>
          {myRecords.map(r => (
            <Card key={r.id} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: C.dark, marginBottom: 4 }}>{r.diagnosis}</div>
                  <div style={{ fontSize: 12, color: C.primary, marginBottom: 6 }}>By {r.doctor_name}</div>
                  {r.symptoms && <div style={{ fontSize: 12, color: C.muted, marginBottom: 4 }}>Symptoms: {r.symptoms}</div>}
                  {r.treatment && <div style={{ fontSize: 12, color: C.muted }}>Treatment: {r.treatment}</div>}
                  {r.prescriptions?.length > 0 && (
                    <div style={{ marginTop: 10 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: C.warning, marginBottom: 6 }}>💊 PRESCRIPTIONS</div>
                      {r.prescriptions.map(rx => (
                        <div key={rx.id} style={{ fontSize: 12, color: C.dark, background: '#fff7ed', padding: '6px 10px', borderRadius: 8, marginBottom: 4 }}>
                          <strong>{rx.medication_name}</strong> — {rx.dosage} · {rx.frequency} · {rx.duration}
                          {rx.instructions && <div style={{ color: C.muted, marginTop: 2 }}>{rx.instructions}</div>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 12, color: C.muted }}>📅 {r.visit_date}</div>
                  {r.follow_up_date && <div style={{ fontSize: 12, color: C.warning, marginTop: 4 }}>↩ {r.follow_up_date}</div>}
                </div>
              </div>
            </Card>
          ))}
          {myRecords.length === 0 && !loading && <Card style={{ textAlign: 'center', padding: 40 }}><div style={{ color: C.muted }}>No medical records yet</div></Card>}
        </div>
      )}

      {tab === 'prescriptions' && (
        <div>
          <h3 style={{ margin: '0 0 16px', color: C.dark, fontSize: 16 }}>My Prescriptions</h3>
          {myRx.map(rx => (
            <div key={rx.id} style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 14, padding: 16, marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: C.dark, marginBottom: 4 }}>💊 {rx.medication_name}</div>
                  <div style={{ fontSize: 13, color: C.warning, fontWeight: 600, marginBottom: 4 }}>{rx.dosage} · {rx.frequency} · {rx.duration}</div>
                  <div style={{ fontSize: 12, color: C.primary }}>By {rx.doctor_name}</div>
                  {rx.instructions && <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>{rx.instructions}</div>}
                </div>
                <div style={{ fontSize: 12, color: C.muted, flexShrink: 0 }}>📅 {rx.prescribed_date}</div>
              </div>
            </div>
          ))}
          {myRx.length === 0 && !loading && <Card style={{ textAlign: 'center', padding: 40 }}><div style={{ color: C.muted }}>No prescriptions yet</div></Card>}
        </div>
      )}

      {tab === 'doctors' && (
        <div>
          <h3 style={{ margin: '0 0 16px', color: C.dark, fontSize: 16 }}>Available Doctors</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
            {doctorList.map(d => (
              <Card key={d.id}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                  <div style={{ width: 48, height: 48, borderRadius: '50%', background: `${C.primary}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>👨‍⚕️</div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.dark }}>Dr. {d.user?.first_name} {d.user?.last_name}</div>
                    <div style={{ fontSize: 12, color: C.primary, textTransform: 'capitalize' }}>{d.specialization}</div>
                  </div>
                </div>
                {d.bio && <div style={{ fontSize: 12, color: C.muted, marginBottom: 10, lineHeight: 1.5 }}>{d.bio}</div>}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                  {d.years_experience > 0 && <span style={{ fontSize: 11, background: C.surface2, color: C.muted, padding: '3px 8px', borderRadius: 8 }}>⭐ {d.years_experience} yrs</span>}
                  {d.consultation_fee > 0 && <span style={{ fontSize: 11, background: '#f0fdf4', color: C.success, padding: '3px 8px', borderRadius: 8, fontWeight: 600 }}>₦{Number(d.consultation_fee).toLocaleString()}</span>}
                </div>
                <Btn full onClick={() => { setTab('overview'); setShowBook(true); setNewAppt(prev => ({ ...prev, doctor: String(d.id) })); }}>Book Appointment</Btn>
              </Card>
            ))}
            {doctorList.length === 0 && <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 40, color: C.muted }}>No approved doctors yet</div>}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ADMIN DASHBOARD ──────────────────────────────────────────────────────────
function AdminDashboard() {
  const [tab, setTab] = useState('overview');
  const [appts, setAppts] = useState([]);
  const [statData, setStatData] = useState({});
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [approvedDoctors, setApprovedDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api';

  const fetchDoctorApprovals = async () => {
    const token = localStorage.getItem('access_token');
    const res = await fetch(`${BASE_URL}/doctor-approvals/`, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setPendingDoctors(data.pending || []);
    setApprovedDoctors(data.approved || []);
  };

  useEffect(() => {
    Promise.all([apptApi.list(), statsApi.get()])
      .then(([a, s]) => {
        setAppts(Array.isArray(a) ? a : (a?.results || []));
        setStatData(s);
        setLoading(false);
      }).catch(() => setLoading(false));
    fetchDoctorApprovals();
  }, []);

  const handleApprove = async (id) => {
    try {
      const token = localStorage.getItem('access_token');
      await fetch(`${BASE_URL}/doctor-approvals/${id}/approve/`, { method: 'PATCH', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } });
      fetchDoctorApprovals();
      setStatData(prev => ({ ...prev, total_doctors: (prev.total_doctors || 0) + 1, pending_doctors: Math.max(0, (prev.pending_doctors || 0) - 1) }));
    } catch (err) { setError(err.message); }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Remove this doctor account?')) return;
    try {
      const token = localStorage.getItem('access_token');
      await fetch(`${BASE_URL}/doctor-approvals/${id}/reject/`, { method: 'PATCH', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } });
      fetchDoctorApprovals();
    } catch (err) { setError(err.message); }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await apptApi.updateStatus(id, status);
      setAppts(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    } catch (err) { setError(err.message); }
  };

  return (
    <div>
      {error && <div style={{ background: '#fef2f2', color: C.danger, padding: '10px 16px', borderRadius: 10, marginBottom: 16, fontSize: 13 }}>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 20 }}>
        <StatCard icon="👨‍⚕️" label="Doctors" value={statData.total_doctors || 0} color={C.primary} />
        <StatCard icon="⏳" label="Pending Doctors" value={statData.pending_doctors || 0} color={C.warning} sub="awaiting approval" />
        <StatCard icon="🙋" label="Patients" value={statData.total_patients || 0} color={C.purple} />
        <StatCard icon="📅" label="Today" value={statData.today_appointments || 0} color={C.success} />
      </div>

      <TabBar active={tab} onChange={setTab} tabs={[
        { key: 'overview', label: '📊 Overview' },
        { key: 'approvals', label: `⏳ Approvals ${pendingDoctors.length > 0 ? `(${pendingDoctors.length})` : ''}` },
        { key: 'doctors', label: '👨‍⚕️ Doctors' },
        { key: 'appointments', label: '📅 Appointments' },
      ]} />

      {loading && <div style={{ textAlign: 'center', padding: 40, color: C.muted }}>Loading...</div>}

      {tab === 'overview' && (
        <div>
          <h3 style={{ color: C.dark, margin: '0 0 16px', fontSize: 16 }}>Recent Appointments</h3>
          {appts.slice(0, 5).map(a => <AppointmentCard key={a.id} appt={a} role="admin" onStatusChange={handleStatusChange} />)}
          {appts.length === 0 && !loading && <Card style={{ textAlign: 'center', padding: 40 }}><div style={{ color: C.muted }}>No appointments yet</div></Card>}
        </div>
      )}

      {tab === 'approvals' && (
        <div>
          <h3 style={{ color: C.dark, margin: '0 0 16px', fontSize: 16 }}>Pending Doctor Approvals</h3>
          {pendingDoctors.length === 0 ? (
            <Card style={{ textAlign: 'center', padding: 40 }}>
              <div style={{ fontSize: 36, marginBottom: 10 }}>✅</div>
              <div style={{ color: C.muted, fontSize: 14 }}>No pending approvals!</div>
            </Card>
          ) : pendingDoctors.map(d => (
            <div key={d.id} style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 14, padding: 16, marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: C.dark }}>Dr. {d.user?.first_name} {d.user?.last_name}</div>
                  <div style={{ fontSize: 13, color: C.primary, textTransform: 'capitalize', marginTop: 2 }}>{d.specialization}</div>
                  <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{d.phone}</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Btn color={C.success} onClick={() => handleApprove(d.id)}>✓ Approve</Btn>
                  <Btn color={C.danger} outline onClick={() => handleReject(d.id)}>✕ Reject</Btn>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'doctors' && (
        <div>
          <h3 style={{ color: C.dark, margin: '0 0 16px', fontSize: 16 }}>Approved Doctors</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
            {approvedDoctors.map(d => (
              <Card key={d.id}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: `${C.primary}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>👨‍⚕️</div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.dark }}>Dr. {d.user?.first_name} {d.user?.last_name}</div>
                    <div style={{ fontSize: 12, color: C.primary, textTransform: 'capitalize' }}>{d.specialization}</div>
                    <div style={{ fontSize: 11, color: C.muted }}>{d.phone}</div>
                  </div>
                </div>
                <span style={{ fontSize: 11, background: '#dcfce7', color: C.success, padding: '3px 10px', borderRadius: 20, fontWeight: 700 }}>✓ Approved</span>
              </Card>
            ))}
            {approvedDoctors.length === 0 && <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 40, color: C.muted }}>No approved doctors yet</div>}
          </div>
        </div>
      )}

      {tab === 'appointments' && (
        <div>
          {appts.map(a => <AppointmentCard key={a.id} appt={a} role="admin" onStatusChange={handleStatusChange} />)}
          {appts.length === 0 && !loading && <Card style={{ textAlign: 'center', padding: 40 }}><div style={{ color: C.muted }}>No appointments yet</div></Card>}
        </div>
      )}
    </div>
  );
}

// ─── MAIN DASHBOARD ───────────────────────────────────────────────────────────
function Dashboard() {
  const { user, logout } = useAuth();
  const role = user?.role;
  const isApproved = user?.is_approved !== false;

  if (role === 'doctor' && !isApproved) return <PendingApproval user={user} logout={logout} />;

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: "'Segoe UI', sans-serif" }}>
      <nav style={{ background: '#fff', borderBottom: `1px solid ${C.border}`, position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 16px', height: 56, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 20 }}>🏥</span>
          <span style={{ fontWeight: 800, fontSize: 16, color: C.dark }}>MedBook</span>
          <span style={{ fontSize: 10, background: `${C.primary}18`, color: C.primary, padding: '2px 8px', borderRadius: 20, fontWeight: 700, border: `1px solid ${C.primary}33` }}>
            {role === 'admin' ? '🔑 Admin' : role === 'doctor' ? '👨‍⚕️ Doctor' : '🙋 Patient'}
          </span>
          <div style={{ flex: 1 }} />
          <span style={{ fontSize: 12, color: C.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 100 }}>👋 {user?.first_name || user?.username}</span>
          <button onClick={logout} style={{ background: 'none', border: `1.5px solid ${C.border}`, color: C.muted, padding: '5px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' }}>Sign Out</button>
        </div>
      </nav>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '20px 16px' }}>
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 800, color: C.dark }}>
            {role === 'doctor' ? `Welcome, Dr. ${user?.first_name || user?.username}` : role === 'admin' ? 'System Overview' : `Hello, ${user?.first_name || user?.username} 👋`}
          </h1>
          <p style={{ margin: 0, color: C.muted, fontSize: 13 }}>
            {role === 'doctor' ? 'Manage your patients and appointments' : role === 'admin' ? 'Monitor all activity across MedBook' : 'Your health, your records, your appointments'}
          </p>
        </div>
        {role === 'doctor' && <DoctorDashboard user={user} />}
        {role === 'patient' && <PatientDashboard user={user} />}
        {role === 'admin' && <AdminDashboard />}
      </div>
    </div>
  );
}

function AppInner() {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.bg }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 44, marginBottom: 10 }}>🏥</div>
        <div style={{ color: C.muted, fontSize: 14 }}>Loading MedBook...</div>
      </div>
    </div>
  );
  return user ? <Dashboard /> : <AuthPage />;
}

export default function App() {
  return <AuthProvider><AppInner /></AuthProvider>;
}