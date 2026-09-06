"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSubmitBusy } from "@platform/react-busy";
import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  ApiError,
  createOrderFromCart,
  fetchUserAddresses,
} from "@platform/api-client";
import { getPhoneValidationError } from "@platform/shared";
import { useContextElement } from "@/context/Context";
import { validateCartForCheckout } from "@/lib/cart-checkout";
import { getCheckoutPath, getCheckoutThankYouPath } from "@/lib/checkout";
import {
  fetchServerCartDto,
  loadServerCart,
  syncClearServerCart,
} from "@/lib/cart-sync";
import { formatCurrency } from "@/lib/price";
import {
  getStorefrontDefaultPhoneCountry,
  resolveStorefrontPhoneCountry,
} from "@/lib/phone";
import { getStorefrontSiteConfig } from "@/lib/site";
import StorefrontPhoneInput from "@/components/forms/phone-input";
import { useAuthSession } from "@/providers/auth-session-provider";

export default function StorefrontCheckout() {
  const router = useRouter();
  const site = getStorefrontSiteConfig();
  const { user, loading } = useAuthSession();
  const { cartProducts, totalPrice, setCartProducts } = useContextElement();
  const [name, setName] = useState("");
  const [line1, setLine1] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const defaultPhoneCountry = getStorefrontDefaultPhoneCountry();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { disabled } = useSubmitBusy(submitting);
  const [cartReady, setCartReady] = useState(false);
  const orderInFlightRef = useRef(false);

  useEffect(() => {
    if (!user || !site.features.customerAuth) {
      return;
    }

    let cancelled = false;

    void loadServerCart().then((serverCart) => {
      if (!cancelled && serverCart) {
        setCartProducts(serverCart);
      }
      if (!cancelled) {
        setCartReady(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [user, site.features.customerAuth, setCartProducts]);

  useEffect(() => {
    if (!user) return;
    setName((current) => current || user.name);
    setPhone((current) => current || user.phone || "");
  }, [user]);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    async function loadDefaultAddress() {
      try {
        const addresses = await fetchUserAddresses();
        const defaultAddress =
          addresses.find((address) => address.isDefault) ?? addresses[0];
        if (!defaultAddress || cancelled) {
          return;
        }

        setName((current) => current || defaultAddress.name);
        setLine1((current) => current || defaultAddress.line1);
        setCity((current) => current || defaultAddress.city);
        setCountry((current) => current || defaultAddress.country);
        setPhone((current) => current || defaultAddress.phone || "");
      } catch {
        // Checkout still works with manual entry.
      }
    }

    loadDefaultAddress();

    return () => {
      cancelled = true;
    };
  }, [user]);

  if (!site.features.customerAuth) {
    return (
      <p className="mb--0">
        Checkout is not enabled for this site. Use the demo checkout flow
        instead.
      </p>
    );
  }

  if (loading || !cartReady) {
    return <p className="mb--0">Loading…</p>;
  }

  if (!user) {
    return (
      <div>
        <p className="mb--16">Sign in to complete your order.</p>
        <Link className="rbt-btn" href="/signin">
          Sign in
        </Link>
      </div>
    );
  }

  if (cartProducts.length === 0) {
    return (
      <div>
        <p className="mb--16">Your cart is empty.</p>
        <Link className="rbt-btn" href="/shop">
          Browse products
        </Link>
      </div>
    );
  }

  const emailVerificationRequired = !user.emailVerified;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (orderInFlightRef.current) {
      return;
    }

    setError(null);
    setPhoneError(null);

    const nextPhoneError = getPhoneValidationError(phone);
    if (nextPhoneError) {
      setPhoneError(nextPhoneError);
      return;
    }

    orderInFlightRef.current = true;
    setSubmitting(true);

    try {
      const serverCartDto = await fetchServerCartDto();
      if (!serverCartDto) {
        setError("Could not verify your cart. Please try again.");
        return;
      }

      const validation = validateCartForCheckout(cartProducts, serverCartDto);
      if (!validation.ok) {
        if (validation.serverCart) {
          setCartProducts(validation.serverCart);
        }
        setError(validation.message);
        return;
      }

      const order = await createOrderFromCart({
        name,
        line1,
        city,
        country,
        phone: phone || undefined,
      });

      const cleared = await syncClearServerCart();
      setCartProducts(cleared ?? []);

      router.push(getCheckoutThankYouPath(order.id));
      router.refresh();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Could not place your order. Please try again."
      );
    } finally {
      orderInFlightRef.current = false;
      setSubmitting(false);
    }
  }

  return (
    <div className="row row--12 mt_dec--24">
      {emailVerificationRequired ? (
        <div className="col-12 mt--24">
          <div className="rbt-transparent-table-one-wrapper rbt-has-bg-gray p--24">
            <p className="mb--12 b2">
              Verify your email before placing an order. We sent a verification
              link when you signed up.
            </p>
            <Link className="rbt-btn" href="/account-info">
              Verify email in account settings
            </Link>
          </div>
        </div>
      ) : null}
      <div className="col-12 col-lg-7 mt--24">
        <div className="rbt-transparent-table-one-wrapper rbt-has-bg-gray p--24">
          <h5 className="title mb--24">Shipping details</h5>
          <form aria-busy={submitting} onSubmit={handleSubmit}>
            <div className="rbt-input-field-grp">
              <label className="rbt-field-label" htmlFor="checkout_name">
                Full name
              </label>
              <input
                id="checkout_name"
                className="rbt-input-field"
                disabled={disabled}
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </div>
            <div className="rbt-input-field-grp mt--16">
              <label className="rbt-field-label" htmlFor="checkout_line1">
                Address
              </label>
              <input
                id="checkout_line1"
                className="rbt-input-field"
                disabled={disabled}
                value={line1}
                onChange={(event) => setLine1(event.target.value)}
                required
              />
            </div>
            <div className="rbt-input-field-grp mt--16">
              <label className="rbt-field-label" htmlFor="checkout_city">
                City
              </label>
              <input
                id="checkout_city"
                className="rbt-input-field"
                disabled={disabled}
                value={city}
                onChange={(event) => setCity(event.target.value)}
                required
              />
            </div>
            <div className="rbt-input-field-grp mt--16">
              <label className="rbt-field-label" htmlFor="checkout_country">
                Country
              </label>
              <input
                id="checkout_country"
                className="rbt-input-field"
                disabled={disabled}
                value={country}
                onChange={(event) => setCountry(event.target.value)}
                required
              />
            </div>
            <div className="mt--16">
              <StorefrontPhoneInput
                disabled={disabled}
                id="checkout_phone"
                label="Phone"
                value={phone}
                onChange={(nextValue) => {
                  setPhone(nextValue);
                  setPhoneError(getPhoneValidationError(nextValue));
                }}
                defaultCountry={defaultPhoneCountry}
                country={resolveStorefrontPhoneCountry(country)}
                error={phoneError}
                hint="Used by the courier for delivery updates."
              />
            </div>
            {error ? (
              <p className="rbt-text-color-danger mt--12 mb--0 b3">{error}</p>
            ) : null}
            <button
              type="submit"
              className="rbt-btn d-block w-100 mt--24"
              disabled={submitting || emailVerificationRequired}
            >
              {submitting ? "Placing order…" : "Place order"}
            </button>
          </form>
        </div>
      </div>
      <div className="col-12 col-lg-5 mt--24">
        <div className="rbt-transparent-table-one-wrapper rbt-has-bg-gray p--24">
          <h5 className="title mb--24">Order summary</h5>
          <ul className="list-unstyled mb--0">
            {cartProducts.map((item) => (
              <li
                key={`${item.id}-${item.serverCartItemId ?? "local"}`}
                className="d-flex gap-3 mb--16"
              >
                <Image
                  src={item.imgSrc}
                  alt={item.title}
                  width={64}
                  height={64}
                  className="rounded"
                />
                <div>
                  <p className="mb--4 b2 rbt-text-medium">{item.title}</p>
                  <p className="mb--0 b3">
                    {item.quantity} × {formatCurrency(item.price)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
          <hr />
          <p className="mb--0 b2">
            <strong>Total: {formatCurrency(totalPrice)}</strong>
          </p>
          <p className="mt--12 mb--0 b3">
            Payment: cash on delivery (demo).{" "}
            <Link href={getCheckoutPath()}>Refresh</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
