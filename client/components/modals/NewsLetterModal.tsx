"use client";

import Image from "next/image";
import { FormEvent, useEffect, useState } from "react";
import { useSubmitBusy } from "@platform/react-busy";
import { usePathname } from "next/navigation";
import { useUiElement } from "@/context/Context";
import { useManagedModalPanel } from "@/hooks/useManagedModalPanel";

export default function NewsLetterModal() {
  const pathname = usePathname();

  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { disabled } = useSubmitBusy(isSubmitting);
  const [hasBeenShown, setHasBeenShown] = useState(false);
  const { openBsModal, showToaster } = useUiElement();
  const { close } = useManagedModalPanel("newsletterModal");
  const formspreeEndpoint = process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT ?? "";

  useEffect(() => {
    if (!hasBeenShown) {
      const timer = setTimeout(() => {
        openBsModal("newsletterModal");
        setHasBeenShown(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [pathname, hasBeenShown, openBsModal]);

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
      payload.append("source", "newsletter-modal");

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
      close();
      localStorage.setItem(`newsletter-dismissed`, "true");
    } catch {
      showToaster("Could not subscribe right now. Please try again");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="rbt-default-modal modal fade has-rbt-top-folder-shape"
      id="newsletterModal"
      tabIndex={-1}
      aria-hidden="true"
    >
      <div className="modal-dialog modal-dialog-centered xs-size">
        <div className="modal-content">
          <div className="rbt-folder-shape-right-portion">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={85}
              height={90}
              viewBox="0 0 85 90"
              fill="none"
            >
              <path
                d="M0 0H11.1844C14.5695 0 17.7971 1.42971 20.0716 3.93671L82.1927 72.4059C83.9992 74.397 84.9999 76.9893 84.9999 79.6778C84.9999 85.6547 85.0001 90 85.0001 90H0V0Z"
                fill="white"
              />
            </svg>
          </div>
          <div className="modal-header">
            <button
              type="button"
              className="rbt-round-btn rbt-modal-dis-btn"
              aria-label="Close"
              tabIndex={-1}
              onClick={() => {
                close();
                localStorage.setItem(`newsletter-dismissed`, "true");
              }}
            >
              <i className="fa-solid fa-xmark" />
            </button>
          </div>
          <div className="rbt-top-folder-shape-wrapper">
            <div className="rbt-welcome-banner-area rbt-content-trs-portion">
              <div className="rbt-welcome-banner-content">
                <div className="rbt-welcome-banner-top position-relative overflow-hidden rbt-rounded--12">
                  <Image
                    src="/assets/images/banner-img/welcome-banner-img-01.webp"
                    alt="Ecommerce Banner Image"
                    width={620}
                    height={420}
                    className="w-100 h-auto"
                  />
                </div>
                <div className="rbt-welcome-banner-bottom pt--32">
                  <h2 className="text-center mb--12">Don’t miss out Offers</h2>
                  <p className="text-center b1 mb--32">
                    Be the first one to get the new product at early bird
                    prices.
                  </p>
                  <form
                    aria-busy={isSubmitting}
                    id="rbtSubscribe-form"
                    action="#"
                    className="form-newsletter"
                    onSubmit={handleSubmit}
                  >
                    <div className="rbt-input-field-grp">
                      <input
                        className="rbt-input-field"
                        disabled={disabled}
                        type="email"
                        placeholder="Your Email Address *"
                        name="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      className="rbt-btn d-block w-100 mt--24 mb--16 radius-round-6"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Submitting..." : "Keep me updated"}
                    </button>
                  </form>
                  <div className="text-center">
                    <button
                      className="rbt-btn w-100 text-center rbt-btn-naked radius-round-6 d-block"
                      disabled={isSubmitting}
                      onClick={() => {
                        close();
                        localStorage.setItem(`newsletter-dismissed`, "true");
                      }}
                    >
                      Not interested
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
