import { AppShell } from "@/components/AppShell";
import { ScanUploader } from "@/components/ScanUploader";

export default function ScanPage() {
  return (
    <AppShell>
      <div className="px-6 md:px-10 py-10 md:py-14">
        <div className="max-w-xl mx-auto text-center mb-10">
          <p className="text-signal text-sm font-medium mb-2">New scan</p>
          <h1 className="font-display text-3xl mb-2">Scan a product</h1>
          <p className="text-muted text-sm">
            Take a photo or upload an image to begin AI verification.
          </p>
        </div>
        <ScanUploader />
      </div>
    </AppShell>
  );
}
