import { redirect } from "next/navigation";

export default function LegacyPayerPage() {
  redirect("/portal/login");
}
