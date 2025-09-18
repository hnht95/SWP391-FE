import React, { useState } from "react";

interface FormData {
  name: string;
  email: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  message?: string;
}

const initialFormData: FormData = {
  name: "",
  email: "",
  message: "",
};

const ContactForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState<boolean>(false);

  const validate = (data: FormData): FormErrors => {
    const newErrors: FormErrors = {};
    if (!data.name.trim()) newErrors.name = "Name is required";
    if (!data.email.trim()) {
      newErrors.email = "Email is required";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) newErrors.email = "Invalid email format";
    }
    if (!data.message.trim()) newErrors.message = "Message is required";
    return newErrors;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (submitted) {
      setErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
    const validation = validate(formData);
    setErrors(validation);
    if (Object.keys(validation).length === 0) {
      // Simulate submit
      console.log("Contact form submitted", formData);
      alert("Thank you! Your message has been sent.");
      setFormData(initialFormData);
      setSubmitted(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
      <h2 className="text-2xl font-semibold text-gray-900 mb-6">Send us a message</h2>
      <form onSubmit={handleSubmit} noValidate>
        <div className="mb-5">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            className={`w-full rounded-lg border px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-800/70 transition ${
              errors.name ? "border-red-500 focus:ring-red-500" : "border-gray-300"
            }`}
            placeholder="Your full name"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "name-error" : undefined}
          />
          {errors.name && (
            <p id="name-error" className="mt-2 text-sm text-red-600">
              {errors.name}
            </p>
          )}
        </div>

        <div className="mb-5">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full rounded-lg border px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-800/70 transition ${
              errors.email ? "border-red-500 focus:ring-red-500" : "border-gray-300"
            }`}
            placeholder="you@example.com"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? "email-error" : undefined}
          />
          {errors.email && (
            <p id="email-error" className="mt-2 text-sm text-red-600">
              {errors.email}
            </p>
          )}
        </div>

        <div className="mb-6">
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
            Message
          </label>
          <textarea
            id="message"
            name="message"
            rows={5}
            value={formData.message}
            onChange={handleChange}
            className={`w-full rounded-lg border px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-800/70 transition resize-y ${
              errors.message ? "border-red-500 focus:ring-red-500" : "border-gray-300"
            }`}
            placeholder="How can we help you?"
            aria-invalid={!!errors.message}
            aria-describedby={errors.message ? "message-error" : undefined}
          />
          {errors.message && (
            <p id="message-error" className="mt-2 text-sm text-red-600">
              {errors.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          className="inline-flex items-center justify-center w-full md:w-auto rounded-lg bg-gray-900 text-white px-6 py-3 font-medium hover:bg-black focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default ContactForm;


