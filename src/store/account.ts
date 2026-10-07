// Spec 7.3: what happens to local data when the account changes. Signing in
// switches to that user's local copy and outbox and syncs; signing out goes back
// to guest data. Signing in with guest data on this device first asks whether to
// save it to the account.
import { create } from "zustand";
import { read, remove, write } from "../services/storage.ts";
import { useSyncStore, type Op } from "../services/sync.ts";
import { useAuthStore } from "./authStore.ts";
import { progressSaved, storageKeyFor, useProgressStore, type GuestData } from "./progressStore.ts";

type AccountStore = {
  // Waiting for the answer to "Save your progress to this account?"
  askToSave: { resolve: (save: boolean) => void } | null;
};
export const useAccountStore = create<AccountStore>(() => ({ askToSave: null }));

function ask(): Promise<boolean> {
  return new Promise((resolve) =>
    useAccountStore.setState({
      askToSave: {
        resolve: (save) => {
          useAccountStore.setState({ askToSave: null });
          resolve(save);
        },
      },
    }),
  );
}

const hasData = (d: Partial<GuestData> | undefined) => !!(d?.games?.length || d?.reviewLog?.length);

// Yes: the guest's rows become this user's (locally, then uploaded games first, then
// the log, skipping rows already on the server). No: the guest data is deleted.
export async function adoptGuestData(userId: string, save: boolean): Promise<void> {
  const guest = await read<Partial<GuestData>>("guest");
  if (save && hasData(guest)) {
    const userKey = storageKeyFor(userId);
    const mine = (await read<Partial<GuestData>>(userKey)) ?? {};
    const games = [...(mine.games ?? []), ...(guest?.games ?? [])];
    const reviewLog = [...(mine.reviewLog ?? []), ...(guest?.reviewLog ?? [])];
    await write(userKey, { games, reviewLog });
    await useSyncStore.getState().load(userId);
    const ops: Op[] = [
      ...(guest?.games ?? []).map((row): Op => ({ kind: "game", row })),
      ...(guest?.reviewLog ?? []).map((row): Op => ({ kind: "review", row })),
    ];
    useSyncStore.getState().enqueue(ops);
  }
  await remove("guest");
}

export async function onAccountChange(userId: string | null) {
  if (userId) {
    await progressSaved(); // every guest row is on disk before we look
    const progress = useProgressStore.getState();
    // Guest rows on this device: from memory if loaded, else from storage.
    const guest =
      progress.owner === "guest" && progress.loaded
        ? progress
        : await read<Partial<GuestData>>("guest");
    if (hasData(guest)) await adoptGuestData(userId, await ask());
  }
  await useProgressStore.getState().switchOwner(userId ?? "guest");
  await useSyncStore.getState().load(userId);
  if (userId) await useSyncStore.getState().flush();
}

export function startAccountSync() {
  let current: string | null | undefined;
  const follow = (userId: string | null, status: string) => {
    if (status === "loading" || userId === current) return;
    current = userId;
    void onAccountChange(userId);
  };
  useAuthStore.subscribe((s) => follow(s.userId, s.status));
  follow(useAuthStore.getState().userId, useAuthStore.getState().status);

  // Spec 7.3: flush on app start (above), on each round end (game store), and when
  // the connection comes back.
  if (typeof window !== "undefined") {
    window.addEventListener("online", () => void useSyncStore.getState().flush());
  }
}
