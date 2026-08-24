import { useEffect, useMemo, useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import AdminLayout from "../../components/admin/AdminLayout";
import { getSettings, saveSettings } from "../../lib/api";
import type { StudioSettings } from "../../types/admin";

const EXPIRY_PRESETS = [7, 14, 30, 60, 90];

function SectionIcon({
  type,
}: {
  type: "business" | "link" | "message" | "whatsapp";
}) {
  const icons = {
    business: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-5 w-5"
      >
        <path d="M3 21h18" />
        <path d="M5 21V7l7-4 7 4v14" />
        <path d="M9 21v-5h6v5" />
        <path d="M9 9h.01M15 9h.01M9 12h.01M15 12h.01" />
      </svg>
    ),
    link: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-5 w-5"
      >
        <path d="M10 13a5 5 0 0 0 7.07.07l2-2a5 5 0 0 0-7.07-7.07l-1.15 1.15" />
        <path d="M14 11a5 5 0 0 0-7.07-.07l-2 2A5 5 0 0 0 7 20l1.15-1.15" />
      </svg>
    ),
    message: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-5 w-5"
      >
        <path d="M21 11.5a8.38 8.38 0 0 1-9 8.5 9.9 9.9 0 0 1-4-.8L3 21l1.8-4.2A8.2 8.2 0 0 1 3 11.5 8.5 8.5 0 0 1 12 3a8.5 8.5 0 0 1 9 8.5Z" />
      </svg>
    ),
    whatsapp: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-5 w-5"
      >
        <path d="M20 11.5a8.3 8.3 0 0 1-12.3 7.2L4 20l1.3-3.5A8.3 8.3 0 1 1 20 11.5Z" />
        <path d="M8.5 8.5c.2-.4.4-.5.8-.5h.5c.2 0 .4.1.5.4l.7 1.7c.1.2.1.4-.1.6l-.6.7c.6 1.1 1.5 2 2.7 2.6l.6-.6c.2-.2.4-.2.7-.1l1.6.7c.3.1.4.3.4.6v.4c0 .4-.1.6-.5.8-.4.2-1 .3-1.5.2-2.1-.4-4.7-2.8-5.7-4.2-.9-1.2-1.5-2.5-1.6-3.5-.1-.5 0-1.1.2-1.5Z" />
      </svg>
    ),
  };

  return icons[type];
}

function SectionHeader({
  icon,
  title,
  description,
}: {
  icon: "business" | "link" | "message" | "whatsapp";
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-4 border-b border-black/5 pb-5">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brown-dark text-gold shadow-sm">
        <SectionIcon type={icon} />
      </div>

      <div>
        <h2 className="text-base font-bold text-brown-dark">{title}</h2>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-muted">
          {description}
        </p>
      </div>
    </div>
  );
}

function FieldLabel({
  title,
  description,
  required = false,
}: {
  title: string;
  description?: string;
  required?: boolean;
}) {
  return (
    <div className="mb-2">
      <label className="text-sm font-semibold text-brown-dark">
        {title}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      {description && (
        <p className="mt-1 text-xs leading-5 text-muted">{description}</p>
      )}
    </div>
  );
}

