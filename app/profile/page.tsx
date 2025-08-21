"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { supabase } from "@/lib/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import SignatureCanvas from "react-signature-canvas";

import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { AuthGuard } from "@/components/auth/auth-guard";

export default function ProfilePage() {
  const { profile } = useAuth();
  const [licenseNumber, setLicenseNumber] = useState("");
  const [signatureUrl, setSignatureUrl] = useState<string | null>(null);
  const sigRef = useRef<SignatureCanvas | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setLicenseNumber(((profile as any).license_number as string) || "");
    setSignatureUrl(((profile as any).signature_url as string) || null);
  }, [profile]);

  const save = async () => {
    if (!profile) return;
    try {
      setSaving(true);
      // Upload signature if drawn
      let uploadedSignatureUrl = signatureUrl;
      if (sigRef.current && !sigRef.current.isEmpty()) {
        const dataUrl = sigRef.current
          .getTrimmedCanvas()
          .toDataURL("image/png");
        const blob = await (await fetch(dataUrl)).blob();
        const filePath = `user/${profile.id}/signature_${Date.now()}.png`;
        const { data, error } = await supabase.storage
          .from("signatures")
          .upload(filePath, blob, { upsert: true });
        if (error) throw error;
        const { data: signed } = await supabase.storage
          .from("signatures")
          .getPublicUrl(data.path);
        uploadedSignatureUrl = signed.publicUrl;
      }

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          license_number: licenseNumber || null,
          signature_url: uploadedSignatureUrl || null,
        })
        .eq("id", profile.id);
      if (updateError) throw updateError;
      setSignatureUrl(uploadedSignatureUrl || null);
      alert("Saved");
    } catch (e: any) {
      alert(e.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const clearPad = () => {
    sigRef.current?.clear();
  };

  return (
    <AuthGuard requireAuth={true}>
      <DashboardLayout>
        <div className="max-w-2xl p-6">
          <Card>
            <CardHeader>
              <CardTitle>My Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">License Number</p>
                <Input
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  placeholder="e.g., TX-123456"
                />
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">Default Signature</p>
                {signatureUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={signatureUrl}
                    alt="Saved signature"
                    className="h-16 w-auto border mb-3"
                  />
                ) : null}
                <div className="border rounded">
                  <SignatureCanvas
                    ref={sigRef as any}
                    penColor="black"
                    canvasProps={{
                      width: 600,
                      height: 150,
                      className: "sigCanvas",
                    }}
                  />
                </div>
                <div className="flex gap-2 mt-2">
                  <Button variant="outline" onClick={clearPad}>
                    Clear
                  </Button>
                  <Button onClick={save} disabled={saving}>
                    {saving ? "Saving..." : "Save"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}
