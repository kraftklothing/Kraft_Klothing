import LikedCloset from "@/components/LikedCloset";
import RequireAuth from "@/components/RequireAuth";

export default function LikedPage() {
  return (
    <RequireAuth>
      <LikedCloset />
    </RequireAuth>
  );
}
