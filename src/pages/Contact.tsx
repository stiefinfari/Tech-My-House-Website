import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useSeo } from '../seo/useSeo';
import useReducedMotionPreference from '../hooks/useReducedMotionPreference';
import PillButton from '../components/ui/PillButton';

type TabKey = 'info' | 'booking' | 'demo';
type SubmitState = 'idle' | 'submitting' | 'success' | 'error';

type InfoState = {
  name: string;
  email: string;
  subject: string;
  message: string;
  company: string;
};

type BookingState = {
  name: string;
  email: string;
  agency: string;
  eventDate: string;
  cityVenue: string;
  fee: string;
  message: string;
  company: string;
};

type DemoGenre = 'House' | 'Tech House' | 'Techno' | 'Hard Techno' | 'Other';

type DemoState = {
  artistName: string;
  email: string;
  demoLink: string;
  genre: DemoGenre;
  note: string;
  company: string;
};

function isValidEmail(input: string) {
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(input);
}

function getSubjectPrefix(tab: TabKey) {
  if (tab === 'booking') return '[BOOKING]';
  if (tab === 'demo') return '[DEMO]';
  return '[INFO]';
}

export default function Contact() {
  const shouldReduceMotion = useReducedMotionPreference();
  const [tab, setTab] = useState<TabKey>('info');
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const [info, setInfo] = useState<InfoState>({
    name: '',
    email: '',
    subject: '',
    message: '',
    company: '',
  });

  const [booking, setBooking] = useState<BookingState>({
    name: '',
    email: '',
    agency: '',
    eventDate: '',
    cityVenue: '',
    fee: '',
    message: '',
    company: '',
  });

  const [demo, setDemo] = useState<DemoState>({
    artistName: '',
    email: '',
    demoLink: '',
    genre: 'House',
    note: '',
    company: '',
  });

  useSeo({
    title: 'Contact',
    description: 'Info, booking, and demos. Contact us for collaborations, events, and private demo links.',
    path: '/contact',
  });

  const fieldBase =
    'h-11 w-full rounded-none border border-white/10 bg-black/20 px-3 font-sans text-sm text-white placeholder:text-smoke/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-acid';
  const textareaBase =
    'w-full resize-none rounded-none border border-white/10 bg-black/20 px-3 py-3 font-sans text-sm text-white placeholder:text-smoke/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-acid';
  const labelKicker = 'font-mono text-[10px] uppercase tracking-[0.24em] text-smoke';

  const validation = useMemo(() => {
    setErrorMessage('');
    if (submitState === 'submitting') return { ok: true as const };

    if (tab === 'info') {
      const name = info.name.trim();
      const email = info.email.trim();
      const subject = info.subject.trim();
      const message = info.message.trim();
      if (info.company.trim()) return { ok: false as const, message: 'Spam detected.' };
      if (!name) return { ok: false as const, message: 'Enter your name.' };
      if (name.length > 100) return { ok: false as const, message: 'Name is too long (max 100 characters).' };
      if (!email) return { ok: false as const, message: 'Enter your email.' };
      if (email.length > 100) return { ok: false as const, message: 'Email is too long (max 100 characters).' };
      if (!isValidEmail(email)) return { ok: false as const, message: 'Invalid email address.' };
      if (subject.length > 150) return { ok: false as const, message: 'Subject is too long (max 150 characters).' };
      if (!message) return { ok: false as const, message: 'Enter your message.' };
      if (message.length > 5000) return { ok: false as const, message: 'Message is too long (max 5000 characters).' };
      return { ok: true as const };
    }

    if (tab === 'booking') {
      const name = booking.name.trim();
      const email = booking.email.trim();
      const agency = booking.agency.trim();
      const eventDate = booking.eventDate.trim();
      const cityVenue = booking.cityVenue.trim();
      const fee = booking.fee.trim();
      const message = booking.message.trim();
      if (booking.company.trim()) return { ok: false as const, message: 'Spam detected.' };
      if (!name) return { ok: false as const, message: 'Enter your name.' };
      if (name.length > 100) return { ok: false as const, message: 'Name is too long (max 100 characters).' };
      if (!email) return { ok: false as const, message: 'Enter your email.' };
      if (email.length > 100) return { ok: false as const, message: 'Email is too long (max 100 characters).' };
      if (!isValidEmail(email)) return { ok: false as const, message: 'Invalid email address.' };
      if (agency.length > 120) return { ok: false as const, message: 'Agency is too long (max 120 characters).' };
      if (!eventDate) return { ok: false as const, message: 'Enter the event date.' };
      if (!cityVenue) return { ok: false as const, message: 'Enter city/venue.' };
      if (cityVenue.length > 200) return { ok: false as const, message: 'City/venue is too long (max 200 characters).' };
      if (fee.length > 80) return { ok: false as const, message: 'Fee is too long (max 80 characters).' };
      if (!message) return { ok: false as const, message: 'Enter your message.' };
      if (message.length > 5000) return { ok: false as const, message: 'Message is too long (max 5000 characters).' };
      return { ok: true as const };
    }

    const artistName = demo.artistName.trim();
    const email = demo.email.trim();
    const demoLink = demo.demoLink.trim();
    const note = demo.note.trim();
    if (demo.company.trim()) return { ok: false as const, message: 'Spam detected.' };
    if (!artistName) return { ok: false as const, message: 'Enter the artist name.' };
    if (artistName.length > 120) return { ok: false as const, message: 'Artist name is too long (max 120 characters).' };
    if (!email) return { ok: false as const, message: 'Enter your email.' };
    if (email.length > 100) return { ok: false as const, message: 'Email is too long (max 100 characters).' };
    if (!isValidEmail(email)) return { ok: false as const, message: 'Invalid email address.' };
    if (!demoLink) return { ok: false as const, message: 'Enter the demo link.' };
    if (demoLink.length > 600) return { ok: false as const, message: 'Link is too long (max 600 characters).' };
    if (note.length > 5000) return { ok: false as const, message: 'Notes are too long (max 5000 characters).' };
    return { ok: true as const };
  }, [
    booking.agency,
    booking.cityVenue,
    booking.company,
    booking.email,
    booking.eventDate,
    booking.fee,
    booking.message,
    booking.name,
    demo.artistName,
    demo.company,
    demo.demoLink,
    demo.email,
    demo.note,
    info.company,
    info.email,
    info.message,
    info.name,
    info.subject,
    submitState,
    tab,
  ]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSubmitState('idle');

    if (!validation.ok) {
      setSubmitState('error');
      setErrorMessage(validation.message);
      return;
    }

    setSubmitState('submitting');

    const prefix = getSubjectPrefix(tab);
    const payload =
      tab === 'info'
        ? {
            type: 'info' as const,
            name: info.name.trim(),
            email: info.email.trim(),
            subject: info.subject.trim(),
            message: info.message.trim(),
          }
        : tab === 'booking'
          ? {
              type: 'booking' as const,
              name: booking.name.trim(),
              email: booking.email.trim(),
              agency: booking.agency.trim(),
              eventDate: booking.eventDate.trim(),
              cityVenue: booking.cityVenue.trim(),
              fee: booking.fee.trim(),
              message: booking.message.trim(),
            }
          : {
              type: 'demo' as const,
              name: demo.artistName.trim(),
              email: demo.email.trim(),
              demoLink: demo.demoLink.trim(),
              genre: demo.genre,
              note: demo.note.trim(),
              message: demo.note.trim(),
            };

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        if (res.status === 404 && (location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
          const subjectFromForm =
            tab === 'info' ? info.subject.trim() : tab === 'booking' ? `DJ booking / live set` : 'Demo submission';
          const subject = `${prefix} ${subjectFromForm || 'Contact from Tech My House website'}`.trim();

          const body =
            tab === 'info'
              ? `Name: ${info.name.trim()}\nEmail: ${info.email.trim()}\nSubject: ${info.subject.trim()}\n\n${info.message.trim()}`
              : tab === 'booking'
                ? `Name: ${booking.name.trim()}\nEmail/Agency: ${booking.email.trim()}${booking.agency.trim() ? ` (${booking.agency.trim()})` : ''}\nEvent date: ${booking.eventDate.trim()}\nCity/Venue: ${booking.cityVenue.trim()}\nProposed fee: ${booking.fee.trim()}\n\n${booking.message.trim()}`
                : `Artist: ${demo.artistName.trim()}\nEmail: ${demo.email.trim()}\nDemo link: ${demo.demoLink.trim()}\nGenre: ${demo.genre}\n\n${demo.note.trim()}`;

          window.location.href = `mailto:info@techmyhouse.it?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
          setSubmitState('success');
          return;
        }
        const data = (await res.json().catch(() => null)) as { message?: string } | null;
        throw new Error(data?.message || 'Error while sending. Please try again.');
      }

      setSubmitState('success');
      if (tab === 'info') setInfo({ name: '', email: '', subject: '', message: '', company: '' });
      if (tab === 'booking') {
        setBooking({
          name: '',
          email: '',
          agency: '',
          eventDate: '',
          cityVenue: '',
          fee: '',
          message: '',
          company: '',
        });
      }
      if (tab === 'demo') setDemo({ artistName: '', email: '', demoLink: '', genre: 'House', note: '', company: '' });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error while sending. Please try again.';
      setSubmitState('error');
      setErrorMessage(message);
    }
  };

  const tabButtonBase =
    'rounded-full border border-acid/40 px-5 py-2 font-display text-[11px] uppercase tracking-[0.18em] transition-colors outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-acid';

  return (
    <div className="container-shell pb-20 pt-28 sm:pt-32">
      <div className="max-w-5xl">
        <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-acid">GET IN TOUCH</div>
        <h1 className="mt-4 font-display font-extrabold uppercase leading-[0.92] tracking-[-0.07em] text-white text-[clamp(2.5rem,7vw,5rem)]">
          LET&apos;S TALK
        </h1>
        <div className="accent-script mt-3 -rotate-[1.5deg] text-[clamp(1.8rem,4vw,3rem)] text-white">
          tell us everything
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <button
            type="button"
            className={tab === 'info' ? `${tabButtonBase} bg-acid text-ink` : `${tabButtonBase} text-white/80 hover:bg-white/5`}
            onClick={() => {
              setSubmitState('idle');
              setTab('info');
            }}
          >
            INFO
          </button>
          <button
            type="button"
            className={
              tab === 'booking' ? `${tabButtonBase} bg-acid text-ink` : `${tabButtonBase} text-white/80 hover:bg-white/5`
            }
            onClick={() => {
              setSubmitState('idle');
              setTab('booking');
            }}
          >
            BOOKING
          </button>
          <button
            type="button"
            className={tab === 'demo' ? `${tabButtonBase} bg-acid text-ink` : `${tabButtonBase} text-white/80 hover:bg-white/5`}
            onClick={() => {
              setSubmitState('idle');
              setTab('demo');
            }}
          >
            DEMO
          </button>
        </div>

        <div className="mt-5 font-mono text-[11px] uppercase tracking-[0.24em] text-smoke">
          {tab === 'info'
            ? 'For general info, collaborations, and press'
            : tab === 'booking'
              ? 'For DJ booking and live sets. Include date, location, and event context'
              : 'No attachments. Private links only (SoundCloud private / Drive / Dropbox / WeTransfer)'}
        </div>
      </div>

      <div className="mt-10 max-w-5xl border border-white/10 bg-ink/70 p-6 sm:p-8">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={tab}
            initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -8 }}
            transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.28, ease: 'easeOut' }}
          >
            <form onSubmit={onSubmit} className="grid gap-3" aria-label="Contact Tech My House">
              <div className="sr-only" aria-hidden="true">
                <label htmlFor={`${tab}-company`}>Company</label>
                <input
                  id={`${tab}-company`}
                  name="company"
                  value={tab === 'info' ? info.company : tab === 'booking' ? booking.company : demo.company}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (tab === 'info') setInfo((prev) => ({ ...prev, company: value }));
                    if (tab === 'booking') setBooking((prev) => ({ ...prev, company: value }));
                    if (tab === 'demo') setDemo((prev) => ({ ...prev, company: value }));
                  }}
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              {tab === 'info' ? (
                <>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="grid gap-2">
                      <span className={labelKicker}>Name</span>
                      <input
                        name="name"
                        value={info.name}
                        onChange={(e) => setInfo((prev) => ({ ...prev, name: e.target.value }))}
                        required
                        className={fieldBase}
                        placeholder="Your name"
                      />
                    </label>
                    <label className="grid gap-2">
                      <span className={labelKicker}>Email</span>
                      <input
                        name="email"
                        type="email"
                        value={info.email}
                        onChange={(e) => setInfo((prev) => ({ ...prev, email: e.target.value }))}
                        required
                        className={fieldBase}
                        placeholder="you@email.com"
                        autoComplete="email"
                      />
                    </label>
                  </div>

                  <label className="grid gap-2">
                    <span className={labelKicker}>Subject (optional)</span>
                    <input
                      name="subject"
                      value={info.subject}
                      onChange={(e) => setInfo((prev) => ({ ...prev, subject: e.target.value }))}
                      className={fieldBase}
                      placeholder="Booking / Radio / Records / Collaborations"
                    />
                  </label>

                  <label className="grid gap-2">
                    <span className={labelKicker}>Message</span>
                    <textarea
                      name="message"
                      value={info.message}
                      onChange={(e) => setInfo((prev) => ({ ...prev, message: e.target.value }))}
                      required
                      rows={5}
                      className={textareaBase}
                      placeholder="Write here..."
                    />
                  </label>
                </>
              ) : tab === 'booking' ? (
                <>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="grid gap-2">
                      <span className={labelKicker}>Name</span>
                      <input
                        name="name"
                        value={booking.name}
                        onChange={(e) => setBooking((prev) => ({ ...prev, name: e.target.value }))}
                        required
                        className={fieldBase}
                        placeholder="Your name"
                      />
                    </label>
                    <label className="grid gap-2">
                      <span className={labelKicker}>Email / Agency</span>
                      <input
                        name="email"
                        type="email"
                        value={booking.email}
                        onChange={(e) => setBooking((prev) => ({ ...prev, email: e.target.value }))}
                        required
                        className={fieldBase}
                        placeholder="booking@agency.com"
                        autoComplete="email"
                      />
                    </label>
                  </div>

                  <label className="grid gap-2">
                    <span className={labelKicker}>Agency (optional)</span>
                    <input
                      name="agency"
                      value={booking.agency}
                      onChange={(e) => setBooking((prev) => ({ ...prev, agency: e.target.value }))}
                      className={fieldBase}
                      placeholder="Agency / promoter name"
                    />
                  </label>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="grid gap-2">
                      <span className={labelKicker}>Event date</span>
                      <input
                        name="eventDate"
                        type="date"
                        value={booking.eventDate}
                        onChange={(e) => setBooking((prev) => ({ ...prev, eventDate: e.target.value }))}
                        required
                        className={fieldBase}
                      />
                    </label>
                    <label className="grid gap-2">
                      <span className={labelKicker}>Proposed fee (optional)</span>
                      <input
                        name="fee"
                        value={booking.fee}
                        onChange={(e) => setBooking((prev) => ({ ...prev, fee: e.target.value }))}
                        className={fieldBase}
                      placeholder="€ / terms"
                      />
                    </label>
                  </div>

                  <label className="grid gap-2">
                    <span className={labelKicker}>City / Venue</span>
                    <input
                      name="cityVenue"
                      value={booking.cityVenue}
                      onChange={(e) => setBooking((prev) => ({ ...prev, cityVenue: e.target.value }))}
                      required
                      className={fieldBase}
                      placeholder="City, club, event"
                    />
                  </label>

                  <label className="grid gap-2">
                    <span className={labelKicker}>Message</span>
                    <textarea
                      name="message"
                      value={booking.message}
                      onChange={(e) => setBooking((prev) => ({ ...prev, message: e.target.value }))}
                      required
                      rows={5}
                      className={textareaBase}
                      placeholder="Context, schedule, line-up, technical needs..."
                    />
                  </label>
                </>
              ) : (
                <>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="grid gap-2">
                      <span className={labelKicker}>Artist name</span>
                      <input
                        name="artistName"
                        value={demo.artistName}
                        onChange={(e) => setDemo((prev) => ({ ...prev, artistName: e.target.value }))}
                        required
                        className={fieldBase}
                        placeholder="Project / artist name"
                      />
                    </label>
                    <label className="grid gap-2">
                      <span className={labelKicker}>Email</span>
                      <input
                        name="email"
                        type="email"
                        value={demo.email}
                        onChange={(e) => setDemo((prev) => ({ ...prev, email: e.target.value }))}
                        required
                        className={fieldBase}
                        placeholder="you@email.com"
                        autoComplete="email"
                      />
                    </label>
                  </div>

                  <label className="grid gap-2">
                    <span className={labelKicker}>Link demo</span>
                    <input
                      name="demoLink"
                      value={demo.demoLink}
                      onChange={(e) => setDemo((prev) => ({ ...prev, demoLink: e.target.value }))}
                      required
                      className={fieldBase}
                      placeholder="https://soundcloud.com/... private link, Google Drive, Dropbox, WeTransfer..."
                      inputMode="url"
                    />
                    <div className="accent-script -rotate-[1deg] text-acid text-lg">doesn&apos;t matter where you upload — we listen everywhere</div>
                    <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-smoke">
                      No attachments. Private links only (SoundCloud private / Drive / Dropbox / WeTransfer)
                    </div>
                  </label>

                  <label className="grid gap-2">
                    <span className={labelKicker}>Genre</span>
                    <select
                      name="genre"
                      value={demo.genre}
                      onChange={(e) => setDemo((prev) => ({ ...prev, genre: e.target.value as DemoGenre }))}
                      className={fieldBase}
                    >
                      <option value="House">House</option>
                      <option value="Tech House">Tech House</option>
                      <option value="Techno">Techno</option>
                      <option value="Hard Techno">Hard Techno</option>
                      <option value="Other">Other</option>
                    </select>
                  </label>

                  <label className="grid gap-2">
                    <span className={labelKicker}>Notes (optional)</span>
                    <textarea
                      name="note"
                      value={demo.note}
                      onChange={(e) => setDemo((prev) => ({ ...prev, note: e.target.value }))}
                      rows={5}
                      className={textareaBase}
                      placeholder="A couple of lines about you, releases, goals..."
                    />
                  </label>
                </>
              )}

              {submitState === 'success' ? (
                <div className="pt-1 font-display text-[11px] uppercase tracking-[0.18em] text-acid">
                  Message sent — we will reply soon
                </div>
              ) : submitState === 'error' ? (
                <div className="pt-1 font-display text-[11px] uppercase tracking-[0.18em] text-white/80">{errorMessage}</div>
              ) : null}

              <div className="pt-2 flex items-center gap-3">
                <PillButton type="submit" variant="primary" className="h-11 px-6 py-0" ariaLabel="Send message">
                  {submitState === 'submitting' ? 'SENDING...' : 'SEND'}
                </PillButton>
                <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-smoke">
                  or write to{' '}
                  <a
                    href="mailto:info@techmyhouse.it"
                    className="text-white/85 transition-colors hover:text-acid focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-acid"
                  >
                    info@techmyhouse.it
                  </a>
                </div>
              </div>
            </form>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
