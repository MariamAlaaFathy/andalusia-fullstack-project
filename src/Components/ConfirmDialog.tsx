import { useEffect, useId, useRef } from "react";

type ConfirmDialogProps = {
  title: string;
  message: string;
  confirmLabel: string;
  isBusy?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function ConfirmDialog({
  title,
  message,
  confirmLabel,
  isBusy = false,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  const titleId = useId();
  const messageId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const onCancelRef = useRef(onCancel);
  const busyRef = useRef(isBusy);

  useEffect(() => {
    onCancelRef.current = onCancel;
    busyRef.current = isBusy;
  }, [onCancel, isBusy]);

  useEffect(() => {
    const previous = document.activeElement;
    cancelButtonRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !busyRef.current) {
        onCancelRef.current();
        return;
      }

      if (event.key !== "Tab") return;
      const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable?.length) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      if (previous instanceof HTMLElement) previous.focus();
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-[#2b2420]/50 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isBusy) onCancel();
      }}
    >
      <div
        ref={panelRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={messageId}
        tabIndex={-1}
        className="w-full max-w-md rounded-2xl border border-[#dfd2c3] bg-white p-6 outline-none shadow-xl sm:p-8"
      >
        <h2 id={titleId} className="font-serif text-2xl font-bold text-[#2b2420]">
          {title}
        </h2>
        <p id={messageId} className="mt-3 text-sm leading-relaxed text-[#765f52]">
          {message}
        </p>
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button
            ref={cancelButtonRef}
            type="button"
            onClick={onCancel}
            disabled={isBusy}
            className="inline-flex min-h-11 items-center rounded-lg border border-[#d8cabc] bg-white px-5 py-2.5 font-semibold text-[#8f5640] transition hover:bg-[#f7f1e8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a9694f] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isBusy}
            className="inline-flex min-h-11 items-center rounded-lg bg-[#873d2d] px-5 py-2.5 font-semibold text-white transition hover:bg-[#6e3124] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#873d2d] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isBusy ? "Deleting…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
