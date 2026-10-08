import type { ServiceView } from "./RoadmapTimeline";

function Box({ checked }: { checked: boolean }) {
  return (
    <span className="mr-2 inline-flex h-4 w-4 shrink-0 items-center justify-center border border-black align-middle text-[11px] leading-none">
      {checked ? "✓" : ""}
    </span>
  );
}

export default function PrintView({
  service,
  intro,
  done,
  draft,
}: {
  service: ServiceView;
  intro: string;
  done: Record<string, boolean>;
  draft: string;
}) {
  const verifiedLine = service.verifiedAt
    ? ` (যাচাইয়ের তারিখ: ${new Date(service.verifiedAt).toLocaleDateString("bn-BD")})`
    : " (তথ্য এখনো যাচাই করা হয়নি)";
  const stale = service.daysSinceVerified !== null && service.daysSinceVerified > 90;

  return (
    <div className="hidden text-black print:block">
      <p className="text-xs">সরকারি সেবা নেভিগেটর — রোডম্যাপ ও চেকলিস্ট</p>
      <h1 className="mt-1 text-2xl font-bold">{service.title}</h1>

      <div className="mt-3 space-y-1 text-sm">
        <p>
          <b>অফিস:</b> {service.office}
        </p>
        {service.fee && (
          <p>
            <b>ফি:</b> {service.fee}
          </p>
        )}
        {service.time && (
          <p>
            <b>সময়:</b> {service.time}
          </p>
        )}
        <p>
          <b>সূত্র:</b> {service.sourceUrl ?? "—"}
          {verifiedLine}
        </p>
        {(!service.verifiedAt || stale) && (
          <p className="font-semibold">
            সতর্কতা: তথ্যটি পুরোনো বা অযাচাইকৃত হতে পারে, অফিসে যাওয়ার আগে সরকারি সূত্রে মিলিয়ে নিন।
          </p>
        )}
      </div>

      {intro && (
        <div className="mt-4 text-sm">
          <b>সারসংক্ষেপ (AI-এর লেখা):</b> {intro}
        </div>
      )}

      <h2 className="mt-6 text-lg font-semibold">ধাপে ধাপে প্রক্রিয়া</h2>
      <ol className="mt-2">
        {service.steps.map((s, i) => (
          <li key={s.id} className="mb-3 break-inside-avoid text-sm">
            <Box checked={!!done[s.id]} />
            <b>
              {(i + 1).toLocaleString("bn-BD")}। {s.title}
            </b>
            <p className="ml-6">{s.detail}</p>
          </li>
        ))}
      </ol>

      <h2 className="mt-6 text-lg font-semibold">যে কাগজ লাগবে</h2>
      <ul className="mt-2">
        {service.documents.map((d) => (
          <li key={d.id} className="mb-2 break-inside-avoid text-sm">
            <Box checked={!!done[d.id]} />
            {d.name}
            {!d.required && " (ঐচ্ছিক)"}
            {d.note && <p className="ml-6 text-xs">{d.note}</p>}
          </li>
        ))}
      </ul>

      {draft.trim() && (
        <div className="break-before-page">
          <h2 className="text-lg font-semibold">আবেদনপত্রের খসড়া</h2>
          <pre className="mt-3 whitespace-pre-wrap font-[inherit] text-sm leading-relaxed">{draft}</pre>
        </div>
      )}

      <p className="mt-8 border-t border-black pt-2 text-xs">
        এটি একটি শেখার ও পোর্টফোলিও প্রকল্প থেকে তৈরি, কোনো সরকারি নথি নয়। অফিসে যাওয়ার আগে অবশ্যই সরকারি সূত্রে তথ্য মিলিয়ে নিন।
      </p>
    </div>
  );
}