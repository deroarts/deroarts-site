// ContactForm — thin wrapper around RequestForm for the general contact page.
// No projectId means the request is saved as a general inquiry.
import RequestForm from "./RequestForm";

export default function ContactForm() {
  return <RequestForm />;
}