export default function AdminSettings() {
  const [settings, setSettings] = useState<StudioSettings | null>(null);
  const [initialSettings, setInitialSettings] =
    useState<StudioSettings | null>(null);

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadSettings = async () => {
      try {
        const data = await getSettings();

        if (!mounted) return;

        setSettings(data);
        setInitialSettings(data);
      } catch (error) {
        console.error("Failed to load settings:", error);
        toast.error("Unable to load settings.");
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadSettings();

    return () => {
      mounted = false;
    };
  }, []);

  const hasChanges = useMemo(() => {
    if (!settings || !initialSettings) return false;

    return JSON.stringify(settings) !== JSON.stringify(initialSettings);
  }, [settings, initialSettings]);

  const updateSetting = <K extends keyof StudioSettings>(
    key: K,
    value: StudioSettings[K]
  ) => {
    setSettings((current) => {
      if (!current) return current;

      return {
        ...current,
        [key]: value,
      };
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!settings) return;

    if (!settings.businessName.trim()) {
      toast.error("Please enter your business name.");
      return;
    }

    if (!settings.whatsappNumber.trim()) {
      toast.error("Please enter a WhatsApp number.");
      return;
    }

    if (
      !settings.defaultExpiryDays ||
      settings.defaultExpiryDays < 1 ||
      settings.defaultExpiryDays > 3650
    ) {
      toast.error("Private link expiry must be between 1 and 3650 days.");
      return;
    }

    setSaving(true);

    try {
      await saveSettings(settings);

      setInitialSettings(settings);

      toast.success("Settings saved successfully.");
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast.error("Unable to save settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (!initialSettings) return;

    setSettings(initialSettings);
    toast.success("Changes discarded.");
  };

  if (loading || !settings) {
    return (
      <AdminLayout title="Settings">
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-brown-dark/20 border-t-brown-dark" />
            <p className="mt-4 text-sm text-muted">Loading settings...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const selectedPreset = EXPIRY_PRESETS.includes(
    settings.defaultExpiryDays
  )
    ? settings.defaultExpiryDays
    : "custom";

  return (
    <AdminLayout title="Settings">
      <div className="mx-auto w-full max-w-5xl pb-28">
        {/* Page Intro */}
        <div className="mb-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-gold">
                Administration
              </p>

              <h1 className="text-2xl font-bold tracking-tight text-brown-dark md:text-3xl">
                Settings
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
                Manage your business information, private project links and
                customer communication preferences from one place.
              </p>
            </div>

            {hasChanges && (
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-4 py-2 text-xs font-semibold text-brown-dark">
                <span className="h-2 w-2 rounded-full bg-gold" />
                Unsaved changes
              </div>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Business & Branding */}
          <section className="card-premium overflow-hidden p-6 md:p-7">
            <SectionHeader
              icon="business"
              title="Business & Branding"
              description="Set the business information that will be used throughout your Prime Attaire platform."
            />

            <div className="mt-7 grid gap-6 md:grid-cols-2">
              <div>
                <FieldLabel
                  title="Business Name"
                  description="This name can appear on customer-facing pages and messages."
                  required
                />

                <input
                  value={settings.businessName}
                  onChange={(e) =>
                    updateSetting("businessName", e.target.value)
                  }
                  className="input-lux"
                  placeholder="Prime Attaire"
                />
              </div>

              <div>
                <FieldLabel
                  title="Logo URL"
                  description="Add the URL of your business logo. A preview will appear below."
                />

                <input
                  value={settings.logoUrl}
                  onChange={(e) => updateSetting("logoUrl", e.target.value)}
                  className="input-lux"
                  placeholder="https://example.com/logo.png"
                />

                {settings.logoUrl.trim() && (
                  <div className="mt-4 flex items-center gap-4 rounded-2xl border border-black/5 bg-[#faf8f5] p-4">
                    <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl border border-black/5 bg-white">
                      <img
                        src={settings.logoUrl}
                        alt={`${settings.businessName || "Business"} logo`}
                        className="max-h-full max-w-full object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-brown-dark">
                        Logo Preview
                      </p>
                      <p className="mt-1 text-xs text-muted">
                        This is how your logo is currently being loaded.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Private Links */}
          <section className="card-premium overflow-hidden p-6 md:p-7">
            <SectionHeader
              icon="link"
              title="Private Link Settings"
              description="Control how long customer-specific private design links remain accessible."
            />

            <div className="mt-7">
              <FieldLabel
                title="Default Private Link Expiry"
                description="When you create a new private project link, this value will be used automatically."
                required
              />

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                {EXPIRY_PRESETS.map((days) => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => updateSetting("defaultExpiryDays", days)}
                    className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition-all ${
                      selectedPreset === days
                        ? "border-gold bg-gold/10 text-brown-dark shadow-sm"
                        : "border-black/10 bg-white text-muted hover:border-gold/60 hover:text-brown-dark"
                    }`}
                  >
                    {days} days
                  </button>
                ))}
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
                <div>
                  <FieldLabel
                    title="Custom Expiry"
                    description="Use a custom duration if the preset options do not fit your workflow."
                  />

                  <div className="relative">
                    <input
                      type="number"
                      min={1}
                      max={3650}
                      value={settings.defaultExpiryDays}
                      onChange={(e) =>
                        updateSetting(
                          "defaultExpiryDays",
                          Number(e.target.value)
                        )
                      }
                      className="input-lux pr-20"
                    />

                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted">
                      DAYS
                    </span>
                  </div>
                </div>

                <div className="rounded-2xl border border-gold/20 bg-gold/5 px-5 py-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                    Current default
                  </p>

                  <p className="mt-1 text-lg font-bold text-brown-dark">
                    {settings.defaultExpiryDays} days
                  </p>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-black/5 bg-[#faf8f5] p-4">
                <div className="flex gap-3">
                  <div className="mt-0.5 text-gold">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      className="h-5 w-5"
                    >
                      <circle cx="12" cy="12" r="9" />
                      <path d="M12 8v4l2.5 1.5" />
                    </svg>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-brown-dark">
                      How this works
                    </p>

                    <p className="mt-1 text-xs leading-5 text-muted">
                      If you create a private customer project today and the
                      expiry is set to {settings.defaultExpiryDays} days, the
                      generated link will remain available for that duration.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Customer Communication */}
          <section className="card-premium overflow-hidden p-6 md:p-7">
            <SectionHeader
              icon="message"
              title="Customer Communication"
              description="Create a reusable message that can be sent when a customer's private design project is ready."
            />

            <div className="mt-7">
              <FieldLabel
                title="Default Customer Message"
                description="This message can be used as the default content when sharing a private project with a customer."
                required
              />

              <textarea
                value={settings.defaultCustomerMessage}
                onChange={(e) =>
                  updateSetting("defaultCustomerMessage", e.target.value)
                }
                rows={6}
                className="input-lux resize-none leading-6"
                placeholder="Hello! Your private design project is ready..."
              />

              <div className="mt-4 rounded-2xl border border-black/5 bg-[#faf8f5] p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                  Message preview
                </p>

                <div className="mt-3 rounded-xl bg-white p-4 text-sm leading-6 text-brown-dark shadow-sm">
                  {settings.defaultCustomerMessage ||
                    "Your customer message preview will appear here."}
                </div>
              </div>
            </div>
          </section>

          {/* WhatsApp */}
          <section className="card-premium overflow-hidden p-6 md:p-7">
            <SectionHeader
              icon="whatsapp"
              title="WhatsApp"
              description="Configure the WhatsApp number that customers can use to contact your business."
            />

            <div className="mt-7 grid gap-6 md:grid-cols-2">
              <div>
                <FieldLabel
                  title="WhatsApp Number"
                  description="Use the number that should receive customer enquiries and project-related messages."
                  required
                />

                <input
                  value={settings.whatsappNumber}
                  onChange={(e) =>
                    updateSetting("whatsappNumber", e.target.value)
                  }
                  className="input-lux"
                  placeholder="9999999999"
                  inputMode="numeric"
                />

                <p className="mt-2 text-xs text-muted">
                  Example: +91 9962605619
                </p>
              </div>

              <div className="rounded-2xl border border-black/5 bg-[#faf8f5] p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brown-dark text-gold">
                    <SectionIcon type="whatsapp" />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-brown-dark">
                      Customer contact
                    </p>

                    <p className="mt-1 text-xs leading-5 text-muted">
                      This number can be used by customer-facing WhatsApp
                      actions across the platform.
                    </p>

                    <p className="mt-3 text-sm font-bold text-brown-dark">
                      {settings.whatsappNumber || "No number configured"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Bottom Information */}
          <div className="rounded-2xl border border-black/5 bg-[#faf8f5] px-5 py-4">
            <div className="flex items-start gap-3">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="mt-0.5 h-5 w-5 shrink-0 text-gold"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M12 10v6" />
                <path d="M12 7h.01" />
              </svg>

              <div>
                <p className="text-sm font-semibold text-brown-dark">
                  Settings apply across the platform
                </p>

                <p className="mt-1 text-xs leading-5 text-muted">
                  Changes made here may affect private links, customer
                  messages, business branding and WhatsApp actions throughout
                  the admin and customer experience.
                </p>
              </div>
            </div>
          </div>

          {/* Desktop / Mobile Save Bar */}
          <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-black/10 bg-white/95 px-4 py-4 shadow-[0_-8px_30px_rgba(0,0,0,0.06)] backdrop-blur-md md:left-[275px]">
            <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
              <div className="hidden sm:block">
                {hasChanges ? (
                  <>
                    <p className="text-sm font-semibold text-brown-dark">
                      You have unsaved changes
                    </p>
                    <p className="mt-0.5 text-xs text-muted">
                      Save your changes before leaving this page.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-semibold text-brown-dark">
                      All settings are saved
                    </p>
                    <p className="mt-0.5 text-xs text-muted">
                      Your configuration is up to date.
                    </p>
                  </>
                )}
              </div>

              <div className="ml-auto flex items-center gap-3">
                {hasChanges && (
                  <button
                    type="button"
                    onClick={handleReset}
                    disabled={saving}
                    className="rounded-full border border-black/10 bg-white px-5 py-2.5 text-sm font-semibold text-brown-dark transition hover:border-brown-dark/30 disabled:opacity-50"
                  >
                    Discard
                  </button>
                )}

                <button
                  type="submit"
                  disabled={saving || !hasChanges}
                  className="inline-flex min-w-[145px] items-center justify-center gap-2 rounded-full bg-brown-dark px-6 py-2.5 text-sm font-semibold text-gold shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-gold/30 border-t-gold" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        className="h-4 w-4"
                      >
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z" />
                        <path d="M17 21v-8H7v8" />
                        <path d="M7 3v5h8" />
                      </svg>
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}