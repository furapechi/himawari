export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs" && process.env.NEXT_PHASE !== "phase-production-build" && process.env.CONTACT_MAIL_ENABLED === "true") {
    const { startContactMailWorker } = await import("./lib/contact-mail-worker");
    startContactMailWorker();
  }
}
