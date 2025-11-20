import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import bgVinfast from "../../../../assets/contactus/vinfast-1536x909.jpg";

interface FormData {
  name: string;
  email: string;
  phone: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
}

const initialFormData: FormData = {
  name: "",
  email: "",
  phone: "",
  message: "",
};

import type { Variants } from "framer-motion";

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: "easeOut" },
  },
};

const staggerForm: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.09, delayChildren: 0.15 },
  },
};

const ContactUs: React.FC = () => {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setMounted(true), 50);
    return () => window.clearTimeout(t);
  }, []);

  const validate = (data: FormData): FormErrors => {
    const newErrors: FormErrors = {};
    if (!data.name.trim()) newErrors.name = "Name is required";
    if (!data.email.trim()) {
      newErrors.email = "Email is required";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email))
        newErrors.email = "Invalid email format";
    }
    if (!data.phone.trim()) {
      newErrors.phone = "Phone is required";
    } else {
      const phoneDigits = data.phone.replace(/\D/g, "");
      if (phoneDigits.length !== 10)
        newErrors.phone = "Phone must be exactly 10 digits";
    }
    if (!data.message.trim()) newErrors.message = "Message is required";
    return newErrors;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (submitted)
      setErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
    const validation = validate(formData);
    setErrors(validation);
    if (Object.keys(validation).length === 0) {
      console.log("Contact page form submitted", formData);
      alert("Thank you! Your message has been sent.");
      setFormData(initialFormData);
      setSubmitted(false);
    }
  };

  return (
    <div className="relative min-h-screen font-sans overflow-hidden">
      <div
        className="absolute inset-0 bg-no-repeat bg-cover bg-right bg-black h-full"
        style={{
          backgroundImage: `url(${bgVinfast})`,
          backgroundPosition: "right center",
          backgroundAttachment: "fixed",
        }}
      />
      <div
        className={`absolute inset-0 pointer-events-none bg-black transition-opacity duration-[1100ms] ease-out ${
          mounted ? "opacity-0" : "opacity-80"
        }`}
      />

      <motion.section
        className="relative container px-8 pt-30 z-10"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="flex justify-start items-center">
          <motion.div
            variants={fadeInUp}
            className={`max-w-md mx-auto lg:mx-0 bg-white/30 rounded-xl p-5 md:p-6 border border-white/20 backdrop-blur-md shadow-xl shadow-black/20 transform-gpu transition-all duration-700 ease-out select-none ${
              mounted ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-6"
            }`}
          >
            <div className="text-center mb-5">
              <h1 className="text-2xl md:text-3xl font-extrabold text-white">
                Contact Us
              </h1>
              <p className="mt-2 text-sm text-gray-200">
                We would love to hear from you. Please fill out the form below.
              </p>
            </div>

            <motion.form
              onSubmit={handleSubmit}
              noValidate
              variants={staggerForm}
              initial="hidden"
              animate="show"
            >
              <motion.div className="mb-4" variants={fadeInUp}>
                <label
                  htmlFor="name"
                  className="block text-xs font-bold text-gray-200 mb-1.5"
                >
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full rounded-md border px-3 py-1.5 text-sm bg-white/10 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-white focus:shadow-lg transition ${
                    errors.name
                      ? "border-red-500 focus:ring-red-500"
                      : "border-white/40"
                  }`}
                  placeholder="Your full name"
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? "name-error" : undefined}
                />
                {errors.name && (
                  <p id="name-error" className="mt-1 text-xs text-red-600">
                    {errors.name}
                  </p>
                )}
              </motion.div>

              <motion.div className="mb-4" variants={fadeInUp}>
                <label
                  htmlFor="email"
                  className="block text-xs font-bold text-gray-200 mb-1.5"
                >
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full rounded-md border px-3 py-1.5 text-sm bg-white/10 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-white focus:shadow-lg transition ${
                    errors.email
                      ? "border-red-500 focus:ring-red-500"
                      : "border-white/40"
                  }`}
                  placeholder="you@example.com"
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "email-error" : undefined}
                />
                {errors.email && (
                  <p id="email-error" className="mt-1 text-xs text-red-600">
                    {errors.email}
                  </p>
                )}
              </motion.div>

              <motion.div className="mb-4" variants={fadeInUp}>
                <label
                  htmlFor="phone"
                  className="block text-xs font-bold text-gray-200 mb-1.5"
                >
                  Phone <span className="text-red-500">*</span>
                </label>
                <div
                  className={`w-full rounded-md border bg-white/10 focus-within:ring-2 focus-within:ring-white focus-within:shadow-lg transition ${
                    errors.phone
                      ? "border-red-500 focus-within:ring-red-500"
                      : "border-white/40"
                  }`}
                >
                  <div className="flex">
                    <div className="flex items-center px-2 border-r border-white/20">
                      <div className="w-4 h-3 bg-red-600 relative rounded-sm overflow-hidden">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                          <svg
                            width="10"
                            height="10"
                            viewBox="0 0 12 12"
                            className="text-yellow-400"
                          >
                            <polygon
                              points="6,1 7.5,4.5 11,4.5 8.25,7 9.75,10.5 6,8.5 2.25,10.5 3.75,7 1,4.5 4.5,4.5"
                              fill="currentColor"
                            />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-1.5">
                        <svg
                          width="6"
                          height="4"
                          viewBox="0 0 8 5"
                          className="text-white/60"
                        >
                          <polygon points="0,0 8,2.5 0,5" fill="currentColor" />
                        </svg>
                      </div>
                    </div>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      className="flex-1 bg-transparent text-white text-sm placeholder-gray-300 focus:outline-none px-3 py-1.5"
                      placeholder="091 234 56 78"
                      aria-invalid={!!errors.phone}
                      aria-describedby={
                        errors.phone ? "phone-error" : undefined
                      }
                    />
                  </div>
                </div>
                {errors.phone && (
                  <p id="phone-error" className="mt-1 text-xs text-red-600">
                    {errors.phone}
                  </p>
                )}
              </motion.div>

              <motion.div className="mb-5" variants={fadeInUp}>
                <label
                  htmlFor="message"
                  className="block text-xs font-bold text-gray-200 mb-1.5"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  className={`w-full rounded-md border px-3 py-1.5 text-sm bg-white/10 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-white focus:shadow-lg transition resize-y ${
                    errors.message
                      ? "border-red-500 focus:ring-red-500"
                      : "border-white/40"
                  }`}
                  placeholder="How can we help you?"
                  aria-invalid={!!errors.message}
                  aria-describedby={
                    errors.message ? "message-error" : undefined
                  }
                />
                {errors.message && (
                  <p id="message-error" className="mt-1 text-xs text-red-600">
                    {errors.message}
                  </p>
                )}
              </motion.div>

              <motion.div className="flex justify-center" variants={fadeInUp}>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-md border border-black bg-black text-white px-5 py-2 text-sm font-medium shadow-md transform-gpu transition-all duration-300 ease-out hover:scale-105 active:scale-100 hover:bg-white hover:text-black hover:border-white hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white cursor-pointer"
                >
                  Submit
                </button>
              </motion.div>
            </motion.form>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
};

export default ContactUs;
