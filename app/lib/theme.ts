export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}


export const theme = {
  page: {
    bg: "bg-slate-50",
    text: "text-slate-800",
    mutedText: "text-slate-600",
  },

  header: {
    bg: "bg-sky-600",
    text: "text-white",
    link: "text-sky-50 hover:text-white",
    linkHoverBg: "hover:bg-sky-500",
    border: "border-sky-700/30",
  },

  card: {
    base: "rounded-2xl border border-slate-200 bg-white shadow-sm",
    padding: "p-5",
    section: "space-y-4",
  },

  no_card: {
    base: "bg-slate-50",
    padding: "p-0",
    section: "space-y-0",
  },

   surface: {
    outer: {
      neutral: "border-zinc-200 bg-zinc-50",
      colored:  "border-sky-700 bg-sky-100",
      lesson:  "border-sky-700 bg-sky-100",
      review:  "border-sky-700 bg-sky-100",
/*      lesson: "border-emerald-700 bg-emerald-50",
      review: "border-amber-700 bg-amber-50", */
    },
    innerCard: "border bg-white shadow-sm",
  },

  badge: {
    neutral: "rounded-full bg-sky-50 px-3 py-1 text-xs text-sky-700",
  },

  input: {
    label: "text-sm font-medium text-slate-700",
    textarea:
      "w-full rounded-xl border border-slate-300 bg-slate-50 p-3 text-sm text-slate-800 " +
      "focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none",
    textareaMono:
      "w-full rounded-xl border border-slate-300 bg-slate-50 p-3 font-mono text-sm text-slate-800 " +
      "focus:border-sky-400 focus:ring-2 focus:ring-sky-100 outline-none",
    helper: "text-xs text-slate-500",
  },

  button: {
    base: "rounded-2xl px-4 py-2 text-sm transition disabled:opacity-50 disabled:cursor-not-allowed",
    primary: "bg-sky-600 text-white hover:bg-sky-700",
    third: "bg-teal-600 text-white hover:bg-teal-700",
    secondary: "border border-slate-300 bg-white text-slate-700 hover:bg-slate-100",
    link: "text-sm text-sky-600 hover:underline disabled:text-slate-300",
  },
} as const;
