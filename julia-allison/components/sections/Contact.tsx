"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1, "Your name is required"),
  email: z.string().email("Please enter a valid email"),
  opportunityType: z.enum(
    ["Speaking Engagement", "Media Interview", "Consulting", "Brand Partnership", "Other"],
    { required_error: "Please select an opportunity type" }
  ),
  message: z.string().min(10, "Please tell Julia a bit more about your inquiry"),
});

type FormData = z.infer<typeof schema>;

const opportunityTypes = [
  "Speaking Engagement",
  "Media Interview",
  "Consulting",
  "Brand Partnership",
  "Other",
] as const;

export function Contact() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setStatus("submitting");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Request failed");
      setStatus("success");
      reset();
    } catch {
      setStatus("error");
    }
  };

  return (
    <section id="book" ref={ref} className="py-24 lg:py-32 bg-gradient-section-rose">
      <div className="max-w-3xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="text-center mb-14"
        >
          <span className="text-xs font-semibold uppercase tracking-widest text-teal block mb-3">
            Work With Julia
          </span>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-ink leading-tight mb-4">
            Let&apos;s <span className="gradient-text">connect</span>
          </h2>
          <p className="text-ink-muted text-base leading-relaxed max-w-lg mx-auto">
            Whether you&apos;re looking for a captivating keynote speaker, a sharp media voice, or a thoughtful consulting partner — Julia would love to hear from you.
          </p>
        </motion.div>

        {/* Form card */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="bg-white rounded-3xl shadow-lg shadow-ink/5 border border-black/5 overflow-hidden"
        >
          {/* Gradient top strip */}
          <div
            className="h-1 w-full"
            style={{
              background: "linear-gradient(90deg, #1FB6BF, #6B8CFF, #C47BF4, #FF7BAC, #FF9F6B)",
            }}
          />

          <div className="p-8 md:p-12">
            {status === "success" ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center py-10"
              >
                <div
                  className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center"
                  style={{
                    background:
                      "linear-gradient(135deg, #1FB6BF22, #C47BF422)",
                  }}
                >
                  <svg
                    className="w-8 h-8"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="url(#checkGrad)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <defs>
                      <linearGradient id="checkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#1FB6BF" />
                        <stop offset="100%" stopColor="#C47BF4" />
                      </linearGradient>
                    </defs>
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h3 className="font-serif text-2xl font-bold text-ink mb-3">
                  Message received!
                </h3>
                <p className="text-ink-muted text-base leading-relaxed">
                  Thank you for reaching out. Julia&apos;s team will be in touch with you shortly.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
                {/* Name + Email row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-2"
                    >
                      Full Name <span className="text-teal">*</span>
                    </label>
                    <input
                      id="name"
                      type="text"
                      autoComplete="name"
                      placeholder="Jane Smith"
                      {...register("name")}
                      className={`w-full px-4 py-3 rounded-xl bg-off-white border text-ink text-sm placeholder:text-ink-light/60 outline-none transition-all duration-200 focus:border-teal focus:ring-2 focus:ring-teal/20 ${
                        errors.name ? "border-red-400" : "border-black/10"
                      }`}
                    />
                    {errors.name && (
                      <p className="text-red-500 text-xs mt-1.5">{errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-2"
                    >
                      Email Address <span className="text-teal">*</span>
                    </label>
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="jane@company.com"
                      {...register("email")}
                      className={`w-full px-4 py-3 rounded-xl bg-off-white border text-ink text-sm placeholder:text-ink-light/60 outline-none transition-all duration-200 focus:border-teal focus:ring-2 focus:ring-teal/20 ${
                        errors.email ? "border-red-400" : "border-black/10"
                      }`}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-xs mt-1.5">{errors.email.message}</p>
                    )}
                  </div>
                </div>

                {/* Opportunity type */}
                <div>
                  <label
                    htmlFor="opportunityType"
                    className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-2"
                  >
                    Opportunity Type <span className="text-teal">*</span>
                  </label>
                  <select
                    id="opportunityType"
                    defaultValue=""
                    {...register("opportunityType")}
                    className={`w-full px-4 py-3 rounded-xl bg-off-white border text-ink text-sm outline-none appearance-none cursor-pointer transition-all duration-200 focus:border-teal focus:ring-2 focus:ring-teal/20 ${
                      errors.opportunityType ? "border-red-400" : "border-black/10"
                    }`}
                  >
                    <option value="" disabled>
                      Select the nature of your inquiry
                    </option>
                    {opportunityTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  {errors.opportunityType && (
                    <p className="text-red-500 text-xs mt-1.5">
                      {errors.opportunityType.message}
                    </p>
                  )}
                </div>

                {/* Message */}
                <div>
                  <label
                    htmlFor="message"
                    className="block text-xs font-semibold uppercase tracking-wider text-ink-muted mb-2"
                  >
                    Tell Julia About Your Inquiry <span className="text-teal">*</span>
                  </label>
                  <textarea
                    id="message"
                    rows={5}
                    placeholder="Share details about the opportunity, timeline, and anything else that would help Julia understand how she can help..."
                    {...register("message")}
                    className={`w-full px-4 py-3 rounded-xl bg-off-white border text-ink text-sm placeholder:text-ink-light/60 outline-none transition-all duration-200 focus:border-teal focus:ring-2 focus:ring-teal/20 resize-none leading-relaxed ${
                      errors.message ? "border-red-400" : "border-black/10"
                    }`}
                  />
                  {errors.message && (
                    <p className="text-red-500 text-xs mt-1.5">{errors.message.message}</p>
                  )}
                </div>

                {/* Submit */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={status === "submitting"}
                    className="relative w-full overflow-hidden px-8 py-4 rounded-xl text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-teal/25 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                  >
                    <span
                      className="absolute inset-0 bg-gradient-brand bg-[length:200%_200%] animate-[gradientShift_6s_ease_infinite]"
                    />
                    <span className="relative">
                      {status === "submitting" ? "Sending…" : "Send Inquiry"}
                    </span>
                  </button>

                  {status === "error" && (
                    <p className="text-red-500 text-sm text-center mt-3">
                      Something went wrong. Please try again or email{" "}
                      <a href="mailto:hello@juliaallison.com" className="underline">
                        hello@juliaallison.com
                      </a>
                    </p>
                  )}
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
