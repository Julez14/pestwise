"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { supabase } from "@/lib/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { AuthGuard } from "@/components/auth/auth-guard";

export default function BrandingSettingsPage() {
  const { profile } = useAuth();
  const router = useRouter();
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [settingsId, setSettingsId] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase
        .from("company_settings")
        .select("id, logo_url")
        .limit(1)
        .maybeSingle();
      setLogoUrl(data?.logo_url ?? null);
      setSettingsId(data?.id ?? null);
    };
    fetchSettings();
  }, []);

  const canEdit =
    profile && (profile.role === "admin" || profile.role === "manager");

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      const filePath = `logo/${Date.now()}_${file.name}`;
      const { data, error } = await supabase.storage
        .from("branding")
        .upload(filePath, file, { upsert: true });
      if (error) throw error;
      const { data: pub } = supabase.storage
        .from("branding")
        .getPublicUrl(data.path);
      setLogoUrl(pub.publicUrl);
    } catch (e: any) {
      alert(e.message || "Failed to upload logo");
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    try {
      setSaving(true);
      const { error } = await supabase
        .from("company_settings")
        .update({ logo_url: logoUrl })
        .eq("id", settingsId ?? 1);
      if (error) throw error;
      alert("Saved");
    } catch (e: any) {
      alert(e.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AuthGuard requireAuth={true}>
      <DashboardLayout>
        <div className="max-w-xl p-6">
          <Card>
            <CardHeader>
              <CardTitle>Branding</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">Company Logo</p>
                {logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logoUrl} alt="Logo" className="h-16 w-auto mb-3" />
                ) : (
                  <p className="text-xs text-gray-500 mb-3">No logo uploaded</p>
                )}
                {canEdit && (
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={onFileChange}
                    disabled={uploading}
                  />
                )}
              </div>
              {canEdit && (
                <div className="flex justify-end">
                  <Button onClick={save} disabled={saving || uploading}>
                    {saving ? "Saving..." : "Save"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </AuthGuard>
  );
}
