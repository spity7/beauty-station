"use client";

import { FormEvent, useState } from "react";
import { useSubmitBusy } from "@platform/react-busy";
import { useUiElement } from "@/context/uiStore";

interface FooterNewsletterFormProps {
  formClass?: string;
  inputClass?: string;
  btnClass?: string;
  iconClass?: string;
  placeholder?: string;
}

export default function FooterNewsletterForm({
  formClass = "rbt-newsletter-form-one rbt-newsletter-form-one-v1 mt--24",
  inputClass = "",
  btnClass = "rbt-btn rbt-btn-md radius-round-6",
  iconClass = "icon",
  placeholder = "Enter email",
}: FooterNewsletterFormProps) {
  const { showToaster } = useUiElement();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { disabled } = useSubmitBusy(isSubmitting);
  const formspreeEndpoint = process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT ?? "";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      showToaster("Please enter your email address");
      return;
    }

    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail);
    if (!isValidEmail) {
      showToaster("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);

    try {
      if (!formspreeEndpoint) {
        throw new Error("Missing Formspree endpoint");
      }

      const payload = new FormData();
      payload.append("email", trimmedEmail);
      payload.append("source", "newsletter");

      const response = await fetch(formspreeEndpoint, {
        method: "POST",
        body: payload,
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Submission failed");
      }

      setEmail("");
      showToaster("Thanks for subscribing to our newsletter");
    } catch {
      showToaster("Could not subscribe right now. Please try again");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form aria-busy={isSubmitting} className={formClass} onSubmit={handleSubmit}>
      <input
        className={inputClass}
        disabled={disabled}
        name="email"
        type="email"
        placeholder={placeholder}
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />
      <button type="submit" className={btnClass} disabled={isSubmitting}>
        {isSubmitting ? "Subscribing..." : "Subscribe"}
      </button>
      <div className={iconClass}>
        <i className="fa-regular fa-envelope" />
      </div>
    </form>
  );
}
