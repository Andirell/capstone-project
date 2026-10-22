import { Mail, MapPin, Phone } from "lucide-react";
import ContactForm from "@/components/contact-form";
import { CONTACT } from "@/lib/constants";

export const metadata = { title: "Contact us" };

export default function ContactPage() {
  return (
    <div className="container-page grid gap-12 py-14 lg:grid-cols-[1fr_1.3fr] lg:gap-20">
      <div>
        <h1 className="text-5xl">Talk to the JobZ team</h1>
        <p className="mt-4 text-lg text-muted">
          Stuck on an application, need help posting a job, or spotted a listing that looks wrong? Send us a message and
          we&apos;ll reply, usually within one working day.
        </p>

        <div className="mt-10 space-y-6">
          <div className="flex gap-4">
            <Phone className="mt-1 size-5 text-brand-dark" />
            <div>
              <p className="text-sm text-muted">Phone, Monday to Friday, 9am to 5pm</p>
              <a href={CONTACT.phoneLink} className="text-lg font-semibold text-ink">{CONTACT.phone}</a>
            </div>
          </div>
          <div className="flex gap-4">
            <Mail className="mt-1 size-5 text-brand-dark" />
            <div>
              <p className="text-sm text-muted">Email</p>
              <a href={"mailto:" + CONTACT.email} className="text-lg font-semibold text-ink">{CONTACT.email}</a>
            </div>
          </div>
          <div className="flex gap-4">
            <MapPin className="mt-1 size-5 text-brand-dark" />
            <div>
              <p className="text-sm text-muted">Office</p>
              <p className="text-lg">{CONTACT.address}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-line bg-white p-6 sm:p-10">
        <h2 className="text-3xl">Send a message</h2>
        <div className="mt-6">
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
