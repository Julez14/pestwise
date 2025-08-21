import { createAdminClient } from "@/lib/user-management";
import PrintButton from "@/components/print-button";

export default async function SharedReportPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const admin = createAdminClient();
  const { token } = await params;

  // Validate token
  const { data: tokenRow, error: tokenError } = await admin
    .from("report_share_tokens")
    .select("report_id, expires_at, revoked")
    .eq("token", token)
    .single();

  if (tokenError || !tokenRow || tokenRow.revoked) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-xl font-semibold">Invalid or revoked link</h1>
      </div>
    );
  }

  if (tokenRow.expires_at && new Date(tokenRow.expires_at) < new Date()) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-xl font-semibold">This link has expired</h1>
      </div>
    );
  }

  // Fetch report details from view and related assets
  const { data: report, error: reportError } = await admin
    .from("report_details")
    .select("*, author_id")
    .eq("id", tokenRow.report_id)
    .single();

  if (reportError || !report) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-xl font-semibold">Report not found</h1>
      </div>
    );
  }

  const { data: settings } = await admin
    .from("company_settings")
    .select("logo_url")
    .limit(1)
    .maybeSingle();

  // Fetch report row to read time/signature fields
  const { data: reportRow } = await admin
    .from("reports")
    .select(
      "time_in, time_out, technician_signature_url, customer_signature_url, customer_name"
    )
    .eq("id", tokenRow.report_id)
    .single();

  // Fetch technician license number
  const { data: authorProfile } = await admin
    .from("profiles")
    .select("license_number")
    .eq("id", report.author_id)
    .single();

  const formatDateTime = (value?: string | null) =>
    value ? new Date(value).toLocaleString() : "-";

  return (
    <div className="max-w-3xl mx-auto p-6 print:p-0">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Service Report</h1>
          <p className="text-gray-600 text-sm">
            {report.location_name}
            {report.unit ? `, ${report.unit}` : ""}
          </p>
        </div>
        {settings?.logo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={settings.logo_url}
            alt="Company Logo"
            className="h-12 w-auto"
          />
        ) : null}
      </div>

      <div className="space-y-4">
        <div className="border rounded-lg p-4">
          <h2 className="font-semibold mb-2">Report Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-500">Title:</span> {report.title}
            </div>
            <div>
              <span className="text-gray-500">Technician:</span>{" "}
              {report.author_name}
            </div>
            <div>
              <span className="text-gray-500">License:</span>{" "}
              {authorProfile?.license_number || "-"}
            </div>
            <div>
              <span className="text-gray-500">Status:</span> {report.status}
            </div>
            <div>
              <span className="text-gray-500">Updated:</span>{" "}
              {new Date(report.updated_at).toLocaleString()}
            </div>
            <div>
              <span className="text-gray-500">Time In:</span>{" "}
              {formatDateTime(reportRow?.time_in)}
            </div>
            <div>
              <span className="text-gray-500">Time Out:</span>{" "}
              {formatDateTime(reportRow?.time_out)}
            </div>
          </div>
          {report.description ? (
            <p className="text-sm text-gray-700 mt-3">{report.description}</p>
          ) : null}
          {report.comments ? (
            <p className="text-sm text-gray-700 mt-2">{report.comments}</p>
          ) : null}
        </div>

        <div className="border rounded-lg p-4">
          <h2 className="font-semibold mb-3">Signatures</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-2">Technician</p>
              {reportRow?.technician_signature_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={reportRow.technician_signature_url}
                  alt="Technician signature"
                  className="h-20 w-auto border"
                />
              ) : (
                <p className="text-xs text-gray-500">Not signed</p>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">
                Customer{" "}
                {reportRow?.customer_name ? `- ${reportRow.customer_name}` : ""}
              </p>
              {reportRow?.customer_signature_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={reportRow.customer_signature_url}
                  alt="Customer signature"
                  className="h-20 w-auto border"
                />
              ) : (
                <p className="text-xs text-gray-500">Not signed</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 print:hidden">
          <PrintButton className="px-4 py-2 border rounded-md text-sm hover:bg-gray-50" />
        </div>
      </div>

      <style>{`
        @media print {
          @page { margin: 12mm; }
          body { background: white !important; }
        }
      `}</style>
    </div>
  );
}
