import { StorageAdapter, LocalStorageAdapter, SupabaseStorageAdapter } from "./storage";
import { MailAdapter, FakeMailAdapter, ResendMailAdapter } from "./mail";

export type { StorageAdapter, MailAdapter };
export type { MailMessage } from "./mail";

// Singletons — created once per process, never per request.
let _storage: StorageAdapter | null = null;
let _mail: MailAdapter | null = null;

export function getStorageAdapter(): StorageAdapter {
  if (!_storage) {
    const mode = process.env.STORAGE_MODE ?? "local";
    switch (mode) {
      case "local":
        _storage = new LocalStorageAdapter();
        break;
      case "supabase":
        _storage = new SupabaseStorageAdapter();
        break;
      default:
        throw new Error(
          `Unknown STORAGE_MODE="${mode}". Supported values: local, supabase`
        );
    }
  }
  return _storage;
}

export function getMailAdapter(): MailAdapter {
  if (!_mail) {
    const mode = process.env.MAIL_MODE ?? "fake";
    switch (mode) {
      case "fake":
        _mail = new FakeMailAdapter();
        break;
      case "resend":
        _mail = new ResendMailAdapter();
        break;
      default:
        throw new Error(
          `Unknown MAIL_MODE="${mode}". Supported values: fake, resend`
        );
    }
  }
  return _mail;
}
