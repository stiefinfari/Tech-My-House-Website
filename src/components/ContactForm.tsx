import React, { useMemo, useState } from 'react';
import PillButton from './ui/PillButton';

type FormState = {
  name: string;
  email: string;
  subject: string;
  message: string;
  company: string;
};

type SubmitState = 'idle' | 'submitting' | 'success' | 'error';

function isValidEmail(input: string) {
  return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(input);
}

export default function ContactForm() {
  const [state, setState] = useState<FormState>({
    name: '',
    email: '',
    subject: '',
    message: '',
    company: '',
  });
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const validation = useMemo(() => {
    const name = state.name.trim();
    const email = state.email.trim();
    const subject = state.subject.trim();
    const message = state.message.trim();

    if (state.company.trim()) return { ok: false, message: 'Spam detected.' };
    if (!name) return { ok: false, message: 'Enter your name.' };
    if (name.length > 100) return { ok: false, message: 'Name is too long (max 100 characters).' };
    if (!email) return { ok: false, message: 'Enter your email.' };
    if (email.length > 100) return { ok: false, message: 'Email is too long (max 100 characters).' };
    if (!isValidEmail(email)) return { ok: false, message: 'Invalid email address.' };
    if (subject.length > 150) return { ok: false, message: 'Subject is too long (max 150 characters).' };
    if (!message) return { ok: false, message: 'Enter your message.' };
    if (message.length > 5000) return { ok: false, message: 'Message is too long (max 5000 characters).' };
    return { ok: true as const };
  }, [state]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setState((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!validation.ok) {
      setSubmitState('error');
      setErrorMessage(validation.message);
      return;
    }

    setSubmitState('submitting');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: state.name.trim(),
          email: state.email.trim(),
          subject: state.subject.trim(),
          message: state.message.trim(),
        }),
      });

      if (!res.ok) {
        if (res.status === 404 && (location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
          const subject = state.subject.trim() || 'Contact from Tech My House website';
          const body = `Name: ${state.name.trim()}\nEmail: ${state.email.trim()}\n\n${state.message.trim()}`;
          window.location.href = `mailto:info@techmyhouse.it?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
          setSubmitState('success');
          setState({ name: '', email: '', subject: '', message: '', company: '' });
          return;
        }
        const data = (await res.json().catch(() => null)) as { message?: string } | null;
        throw new Error(data?.message || 'Error while sending. Please try again.');
      }

      setSubmitState('success');
      setState({ name: '', email: '', subject: '', message: '', company: '' });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error while sending. Please try again.';
      setSubmitState('error');
      setErrorMessage(message);
    }
  };

  return (
    <form onSubmit={onSubmit} className="mt-7 grid gap-3" aria-label="Contact Tech My House">
      <div className="sr-only" aria-hidden="true">
        <label htmlFor="company">Company</label>
        <input id="company" name="company" value={state.company} onChange={onChange} tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-smoke">Name</span>
          <input
            name="name"
            value={state.name}
            onChange={onChange}
            required
            className="h-11 w-full rounded-none border border-white/10 bg-black/20 px-3 font-sans text-sm text-white placeholder:text-smoke/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-acid"
            placeholder="Your name"
          />
        </label>
        <label className="grid gap-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-smoke">Email</span>
          <input
            name="email"
            type="email"
            value={state.email}
            onChange={onChange}
            required
            className="h-11 w-full rounded-none border border-white/10 bg-black/20 px-3 font-sans text-sm text-white placeholder:text-smoke/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-acid"
            placeholder="you@email.com"
            autoComplete="email"
          />
        </label>
      </div>

      <label className="grid gap-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-smoke">Subject (optional)</span>
        <input
          name="subject"
          value={state.subject}
          onChange={onChange}
          className="h-11 w-full rounded-none border border-white/10 bg-black/20 px-3 font-sans text-sm text-white placeholder:text-smoke/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-acid"
          placeholder="Booking / Radio / Records / Collaborations"
        />
      </label>

      <label className="grid gap-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-smoke">Message</span>
        <textarea
          name="message"
          value={state.message}
          onChange={onChange}
          required
          rows={4}
          className="w-full resize-none rounded-none border border-white/10 bg-black/20 px-3 py-3 font-sans text-sm text-white placeholder:text-smoke/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-acid"
          placeholder="Write here..."
        />
      </label>

      {submitState === 'success' ? (
        <div className="pt-1 font-display text-[11px] uppercase tracking-[0.18em] text-acid">Message sent — we will reply soon</div>
      ) : submitState === 'error' ? (
        <div className="pt-1 font-display text-[11px] uppercase tracking-[0.18em] text-white/80">{errorMessage}</div>
      ) : null}

      <div className="pt-2">
        <PillButton
          type="submit"
          variant="primary"
          className="h-11 px-6 py-0"
          ariaLabel="Send message"
        >
          {submitState === 'submitting' ? 'SENDING...' : 'SEND'}
        </PillButton>
      </div>
    </form>
  );
}
